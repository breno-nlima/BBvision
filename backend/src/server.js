/**
 * BBVision - Servidor HTTP da API Backend
 * Inicialização com tolerância inteligente a portas ocupadas e Graceful Shutdown
 */

const http = require('http');
const os = require('os');
const app = require('./app');

let INITIAL_PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PORT_RETRIES = 10;
let currentRetry = 0;

const server = http.createServer(app);

function getNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function startServer(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    const netIp = getNetworkIp();
    console.log(`\n======================================================`);
    console.log(`  BBVision Servidor Completo (API + Frontend) Online!`);
    console.log(`  - Local (Computador): http://localhost:${portToTry}`);
    console.log(`  - Rede Local (Celular): http://${netIp}:${portToTry}`);
    console.log(`  - Healthcheck API:    http://${netIp}:${portToTry}/api/health`);
    console.log(`  - Validador Público:  http://${netIp}:${portToTry}/api/validador/:codigo`);
    console.log(`======================================================\n`);
  });

  // Usa .once para evitar acumulação de event listeners em caso de múltiplas portas ocupadas
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      currentRetry++;
      if (currentRetry <= MAX_PORT_RETRIES) {
        console.warn(`[BBVision Backend] Porta ${portToTry} ocupada. Tentando porta ${portToTry + 1} (tentativa ${currentRetry}/${MAX_PORT_RETRIES})...`);
        startServer(portToTry + 1);
      } else {
        console.error(`[BBVision Backend Erro Fatal] Limite de tentativas de portas atingido (${MAX_PORT_RETRIES}). Libere uma porta e reinicie.`);
        process.exit(1);
      }
    } else {
      console.error('[BBVision Backend Erro Fatal]:', err);
      process.exit(1);
    }
  });
}

// ----------------------------------------------------------------------------
// GRACEFUL SHUTDOWN (Encerramento Gracioso em Hostinger / Docker / PM2)
// ----------------------------------------------------------------------------
function handleShutdown(signal) {
  console.log(`\n[BBVision Backend] Recebido sinal ${signal}. Iniciando Graceful Shutdown...`);
  server.close(() => {
    console.log('[BBVision Backend] Todas as conexões ativas foram finalizadas. Servidor desligado com segurança.');
    process.exit(0);
  });

  // Força encerramento se travar por mais de 5 segundos
  setTimeout(() => {
    console.error('[BBVision Backend] Encerramento forçado por timeout de shutdown.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Captura de exceções globais para evitar crashes silenciosos
process.on('unhandledRejection', (reason, promise) => {
  console.error('[BBVision Backend] Rejeição de Promise não tratada:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[BBVision Backend] Exceção não capturada:', err);
});

startServer(INITIAL_PORT);

module.exports = server;
