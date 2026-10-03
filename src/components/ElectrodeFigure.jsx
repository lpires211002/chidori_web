import { useI18n } from '../lib/i18n.jsx';

/*
 * Montaje tetrapolar a nivel vesical.
 *
 *   par externo  I+ / I−  · inyección de corriente
 *   par interno  V+ / V−  · medición de tensión
 *
 * Los cuatro electrodos van en contacto consecutivo —el borde de cada uno toca
 * al siguiente— y la fila queda centrada en la línea media del ombligo, como
 * pide el protocolo. Por eso la separación entre centros es, por construcción,
 * el diámetro del electrodo: la única cota del dibujo es ese diámetro y no una
 * distancia en centímetros, que el protocolo todavía no fija.
 *
 * La altura de la fila respecto del ombligo queda sin cotar a propósito: el
 * protocolo la deja abierta. Si después se fija, va acá.
 *
 * Distribución pensada para que nada se pise: ombligo rotulado a la derecha,
 * cota abajo a la derecha, leyenda por fuera del contorno.
 */

const R = 24; // radio del electrodo, en px del viewBox
const MID = 180;
const NAVEL_Y = 86;
const ROW = 170;
const DIM_Y = 220;

const INK = '#201d18';
const HAIR = '#dad4ca';
const LOW = '#756e64';
const SIGNAL = '#3b59cb';
const PAPER = '#fbf9f4';

// En contacto consecutivo: centros a ±R y ±3R de la línea media.
const PADS = [
  { x: MID - 3 * R, label: 'I+', drive: true },
  { x: MID - R, label: 'V+', drive: false },
  { x: MID + R, label: 'V−', drive: false },
  { x: MID + 3 * R, label: 'I−', drive: true },
];

const mono = { fontFamily: 'IBM Plex Mono, monospace' };

function Dim({ from, to, y, text }) {
  return (
    <g>
      <line x1={from} x2={to} y1={y} y2={y} stroke={LOW} strokeWidth="1" />
      <line x1={from} x2={from} y1={y - 4} y2={y + 4} stroke={LOW} strokeWidth="1" />
      <line x1={to} x2={to} y1={y - 4} y2={y + 4} stroke={LOW} strokeWidth="1" />
      <text x={(from + to) / 2} y={y - 6} textAnchor="middle" {...mono} fontSize="11" fill={LOW}>
        {text}
      </text>
    </g>
  );
}

export default function ElectrodeFigure() {
  const { t } = useI18n();

  return (
    <svg
      viewBox="0 0 360 300"
      className="w-full h-auto"
      role="img"
      aria-label={t('protocol.electrodeCaption')}
    >
      {/* Flancos del abdomen · contorno abierto, no una silueta cerrada */}
      <path d="M80,18 C66,78 62,160 74,252" fill="none" stroke={INK} strokeWidth="1.25" />
      <path d="M280,18 C294,78 298,160 286,252" fill="none" stroke={INK} strokeWidth="1.25" />

      {/* Línea media · pasa justo por el contacto del par interno */}
      <line
        x1={MID}
        x2={MID}
        y1={18}
        y2={200}
        stroke={HAIR}
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Ombligo · rotulado a la derecha, lejos de la cota */}
      <circle cx={MID} cy={NAVEL_Y} r="3.5" fill="none" stroke={INK} strokeWidth="1.25" />
      <text x={MID + 12} y={NAVEL_Y + 4} {...mono} fontSize="11" fill={LOW}>
        {t('protocol.navel')}
      </text>

      {/* Electrodos · el par de inyección lleno, el de medición al contorno */}
      {PADS.map((p) => (
        <g key={p.label}>
          <circle
            cx={p.x}
            cy={ROW}
            r={R}
            fill={p.drive ? SIGNAL : PAPER}
            stroke={SIGNAL}
            strokeWidth="1.25"
          />
          <text
            x={p.x}
            y={ROW + 4}
            textAnchor="middle"
            {...mono}
            fontSize="12"
            fontWeight="500"
            fill={p.drive ? PAPER : SIGNAL}
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* Única cota · el ancho de un electrodo, que al ir en contacto es también
          la separación entre centros. Va bajo el par interno, en el centro del
          dibujo: contra el flanco el rótulo se montaba sobre el contorno. */}
      <Dim from={MID} to={MID + 2 * R} y={DIM_Y} text={t('protocol.diameter')} />

      {/* Leyenda · por fuera del contorno */}
      <text x={MID} y={272} textAnchor="middle" {...mono} fontSize="11" fill={LOW}>
        {t('protocol.sensing')}
      </text>
      <text x={MID} y={288} textAnchor="middle" {...mono} fontSize="11" fill={LOW}>
        {t('protocol.injection')}
      </text>
    </svg>
  );
}
