/**
 * Lectura pública contra PostgREST, con fetch pelado.
 *
 * POR QUÉ NO supabase-js ACÁ: el sitio público solo hace cuatro SELECT sobre
 * vistas abiertas a `anon`. Traer la librería entera (auth + realtime +
 * storage + functions) para eso cuesta ~80 kB comprimidos que el visitante
 * descarga parado frente a un póster, con el wifi de un congreso. supabase-js
 * queda para /admin, que es lo único que necesita sesión, y se carga aparte.
 */

const BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(BASE && ANON);

export async function select(view, params = {}) {
  if (!isConfigured) throw new Error('Faltan las variables de entorno de Supabase.');

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/rest/v1/${view}?${qs}`, {
    // La clave va en headers, nunca en la query string.
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) throw new Error(`${view}: ${res.status} ${await res.text()}`);
  return res.json();
}
