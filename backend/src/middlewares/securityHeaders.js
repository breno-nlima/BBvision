/**
 * BBVision - Headers de Segurança HTTP Corporativa
 * Aplica boas práticas de proteção contra ataques web comuns (OWASP Top 10)
 */

function securityHeaders(req, res, next) {
  // Impede interpretação incorreta do MIME type pelo navegador
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Protege contra Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Ativa filtro XSS legado de navegadores compatíveis
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Política de Referrer estrita
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remove identificador do Express
  res.removeHeader('X-Powered-By');

  // Política de permissões: permite câmera para o app BBVision
  res.setHeader('Permissions-Policy', 'camera=(self)');

  next();
}

module.exports = securityHeaders;
