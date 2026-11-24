/**
 * BBVision - Controller de Relatórios de Vistoria, Inviolabilidade e Auditoria
 * Implementa finalização inviolável, validação real de senha na assinatura,
 * código único de 16 caracteres hexadecimais, hashes SHA-256, geolocalização,
 * assinatura digital no PDFKit e parecer fiscal com recompilação automática.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const dataStore = require('../repositories/dataStore');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const { generateUniqueCode, generateReportIntegrityHash, generateSha256 } = require('../utils/cryptoUtils');
const { resolveSafePath, sanitizeString, validateImageMagicBytes } = require('../utils/securityUtils');
const { UPLOAD_ROOT, EVIDENCIAS_DIR } = require('../middlewares/uploadMiddleware');

const CARGOS_FISCAL = ['fiscal', 'engenheiro', 'admin'];

function isFiscalRole(user) {
  return Boolean(user && CARGOS_FISCAL.includes(String(user.cargo || '').toLowerCase()));
}

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
  if (!magic.valid) {
    const err = new Error('A evidência enviada não possui assinatura binária válida de imagem (JPEG, PNG ou WEBP).');
    err.status = 400;
    throw err;
  }
  mimeType = magic.mimeType;

  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
  const fileName = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const filePath = path.join(EVIDENCIAS_DIR, fileName);
  await fs.promises.writeFile(filePath, buffer);

  return {
    caminhoRelativo: path.join('uploads', 'evidencias', fileName).replace(/\\/g, '/'),
    hash: generateSha256(buffer),
  };
}

async function calcularHashDeArquivoExistente(caminhoRelativo) {
  const safePath = resolveSafePath(caminhoRelativo, UPLOAD_ROOT);
  if (!safePath || !fs.existsSync(safePath)) return null;
  const buf = await fs.promises.readFile(safePath);
  return generateSha256(buf);
}

function validarAssinaturaBase64(rawSig) {
  if (!rawSig || typeof rawSig !== 'string') return null;
  if (rawSig.length > 2 * 1024 * 1024) {
    const err = new Error('A assinatura digital excede o tamanho máximo permitido.');
    err.status = 400;
    throw err;
  }
  const b64Part = rawSig.includes(',') ? rawSig.split(',')[1] : rawSig;
  const buf = Buffer.from(b64Part, 'base64');
  const magic = validateImageMagicBytes(buf);
  if (!magic.valid) {
    const err = new Error('Formato da assinatura digital inválido (esperado imagem PNG/JPEG/WEBP).');
    err.status = 400;
    throw err;
  }
  return `data:${magic.mimeType};base64,${buf.toString('base64')}`;
}

function verificarPermissaoMutacaoRelatorio(req, relatorio) {
  if (!req.user) return false;
  if (!isFiscalRole(req.user) && relatorio.usuario_id !== req.user.id) {
    return false;
  }
  return true;
}

function parseOptionalNumber(val, min, max) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  if (num < min || num > max) return null;
  return num;
}

async function resolverEmailFiscalDaObra(obra, emailOverride = null) {
  if (emailOverride && typeof emailOverride === 'string' && emailOverride.trim()) {
    return emailOverride.trim();
  }
  if (obra && obra.fiscal_responsavel_id) {
    const fiscal = await dataStore.findUserByIdAsync(obra.fiscal_responsavel_id);
    if (fiscal && fiscal.email) return fiscal.email;
  }
  if (obra && obra.cadastrado_por_fiscal_id) {
    const cadastrador = await dataStore.findUserByIdAsync(obra.cadastrado_por_fiscal_id);
    if (cadastrador && cadastrador.email) return cadastrador.email;
  }
  return process.env.FISCAL_EMAIL_PADRAO || null;
}

const relatoriosController = {
  /**
   * POST /api/relatorios
   */
  async criar(req, res, next) {
    try {
      const { obra_id, respostas, fotos, tipo_local, localizacao_texto, latitude, longitude, precisao_gps } = req.body || {};

      if (!obra_id) {
        return res.status(400).json({
          status: 400,
          erro: 'Identificador da obra (obra_id) é obrigatório.',
        });
      }

      const obra = await dataStore.findObraByIdAsync(obra_id);
      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra informada não foi encontrada no cadastro.',
        });
      }

      if (!isFiscalRole(req.user) && obra.empreiteira_id !== req.user.id) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Você só pode iniciar vistorias em obras atribuídas à sua conta.',
        });
      }

      const novoRelatorio = await dataStore.createRelatorioAsync({
        obra_id,
        usuario_id: req.user.id,
        tipo_local: tipo_local ? sanitizeString(tipo_local).slice(0, 120) : null,
        localizacao_texto: localizacao_texto ? sanitizeString(localizacao_texto).slice(0, 300) : null,
        latitude: parseOptionalNumber(latitude, -90, 90),
        longitude: parseOptionalNumber(longitude, -180, 180),
        precisao_gps: parseOptionalNumber(precisao_gps, 0, 100000),
      });

      if (Array.isArray(respostas) && respostas.length > 0) {
        const respostasSanitizadas = respostas.map(r => ({
          pergunta: sanitizeString(r.pergunta || 'Item não especificado'),
          valor: sanitizeString(r.valor || 'Não informado'),
          justificativa: r.justificativa ? sanitizeString(r.justificativa) : null,
          sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
          tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        }));
        await dataStore.saveRespostasAsync(novoRelatorio.id, respostasSanitizadas);
      }

      if (Array.isArray(fotos) && fotos.length > 0) {
        for (const f of fotos) {
          let caminhoRelativo = f.caminho_arquivo || f.url || '';
          let hashFoto = f.hash_integridade || f.hash_sha256 || '';
          const b64 = f.imagemBase64 || (typeof f.url === 'string' && f.url.startsWith('data:image/') ? f.url : null);

          if (b64) {
            const saved = await salvarFotoBase64Segura(b64, 'evidencia_rel');
            if (saved) {
              caminhoRelativo = saved.caminhoRelativo;
              hashFoto = saved.hash;
            }
          } else if (caminhoRelativo) {
            if (!resolveSafePath(caminhoRelativo, UPLOAD_ROOT)) {
              return res.status(400).json({
                status: 400,
                erro: 'Caminho de arquivo da evidência inválido ou não autorizado.',
              });
            }
            if (!hashFoto) {
              hashFoto = await calcularHashDeArquivoExistente(caminhoRelativo);
            }
          }

          if (caminhoRelativo && hashFoto) {
            await dataStore.addFotoAsync(novoRelatorio.id, {
              caminho_arquivo: sanitizeString(caminhoRelativo),
              hash_integridade: sanitizeString(hashFoto),
              avaliacao_gemini: sanitizeString(f.avaliacao_gemini || f.status_ia || 'APROVADO'),
              confianca: typeof f.confianca === 'number' ? f.confianca : (typeof f.confianca_ia === 'number' ? f.confianca_ia : 0.94),
              motivo: sanitizeString(f.motivo || f.motivo_ia || 'Evidência fotográfica capturada in-loco.'),
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
      if (err.status) {
        return res.status(err.status).json({ status: err.status, erro: err.message });
      }
      next(err);
    }
  },

  /**
   * POST /api/relatorios/sincronizar-offline
   */
  async sincronizarOffline(req, res, next) {
    try {
      const {
        obra_id,
        respostas,
        fotos,
        codigo_unico,
        timestamp,
        assinatura_base64,
        tipo_local,
        localizacao_texto,
        latitude,
        longitude,
        precisao_gps,
      } = req.body || {};

      if (!obra_id) {
        return res.status(400).json({
          status: 400,
          erro: 'Identificador da obra (obra_id) é obrigatório para sincronização.',
        });
      }

      const obra = await dataStore.findObraByIdAsync(obra_id);
      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra informada não existe no cadastro.',
        });
      }

      if (!isFiscalRole(req.user) && obra.empreiteira_id !== req.user.id) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Obra não vinculada à sua conta.',
        });
      }

      const assinaturaValidada = assinatura_base64 ? validarAssinaturaBase64(assinatura_base64) : null;

      const novoRelatorio = await dataStore.createRelatorioAsync({
        obra_id,
        usuario_id: req.user.id,
        tipo_local: tipo_local ? sanitizeString(tipo_local).slice(0, 120) : null,
        localizacao_texto: localizacao_texto ? sanitizeString(localizacao_texto).slice(0, 300) : null,
        latitude: parseOptionalNumber(latitude, -90, 90),
        longitude: parseOptionalNumber(longitude, -180, 180),
        precisao_gps: parseOptionalNumber(precisao_gps, 0, 100000),
        validacao_manual: true,
        motivo_validacao_manual: 'Vistoria registrada em modo offline e sincronizada automaticamente.',
      });

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
          } else if (caminhoRelativo) {
            if (!resolveSafePath(caminhoRelativo, UPLOAD_ROOT)) continue;
            if (!hashFoto) hashFoto = await calcularHashDeArquivoExistente(caminhoRelativo);
          }

          if (caminhoRelativo && hashFoto) {
            await dataStore.addFotoAsync(novoRelatorio.id, {
              caminho_arquivo: sanitizeString(caminhoRelativo),
              hash_integridade: sanitizeString(hashFoto),
              avaliacao_gemini: sanitizeString(itemFoto.avaliacao_gemini || 'VALIDACAO_MANUAL'),
              confianca: typeof itemFoto.confianca === 'number' ? itemFoto.confianca : 0.75,
              motivo: sanitizeString(itemFoto.motivo || 'Evidência fotográfica sincronizada da fila offline.'),
            });
          }
        }
      }

      if (Array.isArray(respostas) && respostas.length > 0) {
        const respostasSanitizadas = respostas.map(r => ({
          pergunta: sanitizeString(r.pergunta || 'Item não especificado'),
          valor: sanitizeString(r.valor || 'Não informado'),
          justificativa: r.justificativa ? sanitizeString(r.justificativa) : null,
          sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
          tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
        }));
        await dataStore.saveRespostasAsync(novoRelatorio.id, respostasSanitizadas);
      }

      const codigo =
        codigo_unico && /^[0-9A-F]{16}$/i.test(String(codigo_unico))
          ? String(codigo_unico).toUpperCase()
          : generateUniqueCode();

      const parsedTime = timestamp ? new Date(timestamp).getTime() : NaN;
      const timeFinal = Number.isNaN(parsedTime) ? Date.now() : parsedTime;
      const dataIso = new Date(timeFinal).toISOString();
      const hashIntegridade = generateReportIntegrityHash(codigo, timeFinal);

      await dataStore.finalizarRelatorioAsync(novoRelatorio.id, {
        codigo_unico: codigo,
        hash_integridade: hashIntegridade,
        data_finalizacao: dataIso,
        assinatura_base64: assinaturaValidada,
        validacao_manual: true,
        motivo_validacao_manual: 'Vistoria registrada em modo offline e sincronizada automaticamente.',
      });

      const relatorioCompleto = await dataStore.findRelatorioByIdAsync(novoRelatorio.id);

      let pdfRelativePath = null;
      try {
        const resPdf = await pdfService.salvarRelatorioPdf(relatorioCompleto);
        pdfRelativePath = resPdf.relativePath;
        await dataStore.atualizarPdfRelatorioAsync(novoRelatorio.id, pdfRelativePath);
        const emailDestino = await resolverEmailFiscalDaObra(obra, req.body.destinatario_email);
        emailService.enviarRelatorioEmail(relatorioCompleto, resPdf.buffer, emailDestino).catch(() => {});
      } catch (errPdf) {
        console.warn('[Offline Sync] Aviso ao compilar PDF:', errPdf.message);
      }

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
      if (err.status) {
        return res.status(err.status).json({ status: err.status, erro: err.message });
      }
      next(err);
    }
  },

  /**
   * GET /api/relatorios/painel/resumo
   */
  async obterPainelAuditoria(req, res, next) {
    try {
      const painel = await dataStore.getPainelAuditoriaAsync();
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
      const filtros = {};
      if (obra_id) filtros.obra_id = obra_id;
      if (status) filtros.status = status;

      // Isolamento por perfil: empreiteira visualiza somente seus próprios relatórios
      if (!isFiscalRole(req.user)) {
        filtros.usuario_id = req.user.id;
      }

      const relatorios = await dataStore.listRelatoriosAsync(filtros);
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
      const relatorio = await dataStore.findRelatorioByIdAsync(id);

      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      if (!isFiscalRole(req.user) && relatorio.usuario_id !== req.user.id) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Este relatório pertence a outro responsável.',
        });
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
      const rawRespostas = Array.isArray(req.body) ? req.body : req.body?.respostas;

      if (!rawRespostas || !Array.isArray(rawRespostas)) {
        return res.status(400).json({
          status: 400,
          erro: 'Envie uma lista (array) contendo os itens preenchidos do checklist.',
        });
      }

      const relatorio = await dataStore.findRelatorioByIdAsync(id);
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

      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(403).json({
          status: 403,
          erro: 'Este relatório já foi finalizado e encontra-se bloqueado para novas edições.',
          statusAtual: relatorio.status,
          codigoUnico: relatorio.codigo_unico,
        });
      }

      const respostasSanitizadas = rawRespostas.map(r => ({
        pergunta: sanitizeString(r.pergunta || 'Item não especificado'),
        valor: sanitizeString(r.valor || 'Não informado'),
        justificativa: r.justificativa ? sanitizeString(r.justificativa) : null,
        sugestao_ia: r.sugestao_ia ? sanitizeString(r.sugestao_ia) : null,
        tipo: r.tipo === 'multipla_escolha' ? 'multipla_escolha' : 'texto',
      }));

      const salvas = await dataStore.saveRespostasAsync(id, respostasSanitizadas);

      return res.status(200).json({
        mensagem: 'Respostas do checklist salvas com sucesso.',
        respostas: Array.isArray(salvas) ? salvas : respostasSanitizadas,
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
      const relatorio = await dataStore.findRelatorioByIdAsync(id);

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
      } = req.body || {};

      hash_integridade = hash_integridade || hash_sha256;
      avaliacao_gemini = avaliacao_gemini || status_ia;
      confianca = confianca !== undefined ? confianca : confianca_ia;
      motivo = motivo || motivo_ia;

      if (req.file) {
        const buffer = await fs.promises.readFile(req.file.path);
        const magic = validateImageMagicBytes(buffer);
        if (!magic.valid) {
          try { await fs.promises.unlink(req.file.path); } catch (_) {}
          return res.status(400).json({
            status: 400,
            erro: 'O arquivo enviado não possui assinatura binária válida de imagem (JPEG, PNG ou WEBP).',
          });
        }
        caminho_arquivo = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
        hash_integridade = generateSha256(buffer);
      } else if (imagemBase64 || (url && typeof url === 'string' && url.startsWith('data:image/'))) {
        const rawCandidate = imagemBase64 || url;
        if (typeof rawCandidate === 'string' && rawCandidate.trim().length > 0) {
          const saved = await salvarFotoBase64Segura(rawCandidate, 'evidencia_rel');
          if (saved) {
            caminho_arquivo = saved.caminhoRelativo;
            hash_integridade = saved.hash;
          }
        }
      } else if (!caminho_arquivo && url && typeof url === 'string') {
        caminho_arquivo = url.trim();
      }

      if (!caminho_arquivo) {
        return res.status(400).json({
          status: 400,
          erro: 'Evidência fotográfica ou caminho de arquivo válido é obrigatório.',
        });
      }

      if (!resolveSafePath(caminho_arquivo, UPLOAD_ROOT)) {
        return res.status(400).json({
          status: 400,
          erro: 'Caminho de arquivo da foto inválido ou fora do diretório de uploads autorizado.',
        });
      }

      if (!hash_integridade) {
        hash_integridade = await calcularHashDeArquivoExistente(caminho_arquivo);
      }

      if (!hash_integridade) {
        return res.status(400).json({
          status: 400,
          erro: 'Hash de integridade SHA-256 é obrigatório (ou o arquivo informado não existe no servidor).',
        });
      }

      const cleanStatus = ['APROVADO', 'REJEITADO', 'VALIDACAO_MANUAL', 'PENDENTE'].includes(String(avaliacao_gemini || '').toUpperCase())
        ? String(avaliacao_gemini).toUpperCase()
        : 'APROVADO';

      const foto = await dataStore.addFotoAsync(id, {
        caminho_arquivo: sanitizeString(caminho_arquivo),
        hash_integridade: sanitizeString(hash_integridade),
        avaliacao_gemini: cleanStatus,
        confianca: typeof confianca === 'number' ? confianca : 0.94,
        motivo: sanitizeString(motivo || 'Evidência fotográfica capturada in-loco.'),
      });

      return res.status(201).json({
        mensagem: 'Foto anexada com sucesso à vistoria.',
        foto,
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ status: err.status, erro: err.message });
      }
      next(err);
    }
  },

  /**
   * POST /api/relatorios/:id/finalizar
   */
  async finalizar(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = await dataStore.findRelatorioByIdAsync(id);

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

      if (relatorio.status !== 'EM_ANDAMENTO') {
        return res.status(400).json({
          status: 400,
          erro: 'Este relatório já foi finalizado previamente. Edições e reenvios estão bloqueados.',
          codigo: relatorio.codigo_unico,
          dataEnvio: relatorio.data_finalizacao || relatorio.data,
          status: relatorio.status,
        });
      }

      const body = req.body || {};

      // Validação criptográfica da senha do responsável quando enviada na assinatura digital
      if (body.senha_confirmacao !== undefined) {
        const userFull = await dataStore.findUserByIdAsync(req.user.id);
        const senhaOk = userFull && (await bcrypt.compare(String(body.senha_confirmacao), userFull.senha_hash));
        if (!senhaOk) {
          return res.status(401).json({
            status: 401,
            erro: 'Senha de confirmação incorreta. Informe sua senha de acesso para assinar e concluir o relatório.',
          });
        }
      }

      // Validação da assinatura digital PNG (quando enviada)
      const assinaturaValidada = body.assinatura_base64 ? validarAssinaturaBase64(body.assinatura_base64) : null;

      // Deduplicação de fotos adicionais na finalização
      const existingHashes = new Set((relatorio.fotos || []).map(f => f.hash_integridade || f.hash_sha256).filter(Boolean));
      const existingPaths = new Set((relatorio.fotos || []).map(f => f.caminho_arquivo || f.url).filter(Boolean));

      const fotosParaAnexar = body.fotos || (body.foto ? [body.foto] : (body.imagemBase64 ? [body] : []));
      if (Array.isArray(fotosParaAnexar) && fotosParaAnexar.length > 0) {
        for (const itemFoto of fotosParaAnexar) {
          let caminhoRel = itemFoto.caminho_arquivo || itemFoto.url || '';
          let hashFoto = itemFoto.hash_integridade || itemFoto.hash_sha256 || '';
          const b64 = itemFoto.imagemBase64 || (typeof itemFoto.url === 'string' && itemFoto.url.startsWith('data:image/') ? itemFoto.url : null);

          if ((hashFoto && existingHashes.has(hashFoto)) || (caminhoRel && existingPaths.has(caminhoRel))) {
            continue;
          }

          if (b64) {
            const saved = await salvarFotoBase64Segura(b64, 'evidencia_fin');
            if (saved) {
              caminhoRel = saved.caminhoRelativo;
              hashFoto = saved.hash;
            }
          } else if (caminhoRel) {
            if (!resolveSafePath(caminhoRel, UPLOAD_ROOT)) continue;
            if (!hashFoto) hashFoto = await calcularHashDeArquivoExistente(caminhoRel);
          }

          if (!caminhoRel || !hashFoto || existingHashes.has(hashFoto)) {
            continue;
          }

          await dataStore.addFotoAsync(id, {
            caminho_arquivo: sanitizeString(caminhoRel),
            hash_integridade: sanitizeString(hashFoto),
            avaliacao_gemini: sanitizeString(itemFoto.avaliacao_gemini || itemFoto.status_ia || 'APROVADO'),
            confianca: typeof itemFoto.confianca === 'number' ? itemFoto.confianca : 0.94,
            motivo: sanitizeString(itemFoto.motivo || itemFoto.motivo_ia || 'Evidência fotográfica capturada in-loco.'),
          });
          existingHashes.add(hashFoto);
          existingPaths.add(caminhoRel);
        }
      }

      const codigoUnico = generateUniqueCode();
      const timestamp = Date.now();
      const hashIntegridade = generateReportIntegrityHash(codigoUnico, timestamp);
      const dataIso = new Date(timestamp).toISOString();

      await dataStore.finalizarRelatorioAsync(id, {
        codigo_unico: codigoUnico,
        hash_integridade: hashIntegridade,
        data_finalizacao: dataIso,
        assinatura_base64: assinaturaValidada,
        latitude: parseOptionalNumber(body.latitude, -90, 90),
        longitude: parseOptionalNumber(body.longitude, -180, 180),
        precisao_gps: parseOptionalNumber(body.precisao_gps, 0, 100000),
        localizacao_texto: body.localizacao_texto ? sanitizeString(body.localizacao_texto).slice(0, 300) : relatorio.localizacao_texto,
        tipo_local: body.tipo_local ? sanitizeString(body.tipo_local).slice(0, 120) : relatorio.tipo_local,
        validacao_manual: body.validacao_manual !== undefined ? Boolean(body.validacao_manual) : relatorio.validacao_manual,
        motivo_validacao_manual: body.motivo_validacao_manual
          ? sanitizeString(body.motivo_validacao_manual).slice(0, 300)
          : relatorio.motivo_validacao_manual,
      });

      const relatorioCompleto = await dataStore.findRelatorioByIdAsync(id);

      let pdfRelativePath = null;
      try {
        const resultadoPdf = await pdfService.salvarRelatorioPdf(relatorioCompleto);
        pdfRelativePath = resultadoPdf.relativePath;
        await dataStore.atualizarPdfRelatorioAsync(id, pdfRelativePath);

        const destinatarioFiscal = await resolverEmailFiscalDaObra(relatorioCompleto.obra, body.destinatario_email);
        emailService.enviarRelatorioEmail(relatorioCompleto, resultadoPdf.buffer, destinatarioFiscal).catch(err => {
          console.warn('[Relatorios] Alerta no envio de e-mail de notificação:', err.message);
        });
      } catch (pdfErr) {
        console.error('[Relatorios] Falha na compilação do PDF:', pdfErr.message);
      }

      return res.status(200).json({
        mensagem: 'Relatório finalizado com sucesso!',
        codigo: codigoUnico,
        hashIntegridade,
        pdfUrl: `/api/relatorios/${id}/pdf`,
        status: 'FINALIZADO',
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ status: err.status, erro: err.message });
      }
      next(err);
    }
  },

  /**
   * GET /api/relatorios/:id/pdf
   * Relatórios finalizados/homologados são auditáveis via Fé Pública.
   * Relatórios ainda EM_ANDAMENTO exigem autenticação do dono ou fiscal.
   */
  async downloadPdf(req, res, next) {
    try {
      const { id } = req.params;
      const relatorio = await dataStore.findRelatorioByIdAsync(id);

      if (!relatorio) {
        return res.status(404).json({
          status: 404,
          erro: 'Relatório de vistoria não encontrado.',
        });
      }

      if (relatorio.status === 'EM_ANDAMENTO') {
        if (!req.user) {
          return res.status(401).json({
            status: 401,
            erro: 'Autenticação necessária para visualizar relatório em andamento.',
          });
        }
        if (!isFiscalRole(req.user) && relatorio.usuario_id !== req.user.id) {
          return res.status(403).json({
            status: 403,
            erro: 'Relatório em andamento só pode ser visualizado pelo responsável técnico ou pela fiscalização.',
          });
        }
      }

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
      const { status, justificativa } = req.body || {};

      const statusUpper = String(status || '').toUpperCase().trim();

      if (!['APROVADO', 'REGULAR', 'REPROVADO', 'PENDENTE_AJUSTE'].includes(statusUpper)) {
        return res.status(400).json({
          status: 400,
          erro: 'Status de julgamento inválido. Aceitos: APROVADO (REGULAR) ou REPROVADO (PENDENTE_AJUSTE).',
        });
      }

      const relatorio = await dataStore.findRelatorioByIdAsync(id);
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

      const statusNormalizado = (statusUpper === 'APROVADO' || statusUpper === 'REGULAR') ? 'APROVADO' : 'PENDENTE_AJUSTE';
      const obraNovoStatus = statusNormalizado === 'APROVADO' ? 'REGULAR' : 'PENDENTE_AJUSTE';
      const justificativaSanitizada = sanitizeString(justificativa || '').slice(0, 1000);

      await dataStore.atualizarStatusFiscalAsync(id, statusNormalizado, justificativaSanitizada, req.user.id);

      try {
        const relatorioAtualizado = await dataStore.findRelatorioByIdAsync(id);
        if (relatorioAtualizado) {
          const novoPdf = await pdfService.salvarRelatorioPdf(relatorioAtualizado);
          await dataStore.atualizarPdfRelatorioAsync(id, novoPdf.relativePath);
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
