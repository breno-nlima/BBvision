/**
 * BBVision - Aplicação Básica Express
 * Servidor simplificado para suporte ao frontend e IA Gemini
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Servir arquivos de uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Servir frontend
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));

// Rotas da API
app.use('/api', apiRoutes);

// Informações básicas da API
app.get('/api-info', (req, res) => {
  res.json({
    projeto: 'BBVision',
    descricao: 'API Backend Básica (TakeOff)',
    versao: '1.1.0',
    endpoints: {
      auth: '/api/auth/login',
      obras: '/api/obras',
      relatorios: '/api/relatorios',
      fotos: '/api/fotos/avaliar',
      health: '/api/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// Fallback SPA para o frontend (serve index.html em rotas de tela que não sejam /api ou /uploads)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(frontendPath, 'index.html'));
  }
  next();
});

// Tratamento de erros
app.use(errorHandler);

module.exports = app;

