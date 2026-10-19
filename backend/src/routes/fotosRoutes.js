/**
 * BBVision - Rotas de Fotos e Visão Computacional com Google Gemini
 * Inclui limitação de taxa para proteção de cota da API Gemini
 */

const express = require('express');
const router = express.Router();
const fotosController = require('../controllers/fotosController');
const { upload } = require('../middlewares/uploadMiddleware');
const { aiLimiter } = require('../middlewares/rateLimiter');

// Avaliação multimodal com SLA <= 15s (aceita multipart campo 'foto' ou body JSON base64)
router.post('/avaliar', aiLimiter, upload.single('foto'), fotosController.avaliar);

// Geração de observação assistida com IA (Prompt P3)
router.post('/sugerir-observacao', aiLimiter, upload.single('foto'), fotosController.sugerirObservacao);

// Comparação com imagem padrão de referência (Prompt P2)
router.post('/comparar-referencia', aiLimiter, upload.single('foto'), fotosController.compararReferencia);

module.exports = router;
