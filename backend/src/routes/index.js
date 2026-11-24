/**
 * BBVision - Roteador Central da API Backend
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const obrasRoutes = require('./obrasRoutes');
const relatoriosRoutes = require('./relatoriosRoutes');
const fotosRoutes = require('./fotosRoutes');
const mcpRoutes = require('./mcpRoutes');
const dataStore = require('../repositories/dataStore');
const { validatorLimiter } = require('../middlewares/rateLimiter');

// Rotas de domínio
router.use('/auth', authRoutes);
router.use('/obras', obrasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/fotos', fotosRoutes);
router.use('/ia', fotosRoutes);
router.use('/mcp', mcpRoutes);

// Validador público de autenticidade (Código Único de 16 caracteres ou Hash SHA-256 de 64 caracteres)
router.get('/validador/:codigoOuHash', validatorLimiter, async (req, res, next) => {
  try {
    const { codigoOuHash } = req.params;
    const termo = (codigoOuHash || '').trim().toUpperCase();

    if (!termo || !/^[a-zA-Z0-9_-]{1,64}$/.test(termo)) {
      return res.status(400).json({
        autentico: false,
        mensagem: 'Código único ou hash SHA-256 deve ser fornecido em formato alfanumérico válido (até 64 caracteres).',
      });
    }

    const relatorio = await dataStore.findRelatorioByCodigoOuHashAsync(termo);

    if (!relatorio || relatorio.status === 'EM_ANDAMENTO') {
      return res.status(404).json({
        autentico: false,
        mensagem: 'Documento não localizado no acervo oficial de vistorias.',
        termoPesquisado: termo,
      });
    }

    // Remove assinatura bruta do retorno JSON público para preservar privacidade (fica selada no PDF oficial)
    const { assinatura_base64, ...relatorioPublico } = relatorio;

    return res.status(200).json({
      autentico: true,
      mensagem: 'Documento de vistoria atestado como autêntico e íntegro.',
      relatorio: relatorioPublico,
    });
  } catch (err) {
    next(err);
  }
});

// Health check detalhado
router.get('/health', (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: 'online',
    sistema: 'BBVision Backend',
    versao: '1.2.0',
    ambiente: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptimeSegundos: Math.round(process.uptime()),
    memoria: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
    },
    bancoDados: dataStore.getStorageModeLabel(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness check
router.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
