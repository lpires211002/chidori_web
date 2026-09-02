/**
 * Cliente completo de Supabase. Solo lo usa /admin, para autenticar y para
 * escribir is_public / is_featured. Se carga con import dinámico para que la
 * librería no entre en el bundle que descarga el visitante del póster.
 */

const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

export async function getSupabase() {
  if (client) return client;
  if (!BASE || !ANON) throw new Error('Faltan las variables de entorno de Supabase.');
  const { createClient } = await import('@supabase/supabase-js');
  client = createClient(BASE, ANON, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  return client;
}

/** Mismo mapeo que la app de escritorio: "sa" → "sa@chidori.local". */
const AUTH_LOCAL_DOMAIN = import.meta.env.VITE_AUTH_LOCAL_DOMAIN || 'chidori.local';

export function usernameToEmail(username) {
  const u = (username || '').trim().toLowerCase();
  if (!u) return '';
  return u.includes('@') ? u : `${u}@${AUTH_LOCAL_DOMAIN}`;
}
