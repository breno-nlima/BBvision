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

/**
 * Decodifica e salva uma imagem Base64 validando assinatura binária (Magic Bytes)
 * e limites seguros antes de gravar em disco.
 */
async function salvarFotoBase64Segura(rawBase64, prefix = 'evidencia_rel') {
  if (!rawBase64 || typeof rawBase64 !== 'string') return null;
  if (rawBase64.length > 25 * 1024 * 1024) {
    const err = new Error('A evidência fotográfica excede o limite máximo permitido de 15MB.');
    err.status = 400;
    throw err;
  }

  let mimeType = 'image/jpeg';
  let base64Part = rawBase64;
  if (rawBase64.includes(',')) {
    const parts = rawBase64.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) mimeType = mimeMatch[1];
    base64Part = parts[1];
  }

  const buffer = Buffer.from(base64Part, 'base64');
  const magic = validateImageMagicBytes(buffer);
  if (!magic.valid && buffer.length > 500) {
    const err = new Error('A evidência enviada não possui assinatura binária válida de imagem (JPEG, PNG ou WEBP).');
    err.status = 400;
    throw err;
  }
  if (magic.valid) {
    mimeType = magic.mimeType;
  }

  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
  const fileName = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
  const filePath = path.join(EVIDENCIAS_DIR, fileName);
  await fs.promises.writeFile(filePath, buffer);

  return {
    caminhoRelativo: path.join('uploads', 'evidencias', fileName).replace(/\\/g, '/'),
    hash: generateSha256(buffer),
  };
}

function verificarPermissaoMutacaoRelatorio(req, relatorio) {
  if (!req.user) return false;
  if (req.user.cargo === 'empreiteira' && relatorio.usuario_id && relatorio.usuario_id !== req.user.id) {
    return false;
  }
  return true;
}

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
          justificativa: r.justificativa ? sanitizeString(r.justificativa) : null,
          sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
          tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        }));
        mockData.saveRespostas(novoRelatorio.id, respostasSanitizadas);
      }

      // Salva fotos se fornecidas na criação
      if (Array.isArray(fotos) && fotos.length > 0) {
        for (const f of fotos) {
          let caminhoRelativo = f.caminho_arquivo || f.url || '';
          let hashFoto = f.hash_integridade || f.hash_sha256 || '';
          let b64 = f.imagemBase64 || (typeof f.url === 'string' && f.url.startsWith('data:image/') ? f.url : null);

          if (b64) {
            const saved = await salvarFotoBase64Segura(b64, 'evidencia_rel');
            if (saved) {
              caminhoRelativo = saved.caminhoRelativo;
              hashFoto = hashFoto || saved.hash;
            }
          } else if (caminhoRelativo && !resolveSafePath(caminhoRelativo, UPLOAD_ROOT)) {
            return res.status(400).json({
              status: 400,
              erro: 'Caminho de arquivo da evidência inválido ou não autorizado.',
            });
          }

          if (caminhoRelativo || b64) {
            mockData.addFoto(novoRelatorio.id, {
              caminho_arquivo: caminhoRelativo,
              url: caminhoRelativo || b64,
              imagemBase64: b64,
              hash_integridade: hashFoto || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              hash_sha256: hashFoto || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              avaliacao_gemini: f.avaliacao_gemini || f.status_ia || 'APROVADO',
              status_ia: f.avaliacao_gemini || f.status_ia || 'APROVADO',
              confianca: f.confianca !== undefined ? f.confianca : 0.95,
              confianca_ia: f.confianca !== undefined ? f.confianca : 0.95,
              motivo: f.motivo || f.motivo_ia || 'Evidência fotográfica capturada in-loco.',
              motivo_ia: f.motivo || f.motivo_ia || 'Evidência fotográfica capturada in-loco.',
            });
          }
        }
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
            const saved = await salvarFotoBase64Segura(itemFoto.imagemBase64, 'offline');
            if (saved) {
              caminhoRelativo = saved.caminhoRelativo;
              hashFoto = saved.hash;
            }
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
          justificativa: r.justificativa ? sanitizeString(r.justificativa) : null,
          sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
          tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        }));
        mockData.saveRespostas(novoRelatorio.id, respostasSanitizadas);
      }

      // 3. Finaliza com código de 16 hex e hash criptográfico
      const codigo = codigo_unico && /^[0-9A-F]{16}$/i.test(codigo_unico)
        ? codigo_unico.toUpperCase()
        : generateUniqueCode();

      const parsedTime = timestamp ? new Date(timestamp).getTime() : NaN;
      const timeFinal = Number.isNaN(parsedTime) ? Date.now() : parsedTime;
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

      if (!verificarPermissaoMutacaoRelatorio(req, relatorio)) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Você não tem permissão para alterar respostas de um relatório de outro responsável.',
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
        justificativa: r.justificativa ? sanitizeString(r.justificativa) : null,
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

      if (!verificarPermissaoMutacaoRelatorio(req, relatorio)) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Você não tem permissão para anexar fotos a um relatório de outro responsável.',
        });
      }

      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          status: 403,
          erro: 'Relatório finalizado. Inclusão de novas evidências fotográficas bloqueada.',
        });
      }

      let {
        caminho_arquivo,
        hash_integridade,
        hash_sha256,
        avaliacao_gemini,
        status_ia,
        confianca,
        confianca_ia,
        motivo,
        motivo_ia,
        imagemBase64,
        url,
      } = req.body;

      hash_integridade = hash_integridade || hash_sha256;
      avaliacao_gemini = avaliacao_gemini || status_ia;
      confianca = confianca !== undefined ? confianca : confianca_ia;
      motivo = motivo || motivo_ia;

      if (req.file) {
        caminho_arquivo = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
        const buffer = await fs.promises.readFile(req.file.path);
        hash_integridade = generateSha256(buffer);
      } else if (imagemBase64 || (url && typeof url === 'string' && url.startsWith('data:image/'))) {
        const rawCandidate = imagemBase64 || url;
        if (typeof rawCandidate === 'string' && rawCandidate.trim().length > 0) {
          const saved = await salvarFotoBase64Segura(rawCandidate, 'evidencia_rel');
          if (saved) {
            caminho_arquivo = saved.caminhoRelativo;
            if (!hash_integridade) {
              hash_integridade = saved.hash;
            }
          }
        }
      } else if (!caminho_arquivo && url && typeof url === 'string') {
        caminho_arquivo = url.trim();
      }

      if (!caminho_arquivo || !hash_integridade) {
        return res.status(400).json({
          status: 400,
          erro: 'Caminho do arquivo e hash de integridade SHA-256 são obrigatórios.',
        });
      }

      // Validação contra Path Traversal em caminhos fornecidos diretamente
      if (!caminho_arquivo.startsWith('data:image/') && !resolveSafePath(caminho_arquivo, UPLOAD_ROOT)) {
        return res.status(400).json({
          status: 400,
          erro: 'Caminho de arquivo da foto inválido ou fora do diretório de uploads autorizado.',
        });
      }

      const cleanPath = sanitizeString(caminho_arquivo);
      const cleanHash = sanitizeString(hash_integridade);
      const cleanStatus = sanitizeString(avaliacao_gemini || 'APROVADO');
      const cleanConf = typeof confianca === 'number' ? confianca : 0.95;
      const cleanMotivo = sanitizeString(motivo || 'Evidência fotográfica capturada in-loco.');

      const foto = mockData.addFoto(id, {
        url: cleanPath,
        caminho_arquivo: cleanPath,
        imagemBase64: typeof imagemBase64 === 'string' && imagemBase64.startsWith('data:image/') ? imagemBase64 : null,
        hash_sha256: cleanHash,
        hash_integridade: cleanHash,
        avaliacao_gemini: cleanStatus,
        status_ia: cleanStatus,
        confianca: cleanConf,
        confianca_ia: cleanConf,
        motivo: cleanMotivo,
        motivo_ia: cleanMotivo,
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

      if (!verificarPermissaoMutacaoRelatorio(req, relatorio)) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Você não tem permissão para finalizar um relatório de outro responsável.',
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

      // Processa fotos adicionais enviadas na finalização com deduplicação por hash SHA-256 / caminho
      const existingHashes = new Set((relatorio.fotos || []).map(f => f.hash_integridade || f.hash_sha256).filter(Boolean));
      const existingPaths = new Set((relatorio.fotos || []).map(f => f.caminho_arquivo || f.url).filter(Boolean));

      const fotosParaAnexar = req.body.fotos || (req.body.foto ? [req.body.foto] : (req.body.imagemBase64 ? [req.body] : []));
      if (Array.isArray(fotosParaAnexar) && fotosParaAnexar.length > 0) {
        for (const itemFoto of fotosParaAnexar) {
          let caminhoRel = itemFoto.caminho_arquivo || itemFoto.url || '';
          let hashFoto = itemFoto.hash_integridade || itemFoto.hash_sha256 || '';
          let b64 = itemFoto.imagemBase64 || (typeof itemFoto.url === 'string' && itemFoto.url.startsWith('data:image/') ? itemFoto.url : null);

          // Evita anexar foto duplicada se já foi vinculada anteriormente via POST /fotos
          if ((hashFoto && existingHashes.has(hashFoto)) || (caminhoRel && existingPaths.has(caminhoRel))) {
            continue;
          }

          if (b64) {
            const saved = await salvarFotoBase64Segura(b64, 'evidencia_fin');
            if (saved) {
              caminhoRel = saved.caminhoRelativo;
              hashFoto = hashFoto || saved.hash;
            }
          } else if (caminhoRel && !resolveSafePath(caminhoRel, UPLOAD_ROOT)) {
            continue;
          }

          if (hashFoto && existingHashes.has(hashFoto)) {
            continue;
          }

          if (caminhoRel || b64) {
            mockData.addFoto(id, {
              caminho_arquivo: caminhoRel,
              url: caminhoRel || b64,
              imagemBase64: b64,
              hash_integridade: hashFoto || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              hash_sha256: hashFoto || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              avaliacao_gemini: itemFoto.avaliacao_gemini || itemFoto.status_ia || 'APROVADO',
              status_ia: itemFoto.avaliacao_gemini || itemFoto.status_ia || 'APROVADO',
              confianca: itemFoto.confianca !== undefined ? itemFoto.confianca : 0.95,
              confianca_ia: itemFoto.confianca !== undefined ? itemFoto.confianca : 0.95,
              motivo: itemFoto.motivo || itemFoto.motivo_ia || 'Evidência fotográfica capturada in-loco.',
              motivo_ia: itemFoto.motivo || itemFoto.motivo_ia || 'Evidência fotográfica capturada in-loco.',
            });
            if (hashFoto) existingHashes.add(hashFoto);
            if (caminhoRel) existingPaths.add(caminhoRel);
          }
        }
      }

      // Re-busca relatório com fotos consolidadas
      const relatorioConsolidado = mockData.findRelatorioById(id) || relatorio;

      // 1. Gera código único criptográfico (16 caracteres hexadecimais maiúsculos)
      const codigoUnico = generateUniqueCode();

      // 2. Gera hash SHA-256 de integridade do relatório (codigoUnico + timestamp)
      const timestamp = Date.now();
      const hashIntegridade = generateReportIntegrityHash(codigoUnico, timestamp);
      const dataIso = new Date(timestamp).toISOString();

      const relatorioCompleto = {
        ...relatorioConsolidado,
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

      if (relatorio.status === 'EM_ANDAMENTO') {
        return res.status(400).json({
          status: 400,
          erro: 'Somente relatórios finalizados pela empreiteira podem receber parecer técnico fiscal.',
        });
      }

      // 'APROVADO' e 'REGULAR' homologam a vistoria
      // 'REPROVADO' e 'PENDENTE_AJUSTE' exigem correções da empreiteira
      const statusNormalizado = (statusUpper === 'APROVADO' || statusUpper === 'REGULAR') ? 'APROVADO' : 'PENDENTE_AJUSTE';
      const obraNovoStatus = statusNormalizado === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
      const justificativaSanitizada = sanitizeString(justificativa || '');

      mockData.atualizarStatusFiscal(id, statusNormalizado, justificativaSanitizada);

      // Recompila o PDF oficial com o parecer e status atualizados do fiscal
      try {
        const relatorioAtualizado = mockData.findRelatorioById(id);
        if (relatorioAtualizado) {
          const novoPdf = await pdfService.salvarRelatorioPdf(relatorioAtualizado);
          mockData.atualizarPdfRelatorio(id, novoPdf.relativePath);
        }
      } catch (pdfErr) {
        console.warn('[Relatorios] Aviso ao recompilar PDF após parecer fiscal:', pdfErr.message);
      }

      const acaoTexto = statusNormalizado === 'APROVADO' ? 'aprovada' : 'reprovada';

      return res.status(200).json({
        mensagem: `Vistoria ${acaoTexto} com sucesso!`,
        id,
        status: statusNormalizado,
        obraStatus: obraNovoStatus,
        pdfUrl: `/api/relatorios/${id}/pdf`,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = relatoriosController;
