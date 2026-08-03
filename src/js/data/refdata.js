// ============================================================
// JTAC Helper – Referenzdaten
// Quellen: CGF 160th SOAR (Airframes), JTAC Protocols 24th STS,
// ATG Reference Sheet, Ghost's JTAC Cheatsheet, TFW 18E Course
// ============================================================

const REF = {

  // ---------- Karten-Voreinstellungen für Arma 3 ----------
  maps: [
    { id: 'altis',     name: 'Altis',        zone: '35S', sw: [24.70, 39.78] },
    { id: 'stratis',   name: 'Stratis',      zone: '35S', sw: [24.94, 39.48] },
    { id: 'malden',    name: 'Malden',       zone: '33T', sw: [14.45, 42.79] },
    { id: 'livonia',   name: 'Livonia',      zone: '34U', sw: [22.77, 53.76] },
    { id: 'tanoa',     name: 'Tanoa',        zone: '60K', sw: [177.96, -17.69] },
    { id: 'chernarus', name: 'Chernarus',    zone: '33U', sw: [15.21, 49.33] },
    { id: 'takistan',  name: 'Takistan',     zone: '42S', sw: [68.87, 34.24] },
    { id: 'custom',    name: 'Eigene Zone …',zone: '' }
  ],

  // ============================================================
  // 12 SCHRITTE DES CAS
  // ============================================================
  casSteps: [
    { n: 1, title: 'Routing & Safety of Flight',
      body: '3D-Richtung von der aktuellen Position zum Haltepunkt (HA/CP). Haltepunkt & Höhe nennen, Kontaktstelle angeben. Andere Flugzeuge auf Station, Flugabwehr-Bedrohungen, Safety-of-Flight-Themen, aktive Gun-Target-Line (GTL) mit Azimut/Lage.' },
    { n: 2, title: 'CAS Check-in',
      body: 'Pilot meldet sich: Callsign · Missionsnummer · Anzahl & Typ der Luftfahrzeuge · Position & Höhe · Bewaffnung · Playtime / Time-on-Station · Fähigkeiten (Sensoren, Video-Downlink, SITREPs) · Abort-Code.',
      form: 'checkin' },
    { n: 3, title: 'Situation Update (TEFACHR)',
      body: 'Lage-Update im TEFACHR-Format: Threat, Enemy, Friendly, Artillery, Clearance Authority, Hazards, Remarks & Restrictions.',
      form: 'tefachr' },
    { n: 4, title: 'Game Plan',
      body: 'Kontrolltyp (1/2/3), Method of Attack (BOT/BOC), gewünschte Wirkung / Bewaffnung, Intervall.',
      form: 'gameplan' },
    { n: 5, title: 'CAS Brief',
      body: '9-Line (Fixed-Wing) oder 5-Line (Rotary/AC-130) übermitteln. Linien 4 & 6 (9-Line) bzw. 2 & 3 (5-Line) sind Pflicht-Readbacks.',
      form: 'brief' },
    { n: 6, title: 'Remarks & Restrictions',
      body: 'LTL/PTL, Final Attack Heading, Bedrohungen & SEAD, Airspace Coordination Areas, Danger Close + Initialen, TOT/TTT, Post-Launch-Abort, gewünschte Bewaffnung.',
      form: 'remarks' },
    { n: 7, title: 'Readbacks',
      body: 'Pilot liest Pflicht-Zeilen zurück (9-Line: 4, 6 + Restriktionen; 5-Line: 2, 3 + Restriktionen). Mit „Good readback" bestätigen oder korrigieren.' },
    { n: 8, title: 'Target Correlation / Talk-On',
      body: 'Sicherstellen, dass Pilot & JTAC dasselbe Ziel sehen: Talk-On in Klartext, erweiterte Zielbeschreibung, Markierung, Video-Downlink.' },
    { n: 9, title: 'Attack',
      body: 'Pilot „push" zum Ziel geben → „inbound" → „Cleared Hot" (Typ 1/2) oder „Cleared to Engage" (Typ 3) → Pilot meldet „Pickle" / „Rifle" / „Guns".' },
    { n: 10, title: 'Assess Effects',
      body: 'Einschlag beobachten („Splash"), Schaden bewerten. „Shack" = Treffer im Ziel, „Good effects" / „No effects".' },
    { n: 11, title: 'BDA (SALT-R)',
      body: 'Battle Damage Assessment im SALT-R-Format: Size, Activity, Location, Time, Remarks. Ggf. Re-Attack mit Änderungen anordnen.',
      form: 'bda' },
    { n: 12, title: 'Routing & Safety of Flight',
      body: 'Route aus dem Kampfgebiet zurück zu HA/HP geben, Safety-of-Flight-Briefing (wie Schritt 1).' }
  ],

  // ============================================================
  // FORMATE MIT SATZ-VORLAGEN
  // Jede Zeile hat: fields (Sub-Felder) + sent (Satz-Erzeugung)
  // sent(v, ctx) → string|null  (null/leer = Zeile fällt weg)
  // ctx = { all: alle Werte, profile, pilot, jtac }
  // ============================================================

  // ---------- 5-Line CAS (Rotary / AC-130) – FOKUS ----------
  cas5: {
    name: '5-Line CAS',
    use: 'Rotary-Wing (Helikopter) & AC-130',
    briefName: '5-Line',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, ready for 5-Line?`,
      `${ctx.pilot}, this is ${ctx.jtac}, 5-Line`
    ],
    lines: [
      { n: 1, key: 'gameplan', short: 'GP', label: 'Game Plan', rb: false,
        fields: [
          { key: 'control', type: 'select', label: 'Type', ph: 'Kontrolltyp', options: [
            { v: 'Type 1', t: 'Type 1' }, { v: 'Type 2', t: 'Type 2' }, { v: 'Type 3', t: 'Type 3' } ] },
          { key: 'moa', type: 'select', label: 'MOA', options: [
            { v: 'BOT', t: 'BOT – Bomb on Target' }, { v: 'BOC', t: 'BOC – Bomb on Coordinate' } ] },
          { key: 'count', type: 'text', label: '#', ph: 'Anzahl', width: '90px', list: 'count-list' },
          { key: 'ordnance', type: 'text', label: 'Ordnance', ph: 'z. B. 114 Kilo', list: 'ordnance-list' }
        ],
        sent: (v) => {
          const p = [];
          if (v.control) p.push(v.control + ' control');
          if (v.moa) p.push(v.moa);
          if (v.count) p.push(v.count + ' times');
          if (v.ordnance) p.push(v.ordnance);
          return p.length ? p.join(', ') : null;
        } },
      { n: 2, key: 'friendly', short: 'Friend', label: 'Friendly Location / Mark', rb: true,
        fields: [
          { key: 'loc', type: 'text', label: 'Lage', ph: 'z. B. 200 m westlich des Ziels' },
          { key: 'mark', type: 'select', label: 'Mark', options: [
            { v: 'smoke', t: 'Smoke' }, { v: 'IR strobe', t: 'IR Strobe' }, { v: 'laser', t: 'Laser' },
            { v: 'IR pointer', t: 'IR Pointer' }, { v: 'panel', t: 'Panel' }, { v: 'no mark', t: 'No Mark' } ] }
        ],
        sent: (v) => {
          if (!v.loc && !v.mark) return null;
          const parts = ['Friendly position is'];
          if (v.loc) parts.push(v.loc);
          if (v.mark) parts.push('marked by', v.mark);
          return parts.join(' ');
        } },
      { n: 3, key: 'target', short: 'Target', label: 'Target Location', rb: true,
        fields: [
          { key: 'grid', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976 (6-stellig)', mono: true },
          { key: 'ref', type: 'text', label: 'Alternativ', ph: 'z. B. Bearing/Distanz oder Referenz' }
        ],
        sent: (v) => {
          if (v.grid) return `Target is on grid ${v.grid}`;
          if (v.ref) return `Target is ${v.ref}`;
          return null;
        } },
      { n: 4, key: 'desc', short: 'DESC', label: 'Target Description / Mark', rb: false,
        fields: [
          { key: 'desc', type: 'text', label: 'Beschreibung', ph: 'z. B. BTR-42A', list: 'target-list' },
          { key: 'mark', type: 'select', label: 'Mark', options: [
            { v: 'laser', t: 'Laser' }, { v: 'smoke', t: 'Smoke' }, { v: 'IR pointer', t: 'IR Pointer' },
            { v: 'IR strobe', t: 'IR Strobe' }, { v: 'no mark', t: 'No Mark' } ] }
        ],
        sent: (v) => {
          if (!v.desc && !v.mark) return null;
          const parts = ['Target is'];
          if (v.desc) parts.push(v.desc);
          if (v.mark) parts.push('marked by', v.mark);
          return parts.join(' ');
        } },
      { n: 5, key: 'remarks', short: 'Rmks', label: 'Remarks & Restrictions', rb: true,
        fields: [
          { key: 'ltl', type: 'text', label: 'LTL/PTL', ph: 'z. B. 342', width: '110px' },
          { key: 'fah', type: 'text', label: 'FAH', ph: 'z. B. 010', width: '110px' },
          { key: 'dc', type: 'text', label: 'Danger Close', ph: 'z. B. 270 m' },
          { key: 'extra', type: 'text', label: 'Weitere', ph: 'z. B. TOT 1600 Zulu' }
        ],
        sent: (v) => {
          const p = [];
          if (v.ltl) p.push(`Laser to target line ${v.ltl}`);
          if (v.fah) p.push(`final attack heading ${v.fah}`);
          if (v.dc) p.push(`danger close ${v.dc}`);
          if (v.extra) p.push(v.extra);
          return p.length ? p.join(', ') : null;
        } }
    ]
  },

  // ---------- 9-Line CAS (Fixed-Wing) ----------
  cas9: {
    name: '9-Line CAS',
    use: 'Fixed-Wing (Kampfjets, Bomber)',
    briefName: '9-Line',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, ready to copy 9-Line, over`,
      `${ctx.pilot}, this is ${ctx.jtac}, 9-Line`
    ],
    lines: [
      { n: 1, key: 'cp', short: 'CP', label: 'Control Point', rb: false,
        fields: [{ key: 'cp', type: 'text', label: 'IP/BP/Keyhole', ph: 'z. B. IP Alpha', mono: true }],
        sent: (v) => v.cp ? `Control point is ${v.cp}` : null },
      { n: 2, key: 'dir', short: 'Dir', label: 'Target Direction & Offset', rb: false,
        fields: [{ key: 'dir', type: 'text', label: 'Richtung', ph: 'z. B. 280° / rechts 500 m', mono: true }],
        sent: (v) => v.dir ? `Target direction ${v.dir}` : null },
      { n: 3, key: 'dist', short: 'Dist', label: 'Target Distance', rb: false,
        fields: [{ key: 'dist', type: 'text', label: 'Distanz', ph: 'z. B. 8 km', mono: true }],
        sent: (v) => v.dist ? `Target is ${v.dist} from the control point` : null },
      { n: 4, key: 'elev', short: 'ELV', label: 'Target Altitude (MSL)', rb: true,
        fields: [{ key: 'elev', type: 'text', label: 'Höhe', ph: 'z. B. 120 m MSL', mono: true }],
        sent: (v) => v.elev ? `Target elevation ${v.elev}` : null },
      { n: 5, key: 'desc', short: 'DESC', label: 'Target Description', rb: false,
        fields: [{ key: 'desc', type: 'text', label: 'Beschreibung', ph: 'z. B. T-90, Kompanie', list: 'target-list' }],
        sent: (v) => v.desc ? `Target is ${v.desc}` : null },
      { n: 6, key: 'grid', short: 'GRID', label: 'Target Coordinates', rb: true,
        fields: [{ key: 'grid', type: 'text', label: 'Grid', ph: 'z. B. 35S LE 20476 18769', mono: true }],
        sent: (v) => v.grid ? `Target is on grid ${v.grid}` : null },
      { n: 7, key: 'mark', short: 'Mark', label: 'Marker Type', rb: false,
        fields: [{ key: 'mark', type: 'text', label: 'Mark', ph: 'z. B. Lase 1688', list: 'mark-list', mono: true }],
        sent: (v) => v.mark ? `Marked by ${v.mark}` : null },
      { n: 8, key: 'friend', short: 'Friend', label: 'Friendly Position', rb: true,
        fields: [{ key: 'friend', type: 'text', label: 'Eigene Kräfte', ph: 'z. B. 200 m südlich, kein Kontakt', mono: true }],
        sent: (v) => v.friend ? `Friendlies are ${v.friend}` : null },
      { n: 9, key: 'egress', short: 'Egress', label: 'Egress & Routing', rb: false,
        fields: [{ key: 'egress', type: 'text', label: 'Egress', ph: 'z. B. Egress Nord, dann HA Alpha', mono: true }],
        sent: (v) => v.egress ? `Egress ${v.egress}` : null }
    ]
  },

  // ---------- 9-Line MEDEVAC / CASEVAC ----------
  medevac: {
    name: '9-Line MEDEVAC/CASEVAC',
    use: 'Medizinische Evakuierung',
    briefName: '9-Line MEDEVAC',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, MEDEVAC 9-Line, over`
    ],
    lines: [
      { n: 1, key: 'loc', short: 'Loc', label: 'Location of Pickup Site', rb: true,
        fields: [{ key: 'loc', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.loc ? `Pickup site is at grid ${v.loc}` : null },
      { n: 2, key: 'freq', short: 'Freq', label: 'Callsign & Frequency', rb: true,
        fields: [{ key: 'freq', type: 'text', label: 'Funk', ph: 'z. B. Ch. 2 TAD / SPIRIT 7-X', mono: true }],
        sent: (v) => v.freq ? `Requesting on ${v.freq}` : null },
      { n: 3, key: 'precedence', short: 'Prec', label: 'Patients by Precedence', rb: true,
        fields: [
          { key: 'A', type: 'num', label: 'A Urgent' }, { key: 'B', type: 'num', label: 'B Urg-Surg' },
          { key: 'C', type: 'num', label: 'C Priority' }, { key: 'D', type: 'num', label: 'D Routine' }, { key: 'E', type: 'num', label: 'E Conv' }
        ],
        sent: (v) => {
          const p = [];
          if (v.A) p.push(`${v.A} urgent`);
          if (v.B) p.push(`${v.B} urgent surgical`);
          if (v.C) p.push(`${v.C} priority`);
          if (v.D) p.push(`${v.D} routine`);
          if (v.E) p.push(`${v.E} convenience`);
          return p.length ? `Patients: ${p.join(', ')}` : null;
        } },
      { n: 4, key: 'equip', short: 'Equip', label: 'Special Equipment', rb: true,
        fields: [{ key: 'equip', type: 'select', label: 'Ausrüstung', options: [
          { v: 'A – none', t: 'A – None' }, { v: 'B – hoist', t: 'B – Hoist' },
          { v: 'C – extraction', t: 'C – Extraction Equipment' }, { v: 'D – ventilation', t: 'D – Ventilation' } ] }],
        sent: (v) => v.equip ? `Special equipment ${v.equip}` : null },
      { n: 5, key: 'type', short: 'Type', label: 'Patients by Type',
        fields: [{ key: 'L', type: 'num', label: 'L Litter' }, { key: 'A', type: 'num', label: 'A Ambulatory' }],
        sent: (v) => {
          const p = [];
          if (v.L) p.push(`${v.L} litter`);
          if (v.A) p.push(`${v.A} ambulatory`);
          return p.length ? `Patients: ${p.join(', ')}` : null;
        } },
      { n: 6, key: 'security', short: 'Sec', label: 'Security at Pickup Site', rb: true,
        fields: [{ key: 'security', type: 'select', label: 'Sicherheit', options: [
          { v: 'N – no enemy', t: 'N – No enemy troops in area' }, { v: 'P – possible enemy', t: 'P – Possible enemy (caution)' },
          { v: 'E – enemy in area', t: 'E – Enemy troops in area (caution)' }, { v: 'X – escort required', t: 'X – Enemy troops (armed escort required)' } ] }],
        sent: (v) => v.security ? `Security at pickup site: ${v.security}` : null },
      { n: 7, key: 'mark', short: 'Mark', label: 'Method of Marking', rb: true,
        fields: [{ key: 'mark', type: 'select', label: 'Markierung', options: [
          { v: 'A – panel', t: 'A – Panel' }, { v: 'B – pyro', t: 'B – Pyrotechnic Signal' },
          { v: 'C – smoke', t: 'C – Smoke Signal' }, { v: 'D – none', t: 'D – None' }, { v: 'E – other', t: 'E – Other' } ] }],
        sent: (v) => v.mark ? `Marked by method ${v.mark}` : null },
      { n: 8, key: 'nat', short: 'Nat', label: 'Patient Nationality & Status',
        fields: [{ key: 'nat', type: 'select', label: 'Nationalität', options: [
          { v: 'A – US military', t: 'A – US Military' }, { v: 'B – US civilian', t: 'B – US Civilian' },
          { v: 'C – non-US military', t: 'C – Non-US Military' }, { v: 'D – non-US civilian', t: 'D – Non-US Civilian' },
          { v: 'E – POW', t: 'E – Enemy Prisoner of War' } ] }],
        sent: (v) => v.nat ? `Patient nationality ${v.nat}` : null },
      { n: 9, key: 'cbrn', short: 'CBRN', label: 'Patient CBRN Status',
        fields: [{ key: 'cbrn', type: 'select', label: 'CBRN', options: [
          { v: 'N', t: 'N – Nuclear' }, { v: 'B', t: 'B – Biological' }, { v: 'C', t: 'C – Chemical' }, { v: 'keine', t: 'Keine' } ] }],
        sent: (v) => v.cbrn && v.cbrn !== 'keine' ? `CBRN status ${v.cbrn}` : null }
    ]
  },

  // ---------- HLZ Brief – FOKUS ----------
  hlz: {
    name: 'HLZ Brief',
    use: 'Helikopter-Landeplatz',
    briefName: 'HLZ Brief',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, ready for HLZ brief, over`,
      `${ctx.pilot}, this is ${ctx.jtac}, HLZ brief`
    ],
    lines: [
      { n: 1, key: 'loc', short: 'Loc', label: 'HLZ Location', rb: true,
        fields: [{ key: 'loc', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.loc ? `Landing zone is at grid ${v.loc}` : null },
      { n: 2, key: 'mark', short: 'Mark', label: 'HLZ Marker Type',
        fields: [{ key: 'mark', type: 'select', label: 'Markierung', options: [
          { v: 'panel', t: 'Panel' }, { v: 'pyrotechnic signal', t: 'Pyrotechnic Signal' },
          { v: 'smoke', t: 'Smoke Signal' }, { v: 'IR', t: 'IR' }, { v: 'ATAK marker', t: 'ATAK Marker' },
          { v: 'other', t: 'Other' }, { v: 'none', t: 'None' } ] }],
        sent: (v) => v.mark ? `Marked by ${v.mark}` : null },
      { n: 3, key: 'obstacles', short: 'Obs', label: 'Obstacles / Hazards',
        fields: [{ key: 'obstacles', type: 'text', label: 'Hindernisse', ph: 'z. B. Hochspannung 100 m westlich' }],
        sent: (v) => v.obstacles ? `Obstacles: ${v.obstacles}` : null },
      { n: 4, key: 'friendly', short: 'Friend', label: 'Friendly SITREP',
        fields: [{ key: 'friendly', type: 'text', label: 'Eigene Lage', ph: 'z. B. 12 PAX, 2 EPW, 100 m nordöstlich' }],
        sent: (v) => v.friendly ? `Friendly sitrep: ${v.friendly}` : null },
      { n: 5, key: 'enemy', short: 'Enemy', label: 'HLZ Security',
        fields: [{ key: 'enemy', type: 'select', label: 'Sicherheit', options: [
          { v: 'green', t: 'Green – HLZ secure' }, { v: 'yellow', t: 'Yellow – possible enemy IVO HLZ' },
          { v: 'red', t: 'Red – enemy IVO HLZ' } ] }],
        sent: (v) => v.enemy ? `Security is ${v.enemy}` : null },
      { n: 6, key: 'remarks', short: 'Rmks', label: 'Remarks & Restrictions', rb: true,
        fields: [{ key: 'remarks', type: 'text', label: 'Hinweise', ph: 'z. B. Final approach heading 010, Ziel nach Pickup' }],
        sent: (v) => v.remarks ? `${v.remarks}` : null }
    ]
  },

  // ---------- SOF Gunship Call for Fire ----------
  gunship: {
    name: 'SOF Gunship Call for Fire',
    use: 'AC-130 / Gunship-Unterstützung',
    briefName: 'Gunship Fire Mission',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, fire mission, over`
    ],
    lines: [
      { n: 1, key: 'warno', short: 'Warno', label: 'Warning Order',
        fields: [{ key: 'warno', type: 'text', label: 'Warno', ph: 'z. B. GHOSTRIDER 1-1, LONGBOW 1, Fire Mission' }],
        sent: (v) => v.warno ? v.warno : null },
      { n: 2, key: 'friendly', short: 'Friend', label: 'Friendly Location & Marker',
        fields: [{ key: 'friendly', type: 'text', label: 'Eigene Lage', ph: 'z. B. 200 m nordwestlich, IR-Strobe' }],
        sent: (v) => v.friendly ? `Friendly position is ${v.friendly}` : null },
      { n: 3, key: 'target', short: 'Target', label: 'Target Location', rb: true,
        fields: [{ key: 'target', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.target ? `Target is on grid ${v.target}` : null },
      { n: 4, key: 'desc', short: 'DESC', label: 'Target Description & Marker',
        fields: [{ key: 'desc', type: 'text', label: 'Ziel', ph: 'z. B. 2 technicals, Lase 1688' }],
        sent: (v) => v.desc ? `Target is ${v.desc}` : null },
      { n: 5, key: 'remarks', short: 'Rmks', label: 'Remarks & Restrictions', rb: true,
        fields: [{ key: 'remarks', type: 'text', label: 'Hinweise', ph: 'z. B. GTL 045, Min Safe Alt 5000 ft' }],
        sent: (v) => v.remarks ? v.remarks : null }
    ]
  },

  // ---------- RPAS (UAV) ----------
  rpas: {
    name: 'RPAS CAS Brief',
    use: 'UAV (z. B. AVENGER 9 / MQ-9)',
    briefName: 'RPAS CAS Brief',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, RPAS CAS brief, over`
    ],
    lines: [
      { n: 1, key: 'gameplan', short: 'GP', label: 'Game Plan',
        fields: [{ key: 'gameplan', type: 'text', label: 'Game Plan', ph: 'z. B. Type 3, BOC, GBU-12' }],
        sent: (v) => v.gameplan ? v.gameplan : null },
      { n: 2, key: 'target', short: 'Target', label: 'Target Location', rb: true,
        fields: [{ key: 'target', type: 'text', label: 'Grid', ph: 'z. B. 8–10-stellig', mono: true }],
        sent: (v) => v.target ? `Target is on grid ${v.target}` : null },
      { n: 3, key: 'elev', short: 'ELV', label: 'Target Elevation (MSL)', rb: true,
        fields: [{ key: 'elev', type: 'text', label: 'Höhe', ph: 'z. B. 95 m MSL', mono: true }],
        sent: (v) => v.elev ? `Target elevation ${v.elev}` : null },
      { n: 4, key: 'friendly', short: 'Friend', label: 'Closest Friendlies',
        fields: [{ key: 'friendly', type: 'text', label: 'Eigene Kräfte', ph: 'z. B. 400 m südlich, kein Mark' }],
        sent: (v) => v.friendly ? `Friendlies are ${v.friendly}` : null },
      { n: 5, key: 'remarks', short: 'Rmks', label: 'Remarks & Restrictions', rb: true,
        fields: [{ key: 'remarks', type: 'text', label: 'Hinweise', ph: 'z. B. Danger close 280 m, FAH 090' }],
        sent: (v) => v.remarks ? v.remarks : null }
    ]
  },

  // ---------- ALZ ----------
  alz: {
    name: 'ALZ Brief',
    use: 'Improvisierte Landezone',
    briefName: 'ALZ Brief',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, ALZ brief, over`
    ],
    lines: [
      { n: 1, key: 'loc', short: 'Loc', label: 'ALZ Location', rb: true,
        fields: [{ key: 'loc', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.loc ? `ALZ is at grid ${v.loc}` : null },
      { n: 2, key: 'ground', short: 'Ground', label: 'Ground Type',
        fields: [{ key: 'ground', type: 'select', label: 'Boden', options: [
          { v: 'dirt soft', t: 'Dirt (Soft)' }, { v: 'dirt compact', t: 'Dirt (Compact)' },
          { v: 'gravel soft', t: 'Gravel (Soft)' }, { v: 'gravel compact', t: 'Gravel (Compact)' },
          { v: 'cement', t: 'Cement (Road/Slabs)' }, { v: 'unkempt', t: 'Unkempt (Foliage/Mixed)' } ] }],
        sent: (v) => v.ground ? `Ground type is ${v.ground}` : null },
      { n: 3, key: 'elev', short: 'ELV', label: 'ALZ Elevation (MSL)', rb: true,
        fields: [{ key: 'elev', type: 'text', label: 'Höhe', ph: 'z. B. 140 m MSL', mono: true }],
        sent: (v) => v.elev ? `ALZ elevation ${v.elev}` : null },
      { n: 4, key: 'bearing', short: 'Brg', label: 'ALZ Bearing', rb: true,
        fields: [{ key: 'bearing', type: 'text', label: 'Peilung', ph: 'z. B. 120°', mono: true }],
        sent: (v) => v.bearing ? `ALZ bearing ${v.bearing}` : null },
      { n: 5, key: 'length', short: 'Len', label: 'ALZ Length (m)', rb: true,
        fields: [{ key: 'length', type: 'text', label: 'Länge', ph: 'z. B. 800 m', mono: true }],
        sent: (v) => v.length ? `ALZ length ${v.length} meters` : null },
      { n: 6, key: 'mark', short: 'Mark', label: 'ALZ Marker',
        fields: [{ key: 'mark', type: 'select', label: 'Markierung', options: [
          { v: 'panel', t: 'Panel' }, { v: 'pyrotechnic', t: 'Pyrotechnic' }, { v: 'smoke', t: 'Smoke' },
          { v: 'IR', t: 'IR' }, { v: 'other', t: 'Other' }, { v: 'none', t: 'None' } ] }],
        sent: (v) => v.mark ? `Marked by ${v.mark}` : null },
      { n: 7, key: 'weather', short: 'Wx', label: 'Weather',
        fields: [{ key: 'weather', type: 'text', label: 'Wetter', ph: 'z. B. 3 km Sicht, Wind 270/12' }],
        sent: (v) => v.weather ? `Weather: ${v.weather}` : null },
      { n: 8, key: 'enemy', short: 'Enemy', label: 'ALZ Security',
        fields: [{ key: 'enemy', type: 'select', label: 'Sicherheit', options: [
          { v: 'green', t: 'Green – ALZ secure' }, { v: 'yellow', t: 'Yellow – possible enemy IVO ALZ' },
          { v: 'red', t: 'Red – enemy IVO ALZ' } ] }],
        sent: (v) => v.enemy ? `Security is ${v.enemy}` : null },
      { n: 9, key: 'ondeck', short: 'OnDeck', label: 'Time on Deck',
        fields: [{ key: 'ondeck', type: 'text', label: 'Zeit am Boden', ph: 'z. B. 5 min' }],
        sent: (v) => v.ondeck ? `Time on deck ${v.ondeck}` : null }
    ]
  },

  // ---------- Airdrop ----------
  airdrop: {
    name: 'Airdrop Brief',
    use: 'Fallschirmabwurf',
    briefName: 'Airdrop Brief',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, airdrop brief, over`
    ],
    lines: [
      { n: 1, key: 'poi', short: 'POI', label: 'Point of Impact', rb: true,
        fields: [{ key: 'poi', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.poi ? `Point of impact is at grid ${v.poi}` : null },
      { n: 2, key: 'elev', short: 'ELV', label: 'POI Elevation (MSL)', rb: true,
        fields: [{ key: 'elev', type: 'text', label: 'Höhe', ph: 'z. B. 60 m MSL', mono: true }],
        sent: (v) => v.elev ? `POI elevation ${v.elev}` : null },
      { n: 3, key: 'heading', short: 'FAH', label: 'Final Approach Heading', rb: true,
        fields: [{ key: 'heading', type: 'text', label: 'Kurs', ph: 'z. B. 090', mono: true }],
        sent: (v) => v.heading ? `Final approach heading ${v.heading}` : null },
      { n: 4, key: 'desc', short: 'DESC', label: 'POI Description & Marker',
        fields: [{ key: 'desc', type: 'text', label: 'Beschreibung/Mark', ph: 'z. B. Panel, offene Fläche' }],
        sent: (v) => v.desc ? `POI is ${v.desc}` : null },
      { n: 5, key: 'friendly', short: 'Friend', label: 'Friendly Location',
        fields: [{ key: 'friendly', type: 'text', label: 'Eigene Kräfte', ph: 'z. B. 500 m östlich, kein Mark' }],
        sent: (v) => v.friendly ? `Friendlies are ${v.friendly}` : null },
      { n: 6, key: 'winds', short: 'Winds', label: 'Surface Winds',
        fields: [{ key: 'winds', type: 'text', label: 'Wind', ph: 'z. B. 240/12 kts' }],
        sent: (v) => v.winds ? `Surface winds ${v.winds}` : null },
      { n: 7, key: 'remarks', short: 'Rmks', label: 'Remarks',
        fields: [{ key: 'remarks', type: 'text', label: 'Hinweise', ph: 'z. B. Danger close 400 m' }],
        sent: (v) => v.remarks ? v.remarks : null }
    ]
  },

  // ---------- Call for Fire ----------
  cff: {
    name: 'Call for Fire',
    use: 'Artillerie / Mörser',
    briefName: 'Call for Fire',
    intro: (ctx) => [
      `${ctx.jtac}, call for fire, over`
    ],
    lines: [
      { n: 1, key: 'observer', short: 'Obs', label: 'Observer ID',
        fields: [{ key: 'observer', type: 'text', label: 'Kennung', ph: 'z. B. LONGBOW 1' }],
        sent: (v) => v.observer ? `Observer ${v.observer}` : null },
      { n: 2, key: 'warno', short: 'Warno', label: 'WARNO',
        fields: [{ key: 'warno', type: 'select', label: 'Mission', options: [
          { v: 'adjust fire', t: 'Adjust Fire' }, { v: 'fire for effect', t: 'Fire For Effect' },
          { v: 'suppression', t: 'Suppression' }, { v: 'immediate suppression', t: 'Immediate Suppression' } ] }],
        sent: (v) => v.warno ? `${v.warno}, over` : null },
      { n: 3, key: 'target', short: 'Target', label: 'Target Location',
        fields: [{ key: 'target', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.target ? `Target is on grid ${v.target}` : null },
      { n: 4, key: 'desc', short: 'DESC', label: 'Target Description',
        fields: [{ key: 'desc', type: 'text', label: 'Ziel', ph: 'z. B. 3 technicals, gedeckt' }],
        sent: (v) => v.desc ? `Target is ${v.desc}` : null },
      { n: 5, key: 'moe', short: 'MOE', label: 'Method of Engagement',
        fields: [{ key: 'moe', type: 'text', label: 'Engagement', ph: 'z. B. Precision Fire, High, HE VT, 6 Runden' }],
        sent: (v) => v.moe ? `Method of engagement ${v.moe}` : null },
      { n: 6, key: 'mfc', short: 'MFC', label: 'Method of Fire Control',
        fields: [{ key: 'mfc', type: 'text', label: 'Feuerkontrolle', ph: 'z. B. At my command' }],
        sent: (v) => v.mfc ? `${v.mfc}` : null }
    ]
  },

  // ---------- CCA 5-Line ----------
  cca: {
    name: 'CCA 5-Line',
    use: 'Joint Fires Observer / CCA',
    briefName: 'CCA 5-Line',
    intro: (ctx) => [
      `${ctx.pilot}, this is ${ctx.jtac}, CCA 5-Line, over`
    ],
    lines: [
      { n: 1, key: 'observer', short: 'Obs', label: 'Observer / Game Plan',
        fields: [{ key: 'observer', type: 'text', label: 'Observer', ph: 'z. B. FOX 2-1, Type 2, BOC' }],
        sent: (v) => v.observer ? v.observer : null },
      { n: 2, key: 'friendly', short: 'Friend', label: 'Friendly Location', rb: true,
        fields: [{ key: 'friendly', type: 'text', label: 'Eigene Lage', ph: 'z. B. 250 m nördlich des Ziels' }],
        sent: (v) => v.friendly ? `Friendly position is ${v.friendly}` : null },
      { n: 3, key: 'target', short: 'Target', label: 'Target Location', rb: true,
        fields: [{ key: 'target', type: 'text', label: 'Grid', ph: 'z. B. 0453 0976', mono: true }],
        sent: (v) => v.target ? `Target is on grid ${v.target}` : null },
      { n: 4, key: 'desc', short: 'DESC', label: 'Target Description',
        fields: [{ key: 'desc', type: 'text', label: 'Ziel', ph: 'z. B. T-72 im Hangar' }],
        sent: (v) => v.desc ? `Target is ${v.desc}` : null },
      { n: 5, key: 'mark', short: 'Mark', label: 'Target Marker',
        fields: [{ key: 'mark', type: 'text', label: 'Mark', ph: 'z. B. grün Rauch / Lase 1212' }],
        sent: (v) => v.mark ? `Marked by ${v.mark}` : null }
    ]
  },

  // ============================================================
  // CAS CHECK-IN / TEFACHR / GAME PLAN / REMARKS / BDA (Workflow)
  // ============================================================
  checkinFields: [
    { key: 'callsign', label: 'Callsign', ph: 'z. B. HAVOC 1-1' },
    { key: 'mission',  label: 'Missionsnummer', ph: 'z. B. 15-2 / ATO-Nr.' },
    { key: 'aircraft', label: 'Anzahl & Typ', ph: 'z. B. 2x A-10C' },
    { key: 'position', label: 'Position & Höhe', ph: 'z. B. HA Alpha, 5000 ft' },
    { key: 'ordnance', label: 'Bewaffnung', ph: 'z. B. 4x Maverick, 12x Paveway, 19x Hydra, Guns' },
    { key: 'playtime', label: 'Playtime / TOS', ph: 'z. B. 40 min' },
    { key: 'capabilities', label: 'Fähigkeiten', ph: 'z. B. Laser Spot Tracker, VDL, IR Pointer' },
    { key: 'abort', label: 'Abort Code', ph: 'z. B. „abort in the clear" (Default 3x Abort)' }
  ],

  tefachrFields: [
    { key: 'threat',   label: 'Threat', ph: 'z. B. AAA bei Grid 123 456, MANPADS möglich' },
    { key: 'enemy',    label: 'Enemy Situation', ph: 'z. B. Zug Stärke, 3 BTR, Richtung Nord' },
    { key: 'friendly', label: 'Friendly Update', ph: 'z. B. 1. Zug hält Linie, Vorstoß nach Osten' },
    { key: 'artillery',label: 'Artillery', ph: 'z. B. 2x M119, GTL 045° aktiv' },
    { key: 'clearance',label: 'Clearance Authority', ph: 'z. B. Cdr. Miller (JM), Initialen "JM"' },
    { key: 'hazards',  label: 'Hazards', ph: 'z. B. Türme, Min Safe Alt 3000 ft, CBRN möglich' },
    { key: 'remarks',  label: 'Remarks & Restrictions', ph: 'z. B. CAS-Absicht, Restriktionen, ACM/FSCM-Änderungen' }
  ],

  gameplanFields: [
    { key: 'control', label: 'Type of Control', short: 'Typ', select: [
      { v: 'Type 1', t: 'Type 1 – JTAC sieht Ziel UND Flugzeug → „Cleared Hot" (1 Angriff)' },
      { v: 'Type 2', t: 'Type 2 – JTAC sieht Ziel ODER Flugzeug → „Cleared Hot" (1 Angriff)' },
      { v: 'Type 3', t: 'Type 3 – JTAC sieht keins von beidem → „Cleared to Engage" (mehrere Angriffe)' }
    ]},
    { key: 'moa', label: 'Method of Attack', short: 'MOA', select: [
      { v: 'BOT', t: 'BOT – Bomb On Target (Pilot sieht Ziel, 6-stellig genügt)' },
      { v: 'BOC', t: 'BOC – Bomb On Coordinate (8–10-stelliges Grid, GPS-Waffen)' }
    ]},
    { key: 'ordnance', label: 'Ordnance / Desired Effect', ph: 'z. B. GBU-12, Zerstörung' },
    { key: 'interval', label: 'Interval', ph: 'z. B. 5 s / Salve' }
  ],

  remarksFields: [
    { key: 'fah',     label: 'Final Attack Heading', ph: 'z. B. 010 (immer 3-stellig)' },
    { key: 'ltlptl',  label: 'LTL / PTL', ph: 'z. B. LTL 320°' },
    { key: 'threats', label: 'Threats & SEAD', ph: 'z. B. ZSU-23 bei 123 456, SEAD aktiv' },
    { key: 'aca',     label: 'Airspace Coordination Areas', ph: 'z. B. ACA Nord frei' },
    { key: 'dangerclose', label: 'Danger Close + Initialen', ph: 'z. B. DC 270 m, Initialen JM' },
    { key: 'tot',     label: 'TOT / TTT', ph: 'z. B. TOT 16:00 Zulu' },
    { key: 'abort',   label: 'Post-Launch Abort Restrictions', ph: 'z. B. keine' },
    { key: 'weapons', label: 'Desired Ordnance / Effects', ph: 'z. B. nur Guns' }
  ],

  bdaFields: [
    { key: 'size',     label: 'Size', ph: 'z. B. 3 Fahrzeuge zerstört' },
    { key: 'activity', label: 'Activity', ph: 'z. B. kein weiteres Feuer' },
    { key: 'location', label: 'Location', ph: 'z. B. 0453 0976' },
    { key: 'time',     label: 'Time', ph: 'z. B. 16:02 Zulu' },
    { key: 'remarks',  label: 'Remarks', ph: 'z. B. Re-Attack mit Guns empfohlen' }
  ],

  // ============================================================
  // DANGER CLOSE
  // ============================================================
  dangerClose: {
    note: 'Wenn die verwendete Waffe nicht gelistet ist, gilt DANGER CLOSE: 400 m. Ist das Ziel innerhalb des Radius zu eigenen Truppen: „Cleared Danger Close" + Initialen des Kommandeurs.',
    default: 400,
    groups: [
      { name: 'Bomben', items: [
        { w: 'MK-82', g: 'N/A', d: 285 }, { w: 'GBU-12 (Laser 500 lb)', g: 'Laser', d: 270 },
        { w: 'GBU-16 (Laser 1000 lb)', g: 'Laser', d: null }, { w: 'GBU-10 (Laser 2000 lb)', g: 'Laser', d: null },
        { w: 'GBU-24 (Laser 2000 lb)', g: 'Laser', d: 380 }, { w: 'GBU-31 (GPS 2000 lb)', g: 'GPS', d: 465 },
        { w: 'GBU-32 (GPS 1000 lb)', g: 'GPS', d: 340 }, { w: 'GBU-38 (GPS 500 lb)', g: 'GPS', d: 270 },
        { w: 'GBU-39 (GPS/Laser)', g: 'GPS/Laser', d: 225 }, { w: 'GBU-49 (GPS/Laser)', g: 'GPS/Laser', d: 565 },
        { w: 'GBU-53 (GPS/Laser/IR/Radar)', g: 'SDB', d: 185 }, { w: 'GBU-54 (GPS/Laser 500 lb)', g: 'GPS/Laser', d: 280 },
        { w: 'CBU-87', g: 'N/A', d: 245 }, { w: 'CBU-103', g: 'GPS', d: 225 }
      ]},
      { name: 'Raketen', items: [
        { w: 'Hydra 70 (ungelenkt)', g: 'N/A', d: 270 }, { w: 'Hydra 70 APKWS (Laser)', g: 'Laser', d: 105 },
        { w: 'Hydra 70 DAGR', g: 'Laser', d: 105 }, { w: 'AGM-65 Maverick', g: 'IR', d: 175 },
        { w: 'AGM-114K/N Hellfire', g: 'Laser', d: 115 }, { w: 'AGM-114L Hellfire', g: 'Radar', d: 115 }
      ]},
      { name: 'Bordgeschütze', items: [
        { w: '30 mm HEDP', g: 'Gun', d: 200 }, { w: 'SOF Gunship 7.62 Miniguns', g: 'Gun', d: 100 },
        { w: '20 mm', g: 'Gun', d: 150 }, { w: '25 mm GAU-12 Equalizer', g: 'Gun', d: 60 },
        { w: '40 mm L60 Bofors', g: 'Gun', d: 80 }, { w: '105 mm M102 Howitzer (AC-130)', g: 'Gun', d: 160 }
      ]}
    ]
  },

  // ============================================================
  // KEYHOLE & ALTITUDE BLOCKS
  // ============================================================
  altitudeBlocks: [
    { block: 1, alt: 'unter 200 ft', ref: 'unter Cherubs 2' },
    { block: 2, alt: '400 – 800 ft', ref: 'Cherubs 4 – 8' },
    { block: 3, alt: '1000 – 2000 ft', ref: 'Angels 1 – 2' },
    { block: 4, alt: '3000 – 5000 ft', ref: 'Angels 3 – 5' },
    { block: 5, alt: 'über 10.000 ft', ref: 'über Angels 10' }
  ],
  keyhole: [
    'Keyhole-Methode: IP/BP/HA ohne feste Kontrollpunkte festlegen.',
    'Fixed-Wing: Distanz in km vom „Echo-Point" (oft das Ziel selbst).',
    'Rotary-Wing: Distanz in km zum Zentrum der BP; Standard-BP = 300 m × 300 m.',
    '„Maintain Echo (Distanz)" oder „maintain overhead (Grid, Distanz)" zum Loitern außerhalb der Distanz.'
  ],

  // ============================================================
  // CGF 160th SOAR AIRFRAMES
  // ============================================================
  airframes: {
    transport: [
      { cs: 'PRINCE 6-X', name: 'MH-60M', info: '2× M134 (5000 RND) · Seats 14 PAX', feat: 'Laser, IR, FRIES', crew: '1× Pilot + 1× Co-Pilot (optional)' },
      { cs: 'BUFFALO 2-X', name: 'MH-47G', info: '2× M134 (5000 RND) · Seats 57 PAX · MRZR4 ×2 · Assault Boat ×1', feat: 'Laser, IR', crew: '2× Crew (Pilot, Co-Pilot) – required' },
      { cs: 'VALIANT 5-X', name: 'MH-6M', info: 'Seats 9 PAX', feat: 'Laser, IR', crew: '1× Pilot + 1× Co-Pilot (optional)' },
      { cs: 'SPIRIT 7-X', name: 'MH-60M MEDEVAC', info: 'Transport Capacity: Seats 14 PAX', feat: '—', crew: '—' }
    ],
    cas: [
      { cs: 'ARCHER 3-X', name: 'MH-60M DAP', info: '2× M134 (5000 RND) · 1× M230 Chaingun (300 RND) · 1× M229 Hydras (19) · Seats 2 PAX', feat: 'Laser, IR', crew: '1× Pilot + 1× Co-Pilot (optional)' },
      { cs: 'LANCER 4-X', name: 'MH-60M DAP MLASS', info: '2× M134 (5000 RND) · M230 Chaingun (300 RND) · M229 Hydras (19×) · AGM-144K Hellfire (8×) · AGM-114N Hellfire (8×) · Seats 2 PAX', feat: 'Laser, IR', crew: '1× Pilot + 1× Co-Pilot (optional)' },
      { cs: 'LYNX 8-X', name: 'AH-6M', info: '2× M134 (500 RND) · M151 Hydras (M260) 14× · Seats 2 PAX', feat: 'Laser, IR', crew: '2 Sitze' }
    ],
    other: [
      { cs: 'GHOSTRIDER 1-X', name: 'AC-130', info: '2× AGM-144K Hellfire (8×) · 1× GAU-23A 30 mm Chaingun (2500+ RND) · GAU-XX 105 mm (120 RND)', feat: 'Laser, IR', crew: '3× Crew (Pilot, CSO, WSO)' },
      { cs: 'TBD 1-X (WIP)', name: 'MC-130J Commando II', info: 'HMMWV ×2 · MRZR4 ×1 (?) · Seats 63 PAX', feat: '—', crew: '1× Pilot' },
      { cs: 'AVENGER 9', name: 'MQ-9 UAV', info: 'GBU-54 (4) · GBU-53 (16) · GBU-49 (4) · GBU-39-B/B (16) · GBU-38 (4) · GBU-12 (4) · Fuel Tanks 300 gal (4) · APKWS (M151) (28) · AGM-144R Hellfire II (8) · AGM-1449 Hellfire II (8) · AGM-86B Nuclear ALCM GPS (4) · B61-4 Nuclear Bombs (4)', feat: 'Laser, IR', crew: 'UAV' }
    ]
  },

  // ============================================================
  // ZIELE (Dropdown), BEWAFFNUNG (Dropdown), PHRASEN
  // ============================================================
  targets: [
    'BTR-42A', 'BTR-80', 'BTR-60', 'T-90', 'T-72', 'T-34', 'BMP-2', 'BMP-1', 'MT-LB',
    'Technikal (Pickup w/ MG)', 'ZU-23', 'ZSU-23-4 Shilka', 'MANPADS-Team', 'ATGM-Team',
    'Infanterie (Trupp)', 'Mörser-Stellung', 'Bunker', 'Gebäude', 'LKW-Konvoi', 'Statische Waffe'
  ],
  ordnance: [
    '114 Kilo (AGM-114K Hellfire)', '114N Kilo (AGM-114N)', 'M134 Minigun', 'M230 Chaingun (30mm)',
    'M229 Hydra 70 (19x)', 'M151 Hydra (14x)', 'APKWS (laser Hydra)', 'GAU-23A 30mm (AC-130)',
    'GAU-XX 105mm (AC-130)', '7.62 Miniguns (AC-130)', '20mm', '25mm', '40mm Bofors',
    'GBU-12 (500lb laser)', 'GBU-54 (GPS/Laser 500lb)', 'GBU-38 (GPS 500lb)', 'GBU-31 (GPS 2000lb)'
  ],
  smokeMarks: ['Smoke', 'IR Strobe', 'IR Pointer', 'Laser', 'Panel', 'Pyro', 'No Mark'],
  standardPhrases: [
    '{pilot}, this is {jtac}, ready to copy, over',
    'Good readback, over',
    'Stand by, over',
    'Break, break',
    'Cleared hot',
    'Cleared to engage',
    'Continue, over',
    'Contact, over',
    'Shack, good effects, over',
    'Winchester, RTB'
  ],

  // ============================================================
  // BREVITY – Wörterbuch
  // ============================================================
  brevity: [
    // Comms
    { cat: 'Comms', code: 'OVER', text: 'Ende der Übertragung, Antwort erwartet.' },
    { cat: 'Comms', code: 'OUT', text: 'Ende der Übertragung, keine Antwort erwartet.' },
    { cat: 'Comms', code: 'ROGER', text: 'Empfangen und verstanden.' },
    { cat: 'Comms', code: 'COPY', text: 'Empfang bestätigt.' },
    { cat: 'Comms', code: 'WILCO', text: 'Wird befolgt (Will Comply).' },
    { cat: 'Comms', code: 'HAVCO', text: 'Habe befolgt (Have Compiled).' },
    { cat: 'Comms', code: 'CANTCO', text: 'Kann nicht befolgen.' },
    { cat: 'Comms', code: 'INTERROGATIVE', text: 'Frage / Rückfrage an den Empfänger.' },
    { cat: 'Comms', code: 'SAY AGAIN', text: 'Bitte wiederholen.' },
    { cat: 'Comms', code: 'BREAK', text: 'Trennt Teile einer Übertragung; Netz bleibt für den Sprecher reserviert.' },
    { cat: 'Comms', code: 'AFFIRMATIVE / NEGATIVE', text: 'Ja / Nein (vermeidet Verwechslungen).' },
    { cat: 'Comms', code: 'NO GO', text: 'Werde nicht befolgen / nicht möglich.' },
    { cat: 'Comms', code: 'OSCAR MIKE', text: 'On the Move – in Bewegung.' },
    { cat: 'Comms', code: 'REPEAT', text: 'Letzte Übertragung wiederholen.' },
    { cat: 'Comms', code: 'FIRE MISSION', text: 'Einleitung eines Artillerie-/Feuerauftrags.' },
    // Kontrolle
    { cat: 'Kontrolle', code: 'TYPE 1', text: 'JTAC sieht Ziel UND angreifendes Flugzeug → „Cleared Hot" (1 Angriff, keine GPS-Munition).' },
    { cat: 'Kontrolle', code: 'TYPE 2', text: 'JTAC sieht Ziel ODER Flugzeug → „Cleared Hot" (1 Angriff).' },
    { cat: 'Kontrolle', code: 'TYPE 3', text: 'JTAC sieht keins von beidem → „Cleared to Engage" (mehrere Angriffe erlaubt).' },
    { cat: 'Kontrolle', code: 'CLEARED HOT', text: 'Waffenfreigabe für diesen Anflug (Typ 1/2).' },
    { cat: 'Kontrolle', code: 'CLEARED TO ENGAGE', text: 'Waffenfreigabe für mehrere Angriffe innerhalb der Parameter (Typ 3).' },
    { cat: 'Kontrolle', code: 'CONTINUE', text: 'Manöver fortsetzen – KEINE Waffenfreigabe.' },
    { cat: 'Kontrolle', code: 'PUSH [ZIEL]', text: 'Flugzeug verlässt BP/HA Richtung Ziel, z. B. „Push IP, call when established".' },
    { cat: 'Kontrolle', code: 'ABORT', text: 'Aktion/Angriff/Mission sofort abbrechen.' },
    { cat: 'Kontrolle', code: 'CEASE FIRE', text: 'Sofortiges Feuer einstellen.' },
    { cat: 'Kontrolle', code: 'DANGER CLOSE', text: 'Ziel innerhalb von 400 m (bzw. Waffenradius) zu eigenen Kräften → + Initialen des Kommandeurs.' },
    { cat: 'Kontrolle', code: 'BROKEN ARROW', text: 'Ziel liegt auf eigenen Kräften, CAS als letzte Option.' },
    { cat: 'Kontrolle', code: 'FALLEN ANGEL', text: 'Flugzeug abgestürzt / Notlandung.' },
    { cat: 'Kontrolle', code: 'SHOPPING', text: 'Inoffiziell: Luftfahrzeug fragt nach Type-3-Zielen.' },
    // Waffen
    { cat: 'Waffen', code: 'BOT', text: 'Bomb On Target – Pilot sieht & identifiziert das Ziel (6-stellige Grids genügen).' },
    { cat: 'Waffen', code: 'BOC', text: 'Bomb On Coordinate – Angriff auf Koordinate (8–10-stellig, GPS-Waffen).' },
    { cat: 'Waffen', code: 'PICKLE', text: 'Bombenabwurf (dumb/GPS-Bomben, GBU-53, GBU-38).' },
    { cat: 'Waffen', code: 'RIFLE', text: 'AGM / Hydra 70 abgefeuert.' },
    { cat: 'Waffen', code: 'GUNS', text: 'Bordkanonen im Einsatz (Miniguns, 30 mm usw.).' },
    { cat: 'Waffen', code: 'SHOT', text: 'Waffe abgefeuert (Feuerleitstelle).' },
    { cat: 'Waffen', code: 'RIPPLE', text: 'Mehrere Waffen nacheinander abgefeuert.' },
    { cat: 'Waffen', code: 'DRY', text: 'Keine Waffe abgefeuert („dry pass").' },
    { cat: 'Waffen', code: 'PAVEWAY', text: 'Lasergelenkte Bombe (meist GBU-12, 500 lb).' },
    { cat: 'Waffen', code: 'SPLASH', text: 'JTAC sieht die Munition einschlagen.' },
    { cat: 'Waffen', code: 'SHACK', text: 'Treffer im Ziel (bestätigt durch Pilot/JTAC).' },
    { cat: 'Waffen', code: 'WINCHESTER', text: 'Keine Munition mehr an Bord.' },
    { cat: 'Waffen', code: 'BINGO', text: 'Nur noch Treibstoff für Rückkehr (RTB).' },
    { cat: 'Waffen', code: 'RTB', text: 'Return To Base – Rückkehr zur Basis.' },
    { cat: 'Waffen', code: 'SET', text: 'Angriffsposition einnehmen und feuerbereit melden (Rotary, Stand-off).' },
    { cat: 'Waffen', code: 'HEDP', text: 'High Explosive Dual Purpose – großes Feuer, gut gegen Infanterie.' },
    { cat: 'Waffen', code: 'HEAT', text: 'High Explosive Anti Tank – Panzerdurchschlag.' },
    { cat: 'Waffen', code: 'WP', text: 'Willy Pete (Weißphosphor) – Infanterie & Rauch.' },
    // Position
    { cat: 'Position', code: 'IP', text: 'Initial Point – Startpunkt des Angriffslaufs (Fixed-Wing).' },
    { cat: 'Position', code: 'BP', text: 'Battle Position – Feuerstellung für Rotary (Hover).' },
    { cat: 'Position', code: 'HA', text: 'Holding Area – Wartebereich für Rotary.' },
    { cat: 'Position', code: 'CP', text: 'Control Point – Halte-/Referenzpunkt für Fixed-Wing.' },
    { cat: 'Position', code: 'KEYHOLE', text: 'Methode zur Festlegung von IP/BP/HA relativ zum Ziel (Echo-Point).' },
    { cat: 'Position', code: 'ANCHORED', text: 'Flugzeug loitert in einem Muster um einen Punkt (Anchor).' },
    { cat: 'Position', code: 'ESTABLISHED', text: 'Flugzeug ist stabil am geforderten Punkt.' },
    { cat: 'Position', code: 'INGRESS', text: 'Bereich, aus dem das Flugzeug kommt.' },
    { cat: 'Position', code: 'EGRESS', text: 'Richtung/Methode zum Verlassen nach Waffeneinsatz.' },
    { cat: 'Position', code: 'MSL', text: 'Mean Sea Level – Höhe über Meer.' },
    { cat: 'Position', code: 'ANGELS', text: 'Höhe in 1000 ft (z. B. Angels 5 = 5000 ft).' },
    { cat: 'Position', code: 'CHERUBS', text: 'Höhe in 100 ft (z. B. Cherubs 7 = 700 ft).' },
    { cat: 'Position', code: 'FAH', text: 'Final Attack Heading – Endanflugkurs (3-stellig, ±20–30° Toleranz).' },
    { cat: 'Position', code: 'GTL', text: 'Gun-to-Target-Line – Artillerie-Sicherheitslinie.' },
    { cat: 'Position', code: 'NFA', text: 'No Fire Area – festgelegte Schussverbotszone.' },
    { cat: 'Position', code: 'ACA', text: 'Airspace Coordination Area – Luftraumkoordination.' },
    // Sichtung
    { cat: 'Sichtung', code: 'CONTACT', text: 'Ziel gesichtet (visuell oder Sensor) und identifiziert.' },
    { cat: 'Sichtung', code: 'TALLY', text: 'Pilot sieht das Ziel / feindliche Position. Gegenteil: NO JOY.' },
    { cat: 'Sichtung', code: 'NO JOY', text: 'Pilot hat kein Sichtkontakt zum ZIEL. Gegenteil: TALLY.' },
    { cat: 'Sichtung', code: 'VISUAL', text: 'Sichtung einer BEFREUNDETEN Position. Gegenteil: BLIND.' },
    { cat: 'Sichtung', code: 'BLIND', text: 'Kein Sichtkontakt zu befreundeten Kräften.' },
    { cat: 'Sichtung', code: 'LOOKING', text: 'Pilot sucht Ziel/Referenzpunkt noch. Gegenteil: CONTACT.' },
    { cat: 'Sichtung', code: 'CAPTURED', text: 'Ziel/Objekt wird mit Bordsensor erfasst & verfolgt.' },
    { cat: 'Sichtung', code: 'TARGET CORRELATION', text: 'JTAC schafft Lagebild, dass der Pilot das richtige Ziel hat (Talk-On).' },
    // Laser
    { cat: 'Laser', code: 'LASE ON', text: 'Laser ist an – Ziel markiert.' },
    { cat: 'Laser', code: 'LASE OFF', text: 'Laser ist aus.' },
    { cat: 'Laser', code: 'LASING', text: 'Der Sprecher feuert gerade seinen Laser.' },
    { cat: 'Laser', code: 'SHIFT (Richtung)', text: 'Laserenergie verschieben (z. B. vom Offset aufs Ziel; auch Zielzuweisung bei Mehrfachangriff).' },
    { cat: 'Laser', code: 'SPOT', text: 'Pilot hat die Laser-Designation erfasst.' },
    { cat: 'Laser', code: 'CEASE LASER', text: 'Laser ausschalten.' },
    { cat: 'Laser', code: 'DEAD EYE', text: 'Laser-Designator ist ausgefallen.' },
    { cat: 'Laser', code: 'NEGATIVE LASER', text: 'Laserenergie nicht erfasst.' },
    { cat: 'Laser', code: '10 SECONDS', text: 'Vorwarnung: „Laser ON" in ~10 Sekunden.' },
    { cat: 'Laser', code: 'LTL', text: 'Laser-to-Target-Line – Richtung des Lasers (magnetisch/Kardinal).' },
    { cat: 'Laser', code: 'SELF LASE', text: 'Aufforderung an den Piloten, selbst zu lasen.' },
    // IR
    { cat: 'IR', code: 'SPARKLE', text: 'Zielmarkierung mit IR-Pointer. Antwort: CONTACT SPARKLE oder NO JOY.' },
    { cat: 'IR', code: 'CONTACT SPARKLE', text: 'Pilot sieht das Sparkle.' },
    { cat: 'IR', code: 'SNAKE', text: 'IR-Strahl in Acht-Form oszillieren (Pilot soll es besser sehen).' },
    { cat: 'IR', code: 'PULSE', text: 'Position mit blinkender IR-Energie markieren.' },
    { cat: 'IR', code: 'STEADY', text: 'IR-Strahl stabilisieren (nach SNAKE/PULSE).' },
    { cat: 'IR', code: 'ROPE', text: 'IR-Pointer um ein Flugzeug kreisen lassen (Freund-Erkennung).' },
    { cat: 'IR', code: 'CEASE SPARKLE', text: 'Sparkle-Aktivität einstellen.' },
    { cat: 'IR', code: 'MATCH SPARKLE', text: 'Zweiter Pointer überlagert vorhandene Markierung.' },
    { cat: 'IR', code: 'PTL', text: 'Pointer-to-Target-Line – Richtung des IR-Pointers.' },
    // Gefahren
    { cat: 'Gefahren', code: 'JINK', text: 'Aufforderung zu defensiven Ausweichmanövern.' },
    { cat: 'Gefahren', code: 'SEAD', text: 'Suppression of Enemy Air Defenses – Bekämpfung der Flugabwehr.' },
    { cat: 'Gefahren', code: 'DEAD', text: 'Destruction of Enemy Air Defenses.' }
  ],

  // ---------- NATO-Phonetik ----------
  phonetic: [
    ['A', 'Alpha'], ['B', 'Bravo'], ['C', 'Charlie'], ['D', 'Delta'], ['E', 'Echo'], ['F', 'Foxtrot'],
    ['G', 'Golf'], ['H', 'Hotel'], ['I', 'India'], ['J', 'Juliett'], ['K', 'Kilo'], ['L', 'Lima'],
    ['M', 'Mike'], ['N', 'November'], ['O', 'Oscar'], ['P', 'Papa'], ['Q', 'Quebec'], ['R', 'Romeo'],
    ['S', 'Sierra'], ['T', 'Tango'], ['U', 'Uniform'], ['V', 'Victor'], ['W', 'Whiskey'], ['X', 'X-ray'],
    ['Y', 'Yankee'], ['Z', 'Zulu']
  ],
  numbers: [
    ['0', 'Zero'], ['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'],
    ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Niner'], ['.', 'Point'], [',', 'Decimal']
  ],

  // ---------- Funkgeräte ----------
  radios: [
    { name: 'AN/PRC-117F', power: '20 W', range: '30–512 MHz', dist: '20+ km', note: 'Amerikanisch – Backpack-Radio' },
    { name: 'AN/PRC-152', power: '5 W', range: '30–512 MHz', dist: '5+ km', note: 'Amerikanisch – Standard-Handfunk' },
    { name: 'AN/PRC-148', power: '5 W', range: '30–512 MHz', dist: '5–7 km', note: 'Amerikanisch – (nicht in Verwendung)' },
    { name: 'AN/PRC-343', power: '100 mW', range: '2.4–2.483 GHz', dist: '850 m', note: 'Amerikanisch – Personalradio' },
    { name: 'AN/PRC-77', power: '4 W', range: '30–80 MHz', dist: '3–5 km', note: 'Amerikanisch' },
    { name: 'Baofeng 888S', power: '5 W', range: '400–470 MHz', dist: '3–5 km', note: 'China' },
    { name: 'SEM 52 SL', power: '1 W', range: '46–65.975 MHz', dist: '2–4 km', note: 'Deutsch' },
    { name: 'SEM 70', power: '4 W', range: '46–65.975 MHz', dist: '3–5 km', note: 'Deutsch' },
    { name: 'WS No. 38', power: '200 mW', range: '7.4–9 MHz', dist: '800 m', note: 'UK' }
  ],

  radioEtiquette: [
    'Denken, bevor du sprichst – Nachricht vor PTT planen.',
    'Mit Callsign beginnen: „Empfänger, Sender, über".',
    'Ruhig, klar & langsam sprechen – nicht schreien.',
    'Kurz & präzise: Over, Out, Roger, Copy, Say Again, Break.',
    'Nicht unterbrechen – erst auf eine Pause warten, „Break, break" nur im Notfall.',
    'Keine Personennamen, nur Callsigns (OpSec).',
    'Nur autorisierte Frequenzen nutzen.',
    'Erst zuhören, dann senden.',
    'Kein unnötiger Smalltalk – professionell bleiben.',
    'Abschluss immer mit „Out" oder passender Verabschiedung.'
  ],

  pace: [
    ['Primary', 'Hauptkommunikationsweg'],
    ['Alternate', 'Ersatz, fast so zuverlässig wie Primary'],
    ['Contingency', 'Dritte Option, meist noch zuverlässig'],
    ['Emergency', 'Letzte Option, evtl. visuelle/akustische Signale']
  ],

  procedures: {
    irPointer: [
      '1) JTAC: 5-Line Brief übermitteln.',
      '2) Pilot: 5-Line Readback.',
      '3) JTAC: „Good readback, say when ready for sparkle."',
      '4) Pilot: „Ready sparkle."',
      '5) JTAC: IR-Pointer auf Ziel, „Sparkle."',
      '6) Pilot: „Contact sparkle, snake."',
      '7) JTAC: Pointer in Acht bewegen, „Snaking."',
      '8) Pilot: „Tally, cease sparkle."',
      '9) JTAC: Pointer aus, „Ceasing sparkle."',
      'Wichtig: Der JTAC folgt den Anweisungen des Piloten – Ziel ist, dass der Pilot den Mark sieht.'
    ],
    laser: [
      '1) Laser Handoff: JTAC markiert, Pilot bestätigt „Tally" und übernimmt mit eigenem Laser.',
      '2) Buddy Lasing: JTAC hält den Laser während des gesamten Angriffs – hilfreich bei Flugabwehr.',
      'Immer den Laser-Code UND den Callsign des Lasing-Piloten in den Brief aufnehmen.',
      'Immer die LTL (Laser-to-Target-Line) angeben – Richtung, in die der Laser zeigt.',
      'Kein weißer Rauch verwenden! Rauchfarbe erst bei „Tally" vom Piloten bestätigen lassen.'
    ]
  },

  // ---------- Pre-Mission-Checkliste ----------
  checklist: [
    { key: 'comms', label: 'Funk-Check (All-Stations-Check) auf allen Netzen' },
    { key: 'laser', label: 'Laser-Code bestätigt (Standard: 1111)' },
    { key: 'channels', label: 'Channels/Frequenzen gesetzt (z. B. Ch. 2 TAD)' },
    { key: 'grids', label: 'Ziel-Grids eingetragen (6- oder 8-stellig)' },
    { key: 'ipbp', label: 'IP / BP / HA festgelegt' },
    { key: 'abort', label: 'Abort-Code besprochen (Default: abort in the clear)' },
    { key: 'aca', label: 'Luftraumkoordination (ACA) geklärt' },
    { key: 'dc', label: 'Danger-Close-Parameter bekannt' },
    { key: 'callsigns', label: 'Callsigns & Funk für alle Assets verteilt' }
  ],

  laserCodes: ['1111','1212','1313','1414','1515','1616','1688','1717','1818','1919','2121','3131','4141','5151'],
  smokeColors: ['Rot','Grün','Gelb','Violett','Weiß (nicht für Zielmarkierung)','Orange','Blau'],
  riskLevels: ['LOW','MEDIUM','HIGH']
};

// Flache Airframe-Liste
REF.airframesFlat = [];
Object.keys(REF.airframes).forEach(cat => {
  REF.airframes[cat].forEach(a => {
    REF.airframesFlat.push({ ...a, cat });
  });
});
REF.airframeCallsigns = REF.airframesFlat.map(a => a.cs);

REF.findAirframe = function (cs) {
  if (!cs) return null;
  const q = String(cs).trim().toUpperCase();
  return REF.airframesFlat.find(a => {
    const aq = a.cs.toUpperCase();
    return aq === q || aq.replace(' (WIP)', '') === q || q.startsWith(aq.split(' ')[0]);
  }) || null;
};

// Format-Helfer: Brief-Formate in zwei Gruppen
// Haupt-Formate (Kern) – im Haupt-Briefs-Tab
REF.briefFormatsMain = [
  { id: 'cas5',    label: '🚁 5-Line (Rotary)' },
  { id: 'hlz',     label: '🛬 HLZ' },
  { id: 'cas9',    label: '🎯 9-Line CAS' },
  { id: 'medevac', label: '✚ MEDEVAC' }
];

// Weitere Formate (Briefing Area) – aus ATG / Ghost's Cheatsheet
REF.briefFormatsExtra = [
  { id: 'gunship', label: 'Gunship (AC-130)' },
  { id: 'rpas',    label: 'RPAS (UAV)' },
  { id: 'alz',     label: 'ALZ' },
  { id: 'airdrop', label: 'Airdrop' },
  { id: 'cff',     label: 'Call for Fire' },
  { id: 'cca',     label: 'CCA 5-Line' }
];

REF.briefFormats = [...REF.briefFormatsMain, ...REF.briefFormatsExtra];

if (typeof window !== 'undefined') { window.REF = REF; }
if (typeof module !== 'undefined' && module.exports) { module.exports = REF; }
