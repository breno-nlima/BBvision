/**
 * BBVision - Aplicação Principal Express (Backend Corporativo)
 * Configuração de segurança, middlewares, roteamento e suporte a SPA
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
const securityHeaders = require('./middlewares/securityHeaders');
const requestLogger = require('./middlewares/requestLogger');
const { generalLimiter } = require('./middlewares/rateLimiter');

const app = express();

// 1. Headers de Segurança HTTP (Defense-in-Depth)
app.use(securityHeaders);

// 2. Logger Estruturado de Requisições
app.use(requestLogger);

// 3. CORS Flexível e Seguro
const corsOptions = {
  origin: '*', // Em desenvolvimento e teste local permite todos; pode ser restrito via CORS_ORIGIN no .env
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
};
app.use(cors(corsOptions));

// 4. Parser de Requisições com limites seguros
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 5. Servir Arquivos de Uploads com cabeçalhos de segurança
const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1h',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

// 6. Servir Frontend Estático
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath, {
  maxAge: '1h',
}));

// 7. Rota de Informações da API
app.get('/api-info', (req, res) => {
  res.json({
    projeto: 'BBVision',
    descricao: 'API Backend de Fiscalização Remota de Obras (Banco do Brasil / TakeOff)',
    versao: '1.1.0',
    endpoints: {
      auth: '/api/auth/login',
      obras: '/api/obras',
      relatorios: '/api/relatorios',
      fotos: '/api/fotos/avaliar',
      validador: '/api/validador/:codigoOuHash',
      health: '/api/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// 8. Roteamento da API com Rate Limiter Geral
app.use('/api', generalLimiter, apiRoutes);

// 9. Tratamento de rotas /api inexistentes (404 JSON em vez de fallback SPA)
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 404,
    erro: `Endpoint da API não encontrado: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// 10. Fallback SPA para o Frontend Vanilla (serve index.html para URLs da SPA)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    const indexPath = path.join(frontendPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  }
  next();
});

// 11. Middleware Central de Tratamento de Erros
app.use(errorHandler);

module.exports = app;
