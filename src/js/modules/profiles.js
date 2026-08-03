// ============================================================
// JTAC Private Sheet – Profile & Netze
// Bis zu 3 feste Profile mit Callsigns, Frequenzen, Laser,
// Karten-Voreinstellung und Notizen. Speicherung: localStorage.
//
// Voreingestellte Presets (CGF 160th SOAR):
//   GRANITE 10  – Standard JTAC
//   GRANITE 11  – Zweit-JTAC
//   FLEX        – frei (andere Callsigns)
// Funk: Channel 2 TAD (CAS + MEDEVAC) · Laser-Code: 1111
// ============================================================

(function () {
  'use strict';

  const KEY = 'jtac.profiles';
  const ACTIVE = 'jtac.activeProfile';

  const DEFAULT_PROFILES = [
    {
      id: 'p1',
      name: 'GRANITE 10',
      jtac: 'GRANITE 10',
      cas: 'ARCHER 3-X',
      med: 'SPIRIT 7-X',
      freqCas: 'Ch. 2 TAD',
      freqMed: 'Ch. 2 TAD',
      laser: '1111',
      map: 'altis',
      notes: 'Standard-JTAC (160th SOAR). Funk: Channel 2 TAD.'
    },
    {
      id: 'p2',
      name: 'GRANITE 11',
      jtac: 'GRANITE 11',
      cas: 'LANCER 4-X',
      med: 'SPIRIT 7-X',
      freqCas: 'Ch. 2 TAD',
      freqMed: 'Ch. 2 TAD',
      laser: '1111',
      map: 'altis',
      notes: 'Zweit-JTAC (160th SOAR). Funk: Channel 2 TAD.'
    },
    {
      id: 'p3',
      name: 'FLEX',
      jtac: '',
      cas: '',
      med: '',
      freqCas: 'Ch. 2 TAD',
      freqMed: 'Ch. 2 TAD',
      laser: '1111',
      map: 'altis',
      notes: 'Frei belegbar – für andere Callsigns.'
    }
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
        ['Funk', p.freqCas], ['Laser', p.laser],
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
    renderAirframeHint();
  }

  /** Airframe-Infos zum CAS-Callsign anzeigen (falls einer unserer Maschinen). */
  function renderAirframeHint() {
    const box = document.getElementById('pf-airframe');
    if (!box) return;
    const cs = document.getElementById('pf-cas').value.trim();
    const af = window.REF.findAirframe(cs);
    if (!af) {
      box.innerHTML = '';
      box.style.display = 'none';
      return;
    }
    box.style.display = 'block';
    box.innerHTML =
      `<div class="af-head"><b>${af.cs}</b> — ${af.name} <span class="af-cat">${af.cat}</span></div>` +
      `<div class="af-row"><span>Bewaffnung</span>${af.info}</div>` +
      `<div class="af-row"><span>Features</span>${af.feat}</div>` +
      `<div class="af-row"><span>Crew</span>${af.crew}</div>`;
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

  window.JTProfiles = { getProfiles, getActive, setActive, update, resetDefaults, renderCards, renderEditForm, readEditForm, renderAirframeHint, mapName };
})();
