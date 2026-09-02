import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n.jsx';
import { fmtClock, fmtNumber } from '../lib/format.js';

/* Paleta local del gráfico. La cruda va en gris cálido para que la tendencia
 * sea lo único que usa el color señal. */
const RAW = '#c3bcb1';
const TREND = '#3b59cb';
const AXIS = '#dad4ca';
const TICK = '#756e64';
const INK = '#201d18';
const PAPER = '#fbf9f4';

const PAD = { l: 48, r: 12, t: 20, b: 26 };

/** Ticks "redondos" dentro de [min,max]. */
function niceTicks(min, max, count = 4) {
  const span = max - min;
  if (!(span > 0)) return [min];
  const rough = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const out = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) out.push(v);
  return out;
}

const TIME_STEPS = [60, 300, 600, 900, 1800, 3600, 7200, 14400];

function timeTicks(maxT) {
  const step = TIME_STEPS.find((s) => maxT / s <= 5) || TIME_STEPS[TIME_STEPS.length - 1];
  const out = [];
  for (let v = 0; v <= maxT + 1; v += step) out.push(v);
  return out;
}

function fmtTimeTick(seconds, totalS) {
  if (totalS >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h}:${String(m).padStart(2, '0')}`;
  }
  return `${Math.round(seconds / 60)}′`;
}

/** Índice del punto cuyo t está más cerca de `t`. Búsqueda binaria: la serie
 *  puede tener ~1.000 puntos y esto corre en cada movimiento del dedo. */
function nearestIndex(points, t) {
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t < t) lo = mid;
    else hi = mid;
  }
  return Math.abs(points[lo].t - t) <= Math.abs(points[hi].t - t) ? lo : hi;
}

export default function ImpedanceChart({ raw = [], trend = [], events = [], height = 240 }) {
  const { t: tr, lang } = useI18n();
  const boxRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const model = useMemo(() => {
    if (!raw.length || width <= 0) return null;

    const t0 = raw[0].t;
    const maxT = Math.max(1, raw[raw.length - 1].t - t0);

    let lo = Infinity;
    let hi = -Infinity;
    for (const p of raw) {
      if (p.z < lo) lo = p.z;
      if (p.z > hi) hi = p.z;
    }
    /* El eje NO arranca en cero a propósito: la señal vale unos pocos ohm
     * sobre una basal de decenas, y forzar el cero la aplastaría a una recta. */
    const pad = (hi - lo || 1) * 0.12;
    lo -= pad;
    hi += pad;

    const iw = Math.max(1, width - PAD.l - PAD.r);
    const ih = Math.max(1, height - PAD.t - PAD.b);
    const x = (t) => PAD.l + ((t - t0) / maxT) * iw;
    const y = (z) => PAD.t + (1 - (z - lo) / (hi - lo)) * ih;

    const path = (pts) =>
      pts.length
        ? pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.z).toFixed(1)}`).join('')
        : '';

    const decimals = hi - lo < 2 ? 2 : 1;

    return {
      x,
      y,
      iw,
      ih,
      maxT,
      t0,
      rawPath: path(raw),
      trendPath: path(trend),
      yTicks: niceTicks(lo, hi, 4).map((v) => ({
        v,
        label: v.toLocaleString(lang === 'en' ? 'en-US' : 'es-AR', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
      })),
      xTicks: timeTicks(maxT).filter((v) => v <= maxT),
      decimals,
    };
  }, [raw, trend, width, height, lang]);

  /* Lectura bajo el cursor. Se engancha a la tendencia, que es la serie que
   * se lee; la cruda en ese instante puede estar dentro de un artefacto. */
  const leer = useCallback(
    (clientX) => {
      const serie = trend.length ? trend : raw;
      if (!model || !serie.length || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      if (!rect.width) return;
      const px = ((clientX - rect.left) / rect.width) * width;
      const frac = (px - PAD.l) / model.iw;
      const t = model.t0 + Math.min(1, Math.max(0, frac)) * model.maxT;
      const i = nearestIndex(serie, t);
      const p = serie[i];
      setCursor({ x: model.x(p.t), y: model.y(p.z), t: p.t - model.t0, z: p.z });
    },
    [model, trend, raw, width]
  );

  const onMove = (e) => leer(e.clientX);
  const onLeave = () => setCursor(null);

  return (
    <figure className="m-0">
      <div ref={boxRef} className="w-full">
        {model ? (
          <svg
            ref={svgRef}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${tr('figure.axisY')} — ${tr('figure.axisX')}`}
            className="block"
            /* pan-y deja que el dedo siga scrolleando la página en vertical
             * mientras el movimiento horizontal lee el gráfico. */
            style={{ touchAction: 'pan-y' }}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={onLeave}
            onPointerCancel={onLeave}
          >
            {/* Guías horizontales + etiquetas del eje Y */}
            {model.yTicks.map((tick) => (
              <g key={`y${tick.v}`}>
                <line
                  x1={PAD.l}
                  x2={width - PAD.r}
                  y1={model.y(tick.v)}
                  y2={model.y(tick.v)}
                  stroke={AXIS}
                  strokeWidth="1"
                />
                <text
                  x={PAD.l - 8}
                  y={model.y(tick.v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontFamily="IBM Plex Mono, monospace"
                  fontSize="10"
                  fill={TICK}
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Eventos: regla punteada + número que referencia la tabla */}
            {events.map((ev, i) => {
              const ex = model.x(model.t0 + Number(ev.elapsed_time || 0));
              if (!Number.isFinite(ex)) return null;
              return (
                <g key={`e${ev.event_number ?? i}`}>
                  <line
                    x1={ex}
                    x2={ex}
                    y1={PAD.t}
                    y2={height - PAD.b}
                    stroke={ev.kind === 'void' ? '#b4382c' : '#a89f93'}
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={ex}
                    y={PAD.t - 7}
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono, monospace"
                    fontSize="9"
                    fill={ev.kind === 'void' ? '#b4382c' : TICK}
                  >
                    {ev.event_number ?? i + 1}
                  </text>
                </g>
              );
            })}

            <path
              key={`raw-${model.rawPath.length}`}
              className="aparece-cruda"
              d={model.rawPath}
              fill="none"
              stroke={RAW}
              strokeWidth="1"
            />
            <path
              key={`trend-${model.trendPath.length}`}
              className="trazo-curva"
              d={model.trendPath}
              pathLength="1"
              strokeDasharray="1"
              fill="none"
              stroke={TREND}
              strokeWidth="1.75"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Ejes */}
            <line
              x1={PAD.l}
              x2={PAD.l}
              y1={PAD.t}
              y2={height - PAD.b}
              stroke={AXIS}
              strokeWidth="1"
            />
            <line
              x1={PAD.l}
              x2={width - PAD.r}
              y1={height - PAD.b}
              y2={height - PAD.b}
              stroke={AXIS}
              strokeWidth="1"
            />

            {model.xTicks.map((v) => (
              <text
                key={`x${v}`}
                x={model.x(model.t0 + v)}
                y={height - PAD.b + 14}
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="10"
                fill={TICK}
              >
                {fmtTimeTick(v, model.maxT)}
              </text>
            ))}

            {/* Lectura bajo el cursor */}
            {cursor &&
              (() => {
                const etiqueta = `${fmtClock(cursor.t)} · ${fmtNumber(cursor.z, model.decimals, lang)} Ω`;
                const ancho = etiqueta.length * 6.1 + 12;
                const aLaIzq = cursor.x + ancho + 10 > width - PAD.r;
                const lx = aLaIzq ? cursor.x - ancho - 8 : cursor.x + 8;
                return (
                  <g pointerEvents="none">
                    <line
                      x1={cursor.x}
                      x2={cursor.x}
                      y1={PAD.t}
                      y2={height - PAD.b}
                      stroke={INK}
                      strokeWidth="1"
                      opacity="0.35"
                    />
                    <circle cx={cursor.x} cy={cursor.y} r="3.5" fill={TREND} />
                    <rect
                      x={lx}
                      y={PAD.t + 2}
                      width={ancho}
                      height={18}
                      rx="3"
                      fill={PAPER}
                      stroke={AXIS}
                      strokeWidth="1"
                    />
                    <text
                      x={lx + 6}
                      y={PAD.t + 14}
                      fontFamily="IBM Plex Mono, monospace"
                      fontSize="11"
                      fill={INK}
                    >
                      {etiqueta}
                    </text>
                  </g>
                );
              })()}
          </svg>
        ) : (
          <div style={{ height }} className="border border-hairline rounded-sm" />
        )}
      </div>

      {/* Leyenda: dos trazos, sin caja */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3">
        <span className="label text-ink-low flex items-center gap-2">
          <svg width="18" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="18" y2="3" stroke={RAW} strokeWidth="1" />
          </svg>
          {tr('figure.raw')}
        </span>
        <span className="label text-ink-low flex items-center gap-2">
          <svg width="18" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="18" y2="3" stroke={TREND} strokeWidth="1.75" />
          </svg>
          {tr('figure.trend')}
        </span>
        <span className="label text-ink-low ml-auto">{tr('figure.axisY')}</span>
      </div>
    </figure>
  );
}
