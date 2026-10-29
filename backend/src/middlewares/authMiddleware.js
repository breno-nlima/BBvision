/**
 * BBVision - Middleware de Autenticação JWT e RBAC (Role-Based Access Control)
 * Gerencia acessos das personas Rodrigo (empreiteira) e Mariana (fiscal/engenheira)
 * Em conformidade com o Documento de Entrega Oficial TakeOff (Seção 8.1 e 8.5)
 */

const jwt = require('jsonwebtoken');
const mockData = require('../mockData');

const JWT_SECRET = process.env.JWT_SECRET || 'bbvision_takeoff_secret_key_2026_jwt_token_bancodobrasil';

if (process.env.NODE_ENV === 'production' && JWT_SECRET.includes('bbvision_takeoff_secret_key_2026')) {
  console.warn('[ALERTA DE SEGURANÇA] JWT_SECRET padrão está sendo utilizado em ambiente de produção. Configure uma chave segura no .env.');
}

/**
 * Middleware para exigir usuário autenticado via Bearer Token
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      erro: 'Acesso não autorizado. Token Bearer não fornecido no cabeçalho Authorization.',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    return res.status(401).json({
      status: 401,
      erro: 'Token de autenticação ausente ou em formato inválido.',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await mockData.findUserByIdAsync ? await mockData.findUserByIdAsync(decoded.id) : mockData.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 401,
        erro: 'Sessão expirada ou usuário associado ao token não existe no sistema.',
        timestamp: new Date().toISOString(),
      });
    }

    // Remove campos sensíveis antes de injetar em req.user
    const { senha_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      status: 401,
      erro: isExpired ? 'Token expirado. Por favor, efetue login novamente.' : 'Token inválido ou corrompido.',
      detalhe: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Middleware opcional de autenticação:
 * - Se fornecer Bearer token, valida obrigatoriamente.
 * - Se não fornecer token, injeta o usuário padrão Rodrigo (empreiteira) para facilitar testes locais.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }

  // Em ambiente de produção, sem token não há injeção de usuário simulado
  if (process.env.NODE_ENV === 'production') {
    req.user = null;
    return next();
  }

  // Fallback dev/sandbox para facilidade de testes locais
  req.user = {
    id: '11111111-1111-4111-8111-111111111111',
    nome: 'Rodrigo Silva (Empreiteira)',
    email: 'rodrigo@empreiteira.com',
    cargo: 'empreiteira',
    empresa: 'Silva Engenharia & Reformas',
    registro_profissional: 'CREA-SP 987654/D',
  };
  next();
}

/**
 * Middleware de restrição de acesso por papéis (RBAC)
 * @param {string[]} rolesPermitidos Ex: ['fiscal', 'engenheiro']
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
        erro: `Acesso negado. Ação restrita a usuários com perfil: [${rolesPermitidos.join(', ')}]. Seu perfil atual é: "${req.user.cargo}".`,
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
