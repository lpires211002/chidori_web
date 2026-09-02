import { useI18n } from '../lib/i18n.jsx';

/*
 * Montaje tetrapolar a nivel vesical, dibujado a escala (1 cm = 12 px).
 *   par externo  I+ / I−  · inyección de corriente, ±8 cm de la línea media
 *   par interno  V+ / V−  · medición de tensión,    ±3 cm de la línea media
 *
 * Separar inyección de medición es lo que saca de la lectura la impedancia de
 * contacto piel-electrodo: por los electrodos de tensión no circula corriente,
 * así que no cae tensión sobre ellos.
 *
 * Distribución vertical pensada para que nada se pise: ombligo rotulado a la
 * derecha, cotas abajo a la izquierda, leyenda por fuera del contorno.
 */

const CM = 12;
const MID = 180;
const NAVEL_Y = 96;
const ROW = 162;
const PAD_LABEL_Y = ROW + 22;
const DIM_3_Y = 206;
const DIM_8_Y = 232;

const INK = '#201d18';
const HAIR = '#dad4ca';
const LOW = '#756e64';
const SIGNAL = '#3b59cb';

const PADS = [
  { x: MID - 8 * CM, label: 'I+' },
  { x: MID - 3 * CM, label: 'V+' },
  { x: MID + 3 * CM, label: 'V−' },
  { x: MID + 8 * CM, label: 'I−' },
];

const mono = { fontFamily: 'IBM Plex Mono, monospace' };

function Dim({ from, to, y, text }) {
  return (
    <g>
      <line x1={from} x2={to} y1={y} y2={y} stroke={LOW} strokeWidth="1" />
      <line x1={from} x2={from} y1={y - 4} y2={y + 4} stroke={LOW} strokeWidth="1" />
      <line x1={to} x2={to} y1={y - 4} y2={y + 4} stroke={LOW} strokeWidth="1" />
      <text
        x={(from + to) / 2}
        y={y - 6}
        textAnchor="middle"
        {...mono}
        fontSize="10"
        fill={LOW}
      >
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

      {/* Línea media */}
      <line
        x1={MID}
        x2={MID}
        y1={18}
        y2={252}
        stroke={HAIR}
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Ombligo · rotulado a la derecha, lejos de las cotas */}
      <circle cx={MID} cy={NAVEL_Y} r="3.5" fill="none" stroke={INK} strokeWidth="1.25" />
      <text x={MID + 12} y={NAVEL_Y + 4} {...mono} fontSize="10" fill={LOW}>
        {t('protocol.navel')}
      </text>

      {/* Fila de electrodos */}
      <line
        x1={MID - 8 * CM - 16}
        x2={MID + 8 * CM + 16}
        y1={ROW}
        y2={ROW}
        stroke={HAIR}
        strokeWidth="1"
      />
      {PADS.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={ROW} r="5" fill={SIGNAL} />
          <text
            x={p.x}
            y={PAD_LABEL_Y}
            textAnchor="middle"
            {...mono}
            fontSize="11"
            fontWeight="500"
            fill={INK}
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* Cotas · abajo a la izquierda */}
      <Dim from={MID - 3 * CM} to={MID} y={DIM_3_Y} text="3 cm" />
      <Dim from={MID - 8 * CM} to={MID} y={DIM_8_Y} text="8 cm" />

      {/* Leyenda · por fuera del contorno */}
      <text x={MID} y={274} textAnchor="middle" {...mono} fontSize="10" fill={LOW}>
        {t('protocol.sensing')}
      </text>
      <text x={MID} y={290} textAnchor="middle" {...mono} fontSize="10" fill={LOW}>
        {t('protocol.injection')}
      </text>
    </svg>
  );
}
