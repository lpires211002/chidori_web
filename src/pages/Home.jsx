import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isConfigured } from '../lib/rest.js';
import { fetchPublished, fetchSeries, fetchEvents, summarize } from '../lib/data.js';
import { trendSeries } from '../lib/series.js';
import { fmtDelta, fmtInt } from '../lib/format.js';
import { useI18n } from '../lib/i18n.jsx';
import ImpedanceChart from '../components/ImpedanceChart.jsx';
import Stats from '../components/Stat.jsx';
import Notice from '../components/Notice.jsx';

export default function Home() {
  const { t, lang } = useI18n();
  const [state, setState] = useState({ status: 'loading', sessions: [] });
  const [figure, setFigure] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      setState({ status: 'noconfig', sessions: [] });
      return;
    }
    let alive = true;

    (async () => {
      try {
        const sessions = await fetchPublished();
        if (!alive) return;
        setState({ status: 'ready', sessions });

        const featured = sessions.find((s) => s.is_featured) || sessions[0];
        if (!featured) return;

        // La portada carga UNA serie, no las de toda la lista: el visitante
        // está parado frente a un póster con 4G, no en un escritorio.
        const [{ plot }, events] = await Promise.all([
          fetchSeries(featured.id),
          fetchEvents(featured.id),
        ]);
        if (!alive) return;
        setFigure({ session: featured, raw: plot, trend: trendSeries(plot), events });
      } catch (err) {
        console.error('[home]', err);
        if (alive) setState({ status: 'error', sessions: [] });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const { sessions, status } = state;
  const totals = summarize(sessions);

  return (
    <>
      <section className="mb-10">
        <p className="label text-ink-low mb-3">{t('hero.kicker')}</p>
        <h1 className="text-[34px] sm:text-[38px] leading-[1.15] mb-4">{t('hero.title')}</h1>
        <p className="text-ink-med">{t('hero.deck')}</p>
      </section>

      <section className="mb-12">
        <Stats
          items={[
            { label: t('stats.frequency'), value: '50 kHz' },
            { label: t('stats.subjects'), value: status === 'ready' ? fmtInt(totals.subjects, lang) : '—' },
            { label: t('stats.sessions'), value: status === 'ready' ? fmtInt(totals.sessions, lang) : '—' },
            { label: t('stats.events'), value: status === 'ready' ? fmtInt(totals.events, lang) : '—' },
          ]}
        />
      </section>

      {status === 'noconfig' && (
        <div className="mb-12">
          <Notice tone="alarm">{t('common.noConfig')}</Notice>
        </div>
      )}
      {status === 'error' && (
        <div className="mb-12">
          <Notice tone="alarm">{t('common.error')}</Notice>
        </div>
      )}
      {status === 'loading' && <p className="label text-ink-low mb-12">{t('common.loading')}</p>}

      {figure && (
        <section className="mb-12">
          <div className="flex items-baseline justify-between border-b border-hairline pb-2 mb-5">
            <h2 className="label text-ink">{t('figure.n')}</h2>
            <span className="label text-ink-low">
              {t('figure.session')} {figure.session.session_number ?? '—'} ·{' '}
              {figure.session.subject_code}
            </span>
          </div>

          <ImpedanceChart
            raw={figure.raw}
            trend={figure.trend}
            events={figure.events}
            height={250}
          />

          <p className="text-[13px] leading-relaxed text-ink-med italic mt-4 font-serif">
            {t('figure.caption')}
          </p>
        </section>
      )}

      {status === 'ready' && (
        <section>
          <h2 className="label text-ink border-b border-hairline pb-2 mb-1">{t('list.title')}</h2>

          {sessions.length === 0 ? (
            <p className="text-ink-med py-6">{t('list.empty')}</p>
          ) : (
            <>
              <ul className="mb-3">
                {sessions.map((s) => {
                  const delta =
                    Number.isFinite(Number(s.final_impedance)) &&
                    Number.isFinite(Number(s.initial_impedance))
                      ? Number(s.final_impedance) - Number(s.initial_impedance)
                      : null;
                  return (
                    <li key={s.id} className="border-b border-hairline">
                      <Link
                        to={`/sesion/${s.id}`}
                        className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-3 hover:text-signal transition-colors"
                      >
                        <span className="label">
                          {t('session.kicker')} {s.session_number ?? '—'} · {s.subject_code}
                        </span>
                        <span className="data text-right">
                          {delta == null ? '—' : `${fmtDelta(delta, 2, lang)} Ω`}
                        </span>
                        <span className="data text-ink-low">
                          {s.elapsed_time_str || '—'} · {fmtInt(s.total_events || 0, lang)}{' '}
                          {t('list.events').toLowerCase()}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="label text-ink-low">{t('list.hint')}</p>
            </>
          )}
        </section>
      )}
    </>
  );
}
