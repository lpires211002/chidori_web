/** Fila de cifras separadas por hairlines. Sin cajas ni sombras. */
export default function Stats({ items }) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 border-t border-l border-hairline">
      {items.map((it) => (
        <div key={it.label} className="border-r border-b border-hairline p-3">
          <dt className="label text-ink-low">{it.label}</dt>
          <dd className="data text-ink mt-2 text-[15px]">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
