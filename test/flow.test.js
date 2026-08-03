// Workflow-Test: 12-Schritte-CAS mit Satz-Output + Mission-Log
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  url: 'file://' + root + '/src/index.html',
  runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
  beforeParse(window) {
    window.confirm = () => true; window.prompt = () => '';
    window.console.error = (...a) => errors.push(a.join(' '));
    window.addEventListener('error', e => errors.push(e.message));
    const store = new Map();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: k => store.has(k) ? store.get(k) : null,
      setItem: (k, v) => store.set(String(k), String(v)), removeItem: k => store.delete(k), clear: () => store.clear()
    }});
  }
});

setTimeout(() => {
  const w = dom.window, doc = w.document;
  const ok = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + ': ' + m); if (!c) process.exitCode = 1; };

  // Mission anlegen
  w.location.hash = '#/mission';
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  doc.getElementById('mission-new-name').value = 'Op. Flow Test';
  doc.querySelector('#mission-root .btn-primary').click();

  // Workflow öffnen
  w.location.hash = '#/casflow';
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  const stepClick = (n) => doc.querySelectorAll('#casflow-stepper .step')[n - 1].click();
  const setField = (fk, val) => {
    const el = doc.querySelector(`#casflow-form [data-fk="${fk}"]`);
    if (el) { el.value = val; el.dispatchEvent(new w.Event('input', { bubbles: true })); }
    return !!el;
  };

  // Schritt 2: Check-in
  stepClick(2);
  ok(setField('callsign', 'ARCHER 3-1'), 'Check-in: Callsign-Feld');
  setField('mission', 'MSN 1');
  setField('aircraft', '1x MH-60M DAP');
  setField('position', 'HA Alpha');
  setField('ordnance', 'M134, Hydra');
  setField('playtime', '40 min');
  setField('capabilities', 'Laser');
  setField('abort', 'abort in the clear');

  // Schritt 3: TEFACHR
  stepClick(3);
  setField('threat', 'MANPADS möglich');
  setField('enemy', 'Zug Stärke, 2 BTR');
  setField('friendly', '1. Zug hält Linie');
  setField('artillery', 'GTL 045 aktiv');
  setField('clearance', 'Cdr Miller (JM)');
  setField('hazards', 'Min Safe Alt 3000 ft');

  // Schritt 4: Game Plan
  stepClick(4);
  const gpSel = doc.querySelector('#casflow-form select');
  if (gpSel) { gpSel.value = 'Type 2'; gpSel.dispatchEvent(new w.Event('change', { bubbles: true })); }
  setField('ordnance', 'Hydra, Zerstörung');

  // Schritt 5: Brief (5-Line)
  stepClick(5);
  const typeSel = doc.querySelector('#casflow-form select');
  typeSel.value = 'cas5';
  typeSel.dispatchEvent(new w.Event('change', { bubbles: true }));
  const setBrief = (fk, val) => {
    const el = doc.querySelector(`#casflow-brief-sub [data-fk="${fk}"]`);
    if (el) { el.value = val; el.dispatchEvent(new w.Event('input', { bubbles: true })); }
    return !!el;
  };
  setBrief('control', 'Type 2');
  setBrief('moa', 'BOT');
  setBrief('count', '1');
  setBrief('ordnance', 'M134');
  setBrief('loc', '300 m nordwestlich');
  setBrief('mark', 'IR strobe');
  setBrief('grid', '0453 0976');
  setBrief('desc', 'BTR-42A');
  setBrief('ltl', '342');

  // Schritt 6: Remarks
  stepClick(6);
  setField('fah', '010');
  setField('dangerclose', 'DC 270 m, JM');
  setField('tot', 'TOT 1600 Zulu');

  // Schritt 11: BDA
  stepClick(11);
  setField('size', 'BTR zerstört');
  setField('activity', 'kein Feuer');
  setField('location', '0453 0976');
  setField('remarks', 'Re-Attack möglich');

  const preview = doc.getElementById('casflow-preview');
  const text = preview.dataset.plain || '';
  ok(text.includes('CAS CHECK-IN'), 'Workflow: Check-in enthalten');
  ok(text.includes('SITREP'), 'Workflow: TEFACHR enthalten');
  ok(text.includes('GAME PLAN'), 'Workflow: Game Plan enthalten');
  ok(text.includes('CAS BRIEF'), 'Workflow: CAS BRIEF enthalten');
  ok(text.includes('Type 2 control'), 'Workflow: 5-Line Satz (Type 2 control)');
  ok(text.includes('Target is on grid 0453 0976'), 'Workflow: 5-Line Satz (Grid)');
  ok(text.includes('Target is BTR-42A'), 'Workflow: 5-Line Satz (Beschreibung)');
  ok(text.includes('REMARKS'), 'Workflow: Remarks enthalten');
  ok(text.includes('BDA'), 'Workflow: BDA enthalten');
  // RadioEN: deutsche Eingaben werden im Funkspruch automatisch englisch
  ok(text.includes('north-west'), 'RadioEN: „nordwestlich“ wird „north-west“');
  ok(!text.includes('nordwestlich'), 'RadioEN: kein Deutsch mehr im Spruch (loc)');
  ok(text.includes('destroyed'), 'RadioEN: „zerstört“ wird „destroyed“');
  ok(text.includes('no fire'), 'RadioEN: „kein Feuer“ wird „no fire“');
  ok(text.includes('GTL 045 active'), 'RadioEN: „aktiv“ wird „active“ (TEFACHR)');

  if (errors.length) { console.log('Laufzeitfehler:', errors); process.exitCode = 1; }
  else console.log('✔ KEINE FEHLER');
}, 2500);
