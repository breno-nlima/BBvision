const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase Config] SUPABASE_URL e/ou chaves do Supabase não configuradas no ambiente.');
}

/**
 * Cliente Supabase para operações no backend
 * Utiliza preferencialmente a SERVICE_ROLE_KEY para operações administrativas de auditoria e validação de tokens
 */
const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };
