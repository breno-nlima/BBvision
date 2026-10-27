/**
 * BBVision - Rotas de Autenticação Corporativa
 * Inclui proteção por Rate Limiting contra ataques de força bruta
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

// Login e Registro protegidos por limitador de taxa
router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);

// Consulta de perfil autenticado
router.get('/me', requireAuth, authController.me);

// Encerramento de sessão
router.post('/logout', authController.logout);

module.exports = router;
