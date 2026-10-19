/**
 * BBVision - Criptografia e Inviolabilidade Digital
 * Funções utilitárias para geração de hashes, código único e checagem de integridade
 * Em estrita conformidade com o Documento de Entrega Oficial TakeOff (Seção 8.6)
 */

const crypto = require('crypto');

/**
 * Gera código único alfanumérico em uppercase de 16 caracteres hexadecimais
 * Requisito TakeOff Seção 8.6: crypto.randomBytes(8).toString('hex').toUpperCase()
 * @returns {string} 16 caracteres hexadecimais em maiúsculas (ex: "8F4A2C19E70B34DF")
 */
function generateUniqueCode() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/**
 * Valida se um código único segue estritamente o formato de 16 caracteres hexadecimais
 * @param {string} code 
 * @returns {boolean}
 */
function isValidUniqueCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^[0-9A-F]{16}$/i.test(code.trim());
}

/**
 * Calcula o hash SHA-256 de um buffer ou string
 * @param {Buffer|string} data 
 * @returns {string} Hash SHA-256 em hexadecimal minúsculo (64 caracteres)
 */
function generateSha256(data) {
  if (!data) return '';
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Gera o hash de integridade final do relatório
 * @param {string} codigoUnico Código único de 16 caracteres
 * @param {number|string} timestamp Timestamp do momento da finalização
 * @returns {string} Hash SHA-256 de 64 caracteres
 */
function generateReportIntegrityHash(codigoUnico, timestamp = Date.now()) {
  return crypto.createHash('sha256').update(String(codigoUnico) + String(timestamp)).digest('hex');
}

/**
 * Comparação em tempo constante (Timing-safe) para evitar ataques de timing em hashes
 * @param {string} a 
 * @param {string} b 
 * @returns {boolean}
 */
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = {
  generateUniqueCode,
  isValidUniqueCode,
  generateSha256,
  generateReportIntegrityHash,
  timingSafeCompare,
};
