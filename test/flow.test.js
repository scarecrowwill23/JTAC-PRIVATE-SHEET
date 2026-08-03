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
  const fill = (sel, val) => {
    const el = doc.querySelector(sel);
    if (el) { el.value = val; el.dispatchEvent(new w.Event('input', { bubbles: true })); }
  };
  const stepClick = (n) => doc.querySelectorAll('#casflow-stepper .step')[n - 1].click();

  // Route zu casflow
  w.location.hash = '#/casflow';
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));

  // Schritt 2: Check-in
  stepClick(2);
  fill('#casflow-form .field-row:nth-child(1) input', 'HAVOC 1-1');
  fill('#casflow-form .field-row:nth-child(2) input', 'MSN 15-2');
  fill('#casflow-form .field-row:nth-child(3) input', '2x A-10C');
  fill('#casflow-form .field-row:nth-child(4) input', 'HA Alpha, 5000 ft');
  fill('#casflow-form .field-row:nth-child(5) input', '4x Maverick, 12x Paveway');
  fill('#casflow-form .field-row:nth-child(6) input', '40 min');
  fill('#casflow-form .field-row:nth-child(7) input', 'Laser Spot Tracker');
  fill('#casflow-form .field-row:nth-child(8) input', 'abort in the clear');

  // Schritt 3: TEFACHR
  stepClick(3);
  fill('#casflow-form .field-row:nth-child(1) input', 'ZSU-23 bei 123 456');
  fill('#casflow-form .field-row:nth-child(2) input', 'Zug Stärke, 3 BTR');
  fill('#casflow-form .field-row:nth-child(3) input', '1. Zug hält Linie');
  fill('#casflow-form .field-row:nth-child(4) input', '2x M119, GTL 045 aktiv');
  fill('#casflow-form .field-row:nth-child(5) input', 'Cdr Miller, Initialen JM');
  fill('#casflow-form .field-row:nth-child(6) input', 'Min Safe Alt 3000 ft');
  fill('#casflow-form .field-row:nth-child(7) input', 'CAS-Absicht: Zerstörung');

  // Schritt 4: Game Plan
  stepClick(4);
  const sel = doc.querySelector('#casflow-form select');
  sel.value = 'Type 2'; sel.dispatchEvent(new w.Event('change', { bubbles: true }));
  fill('#casflow-form .field-row:nth-child(2) input', 'BOT');
  fill('#casflow-form .field-row:nth-child(3) input', 'GBU-12, Zerstörung');
  fill('#casflow-form .field-row:nth-child(4) input', '—');

  // Schritt 5: Brief (9-Line)
  stepClick(5);
  const typeSel = doc.querySelector('#casflow-form select');
  typeSel.value = 'cas9'; typeSel.dispatchEvent(new w.Event('change', { bubbles: true }));
  fill('#casflow-brief-sub .field-row:nth-child(1) input', 'IP Alpha');
  fill('#casflow-brief-sub .field-row:nth-child(2) input', '280°');
  fill('#casflow-brief-sub .field-row:nth-child(3) input', '8 km');
  fill('#casflow-brief-sub .field-row:nth-child(4) input', '120 m MSL');
  fill('#casflow-brief-sub .field-row:nth-child(5) input', 'T-90, Kompanie');
  fill('#casflow-brief-sub .field-row:nth-child(6) input', '35S LE 20476 18769');
  fill('#casflow-brief-sub .field-row:nth-child(7) input', 'Lase 1688');
  fill('#casflow-brief-sub .field-row:nth-child(8) input', '200 m südlich');
  fill('#casflow-brief-sub .field-row:nth-child(9) input', 'Egress Nord');

  // Schritt 6: Remarks
  stepClick(6);
  fill('#casflow-form .field-row:nth-child(1) input', '010');
  fill('#casflow-form .field-row:nth-child(2) input', 'LTL 320');
  fill('#casflow-form .field-row:nth-child(3) input', 'ZSU-23, SEAD aktiv');
  fill('#casflow-form .field-row:nth-child(5) input', 'DC 270 m, JM');

  // Schritt 11: BDA
  stepClick(11);
  fill('#casflow-form .field-row:nth-child(1) input', 'T-90 zerstört');
  fill('#casflow-form .field-row:nth-child(2) input', 'kein Feuer');
  fill('#casflow-form .field-row:nth-child(3) input', '35S LE 20476 18769');
  fill('#casflow-form .field-row:nth-child(4) input', '16:02 Zulu');
  fill('#casflow-form .field-row:nth-child(5) input', 'Re-Attack empfohlen');

  const preview = doc.getElementById('casflow-preview');
  const text = preview.dataset.plain || '';
  console.log('===== GESAMMELTER FUNKSPRUCH =====');
  console.log(text);
  console.log('===================================');
  const ok = (c, m) => { console.log((c ? 'PASS' : 'FAIL') + ': ' + m); if (!c) process.exitCode = 1; };
  ok(text.includes('CAS CHECK-IN'), 'Check-in enthalten');
  ok(text.includes('SITREP'), 'TEFACHR enthalten');
  ok(text.includes('GAME PLAN'), 'Game Plan enthalten');
  ok(text.includes('9-Line, ready to copy'), '9-Line Brief enthalten');
  ok(text.includes('6. GRID: 35S LE 20476 18769'), 'Grid-Zeile enthalten');
  ok(text.includes('REMARKS'), 'Remarks enthalten');
  ok(text.includes('BDA'), 'BDA enthalten');
  ok(text.includes('Danger Close') || text.includes('DC 270'), 'Danger Close enthalten');
  if (errors.length) { console.log('Laufzeitfehler:', errors); process.exitCode = 1; }
  else console.log('✔ KEINE FEHLER');
}, 2000);
