/**
 * Utilidades sobre la serie de impedancia.
 *
 * La escala del problema manda el diseño de todo esto: la señal fisiológica
 * de llenado es de ~1,28 Ω/h sobre una basal de decenas de ohm, con un ruido
 * de fondo de σ ≈ 0,010 Ω y artefactos de movimiento de hasta 4,33 Ω. O sea:
 * un solo movimiento puede valer más que toda la señal de la sesión.
 * (Medido en P-004 · sesión 2 · 17.304 muestras · 84 min.)
 *
 * Consecuencias prácticas:
 *   · el eje Y NUNCA arranca en cero — aplastaría la señal a una línea recta
 *   · se grafica la cruda Y la mediana móvil, no una sola de las dos
 *   · se usa mediana y no promedio, igual que en la app de escritorio
 */

/** Ventana de la tendencia, en segundos. Igual que en la app. */
export const TREND_WINDOW_S = 60;

export function median(values) {
  const n = values.length;
  if (n === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = n >> 1;
  return n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/**
 * Normaliza las filas de `public_measurements` a [{ t, z }] con t en segundos.
 * Defensivo con las unidades: si el máximo es absurdo se asume milisegundos.
 */
export function toSeries(rows) {
  const pts = (rows || [])
    .map((r) => ({ t: Number(r.elapsed_time), z: Number(r.impedance) }))
    .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.z))
    .sort((a, b) => a.t - b.t);

  if (pts.length === 0) return pts;
  const span = pts[pts.length - 1].t - pts[0].t;
  if (span > 86400) pts.forEach((p) => (p.t /= 1000));
  return pts;
}

/**
 * Mediana móvil causal de `windowS` segundos. Es la misma lectura que hace la
 * app en vivo: rechaza los artefactos de menos de media ventana enteros, en
 * vez de repartirlos como haría un promedio.
 */
export function trendSeries(points, windowS = TREND_WINDOW_S) {
  const out = [];
  let from = 0;
  for (let i = 0; i < points.length; i++) {
    const t = points[i].t;
    while (points[from].t < t - windowS) from++;
    const win = [];
    for (let j = from; j <= i; j++) win.push(points[j].z);
    out.push({ t, z: median(win) });
  }
  return out;
}

/**
 * Decimación LTTB (largest triangle three buckets): baja la cantidad de puntos
 * conservando la FORMA, incluidos los picos. Un muestreo cada N puntos se
 * comería justo los artefactos, que es lo que hay que poder ver.
 */
export function decimate(points, threshold = 700) {
  const n = points.length;
  if (threshold >= n || threshold < 3) return points;

  const sampled = [points[0]];
  const every = (n - 2) / (threshold - 2);
  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * every) + 1;
    const rangeEnd = Math.min(Math.floor((i + 2) * every) + 1, n);

    let avgT = 0;
    let avgZ = 0;
    const count = rangeEnd - rangeStart || 1;
    for (let j = rangeStart; j < rangeEnd; j++) {
      avgT += points[j].t;
      avgZ += points[j].z;
    }
    avgT /= count;
    avgZ /= count;

    const from = Math.floor(i * every) + 1;
    const to = Math.floor((i + 1) * every) + 1;
    const pa = points[a];

    let best = -1;
    let bestIdx = from;
    for (let j = from; j < Math.min(to, n); j++) {
      const area = Math.abs(
        (pa.t - avgT) * (points[j].z - pa.z) - (pa.t - points[j].t) * (avgZ - pa.z)
      );
      if (area > best) {
        best = area;
        bestIdx = j;
      }
    }
    sampled.push(points[bestIdx]);
    a = bestIdx;
  }

  sampled.push(points[n - 1]);
  return sampled;
}

/** Basal robusta: mediana del primer minuto, igual criterio que la app. */
export function baseline(points, windowS = 60) {
  if (!points.length) return null;
  const t0 = points[0].t;
  return median(points.filter((p) => p.t <= t0 + windowS).map((p) => p.z));
}
