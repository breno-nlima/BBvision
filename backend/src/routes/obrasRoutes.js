/**
 * BBVision - Rotas de Obras
 */

const express = require('express');
const router = express.Router();
const obrasController = require('../controllers/obrasController');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/checklist-template', optionalAuth, obrasController.obterTemplateChecklist);
router.put('/checklist-template', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.atualizarTemplateChecklist);
router.get('/', optionalAuth, obrasController.listar);
router.get('/:id', optionalAuth, obrasController.obterPorId);
router.post('/', requireAuth, obrasController.criar);
router.get('/:id/checklist', optionalAuth, obrasController.obterChecklistObra);
router.put('/:id/checklist', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.atualizarChecklistObra);

module.exports = router;
