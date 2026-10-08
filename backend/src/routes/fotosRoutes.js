/**
 * BBVision - Rotas de Fotos e Visão Computacional com Gemini
 */

const express = require('express');
const router = express.Router();
const fotosController = require('../controllers/fotosController');
const { upload } = require('../middlewares/uploadMiddleware');

// Avaliação multimodal com SLA <= 15s (aceita multipart campo 'foto' ou body JSON base64)
router.post('/avaliar', upload.single('foto'), fotosController.avaliar);

// Geração de observação assistida com IA (Prompt P3)
router.post('/sugerir-observacao', upload.single('foto'), fotosController.sugerirObservacao);

// Comparação com imagem padrão de referência (Prompt P2)
router.post('/comparar-referencia', upload.single('foto'), fotosController.compararReferencia);

module.exports = router;
