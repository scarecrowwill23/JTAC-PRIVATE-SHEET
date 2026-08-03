// ============================================================
// JTAC Private Sheet – Referenzdaten
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
  // 12 SCHRITTE DES CAS (Haupt-Workflow)
  // ============================================================
  casSteps: [
    { n: 1, title: 'Routing & Safety of Flight',
      body: '3D-Richtung von der aktuellen Position zum Haltepunkt (HA/CP). Haltepunkt & Höhe nennen, Kontaktstelle angeben. Andere Flugzeuge auf Station, Flugabwehr-Bedrohungen, Safety-of-Flight-Themen, aktive Gun-Target-Line (GTL) mit Azimut/Lage.'
    },
    { n: 2, title: 'CAS Check-in',
      body: 'Pilot meldet sich: Callsign · Missionsnummer · Anzahl & Typ der Luftfahrzeuge · Position & Höhe · Bewaffnung · Playtime / Time-on-Station · Fähigkeiten (Sensoren, Video-Downlink, SITREPs) · Abort-Code.',
      form: 'checkin'
    },
    { n: 3, title: 'Situation Update (TEFACHR)',
      body: 'Lage-Update im TEFACHR-Format: Threat, Enemy, Friendly, Artillery, Clearance Authority, Hazards, Remarks & Restrictions.',
      form: 'tefachr'
    },
    { n: 4, title: 'Game Plan',
      body: 'Kontrolltyp (1/2/3), Method of Attack (BOT/BOC), gewünschte Wirkung / Bewaffnung, Intervall.',
      form: 'gameplan'
    },
    { n: 5, title: 'CAS Brief',
      body: '9-Line (Fixed-Wing) oder 5-Line (Rotary/AC-130) übermitteln. Linien 4 & 6 (9-Line) bzw. 2 & 3 (5-Line) sind Pflicht-Readbacks.',
      form: 'brief'
    },
    { n: 6, title: 'Remarks & Restrictions',
      body: 'LTL/PTL, Final Attack Heading, Bedrohungen & SEAD, Airspace Coordination Areas, Danger Close + Initialen, TOT/TTT, Post-Launch-Abort, gewünschte Bewaffnung.',
      form: 'remarks'
    },
    { n: 7, title: 'Readbacks',
      body: 'Pilot liest Pflicht-Zeilen zurück (9-Line: 4, 6 + Restriktionen; 5-Line: 2, 3 + Restriktionen). Mit „Good readback" bestätigen oder korrigieren.'
    },
    { n: 8, title: 'Target Correlation / Talk-On',
      body: 'Sicherstellen, dass Pilot & JTAC dasselbe Ziel sehen: Talk-On in Klartext, erweiterte Zielbeschreibung, Markierung, Video-Downlink.'
    },
    { n: 9, title: 'Attack',
      body: 'Pilot „push" zum Ziel geben → „inbound" → „Cleared Hot" (Typ 1/2) oder „Cleared to Engage" (Typ 3) → Pilot meldet „Pickle" / „Rifle" / „Guns".'
    },
    { n: 10, title: 'Assess Effects',
      body: 'Einschlag beobachten („Splash"), Schaden bewerten. „Shack" = Treffer im Ziel, „Good effects" / „No effects".'
    },
    { n: 11, title: 'BDA (SALT-R)',
      body: 'Battle Damage Assessment im SALT-R-Format: Size, Activity, Location, Time, Remarks. Ggf. Re-Attack mit Änderungen anordnen.',
      form: 'bda'
    },
    { n: 12, title: 'Routing & Safety of Flight',
      body: 'Route aus dem Kampfgebiet zurück zu HA/HP geben, Safety-of-Flight-Briefing (wie Schritt 1).'
    }
  ],

  // ============================================================
  // BRIEF-FORMATE (Felder pro Format)
  // type: text | select | group
  // rb: mandatory readback
  // ============================================================

  // ---------- 9-Line CAS (Fixed-Wing) – ATG-Format ----------
  cas9: {
    name: '9-Line CAS',
    use: 'Fixed-Wing (Kampfjets, Bomber)',
    header: '9-Line CAS, ready to copy.',
    lines: [
      { n: 1, key: 'cp',   label: 'Control Point', short: 'IP/BP/Keyhole', ph: 'z. B. IP Alpha / BP Bravo / Keyhole 5', help: 'Initial Point (FW), Battle Position (RW) oder Keyhole-Methode.' },
      { n: 2, key: 'dir',  label: 'Target Direction & Offset', short: 'Dir', ph: 'z. B. 280° / rechts 500 m', help: 'Angriffsrichtung in Grad, optional Offset links/rechts. Kardinal = 45°-Bogen.' },
      { n: 3, key: 'dist', label: 'Target Distance (vom Control Point)', short: 'Dist', ph: 'z. B. 8 km', help: 'Entfernung IP/BP → Ziel (Metrisch).' },
      { n: 4, key: 'elev', label: 'Target Altitude (MSL)', short: 'ELV', ph: 'z. B. 120 m MSL', rb: true, help: 'Zielhöhe über Meer (Mean Sea Level) – Pflicht-Readback.' },
      { n: 5, key: 'desc', label: 'Target Description', short: 'DESC', ph: 'z. B. T-90, Kompanie Infanterie', help: 'Was sieht der Pilot? Typ, Anzahl, Deckung, Kontext ("im offenen Gelände", "3. Stock").' },
      { n: 6, key: 'grid', label: 'Target Coordinates', short: 'GRID', ph: 'z. B. 35S VA 12345 67890', rb: true, help: 'Koordinaten des Ziels – 6-stellig (BOT) oder 8–10-stellig (BOC) – Pflicht-Readback.' },
      { n: 7, key: 'mark', label: 'Marker Type', short: 'Mark', ph: 'z. B. Lase 1688 / rot Rauch / IR', help: 'Laser-Code, Rauchfarbe, IR-Pointer, GPS-Koordinaten.' },
      { n: 8, key: 'friend', label: 'Friendly Position', short: 'Friend', ph: 'z. B. 200 m südlich, kein Kontakt', rb: true, help: 'Position eigener Kräfte relativ zum Ziel – keine eigenen Grids nennen! – Pflicht-Readback.' },
      { n: 9, key: 'egress', label: 'Egress & Routing', short: 'Egress', ph: 'z. B. Egress Nord, dann HA Alpha', help: 'Kardinalrichtungen oder vorher festgelegte Punkte.' }
    ]
  },

  // ---------- 5-Line CAS (Rotary / AC-130) – ATG-Format ----------
  cas5: {
    name: '5-Line CAS',
    use: 'Rotary-Wing (Helikopter) & AC-130',
    header: '5-Line, über.',
    lines: [
      { n: 1, key: 'observer', label: 'Observer / Game Plan', short: 'Obs', ph: 'z. B. LONGBOW 1, Type 2, BOT, Guns', help: 'Eigene Callsign, Kontrolltyp (1/2/3), MOA, Bewaffnung.' },
      { n: 2, key: 'friendly', label: 'Friendly Location / Mark', short: 'Friend', ph: 'z. B. 300 m nördlich, IR-Strobe', rb: true, help: 'Eigene Position & Markierung – relativ zum Ziel, keine Grids! – Pflicht-Readback.' },
      { n: 3, key: 'target', label: 'Target Location', short: 'Target', ph: 'z. B. 35S VA 12345 67890', rb: true, help: 'Zielort: Grid (6-stellig BOT / 8+ BOC) oder Peilung+Distanz – Pflicht-Readback.' },
      { n: 4, key: 'desc', label: 'Target Description / Mark', short: 'DESC', ph: 'z. B. BTR-60, markiert mit Lase 1688', help: 'Zielbeschreibung & Markierung (Laser mit Code, Rauch, IR).' },
      { n: 5, key: 'remarks', label: 'Remarks & Restrictions', short: 'Rmks', ph: 'z. B. FAH 010, LTL 320, Danger Close 270 m', rb: true, help: 'LTL/PTL, Danger Close (+Initialen), Bedrohungen, TOT – Pflicht-Readback.' }
    ]
  },

  // ---------- 9-Line MEDEVAC / CASEVAC – ATG-Format ----------
  medevac: {
    name: '9-Line MEDEVAC/CASEVAC',
    use: 'Medizinische Evakuierung',
    header: '9-Line MEDEVAC, über.',
    lines: [
      { n: 1, key: 'loc', label: 'Location of Pickup Site', short: 'Loc', ph: 'z. B. 35S VA 12345 67890', rb: true, help: 'Grid der Aufnahmestelle – Pflicht-Readback.' },
      { n: 2, key: 'freq', label: 'Requesting Callsign & Frequency', short: 'Freq', ph: 'z. B. SPIRIT 7-1, 36.50', rb: true, help: 'Anfordernde Callsign & Funkfrequenz – Pflicht-Readback.' },
      { n: 3, key: 'precedence', label: 'Patients by Precedence', short: 'Prec', rb: true, group: [
        { code: 'A', label: 'Urgent (≤2h)' }, { code: 'B', label: 'Urgent Surgical (≤2h)' },
        { code: 'C', label: 'Priority (≤4h)' }, { code: 'D', label: 'Routine (≤24h)' }, { code: 'E', label: 'Convenience' }
      ], help: 'Anzahl Patienten nach Priorität – Pflicht-Readback.' },
      { n: 4, key: 'equip', label: 'Special Equipment', short: 'Equip', rb: true, select: [
        { v: 'A', t: 'A – None' }, { v: 'B', t: 'B – Hoist' }, { v: 'C', t: 'C – Extraction Equipment' }, { v: 'D', t: 'D – Ventilation' }
      ], help: 'Spezialausrüstung (MEDEVAC) – Pflicht-Readback.' },
      { n: 5, key: 'type', label: 'Patients by Type', short: 'Type', group: [
        { code: 'L', label: 'Litter (liegend)' }, { code: 'A', label: 'Ambulatory (gehend)' }
      ], help: 'Anzahl Patienten nach Art.' },
      { n: 6, key: 'security', label: 'Security at Pickup Site', short: 'Sec', rb: true, select: [
        { v: 'N', t: 'N – No enemy troops in area' }, { v: 'P', t: 'P – Possible enemy troops (caution)' },
        { v: 'E', t: 'E – Enemy troops in area (caution)' }, { v: 'X', t: 'X – Enemy troops (armed escort required)' }
      ], help: 'Sicherheitslage an der Aufnahmestelle – Pflicht-Readback.' },
      { n: 7, key: 'mark', label: 'Method of Marking', short: 'Mark', rb: true, select: [
        { v: 'A', t: 'A – Panel' }, { v: 'B', t: 'B – Pyrotechnic Signal' },
        { v: 'C', t: 'C – Smoke Signal (Farbe bei Final Approach bestätigen)' }, { v: 'D', t: 'D – None' }, { v: 'E', t: 'E – Other' }
      ], help: 'Markierungsmethode (CASEVAC) – Pflicht-Readback.' },
      { n: 8, key: 'nat', label: 'Patient Nationality & Status', short: 'Nat', select: [
        { v: 'A', t: 'A – US Military' }, { v: 'B', t: 'B – US Civilian' }, { v: 'C', t: 'C – Non-US Military' },
        { v: 'D', t: 'D – Non-US Civilian' }, { v: 'E', t: 'E – Enemy Prisoner of War' }
      ], help: 'Nationalität & Status der Patienten.' },
      { n: 9, key: 'cbrn', label: 'Patient CBRN Status', short: 'CBRN', select: [
        { v: 'N', t: 'N – Nuclear' }, { v: 'B', t: 'B – Biological' }, { v: 'C', t: 'C – Chemical' }, { v: '0', t: 'Keine' }
      ], help: 'Kontamination der Patienten (CBRN).' }
    ]
  },

  // ---------- SOF Gunship Call for Fire (AC-130) ----------
  gunship: {
    name: 'SOF Gunship Call for Fire',
    use: 'AC-130 / Gunship-Unterstützung',
    header: 'Gunship Fire Mission, über.',
    lines: [
      { n: 1, key: 'warno', label: 'Warning Order', short: 'Warno', ph: 'z. B. GHOSTRIDER 1-1, LONGBOW 1, Fire Mission', help: 'Gunship-Callsign, Controller-Callsign, „Fire Mission".' },
      { n: 2, key: 'friendly', label: 'Friendly Location & Marker', short: 'Friend', ph: 'z. B. 200 m nordwestlich, IR-Strobe', help: 'Eigene Position & Markierung.' },
      { n: 3, key: 'target', label: 'Target Location', short: 'Target', ph: 'z. B. 35S VA 12345 67890', help: 'Grid oder Peilung/Distanz.' },
      { n: 4, key: 'desc', label: 'Target Description & Marker', short: 'DESC', ph: 'z. B. 2 technicals, Lase 1688', help: 'Zielbeschreibung & Markierung.' },
      { n: 5, key: 'remarks', label: 'Remarks & Restrictions', short: 'Rmks', ph: 'z. B. GTL 045, Min Safe Alt 5000 ft, Winds 270/15', rb: true, help: 'Türme, Mindestsicherheitshöhe, Bodenwind, GTL – Pflicht-Readback.' }
    ]
  },

  // ---------- CCA 5-Line (Joint Fires Observer) ----------
  cca: {
    name: 'CCA 5-Line',
    use: 'Joint Fires Observer / CCA',
    header: 'CCA 5-Line, über.',
    lines: [
      { n: 1, key: 'observer', label: 'Observer / Game Plan', short: 'Obs', ph: 'z. B. FOX 2-1, Type 2, BOC', help: 'Callsign, Kontrolltyp, MOA.' },
      { n: 2, key: 'friendly', label: 'Observer Friendly Location', short: 'Friend', ph: 'z. B. 250 m nördlich des Ziels', rb: true, help: 'Eigene Position (vom Controller) – Pflicht-Readback.' },
      { n: 3, key: 'target', label: 'Target Location', short: 'Target', ph: 'z. B. 35S VA 12345 67890', rb: true, help: 'Zielort – Pflicht-Readback.' },
      { n: 4, key: 'desc', label: 'Target Description', short: 'DESC', ph: 'z. B. T-72 im Hangar', help: 'Zielbeschreibung (vom Controller).' },
      { n: 5, key: 'mark', label: 'Target Marker Type', short: 'Mark', ph: 'z. B. grün Rauch / Lase 1212', help: 'Markierungstyp des Ziels.' }
    ]
  },

  // ---------- Remotely Piloted Aircraft CAS ----------
  rpas: {
    name: 'RPAS CAS Brief',
    use: 'UAV (z. B. AVENGER 9 / MQ-9)',
    header: 'RPAS CAS Brief, über.',
    lines: [
      { n: 1, key: 'gameplan', label: 'Game Plan', short: 'GP', ph: 'z. B. Type 3, BOC, GBU-12', help: 'Kontrolltyp, MOA, Bewaffnung.' },
      { n: 2, key: 'target', label: 'Target Location', short: 'Target', ph: 'z. B. 35S VA 12345 67890', rb: true, help: '8–10-stellige Grids bevorzugt – Pflicht-Readback.' },
      { n: 3, key: 'elev', label: 'Target Elevation (MSL)', short: 'ELV', ph: 'z. B. 95 m MSL', rb: true, help: 'Zielhöhe – Pflicht-Readback.' },
      { n: 4, key: 'friendly', label: 'Closest Friendlies & Marker', short: 'Friend', ph: 'z. B. 400 m südlich, kein Mark', help: 'Nächste eigene Kräfte & Markierung.' },
      { n: 5, key: 'remarks', label: 'Remarks & Restrictions', short: 'Rmks', ph: 'z. B. Danger Close 280 m, FAH 090', rb: true, help: 'Restriktionen – Pflicht-Readback.' }
    ]
  },

  // ---------- Helicopter Landing Zone (HLZ) ----------
  hlz: {
    name: 'HLZ Brief',
    use: 'Helikopter-Landeplatz',
    header: 'HLZ Brief, über.',
    lines: [
      { n: 1, key: 'loc', label: 'HLZ Location', short: 'Loc', ph: 'z. B. 35S VA 12345 67890', help: 'Position der Landezone.' },
      { n: 2, key: 'mark', label: 'HLZ Marker Type', short: 'Mark', select: [
        { v: 'Panel', t: 'Panel' }, { v: 'Pyro', t: 'Pyrotechnic Signal' },
        { v: 'Smoke', t: 'Smoke Signal (Farbe bei Final Approach bestätigen)' }, { v: 'IR', t: 'IR' },
        { v: 'ATAK', t: 'ATAK Marker' }, { v: 'Other', t: 'Other' }, { v: 'None', t: 'None' }
      ], help: 'Markierung der Landezone.' },
      { n: 3, key: 'obstacles', label: 'Obstacles / Hazards', short: 'Obs', ph: 'z. B. Hochspannung 100 m westlich', help: 'Hindernisse & Gefahren.' },
      { n: 4, key: 'friendly', label: 'Friendly SITREP', short: 'Friend', ph: 'z. B. 12 PAX, 2 EPW, 100 m nordöstlich', help: 'PAX/EPW/HVI-Anzahl, Richtung & Distanz zur HLZ.' },
      { n: 5, key: 'enemy', label: 'Enemy SITREP / HLZ Security', short: 'Enemy', select: [
        { v: 'Green', t: 'Green – HLZ secure' }, { v: 'Yellow', t: 'Yellow – possible enemy IVO HLZ' },
        { v: 'Red', t: 'Red – enemy IVO HLZ' }
      ], help: 'Sicherheitsstatus der HLZ (Richtung & Distanz nächster Feinde angeben).' },
      { n: 6, key: 'remarks', label: 'Remarks & Restrictions', short: 'Rmks', ph: 'z. B. Final Approach Heading 010, Ziel nach Pickup', rb: true, help: 'Final Approach Heading, Ziel nach Pickup, weitere Infos – Pflicht-Readback.' }
    ]
  },

  // ---------- Austere Landing Zone (ALZ) ----------
  alz: {
    name: 'ALZ Brief',
    use: 'Improvisierte Landezone',
    header: 'ALZ Brief, über.',
    lines: [
      { n: 1, key: 'loc', label: 'ALZ Location', short: 'Loc', ph: 'z. B. 35S VA 12345 67890', rb: true, help: 'Position – Pflicht-Readback.' },
      { n: 2, key: 'ground', label: 'Ground Type', short: 'Ground', select: [
        { v: 'Dirt soft', t: 'Dirt (Soft)' }, { v: 'Dirt compact', t: 'Dirt (Compact)' },
        { v: 'Gravel soft', t: 'Gravel (Soft)' }, { v: 'Gravel compact', t: 'Gravel (Compact)' },
        { v: 'Cement', t: 'Cement (Road/Slabs)' }, { v: 'Unkempt', t: 'Unkempt (Foliage/Mixed)' }
      ], help: 'Bodenbeschaffenheit.' },
      { n: 3, key: 'elev', label: 'ALZ Elevation (MSL)', short: 'ELV', ph: 'z. B. 140 m MSL', rb: true, help: 'Höhe – Pflicht-Readback.' },
      { n: 4, key: 'bearing', label: 'ALZ Bearing', short: 'Brg', ph: 'z. B. 120°', rb: true, help: 'Peilung der Landebahn – Pflicht-Readback.' },
      { n: 5, key: 'length', label: 'ALZ Length (m)', short: 'Len', ph: 'z. B. 800 m', rb: true, help: 'Länge in Metern – Pflicht-Readback.' },
      { n: 6, key: 'mark', label: 'ALZ Marker Type', short: 'Mark', select: [
        { v: 'Panel', t: 'Panel' }, { v: 'Pyro', t: 'Pyrotechnic Signal' },
        { v: 'Smoke', t: 'Smoke Signal' }, { v: 'IR', t: 'IR' }, { v: 'Other', t: 'Other' }, { v: 'None', t: 'None' }
      ], help: 'Markierung.' },
      { n: 7, key: 'weather', label: 'Weather Conditions', short: 'Wx', ph: 'z. B. 3 km Sicht, Wind 270/12', help: 'Wetter an der ALZ.' },
      { n: 8, key: 'enemy', label: 'Enemy SITREP / ALZ Security', short: 'Enemy', select: [
        { v: 'Green', t: 'Green – ALZ secure' }, { v: 'Yellow', t: 'Yellow – possible enemy IVO ALZ' },
        { v: 'Red', t: 'Red – enemy IVO ALZ' }
      ], help: 'Sicherheitsstatus (Richtung/Distanz nächster Feinde angeben).' },
      { n: 9, key: 'ondeck', label: 'Time Spent On Deck', short: 'OnDeck', ph: 'z. B. 5 min', help: 'Zeit am Boden.' }
    ]
  },

  // ---------- Airdrop Brief ----------
  airdrop: {
    name: 'Airdrop Brief',
    use: 'Fallschirmabwurf',
    header: 'Airdrop Brief, über.',
    lines: [
      { n: 1, key: 'poi', label: 'Point of Impact', short: 'POI', ph: 'z. B. 35S VA 12345 67890', rb: true, help: 'Aufschlagpunkt – Pflicht-Readback.' },
      { n: 2, key: 'elev', label: 'POI Elevation (MSL)', short: 'ELV', ph: 'z. B. 60 m MSL', rb: true, help: 'Höhe – Pflicht-Readback.' },
      { n: 3, key: 'heading', label: 'Final Approach Heading to DZ', short: 'FAH', ph: 'z. B. 090', rb: true, help: 'Endanflugkurs zur DZ – Pflicht-Readback.' },
      { n: 4, key: 'desc', label: 'POI Description & Marker', short: 'DESC', select: [
        { v: 'Panel', t: 'Panel' }, { v: 'Pyro', t: 'Pyrotechnic Signal' },
        { v: 'Smoke', t: 'Smoke Signal' }, { v: 'IR', t: 'IR' }, { v: 'Other', t: 'Other' }, { v: 'None', t: 'None' }
      ], help: 'Beschreibung & Markierung.' },
      { n: 5, key: 'friendly', label: 'Friendly Location & Marker', short: 'Friend', ph: 'z. B. 500 m östlich, kein Mark', help: 'Eigene Kräfte.' },
      { n: 6, key: 'winds', label: 'Surface Winds', short: 'Winds', ph: 'z. B. 240/12 kts', help: 'Bodenwind.' },
      { n: 7, key: 'remarks', label: 'Remarks & Restrictions', short: 'Rmks', ph: 'z. B. Danger Close 400 m', help: 'Weitere Hinweise.' }
    ]
  },

  // ---------- Call for Fire ----------
  cff: {
    name: 'Call for Fire',
    use: 'Artillerie / Mörser',
    header: 'Call for Fire, über.',
    lines: [
      { n: 1, key: 'observer', label: 'Observer Identification', short: 'Obs', ph: 'z. B. LONGBOW 1', help: 'Eigene Kennung.' },
      { n: 2, key: 'warno', label: 'WARNO', short: 'Warno', select: [
        { v: 'Adjust Fire', t: 'Adjust Fire' }, { v: 'Fire For Effect', t: 'Fire For Effect' },
        { v: 'Suppression', t: 'Suppression' }, { v: 'Immediate Suppression', t: 'Immediate Suppression' }
      ], help: 'Missionstyp. Zielort-Methode: Grid, Polar oder Shift.' },
      { n: 3, key: 'target', label: 'Target Location', short: 'Target', ph: 'z. B. 35S VA 12345 67890', help: 'Grid / Polar / Shift von bekanntem Punkt.' },
      { n: 4, key: 'desc', label: 'Target Description', short: 'DESC', ph: 'z. B. 3 technicals, gedeckt', help: 'Zielbeschreibung.' },
      { n: 5, key: 'moe', label: 'Method of Engagement', short: 'MOE', ph: 'z. B. Precision Fire, High, HE VT, 6 Runden', help: 'Präzision/Area, Trajektorie (Low/High – Mörser nur High), Munition, Zünder, Verteilung.' },
      { n: 6, key: 'mfc', label: 'Method of Fire Control', short: 'MFC', ph: 'z. B. "At my command" / "Fire when ready"', help: 'Feuerkontrolle.' }
    ]
  },

  // ============================================================
  // CAS CHECK-IN & SITREP (TEFACHR) & GAME PLAN & BDA (SALT-R)
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
    { key: 'threat',   label: 'Threat', ph: 'z. B. AAA bei Grid 123 456, MANPADS möglich', help: 'Flugabwehr-Bedrohungen & Lagen.' },
    { key: 'enemy',    label: 'Enemy Situation', ph: 'z. B. Zug Stärke, 3 BTR, Richtung Nord', help: 'Feindlage allgemein – keine Grids, die kommen in den CAS Brief.' },
    { key: 'friendly', label: 'Friendly Update', ph: 'z. B. 1. Zug hält Linie, Vorstoß nach Osten', help: 'Eigene Lage & Absicht des GFC.' },
    { key: 'artillery',label: 'Artillery', ph: 'z. B. 2x M119, GTL 045° aktiv', help: 'Indirektes Feuer & Gun-Target-Line.' },
    { key: 'clearance',label: 'Clearance Authority', ph: 'z. B. Cdr. Miller (JM), initialen "JM"', help: 'Wer gibt Brief/Stack/Mark/Control frei? Initialen des Kommandeurs.' },
    { key: 'hazards',  label: 'Hazards', ph: 'z. B. Türme, Min Safe Alt 3000 ft, CBRN möglich', help: 'Türme, Mindestsicherheitshöhe, Wetter, CBRN, Sprengstoffe.' },
    { key: 'remarks',  label: 'Remarks & Restrictions', ph: 'z. B. CAS-Absicht, Restriktionen, ACM/FSCM-Änderungen', help: 'Weitere Hinweise.' }
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
    { key: 'interval', label: 'Interval', ph: 'z. B. 5 s / Salve', help: 'Nur falls relevant.' }
  ],

  remarksFields: [
    { key: 'fah',     label: 'Final Attack Heading', ph: 'z. B. 010 (immer 3-stellig)' },
    { key: 'ltlptl',  label: 'LTL / PTL', ph: 'z. B. LTL 320°', help: 'Laser-/Pointer-to-Target-Line in Grad oder Kardinal.' },
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
    { key: 'location', label: 'Location', ph: 'z. B. 35S VA 12345 67890' },
    { key: 'time',     label: 'Time', ph: 'z. B. 16:02 Zulu' },
    { key: 'remarks',  label: 'Remarks', ph: 'z. B. Re-Attack mit Guns empfohlen' }
  ],

  // ============================================================
  // DANGER CLOSE (Ghost + ATG + Infotext)
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
  // CGF 160th SOAR AIRFRAMES (aus der Google-Sheet)
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
  // BREVITY – Wörterbuch (Ghost, 24th STS, ATG, TFW)
  // ============================================================
  brevity: [
    // Comms / Bestätigung
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
    // Kontrolltypen & Clearing
    { cat: 'Kontrolle', code: 'TYPE 1', text: 'JTAC sieht Ziel UND angreifendes Flugzeug → „Cleared Hot" (1 Angriff, keine GPS-Munition).' },
    { cat: 'Kontrolle', code: 'TYPE 2', text: 'JTAC sieht Ziel ODER Flugzeug → „Cleared Hot" (1 Angriff).' },
    { cat: 'Kontrolle', code: 'TYPE 3', text: 'JTAC sieht keins von beidem → „Cleared to Engage" (mehrere Angriffe erlaubt).' },
    { cat: 'Kontrolle', code: 'CLEARED HOT', text: 'Waffenfreigabe für diesen Anflug (Typ 1/2).' },
    { cat: 'Kontrolle', code: 'CLEARED TO ENGAGE', text: 'Waffenfreigabe für mehrere Angriffe innerhalb der Parameter (Typ 3).' },
    { cat: 'Kontrolle', code: 'CONTINUE', text: 'Manöver fortsetzen – KEINE Waffenfreigabe.' },
    { cat: 'Kontrolle', code: 'PUSH [ZIEL]', text: 'Flugzeug verlässt BP/HA Richtung Ziel, z. B. „Push IP, call when established".' },
    { cat: 'Kontrolle', code: 'ABORT', text: 'Aktion/Angriff/Mission sofort abbrechen.' },
    { cat: 'Kontrolle', code: 'DANGER CLOSE', text: 'Ziel innerhalb von 400 m (bzw. Waffenradius) zu eigenen Kräften → + Initialen des Kommandeurs.' },
    { cat: 'Kontrolle', code: 'BROKEN ARROW', text: 'Ziel liegt auf eigenen Kräften, CAS als letzte Option.' },
    { cat: 'Kontrolle', code: 'FALLEN ANGEL', text: 'Flugzeug abgestürzt / Notlandung.' },
    { cat: 'Kontrolle', code: 'SHOPPING', text: 'Inoffiziell: Luftfahrzeug fragt nach Type-3-Zielen.' },
    // MOA / Waffen
    { cat: 'Waffen', code: 'BOT', text: 'Bomb On Target – Pilot sieht & identifiziert das Ziel (6-stellige Grids genügen).' },
    { cat: 'Waffen', code: 'BOC', text: 'Bomb On Coordinate – Angriff auf Koordinate (8–10-stellig, GPS-Waffen).' },
    { cat: 'Waffen', code: 'PICKLE', text: 'Bombenabwurf (dumb/GPS-Bomben, GBU-53, GBU-38).' },
    { cat: 'Waffen', code: 'RIFLE', text: 'AGM / Hydra 70 abgefeuert.' },
    { cat: 'Waffen', code: 'GUNS', text: 'Bordkanonen im Einsatz (Miniguns, 30 mm usw.).' },
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
    // Positionen
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
    // IR Pointer
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

  // ============================================================
  // NATO-PHONETIK & ZAHLEN
  // ============================================================
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

  // ============================================================
  // FUNKGERÄTE (TFW 18E Course)
  // ============================================================
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

  // ---------- Funketikette (TFW) ----------
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

  // ---------- PACE-Plan (TFW) ----------
  pace: [
    ['Primary', 'Hauptkommunikationsweg'],
    ['Alternate', 'Ersatz, fast so zuverlässig wie Primary'],
    ['Contingency', 'Dritte Option, meist noch zuverlässig'],
    ['Emergency', 'Letzte Option, evtl. visuelle/akustische Signale']
  ],

  // ---------- Laser-/IR-Markierungs-Prozeduren (TFW) ----------
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

  // ---------- Laser-Codes & Rauch ----------
  laserCodes: ['1111','1212','1313','1414','1515','1616','1688','1717','1818','1919','2121','3131','4141','5151'],
  smokeColors: ['Rot','Grün','Gelb','Violett','Weiß (nicht für Zielmarkierung)','Orange','Blau'],
  riskLevels: ['LOW','MEDIUM','HIGH']
};

if (typeof window !== 'undefined') { window.REF = REF; }
if (typeof module !== 'undefined' && module.exports) { module.exports = REF; }
