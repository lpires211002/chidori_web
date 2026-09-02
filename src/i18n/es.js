export default {
  nav: { measurements: 'Mediciones', protocol: 'Protocolo' },

  hero: {
    kicker: 'Proyecto final de carrera · 2026',
    title: 'Bioimpedancia vesical en tiempo real',
    scroll: 'Deslizá para ver las mediciones',
    deck:
      'Detección no invasiva del llenado de la vejiga a partir de la caída de impedancia medida a 50 kHz. La señal fisiológica es de aproximadamente 1,3 Ω por hora, y un solo movimiento del paciente puede valer tres veces eso: todo el trabajo está en separar una cosa de la otra.',
  },

  stats: {
    frequency: 'Frecuencia',
    subjects: 'Sujetos',
    sessions: 'Sesiones',
    events: 'Eventos',
  },

  figure: {
    n: 'Figura 1',
    session: 'Sesión',
    caption:
      'Impedancia a lo largo de una sesión de llenado. En gris, la señal cruda tal como la manda el instrumento; en color, la mediana móvil de 60 s con la que se lee la tendencia. Los números marcan los eventos de la tabla.',
    raw: 'Señal cruda',
    trend: 'Tendencia 60 s',
    axisY: 'Impedancia (Ω)',
    axisX: 'Tiempo',
  },

  list: {
    title: 'Mediciones publicadas',
    subject: 'Sujeto',
    duration: 'Duración',
    events: 'Eventos',
    delta: 'Δ',
    empty: 'Todavía no hay mediciones publicadas.',
    hint: 'Tocá una fila para ver la sesión completa.',
  },

  session: {
    back: 'Mediciones',
    kicker: 'Sesión',
    subject: 'Sujeto',
    conditions: 'Condiciones de la sesión',
    events: 'Eventos registrados',
    noEvents: 'La sesión no registró eventos.',
    baseline: 'Basal',
    final: 'Final',
    delta: 'Variación',
    duration: 'Duración',
    samples: 'Muestras',
    notFound: 'No se encontró esa medición, o no está publicada.',
    prev: 'Anterior',
    next: 'Siguiente',
  },

  events: {
    n: '#',
    time: 'Tiempo',
    impedance: 'Impedancia',
    change: 'Δ',
    kind: 'Tipo',
    volume: 'Volumen',
    mark: 'Marca',
    water: 'Ingesta',
    void: 'Micción',
    disconnect: 'Desconexión',
    reconnect: 'Reconexión',
    gap: 'Hueco',
  },

  protocol: {
    kicker: 'Metodología',
    title: 'Protocolo de medición',
    standfirst: 'Todas las sesiones publicadas acá siguen el mismo procedimiento.',
    principleTitle: 'Principio',
    principle:
      'La orina es mucho más conductora que el tejido que la rodea. A medida que la vejiga se llena, la corriente encuentra un camino más fácil y la impedancia medida baja. Esa caída es lo que sigue el instrumento.',
    stepsTitle: 'Procedimiento',
    steps: [
      {
        title: 'Preparación',
        body: 'Colocación de electrodos y verificación de contacto. El instrumento descarta las primeras muestras hasta que la lectura se estabiliza.',
      },
      {
        title: 'Basal',
        body: 'Mediana del primer minuto de registro. Es el número contra el que se compara toda la sesión, así que se toma sobre un minuto entero y no sobre las primeras muestras: si cayera dentro de un artefacto, toda la sesión quedaría corrida.',
      },
      {
        title: 'Hidratación libre',
        body: 'El paciente toma agua a voluntad durante toda la sesión. Cada ingesta se marca como evento con su volumen en mililitros, para poder relacionar después lo ingerido con la evolución de la impedancia.',
      },
      {
        title: 'Registro continuo',
        body: 'Inyección de corriente a 50 kHz y registro sin interrupciones. Cada valor publicado es el resultado de promediar 192 lecturas y filtrarlas por mediana antes de transmitir.',
      },
      {
        title: 'Micción y cierre',
        body: 'Se registra el volumen miccional como evento y se cierra la sesión. El dataset completo queda exportable, muestra por muestra.',
      },
    ],
    instrumentTitle: 'Instrumentación',
    instrument: [
      { label: 'Microcontrolador', value: 'ESP32-C3' },
      { label: 'Electrodos', value: '4 · montaje tetrapolar' },
      { label: 'Generación', value: 'AD9833 · senoidal 50 kHz' },
      { label: 'Corriente inyectada', value: '288 µA' },
      { label: 'Cadena receptora', value: '×200 · INA ×5 · pasa-altos ×10 · pasa-bajos ×4' },
      { label: 'Conversión', value: 'ADC 12 bit · 3,3 V' },
      { label: 'Muestreo', value: '700 Hz · 192 promedios → ~4 Hz de salida' },
      { label: 'Filtrado', value: 'Mediana de 5 + media móvil de 12' },
      { label: 'Enlace', value: 'WebSocket sobre punto de acceso propio' },
    ],
    performanceTitle: 'Desempeño medido',
    performanceNote:
      'Valores caracterizados sobre una sesión real de 84 minutos y 17.304 muestras.',
    performance: [
      { label: 'Ruido de fondo', value: 'σ ≈ 0,010 Ω' },
      { label: 'Señal de llenado', value: '≈ 1,28 Ω/h' },
      { label: 'Artefactos de movimiento', value: 'hasta 4,33 Ω · 5–25 s' },
      { label: 'Rango útil', value: '≈ 4,6 Ω' },
    ],
    electrodeTitle: 'Montaje de electrodos',
    electrodeBody:
      'Cuatro electrodos a nivel vesical, alineados por debajo del ombligo y simétricos respecto de la línea media. El par externo inyecta la corriente; el par interno mide la tensión. Separar las dos funciones es lo que saca de la lectura la impedancia de contacto piel-electrodo: por los electrodos de medición no circula corriente, así que no cae tensión sobre ellos.',
    electrodeCaption: 'Figura 2 · Montaje tetrapolar a nivel vesical.',
    navel: 'ombligo',
    sensing: 'V+ / V− · medición de tensión',
    injection: 'I+ / I− · inyección de corriente',
    chainTitle: 'Cadena de medición',
    chainCaption: 'Figura 3 · Del generador al registro.',
    chain: [
      'AD9833 · 50 kHz',
      'Fuente de corriente Howland · 288 µA',
      'Electrodos',
      'INA ×5',
      'Pasa-altos ×10 · pasa-bajos ×4',
      'ADC 12 bit · ESP32-C3',
      'WebSocket → registro',
    ],
    disclaimer:
      'Este instrumento no diagnostica. Asiste al monitoreo. Toda decisión clínica final es humana.',
  },

  admin: {
    title: 'Publicación',
    subtitle: 'Elegí qué mediciones se ven en el sitio público.',
    user: 'Usuario',
    password: 'Contraseña',
    signIn: 'Entrar',
    signOut: 'Salir',
    published: 'Publicada',
    featured: 'Portada',
    onlySuperadmin: 'Esta cuenta no tiene permisos de administración.',
    empty: 'No hay sesiones cargadas.',
    saving: 'Guardando…',
    total: 'sesiones',
  },

  common: {
    loading: 'Cargando…',
    error: 'No se pudieron cargar los datos.',
    noConfig:
      'Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el build.',
    retry: 'Reintentar',
    reload: 'Recargar',
    crashTitle: 'Algo falló al mostrar esta página',
    crashBody:
      'El resto del sitio sigue funcionando. Si el problema se repite, recargá la página.',
    crashStale:
      'Esta pestaña quedó con una versión vieja del sitio. Recargá y se arregla.',
  },
};
