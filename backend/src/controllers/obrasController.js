/**
 * BBVision - Controller de Obras e Unidades do Banco do Brasil
 * Em estrita conformidade com a Seção 8.2 do Documento de Entrega TakeOff
 */

const mockData = require('../mockData');
const { sanitizeString } = require('../utils/securityUtils');

const obrasController = {
  /**
   * GET /api/obras
   * Headers: Authorization: Bearer <token> (ou opcional dev)
   * Retorno (200): [ { id, nome, endereco, responsavel, status, ... } ]
   */
  async listar(req, res, next) {
    try {
      const obras = await mockData.listObrasAsync();
      return res.status(200).json(obras);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/obras/:id
   * Retorna os detalhes da obra e o histórico de vistorias associadas
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

      // Busca relatórios vinculados a esta obra
      const relatorios = mockData.listRelatorios({ obra_id: id });

      return res.status(200).json({
        ...obra,
        relatorios,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/obras
   * Cadastra uma nova obra ou agência para fiscalização remota
   */
  async criar(req, res, next) {
    try {
      const { nome, endereco, responsavel, status, tipo } = req.body;

      if (!nome || !endereco) {
        return res.status(400).json({
          status: 400,
          erro: 'Nome e endereço completo da unidade são obrigatórios.',
        });
      }

      const novaObra = await mockData.createObraAsync({
        nome: sanitizeString(nome),
        endereco: sanitizeString(endereco),
        responsavel: sanitizeString(responsavel || (req.user && req.user.nome) || 'Rodrigo Silva'),
        status: status === 'PENDENTE_AJUSTE' ? 'PENDENTE_AJUSTE' : 'REGULAR',
        tipo: sanitizeString(tipo || 'Reforma e Adequação'),
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
