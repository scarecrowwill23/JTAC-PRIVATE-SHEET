// ============================================================
// JTAC Private Sheet – Profile & Netze
// Bis zu 3 feste Profile mit Callsigns, Frequenzen, Laser,
// Karten-Voreinstellung und Notizen. Speicherung: localStorage.
// ============================================================

(function () {
  'use strict';

  const KEY = 'jtac.profiles';
  const ACTIVE = 'jtac.activeProfile';

  const DEFAULT_PROFILES = [
    {
      id: 'p1',
      name: 'Standard JTAC',
      jtac: 'LONGBOW 1',
      cas: 'HAVOC 1-1',
      med: 'DUSTOFF 1',
      freqCas: '36.50',
      freqMed: '38.00',
      laser: '1688',
      map: 'altis',
      notes: ''
    },
    { id: 'p2', name: 'Einsatz 2', jtac: '', cas: '', med: '', freqCas: '', freqMed: '', laser: '', map: 'altis', notes: '' },
    { id: 'p3', name: 'Einsatz 3', jtac: '', cas: '', med: '', freqCas: '', freqMed: '', laser: '', map: 'altis', notes: '' }
  ];

  let profiles = load() || JSON.parse(JSON.stringify(DEFAULT_PROFILES));
  let activeId = localStorage.getItem(ACTIVE) || 'p1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)); }
    catch (e) { return null; }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(profiles));
  }

  function getProfiles() { return profiles; }

  function getActive() {
    return profiles.find(p => p.id === activeId) || profiles[0];
  }

  function setActive(id) {
    if (!profiles.find(p => p.id === id)) id = profiles[0].id;
    activeId = id;
    localStorage.setItem(ACTIVE, id);
  }

  function update(id, patch) {
    const p = profiles.find(x => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
    save();
  }

  function resetDefaults() {
    profiles = JSON.parse(JSON.stringify(DEFAULT_PROFILES));
    save();
  }

  function mapName(id) {
    const m = window.REF.maps.find(x => x.id === id);
    return m ? m.name : (id || '');
  }

  // ---------- Rendering ----------
  function renderCards(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;
    root.innerHTML = '';

    profiles.forEach(p => {
      const card = document.createElement('div');
      card.className = 'profile-card' + (p.id === activeId ? ' active' : '');
      card.dataset.id = p.id;

      const h = document.createElement('h3');
      h.textContent = p.name + (p.id === activeId ? '  ●' : '');
      card.appendChild(h);

      const fields = [
        ['JTAC', p.jtac], ['CAS', p.cas], ['MEDEVAC', p.med],
        ['Freq CAS', p.freqCas], ['Freq MED', p.freqMed], ['Laser', p.laser],
        ['Karte', mapName(p.map)]
      ];
      fields.forEach(([k, v]) => {
        const row = document.createElement('div');
        row.className = 'kv';
        const s = document.createElement('span'); s.textContent = k;
        const b = document.createElement('b'); b.textContent = v || '–';
        row.appendChild(s); row.appendChild(b);
        card.appendChild(row);
      });

      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = p.id === activeId ? 'Aktiv' : 'Klicken zum Aktivieren';
      card.appendChild(tag);

      card.addEventListener('click', () => {
        setActive(p.id);
        renderCards(containerId);
        renderEditForm();
        if (window.App && window.App.onProfileChange) window.App.onProfileChange();
      });

      root.appendChild(card);
    });
  }

  function renderNotes() {
    const ta = document.getElementById('pf-notes');
    if (!ta) return;
    ta.value = getActive().notes || '';
  }

  /** Aktives Profil in das Bearbeitungsformular laden. */
  function renderEditForm() {
    const p = getActive();
    const map = {
      'pf-name': p.name, 'pf-jtac': p.jtac, 'pf-cas': p.cas, 'pf-med': p.med,
      'pf-freqcas': p.freqCas, 'pf-freqmed': p.freqMed, 'pf-laser': p.laser,
      'pf-notes': p.notes
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = map[id] || '';
    });
    const mapSel = document.getElementById('pf-map');
    if (mapSel) {
      mapSel.innerHTML = '';
      window.REF.maps.forEach(m => {
        const o = document.createElement('option');
        o.value = m.id;
        o.textContent = m.name + (m.zone ? '  (' + m.zone + ')' : '');
        mapSel.appendChild(o);
      });
      mapSel.value = p.map || 'altis';
    }
  }

  /** Werte aus dem Bearbeitungsformular lesen. */
  function readEditForm() {
    const g = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    return {
      name: g('pf-name'),
      jtac: g('pf-jtac'),
      cas: g('pf-cas'),
      med: g('pf-med'),
      freqCas: g('pf-freqcas'),
      freqMed: g('pf-freqmed'),
      laser: g('pf-laser'),
      map: g('pf-map') || 'altis',
      notes: g('pf-notes')
    };
  }

  window.JTProfiles = { getProfiles, getActive, setActive, update, resetDefaults, renderCards, renderNotes, renderEditForm, readEditForm, mapName };
})();
