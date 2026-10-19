/**
 * BBVision - Middleware de Auditoria e Log Estruturado de Requisições
 * Registra método, endpoint, status HTTP, tempo de resposta em ms e IP de origem
 * Garante rastreabilidade em conformidade com as diretrizes do Banco do Brasil
 */

function requestLogger(req, res, next) {
  const start = Date.now();
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const timestamp = new Date().toISOString();

    // Silencia arquivos estáticos comuns para não poluir os logs
    if (req.originalUrl.startsWith('/uploads/') || req.originalUrl.includes('.js') || req.originalUrl.includes('.css')) {
      return;
    }

    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] ${color}${req.method} ${req.originalUrl} - ${status}${reset} (${duration}ms) - IP: ${clientIp}`
    );
  });

  next();
}

module.exports = requestLogger;
