/**
 * BBVision - Cliente Oficial de Conexão Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
let isConfigured = false;
const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('sua-'));

const isPlaceholder = (val) =>
  !val ||
  typeof val !== 'string' ||
  val.includes('seu-projeto-aqui') ||
  val.includes('sua-chave-') ||
  val.includes('sua-service-') ||
  val.trim() === '';

if (!isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseKey)) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    isConfigured = true;
    console.log(`[Supabase Config] Conectado a: ${supabaseUrl}`);
    if (!hasServiceRole) {
      console.warn('[Supabase Config] Aviso: Usando chave pública (anon/publishable). Defina SUPABASE_SERVICE_ROLE_KEY no .env para operações completas do backend.');
    }
  } catch (err) {
    console.error('[Supabase Config] Erro ao instanciar cliente:', err.message);
  }
} else {
  console.log('[Supabase Config] Variáveis SUPABASE_URL/chave não definidas. Operando com armazenamento local persistente em disco.');
}

module.exports = {
  supabase,
  isConfigured,
  hasServiceRole,
  supabaseUrl,
  supabaseKey,
};
