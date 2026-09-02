import { createRoot } from 'react-dom/client';
import { LangProvider } from './lib/i18n.jsx';
import ImpedanceChart from './components/ImpedanceChart.jsx';
import { toSeries, trendSeries, decimate } from './lib/series.js';
import './index.css';

// Sesion sintetica con la fisica real: basal 61,4 Ω, llenado -1,28 Ω/h,
// ruido σ=0,010 Ω y un artefacto de movimiento de +4,33 Ω a los 40 min.
const filas = [];
for (let i = 0; i < 84 * 60 * 3.65; i++) {
  const t = i / 3.65;
  let z = 61.4 - (1.28 / 3600) * t + (Math.random() - 0.5) * 0.02;
  if (t > 2400 && t < 2415) z += 4.33;
  filas.push({ elapsed_time: t, impedance: z });
}
const full = toSeries(filas);
const plot = decimate(full, 700);

const eventos = [
  { event_number: 1, elapsed_time: 900, kind: 'water', amount_ml: 250 },
  { event_number: 2, elapsed_time: 3200, kind: 'void', amount_ml: 320 },
];

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px' }}>
      <ImpedanceChart raw={plot} trend={trendSeries(plot)} events={eventos} height={260} />
    </div>
  </LangProvider>
);
