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
  check(!!window.JTExtraBriefs, 'JTExtraBriefs geladen (Briefing Area)');
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
  check(window.REF.briefFormatsMain.length === 4, '4 Haupt-Formate (Kern)');
  check(window.REF.briefFormatsExtra.length === 6, '6 Briefing-Area-Formate');
  check(window.REF.briefFormats.length === 10, '10 Brief-Formate gesamt');
  check(window.REF.targets.length >= 15, 'Ziel-Dropdown gefüllt (' + window.REF.targets.length + ')');
  check(window.REF.ordnance.length >= 15, 'Ordnance-Dropdown gefüllt (' + window.REF.ordnance.length + ')');
  check(window.REF.brevity.length >= 90, 'Brevity-Wörterbuch (' + window.REF.brevity.length + ')');
  check(window.REF.airframesFlat.length === 10, 'Airframes geladen');
  check(window.REF.checklist.length >= 8, 'Pre-Mission-Checkliste (' + window.REF.checklist.length + ')');

  // Dashboard (Mission-first)
  const active = doc.querySelector('.view.active');
  check(active && active.id === 'view-home', 'Home-View aktiv (Dashboard)');
  const dashBtns = doc.querySelectorAll('#view-home .dash-btn');
  check(dashBtns.length === 9, 'Dashboard: 9 Schnellzugriff-Buttons');
  check(!!doc.getElementById('home-new-name'), 'Startseite: Mission-anlegen-Formular groß (Mission first)');
  check(!!doc.getElementById('dash-history-box'), 'Startseite: History-Panel vorhanden');

  // Mission: anlegen (mit Campaign + Typ)
  window.location.hash = '#/mission';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  doc.getElementById('mission-new-name').value = 'Op. Test';
  doc.getElementById('mission-new-campaign').value = 'Iron Wrath';
  const typeSel = doc.getElementById('mission-new-type');
  check(!!typeSel && typeSel.options.length === 3, 'Mission: Typ-Auswahl (OP/Side/Training)');
  typeSel.value = 'side';
  typeSel.dispatchEvent(new window.Event('change', { bubbles: true }));
  doc.querySelector('#mission-root .btn-primary').click();
  check(!!window.JTMissions.getActive(), 'Mission erstellt');
  check(window.JTMissions.getActive().name === 'Op. Test', 'Mission heißt Op. Test');
  check(window.JTMissions.getActive().campaign === 'Iron Wrath', 'Mission: Campaign gespeichert');
  check(window.JTMissions.getActive().type === 'side', 'Mission: Typ = side');
  check(doc.getElementById('mission-root').textContent.includes('Op. Test'), 'Mission-Ansicht zeigt Namen');
  check(doc.getElementById('mission-root').textContent.includes('SIDE OP'), 'Mission-Ansicht zeigt Typ-Badge');
  // Funkspruch-Log
  window.JTMissions.addScript('5-Line', 'Test funkspruch');
  check(window.JTMissions.getActive().scripts.length === 1, 'Funkspruch im Log');
  // BDA
  window.JTMissions.addBDA('BTR-42A', '0453 0976', 'zerstört');
  check(window.JTMissions.getActive().bda.length === 1, 'BDA gespeichert');
  // BDA-Schnellknöpfe
  check(doc.querySelectorAll('.quick-row .quick-btn').length >= 5, 'BDA-Schnellknöpfe vorhanden');
  check(!!doc.querySelector('#mission-root select[title*="X/10"]') || [...doc.querySelectorAll('#mission-root select')].some(s => s.title && s.title.includes('/10')), 'BDA X/10-Auswahl vorhanden');
  // Favorit
  window.JTMissions.addFav('HLZ Nord', '0453 0976');
  check(window.JTMissions.getActive().favs.length === 1, 'Favorit gespeichert');
  // Campaign-Report
  check(window.JTMissions.getCampaigns().includes('Iron Wrath'), 'Campaign erscheint in Liste');
  const report = window.JTMissions.campaignReport('Iron Wrath');
  check(!!report && report.includes('CAMPAIGN REPORT') && report.includes('Op. Test'), 'Campaign-Report erzeugt');
  check(report.includes('BTR-42A'), 'Campaign-Report enthält BDA');
  check(report.includes('SIDE OP'), 'Campaign-Report enthält Typ');

  // Campaign-Fortschritt (Listen-Ansicht ohne aktive Mission)
  const firstMissionId = window.JTMissions.getMissions()[0].id;
  window.JTMissions.setActive(null);
  window.JTMissions.render();
  check(doc.querySelectorAll('.campaign-head').length >= 1, 'Campaign-Gruppe angezeigt');
  const opDots = doc.querySelectorAll('.progress-dot');
  check(opDots.length >= 6, 'Fortschritts-Plätze (OPs) angezeigt');
  check(doc.querySelectorAll('.progress-dot.train').length >= 4, 'Training-Plätze (4) angezeigt');
  check(doc.querySelectorAll('.progress-dot.side').length >= 1, 'Side-OP-Plätze angezeigt');
  // wieder aktivieren für weitere Tests
  window.JTMissions.setActive(firstMissionId);
  window.JTMissions.render();

  // Channels
  check(window.JTChannels.getChannels().length >= 4, 'Channels geladen (' + window.JTChannels.getChannels().length + ')');
  check(window.JTChannels.getChannels().some(c => c.name === 'Ch. 2 TAD' && c.type === 'LR'), 'Channel Ch. 2 TAD (LR) vorhanden');
  check(window.JTChannels.getChannels().some(c => c.type === 'SR'), 'Short-Range-Channel vorhanden');
  check(doc.getElementById('pf-freqcas').getAttribute('list') === 'channels-list', 'Profil-Funk-Feld nutzt Channels-Datalist');

  // Startseite nach Mission: zeigt Mission groß + History
  window.location.hash = '#/home';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  check(doc.getElementById('dash-mission-box').textContent.includes('Op. Test'), 'Startseite: aktive Mission groß');
  check(doc.getElementById('dash-history-box').textContent.includes('Op. Test'), 'Startseite: History zeigt Mission');

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

  // Briefing Area: weitere Briefs
  window.location.hash = '#/briefing';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  check(doc.getElementById('view-briefing').classList.contains('active'), 'Briefing-Area-View aktiv');
  const extraTabs = doc.querySelectorAll('#extra-tabs .tab');
  check(extraTabs.length === 6, 'Briefing Area: 6 Tabs (Gunship, RPAS, ALZ, Airdrop, CFF, CCA)');
  // Call for Fire öffnen
  const cffTab = [...extraTabs].find(t => t.textContent.includes('Call for Fire'));
  cffTab.click();
  check(doc.querySelectorAll('#extra-form .field-row').length === 6, 'Briefing Area: Call for Fire mit 6 Zeilen');
  const cffSet = (fk, val) => {
    const el = doc.querySelector(`#extra-form [data-fk="${fk}"]`);
    if (el) { el.value = val; el.dispatchEvent(new window.Event('input', { bubbles: true })); }
    return !!el;
  };
  cffSet('observer', 'LONGBOW 1');
  cffSet('warno', 'fire for effect');
  cffSet('target', '0453 0976');
  cffSet('desc', '3 technicals');
  const cffScript = doc.getElementById('extra-preview').dataset.plain || '';
  check(cffScript.includes('Observer LONGBOW 1'), 'Briefing Area: CFF-Satz Observer');
  check(cffScript.includes('fire for effect, over'), 'Briefing Area: CFF-Satz WARNO');
  check(cffScript.includes('Target is on grid 0453 0976'), 'Briefing Area: CFF-Satz Target');
  // Senden aus Briefing Area → Mission-Log
  const beforeCff = window.JTMissions.getActive().scripts.length;
  doc.getElementById('extra-send').click();
  check(window.JTMissions.getActive().scripts.length === beforeCff + 1, 'Briefing Area: Senden ins Missions-Log');
  // Reset
  doc.getElementById('extra-reset').click();
  check(!(doc.getElementById('extra-preview').dataset.plain || ''), 'Briefing Area: Reset leert Vorschau');
  // zurück zu Haupt-Briefs
  window.location.hash = '#/briefs';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));

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

  // Einstellungen: Tabs + Channels + Daten + Update
  window.location.hash = '#/settings';
  window.dispatchEvent(new window.HashChangeEvent('hashchange'));
  check(doc.querySelectorAll('#settings-root .tab').length === 4, 'Einstellungen: 4 Tabs');
  // Update-Tab rendert die Update-Seite (ohne App-Backend → nur Hinweis + Button)
  const upTab = [...doc.querySelectorAll('#settings-root .tab')].find(t => t.textContent.includes('Update'));
  check(!!upTab, 'Einstellungen: Update-Tab vorhanden');
  upTab.click();
  check(!!doc.querySelector('#update-check-btn'), 'Update-Seite: Prüfen-Button da');
  const chTab = [...doc.querySelectorAll('#settings-root .tab')].find(t => t.textContent.includes('Channels'));
  chTab.click();
  check(!!doc.querySelector('#settings-root .data-table'), 'Einstellungen: Channel-Tabelle');
  check(doc.querySelectorAll('#settings-root .data-table tbody tr').length >= 4, 'Einstellungen: Channels gerendert');
  const dataTab = [...doc.querySelectorAll('#settings-root .tab')].find(t => t.textContent.includes('Daten'));
  dataTab.click();
  check(doc.querySelectorAll('#settings-root .panel').length >= 3, 'Einstellungen: Daten-Bereiche');
  // Eigenes Ziel hinzufügen
  const targetInput = [...doc.querySelectorAll('#settings-root input')].find(i => i.placeholder.includes('MT-LB'));
  targetInput.value = 'T-14 Armata';
  targetInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  const addBtn = targetInput.parentElement.querySelector('.btn-primary') || targetInput.parentElement.parentElement.querySelector('.btn-primary');
  addBtn.click();
  check(window.JTData.getTargets().includes('T-14 Armata'), 'Eigenes Ziel hinzugefügt');

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
