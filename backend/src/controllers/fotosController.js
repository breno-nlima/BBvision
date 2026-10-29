/**
 * BBVision - Controller de Fotos e Inteligência Artificial (Google Gemini)
 * Implementa Seções 4, 8.4 e 9 do Documento de Entrega TakeOff
 * Governança com SLA <= 15s, limiar de 75%, inviolabilidade e mitigação de Path Traversal
 */

const fs = require('fs');
const path = require('path');
const geminiService = require('../services/geminiService');
const { generateSha256 } = require('../utils/cryptoUtils');
const { resolveSafePath, validateImageMagicBytes, sanitizeString } = require('../utils/securityUtils');
const { EVIDENCIAS_DIR, UPLOAD_ROOT } = require('../middlewares/uploadMiddleware');

const fotosController = {
  /**
   * POST /api/fotos/avaliar
   * Body: multipart/form-data (campo 'foto') OU JSON { imagemBase64, mimeType }
   * SLA: <= 15s | Limiar: >= 75%
   * Retorno (200): { status, confianca, motivo, hash_integridade, caminho_arquivo, duracaoMs, validacao_manual, modelo }
   */
  async avaliar(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';
      let relativePath = '';

      // 1. Obtenção do Buffer e Caminho da Imagem
      if (req.file) {
        imageBuffer = await fs.promises.readFile(req.file.path);
        mimeType = req.file.mimetype;
        relativePath = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
      } else if (req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (typeof base64Data !== 'string' || base64Data.trim() === '') {
          return res.status(400).json({
            status: 400,
            erro: 'Formato inválido do campo imagemBase64.',
          });
        }

        // Limite defensivo de payload base64 (máximo 25MB)
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
        } catch (e) {
          return res.status(400).json({
            status: 400,
            erro: 'Falha ao decodificar dados binários da imagem Base64.',
          });
        }

        // Validação de integridade do formato de imagem (Magic Bytes)
        const magicCheck = validateImageMagicBytes(imageBuffer);
        if (magicCheck.valid) {
          mimeType = magicCheck.mimeType;
        }

        const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
        const fileName = `evidencia_b64_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        const filePath = path.join(EVIDENCIAS_DIR, fileName);

        await fs.promises.writeFile(filePath, imageBuffer);
        relativePath = path.join('uploads', 'evidencias', fileName).replace(/\\/g, '/');
      } else {
        return res.status(400).json({
          status: 400,
          erro: 'Nenhuma evidência fotográfica fornecida. Envie via multipart/form-data (campo "foto") ou JSON no campo "imagemBase64".',
        });
      }

      // Validação defensiva de Magic Bytes
      const magicValidation = validateImageMagicBytes(imageBuffer);
      if (!magicValidation.valid && imageBuffer.length > 500) {
        return res.status(400).json({
          status: 400,
          erro: 'O arquivo enviado não possui assinatura binária válida de imagem (JPEG, PNG ou WEBP).',
        });
      }

      // 2. Geração do Hash SHA-256 Imediato (Inviolabilidade da Evidência)
      const hashIntegridade = generateSha256(imageBuffer);

      // 3. Avaliação Multimodal com Google Gemini (com SLA estrito de 15s)
      const resultadoIA = await geminiService.avaliarQualidadeFoto(imageBuffer, mimeType);

      return res.status(200).json({
        status: resultadoIA.status,
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
      // Fallback gracioso em contingência
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
   * Prompt P3: "Com base nesta imagem, escreva uma observação curta para o relatório."
   */
  async sugerirObservacao(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';
      const categoria = sanitizeString(req.body.categoria || 'geral');

      if (req.file) {
        imageBuffer = await fs.promises.readFile(req.file.path);
        mimeType = req.file.mimetype;
      } else if (req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (req.body.caminho_arquivo) {
        // Proteção contra Path Traversal
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

      if (!imageBuffer) {
        return res.status(400).json({
          status: 400,
          erro: 'Imagem não informada para geração da sugestão de parecer.',
        });
      }

      const sugestaoObj = await geminiService.sugerirObservacaoChecklist(imageBuffer, categoria, mimeType);
      return res.status(200).json(sugestaoObj);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/fotos/comparar-referencia
   * Prompt P2: "Esta foto segue o padrão de referência? Diga o que está certo e o que ajustar."
   */
  async compararReferencia(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';

      if (req.file) {
        imageBuffer = await fs.promises.readFile(req.file.path);
        mimeType = req.file.mimetype;
      } else if (req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (req.body.caminho_arquivo) {
        const safePath = resolveSafePath(req.body.caminho_arquivo, UPLOAD_ROOT);
        if (safePath && fs.existsSync(safePath)) {
          imageBuffer = await fs.promises.readFile(safePath);
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
