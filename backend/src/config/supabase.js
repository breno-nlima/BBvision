/**
 * BBVision - Cliente Oficial Supabase
 * Suporta Service Role Key e Anon Key
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('sua-instancia') &&
  !supabaseKey.includes('sua-')
);

let supabase = null;

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Supabase Config] Cliente Supabase inicializado com sucesso.');
  } catch (err) {
    console.error('[Supabase Config] Erro ao instanciar cliente Supabase:', err.message);
    supabase = null;
  }
} else {
  console.warn('[Supabase Config] Variáveis do Supabase não configuradas. Operando com camada de persistência local resiliente.');
}

module.exports = {
  supabase,
  isConfigured,
};
