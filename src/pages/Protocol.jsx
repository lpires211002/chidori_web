import { useI18n } from '../lib/i18n.jsx';

function Spec({ title, rows, note }) {
  return (
    <section className="mb-10">
      <h2 className="label text-ink border-b border-hairline pb-2 mb-1">{title}</h2>
      <dl>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 py-2.5 border-b border-hairline">
            <dt className="label text-ink-low">{r.label}</dt>
            <dd className="data text-right">{r.value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="label text-ink-low mt-3">{note}</p>}
    </section>
  );
}

export default function Protocol() {
  const { t } = useI18n();
  const steps = t('protocol.steps');
  const chain = t('protocol.chain');

  return (
    <>
      <header className="mb-10">
        <p className="label text-ink-low mb-3">{t('protocol.kicker')}</p>
        <h1 className="text-[34px] leading-tight mb-4">{t('protocol.title')}</h1>
        <p className="font-serif italic text-ink-med text-[17px]">{t('protocol.standfirst')}</p>
      </header>

      <section className="mb-10">
        <h2 className="label text-ink border-b border-hairline pb-2 mb-1">
          {t('protocol.stepsTitle')}
        </h2>
        <ol className="list-none p-0 m-0">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-5 py-5 border-b border-hairline">
              <span className="font-serif text-[26px] leading-none text-signal shrink-0 w-8 pt-1">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="label text-ink mb-1.5">{s.title}</h3>
                <p className="text-ink-med text-[14px]">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="label text-ink border-b border-hairline pb-2 mb-4">
          {t('protocol.chainTitle')}
        </h2>
        <ol className="list-none p-0 m-0">
          {chain.map((node, i) => (
            <li key={node}>
              <div className="border border-hairline rounded-sm px-4 py-2.5 data text-ink">
                {node}
              </div>
              {i < chain.length - 1 && (
                <div className="h-4 flex justify-center" aria-hidden="true">
                  <span className="w-px bg-hairline h-full block" />
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className="label text-ink-low mt-4">{t('protocol.chainCaption')}</p>
      </section>

      <Spec title={t('protocol.instrumentTitle')} rows={t('protocol.instrument')} />
      <Spec
        title={t('protocol.performanceTitle')}
        rows={t('protocol.performance')}
        note={t('protocol.performanceNote')}
      />

      <div className="border border-hairline rounded-sm px-4 py-4">
        <p className="data text-ink-med">{t('protocol.disclaimer')}</p>
      </div>
    </>
  );
}
