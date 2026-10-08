/**
 * BBVision - Middleware de Autenticação JWT e RBAC (Controle por Perfis)
 * Gerencia acessos das personas Rodrigo (empreiteira) e Mariana (fiscal/engenheira)
 */

const jwt = require('jsonwebtoken');
const repository = require('../models/repository');

const JWT_SECRET = process.env.JWT_SECRET || 'bbvision_takeoff_secret_key_2026_jwt_token_bancodobrasil';

/**
 * Middleware para exigir usuário autenticado via Bearer Token
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Acesso não autorizado. Token Bearer não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await repository.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ erro: 'Usuário associado ao token não encontrado.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.', detalhe: err.message });
  }
}

/**
 * Middleware opcional de autenticação: se tiver token autentica, senão define default dev
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  // Se não fornecido em dev, assume o usuário padrão Rodrigo (empreiteira)
  req.user = {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'Rodrigo Silva',
    email: 'rodrigo@empreiteira.com',
    cargo: 'empreiteira',
  };
  next();
}

/**
 * Middleware para restringir por papéis (cargos)
 * @param {string[]} rolesPermitidos Ex: ['fiscal', 'engenheiro']
 */
function requireRole(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }

    if (!rolesPermitidos.includes(req.user.cargo)) {
      return res.status(403).json({
        erro: `Acesso negado. Esta ação requer permissão de: ${rolesPermitidos.join(', ')}. Seu perfil atual é: ${req.user.cargo}`,
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  JWT_SECRET,
};
