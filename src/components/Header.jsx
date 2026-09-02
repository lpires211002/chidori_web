import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../lib/i18n.jsx';

export default function Header() {
  const { lang, setLang, t } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-hairline">
      <div className="w-full max-w-[720px] mx-auto px-5 h-13 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="label tracking-[0.22em] text-ink">
          CHIDORI
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink
            to="/protocolo"
            className={({ isActive }) =>
              `label ${isActive ? 'text-signal' : 'text-ink-low hover:text-ink'}`
            }
          >
            {t('nav.protocol')}
          </NavLink>

          <div className="flex border border-hairline rounded-sm overflow-hidden">
            {['es', 'en'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`label px-2 py-1 transition-colors ${
                  lang === code
                    ? 'bg-signal text-white'
                    : 'bg-paper text-ink-low hover:text-ink'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
