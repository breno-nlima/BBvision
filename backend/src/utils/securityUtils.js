/**
 * BBVision - Utilitários de Segurança e Higienização
 * Proteção contra Path Traversal (CWE-22), validação de Magic Bytes e sanitização de dados
 */

const path = require('path');
const fs = require('fs');

/**
 * Valida e resolve com segurança um caminho de arquivo dentro do diretório base permitido.
 * Previne ataques de Path Traversal (ex: ../../windows/system32 ou /etc/passwd).
 * 
 * @param {string} userPath Caminho relativo fornecido pelo usuário/cliente
 * @param {string} allowedBaseDir Diretório base permitido (ex: uploads/evidencias)
 * @returns {string|null} Caminho absoluto seguro ou null se for inválido/traversal
 */
function resolveSafePath(userPath, allowedBaseDir) {
  if (!userPath || typeof userPath !== 'string') return null;

  // Rejeita caracteres nulos (Null Byte Injection)
  if (userPath.includes('\0')) return null;

  // Normaliza o diretório base para caminho absoluto
  const resolvedBase = path.resolve(allowedBaseDir);

  // Normaliza o caminho relativo fornecido
  const resolvedTarget = path.resolve(resolvedBase, userPath);

  // Garante que o caminho de destino inicia estritamente com o diretório base
  if (!resolvedTarget.startsWith(resolvedBase)) {
    console.warn(`[Security Alert] Tentativa de Path Traversal detectada: "${userPath}" fora de "${allowedBaseDir}"`);
    return null;
  }

  return resolvedTarget;
}

/**
 * Valida os Magic Bytes (assinatura binária) de um buffer para confirmar se é uma imagem real.
 * Previne upload de arquivos executáveis, scripts ou vetores maliciosos renomeados como .jpg/.png.
 * 
 * @param {Buffer} buffer Buffer do arquivo
 * @returns {{ valid: boolean, mimeType: string }}
 */
function validateImageMagicBytes(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) {
    return { valid: false, mimeType: 'unknown' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, mimeType: 'image/png' };
  }

  // WEBP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // RIFF
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50   // WEBP
  ) {
    return { valid: true, mimeType: 'image/webp' };
  }

  return { valid: false, mimeType: 'unknown' };
}

/**
 * Sanitiza strings para evitar injeção de HTML/Scripts básicos (XSS)
 * @param {string} str 
 * @returns {string}
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Valida formato de e-mail RFC básico
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

module.exports = {
  resolveSafePath,
  validateImageMagicBytes,
  sanitizeString,
  isValidEmail,
};
