/**
 * BBVision - Roteador Central da API Backend
 * Roteamento modular, validador público de autenticidade e telemetria de saúde
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const obrasRoutes = require('./obrasRoutes');
const relatoriosRoutes = require('./relatoriosRoutes');
const fotosRoutes = require('./fotosRoutes');
const mockData = require('../mockData');
const { isConfigured } = require('../config/supabase');

// Rotas de domínio
router.use('/auth', authRoutes);
router.use('/obras', obrasRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/fotos', fotosRoutes);
router.use('/ia', fotosRoutes); // Alias para facilidade de integração

// Validador público de autenticidade (Código Único de 16 caracteres ou Hash SHA-256 de 64 caracteres)
router.get('/validador/:codigoOuHash', (req, res) => {
  const { codigoOuHash } = req.params;
  const termo = (codigoOuHash || '').trim().toUpperCase();

  if (!termo) {
    return res.status(400).json({
      autentico: false,
      mensagem: 'Código único ou hash SHA-256 deve ser fornecido para validação.',
    });
  }

  const relatorio = mockData.relatorios.find(r => 
    (r.codigo_unico && r.codigo_unico.toUpperCase() === termo) ||
    (r.hash_integridade && r.hash_integridade.toUpperCase() === termo)
  );

  if (!relatorio) {
    return res.status(404).json({
      autentico: false,
      mensagem: 'Documento não localizado no acervo oficial de vistorias do Banco do Brasil.',
      termoPesquisado: termo,
    });
  }

  return res.status(200).json({
    autentico: true,
    mensagem: 'Documento de vistoria atestado como autêntico e íntegro.',
    relatorio: mockData.formatRelatorio(relatorio),
  });
});

// Health check detalhado para monitoramento em produção e orquestradores
router.get('/health', (req, res) => {
  const memory = process.memoryUsage();
  res.status(200).json({
    status: 'online',
    sistema: 'BBVision Backend (TakeOff)',
    versao: '1.1.0',
    uptimeSegundos: Math.round(process.uptime()),
    memoria: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
    bancoDados: isConfigured ? 'Supabase Conectado' : 'Camada Desacoplada em Memória (Ativa)',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
