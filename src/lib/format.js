/** Formateo. Todo con coma decimal en español y punto en inglés. */

export function fmtNumber(value, digits = 2, lang = 'es') {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString(lang === 'en' ? 'en-US' : 'es-AR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtOhm(value, digits = 2, lang = 'es') {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return `${fmtNumber(value, digits, lang)} Ω`;
}

/** Δ con signo explícito: acá el signo es la información. */
export function fmtDelta(value, digits = 2, lang = 'es') {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const n = Number(value);
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${fmtNumber(Math.abs(n), digits, lang)}`;
}

/** Segundos → "1:23:45" o "23:45". */
export function fmtClock(seconds) {
  if (seconds == null || !Number.isFinite(Number(seconds))) return '—';
  const s = Math.max(0, Math.round(Number(seconds)));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (x) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** Segundos → "3 h 42 min" / "42 min". */
export function fmtDuration(seconds, lang = 'es') {
  if (seconds == null || !Number.isFinite(Number(seconds))) return '—';
  const s = Math.max(0, Math.round(Number(seconds)));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')} min`;
  return `${m} min`;
}

export function fmtDate(iso, lang = 'es') {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d
    .toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace('.', '')
    .toUpperCase();
}

export function fmtInt(value, lang = 'es') {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return Number(value).toLocaleString(lang === 'en' ? 'en-US' : 'es-AR');
}
