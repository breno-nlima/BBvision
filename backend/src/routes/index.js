/**
 * BBVision - Roteador Central da API
 * Agrega e expõe todos os módulos de rotas sob o prefixo /api
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const obrasRoutes = require('./obrasRoutes');
const relatoriosRoutes = require('./relatoriosRoutes');
const fotosRoutes = require('./fotosRoutes');

// Rotas principais
router.use('/auth', authRoutes);
router.use('/obras', obrasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/fotos', fotosRoutes);
router.use('/ia', fotosRoutes); // Alias para facilidade de integração

const repository = require('../models/repository');

// Rotas de Checklists Normativos e Modelos Padronizados BB
router.get('/checklists', async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const checklists = await repository.listChecklistsModelo(categoria);
    return res.status(200).json(checklists);
  } catch (err) {
    next(err);
  }
});

// Relatório Gerencial de Governança e Métricas de SLA da IA
router.get('/metricas-ia', async (req, res, next) => {
  try {
    const metricas = await repository.getMetricasIa();
    return res.status(200).json(metricas);
  } catch (err) {
    next(err);
  }
});

// Rota de Health Check e status da API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    sistema: 'BBVision Backend API',
    orgao: 'Banco do Brasil',
    programa: 'Residência TakeOff',
    versao: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
