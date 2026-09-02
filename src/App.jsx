import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Session from './pages/Session.jsx';
import Protocol from './pages/Protocol.jsx';
import Admin from './pages/Admin.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <ScrollTop />
      <Header />
      <main className="flex-1 w-full max-w-[720px] mx-auto px-5 pt-9 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sesion/:id" element={<Session />} />
          <Route path="/protocolo" element={<Protocol />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
