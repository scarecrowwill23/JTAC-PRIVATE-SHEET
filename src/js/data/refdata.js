// ============================================================
// JTAC Private Sheet – Referenzdaten
// Wird mit den PDFs (24th STS, TFW 18E, Ghost, ATG) erweitert.
// ============================================================

const REF = {

  // ---------- Karten-Voreinstellungen für Arma 3 ----------
  // zone  = UTM-Zone + Breitengürtel (für MGRS)
  // sw    = ungefähre Position der Karten-Südwest-Ecke [lon, lat]
  //         (nur für die Näherungs-Umrechnung von reinen Arma-Grids nötig)
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

  // ---------- 9-Line CAS (NATO-Standard, wird an Unit angepasst) ----------
  casLines: [
    { line: 1, key: 'ip',       label: 'IP / Startpunkt', short: 'IP',         ph: 'Grid des IP, z. B. 35S VA 12345 67890', help: 'Initial Point – ab hier übernimmt der Pilot die Zielsuche.' },
    { line: 2, key: 'heading',  label: 'Kurs zum Ziel / Offset', short: 'Heading', ph: 'z. B. 280° / rechts 500 m', help: 'Peilung vom IP zum Ziel in Grad, optional Offset in Metern.' },
    { line: 3, key: 'distance', label: 'Distanz', short: 'Dist', ph: 'z. B. 8 km', help: 'Entfernung IP → Ziel. Mit dem Grid-Rechner berechnen.' },
    { line: 4, key: 'elev',     label: 'Zielhöhe', short: 'Elev', ph: 'z. B. 120 m', help: 'Höhe des Zielgebiets (MSL/über Grund).' },
    { line: 5, key: 'target',   label: 'Zielbeschreibung', short: 'Target', ph: 'z. B. BTR-80, 3 Fahrzeuge, gedeckt', help: 'Was sieht der Pilot? Beschreibung, Anzahl, Deckung.' },
    { line: 6, key: 'grid',     label: 'Zielort (Grid)', short: 'Grid', ph: 'z. B. 35S VA 12345 67890', help: 'Koordinaten des Ziels – so genau wie möglich (8-stellig).' },
    { line: 7, key: 'mark',     label: 'Markierung', short: 'Mark', ph: 'z. B. Lase 1688 / rot Rauch', help: 'Wie markierst du? Laser-Code, Rauchfarbe, IR-Strobe …' },
    { line: 8, key: 'friend',   label: 'Eigene Kräfte', short: 'Friend', ph: 'z. B. 200 m südlich, kein Kontakt', help: 'Position & Richtung eigener Kräfte relativ zum Ziel.' },
    { line: 9, key: 'remarks',  label: 'Bemerkungen', short: 'Rmks', ph: 'z. B. Egress nach Nord, Flak bei 2500 m', help: 'Egress, Gefahren, Wetter, alles Wichtige.' }
  ],

  // ---------- 9-Line MEDEVAC (NATO-Standard) ----------
  medevacLines: [
    { line: 1, key: 'loc',       label: 'Ort der Aufnahme (Grid)', short: 'Loc', ph: 'z. B. 35S VA 12345 67890' },
    { line: 2, key: 'freq',      label: 'Frequenz / Callsign', short: 'Freq', ph: 'z. B. 36.50 / DUSTOFF 1' },
    { line: 3, key: 'patients',  label: 'Patienten nach Priorität', short: 'Pts', ph: 'z. B. A:1 B:0 C:2', help: 'A=urgent, B=urgent-surgical, C=priority, D=routine, E=convenience' },
    { line: 4, key: 'equip',     label: 'Spezialausrüstung', short: 'Equip', ph: 'z. B. A (keine)', help: 'A=keine, B=Seilwinde, C=Extraktion, D=Beatmung' },
    { line: 5, key: 'type',      label: 'Patienten nach Art', short: 'Type', ph: 'z. B. L:2 A:1', help: 'L=liegend (Litter), A=gehend (Ambulatory)' },
    { line: 6, key: 'security',  label: 'Sicherheitslage', short: 'Sec', ph: 'z. B. N (kein Feind)', help: 'N=kein Feind, P=möglich, E=Feind, X=bewaffnete Eskorte' },
    { line: 7, key: 'markmethod',label: 'Markierung LZ', short: 'Mark', ph: 'z. B. rot Rauch / VS-17', help: 'Wie wird die LZ markiert?' },
    { line: 8, key: 'nationality',label: 'Nationalität / Status', short: 'Nat', ph: 'z. B. 2 US, 1 zivil', help: 'Patienten-Nationalität und militärisch/zivil.' },
    { line: 9, key: 'nbc',       label: 'ABC-Kontamination', short: 'NBC', ph: 'z. B. NBC 1 / keine', help: 'NBC1/2/3 – oder „keine".' }
  ],

  // ---------- Brevity / Abkürzungen ----------
  brevity: [
    { code: 'CONTACT',        text: 'Ziel gesichtet & freigegeben' },
    { code: 'NO JOY',         text: 'Kein Sichtkontakt zum Ziel' },
    { code: 'TALLY',          text: 'Ziel ist in Sicht (Pilot)' },
    { code: 'VISUAL',         text: 'Ich sehe dein Flugzeug' },
    { code: 'LASE ON',        text: 'Laser ist an – Ziel ist markiert' },
    { code: 'LASE OFF',       text: 'Laser ist aus' },
    { code: 'CLEARED HOT',    text: 'Waffenfreigabe erteilt' },
    { code: 'CLEARED TO ENGAGE', text: 'Freigabe, Ziel zu bekämpfen' },
    { code: 'SPARKLE',        text: 'Ziel wird mit IR-Laser markiert' },
    { code: 'HOLD FIRE',      text: 'Feuer einstellen' },
    { code: 'CEASE FIRE',     text: 'Sofortiges Feuer einstellen' },
    { code: 'PLAYTIME',       text: 'Verfügbare Zeit über Ziel (z. B. 2 min)' },
    { code: 'BINGO',          text: 'Kraftstoffgrenze erreicht' },
    { code: 'BUGOUT',         text: 'Gefecht abbrechen & Gebiet verlassen' },
    { code: 'PUSH',           text: 'Frequenzwechsel (PUSH 1 = Freq. 1)' },
    { code: 'TALLY BANDIT',   text: 'Feindflugzeug gesichtet' },
    { code: 'FOX 2 / FOX 3',  text: 'IR-Lenkflugkörper / Radar-Lenkflugkörper abgefeuert' },
    { code: 'GUNS GUNS GUNS', text: 'Bordkanonen-Feuer' },
    { code: 'TARGET IN THE OPEN', text: 'Ziel ist ungedeckt' }
  ],

  // ---------- CAS-Ablauf (Standard) ----------
  casFlow: [
    '1. Kontakt aufnehmen – Callsign, Frequenz, „ready to copy 9-Line"',
    '2. 9-Line komplett übergeben (Pilot liest zurück)',
    '3. „Readback correct" – Fehler bestätigen/korrigieren',
    '4. Pilot: „…inbound from IP" – Kontrolle übernehmen',
    '5. Zielanweisung geben (z. B. „Target, 2 klicks north of smoke")',
    '6. „Cleared hot" – Waffeneinsatz',
    '7. Nach Einschlag: „Good effect / No effect"',
    '8. Bei Bedarf wiederholen oder „Contact terminate"'
  ],

  // ---------- 5er- und 6er-Line (Standard-Luftraum) ----------
  airLines: {
    five: [
      ['1', 'Sichtlage (z. B. „unlimited")'],
      ['2', 'Bewölkung (z. B. „scattered at 3000" oder „ceiling 5000")'],
      ['3', 'Sichtweite (z. B. „10 km")'],
      ['4', 'Niederschlag (z. B. „none" / „light rain")'],
      ['5', 'Wind (z. B. „270/15 kts")']
    ],
    six: [
      ['1', 'Grid des Ziels'],
      ['2', 'Zielbeschreibung'],
      ['3', 'Zielhöhe'],
      ['4', 'Markierung'],
      ['5', 'Freundliche Kräfte'],
      ['6', 'Bemerkungen']
    ]
  },

  // ---------- Laser-Codes (typisch) ----------
  laserCodes: ['1111','1212','1313','1414','1515','1616','1688','1717','1818','1919','2121','3131','4141','5151'],

  // ---------- Smoke-Farben ----------
  smokeColors: ['Rot','Grün','Gelb','Violett','Weiß','Orange','Blau'],

  // ---------- Risiko-Stufen ----------
  riskLevels: ['LOW','MEDIUM','HIGH']
};

// In Module-Dateien verfügbar machen
if (typeof window !== 'undefined') { window.REF = REF; }
if (typeof module !== 'undefined' && module.exports) { module.exports = REF; }
