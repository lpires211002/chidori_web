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

/** Llama una función de Postgres expuesta por PostgREST. */
export async function rpc(fn, args = {}) {
  if (!isConfigured) throw new Error('Faltan las variables de entorno de Supabase.');

  const res = await fetch(`${BASE}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) throw new Error(`rpc ${fn}: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * Lee una vista entera paginando.
 *
 * PostgREST corta toda respuesta en 1.000 filas y no hay `limit` del cliente
 * que lo cambie: pedir 60.000 devuelve 1.000 sin avisar. Esto es el plan B
 * para cuando la función `public_series` todavía no está creada en la base.
 */
export async function selectAll(view, params = {}, pageSize = 1000, maxPages = 40) {
  const out = [];
  for (let page = 0; page < maxPages; page++) {
    const rows = await select(view, {
      ...params,
      limit: String(pageSize),
      offset: String(page * pageSize),
    });
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}
