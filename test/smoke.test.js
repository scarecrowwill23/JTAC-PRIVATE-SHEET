// Smoke-Test: lädt index.html in jsdom, führt alle Skripte aus,
// prüft auf Laufzeitfehler und ob die Views rendern.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');

// relative Script-Pfade aus dem HTML lesen
const scriptSrcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

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
    // localStorage-Shim (file://-Origin hat in jsdom keinen Storage)
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

  // Kern-Objekte vorhanden
  check(!!window.REF, 'REF-Daten geladen');
  check(!!window.mgrs && typeof window.mgrs.forward === 'function', 'mgrs-Lib geladen');
  check(!!window.GridCalc, 'GridCalc geladen');
  check(!!window.JTForms, 'JTForms geladen');
  check(!!window.JTTimer, 'JTTimer geladen');
  check(!!window.JTProfiles, 'JTProfiles geladen');
  check(!!window.JTRefs, 'JTRefs geladen');
  check(!!window.App, 'App geladen');

  // Router: Start-View aktiv
  const active = doc.querySelector('.view.active');
  check(active && active.id === 'view-home', 'Home-View aktiv (Router)');

  // Navigation durchklicken
  ['cas', 'medevac', 'grid', 'timer', 'profile', 'refs'].forEach(r => {
    window.location.hash = '#/' + r;
    window.dispatchEvent(new window.HashChangeEvent('hashchange'));
    const v = doc.getElementById('view-' + r);
    check(v && v.classList.contains('active'), 'Route #/' + r + ' aktiv');
  });
  window.location.hash = '#/home';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));

  // CAS-Formular: Felder existieren?
  const casForm = doc.getElementById('cas-form');
  check(casForm && casForm.querySelectorAll('.field-row.align').length === 9, 'CAS: 9 Zeilen gerendert');
  const medForm = doc.getElementById('medevac-form');
  check(medForm && medForm.querySelectorAll('.field-row.align').length === 9, 'MEDEVAC: 9 Zeilen gerendert');

  // CAS-Eingabe → Vorschau
  const ipInput = casForm.querySelector('.field-row.align input');
  if (ipInput) {
    ipInput.value = '35S LE 20476 18769';
    ipInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    const preview = doc.getElementById('cas-preview');
    check(preview && preview.textContent.includes('1. IP'), 'CAS-Vorschau nach Eingabe aktualisiert');
    check(preview && preview.dataset.plain && preview.dataset.plain.length > 0, 'CAS-Vorschau als Plain-Text gespeichert');
  }

  // Timer-Init
  check(!!doc.getElementById('timer-start'), 'Timer-Button vorhanden');

  // Profile gerendert
  window.JTProfiles.renderCards('profile-list');
  const cards = doc.querySelectorAll('#profile-list .profile-card');
  check(cards.length === 3, '3 Profil-Karten gerendert');
  check(cards[0].classList.contains('active'), 'Erstes Profil aktiv');
  window.JTProfiles.renderEditForm();
  check(doc.getElementById('pf-name').value === 'Standard JTAC', 'Profil-Bearbeitungsformular befüllt');

  // Referenzen
  window.JTRefs.render();
  const brevity = doc.getElementById('brevity-list');
  check(brevity && brevity.querySelectorAll('li').length > 10, 'Brevity-Liste gerendert (' + (brevity ? brevity.querySelectorAll('li').length : 0) + ' Einträge)');

  // Grid-Rechner UI: Eingaben setzen
  const zoneSel = doc.getElementById('grid-zone');
  check(zoneSel && zoneSel.options.length === window.REF.maps.length, 'Karten-Dropdown befüllt');
  doc.getElementById('grid-a').value = '100 100';
  doc.getElementById('grid-b').value = '200 300';
  doc.getElementById('grid-a').dispatchEvent(new window.Event('input', { bubbles: true }));
  const dist = doc.getElementById('gr-dist');
  check(dist && dist.textContent.includes('22.361'), 'Grid-Rechner Distanz angezeigt: ' + dist.textContent);

  // Theme-Toggle
  const t = doc.getElementById('theme-toggle');
  t.click();
  check(doc.documentElement.dataset.theme === 'light', 'Theme-Wechsel auf hell');
  t.click();
  check(doc.documentElement.dataset.theme === 'dark', 'Theme-Wechsel zurück auf dunkel');

  // Profil-Wechsel per Klick auf Karte 2
  doc.querySelectorAll('#profile-list .profile-card')[1].click();
  check(doc.getElementById('profile-select').value === 'p2', 'Profil-Wechsel über Karte aktualisiert Select');

  // Toast
  window.App.toast('Test');
  const toast = doc.getElementById('toast');
  check(toast.classList.contains('show'), 'Toast erscheint');

  if (errors.length) {
    console.log('\n✘ Laufzeitfehler:');
    errors.forEach(e => console.log('  - ' + e));
    process.exitCode = 1;
  } else {
    console.log('\n✔ KEINE Laufzeitfehler');
  }
}, 1500);
