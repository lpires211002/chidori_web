/** Aviso sobrio: hairline, sin relleno de color, sin iconos. */
export default function Notice({ children, tone = 'neutral' }) {
  const color = tone === 'alarm' ? 'text-alarm border-alarm' : 'text-ink-med border-hairline';
  return (
    <div className={`border ${color} rounded-sm px-4 py-3 data`}>{children}</div>
  );
}
