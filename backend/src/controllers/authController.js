/**
 * BBVision - Controller de Autenticação Corporativa
 * Em estrita conformidade com a Seção 8.1 do Documento de Entrega TakeOff
 * Utiliza bcrypt não-bloqueante (assíncrono) para máxima escalabilidade e proteção JWT
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockData = require('../mockData');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const { isValidEmail, sanitizeString } = require('../utils/securityUtils');

const authController = {
  /**
   * POST /api/auth/login
   * Body: { email, senha }
   * Retorno (200): { mensagem: "login bem-sucedido", token: "...", usuario: { id, nome, cargo, ... } }
   * Retorno (401): { erro: "Credenciais inválidas" }
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          status: 400,
          erro: 'E-mail e senha são obrigatórios para autenticação no sistema.',
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: 400,
          erro: 'O formato do e-mail informado é inválido.',
        });
      }

      const user = await mockData.findUserByEmailAsync(email);
      if (!user) {
        // Mensagem genérica conforme boas práticas de segurança OWASP
        return res.status(401).json({
          status: 401,
          erro: 'Credenciais inválidas',
        });
      }

      // Validação não-bloqueante com bcrypt (assíncrono)
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({
          status: 401,
          erro: 'Credenciais inválidas',
        });
      }

      // Geração do token JWT oficial de 24 horas
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
          empresa: user.empresa || '',
          registro_profissional: user.registro_profissional || '',
          telefone: user.telefone || '',
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/register
   * Body: { nome, email, senha, cargo, registro_profissional, empresa, telefone }
   * Cria novo usuário (Empreiteira ou Fiscal)
   */
  async register(req, res, next) {
    try {
      const { nome, email, senha, cargo, registro_profissional, empresa, telefone } = req.body;

      if (!nome || !email || !senha || !cargo) {
        return res.status(400).json({
          status: 400,
          erro: 'Nome, e-mail, senha e tipo de perfil (cargo) são obrigatórios.',
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: 400,
          erro: 'E-mail em formato inválido.',
        });
      }

      if (typeof senha !== 'string' || senha.length < 6) {
        return res.status(400).json({
          status: 400,
          erro: 'A senha de acesso deve possuir no mínimo 6 caracteres.',
        });
      }

      const cargoNormalizado = String(cargo).toLowerCase() === 'fiscal' ? 'fiscal' : 'empreiteira';

      const novoUsuario = await mockData.createUserAsync({
        nome: sanitizeString(nome),
        email: email.trim().toLowerCase(),
        senha,
        cargo: cargoNormalizado,
        registro_profissional: sanitizeString(registro_profissional || ''),
        empresa: sanitizeString(empresa || ''),
        telefone: sanitizeString(telefone || ''),
      });

      // Gera token JWT de login imediato
      const payload = {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      return res.status(201).json({
        mensagem: 'Usuário cadastrado com sucesso!',
        token,
        usuario: novoUsuario,
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ status: err.status, erro: err.message });
      }
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
        return res.status(401).json({ status: 401, erro: 'Não autenticado.' });
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
