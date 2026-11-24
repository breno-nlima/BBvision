/**
 * BBVision - Middleware de Autenticação JWT e RBAC (Role-Based Access Control)
 * Gerencia acessos autenticados para Empreiteiras e Fiscais de Obra sem contas fictícias.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const dataStore = require('../repositories/dataStore');

const rawSecret = (process.env.JWT_SECRET || '').trim();
const isWeakSecret =
  !rawSecret ||
  rawSecret.length < 16 ||
  rawSecret.includes('sua-chave-') ||
  rawSecret.includes('substitua-por-');

const JWT_SECRET = isWeakSecret
  ? (process.env.NODE_ENV === 'production'
      ? crypto.randomBytes(48).toString('hex')
      : crypto.createHash('sha256').update(`bbvision-dev-${process.cwd()}`).digest('hex'))
  : rawSecret;

if (isWeakSecret && process.env.NODE_ENV === 'production') {
  console.warn('[ALERTA DE SEGURANÇA] JWT_SECRET não definido no .env em produção. Uma chave aleatória efêmera foi gerada para esta instância. Configure JWT_SECRET (>=32 chars) no .env para manter sessões entre reinicializações.');
}

/**
 * Extrai token Bearer do cabeçalho Authorization ou (opcionalmente) da query string ?token=
 * (usado exclusivamente para abertura de PDF em iframe/nova aba quando o relatório ainda não é público).
 */
function extractToken(req, allowQuery = false) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]?.trim() || null;
  }
  if (allowQuery && req.query && typeof req.query.token === 'string' && req.query.token.trim()) {
    return req.query.token.trim();
  }
  return null;
}

/**
 * Middleware obrigatório de autenticação via Bearer Token JWT
 */
async function requireAuth(req, res, next) {
  const token = extractToken(req, false);

  if (!token) {
    return res.status(401).json({
      status: 401,
      erro: 'Acesso não autorizado. Efetue login para obter um token de autenticação.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dataStore.findUserByIdAsync(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 401,
        erro: 'Sessão expirada ou usuário não localizado no sistema.',
        timestamp: new Date().toISOString(),
      });
    }

    const { senha_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      status: 401,
      erro: isExpired ? 'Sessão expirada. Por favor, efetue login novamente.' : 'Token de autenticação inválido ou corrompido.',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Middleware opcional de autenticação (sem injeção de usuário simulado).
 * Se houver Bearer token ou ?token= (para rotas que permitem), valida e popula req.user;
 * caso contrário, segue com req.user = null.
 */
async function optionalAuth(req, res, next) {
  const token = extractToken(req, true);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dataStore.findUserByIdAsync(decoded.id);
    if (user) {
      const { senha_hash, ...safeUser } = user;
      req.user = safeUser;
    } else {
      req.user = null;
    }
  } catch (_) {
    req.user = null;
  }
  return next();
}

/**
 * Middleware de restrição de acesso por papéis (RBAC)
 * @param {string[]} rolesPermitidos Ex: ['fiscal', 'engenheiro', 'admin']
 */
function requireRole(rolesPermitidos = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        erro: 'Autenticação necessária para acessar esta funcionalidade.',
        timestamp: new Date().toISOString(),
      });
    }

    const userCargo = (req.user.cargo || '').toLowerCase();
    const permitido = rolesPermitidos.some(role => role.toLowerCase() === userCargo);

    if (!permitido) {
      return res.status(403).json({
        status: 403,
        erro: `Acesso negado. Operação restrita a perfis autorizados (${rolesPermitidos.join(', ')}).`,
        timestamp: new Date().toISOString(),
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
