/**
 * BBVision - Aplicação Principal Express
 * Sistema de Monitoramento e Fiscalização Remota de Obras (Banco do Brasil)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente do backend/.env e da raiz se existirem
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ------------------------------------------------------------------------------
// MIDDLEWARES DE SEGURANÇA E PARSING
// ------------------------------------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Suporte a payloads maiores para transferências de imagens base64 da câmera
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Servir arquivos estáticos de uploads (evidências fotográficas e relatórios PDF)
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// ------------------------------------------------------------------------------
// ROTAS DA API
// ------------------------------------------------------------------------------
app.use('/api', apiRoutes);

// Rota raiz de boas-vindas / status
app.get('/', (req, res) => {
  res.json({
    projeto: 'BBVision',
    descricao: 'API Backend de Fiscalização Remota de Obras para o Banco do Brasil',
    versao: '1.0.0',
    documentacao: '/docs/TAKEOFF_DOCUMENTO_ENTREGA.md',
    endpoints: {
      auth: '/api/auth/login',
      obras: '/api/obras',
      relatorios: '/api/relatorios',
      fotos: '/api/fotos/avaliar',
      health: '/api/health',
    },
  });
});

// ------------------------------------------------------------------------------
// TRATAMENTO DE ERROS
// ------------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
