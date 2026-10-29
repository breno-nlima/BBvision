/**
 * BBVision - Headers de Segurança HTTP Corporativa
 * Aplica boas práticas de proteção contra ataques web comuns (OWASP Top 10)
 */

function securityHeaders(req, res, next) {
  // Impede interpretação incorreta do MIME type pelo navegador (MIME Sniffing)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Protege contra Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Ativa filtro XSS legado de navegadores compatíveis
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Política de Referrer estrita para proteger URLs internas
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove identificador do Express (Security through obscurity)
  res.removeHeader('X-Powered-By');

  // Política de permissões: permite câmera para o app BBVision (in-loco) e desabilita microphone se não necessário
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');

  // Content Security Policy (CSP) robusta e compatível com Google Fonts e Unsplash
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "connect-src 'self' *",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ];
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Strict-Transport-Security para HTTPS / Produção
  if (req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Previne cache em rotas dinâmicas da API (exceto downloads de PDF)
  if (req.path.startsWith('/api') && !req.path.endsWith('/pdf')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
}

module.exports = securityHeaders;
