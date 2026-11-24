/**
 * BBVision - Controller de Fotos e Visão Computacional com IA
 * Governança: SLA <= 15s, limiar >= 75%, validação estrita de Magic Bytes e mitigação de Path Traversal.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const geminiService = require('../services/geminiService');
const { generateSha256 } = require('../utils/cryptoUtils');
const { resolveSafePath, validateImageMagicBytes, sanitizeString } = require('../utils/securityUtils');
const { EVIDENCIAS_DIR, UPLOAD_ROOT } = require('../middlewares/uploadMiddleware');

const fotosController = {
  /**
   * POST /api/fotos/avaliar
   */
  async avaliar(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';
      let relativePath = '';

      if (req.file) {
        imageBuffer = await fs.promises.readFile(req.file.path);
        const magicCheck = validateImageMagicBytes(imageBuffer);
        if (!magicCheck.valid) {
          try { await fs.promises.unlink(req.file.path); } catch (_) {}
          return res.status(400).json({
            status: 400,
            erro: 'O arquivo enviado não possui assinatura binária válida de imagem (JPEG, PNG ou WEBP).',
          });
        }
        mimeType = magicCheck.mimeType;
        relativePath = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
      } else if (req.body && req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (typeof base64Data !== 'string' || base64Data.trim() === '') {
          return res.status(400).json({
            status: 400,
            erro: 'Formato inválido do campo imagemBase64.',
          });
        }

        if (base64Data.length > 25 * 1024 * 1024) {
          return res.status(400).json({
            status: 400,
            erro: 'A evidência fotográfica excede o limite máximo permitido de 15MB.',
          });
        }

        if (base64Data.includes(',')) {
          const parts = base64Data.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          if (mimeMatch) mimeType = mimeMatch[1];
          base64Data = parts[1];
        }

        try {
          imageBuffer = Buffer.from(base64Data, 'base64');
        } catch (_) {
          return res.status(400).json({
            status: 400,
            erro: 'Falha ao decodificar dados binários da imagem Base64.',
          });
        }

        const magicCheck = validateImageMagicBytes(imageBuffer);
        if (!magicCheck.valid) {
          return res.status(400).json({
            status: 400,
            erro: 'A imagem enviada não possui assinatura binária válida (JPEG, PNG ou WEBP).',
          });
        }

        mimeType = magicCheck.mimeType;
        const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
        const fileName = `evidencia_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
        const filePath = path.join(EVIDENCIAS_DIR, fileName);

        await fs.promises.writeFile(filePath, imageBuffer);
        relativePath = path.join('uploads', 'evidencias', fileName).replace(/\\/g, '/');
      } else {
        return res.status(400).json({
          status: 400,
          erro: 'Nenhuma evidência fotográfica fornecida. Envie via multipart/form-data (campo "foto") ou JSON no campo "imagemBase64".',
        });
      }

      const hashIntegridade = generateSha256(imageBuffer);

      let telemetriaVisual = req.body.telemetriaVisual || null;
      if (typeof telemetriaVisual === 'string') {
        try {
          telemetriaVisual = JSON.parse(telemetriaVisual);
        } catch (_) {
          telemetriaVisual = null;
        }
      }

      const resultadoIA = await geminiService.avaliarQualidadeFoto(imageBuffer, mimeType, telemetriaVisual);

      return res.status(200).json({
        status: resultadoIA.status,
        categoria: resultadoIA.categoria || (resultadoIA.status === 'APROVADO' ? 'OBRA_LOCAL' : 'REJEITADO'),
        confianca: resultadoIA.confianca,
        motivo: resultadoIA.motivo,
        hash_integridade: hashIntegridade,
        caminho_arquivo: relativePath,
        duracaoMs: resultadoIA.duracaoMs,
        validacao_manual: resultadoIA.validacao_manual || resultadoIA.status === 'VALIDACAO_MANUAL',
        modelo: resultadoIA.modelo,
      });
    } catch (err) {
      console.error('[Fotos Controller Erro Inesperado]:', err);
      return res.status(200).json({
        status: 'VALIDACAO_MANUAL',
        confianca: 0.50,
        motivo: 'Falha técnica no processamento de visão computacional. Validação manual liberada.',
        validacao_manual: true,
      });
    }
  },

  /**
   * POST /api/fotos/sugerir-observacao
   */
  async sugerirObservacao(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';
      const categoria = sanitizeString((req.body && req.body.categoria) || 'geral').slice(0, 120);
      const contextoRespostas = req.body && req.body.contextoRespostas
        ? sanitizeString(String(req.body.contextoRespostas)).slice(0, 800)
        : null;

      if (req.file) {
        imageBuffer = await fs.promises.readFile(req.file.path);
        const magic = validateImageMagicBytes(imageBuffer);
        if (!magic.valid) {
          try { await fs.promises.unlink(req.file.path); } catch (_) {}
          return res.status(400).json({ status: 400, erro: 'Arquivo de imagem inválido.' });
        }
        mimeType = magic.mimeType;
      } else if (req.body && req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');
        const magic = validateImageMagicBytes(imageBuffer);
        if (!magic.valid) {
          return res.status(400).json({ status: 400, erro: 'Imagem Base64 inválida.' });
        }
        mimeType = magic.mimeType;
      } else if (req.body && req.body.caminho_arquivo) {
        const safePath = resolveSafePath(req.body.caminho_arquivo, UPLOAD_ROOT);
        if (safePath && fs.existsSync(safePath)) {
          imageBuffer = await fs.promises.readFile(safePath);
        } else {
          return res.status(400).json({
            status: 400,
            erro: 'Caminho de arquivo inválido ou não autorizado.',
          });
        }
      }

      if (!imageBuffer && (!req.body || (!req.body.categoria && !contextoRespostas))) {
        return res.status(400).json({
          status: 400,
          erro: 'Imagem, categoria ou contexto não informado para geração da sugestão de parecer.',
        });
      }

      const sugestaoObj = await geminiService.sugerirObservacaoChecklist(
        imageBuffer,
        categoria,
        mimeType,
        contextoRespostas
      );
      return res.status(200).json(sugestaoObj);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/fotos/comparar-referencia
   */
  async compararReferencia(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';

      if (req.file) {
        imageBuffer = await fs.promises.readFile(req.file.path);
        const magic = validateImageMagicBytes(imageBuffer);
        if (!magic.valid) {
          try { await fs.promises.unlink(req.file.path); } catch (_) {}
          return res.status(400).json({ status: 400, erro: 'Arquivo de imagem inválido.' });
        }
        mimeType = magic.mimeType;
      } else if (req.body && req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');
        const magic = validateImageMagicBytes(imageBuffer);
        if (!magic.valid) {
          return res.status(400).json({ status: 400, erro: 'Imagem Base64 inválida.' });
        }
        mimeType = magic.mimeType;
      } else if (req.body && req.body.caminho_arquivo) {
        const safePath = resolveSafePath(req.body.caminho_arquivo, UPLOAD_ROOT);
        if (safePath && fs.existsSync(safePath)) {
          imageBuffer = await fs.promises.readFile(safePath);
        } else {
          return res.status(400).json({ status: 400, erro: 'Caminho de arquivo inválido ou não autorizado.' });
        }
      }

      if (!imageBuffer) {
        return res.status(400).json({
          status: 400,
          erro: 'Imagem não informada para comparação com gabarito de referência.',
        });
      }

      const analise = await geminiService.compararComReferencia(imageBuffer, mimeType);
      return res.status(200).json(analise);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = fotosController;
