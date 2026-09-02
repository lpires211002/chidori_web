import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Cliente único. Puede ser null: si faltan las variables el sitio igual
 * renderiza y avisa, en vez de romper con una pantalla en blanco.
 *
 * La anon key es pública por diseño. Lo que protege los datos son las vistas
 * `public_*` (solo exponen sesiones marcadas is_public y nunca nombres ni
 * notas libres) y las policies de RLS. Ver sql/web_publica.sql.
 */
export const supabase =
  URL && ANON
    ? createClient(URL, ANON, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      })
    : null;

export const isConfigured = Boolean(supabase);

/** Mismo mapeo que la app de escritorio: "sa" → "sa@chidori.local". */
const AUTH_LOCAL_DOMAIN = import.meta.env.VITE_AUTH_LOCAL_DOMAIN || 'chidori.local';

export function usernameToEmail(username) {
  const u = (username || '').trim().toLowerCase();
  if (!u) return '';
  return u.includes('@') ? u : `${u}@${AUTH_LOCAL_DOMAIN}`;
}
