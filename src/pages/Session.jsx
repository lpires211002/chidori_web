import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { isConfigured } from '../lib/rest.js';
import {
  fetchSession,
  fetchSeries,
  fetchEvents,
  fetchFields,
  fetchPublished,
  describeFields,
} from '../lib/data.js';
import { trendSeries, baseline } from '../lib/series.js';
import { fmtOhm, fmtDelta, fmtDuration, fmtDate, fmtInt, fmtClock } from '../lib/format.js';
import { useI18n } from '../lib/i18n.jsx';
import ImpedanceChart from '../components/ImpedanceChart.jsx';
import Stats from '../components/Stat.jsx';
import Notice from '../components/Notice.jsx';

const KNOWN_KINDS = ['mark', 'water', 'void', 'disconnect', 'reconnect', 'gap'];

export default function Session() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const [data, setData] = useState({ status: 'loading' });

  useEffect(() => {
    if (!isConfigured) return setData({ status: 'noconfig' });
    let alive = true;
    setData({ status: 'loading' });

    (async () => {
      try {
        const session = await fetchSession(id);
        if (!alive) return;
        if (!session) return setData({ status: 'notfound' });

        const [series, events, fields, published] = await Promise.all([
          fetchSeries(id),
          fetchEvents(id),
          fetchFields(),
          fetchPublished(),
        ]);
        if (!alive) return;

        setData({
          status: 'ready',
          session,
          plot: series.plot,
          trend: trendSeries(series.plot),
          samples: series.count,
          durationS: series.full.length
            ? series.full[series.full.length - 1].t - series.full[0].t
            : null,
          basal: baseline(series.full),
          last: series.full.length ? series.full[series.full.length - 1].z : null,
          events,
          rows: describeFields(fields, session),
          published,
        });
      } catch (err) {
        console.error('[session]', err);
        if (alive) setData({ status: 'error' });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  if (data.status === 'loading') return <p className="label text-ink-low">{t('common.loading')}</p>;
  if (data.status === 'noconfig') return <Notice tone="alarm">{t('common.noConfig')}</Notice>;
  if (data.status === 'error') return <Notice tone="alarm">{t('common.error')}</Notice>;
  if (data.status === 'notfound') return <Notice>{t('session.notFound')}</Notice>;

  const { session, plot, trend, events, rows, samples, durationS, basal, last, published } = data;
  const delta = basal != null && last != null ? last - basal : null;

  const idx = published.findIndex((s) => s.id === session.id);
  const prev = idx > 0 ? published[idx - 1] : null;
  const next = idx >= 0 && idx < published.length - 1 ? published[idx + 1] : null;

  const kindLabel = (kind) =>
    KNOWN_KINDS.includes(kind) ? t(`events.${kind}`) : kind || t('events.mark');

  return (
    <>
      <Link to="/" className="label text-ink-low hover:text-ink">
        ← {t('session.back')}
      </Link>

      <header className="mt-6 mb-8">
        <p className="label text-ink-low mb-2">
          {t('session.kicker')} {session.session_number ?? '—'}
        </p>
        <h1 className="text-[30px] leading-tight mb-3">
          {t('session.subject')} {session.subject_code}
        </h1>
        <p className="data text-ink-low">{fmtDate(session.recorded_at, lang)}</p>
      </header>

      <section className="mb-8">
        <ImpedanceChart raw={plot} trend={trend} events={events} height={260} />
      </section>

      <section className="mb-10">
        <Stats
          items={[
            { label: t('session.baseline'), value: fmtOhm(basal, 2, lang) },
            { label: t('session.final'), value: fmtOhm(last, 2, lang) },
            {
              label: t('session.delta'),
              value: delta == null ? '—' : `${fmtDelta(delta, 2, lang)} Ω`,
            },
            { label: t('session.samples'), value: fmtInt(samples, lang) },
          ]}
        />
        <p className="label text-ink-low mt-3">
          {t('session.duration')} · {fmtDuration(durationS, lang)}
        </p>
      </section>

      {rows.length > 0 && (
        <section className="mb-10">
          <h2 className="label text-ink border-b border-hairline pb-2 mb-1">
            {t('session.conditions')}
          </h2>
          <dl>
            {rows.map((r) => (
              <div key={r.key} className="flex justify-between gap-4 py-2.5 border-b border-hairline">
                <dt className="label text-ink-low">{r.label}</dt>
                <dd className="data text-right">
                  {r.value}
                  {r.unit ? ` ${r.unit}` : ''}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mb-12">
        <h2 className="label text-ink border-b border-hairline pb-2 mb-1">{t('session.events')}</h2>

        {events.length === 0 ? (
          <p className="text-ink-med py-4">{t('session.noEvents')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="label text-ink-low text-left py-2 pr-3 font-medium">
                    {t('events.n')}
                  </th>
                  <th className="label text-ink-low text-left py-2 pr-3 font-medium">
                    {t('events.time')}
                  </th>
                  <th className="label text-ink-low text-right py-2 pr-3 font-medium">
                    {t('events.impedance')}
                  </th>
                  <th className="label text-ink-low text-right py-2 pr-3 font-medium">
                    {t('events.change')}
                  </th>
                  <th className="label text-ink-low text-left py-2 pr-3 font-medium">
                    {t('events.kind')}
                  </th>
                  <th className="label text-ink-low text-right py-2 font-medium">
                    {t('events.volume')}
                  </th>
                </tr>
              </thead>
              <tbody className="data">
                {events.map((e, i) => (
                  <tr key={`${e.event_number}-${i}`} className="border-b border-hairline">
                    <td className="py-2.5 pr-3 text-ink-low">{e.event_number ?? i + 1}</td>
                    <td className="py-2.5 pr-3">{fmtClock(e.elapsed_time)}</td>
                    <td className="py-2.5 pr-3 text-right">{fmtOhm(e.impedance, 2, lang)}</td>
                    <td className="py-2.5 pr-3 text-right">
                      {fmtDelta(e.impedance_change, 2, lang)}
                    </td>
                    <td className={`py-2.5 pr-3 ${e.kind === 'void' ? 'text-alarm' : ''}`}>
                      {kindLabel(e.kind)}
                    </td>
                    <td className="py-2.5 text-right">
                      {e.amount_ml == null ? '—' : `${fmtInt(e.amount_ml, lang)} ml`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <nav className="flex justify-between gap-4 border-t border-hairline pt-5">
        {prev ? (
          <Link to={`/sesion/${prev.id}`} className="label text-ink-low hover:text-ink">
            ← {t('session.kicker')} {prev.session_number ?? ''}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/sesion/${next.id}`} className="label text-ink-low hover:text-ink">
            {t('session.kicker')} {next.session_number ?? ''} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}
