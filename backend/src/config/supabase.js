/**
 * BBVision - Cliente Oficial de Conexão Supabase
 * Padrão Corporativo Banco do Brasil (TakeOff | Residência em Software & IA)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;
let isConfigured = false;
let hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
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
      console.warn('[Supabase Config] Aviso: Usando chave pública (anon/publishable). Para operações completas com bypass de RLS no backend, defina SUPABASE_SERVICE_ROLE_KEY no .env.');
    }
  } catch (err) {
    console.error('[Supabase Config] Erro ao instanciar cliente:', err.message);
  }
} else {
  console.warn('[Supabase Config] Variáveis SUPABASE_URL e chave não detectadas. Operando com mock local.');
}

module.exports = {
  supabase,
  isConfigured,
  hasServiceRole,
  supabaseUrl,
  supabaseKey,
};
