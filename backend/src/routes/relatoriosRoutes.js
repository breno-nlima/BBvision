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
router.post('/', optionalAuth, relatoriosController.criar);
router.get('/', optionalAuth, relatoriosController.listar);
router.get('/painel/resumo', optionalAuth, relatoriosController.obterPainelAuditoria);

// Sincronização offline em lote ou individual (HU05) - Antes do parâmetro :id
router.post('/sincronizar-offline', optionalAuth, relatoriosController.sincronizarOffline);

// Detalhamento de relatório por ID
router.get('/:id', optionalAuth, relatoriosController.obterPorId);

// Checklist e evidências fotográficas
router.put('/:id/respostas', optionalAuth, relatoriosController.salvarRespostas);
router.post('/:id/fotos', optionalAuth, upload.single('foto'), relatoriosController.anexarFoto);

// Finalização oficial inviolável e download/stream do PDF
router.post('/:id/finalizar', optionalAuth, relatoriosController.finalizar);
router.get('/:id/pdf', relatoriosController.downloadPdf);

// Auditoria do Fiscal / Engenheiro Mariana (Acesso restrito ao perfil fiscal/engenheiro do Banco do Brasil)
router.patch('/:id/status', requireAuth, requireRole(['fiscal', 'engenheiro']), relatoriosController.atualizarStatusFiscal);

module.exports = router;
