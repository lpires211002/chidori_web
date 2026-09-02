import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import es from '../i18n/es.js';
import en from '../i18n/en.js';

const DICTS = { es, en };
const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('chidori-lang');
      if (saved === 'es' || saved === 'en') return saved;
    } catch {
      /* modo privado, o storage bloqueado */
    }
    return String(navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
  });

  useEffect(() => {
    try {
      localStorage.setItem('chidori-lang', lang);
    } catch {
      /* noop */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = DICTS[lang] || es;
    /** t('protocol.title') · si falta la clave devuelve la clave, no un vacío. */
    const t = (path) => {
      const found = String(path)
        .split('.')
        .reduce((o, k) => (o == null ? o : o[k]), dict);
      return found === undefined ? path : found;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
