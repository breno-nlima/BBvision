/**
 * BBVision - Controller de Relatórios de Vistoria, Inviolabilidade e Auditoria
 * Implementa finalização inviolável, código de 16 caracteres hexadecimais, hashes SHA-256 e PDFKit
 * Em estrita conformidade com as Seções 6, 8.3, 8.5 e 8.6 do Documento de Entrega TakeOff
 */

const fs = require('fs');
const path = require('path');
const mockData = require('../mockData');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const { generateUniqueCode, generateReportIntegrityHash, generateSha256 } = require('../utils/cryptoUtils');
const { resolveSafePath, sanitizeString, validateImageMagicBytes } = require('../utils/securityUtils');
const { UPLOAD_ROOT, EVIDENCIAS_DIR } = require('../middlewares/uploadMiddleware');

const relatoriosController = {
  /**
   * POST /api/relatorios
   * Cria nova vistoria em status EM_ANDAMENTO
   * Também suporta carga inicial opcional de respostas/fotos se enviadas
   */
  async criar(req, res, next) {
    try {
      const { obra_id, respostas, fotos } = req.body;

      if (!obra_id) {
        return res.status(400).json({
          status: 400,
          erro: 'Identificador da obra (obra_id) é obrigatório.',
        });
      }

      const obra = await mockData.findObraByIdAsync ? await mockData.findObraByIdAsync(obra_id) : mockData.findObraById(obra_id);
      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra informada não foi encontrada no cadastro.',
        });
      }

      const usuarioId = req.user ? req.user.id : '11111111-1111-4111-8111-111111111111';

      const novoRelatorio = mockData.createRelatorio({
        obra_id,
        usuario_id: usuarioId,
      });

      // Salva respostas se fornecidas na criação
      if (Array.isArray(respostas) && respostas.length > 0) {
        const respostasSanitizadas = respostas.map(r => ({
          pergunta: sanitizeString(r.pergunta || 'Item não especificado'),
          valor: sanitizeString(r.valor || 'Não informado'),
          sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
          tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        }));
        mockData.saveRespostas(novoRelatorio.id, respostasSanitizadas);
      }

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
   * POST /api/relatorios/sincronizar-offline
   * Endpoint de sincronização de lote ou vistoria única finalizada offline (HU05)
   */
  async sincronizarOffline(req, res, next) {
    try {
      const { obra_id, respostas, fotos, codigo_unico, timestamp } = req.body;

      if (!obra_id) {
        return res.status(400).json({
          status: 400,
          erro: 'Identificador da obra (obra_id) é obrigatório para sincronização.',
        });
      }

      const obra = await mockData.findObraByIdAsync ? await mockData.findObraByIdAsync(obra_id) : mockData.findObraById(obra_id);
      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra informada não existe no cadastro.',
        });
      }

      const usuarioId = req.user ? req.user.id : '11111111-1111-4111-8111-111111111111';
      const novoRelatorio = mockData.createRelatorio({
        obra_id,
        usuario_id: usuarioId,
      });

      // 1. Processa e anexa fotos enviadas
      if (Array.isArray(fotos) && fotos.length > 0) {
        for (const itemFoto of fotos) {
          let caminhoRelativo = itemFoto.caminho_arquivo || '';
          let hashFoto = itemFoto.hash_integridade || '';

          if (itemFoto.imagemBase64) {
            let base64Data = itemFoto.imagemBase64;
            if (base64Data.includes(',')) base64Data = base64Data.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            hashFoto = generateSha256(buffer);

            const fileName = `offline_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;
            const filePath = path.join(EVIDENCIAS_DIR, fileName);
            await fs.promises.writeFile(filePath, buffer);
            caminhoRelativo = path.join('uploads', 'evidencias', fileName).replace(/\\/g, '/');
          }

          mockData.addFoto(novoRelatorio.id, {
            caminho_arquivo: caminhoRelativo,
            hash_integridade: hashFoto || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            avaliacao_gemini: itemFoto.avaliacao_gemini || 'VALIDACAO_MANUAL',
            confianca: itemFoto.confianca || 0.75,
            motivo: itemFoto.motivo || 'Evidência fotográfica sincronizada da fila offline.',
          });
        }
      }

      // 2. Processa respostas do checklist
      if (Array.isArray(respostas) && respostas.length > 0) {
        const respostasSanitizadas = respostas.map(r => ({
          pergunta: sanitizeString(r.pergunta || 'Item não especificado'),
          valor: sanitizeString(r.valor || 'Não informado'),
          sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
          tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        }));
        mockData.saveRespostas(novoRelatorio.id, respostasSanitizadas);
      }

      // 3. Finaliza com código de 16 hex e hash criptográfico
      const codigo = codigo_unico && /^[0-9A-F]{16}$/i.test(codigo_unico)
        ? codigo_unico.toUpperCase()
        : generateUniqueCode();

      const timeFinal = timestamp ? new Date(timestamp).getTime() : Date.now();
      const hashIntegridade = generateReportIntegrityHash(codigo, timeFinal);

      const relatorioFormatado = mockData.formatRelatorio({
        ...novoRelatorio,
        codigo_unico: codigo,
        hash_integridade: hashIntegridade,
        status: 'FINALIZADO',
      });

      // 4. Compilação do PDF Oficial
      let pdfRelativePath = null;
      try {
        const resPdf = await pdfService.salvarRelatorioPdf(relatorioFormatado);
        pdfRelativePath = resPdf.relativePath;
        // Notificação por e-mail em background
        const emailDestino = req.body.destinatario_email || process.env.FISCAL_EMAIL_PADRAO;
        emailService.enviarRelatorioEmail(relatorioFormatado, resPdf.buffer, emailDestino).catch(() => {});
      } catch (errPdf) {
        console.warn('[Offline Sync] Aviso ao compilar PDF:', errPdf.message);
      }

      mockData.finalizarRelatorio(novoRelatorio.id, {
        codigo_unico: codigo,
        hash_integridade: hashIntegridade,
        arquivo_pdf_url: pdfRelativePath,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Vistoria offline sincronizada e homologada com sucesso!',
        id: novoRelatorio.id,
        codigo,
        hashIntegridade,
        pdfUrl: `/api/relatorios/${novoRelatorio.id}/pdf`,
        status: 'FINALIZADO',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/relatorios/painel/resumo
   * Retorna métricas consolidadas para o painel de auditoria do fiscal Mariana
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
   * Listagem de relatórios com filtros opcionais por obra e status
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
   * Retorna detalhes completos do relatório incluindo fotos e respostas
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      return res.status(200).json(relatorio);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/relatorios/:id/respostas
   * Salva os itens do checklist dinâmico
   * Regra de Inviolabilidade: bloqueado se o relatório já estiver finalizado
   */
  async salvarRespostas(req, res, next) {
    try {
      const { id } = req.params;
      const rawRespostas = Array.isArray(req.body) ? req.body : req.body.respostas;

      if (!rawRespostas || !Array.isArray(rawRespostas)) {
        return res.status(400).json({
          status: 400,
          erro: 'Envie uma lista (array) contendo os itens preenchidos do checklist.',
        });
      }

      const relatorio = mockData.findRelatorioById(id);
      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      // Regra de Inviolabilidade TakeOff: Não permite editar se estiver finalizado
      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          status: 403,
          erro: 'Este relatório já foi finalizado e encontra-se bloqueado para novas edições.',
          statusAtual: relatorio.status,
          codigoUnico: relatorio.codigo_unico,
        });
      }

      // Higieniza dados de entrada do checklist
      const respostasSanitizadas = rawRespostas.map(r => ({
        pergunta: sanitizeString(r.pergunta || 'Item não especificado'),
        valor: sanitizeString(r.valor || 'Não informado'),
        sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
        tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
      }));

      mockData.saveRespostas(id, respostasSanitizadas);

      return res.status(200).json({
        mensagem: 'Respostas do checklist salvas com sucesso.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/relatorios/:id/fotos
   * Anexa uma evidência fotográfica validada ao relatório em andamento
   */
  async anexarFoto(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          status: 403,
          erro: 'Relatório finalizado. Inclusão de novas evidências fotográficas bloqueada.',
        });
      }

      let { caminho_arquivo, hash_integridade, avaliacao_gemini, confianca, motivo } = req.body;

      if (req.file) {
        caminho_arquivo = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
        const buffer = await fs.promises.readFile(req.file.path);
        hash_integridade = generateSha256(buffer);
      }

      if (!caminho_arquivo || !hash_integridade) {
        return res.status(400).json({
          status: 400,
          erro: 'Caminho do arquivo e hash de integridade SHA-256 são obrigatórios.',
        });
      }

      const foto = mockData.addFoto(id, {
        caminho_arquivo: sanitizeString(caminho_arquivo),
        hash_integridade: sanitizeString(hash_integridade),
        avaliacao_gemini: sanitizeString(avaliacao_gemini || 'APROVADO'),
        confianca: typeof confianca === 'number' ? confianca : 0.95,
        motivo: sanitizeString(motivo || 'Evidência fotográfica capturada in-loco.'),
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
   * Finalização oficial da vistoria com código de 16 caracteres hexadecimais,
   * hash de integridade SHA-256, geração de PDF oficial e disparo de e-mail ao fiscal
   */
  async finalizar(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      // Regra de Imutabilidade e Prevenção de Duplicidade
      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(400).json({
          status: 400,
          erro: 'Este relatório já foi finalizado previamente. Edições e reenvios estão bloqueados.',
          codigo: relatorio.codigo_unico,
          dataEnvio: relatorio.data_finalizacao || relatorio.data,
          status: relatorio.status,
        });
      }

      // 1. Gera código único criptográfico (16 caracteres hexadecimais maiúsculos)
      const codigoUnico = generateUniqueCode();

      // 2. Gera hash SHA-256 de integridade do relatório (codigoUnico + timestamp)
      const timestamp = Date.now();
      const hashIntegridade = generateReportIntegrityHash(codigoUnico, timestamp);
      const dataIso = new Date(timestamp).toISOString();

      const relatorioCompleto = {
        ...relatorio,
        codigo_unico: codigoUnico,
        hash_integridade: hashIntegridade,
        data: dataIso,
        data_finalizacao: dataIso,
        status: 'FINALIZADO',
      };

      // 3. Compilação do PDF Oficial via PDFKit
      let pdfRelativePath = null;
      let pdfBuffer = null;
      try {
        const resultadoPdf = await pdfService.salvarRelatorioPdf(relatorioCompleto);
        pdfRelativePath = resultadoPdf.relativePath;
        pdfBuffer = resultadoPdf.buffer;

        // 4. Disparo opcional assíncrono de e-mail transacional ao fiscal do BB
        const destinatarioFiscal = req.body.destinatario_email || process.env.FISCAL_EMAIL_PADRAO;
        emailService.enviarRelatorioEmail(relatorioCompleto, pdfBuffer, destinatarioFiscal).catch(err => {
          console.warn('[Relatorios] Alerta no envio de e-mail de notificação:', err.message);
        });
      } catch (pdfErr) {
        console.error('[Relatorios] Falha na compilação do PDF:', pdfErr.message);
      }

      // 5. Salva no banco/mock e ativa bloqueio de edição
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
   * Visualização / Download do arquivo PDF oficial com carimbo de integridade
   */
  async downloadPdf(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = mockData.findRelatorioById(id);

      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      // 1. Se já houver arquivo gerado no disco, serve via stream seguro
      if (relatorio.arquivo_pdf_url) {
        const safePath = resolveSafePath(relatorio.arquivo_pdf_url, UPLOAD_ROOT);
        if (safePath && fs.existsSync(safePath)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="BBVision_${relatorio.codigo_unico || id}.pdf"`);
          const stream = fs.createReadStream(safePath);
          stream.on('error', streamErr => {
            console.error('[PDF Stream Erro]:', streamErr);
            if (!res.headersSent) res.status(500).json({ status: 500, erro: 'Falha ao transmitir o arquivo PDF.' });
          });
          return stream.pipe(res);
        }
      }

      // 2. Se ainda não houver arquivo compilado em disco, compila dinamicamente na hora
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
   * Auditoria e Julgamento do Fiscal Mariana
   * Acesso restrito a cargos de auditoria/engenharia do BB (RBAC)
   * Aceita: APROVADO, REGULAR, REPROVADO, PENDENTE_AJUSTE
   */
  async atualizarStatusFiscal(req, res, next) {
    try {
      const { id } = req.params;
      const { status, justificativa } = req.body;

      const statusUpper = String(status || '').toUpperCase().trim();

      if (!['APROVADO', 'REGULAR', 'REPROVADO', 'PENDENTE_AJUSTE'].includes(statusUpper)) {
        return res.status(400).json({
          status: 400,
          erro: 'Status de julgamento inválido. Aceitos: APROVADO (REGULAR) ou REPROVADO (PENDENTE_AJUSTE).',
        });
      }

      const relatorio = mockData.findRelatorioById(id);
      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      // 'APROVADO' e 'REGULAR' homologam a vistoria
      // 'REPROVADO' e 'PENDENTE_AJUSTE' exigem correções da empreiteira
      const statusNormalizado = (statusUpper === 'APROVADO' || statusUpper === 'REGULAR') ? 'APROVADO' : 'PENDENTE_AJUSTE';
      const obraNovoStatus = statusNormalizado === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
      const justificativaSanitizada = sanitizeString(justificativa || '');

      mockData.atualizarStatusFiscal(id, statusNormalizado, justificativaSanitizada);

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
