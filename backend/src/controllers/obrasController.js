/**
 * BBVision - Controller de Obras
 * Em conformidade com a Seção 8.2 do Documento de Entrega TakeOff
 */
const mockData = require('../mockData');
const { supabase, isConfigured } = require('../config/supabase');

const obrasController = {
  /**
   * GET /api/obras
   * Headers: Authorization: Bearer <token>
   * Retorno (200): [ { id, nome, endereco, responsavel, status } ]
   */
  async listar(req, res, next) {
    try {
      if (isConfigured && supabase) {
        const { data, error } = await supabase.from('obras').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return res.status(200).json(data);
        }
      }

      const obras = mockData.listObras();
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
      const obra = mockData.findObraById(id);

      if (!obra) {
        return res.status(404).json({ erro: 'Obra não encontrada.' });
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
   * Cadastra uma nova obra para fiscalização remota
   */
  async criar(req, res, next) {
    try {
      const { nome, endereco, responsavel, status } = req.body;

      if (!nome || !endereco) {
        return res.status(400).json({ erro: 'Nome e endereço são obrigatórios para cadastrar uma obra.' });
      }

      const novaObra = mockData.createObra({
        nome,
        endereco,
        responsavel: responsavel || (req.user && req.user.nome) || 'Responsável Técnico',
        status: status || 'REGULAR',
      });

      return res.status(201).json({
        mensagem: 'Obra cadastrada com sucesso.',
        obra: novaObra,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = obrasController;
