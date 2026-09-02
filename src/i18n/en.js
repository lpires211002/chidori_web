export default {
  nav: { measurements: 'Measurements', protocol: 'Protocol' },

  hero: {
    kicker: 'Final degree project · 2026',
    title: 'Real-time bladder bioimpedance',
    deck:
      'Non-invasive detection of bladder filling from the impedance drop measured at 50 kHz. The physiological signal is roughly 1.3 Ω per hour, and a single movement by the patient can be worth three times that: the whole work is telling one from the other.',
  },

  stats: {
    frequency: 'Frequency',
    subjects: 'Subjects',
    sessions: 'Sessions',
    events: 'Events',
  },

  figure: {
    n: 'Figure 1',
    session: 'Session',
    caption:
      'Impedance over a filling session. In grey, the raw signal as sent by the instrument; in colour, the 60 s rolling median used to read the trend. Numbers mark the events listed in the table.',
    raw: 'Raw signal',
    trend: '60 s trend',
    axisY: 'Impedance (Ω)',
    axisX: 'Time',
  },

  list: {
    title: 'Published measurements',
    subject: 'Subject',
    duration: 'Duration',
    events: 'Events',
    delta: 'Δ',
    empty: 'No measurements published yet.',
    hint: 'Tap a row to open the full session.',
  },

  session: {
    back: 'Measurements',
    kicker: 'Session',
    subject: 'Subject',
    conditions: 'Session conditions',
    events: 'Recorded events',
    noEvents: 'This session recorded no events.',
    baseline: 'Baseline',
    final: 'Final',
    delta: 'Change',
    duration: 'Duration',
    samples: 'Samples',
    notFound: 'That measurement was not found, or is not published.',
    prev: 'Previous',
    next: 'Next',
  },

  events: {
    n: '#',
    time: 'Time',
    impedance: 'Impedance',
    change: 'Δ',
    kind: 'Type',
    volume: 'Volume',
    mark: 'Mark',
    water: 'Intake',
    void: 'Void',
    disconnect: 'Disconnect',
    reconnect: 'Reconnect',
    gap: 'Gap',
  },

  protocol: {
    kicker: 'Methodology',
    title: 'Measurement protocol',
    standfirst: 'Every session published here follows the same procedure.',
    principleTitle: 'Principle',
    principle:
      'Urine is far more conductive than the surrounding tissue. As the bladder fills, the current finds an easier path and the measured impedance drops. That fall is what the instrument tracks.',
    stepsTitle: 'Procedure',
    steps: [
      {
        title: 'Preparation',
        body: 'Electrode placement and contact check. The instrument discards the first samples until the reading settles.',
      },
      {
        title: 'Baseline',
        body: 'Median of the first minute of recording. It is the number the whole session is compared against, so it is taken over a full minute rather than the first few samples: if it fell inside an artifact, the entire session would be offset.',
      },
      {
        title: 'Free hydration',
        body: 'The subject drinks at will throughout the session. Each intake is logged as an event with its volume in millilitres, so intake can later be related to the impedance trace.',
      },
      {
        title: 'Continuous recording',
        body: 'Current injection at 50 kHz and uninterrupted recording. Every published value is the result of averaging 192 readings and median-filtering them before transmission.',
      },
      {
        title: 'Void and close',
        body: 'Voided volume is logged as an event and the session is closed. The full dataset remains exportable, sample by sample.',
      },
    ],
    instrumentTitle: 'Instrumentation',
    instrument: [
      { label: 'Microcontroller', value: 'ESP32-C3' },
      { label: 'Electrodes', value: '4 · tetrapolar montage' },
      { label: 'Signal generation', value: 'AD9833 · 50 kHz sine' },
      { label: 'Injected current', value: '288 µA' },
      { label: 'Receive chain', value: '×200 · INA ×5 · high-pass ×10 · low-pass ×4' },
      { label: 'Conversion', value: '12-bit ADC · 3.3 V' },
      { label: 'Sampling', value: '700 Hz · 192 averages → ~4 Hz output' },
      { label: 'Filtering', value: 'Median of 5 + 12-point moving average' },
      { label: 'Link', value: 'WebSocket over the instrument access point' },
    ],
    performanceTitle: 'Measured performance',
    performanceNote: 'Characterised on a real 84-minute session of 17,304 samples.',
    performance: [
      { label: 'Noise floor', value: 'σ ≈ 0.010 Ω' },
      { label: 'Filling signal', value: '≈ 1.28 Ω/h' },
      { label: 'Motion artifacts', value: 'up to 4.33 Ω · 5–25 s' },
      { label: 'Useful range', value: '≈ 4.6 Ω' },
    ],
    electrodeTitle: 'Electrode montage',
    electrodeBody:
      'Four electrodes at bladder level, aligned below the navel and symmetric about the midline. The outer pair injects the current; the inner pair senses the voltage. Separating the two roles is what removes skin-electrode contact impedance from the reading: no current flows through the sensing electrodes, so no voltage drops across them.',
    electrodeCaption: 'Figure 2 · Tetrapolar montage at bladder level.',
    navel: 'navel',
    sensing: 'V+ / V− · voltage sensing',
    injection: 'I+ / I− · current injection',
    chainTitle: 'Measurement chain',
    chainCaption: 'Figure 3 · From generator to record.',
    chain: [
      'AD9833 · 50 kHz',
      'Howland current source · 288 µA',
      'Electrodes',
      'INA ×5',
      'High-pass ×10 · low-pass ×4',
      '12-bit ADC · ESP32-C3',
      'WebSocket → record',
    ],
    disclaimer:
      'This instrument does not diagnose. It assists monitoring. Every final clinical decision is human.',
  },

  admin: {
    title: 'Publishing',
    subtitle: 'Choose which measurements appear on the public site.',
    user: 'User',
    password: 'Password',
    signIn: 'Sign in',
    signOut: 'Sign out',
    published: 'Published',
    featured: 'Featured',
    onlySuperadmin: 'This account has no admin permissions.',
    empty: 'No sessions recorded.',
    saving: 'Saving…',
    total: 'sessions',
  },

  common: {
    loading: 'Loading…',
    error: 'Could not load the data.',
    noConfig: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing from the build.',
    retry: 'Retry',
  },
};
