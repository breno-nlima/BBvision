/**
 * BBVision - Rotas de Fotos e Visão Computacional com IA
 * Protegidas por autenticação JWT obrigatória e limitação de taxa (aiLimiter).
 */

const express = require('express');
const router = express.Router();
const fotosController = require('../controllers/fotosController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const { aiLimiter } = require('../middlewares/rateLimiter');

router.post('/avaliar', requireAuth, aiLimiter, upload.single('foto'), fotosController.avaliar);
router.post('/sugerir-observacao', requireAuth, aiLimiter, upload.single('foto'), fotosController.sugerirObservacao);
router.post('/comparar-referencia', requireAuth, aiLimiter, upload.single('foto'), fotosController.compararReferencia);

module.exports = router;
