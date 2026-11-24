/**
 * BBVision - Controller de Autenticação, Perfil e Gestão de Contas
 * Utiliza bcrypt assíncrono, validação estrita de entrada e tokens JWT.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataStore = require('../repositories/dataStore');
const { JWT_SECRET } = require('../middlewares/authMiddleware');
const { isValidEmail, sanitizeString } = require('../utils/securityUtils');

function buildSafeUser(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    cargo: user.cargo,
    empresa: user.empresa || '',
    registro_profissional: user.registro_profissional || '',
    telefone: user.telefone || '',
    created_at: user.created_at || null,
  };
}

const authController = {
  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, senha } = req.body || {};

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

      const user = await dataStore.findUserByEmailAsync(email);
      if (!user) {
        return res.status(401).json({
          status: 401,
          erro: 'Credenciais inválidas.',
        });
      }

      const senhaValida = await bcrypt.compare(String(senha), user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({
          status: 401,
          erro: 'Credenciais inválidas.',
        });
      }

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
        usuario: buildSafeUser(user),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { nome, email, senha, cargo, registro_profissional, empresa, telefone } = req.body || {};

      if (!nome || !email || !senha || !cargo) {
        return res.status(400).json({
          status: 400,
          erro: 'Nome, e-mail, senha e tipo de perfil (cargo) são obrigatórios.',
        });
      }

      const nomeLimpo = sanitizeString(String(nome)).slice(0, 160);
      if (nomeLimpo.length < 2) {
        return res.status(400).json({
          status: 400,
          erro: 'Informe seu nome completo (mínimo 2 caracteres).',
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: 400,
          erro: 'E-mail em formato inválido.',
        });
      }

      if (typeof senha !== 'string' || senha.length < 6 || senha.length > 128) {
        return res.status(400).json({
          status: 400,
          erro: 'A senha de acesso deve possuir entre 6 e 128 caracteres.',
        });
      }

      const cargoStr = String(cargo).trim().toLowerCase();
      if (!['empreiteira', 'fiscal'].includes(cargoStr)) {
        return res.status(400).json({
          status: 400,
          erro: 'Cargo inválido. Selecione "empreiteira" ou "fiscal".',
        });
      }

      const novoUsuario = await dataStore.createUserAsync({
        nome: nomeLimpo,
        email: String(email).trim().toLowerCase(),
        senha,
        cargo: cargoStr,
        registro_profissional: sanitizeString(registro_profissional || '').slice(0, 100),
        empresa: sanitizeString(empresa || '').slice(0, 160),
        telefone: sanitizeString(telefone || '').slice(0, 40),
      });

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
        usuario: buildSafeUser(novoUsuario),
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
   */
  async me(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 401, erro: 'Não autenticado.' });
      }
      return res.status(200).json({
        usuario: buildSafeUser(req.user),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/auth/me
   * Atualiza os dados cadastrais do usuário autenticado
   */
  async atualizarPerfil(req, res, next) {
    try {
      const { nome, empresa, registro_profissional, telefone } = req.body || {};
      const updates = {};

      if (nome !== undefined) {
        const nomeLimpo = sanitizeString(String(nome)).slice(0, 160);
        if (nomeLimpo.length < 2) {
          return res.status(400).json({ status: 400, erro: 'Nome deve possuir ao menos 2 caracteres.' });
        }
        updates.nome = nomeLimpo;
      }
      if (empresa !== undefined) updates.empresa = sanitizeString(String(empresa)).slice(0, 160);
      if (registro_profissional !== undefined) updates.registro_profissional = sanitizeString(String(registro_profissional)).slice(0, 100);
      if (telefone !== undefined) updates.telefone = sanitizeString(String(telefone)).slice(0, 40);

      const atualizado = await dataStore.updateUserAsync(req.user.id, updates);
      if (!atualizado) {
        return res.status(404).json({ status: 404, erro: 'Usuário não encontrado.' });
      }

      return res.status(200).json({
        mensagem: 'Perfil atualizado com sucesso.',
        usuario: buildSafeUser(atualizado),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/auth/senha
   * Altera a senha de acesso mediante verificação da senha atual
   */
  async alterarSenha(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body || {};
      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          status: 400,
          erro: 'Informe a senha atual e a nova senha.',
        });
      }

      if (typeof novaSenha !== 'string' || novaSenha.length < 6 || novaSenha.length > 128) {
        return res.status(400).json({
          status: 400,
          erro: 'A nova senha deve possuir entre 6 e 128 caracteres.',
        });
      }

      const userFull = await dataStore.findUserByIdAsync(req.user.id);
      if (!userFull) {
        return res.status(404).json({ status: 404, erro: 'Usuário não encontrado.' });
      }

      const atualValida = await bcrypt.compare(String(senhaAtual), userFull.senha_hash);
      if (!atualValida) {
        return res.status(401).json({
          status: 401,
          erro: 'A senha atual informada está incorreta.',
        });
      }

      const novoHash = await bcrypt.hash(novaSenha, 10);
      await dataStore.updateUserAsync(req.user.id, { senha_hash: novoHash });

      return res.status(200).json({
        sucesso: true,
        mensagem: 'Senha de acesso alterada com sucesso.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/empreiteiras
   * Lista empreiteiras reais cadastradas para atribuição em obras (exclusivo Fiscal)
   */
  async listarEmpreiteiras(req, res, next) {
    try {
      const empreiteiras = await dataStore.listUsersByCargoAsync('empreiteira');
      return res.status(200).json(empreiteiras.map(buildSafeUser));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Sessão encerrada com sucesso no sistema BBVision.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
