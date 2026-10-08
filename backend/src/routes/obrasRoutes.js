/**
 * BBVision - Rotas de Obras
 */

const express = require('express');
const router = express.Router();
const obrasController = require('../controllers/obrasController');
const { optionalAuth } = require('../middlewares/authMiddleware');

router.get('/', optionalAuth, obrasController.listar);
router.get('/:id', optionalAuth, obrasController.obterPorId);
router.post('/', optionalAuth, obrasController.criar);

module.exports = router;
