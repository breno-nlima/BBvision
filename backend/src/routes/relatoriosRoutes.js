/**
 * BBVision - Rotas de Relatórios, Finalização Inviolável e Auditoria Fiscal
 */

const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

// Criação, listagem e painel fiscal
router.post('/', requireAuth, relatoriosController.criar);
router.get('/', requireAuth, relatoriosController.listar);
router.get('/painel/resumo', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), relatoriosController.obterPainelAuditoria);

// Sincronização offline (HU05) - antes do parâmetro :id
router.post('/sincronizar-offline', requireAuth, relatoriosController.sincronizarOffline);

// Detalhamento de relatório
router.get('/:id', requireAuth, relatoriosController.obterPorId);

// Checklist e evidências fotográficas
router.put('/:id/respostas', requireAuth, relatoriosController.salvarRespostas);
router.post('/:id/fotos', requireAuth, upload.single('foto'), relatoriosController.anexarFoto);

// Finalização oficial inviolável e PDF (documentos finalizados são públicos por Fé Pública)
router.post('/:id/finalizar', requireAuth, relatoriosController.finalizar);
router.get('/:id/pdf', optionalAuth, relatoriosController.downloadPdf);

// Auditoria e Parecer Fiscal (RBAC restrito a fiscais/engenheiros/admin)
router.patch('/:id/status', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), relatoriosController.atualizarStatusFiscal);

module.exports = router;
