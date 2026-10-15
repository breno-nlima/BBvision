/**
 * BBVision - Controller de Relatórios (Mock em Memória)
 * Implementa finalização inviolável, código de 16 hex e PDF
 */

const fs = require('fs');
const path = require('path');
const mockData = require('../mockData');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const { generateUniqueCode, generateReportIntegrityHash, generateSha256 } = require('../utils/cryptoUtils');

const relatoriosController = {
  /**
   * POST /api/relatorios
   */
  async criar(req, res, next) {
    try {
      const { obra_id } = req.body;

      if (!obra_id) {
        return res.status(400).json({ erro: 'Identificador da obra (obra_id) é obrigatório.' });
      }

      const obra = mockData.findObraById(obra_id);
      if (!obra) {
        return res.status(404).json({ erro: 'Obra informada não foi encontrada.' });
      }

      const novoRelatorio = mockData.createRelatorio({
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
   */
  async obterPainelAuditoria(req, res, next) {
    try {
      const painel = mockData.getPainelAuditoria();
      return res.status(200).json(painel);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios
   */
  async listar(req, res, next) {
    try {
      const { obra_id, status } = req.query;
      const relatorios = mockData.listRelatorios({ obra_id, status });
      return res.status(200).json(relatorios);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios/:id
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

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
   */
  async salvarRespostas(req, res, next) {
    try {
      const { id } = req.params;
      const respostas = Array.isArray(req.body) ? req.body : req.body.respostas;

      if (!respostas || !Array.isArray(respostas)) {
        return res.status(400).json({ erro: 'Envie uma lista (array) contendo os itens do checklist.' });
      }

      const relatorio = mockData.findRelatorioById(id);
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

      mockData.saveRespostas(id, respostas);

      return res.status(200).json({
        mensagem: 'Respostas salvas com sucesso',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/relatorios/:id/fotos
   */
  async anexarFoto(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          erro: 'Relatório finalizado. Inclusão de novas evidências bloqueada.',
        });
      }

      let { caminho_arquivo, hash_integridade, avaliacao_gemini, confianca, motivo } = req.body;

      if (req.file) {
        caminho_arquivo = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
        const buffer = fs.readFileSync(req.file.path);
        hash_integridade = generateSha256(buffer);
      }

      if (!caminho_arquivo || !hash_integridade) {
        return res.status(400).json({ erro: 'Caminho do arquivo e hash de integridade são obrigatórios.' });
      }

      const foto = mockData.addFoto(id, {
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
   */
  async finalizar(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

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

      const relatorioCompleto = {
        ...relatorio,
        codigo_unico: codigoUnico,
        hash_integridade: hashIntegridade,
        data: new Date(timestamp).toISOString(),
        status: 'FINALIZADO',
      };

      // 3. Compilação do PDF Oficial via PDFKit
      let pdfRelativePath = null;
      try {
        const { relativePath, buffer: pdfBuffer } = await pdfService.salvarRelatorioPdf(relatorioCompleto);
        pdfRelativePath = relativePath;
        // Tenta envio opcional por e-mail
        const destinatarioFiscal = req.body.destinatario_email || process.env.FISCAL_EMAIL_PADRAO;
        await emailService.enviarRelatorioEmail(relatorioCompleto, pdfBuffer, destinatarioFiscal).catch(() => {});
      } catch (pdfErr) {
        console.warn('[Relatorios] PDF warning:', pdfErr.message);
      }

      // 4. Salva no mock em memória e bloqueia
      mockData.finalizarRelatorio(id, {
        codigo_unico: codigoUnico,
        hash_integridade: hashIntegridade,
        arquivo_pdf_url: pdfRelativePath,
      });

      return res.status(200).json({
        mensagem: 'Relatório finalizado com sucesso!',
        codigo: codigoUnico,
        hashIntegridade,
        pdfUrl: `/api/relatorios/${id}/pdf`,
        status: 'FINALIZADO',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios/:id/pdf
   */
  async downloadPdf(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      if (relatorio.arquivo_pdf_url) {
        const fullPath = path.join(__dirname, '..', '..', relatorio.arquivo_pdf_url);
        if (fs.existsSync(fullPath)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="BBVision_${relatorio.codigo_unico || id}.pdf"`);
          return fs.createReadStream(fullPath).pipe(res);
        }
      }

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

      const relatorio = mockData.findRelatorioById(id);
      if (!relatorio) {
        return res.status(404).json({ erro: 'Relatório não encontrado.' });
      }

      const statusNormalizado = status.toUpperCase() === 'APROVADO' ? 'APROVADO' : 'PENDENTE_AJUSTE';
      const obraNovoStatus = statusNormalizado === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';

      mockData.atualizarStatusFiscal(id, statusNormalizado, justificativa || '');

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
