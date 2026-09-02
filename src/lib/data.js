import { supabase } from './supabase.js';
import { toSeries, decimate } from './series.js';

/**
 * Capa de lectura pública.
 *
 * Todo pasa por las vistas `public_*`, que solo devuelven sesiones marcadas
 * is_public y NUNCA nombres, apellidos ni notas libres. El front no puede
 * pedirle nada más a la base aunque quiera: la superficie expuesta a `anon`
 * son estas vistas y nada más. Ver sql/web_publica.sql.
 */

export async function fetchPublished() {
  const { data, error } = await supabase
    .from('public_sessions')
    .select('*')
    .order('recorded_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchSession(id) {
  const { data, error } = await supabase
    .from('public_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Serie de una sesión. Se decima en el cliente y no en el servidor a
 * propósito: LTTB conserva los picos, y un artefacto de movimiento perdido es
 * justamente lo que no se puede explicar después en el póster.
 */
export async function fetchSeries(sessionId, target = 700) {
  const { data, error } = await supabase
    .from('public_measurements')
    .select('elapsed_time, impedance')
    .eq('session_id', sessionId)
    .order('elapsed_time', { ascending: true })
    .limit(60000);
  if (error) throw error;
  const full = toSeries(data);
  return { full, plot: decimate(full, target), count: full.length };
}

export async function fetchEvents(sessionId) {
  const { data, error } = await supabase
    .from('public_session_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('event_number', { ascending: true });
  if (error) throw error;
  return data || [];
}

/** Catálogo de campos, para poner las etiquetas y unidades reales. */
export async function fetchFields() {
  const { data, error } = await supabase
    .from('public_field_definitions')
    .select('*')
    .order('sort_order');
  if (error) return [];
  return data || [];
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
