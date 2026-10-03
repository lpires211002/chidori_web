import { useI18n } from '../lib/i18n.jsx';

/*
 * Montaje tetrapolar a nivel vesical.
 *
 *   par interno  V+ / V−  · medicion de tension    · a 3 cm de la linea media
 *   par externo  I+ / I−  · inyeccion de corriente · 3 cm mas afuera
 *
 * La fila va a la altura del punto medio entre el ombligo y la sinfisis del
 * pubis, y ocupa casi todo el ancho del pubis sin llegar a las crestas iliacas.
 *
 * Ojo con el reflejo de leer el dibujo al reves: la corriente entra por los dos
 * de afuera y la tension se lee en los dos de adentro, justo encima de la
 * vejiga. El par de tension queda a 6 cm entre si, asi que la fila NO esta
 * equiespaciada: 3 cm, 6 cm, 3 cm.
 *
 * La altura se dibuja con la cota vertical de la izquierda: dos tramos con la
 * marca de igualdad, sin numeros, porque la distancia cambia con cada sujeto.
 *
 * Los electrodos se dibujan como puntos: las posiciones estan definidas, el
 * diametro del adhesivo no.
 *
 * Escala horizontal 1 cm = 12 px.
 */

const CM = 12;
const MID = 180;
const NAVEL_Y = 70;
const ROW = 150;
const PUBIS_Y = 230;
const VDIM_X = 42;

const INK = '#201d18';
const HAIR = '#dad4ca';
const LOW = '#756e64';
const SIGNAL = '#3b59cb';

const PADS = [
  { x: MID - 6 * CM, label: 'I+' },
  { x: MID - 3 * CM, label: 'V+' },
  { x: MID + 3 * CM, label: 'V−' },
  { x: MID + 6 * CM, label: 'I−' },
];

const mono = { fontFamily: 'IBM Plex Mono, monospace' };

// Cota horizontal con marcas en los extremos y el texto debajo.
function Dim({ from, to, y, text }) {
  return (
    <g>
      <g stroke={LOW} strokeWidth="1">
        <line x1={from} x2={to} y1={y} y2={y} />
        <line x1={from} x2={from} y1={y - 4} y2={y + 4} />
        <line x1={to} x2={to} y1={y - 4} y2={y + 4} />
      </g>
      <text
        x={(from + to) / 2}
        y={y + 16}
        textAnchor="middle"
        {...mono}
        fontSize="11"
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
      viewBox="0 0 360 332"
      className="w-full h-auto"
      role="img"
      aria-label={t('protocol.electrodeCaption')}
    >
      {/* Contorno · flancos, entrepierna y piernas */}
      <g fill="none" stroke={INK} strokeWidth="1.25">
        <path d="M78,20 C64,80 60,170 72,240" />
        <path d="M282,20 C296,80 300,170 288,240" />
        <path d="M72,240 L88,282" />
        <path d="M288,240 L272,282" />
        <path d="M180,232 L158,282" />
        <path d="M180,232 L202,282" />
      </g>

      {/* Linea media · del ombligo a la sinfisis */}
      <line
        x1={MID}
        x2={MID}
        y1={NAVEL_Y}
        y2={PUBIS_Y}
        stroke={HAIR}
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Cota vertical · por fuera del cuerpo. Dos tramos iguales: la fila cae
          en el punto medio entre el ombligo y la sinfisis. */}
      <g stroke={LOW} strokeWidth="1">
        <line x1={VDIM_X} x2={VDIM_X} y1={NAVEL_Y} y2={PUBIS_Y} />
        <line x1={VDIM_X - 4} x2={VDIM_X + 4} y1={NAVEL_Y} y2={NAVEL_Y} />
        <line x1={VDIM_X - 4} x2={VDIM_X + 4} y1={ROW} y2={ROW} />
        <line x1={VDIM_X - 4} x2={VDIM_X + 4} y1={PUBIS_Y} y2={PUBIS_Y} />
        <line x1={VDIM_X - 4} x2={VDIM_X + 4} y1={114} y2={106} />
        <line x1={VDIM_X - 4} x2={VDIM_X + 4} y1={194} y2={186} />
      </g>

      {/* Ombligo */}
      <circle cx={MID} cy={NAVEL_Y} r="3.5" fill="none" stroke={INK} strokeWidth="1.25" />
      <text x={MID + 12} y={NAVEL_Y + 4} {...mono} fontSize="11" fill={LOW}>
        {t('protocol.navel')}
      </text>

      {/* Sinfisis del pubis */}
      <line x1={MID - 7} x2={MID + 7} y1={PUBIS_Y} y2={PUBIS_Y} stroke={INK} strokeWidth="1.25" />
      <text x={MID + 14} y={PUBIS_Y + 4} {...mono} fontSize="11" fill={LOW}>
        {t('protocol.pubis')}
      </text>

      {/* Nivel de la fila */}
      <line
        x1={80}
        x2={280}
        y1={ROW}
        y2={ROW}
        stroke={HAIR}
        strokeWidth="1"
        strokeDasharray="3 4"
      />

      {/* Electrodos */}
      {PADS.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={ROW} r="5" fill={SIGNAL} />
          <text
            x={p.x}
            y={ROW - 12}
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

      {/* Cotas · linea media → tension → corriente */}
      <Dim from={MID} to={MID + 3 * CM} y={ROW + 24} text="3 cm" />
      <Dim from={MID + 3 * CM} to={MID + 6 * CM} y={ROW + 24} text="3 cm" />

      {/* Leyenda · por fuera del contorno */}
      <text x={MID} y={306} textAnchor="middle" {...mono} fontSize="11" fill={LOW}>
        {t('protocol.sensing')}
      </text>
      <text x={MID} y={322} textAnchor="middle" {...mono} fontSize="11" fill={LOW}>
        {t('protocol.injection')}
      </text>
    </svg>
  );
}
