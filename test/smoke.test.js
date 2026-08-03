// Smoke-Test: lädt index.html in jsdom, führt alle Skripte aus,
// prüft auf Laufzeitfehler und ob die Views rendern.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  url: 'file://' + path.join(root, 'src', 'index.html'),
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.confirm = () => true;
    window.prompt = () => '';
    window.console.error = (...a) => { errors.push('console.error: ' + a.join(' ')); };
    window.addEventListener('error', e => errors.push('window.onerror: ' + e.message));
    const store = new Map();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: k => store.has(k) ? store.get(k) : null,
        setItem: (k, v) => store.set(String(k), String(v)),
        removeItem: k => store.delete(k),
        clear: () => store.clear()
      }
    });
  }
});

setTimeout(() => {
  const { window } = dom;
  const doc = window.document;

  const check = (cond, msg) => {
    console.log((cond ? 'PASS' : 'FAIL') + ': ' + msg);
    if (!cond) process.exitCode = 1;
  };

  // Kern-Objekte
  check(!!window.REF, 'REF-Daten geladen');
  check(!!window.mgrs && typeof window.mgrs.forward === 'function', 'mgrs-Lib geladen');
  check(!!window.GridCalc, 'GridCalc geladen');
  check(!!window.JTForms, 'JTForms geladen');
  check(!!window.JTMissions, 'JTMissions geladen');
  check(!!window.JTBriefs, 'JTBriefs geladen');
  check(!!window.JTCasFlow, 'JTCasFlow geladen');
  check(!!window.JTTimer, 'JTTimer geladen');
  check(!!window.JTProfiles, 'JTProfiles geladen');
  check(!!window.JTRefs, 'JTRefs geladen');
  check(!!window.App, 'App geladen');

  // Referenzdaten
  check(window.REF.casSteps.length === 12, '12 CAS-Schritte definiert');
  check(window.REF.cas9.lines.length === 9, 'CAS 9-Line: 9 Zeilen');
  check(window.REF.cas5.lines.length === 5, 'CAS 5-Line: 5 Zeilen');
  check(window.REF.hlz.lines.length === 6, 'HLZ: 6 Zeilen');
  check(window.REF.medevac.lines.length === 9, 'MEDEVAC: 9 Zeilen');
  check(window.REF.briefFormats.length === 10, '10 Brief-Formate');
  check(window.REF.targets.length >= 15, 'Ziel-Dropdown gefüllt (' + window.REF.targets.length + ')');
  check(window.REF.ordnance.length >= 15, 'Ordnance-Dropdown gefüllt (' + window.REF.ordnance.length + ')');
  check(window.REF.brevity.length >= 90, 'Brevity-Wörterbuch (' + window.REF.brevity.length + ')');
  check(window.REF.airframesFlat.length === 10, 'Airframes geladen');
  check(window.REF.checklist.length >= 8, 'Pre-Mission-Checkliste (' + window.REF.checklist.length + ')');

  // Dashboard
  const active = doc.querySelector('.view.active');
  check(active && active.id === 'view-home', 'Home-View aktiv (Dashboard)');
  const dashBtns = doc.querySelectorAll('#view-home .dash-btn');
  check(dashBtns.length === 8, 'Dashboard: 8 Schnellzugriff-Buttons');
  check(doc.getElementById('dash-airframe-box').textContent.includes('MH-60M DAP'), 'Dashboard: Airframe-Karte');

  // Mission: anlegen
  window.location.hash = '#/mission';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  doc.getElementById('mission-new-name').value = 'Op. Test';
  doc.querySelector('#mission-root .btn-primary').click();
  check(!!window.JTMissions.getActive(), 'Mission erstellt');
  check(window.JTMissions.getActive().name === 'Op. Test', 'Mission heißt Op. Test');
  check(doc.getElementById('mission-root').textContent.includes('Op. Test'), 'Mission-Ansicht zeigt Namen');
  // Funkspruch-Log
  window.JTMissions.addScript('5-Line', 'Test funkspruch');
  check(window.JTMissions.getActive().scripts.length === 1, 'Funkspruch im Log');
  // BDA
  window.JTMissions.addBDA('BTR-42A', '0453 0976', 'zerstört');
  check(window.JTMissions.getActive().bda.length === 1, 'BDA gespeichert');
  // Favorit
  window.JTMissions.addFav('HLZ Nord', '0453 0976');
  check(window.JTMissions.getActive().favs.length === 1, 'Favorit gespeichert');

  // 5-Line: Satz-Output
  window.location.hash = '#/briefs';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  window.JTBriefs.open('cas5');
  check(doc.querySelectorAll('#brief-form .field-row').length === 5, '5-Line: 5 Zeilen');
  check(!!doc.querySelector('#brief-form .subfields'), '5-Line: Sub-Felder');

  const setField = (rowIdx, fk, val) => {
    const row = doc.querySelectorAll('#brief-form .field-row')[rowIdx];
    const el = row && row.querySelector(`[data-fk="${fk}"]`);
    if (el) { el.value = val; el.dispatchEvent(new window.Event('input', { bubbles: true })); }
    return !!el;
  };

  setField(0, 'control', 'Type 2');
  setField(0, 'moa', 'BOT');
  setField(0, 'count', '2');
  setField(0, 'ordnance', '114 Kilo');
  setField(1, 'loc', '200 m westlich');
  setField(1, 'mark', 'smoke');
  setField(2, 'grid', '0453 0976');
  setField(3, 'desc', 'BTR-42A');
  setField(3, 'mark', 'laser');
  setField(4, 'ltl', '342');

  const script = doc.getElementById('brief-preview').dataset.plain || '';
  check(script.includes('this is'), 'Satz-Output: Callsign-Intro');
  check(script.includes('Type 2 control'), 'Satz-Output: Type 2 control');
  check(script.includes('2 times'), 'Satz-Output: 2 times');
  check(script.includes('114 Kilo'), 'Satz-Output: 114 Kilo');
  check(script.includes('Friendly position is 200 m westlich marked by smoke'), 'Satz-Output: Friendly-Satz');
  check(script.includes('Target is on grid 0453 0976'), 'Satz-Output: Target-Grid-Satz');
  check(script.includes('Target is BTR-42A marked by laser'), 'Satz-Output: Target-Desc-Satz');
  check(script.includes('Laser to target line 342'), 'Satz-Output: LTL-Satz');

  // Senden → Mission-Log + Readback
  const before = window.JTMissions.getActive().scripts.length;
  doc.getElementById('brief-send').click();
  check(window.JTMissions.getActive().scripts.length === before + 1, 'Senden schreibt ins Missions-Log');
  check(!!doc.querySelector('#brief-readback .readback-box'), 'Readback-Box erscheint');

  // Reset
  doc.getElementById('brief-reset').click();
  check(!(doc.getElementById('brief-preview').dataset.plain || ''), 'Reset leert Vorschau');

  // HLZ
  window.JTBriefs.open('hlz');
  check(doc.querySelectorAll('#brief-form .field-row').length === 6, 'HLZ: 6 Zeilen');
  setField(0, 'loc', '0453 0976');
  const hlzScript = doc.getElementById('brief-preview').dataset.plain || '';
  check(hlzScript.includes('Landing zone is at grid 0453 0976'), 'HLZ-Satz: Landing zone');

  // 9-Line
  window.JTBriefs.open('cas9');
  check(doc.querySelectorAll('#brief-form .field-row').length === 9, '9-Line: 9 Zeilen');

  // Grid → Brief
  window.location.hash = '#/grid';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  doc.getElementById('grid-a').value = '100 100';
  doc.getElementById('grid-b').value = '200 300';
  doc.getElementById('grid-a').dispatchEvent(new window.Event('input', { bubbles: true }));
  const dist = doc.getElementById('gr-dist');
  check(dist && dist.textContent.includes('22.361'), 'Grid-Rechner Distanz: ' + dist.textContent);

  // CASFlow
  window.location.hash = '#/casflow';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  check(doc.querySelectorAll('#casflow-stepper .step').length === 12, 'CASFlow: 12 Stepper');
  doc.querySelectorAll('#casflow-stepper .step')[1].click();
  check(doc.querySelectorAll('#casflow-form .field-row').length >= 8, 'CASFlow: Check-in-Formular');

  // Refs: 8 Tabs + Dokumente
  window.location.hash = '#/refs';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  check(doc.querySelectorAll('#refs-tabs .tab').length === 8, 'Refs: 8 Tabs');
  const docsTab = [...doc.querySelectorAll('#refs-tabs .tab')].find(t => t.textContent.includes('Dokumente'));
  docsTab.click();
  check(doc.querySelectorAll('.doc-card').length === 4, 'Refs: 4 Dokumente-Karten');

  // Profile
  window.JTProfiles.renderCards('profile-list');
  check(doc.querySelectorAll('#profile-list .profile-card').length === 3, '3 Profil-Karten');
  check(doc.querySelector('#profile-list .profile-card h3').textContent.includes('GRANITE 10'), 'Preset GRANITE 10');
  window.JTProfiles.renderEditForm();
  check(doc.getElementById('pf-freqcas').value === 'Ch. 2 TAD', 'Profil: Ch. 2 TAD');
  check(doc.getElementById('pf-laser').value === '1111', 'Profil: Laser 1111');

  // Suche
  doc.getElementById('global-search').value = 'lase';
  doc.getElementById('global-search').dispatchEvent(new window.Event('input', { bubbles: true }));
  check(doc.querySelectorAll('#search-results .search-item').length > 0, 'Globale Suche liefert Treffer');

  // Theme & Toast
  doc.getElementById('theme-toggle').click();
  check(doc.documentElement.dataset.theme === 'light', 'Theme auf hell');
  doc.getElementById('theme-toggle').click();
  window.App.toast('Test');
  check(doc.getElementById('toast').classList.contains('show'), 'Toast erscheint');

  if (errors.length) {
    console.log('\n✘ Laufzeitfehler:');
    errors.forEach(e => console.log('  - ' + e));
    process.exitCode = 1;
  } else {
    console.log('\n✔ KEINE Laufzeitfehler');
  }
}, 2200);
