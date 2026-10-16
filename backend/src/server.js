/**
 * BBVision - Servidor HTTP da API Backend
 * Inicialização com tolerância a portas ocupadas
 */

const http = require('http');
const os = require('os');
const app = require('./app');

let PORT = parseInt(process.env.PORT, 10) || 3000;
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
