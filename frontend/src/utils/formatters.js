/**
 * BBVision - Utilitários de Formatação, Segurança DOM (Anti-XSS) e Criptografia Web
 */

export function escapeHtml(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeImageSrc(raw, fallback = '/uploads/evidencias/seed_fachada_bb.png') {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, '')}`;
}

export function generateSecureHex16() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  let hex = '';
  while (hex.length < 16) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex.slice(0, 16).toUpperCase();
}
