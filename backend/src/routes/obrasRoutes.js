/**
 * BBVision - Rotas de Obras
 */

const express = require('express');
const router = express.Router();
const obrasController = require('../controllers/obrasController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

router.get('/checklist-template', requireAuth, obrasController.obterTemplateChecklist);
router.put('/checklist-template', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.atualizarTemplateChecklist);
router.get('/', requireAuth, obrasController.listar);
router.post('/', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.criar);
router.get('/:id', requireAuth, obrasController.obterPorId);
router.patch('/:id', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.atualizar);
router.delete('/:id', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.excluir);
router.get('/:id/checklist', requireAuth, obrasController.obterChecklistObra);
router.put('/:id/checklist', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), obrasController.atualizarChecklistObra);

module.exports = router;
