/**
 * BBVision - Aplicação Principal Express (Backend Corporativo)
 * Configuração de segurança, middlewares, roteamento e suporte a SPA
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const securityHeaders = require('./middlewares/securityHeaders');
const requestLogger = require('./middlewares/requestLogger');
const { generalLimiter } = require('./middlewares/rateLimiter');

const app = express();

// 1. Compressão HTTP (Gzip / Deflate) para máxima escalabilidade e economia de banda
app.use(compression({
  threshold: 1024, // Comprime respostas maiores que 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// 2. Headers de Segurança HTTP (Defense-in-Depth, CSP, HSTS, X-Frame)
app.use(securityHeaders);

// 3. Logger Estruturado de Requisições
app.use(requestLogger);

// 4. CORS Flexível e Seguro
const allowedOriginEnv = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: allowedOriginEnv === '*' ? '*' : allowedOriginEnv.split(',').map(s => s.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
};
app.use(cors(corsOptions));

// 5. Parser de Requisições com limites seguros
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 6. Servir Arquivos de Uploads com cache imutável (fotos com SHA-256 nunca mudam)
const uploadsPath = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '365d',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

// 7. Servir Frontend Estático com ETag e cache inteligente
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
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
