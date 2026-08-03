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
  let forms = {};   // id -> {getValues, setValues, onUpdate}

  function storageKey(id) { return window.JTForms.LS[id]; }

  function buildForm(id) {
    const def = window.REF[FORMATS.find(f => f.id === id).ref];
    const load = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey(id)) || '{}');
        const p = window.JTProfiles.getActive();
        // MEDEVAC: Frequenz/Callsign aus Profil vorbelegen
        if (id === 'medevac' && !stored.freq && p.freqMed) {
          stored.freq = p.freqMed + (p.med ? ' / ' + p.med : '');
        }
        return stored;
      } catch (e) { return {}; }
    };
    const save = (v) => localStorage.setItem(storageKey(id), JSON.stringify(v));
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
    if (id === 'cas9') header = `${p.jtac || 'JTAC'} – ${def.header}`;
    if (id === 'cas5') header = `${p.jtac || 'JTAC'} – ${def.header}`;
    const text = window.JTForms.buildPreview(def, values, { header });
    const pre = document.getElementById('brief-preview');
    pre.textContent = text || pre.dataset.blank || '';
    pre.dataset.plain = text || '';
    pre.classList.toggle('blank', !text);
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
  }

  function copyCurrent() {
    const pre = document.getElementById('brief-preview');
    if (pre) window.App.copy(pre.dataset.plain || pre.textContent);
  }

  function init() {
    renderTabs();
    buildForm(current);
    window.JTBriefs.onProfileChange = () => {
      // nur Vorschau aktualisieren (Formular-Werte bleiben erhalten)
      const f = forms[current];
      if (f) renderPreview(current, f.getValues());
    };
  }

  window.JTBriefs = { init, copyCurrent, current: () => current };
})();
