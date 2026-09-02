import { useCallback, useEffect, useState } from 'react';
import { supabase, isConfigured, usernameToEmail } from '../lib/supabase.js';
import { fmtDate, fmtInt } from '../lib/format.js';
import { useI18n } from '../lib/i18n.jsx';
import Notice from '../components/Notice.jsx';

/**
 * Panel de publicación. Deliberadamente crudo: lo usa una sola persona y no
 * se linkea desde ningún lado (se entra por /admin). Lo único que hace es
 * marcar qué sesiones son públicas y cuál va en la portada.
 *
 * Quien manda de verdad es la policy `sessions_publish` en la base: si esta
 * pantalla intentara publicar sin ser superadmin, el update no toca ninguna
 * fila y acá se avisa. Nunca al revés.
 */
export default function Admin() {
  const { t, lang } = useI18n();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return setProfile(null);
    supabase
      .from('profiles')
      .select('id, role, display_name')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [session]);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('sessions')
      .select(
        'id, session_number, created_at, elapsed_time_str, total_events, is_public, is_featured, patient:patients ( code )'
      )
      .order('created_at', { ascending: false });
    if (err) return setError(err.message);
    setRows(data || []);
  }, []);

  useEffect(() => {
    if (profile?.role === 'superadmin') load();
  }, [profile, load]);

  async function signIn(e) {
    e.preventDefault();
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(form.username),
      password: form.password,
    });
    if (err) setError(err.message);
  }

  async function toggle(row, field) {
    setBusy(row.id);
    setError(null);
    try {
      // Portada excluyente: bajar la anterior antes de subir esta.
      if (field === 'is_featured' && !row.is_featured) {
        await supabase.from('sessions').update({ is_featured: false }).eq('is_featured', true);
      }
      const { data, error: err } = await supabase
        .from('sessions')
        .update({ [field]: !row[field] })
        .eq('id', row.id)
        .select('id');
      if (err) throw err;
      // RLS puede aceptar el update sin tocar filas: hay que verificarlo.
      if (!data || data.length === 0) throw new Error(t('admin.onlySuperadmin'));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  if (!isConfigured) return <Notice tone="alarm">{t('common.noConfig')}</Notice>;

  if (!session) {
    return (
      <>
        <h1 className="text-[30px] mb-6">{t('admin.title')}</h1>
        <form onSubmit={signIn} className="flex flex-col gap-4 max-w-xs">
          <label className="flex flex-col gap-1.5">
            <span className="label text-ink-low">{t('admin.user')}</span>
            <input
              className="data border border-hairline rounded-sm px-3 py-2 bg-paper"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              autoCapitalize="none"
              autoComplete="username"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label text-ink-low">{t('admin.password')}</span>
            <input
              type="password"
              className="data border border-hairline rounded-sm px-3 py-2 bg-paper"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="label bg-signal text-white rounded-sm px-4 py-2.5">
            {t('admin.signIn')}
          </button>
          {error && <p className="data text-alarm">{error}</p>}
        </form>
      </>
    );
  }

  if (profile && profile.role !== 'superadmin') {
    return (
      <>
        <Notice tone="alarm">{t('admin.onlySuperadmin')}</Notice>
        <button
          onClick={() => supabase.auth.signOut()}
          className="label text-ink-low hover:text-ink mt-5"
        >
          {t('admin.signOut')}
        </button>
      </>
    );
  }

  return (
    <>
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[30px] leading-tight">{t('admin.title')}</h1>
          <p className="text-ink-med text-[14px] mt-1">{t('admin.subtitle')}</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="label text-ink-low hover:text-ink shrink-0 pt-2"
        >
          {t('admin.signOut')}
        </button>
      </header>

      {error && (
        <div className="mb-6">
          <Notice tone="alarm">{error}</Notice>
        </div>
      )}

      <p className="label text-ink-low border-b border-hairline pb-2 mb-1">
        {fmtInt(rows.length, lang)} {t('admin.total')}
      </p>

      <ul>
        {rows.map((r) => (
          <li key={r.id} className="border-b border-hairline py-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="label">
                  {r.session_number ?? '—'} · {r.patient?.code || '—'}
                </p>
                <p className="data text-ink-low mt-1">
                  {fmtDate(r.created_at, lang)} · {r.elapsed_time_str || '—'} ·{' '}
                  {fmtInt(r.total_events || 0, lang)}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  disabled={busy === r.id}
                  onClick={() => toggle(r, 'is_public')}
                  className={`label px-3 py-2 rounded-sm border transition-colors ${
                    r.is_public
                      ? 'bg-signal text-white border-signal'
                      : 'border-hairline text-ink-low hover:text-ink'
                  }`}
                >
                  {t('admin.published')}
                </button>
                <button
                  disabled={busy === r.id || !r.is_public}
                  onClick={() => toggle(r, 'is_featured')}
                  className={`label px-3 py-2 rounded-sm border transition-colors disabled:opacity-40 ${
                    r.is_featured
                      ? 'bg-ink text-white border-ink'
                      : 'border-hairline text-ink-low hover:text-ink'
                  }`}
                >
                  {t('admin.featured')}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && <p className="text-ink-med py-6">{t('admin.empty')}</p>}
    </>
  );
}
