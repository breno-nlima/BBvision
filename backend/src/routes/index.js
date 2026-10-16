/**
 * BBVision - Roteador Central da API
 * Básico e desacoplado de banco de dados
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const obrasRoutes = require('./obrasRoutes');
const relatoriosRoutes = require('./relatoriosRoutes');
const fotosRoutes = require('./fotosRoutes');
const mockData = require('../mockData');

// Rotas de domínio
router.use('/auth', authRoutes);
router.use('/obras', obrasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/fotos', fotosRoutes);
router.use('/ia', fotosRoutes);

// Validador público simples de autenticidade (código único ou hash)
router.get('/validador/:codigoOuHash', (req, res) => {
  const { codigoOuHash } = req.params;
  const termo = (codigoOuHash || '').trim().toUpperCase();

  const relatorio = mockData.relatorios.find(r => 
    (r.codigo_unico && r.codigo_unico.toUpperCase() === termo) ||
    (r.hash_integridade && r.hash_integridade.toUpperCase() === termo)
  );

  if (!relatorio) {
    return res.status(404).json({
      autentico: false,
      mensagem: 'Documento ou código não encontrado.',
    });
  }

  return res.status(200).json({
    autentico: true,
    relatorio: mockData.formatRelatorio(relatorio),
  });
});

// Health check simples
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    sistema: 'BBVision Backend (Básico)',
    versao: '1.1.0',
    bancoDados: 'Desacoplado (Camada em memória)',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
