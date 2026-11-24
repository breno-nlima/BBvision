/**
 * BBVision - Configuração do Motor de IA de Visão Computacional
 * SLA de latência: <= 15s | Limiar de confiança: 75% (0.75)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const rawKey = (process.env.GEMINI_API_KEY || '').trim();
const isValidKey = Boolean(rawKey && !rawKey.includes('sua-chave-'));

const apiKey = isValidKey ? rawKey : '';
const modelName = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 15000;
const confidenceThreshold = parseFloat(process.env.GEMINI_CONFIDENCE_THRESHOLD) || 0.75;

let genAI = null;
if (isValidKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('[IA Config] GEMINI_API_KEY não configurada no .env. Validação óptica local e fallback de validação manual ativos.');
}

module.exports = {
  genAI,
  apiKey,
  modelName,
  timeoutMs,
  confidenceThreshold,
  isConfigured: isValidKey,
};
