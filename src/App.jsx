import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useI18n } from './lib/i18n.jsx';
import Home from './pages/Home.jsx';
import Session from './pages/Session.jsx';
import Protocol from './pages/Protocol.jsx';

// El panel no lo abre nadie que venga del QR: que no lo descargue.
const Admin = lazy(() => import('./pages/Admin.jsx'));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  return (
    <div className="min-h-dvh flex flex-col">
      <ScrollTop />
      <Header />
      <main className="flex-1 w-full max-w-[720px] mx-auto px-5 pt-9 pb-16">
        {/* La key remonta la red de contención al cambiar de ruta: un error
            en una pantalla no deja rota la siguiente. */}
        <ErrorBoundary
          key={pathname}
          labels={{
            title: t('common.crashTitle'),
            body: t('common.crashBody'),
            stale: t('common.crashStale'),
            reload: t('common.reload'),
          }}
        >
          <Suspense fallback={<p className="label text-ink-low">{t('common.loading')}</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sesion/:id" element={<Session />} />
              <Route path="/protocolo" element={<Protocol />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
