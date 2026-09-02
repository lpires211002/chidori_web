import { select, selectAll, rpc } from './rest.js';
import { toSeries, decimate } from './series.js';

/**
 * Capa de lectura pública.
 *
 * Todo pasa por las vistas `public_*`, que solo devuelven sesiones marcadas
 * is_public y NUNCA nombres, apellidos ni notas libres. El front no puede
 * pedirle nada más a la base aunque quiera: la superficie expuesta a `anon`
 * son estas vistas y nada más. Ver sql/web_publica.sql.
 */

export function fetchPublished() {
  return select('public_sessions', { select: '*', order: 'recorded_at.desc' });
}

export async function fetchSession(id) {
  const rows = await select('public_sessions', { select: '*', id: `eq.${id}`, limit: '1' });
  return rows[0] || null;
}

/**
 * Serie de una sesión. Se decima en el cliente y no en el servidor a
 * propósito: LTTB conserva los picos, y un artefacto de movimiento perdido es
 * justamente lo que no se puede explicar después en el póster.
 */
export async function fetchSeries(sessionId, target = 700) {
  // Camino normal: la base decima y manda ~1.000 puntos con la envolvente
  // completa, más el total real de muestras. Un solo pedido.
  try {
    const rows = await rpc('public_series', {
      p_session: sessionId,
      p_buckets: Math.max(200, Math.round(target / 2)),
    });
    const full = toSeries(rows.map((r) => ({ elapsed_time: r.t, impedance: r.z })));
    const count = Number(rows[0]?.n);
    return { full, plot: full, count: Number.isFinite(count) ? count : full.length };
  } catch (err) {
    // Plan B mientras `public_series` no exista en la base: paginar de a
    // 1.000. Funciona, pero son muchos pedidos en una sesión larga.
    console.warn('[series] sin public_series, paginando', err);
    const rows = await selectAll('public_measurements', {
      select: 'elapsed_time,impedance',
      session_id: `eq.${sessionId}`,
      order: 'elapsed_time.asc',
    });
    const full = toSeries(rows);
    return { full, plot: decimate(full, target), count: full.length };
  }
}

export function fetchEvents(sessionId) {
  return select('public_session_events', {
    select: '*',
    session_id: `eq.${sessionId}`,
    order: 'event_number.asc',
  });
}

/** Catálogo de campos, para poner las etiquetas y unidades reales. */
export async function fetchFields() {
  try {
    return await select('public_field_definitions', { select: '*', order: 'sort_order.asc' });
  } catch {
    return [];
  }
}

/** Números de portada, derivados de lo publicado. Nada hardcodeado. */
export function summarize(sessions) {
  const subjects = new Set(sessions.map((s) => s.subject_code).filter(Boolean));
  const events = sessions.reduce((acc, s) => acc + (Number(s.total_events) || 0), 0);
  return { subjects: subjects.size, sessions: sessions.length, events };
}

/**
 * Une los valores JSONB de la sesión y del sujeto con el catálogo de campos,
 * para mostrar "Peso · 72,4 kg" en vez de "peso: 72.4".
 */
export function describeFields(fields, session) {
  const rows = [];
  const seen = new Set();
  const push = (f, raw) => {
    if (raw === undefined || raw === null || raw === '') return;
    if (seen.has(f.scope + f.key)) return;
    seen.add(f.scope + f.key);
    rows.push({
      key: f.scope + '.' + f.key,
      label: f.label,
      value: typeof raw === 'boolean' ? (raw ? 'Sí' : 'No') : String(raw),
      unit: f.unit || '',
    });
  };
  for (const f of fields) {
    if (f.scope === 'session') push(f, session?.session_data?.[f.key]);
    if (f.scope === 'patient') push(f, session?.subject_data?.[f.key]);
  }
  return rows;
}
