/**
 * BBVision - Middleware Central de Tratamento de Erros
 * Padronização de respostas de erro, tratamento de Multer, JWT e falhas internas
 */

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let mensagem = err.message || 'Ocorreu um erro interno no servidor.';

  // Tratamento específico de erros do Multer
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      mensagem = 'O arquivo enviado excede o limite máximo permitido de 15MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      mensagem = 'Apenas 1 arquivo fotográfico pode ser enviado por requisição.';
    } else {
      mensagem = `Erro no upload de arquivo: ${err.message}`;
    }
  }

  // Tratamento de erro de JSON malformado no body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    mensagem = 'Corpo da requisição (JSON) inválido ou malformado.';
  }

  // Tratamento de erro JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    mensagem = 'Token JWT inválido ou corrompido.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    mensagem = 'Token JWT expirado. Faça login novamente.';
  }

  // Log detalhado de erros 5xx
  if (statusCode >= 500) {
    console.error(`[BBVision Erro 500] ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(statusCode).json({
    status: statusCode,
    erro: mensagem,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
