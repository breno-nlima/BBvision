/**
 * BBVision - Controller de Obras e Unidades
 * Implementa cardinalidades 1:N, RBAC estrito e persistência desacoplada.
 */

const dataStore = require('../repositories/dataStore');
const { sanitizeString } = require('../utils/securityUtils');

const CARGOS_FISCAL = ['fiscal', 'engenheiro', 'admin'];
const STATUS_OBRA_VALIDOS = ['REGULAR', 'EM_ANDAMENTO', 'PENDENTE_AJUSTE', 'CONCLUIDO'];

function isFiscalRole(user) {
  return Boolean(user && CARGOS_FISCAL.includes(String(user.cargo || '').toLowerCase()));
}

const obrasController = {
  /**
   * GET /api/obras
   * Empreiteiras visualizam exclusivamente as obras vinculadas à sua conta.
   * Fiscais visualizam todas as obras cadastradas (com filtros opcionais).
   */
  async listar(req, res, next) {
    try {
      const { empreiteira_id, fiscal_id, fiscal_responsavel_id, cadastrado_por_fiscal_id, minhas } = req.query;

      const filtros = {};
      if (!isFiscalRole(req.user)) {
        // Isolamento rigoroso: empreiteira só enxerga obras atribuídas a ela
        filtros.empreiteira_id = req.user.id;
      } else {
        if (empreiteira_id) filtros.empreiteira_id = empreiteira_id;
        if (fiscal_id || fiscal_responsavel_id) filtros.fiscal_responsavel_id = fiscal_id || fiscal_responsavel_id;
        if (cadastrado_por_fiscal_id) filtros.cadastrado_por_fiscal_id = cadastrado_por_fiscal_id;
        if (minhas === 'true') {
          filtros.fiscal_responsavel_id = req.user.id;
        }
      }

      const obras = await dataStore.listObrasAsync(filtros);
      return res.status(200).json(obras);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/obras/:id
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const obra = await dataStore.findObraByIdAsync(id);

      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra não encontrada no cadastro.',
        });
      }

      // Controle de acesso IDOR: empreiteira só acessa obras vinculadas a ela
      if (!isFiscalRole(req.user) && obra.empreiteira_id !== req.user.id) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. Esta obra não está vinculada à sua conta de empreiteira.',
        });
      }

      const [empreiteira, fiscalResponsavel, fiscalCadastrador, relatorios] = await Promise.all([
        obra.empreiteira_id ? dataStore.findUserByIdAsync(obra.empreiteira_id) : Promise.resolve(null),
        obra.fiscal_responsavel_id ? dataStore.findUserByIdAsync(obra.fiscal_responsavel_id) : Promise.resolve(null),
        obra.cadastrado_por_fiscal_id ? dataStore.findUserByIdAsync(obra.cadastrado_por_fiscal_id) : Promise.resolve(null),
        dataStore.listRelatoriosAsync(
          isFiscalRole(req.user) ? { obra_id: id } : { obra_id: id, usuario_id: req.user.id }
        ),
      ]);

      return res.status(200).json({
        ...obra,
        empreiteira: empreiteira
          ? {
              id: empreiteira.id,
              nome: empreiteira.nome,
              email: empreiteira.email,
              empresa: empreiteira.empresa || '',
              registro_profissional: empreiteira.registro_profissional || '',
            }
          : null,
        fiscal_responsavel: fiscalResponsavel
          ? {
              id: fiscalResponsavel.id,
              nome: fiscalResponsavel.nome,
              email: fiscalResponsavel.email,
              empresa: fiscalResponsavel.empresa || '',
              registro_profissional: fiscalResponsavel.registro_profissional || '',
            }
          : null,
        cadastrado_por_fiscal: fiscalCadastrador
          ? {
              id: fiscalCadastrador.id,
              nome: fiscalCadastrador.nome,
            }
          : null,
        relatorios,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/obras
   * Cadastro exclusivo para Fiscais de Obra.
   */
  async criar(req, res, next) {
    try {
      if (!isFiscalRole(req.user)) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. A empreiteira não possui permissão para cadastrar novas obras.',
          timestamp: new Date().toISOString(),
        });
      }

      const { nome, endereco, responsavel, status, tipo, empreiteira_id, fiscal_responsavel_id, checklist_perguntas, perguntasChecklist } = req.body || {};

      const nomeLimpo = sanitizeString(nome || '').slice(0, 200);
      const enderecoLimpo = sanitizeString(endereco || '').slice(0, 400);

      if (!nomeLimpo || !enderecoLimpo) {
        return res.status(400).json({
          status: 400,
          erro: 'Nome e endereço completo da obra/unidade são obrigatórios.',
        });
      }

      let empreiteiraRespId = null;
      let empreiteiraUser = null;
      if (empreiteira_id && String(empreiteira_id).trim()) {
        empreiteiraUser = await dataStore.findUserByIdAsync(String(empreiteira_id).trim());
        if (!empreiteiraUser || empreiteiraUser.cargo !== 'empreiteira') {
          return res.status(400).json({
            status: 400,
            erro: 'A empreiteira selecionada não existe ou não possui perfil de empreiteira.',
          });
        }
        empreiteiraRespId = empreiteiraUser.id;
      }

      const cadastradoPorId = req.user.id;
      const fiscalRespId = fiscal_responsavel_id ? String(fiscal_responsavel_id).trim() : cadastradoPorId;
      const statusNorm = STATUS_OBRA_VALIDOS.includes(String(status || '').toUpperCase())
        ? String(status).toUpperCase()
        : 'REGULAR';

      const perguntasParaSalvar =
        Array.isArray(checklist_perguntas) && checklist_perguntas.length > 0
          ? checklist_perguntas
          : Array.isArray(perguntasChecklist) && perguntasChecklist.length > 0
          ? perguntasChecklist
          : await dataStore.getChecklistTemplateAsync();

      const responsavelLimpo = sanitizeString(
        responsavel || (empreiteiraUser && empreiteiraUser.nome) || 'A definir'
      ).slice(0, 200);

      const novaObra = await dataStore.createObraAsync({
        nome: nomeLimpo,
        endereco: enderecoLimpo,
        responsavel: responsavelLimpo,
        status: statusNorm,
        tipo: sanitizeString(tipo || 'Reforma e Adequação').slice(0, 120),
        empreiteira_id: empreiteiraRespId,
        cadastrado_por_fiscal_id: cadastradoPorId,
        fiscal_responsavel_id: fiscalRespId,
        checklist_perguntas: perguntasParaSalvar,
      });

      return res.status(201).json({
        mensagem: 'Obra cadastrada com sucesso para fiscalização remota.',
        obra: novaObra,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/obras/:id
   * Atualiza dados da obra e vínculo de empreiteira (exclusivo Fiscal)
   */
  async atualizar(req, res, next) {
    try {
      if (!isFiscalRole(req.user)) {
        return res.status(403).json({
          status: 403,
          erro: 'Apenas fiscais de obra têm permissão para editar dados de obras.',
        });
      }

      const { id } = req.params;
      const obraAtual = await dataStore.findObraByIdAsync(id);
      if (!obraAtual) {
        return res.status(404).json({ status: 404, erro: 'Obra não encontrada.' });
      }

      const { nome, endereco, responsavel, status, tipo, empreiteira_id } = req.body || {};
      const updates = {};

      if (nome !== undefined) {
        const n = sanitizeString(nome).slice(0, 200);
        if (!n) return res.status(400).json({ status: 400, erro: 'Nome da obra não pode ficar vazio.' });
        updates.nome = n;
      }
      if (endereco !== undefined) {
        const e = sanitizeString(endereco).slice(0, 400);
        if (!e) return res.status(400).json({ status: 400, erro: 'Endereço da obra não pode ficar vazio.' });
        updates.endereco = e;
      }
      if (tipo !== undefined) updates.tipo = sanitizeString(tipo).slice(0, 120);
      if (responsavel !== undefined) updates.responsavel = sanitizeString(responsavel).slice(0, 200);
      if (status !== undefined) {
        const s = String(status).toUpperCase().trim();
        if (!STATUS_OBRA_VALIDOS.includes(s)) {
          return res.status(400).json({ status: 400, erro: `Status inválido. Aceitos: ${STATUS_OBRA_VALIDOS.join(', ')}.` });
        }
        updates.status = s;
      }
      if (empreiteira_id !== undefined) {
        if (empreiteira_id === null || String(empreiteira_id).trim() === '') {
          updates.empreiteira_id = null;
        } else {
          const empUser = await dataStore.findUserByIdAsync(String(empreiteira_id).trim());
          if (!empUser || empUser.cargo !== 'empreiteira') {
            return res.status(400).json({ status: 400, erro: 'Empreiteira informada não encontrada.' });
          }
          updates.empreiteira_id = empUser.id;
          if (responsavel === undefined && (!obraAtual.responsavel || obraAtual.responsavel === 'A definir')) {
            updates.responsavel = empUser.nome;
          }
        }
      }

      const atualizada = await dataStore.updateObraAsync(id, updates);
      return res.status(200).json({
        mensagem: 'Obra atualizada com sucesso.',
        obra: atualizada,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/obras/:id
   * Remove obra que ainda não possua vistorias/relatórios vinculados (exclusivo Fiscal)
   */
  async excluir(req, res, next) {
    try {
      if (!isFiscalRole(req.user)) {
        return res.status(403).json({
          status: 403,
          erro: 'Apenas fiscais de obra podem excluir obras.',
        });
      }

      const { id } = req.params;
      const existente = await dataStore.findObraByIdAsync(id);
      if (!existente) {
        return res.status(404).json({ status: 404, erro: 'Obra não encontrada.' });
      }

      await dataStore.deleteObraAsync(id);
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Obra excluída com sucesso.',
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ status: err.status, erro: err.message });
      }
      next(err);
    }
  },

  /**
   * GET /api/obras/checklist-template
   */
  async obterTemplateChecklist(req, res, next) {
    try {
      const template = await dataStore.getChecklistTemplateAsync();
      return res.status(200).json(template);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/obras/checklist-template
   */
  async atualizarTemplateChecklist(req, res, next) {
    try {
      if (!isFiscalRole(req.user)) {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso restrito à fiscalização de obras.',
        });
      }

      const { perguntas } = req.body || {};
      if (!Array.isArray(perguntas) || perguntas.length === 0) {
        return res.status(400).json({
          status: 400,
          erro: 'A lista de perguntas do checklist é obrigatória e deve conter ao menos 1 item.',
        });
      }

      const atualizado = await dataStore.updateChecklistTemplateAsync(perguntas);
      return res.status(200).json({
        mensagem: 'Modelo padrão de perguntas do checklist atualizado com sucesso.',
        template: atualizado,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/obras/:id/checklist
   */
  async obterChecklistObra(req, res, next) {
    try {
      const { id } = req.params;
      const obra = await dataStore.findObraByIdAsync(id);
      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra não encontrada para consulta do checklist.',
        });
      }
      if (!isFiscalRole(req.user) && obra.empreiteira_id !== req.user.id) {
        return res.status(403).json({ status: 403, erro: 'Acesso negado a esta obra.' });
      }
      const perguntas = await dataStore.getChecklistObraAsync(id);
      return res.status(200).json(perguntas);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/obras/:id/checklist
   */
  async atualizarChecklistObra(req, res, next) {
    try {
      if (!isFiscalRole(req.user)) {
        return res.status(403).json({
          status: 403,
          erro: 'Apenas fiscais de obra têm permissão para editar as perguntas do checklist.',
        });
      }

      const { id } = req.params;
      const { perguntas } = req.body || {};

      if (!Array.isArray(perguntas) || perguntas.length === 0) {
        return res.status(400).json({
          status: 400,
          erro: 'Lista de perguntas inválida.',
        });
      }

      const perguntasAtualizadas = await dataStore.updateChecklistObraAsync(id, perguntas);
      if (!perguntasAtualizadas) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra não localizada.',
        });
      }

      return res.status(200).json({
        mensagem: 'Perguntas do checklist da obra atualizadas com sucesso.',
        perguntas: perguntasAtualizadas,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = obrasController;
