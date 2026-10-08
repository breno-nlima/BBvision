/**
 * BBVision - Criptografia e Inviolabilidade Digital
 * Funções utilitárias para geração de hashes e código único
 * Em conformidade com o Documento de Entrega Oficial TakeOff (Seção 8.6)
 */

const crypto = require('crypto');

/**
 * Gera código único alfanumérico em uppercase de 16 caracteres hexadecimais
 * Requisito: crypto.randomBytes(8).toString('hex').toUpperCase()
 */
function generateUniqueCode() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

/**
 * Calcula o hash SHA-256 de um buffer ou string
 * @param {Buffer|string} data 
 * @returns {string} Hash SHA-256 em hexadecimal minúsculo (64 caracteres)
 */
function generateSha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Gera o hash de integridade final do relatório
 * @param {string} codigoUnico Código único de 16 caracteres
 * @param {number|string} timestamp Timestamp do momento da finalização
 * @returns {string} Hash SHA-256
 */
function generateReportIntegrityHash(codigoUnico, timestamp = Date.now()) {
  return crypto.createHash('sha256').update(String(codigoUnico) + String(timestamp)).digest('hex');
}

module.exports = {
  generateUniqueCode,
  generateSha256,
  generateReportIntegrityHash,
};
