/**
 * BBVision - Servidor HTTP da API Backend
 * Inicialização com tolerância a portas ocupadas
 */

const http = require('http');
const app = require('./app');

let PORT = parseInt(process.env.PORT, 10) || 3000;
const server = http.createServer(app);

function startServer(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  BBVision Backend API rodando em: http://127.0.0.1:${portToTry}`);
    console.log(`  Documento de Entrega Oficial: TakeOff / Banco do Brasil`);
    console.log(`  Healthcheck: http://127.0.0.1:${portToTry}/api/health`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[BBVision Backend] Porta ${portToTry} ocupada. Tentando porta ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('[BBVision Backend Erro Fatal]:', err);
    }
  });
}

startServer(PORT);
