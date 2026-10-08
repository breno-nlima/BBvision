/**
 * BBVision - Middleware Global de Tratamento de Erros
 * Padroniza respostas de falhas com formato JSON consistente
 */

function errorHandler(err, req, res, next) {
  console.error(`[BBVision Erro API] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const mensagem = err.message || 'Erro interno no servidor.';

  res.status(statusCode).json({
    erro: mensagem,
    codigo: err.code || 'ERRO_INTERNO',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = errorHandler;
