/**
 * BBVision - Tratamento de Erros Básico
 */

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const mensagem = err.message || 'Erro interno no servidor.';

  if (statusCode >= 500) {
    console.error(`[BBVision Erro] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    status: statusCode,
    erro: mensagem,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
