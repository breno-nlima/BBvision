/**
 * BBVision - Rotas de Relatórios, Finalização Inviolável e Auditoria Fiscal
 * Implementa controle RBAC estrito para pareceres e download de PDF
 */

const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

// Criação e listagem de relatórios
router.post('/', requireAuth, relatoriosController.criar);
router.get('/', optionalAuth, relatoriosController.listar);
router.get('/painel/resumo', requireAuth, relatoriosController.obterPainelAuditoria);

// Sincronização offline em lote ou individual (HU05) - Antes do parâmetro :id
router.post('/sincronizar-offline', requireAuth, relatoriosController.sincronizarOffline);

// Detalhamento de relatório por ID
router.get('/:id', optionalAuth, relatoriosController.obterPorId);

// Checklist e evidências fotográficas
router.put('/:id/respostas', requireAuth, relatoriosController.salvarRespostas);
router.post('/:id/fotos', requireAuth, upload.single('foto'), relatoriosController.anexarFoto);

// Finalização oficial inviolável e download/stream do PDF
router.post('/:id/finalizar', requireAuth, relatoriosController.finalizar);
router.get('/:id/pdf', relatoriosController.downloadPdf);

// Auditoria do Fiscal / Engenheiro Mariana (Acesso restrito ao perfil fiscal/engenheiro do Banco do Brasil)
router.patch('/:id/status', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), relatoriosController.atualizarStatusFiscal);

module.exports = router;
