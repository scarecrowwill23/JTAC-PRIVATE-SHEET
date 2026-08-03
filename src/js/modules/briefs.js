// ============================================================
// JTAC Private Sheet – Briefs & Formulare
// Verwaltet alle Brief-Formate (CAS 9/5-Line, MEDEVAC, Gunship,
// CCA, RPAS, HLZ, ALZ, Airdrop, Call for Fire) mit Tabs.
// ============================================================

(function () {
  'use strict';

  const FORMATS = [
    { id: 'cas9',   label: '9-Line CAS',   ref: 'cas9' },
    { id: 'cas5',   label: '5-Line CAS',   ref: 'cas5' },
    { id: 'medevac',label: 'MEDEVAC',      ref: 'medevac' },
    { id: 'gunship',label: 'Gunship',      ref: 'gunship' },
    { id: 'cca',    label: 'CCA 5-Line',   ref: 'cca' },
    { id: 'rpas',   label: 'RPAS (UAV)',   ref: 'rpas' },
    { id: 'hlz',    label: 'HLZ',          ref: 'hlz' },
    { id: 'alz',    label: 'ALZ',          ref: 'alz' },
    { id: 'airdrop',label: 'Airdrop',      ref: 'airdrop' },
    { id: 'cff',    label: 'Call for Fire',ref: 'cff' }
  ];

  let current = 'cas9';
  let forms = {};    // id -> {getValues, setValues, onUpdate}
  const session = {}; // In-Memory: Werte gelten nur für diese Sitzung (App-Start = leere Formulare)

  function storageKey(id) { return window.JTForms.LS[id]; }

  function buildForm(id) {
    const def = window.REF[FORMATS.find(f => f.id === id).ref];
    const load = () => {
      // IMMER leer beim Start – nichts vom letzten Einsatz.
      // Während der Sitzung bleiben Werte beim Tab-Wechsel erhalten (session).
      const v = session[id] ? JSON.parse(JSON.stringify(session[id])) : {};
      const p = window.JTProfiles.getActive();
      // MEDEVAC: Frequenz/Callsign aus Profil vorbelegen, falls noch nichts eingetragen
      if (id === 'medevac' && !v.freq && p.freqMed) {
        v.freq = p.freqMed + (p.med ? ' / ' + p.med : '');
      }
      return v;
    };
    const save = (v) => { session[id] = JSON.parse(JSON.stringify(v)); };
    const onChange = (v) => renderPreview(id, v);

    forms[id] = window.JTForms.initBriefForm('brief-form', def, { load, save, onChange });
    // Überschrift
    document.getElementById('brief-form-title').textContent = def.name + '  (' + def.use + ')';
    document.getElementById('brief-hint').textContent = window.JTForms.readbackHint(def);
  }

  function renderPreview(id, values) {
    const def = window.REF[FORMATS.find(f => f.id === id).ref];
    const p = window.JTProfiles.getActive();
    let header = def.header || '';
    if (id === 'cas9' || id === 'cas5') {
      header = (p.jtac ? p.jtac + ' – ' : '') + def.header;
    }
    const text = window.JTForms.buildPreview(def, values, { header });
    const pre = document.getElementById('brief-preview');
    pre.textContent = text || pre.dataset.blank || '';
    pre.dataset.plain = text || '';
    pre.classList.toggle('blank', !text);
  }

  /** Aktives Profil → CAS-Airframe-Referenz anzeigen. */
  function renderAirframeRef() {
    const box = document.getElementById('brief-airframe');
    if (!box) return;
    const p = window.JTProfiles.getActive();
    const af = window.REF.findAirframe(p.cas);
    if (!af) {
      box.style.display = 'none';
      return;
    }
    box.style.display = 'block';
    box.innerHTML =
      `<div class="af-head"><b>${af.cs}</b> — ${af.name} <span class="af-cat">${af.cat}</span>` +
      ` <span class="af-prof">(Profil: ${p.name})</span></div>` +
      `<div class="af-row"><span>Bewaffnung</span>${af.info}</div>` +
      `<div class="af-row"><span>Features</span>${af.feat}</div>` +
      `<div class="af-row"><span>Crew</span>${af.crew}</div>` +
      `<div class="af-row"><span>Funk</span>${p.freqCas || '–'}</div>` +
      `<div class="af-row"><span>Laser</span>${p.laser || '–'}</div>`;
  }

  function renderTabs() {
    const root = document.getElementById('brief-tabs');
    root.innerHTML = '';
    FORMATS.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'tab' + (f.id === current ? ' active' : '');
      btn.textContent = f.label;
      btn.addEventListener('click', () => { current = f.id; renderTabs(); buildForm(current); });
      root.appendChild(btn);
    });
    renderAirframeRef();
  }

  function copyCurrent() {
    const pre = document.getElementById('brief-preview');
    if (pre) window.App.copy(pre.dataset.plain || pre.textContent);
  }

  /** Bestimmtes Format öffnen (z. B. über Dashboard/Sidebar). */
  function open(id) {
    if (!FORMATS.find(f => f.id === id)) id = 'cas9';
    current = id;
    renderTabs();
    buildForm(current);
    // erstes leeres Eingabefeld fokussieren → sofort losschreiben (Tastatur-Schnelligkeit)
    requestAnimationFrame(() => {
      const form = document.getElementById('brief-form');
      const input = form && form.querySelector('.field-row input:not([type=hidden])');
      if (input && !input.value) input.focus();
    });
  }

  function init() {
    renderTabs();
    buildForm(current);
    window.JTBriefs.onProfileChange = () => {
      // nur Vorschau + Airframe-Referenz aktualisieren (Formular-Werte bleiben erhalten)
      const f = forms[current];
      if (f) renderPreview(current, f.getValues());
      renderAirframeRef();
    };
  }

  window.JTBriefs = { init, open, copyCurrent, current: () => current };
})();
