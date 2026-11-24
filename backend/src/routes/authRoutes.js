/**
 * BBVision - Rotas de Autenticação Corporativa e Perfil
 * Inclui proteção por Rate Limiting contra força bruta e RBAC
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

// Login e Registro protegidos por limitador de taxa
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);

// Perfil autenticado e troca de senha
router.get('/me', requireAuth, authController.me);
router.patch('/me', requireAuth, authController.atualizarPerfil);
router.patch('/senha', requireAuth, authLimiter, authController.alterarSenha);

// Listagem de empreiteiras cadastradas para vinculação em obras (exclusivo Fiscal)
router.get('/empreiteiras', requireAuth, requireRole(['fiscal', 'engenheiro', 'admin']), authController.listarEmpreiteiras);

// Encerramento de sessão
router.post('/logout', authController.logout);

module.exports = router;
