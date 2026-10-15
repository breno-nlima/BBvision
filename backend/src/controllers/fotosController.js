/**
 * BBVision - Controller de Fotos e Inteligência Artificial (Google Gemini)
 * Implementa Seções 4, 8.4 e 9 do Documento de Entrega TakeOff
 */

const fs = require('fs');
const path = require('path');
const geminiService = require('../services/geminiService');
const { generateSha256 } = require('../utils/cryptoUtils');
const { EVIDENCIAS_DIR } = require('../middlewares/uploadMiddleware');

const fotosController = {
  /**
   * POST /api/fotos/avaliar
   * Body: multipart/form-data (arquivo 'foto' ou 'imagem') OU { imagemBase64, mimeType }
   * SLA: <= 15s | Limiar: >= 75%
   * Retorno (200): { status: "APROVADO" | "REJEITADO" | "VALIDACAO_MANUAL", confianca, motivo, hash_integridade, caminho_arquivo }
   */
  async avaliar(req, res, next) {
    try {
      let imageBuffer = null;
      let mimeType = 'image/jpeg';
      let relativePath = '';

      // 1. Obtenção do Buffer e Caminho da Imagem
      if (req.file) {
        imageBuffer = fs.readFileSync(req.file.path);
        mimeType = req.file.mimetype;
        relativePath = path.join('uploads', 'evidencias', path.basename(req.file.path)).replace(/\\/g, '/');
      } else if (req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          const parts = base64Data.split(',');
          const mimeMatch = parts[0].match(/:(.*?);/);
          if (mimeMatch) mimeType = mimeMatch[1];
          base64Data = parts[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');

        const fileName = `evidencia_b64_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;
        const filePath = path.join(EVIDENCIAS_DIR, fileName);
        fs.writeFileSync(filePath, imageBuffer);
        relativePath = path.join('uploads', 'evidencias', fileName).replace(/\\/g, '/');
      } else {
        return res.status(400).json({
          erro: 'Nenhuma foto fornecida. Envie via multipart/form-data (campo "foto") ou imagemBase64.',
        });
      }

      // 2. Geração do Hash SHA-256 Imediato (Inviolabilidade)
      const hashIntegridade = generateSha256(imageBuffer);

      // 3. Avaliação Multimodal com Google Gemini (com SLA de 15s e fallback gracioso)
      const resultadoIA = await geminiService.avaliarQualidadeFoto(imageBuffer, mimeType);

      return res.status(200).json({
        status: resultadoIA.status,
        confianca: resultadoIA.confianca,
        motivo: resultadoIA.motivo,
        hash_integridade: hashIntegridade,
        caminho_arquivo: relativePath,
        duracaoMs: resultadoIA.duracaoMs,
        validacao_manual: resultadoIA.status === 'VALIDACAO_MANUAL',
        modelo: resultadoIA.modelo,
      });
    } catch (err) {
      console.error('[Fotos Controller Erro]:', err);
      // Fallback em caso de falha inesperada
      return res.status(200).json({
        status: 'VALIDACAO_MANUAL',
        confianca: 0.50,
        motivo: 'Falha no processamento de IA. Validação manual liberada.',
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
      const categoria = req.body.categoria || 'geral';

      if (req.file) {
        imageBuffer = fs.readFileSync(req.file.path);
        mimeType = req.file.mimetype;
      } else if (req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (req.body.caminho_arquivo) {
        const fullPath = path.join(__dirname, '..', '..', req.body.caminho_arquivo);
        if (fs.existsSync(fullPath)) {
          imageBuffer = fs.readFileSync(fullPath);
        }
      }

      if (!imageBuffer) {
        return res.status(400).json({ erro: 'Imagem não encontrada para gerar sugestão de texto.' });
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
        imageBuffer = fs.readFileSync(req.file.path);
        mimeType = req.file.mimetype;
      } else if (req.body.imagemBase64) {
        let base64Data = req.body.imagemBase64;
        if (base64Data.includes(',')) {
          base64Data = base64Data.split(',')[1];
        }
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      if (!imageBuffer) {
        return res.status(400).json({ erro: 'Imagem não informada para comparação.' });
      }

      const analise = await geminiService.compararComReferencia(imageBuffer, mimeType);
      return res.status(200).json(analise);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = fotosController;
