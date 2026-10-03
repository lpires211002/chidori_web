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
        title: 'Preparación del sujeto',
        body: 'Se le pide al sujeto venir con la zona púbica rasurada y la piel limpia y seca, para que el adhesivo del electrodo apoye parejo. Antes de empezar se completa una encuesta breve de ingesta de líquido: la habitual y la de ese día.',
      },
      {
        title: 'Montaje de electrodos',
        body: 'La fila va a la altura del punto medio entre el ombligo y la sínfisis del pubis: los de tensión a 3 cm de la línea media y los de corriente 3 cm más afuera. Ocupa casi todo el ancho del pubis sin llegar a las crestas ilíacas. Los electrodos quedan separados, nunca en contacto, y se verifica que ninguno tenga un borde despegado: un electrodo flojo aparece en la señal como un salto, no como llenado.',
      },
      {
        title: 'Posición y punto de partida',
        body: 'El sujeto orina antes de empezar y llega con un tiempo previo sin tomar líquido. Se acomoda semisentado, con la espalda reclinada y las piernas extendidas, y mantiene esa postura toda la sesión: la impedancia responde al movimiento mucho más rápido que al llenado.',
      },
      {
        title: 'Estabilización y basal',
        body: 'Quince minutos de registro sin intervención, hasta que la lectura se asienta; recién ahí arranca la sesión. La basal es la mediana de su primer minuto y no las primeras muestras: es el número contra el que se compara todo lo que sigue, y si cayera dentro de un artefacto la sesión entera quedaría corrida.',
      },
      {
        title: 'Hidratación pautada',
        body: 'A los diez minutos el sujeto toma 250 ml, y repite esa misma cantidad cada quince minutos. Cada ingesta queda marcada como evento con su volumen, para poder relacionar después lo tomado con la evolución de la impedancia.',
      },
      {
        title: 'Cierre',
        body: 'La sesión termina con la primera micción, al completar los dos litros o a las dos horas, lo que ocurra primero. Se registra el volumen miccional como evento. Si el sujeto ya había medido antes, la repetición queda anotada. El dataset completo queda exportable, muestra por muestra.',
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
      'Cuatro electrodos en fila, a la altura del punto medio entre el ombligo y la sínfisis del pubis. El par interno, a 3 cm de la línea media a cada lado, mide la tensión; el par externo, 3 cm más afuera, inyecta la corriente. Separar las dos funciones es lo que saca de la lectura la impedancia de contacto piel-electrodo: por los electrodos de medición no circula corriente, así que no cae tensión sobre ellos.',
    electrodeFig: 'Figura 2',
    electrodeCaption: 'Montaje tetrapolar a nivel vesical.',
    navel: 'ombligo',
    pubis: 'sínfisis',
    sensing: 'V+ / V− · medición de tensión',
    injection: 'I+ / I− · inyección de corriente',
    chainTitle: 'Cadena de medición',
    chainFig: 'Figura 3',
    chainCaption: 'Del generador al registro.',
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
