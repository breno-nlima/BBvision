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
const { router: agentRoutes, wantsMarkdown } = require('./routes/agentRoutes');
const { renderNotFoundPage } = require('./services/agentContentService');
const errorHandler = require('./middlewares/errorHandler');
const securityHeaders = require('./middlewares/securityHeaders');
const requestLogger = require('./middlewares/requestLogger');
const { generalLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Confia no primeiro proxy reverso (Hostinger / Nginx / Cloudflare) para IP real e HTTPS
app.set('trust proxy', 1);

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Link', 'X-Markdown-Tokens', 'Content-Signal', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Retry-After'],
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

// 7. Rotas Agent-Ready, Descoberta e Páginas Institucionais (robots.txt, sitemap.xml, llms.txt,
//    /.well-known/mcp/server-card.json, Accept: text/markdown, RFC 8288 Link headers, /about, /contact, /terms, /privacy, /validador)
app.use(agentRoutes);

// 8. Servir Arquivos Estáticos do Frontend (index: false para que "/" passe pela negociação de conteúdo e Link headers)
const frontendPath = path.resolve(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

// 9. Rota de Informações da API
app.get('/api-info', (req, res) => {
  res.json({
    projeto: 'BBVision',
    descricao: 'API Backend de Fiscalização Remota de Obras (Banco do Brasil / TakeOff)',
    versao: '1.2.0',
    endpoints: {
      auth: '/api/auth/login',
      obras: '/api/obras',
      relatorios: '/api/relatorios',
      fotos: '/api/fotos/avaliar',
      validador: '/api/validador/:codigoOuHash',
      mcp: '/api/mcp',
      mcpServerCard: '/.well-known/mcp/server-card.json',
      llmsTxt: '/llms.txt',
      sitemap: '/sitemap.xml',
      health: '/api/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// 10. Roteamento da API com Rate Limiter Geral
app.use('/api', generalLimiter, apiRoutes);

// 11. Tratamento de rotas /api inexistentes (404 JSON)
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 404,
    erro: `Endpoint da API não encontrado: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// 12. Tratamento real de HTTP 404 para páginas e recursos inexistentes (sem soft-404 HTTP 200)
app.use((req, res) => {
  if (wantsMarkdown(req)) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.status(404).send(`# 404 — Página não encontrada\n\nO recurso \`${req.originalUrl}\` não existe no BBVision.\n\n- [Página Inicial](/)\n- [Validador Público](/validador)\n- [Sobre](/about)\n- [Contato](/contact)\n- [Termos de Uso](/terms)\n- [LLMs Guide](/llms.txt)\n`);
  }

  const accept = (req.headers.accept || '').toLowerCase();
  if (accept.includes('application/json') && !accept.includes('text/html')) {
    return res.status(404).json({
      status: 404,
      erro: `Recurso não encontrado: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString(),
    });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  return res.status(404).send(renderNotFoundPage(req.originalUrl));
});

// 13. Middleware Central de Tratamento de Erros
app.use(errorHandler);

module.exports = app;
