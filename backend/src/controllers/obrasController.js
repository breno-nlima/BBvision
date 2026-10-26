/**
 * BBVision - Controller de Obras e Unidades do Banco do Brasil
 * Em estrita conformidade com a Seção 8.2 do Documento de Entrega TakeOff
 */

const mockData = require('../mockData');
const { sanitizeString } = require('../utils/securityUtils');

const obrasController = {
  /**
   * GET /api/obras
   * Query params opcionais:
   * - empreiteira_id: lista as N obras pertencentes a uma empreiteira
   * - fiscal_id / fiscal_responsavel_id: lista as N obras fiscalizadas por um fiscal
   * - cadastrado_por_fiscal_id: lista as N obras cadastradas por um fiscal
   * - minhas=true: filtra automaticamente conforme o usuário autenticado
   * Retorno (200): [ { id, nome, endereco, responsavel, status, empreiteira_id, ... } ]
   */
  async listar(req, res, next) {
    try {
      const { empreiteira_id, fiscal_id, fiscal_responsavel_id, cadastrado_por_fiscal_id, minhas } = req.query;

      const filtros = {};
      if (empreiteira_id) filtros.empreiteira_id = empreiteira_id;
      if (fiscal_id || fiscal_responsavel_id) filtros.fiscal_responsavel_id = fiscal_id || fiscal_responsavel_id;
      if (cadastrado_por_fiscal_id) filtros.cadastrado_por_fiscal_id = cadastrado_por_fiscal_id;

      if (minhas === 'true' && req.user) {
        if (req.user.cargo === 'empreiteira') {
          filtros.empreiteira_id = req.user.id;
        } else if (req.user.cargo === 'fiscal') {
          filtros.fiscal_responsavel_id = req.user.id;
        }
      }

      const obras = await mockData.listObrasAsync(filtros);
      return res.status(200).json(obras);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/obras/:id
   * Retorna os detalhes da obra com dados da empreiteira, fiscal responsável e histórico de vistorias
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const obra = await mockData.findObraByIdAsync(id);

      if (!obra) {
        return res.status(404).json({
          status: 404,
          erro: 'Obra não encontrada no cadastro.',
        });
      }

      // Detalhes enriquecidos de empreiteira e fiscais associados
      const empreiteira = obra.empreiteira_id ? mockData.findUserById(obra.empreiteira_id) : null;
      const fiscalResponsavel = obra.fiscal_responsavel_id ? mockData.findUserById(obra.fiscal_responsavel_id) : null;
      const fiscalCadastrador = obra.cadastrado_por_fiscal_id ? mockData.findUserById(obra.cadastrado_por_fiscal_id) : null;

      // Busca relatórios vinculados a esta obra
      const relatorios = mockData.listRelatorios({ obra_id: id });

      return res.status(200).json({
        ...obra,
        empreiteira: empreiteira ? {
          id: empreiteira.id,
          nome: empreiteira.nome,
          empresa: empreiteira.empresa,
          registro_profissional: empreiteira.registro_profissional,
        } : null,
        fiscal_responsavel: fiscalResponsavel ? {
          id: fiscalResponsavel.id,
          nome: fiscalResponsavel.nome,
          empresa: fiscalResponsavel.empresa,
          registro_profissional: fiscalResponsavel.registro_profissional,
        } : null,
        cadastrado_por_fiscal: fiscalCadastrador ? {
          id: fiscalCadastrador.id,
          nome: fiscalCadastrador.nome,
        } : null,
        relatorios,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/obras
   * Cadastra uma nova obra ou agência para fiscalização remota (Exclusivo para Fiscais BB)
   * Cardinalidade: 1 Fiscal cadastra N obras, 1 Fiscal fiscaliza N obras, 1 Empreiteira possui N obras
   */
  async criar(req, res, next) {
    try {
      // Bloqueio de autorização RBAC: Empreiteira não tem permissão para adicionar obras
      if (req.user && req.user.cargo === 'empreiteira') {
        return res.status(403).json({
          status: 403,
          erro: 'Acesso negado. A empreiteira não possui permissão para cadastrar novas obras. Operação exclusiva da fiscalização e governança do Banco do Brasil.',
          timestamp: new Date().toISOString(),
        });
      }

      const { nome, endereco, responsavel, status, tipo, empreiteira_id, fiscal_responsavel_id } = req.body;

      if (!nome || !endereco) {
        return res.status(400).json({
          status: 400,
          erro: 'Nome e endereço completo da unidade são obrigatórios.',
        });
      }

      // O fiscal autenticado cadastra a obra (1 fiscal pode cadastrar N obras)
      const cadastradoPorId = req.user ? req.user.id : '22222222-2222-4222-8222-222222222222';

      // Fiscal responsável pela auditoria técnica (1 fiscal pode fiscalizar N obras)
      const fiscalRespId = fiscal_responsavel_id || cadastradoPorId;

      // Empreiteira encarregada da execução da obra (1 empreiteira pode ter N obras)
      const empreiteiraRespId = empreiteira_id || '11111111-1111-4111-8111-111111111111';

      const novaObra = await mockData.createObraAsync({
        nome: sanitizeString(nome),
        endereco: sanitizeString(endereco),
        responsavel: sanitizeString(responsavel || (req.user && req.user.nome) || 'Rodrigo Silva'),
        status: status === 'PENDENTE_AJUSTE' ? 'PENDENTE_AJUSTE' : 'REGULAR',
        tipo: sanitizeString(tipo || 'Reforma e Adequação'),
        empreiteira_id: empreiteiraRespId,
        cadastrado_por_fiscal_id: cadastradoPorId,
        fiscal_responsavel_id: fiscalRespId,
      });

      return res.status(201).json({
        mensagem: 'Obra cadastrada com sucesso para fiscalização remota.',
        obra: novaObra,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = obrasController;
