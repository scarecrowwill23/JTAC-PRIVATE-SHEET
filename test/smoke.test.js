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
  check(!!window.JTBriefs, 'JTBriefs geladen');
  check(!!window.JTCasFlow, 'JTCasFlow geladen');
  check(!!window.JTTimer, 'JTTimer geladen');
  check(!!window.JTProfiles, 'JTProfiles geladen');
  check(!!window.JTRefs, 'JTRefs geladen');
  check(!!window.App, 'App geladen');

  // Referenzdaten vollständig
  check(window.REF.casSteps.length === 12, '12 CAS-Schritte definiert');
  check(window.REF.cas9.lines.length === 9, 'CAS 9-Line: 9 Felder');
  check(window.REF.cas5.lines.length === 5, 'CAS 5-Line: 5 Felder');
  check(window.REF.medevac.lines.length === 9, 'MEDEVAC: 9 Felder');
  check(window.REF.dangerClose.groups.reduce((n, g) => n + g.items.length, 0) >= 20, 'Danger-Close-Tabelle gefüllt');
  check(window.REF.brevity.length >= 60, 'Brevity-Wörterbuch groß (' + window.REF.brevity.length + ')');
  check(window.REF.airframes.transport.length === 4 && window.REF.airframes.cas.length === 3, 'Airframes geladen');
  check(window.REF.radios.length >= 8, 'Funkgeräte geladen');

  // Router
  const active = doc.querySelector('.view.active');
  check(active && active.id === 'view-home', 'Home-View aktiv (Dashboard)');

  // Dashboard
  const dashBtns = doc.querySelectorAll('#view-home .dash-btn');
  check(dashBtns.length === 6, 'Dashboard: 6 Schnellzugriff-Buttons');
  check(doc.getElementById('dash-profil').textContent.includes('GRANITE 10'), 'Dashboard: Profil angezeigt');
  check(doc.getElementById('dash-jtac').textContent.includes('GRANITE 10'), 'Dashboard: JTAC-Callsign');
  check(doc.getElementById('dash-laser').textContent.includes('1111'), 'Dashboard: Laser-Code');
  check(doc.getElementById('dash-airframe-box').textContent.includes('MH-60M DAP'), 'Dashboard: Airframe-Karte');
  // Dashboard-Klick → 9-Line öffnen
  const casBtn = [...dashBtns].find(b => b.textContent.includes('9-Line'));
  casBtn.click();
  check(window.JTBriefs.current() === 'cas9', 'Dashboard: 9-Line geöffnet');
  const medBtn = [...doc.querySelectorAll('#view-home .dash-btn')].find(b => b.textContent.includes('MEDEVAC'));
  medBtn.click();
  check(window.JTBriefs.current() === 'medevac', 'Dashboard: MEDEVAC geöffnet');

  // Navigation durchklicken
  ['casflow', 'briefs', 'grid', 'timer', 'profile', 'refs'].forEach(r => {
    window.location.hash = '#/' + r;
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    const v = doc.getElementById('view-' + r);
    check(v && v.classList.contains('active'), 'Route #/' + r + ' aktiv');
  });

  // CASFlow: Stepper & Form
  const stepper = doc.querySelectorAll('#casflow-stepper .step');
  check(stepper.length === 12, 'CASFlow: 12 Stepper-Schritte');
  window.location.hash = '#/casflow';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  // Schritt 2 (Check-in) anklicken → Formular
  const steps = doc.querySelectorAll('#casflow-stepper .step');
  if (steps.length > 1) steps[1].click();
  const flowForm = doc.getElementById('casflow-form');
  check(flowForm && flowForm.querySelectorAll('.field-row').length >= 8, 'CASFlow: Check-in-Formular gerendert (' + (flowForm ? flowForm.querySelectorAll('.field-row').length : 0) + ' Zeilen)');

  // Briefs: Tabs & Form
  window.location.hash = '#/briefs';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  const tabs = doc.querySelectorAll('#brief-tabs .tab');
  check(tabs.length === 10, 'Briefs: 10 Tabs');
  check(doc.querySelectorAll('#brief-form .field-row').length === 9, 'Briefs: CAS 9-Line mit 9 Zeilen');
  check(!!doc.querySelector('#brief-form .field-row.rb'), 'Briefs: Readback-Zeilen markiert');

  // Brief-Eingabe → Vorschau
  const input = doc.querySelector('#brief-form .field-row:not(.rb) input') ||
                doc.querySelector('#brief-form .field-row input');
  if (input) {
    input.value = '35S LE 20476 18769';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    const preview = doc.getElementById('brief-preview');
    check(preview && preview.dataset.plain && preview.dataset.plain.length > 0, 'Briefs: Vorschau aktualisiert');
  }

  // Tab-Wechsel: MEDEVAC
  const medTab = [...doc.querySelectorAll('#brief-tabs .tab')].find(t => t.textContent === 'MEDEVAC');
  if (medTab) {
    medTab.click();
    check(doc.querySelectorAll('#brief-form .field-row').length === 9, 'MEDEVAC: 9 Zeilen');
    check(!!doc.querySelector('#brief-form .numgroup'), 'MEDEVAC: Prioritäten-Zahlengruppe');
  }

  // Referenzen
  window.location.hash = '#/refs';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  const refTabs = doc.querySelectorAll('#refs-tabs .tab');
  check(refTabs.length === 7, 'Refs: 7 Tabs');
  // Brevity-Tab aktiv (Standard)
  const brevityCards = doc.querySelectorAll('#refs-root .ref-card');
  check(brevityCards.length >= 6, 'Refs: Brevity-Kategorien gerendert');

  // Grid
  window.location.hash = '#/grid';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  doc.getElementById('grid-a').value = '100 100';
  doc.getElementById('grid-b').value = '200 300';
  doc.getElementById('grid-a').dispatchEvent(new window.Event('input', { bubbles: true }));
  const dist = doc.getElementById('gr-dist');
  check(dist && dist.textContent.includes('22.361'), 'Grid-Rechner Distanz: ' + dist.textContent);

  // Timer & Profile
  check(!!doc.getElementById('timer-start'), 'Timer-Button vorhanden');
  window.JTProfiles.renderCards('profile-list');
  check(doc.querySelectorAll('#profile-list .profile-card').length === 3, '3 Profil-Karten');
  check(doc.querySelector('#profile-list .profile-card h3').textContent.includes('GRANITE 10'), 'Preset GRANITE 10 vorhanden');
  window.JTProfiles.renderEditForm();
  check(doc.getElementById('pf-name').value === 'GRANITE 10', 'Profil-Bearbeitung: GRANITE 10');
  check(doc.getElementById('pf-freqcas').value === 'Ch. 2 TAD', 'Profil: Funk Channel 2 TAD');
  check(doc.getElementById('pf-laser').value === '1111', 'Profil: Laser 1111');
  const af = window.REF.findAirframe('ARCHER 3-X');
  check(af && af.name === 'MH-60M DAP', 'findAirframe(ARCHER 3-X) → MH-60M DAP');
  check(window.REF.airframesFlat.length === 10, 'airframesFlat: 10 Einträge');
  // Airframe-Hinweis rendert
  window.JTProfiles.renderAirframeHint();
  check(doc.getElementById('pf-airframe').style.display === 'block' && doc.getElementById('pf-airframe').textContent.includes('MH-60M DAP'), 'Airframe-Hinweis im Profil');
  // Briefs: Airframe-Referenzbox
  window.location.hash = '#/briefs';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  const baf = doc.getElementById('brief-airframe');
  check(baf && baf.style.display === 'block' && baf.textContent.includes('MH-60M DAP'), 'Briefs: Airframe-Referenzbox');

  // Theme
  doc.getElementById('theme-toggle').click();
  check(doc.documentElement.dataset.theme === 'light', 'Theme auf hell');
  doc.getElementById('theme-toggle').click();
  check(doc.documentElement.dataset.theme === 'dark', 'Theme auf dunkel');

  // Toast
  window.App.toast('Test');
  check(doc.getElementById('toast').classList.contains('show'), 'Toast erscheint');

  if (errors.length) {
    console.log('\n✘ Laufzeitfehler:');
    errors.forEach(e => console.log('  - ' + e));
    process.exitCode = 1;
  } else {
    console.log('\n✔ KEINE Laufzeitfehler');
  }
}, 1800);
