/**
 * BBVision - Configuração do Google Gemini AI
 * Modelo: gemini-1.5-flash
 * SLA de latência: <= 15s
 * Limiar de confiança: 75% (0.75)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 15000;
const confidenceThreshold = parseFloat(process.env.GEMINI_CONFIDENCE_THRESHOLD) || 0.75;

let genAI = null;
if (apiKey && apiKey !== 'sua-chave-gemini-aqui') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('[Gemini Config] GEMINI_API_KEY não configurada. O serviço funcionará com fallback inteligente e validação manual conforme especificação.');
}

module.exports = {
  genAI,
  apiKey,
  modelName,
  timeoutMs,
  confidenceThreshold,
};
