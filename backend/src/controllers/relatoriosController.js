/**
 * BBVision - Controller de Relatórios, Inviolabilidade e Auditoria
 * Implementa Seções 7, 8.3, 8.5, 8.6 e 8.7 do Documento de Entrega TakeOff
 */

const fs = require('fs');
const path = require('path');
const repository = require('../models/repository');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const { generateUniqueCode, generateReportIntegrityHash, generateSha256 } = require('../utils/cryptoUtils');

const relatoriosController = {
  /**
   * POST /api/relatorios
   * Body: { obra_id }
   * Retorno (201): { id: "uuid-do-relatorio", status: "EM_ANDAMENTO" }
   */
  async criar(req, res, next) {
    try {
      const { obra_id } = req.body;

      if (!obra_id) {
        return res.status(400).json({ erro: 'Identificador da obra (obra_id) é obrigatório.' });
      }

      const obra = await repository.findObraById(obra_id);
      if (!obra) {
        return res.status(404).json({ erro: 'Obra informada não foi encontrada.' });
      }

      const novoRelatorio = await repository.createRelatorio({
        obra_id,
        usuario_id: req.user ? req.user.id : '11111111-1111-4111-8111-111111111111',
      });

      return res.status(201).json({
        id: novoRelatorio.id,
        status: novoRelatorio.status,
        obra_id: novoRelatorio.obra_id,
        created_at: novoRelatorio.created_at,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios/painel/resumo
   * Retorna os dados consolidados da View de Auditoria para Mariana
   */
  async obterPainelAuditoria(req, res, next) {
    try {
      const painel = await repository.getPainelAuditoria();
      return res.status(200).json(painel);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios
   * Lista relatórios com suporte a filtros de obra e status
   */
  async listar(req, res, next) {
    try {
      const { obra_id, status } = req.query;
      const relatorios = await repository.listRelatorios({ obra_id, status });
      return res.status(200).json(relatorios);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios/:id
   * Retorna detalhes completos do relatório (fotos, respostas e obra)
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = await repository.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      return res.status(200).json(relatorio);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/relatorios/:id/respostas
   * Body: [ { pergunta, valor, sugestao_ia, tipo } ]
   * Retorno (200): { mensagem: "Respostas salvas com sucesso" }
   */
  async salvarRespostas(req, res, next) {
    try {
      const { id } = req.params;
      const respostas = Array.isArray(req.body) ? req.body : req.body.respostas;

      if (!respostas || !Array.isArray(respostas)) {
        return res.status(400).json({ erro: 'Envie uma lista (array) contendo os itens do checklist.' });
      }

      const relatorio = await repository.findRelatorioById(id);
      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      // Regra de Inviolabilidade: Não permite editar se estiver finalizado
      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          erro: 'Este relatório já foi finalizado e encontra-se bloqueado para novas edições.',
          status: relatorio.status,
        });
      }

      await repository.saveRespostas(id, respostas);

      return res.status(200).json({
        mensagem: 'Respostas salvas com sucesso',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/relatorios/:id/fotos
   * Vincula uma foto com metadados de inviolabilidade e IA ao relatório
   */
  async anexarFoto(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = await repository.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          erro: 'Relatório finalizado. Inclusão de novas evidências bloqueada.',
        });
      }

      let { caminho_arquivo, hash_integridade, avaliacao_gemini, confianca, motivo } = req.body;

      // Se enviou arquivo físico direto nesta rota
      if (req.file) {
        caminho_arquivo = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
        const buffer = fs.readFileSync(req.file.path);
        hash_integridade = generateSha256(buffer);
      }

      if (!caminho_arquivo || !hash_integridade) {
        return res.status(400).json({ erro: 'Caminho do arquivo e hash de integridade são obrigatórios.' });
      }

      const foto = await repository.addFoto(id, {
        caminho_arquivo,
        hash_integridade,
        avaliacao_gemini: avaliacao_gemini || 'APROVADO',
        confianca: confianca || 0.95,
        motivo: motivo || 'Evidência fotográfica capturada in-loco.',
      });

      return res.status(201).json({
        mensagem: 'Foto anexada com sucesso à vistoria.',
        foto,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/relatorios/:id/finalizar
   * Implementa o fluxo estrito da Seção 8.6:
   * 1. Gera codigoUnico (16 hex uppercase)
   * 2. Gera hashIntegridade (SHA-256)
   * 3. Compila PDF via PDFKit
   * 4. Envia e-mail via Resend / Nodemailer para o fiscal
   * 5. Atualiza status para 'FINALIZADO'
   * 6. Bloqueia edições posteriores
   */
  async finalizar(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = await repository.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      // Caso de Borda 5.1: Tentativa de envio duplicado / relatório já finalizado
      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(400).json({
          erro: 'Este relatório já foi finalizado previamente. Edições e reenvios estão bloqueados.',
          codigo: relatorio.codigo_unico,
          dataEnvio: relatorio.data,
          status: relatorio.status,
        });
      }

      // 1. Gera código único criptográfico (16 caracteres hex uppercase)
      const codigoUnico = generateUniqueCode();

      // 2. Gera hash SHA-256 de integridade do relatório
      const timestamp = Date.now();
      const hashIntegridade = generateReportIntegrityHash(codigoUnico, timestamp);

      // Atualiza objeto em memória antes de compilar PDF
      const relatorioCompleto = {
        ...relatorio,
        codigo_unico: codigoUnico,
        hash_integridade: hashIntegridade,
        data: new Date(timestamp).toISOString(),
        status: 'FINALIZADO',
      };

      // 3. Compilação do PDF Oficial via PDFKit
      const { relativePath: pdfRelativePath, buffer: pdfBuffer } = await pdfService.salvarRelatorioPdf(relatorioCompleto);

      // 4. Disparo de e-mail via Resend / Nodemailer para o fiscal com o PDF anexo
      const destinatarioFiscal = req.body.destinatario_email || process.env.FISCAL_EMAIL_PADRAO;
      const resultadoEmail = await emailService.enviarRelatorioEmail(relatorioCompleto, pdfBuffer, destinatarioFiscal);

      // 5 e 6. Salva no banco de dados e Bloqueia edições posteriores
      await repository.finalizarRelatorio(id, {
        codigo_unico: codigoUnico,
        hash_integridade: hashIntegridade,
        arquivo_pdf_url: pdfRelativePath,
        validacao_manual: Boolean(relatorio.validacao_manual),
      });

      return res.status(200).json({
        mensagem: 'Relatório finalizado com sucesso!',
        codigo: codigoUnico,
        hashIntegridade,
        pdfUrl: `/api/relatorios/${id}/pdf`,
        emailEnviado: resultadoEmail.sucesso,
        status: 'FINALIZADO',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios/:id/pdf
   * Retorna o arquivo PDF gerado para download ou visualização no navegador
   */
  async downloadPdf(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = await repository.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      // Se já existir arquivo gerado em disco
      if (relatorio.arquivo_pdf_url) {
        const fullPath = path.join(__dirname, '..', '..', relatorio.arquivo_pdf_url);
        if (fs.existsSync(fullPath)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="BBVision_${relatorio.codigo_unico || id}.pdf"`);
          return fs.createReadStream(fullPath).pipe(res);
        }
      }

      // Se não existir arquivo em disco, gera em tempo real
      const pdfBuffer = await pdfService.gerarRelatorioPdfBuffer(relatorio);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="BBVision_${relatorio.codigo_unico || id}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/relatorios/:id/status
   * Seção 8.7 — Auditoria e Parecer do Fiscal (Mariana)
   * Body: { status: "APROVADO" | "REPROVADO", justificativa: "..." }
   * Processamento:
   * 1. Atualiza relatorio.status e relatorio.justificativa
   * 2. Atualiza obra.status ('REGULAR' se aprovado, 'PENDENTE_AJUSTE' se reprovado)
   * Retorno (200): { mensagem: "Vistoria aprovada/reprovada com sucesso!", id: "..." }
   */
  async atualizarStatusFiscal(req, res, next) {
    try {
      const { id } = req.params;
      const { status, justificativa } = req.body;

      if (!status || !['APROVADO', 'REPROVADO', 'PENDENTE_AJUSTE'].includes(status.toUpperCase())) {
        return res.status(400).json({
          erro: 'Status inválido. Deve ser APROVADO ou REPROVADO (PENDENTE_AJUSTE).',
        });
      }

      const relatorio = await repository.findRelatorioById(id);
      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      const statusNormalizado = status.toUpperCase() === 'APROVADO' ? 'APROVADO' : 'PENDENTE_AJUSTE';
      const obraNovoStatus = statusNormalizado === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';

      // 1. Atualiza relatório
      await repository.updateRelatorioStatus(id, statusNormalizado, justificativa || '');

      // 2. Atualiza obra vinculada
      if (relatorio.obra_id) {
        await repository.updateObraStatus(relatorio.obra_id, obraNovoStatus);
      }

      const acaoTexto = statusNormalizado === 'APROVADO' ? 'aprovada' : 'reprovada';

      return res.status(200).json({
        mensagem: `Vistoria ${acaoTexto} com sucesso!`,
        id,
        status: statusNormalizado,
        obraStatus: obraNovoStatus,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = relatoriosController;
