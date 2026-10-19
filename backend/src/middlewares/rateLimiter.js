/**
 * BBVision - Middleware de Rate Limiting
 * Proteção contra força bruta em logins e consumo excessivo de cota da API Gemini
 * Implementado com sliding window em memória e autolimpeza para escalabilidade
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60 * 1000; // 1 minuto
    this.max = options.max || 100; // Requisições máximas por janela
    this.message = options.message || 'Muitas requisições. Por favor, tente novamente em instantes.';
    this.hits = new Map();

    // Limpeza periódica de memória a cada 2 minutos
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.hits.entries()) {
        if (now > record.resetTime) {
          this.hits.delete(key);
        }
      }
    }, 2 * 60 * 1000);

    // Desconecta timer do event loop para não travar o processo em shutdown/testes
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  middleware() {
    return (req, res, next) => {
      // Identificador por IP do cliente (considerando proxies se houver)
      const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
      const key = `${ip}:${req.baseUrl || req.path}`;
      const now = Date.now();

      let record = this.hits.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.hits.set(key, record);
      } else {
        record.count++;
      }

      const remaining = Math.max(0, this.max - record.count);
      const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', this.max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetSeconds);

      if (record.count > this.max) {
        res.setHeader('Retry-After', resetSeconds);
        return res.status(429).json({
          status: 429,
          erro: this.message,
          retryAfterSegundos: resetSeconds,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    };
  }
}

// Limitador estrito para login/registro (15 tentativas por minuto por IP)
const authLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Limite de tentativas de autenticação excedido. Aguarde 1 minuto antes de tentar novamente.',
}).middleware();

// Limitador para IA e Uploads (30 chamadas por minuto por IP para proteção de cota Gemini)
const aiLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Limite de processamento de IA/Uploads atingido. Aguarde alguns instantes.',
}).middleware();

// Limitador geral da API (300 requisições por minuto por IP)
const generalLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  message: 'Limite de requisições à API excedido.',
}).middleware();

module.exports = {
  RateLimiter,
  authLimiter,
  aiLimiter,
  generalLimiter,
};
