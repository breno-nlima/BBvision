/**
 * BBVision - Controller de Autenticação
 * Em conformidade com a Seção 8.1 do Documento de Entrega TakeOff
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../models/repository');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const authController = {
  /**
   * POST /api/auth/login
   * Body: { email, senha }
   * Retorno (200): { mensagem: "login bem-sucedido", token: "...", usuario: { id, nome, cargo } }
   * Retorno (401): { erro: "Credenciais inválidas" }
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios para autenticação.' });
      }

      const user = await repository.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Validação da senha criptografada via bcrypt
      const senhaValida = bcrypt.compareSync(senha, user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas' });
      }

      // Geração do token JWT oficial
      const payload = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      return res.status(200).json({
        mensagem: 'login bem-sucedido',
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   * Retorna os dados do usuário autenticado a partir do token
   */
  async me(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ erro: 'Não autenticado' });
      }
      return res.status(200).json({
        usuario: req.user,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
