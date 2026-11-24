/**
 * BBVision - Utilitários de Formatação, Segurança DOM (Anti-XSS), Clipboard e Criptografia Web
 */

export function escapeHtml(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const NEUTRAL_PHOTO_PLACEHOLDER =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">' +
      '<rect width="480" height="300" fill="#F1F5F9"/>' +
      '<rect x="16" y="16" width="448" height="268" rx="12" fill="none" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 6"/>' +
      '<g fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(216 112)">' +
        '<path d="M4 12C4 9.8 5.8 8 8 8h4l3-4h18l3 4h4c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4V12z"/>' +
        '<circle cx="24" cy="22" r="7"/>' +
      '</g>' +
      '<text x="240" y="182" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="600" fill="#475569">Sem evidência fotográfica registrada</text>' +
    '</svg>'
  );

export function normalizeImageSrc(raw, fallback = NEUTRAL_PHOTO_PLACEHOLDER) {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  ) {
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

export async function computeSha256FromDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
      const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
      const binaryStr = atob(b64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(hashBuffer), b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_) {
    // Fallback em contextos sem crypto.subtle (HTTP não-localhost)
  }
  return '';
}

export async function copyToClipboard(text) {
  const str = String(text ?? '');
  if (!str) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch (_) {}
  try {
    const textarea = document.createElement('textarea');
    textarea.value = str;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (_) {
    return false;
  }
}
