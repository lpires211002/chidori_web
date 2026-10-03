export default {
  nav: { measurements: 'Measurements', protocol: 'Protocol' },

  hero: {
    kicker: 'Final degree project · 2026',
    title: 'Real-time bladder bioimpedance',
    scroll: 'Scroll for the measurements',
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
        title: 'Subject preparation',
        body: 'The subject is asked to arrive shaved at the pubic area, with the skin clean and dry, so the electrode adhesive sits flat. Before starting, a short fluid-intake survey is filled in: habitual intake and intake that day.',
      },
      {
        title: 'Electrode montage',
        body: 'The row sits level with the midpoint between the navel and the pubic symphysis: the sensing electrodes 3 cm either side of the midline, the current ones 3 cm further out. It spans almost the full width of the pubic area without reaching the iliac crests. The electrodes stay separated, never touching, and none may have a lifting edge: a loose electrode shows up in the signal as a step, not as filling.',
      },
      {
        title: 'Position and starting point',
        body: 'The subject voids before starting and arrives after a period without drinking. They settle into a semi-reclined position, back supported and legs extended, and hold it for the whole session: impedance responds to movement far faster than it does to filling.',
      },
      {
        title: 'Stabilisation and baseline',
        body: 'Fifteen minutes of recording without intervention, until the reading settles; only then does the session start. The baseline is the median of its first minute rather than the first few samples: it is the number everything that follows is compared against, and if it fell inside an artifact the whole session would be offset.',
      },
      {
        title: 'Scheduled hydration',
        body: 'At ten minutes the subject drinks 250 ml, and repeats the same amount every fifteen minutes. Each intake is logged as an event with its volume, so intake can later be related to the impedance trace.',
      },
      {
        title: 'Close',
        body: 'The session ends at the first void, on reaching two litres, or at two hours, whichever comes first. Voided volume is logged as an event. If the subject has measured before, the repeat is noted. The full dataset remains exportable, sample by sample.',
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
      'Four electrodes in a row, level with the midpoint between the navel and the pubic symphysis. The inner pair, 3 cm either side of the midline, senses the voltage; the outer pair, 3 cm further out, injects the current. Separating the two roles is what removes skin-electrode contact impedance from the reading: no current flows through the sensing electrodes, so no voltage drops across them.',
    electrodeFig: 'Figure 2',
    electrodeCaption: 'Tetrapolar montage at bladder level.',
    navel: 'navel',
    pubis: 'symphysis',
    sensing: 'V+ / V− · voltage sensing',
    injection: 'I+ / I− · current injection',
    chainTitle: 'Measurement chain',
    chainFig: 'Figure 3',
    chainCaption: 'From generator to record.',
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
    reload: 'Reload',
    crashTitle: 'Something failed while rendering this page',
    crashBody: 'The rest of the site still works. If it happens again, reload the page.',
    crashStale: 'This tab is running an old version of the site. Reloading fixes it.',
  },
};
