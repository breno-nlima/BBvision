/**
 * BBVision - Rotas de Relatórios, Finalização Inviolável e Auditoria
 */

const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const { optionalAuth } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

// Criação e listagem
router.post('/', optionalAuth, relatoriosController.criar);
router.get('/', optionalAuth, relatoriosController.listar);
router.get('/painel/resumo', optionalAuth, relatoriosController.obterPainelAuditoria);
router.get('/:id', optionalAuth, relatoriosController.obterPorId);

// Checklist e fotos
router.put('/:id/respostas', optionalAuth, relatoriosController.salvarRespostas);
router.post('/:id/fotos', optionalAuth, upload.single('foto'), relatoriosController.anexarFoto);

// Finalização oficial e download do PDF
router.post('/:id/finalizar', optionalAuth, relatoriosController.finalizar);
router.get('/:id/pdf', relatoriosController.downloadPdf);

// Auditoria do Fiscal / Engenheiro Mariana
router.patch('/:id/status', optionalAuth, relatoriosController.atualizarStatusFiscal);

module.exports = router;
