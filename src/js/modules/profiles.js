// ============================================================
// JTAC Helper – Profile & Netze
//
// BELIEBIG VIELE Profile mit Callsigns, Funk, Laser,
// Karten-Voreinstellung und Notizen. Alles frei änderbar:
//   • Neu anlegen (Kopie vom Aktiven oder leer)
//   • Duplizieren, Umbenennen, Löschen
//   • Werks-Presets (GRANITE 10 / 11 / FLEX) jederzeit
//     wieder hinzufügen – eigene Profile bleiben dabei erhalten
// Speicherung: localStorage.
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

  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(KEY));
      return (Array.isArray(v) && v.length) ? v : null;
    } catch (e) { return null; }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  let profiles = load() || clone(DEFAULT_PROFILES);
  let activeId = localStorage.getItem(ACTIVE);
  if (!profiles.find(p => p.id === activeId)) activeId = profiles[0].id;

  function save() {
    localStorage.setItem(KEY, JSON.stringify(profiles));
    localStorage.setItem(ACTIVE, activeId);
  }

  function getProfiles() { return profiles; }

  function getActive() {
    return profiles.find(p => p.id === activeId) || profiles[0];
  }

  function setActive(id) {
    if (!profiles.find(p => p.id === id)) id = profiles[0].id;
    activeId = id;
    save();
  }

  function update(id, patch) {
    const p = profiles.find(x => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
    save();
  }

  /** Eindeutige ID für neue Profile. */
  function uid() {
    let id;
    do { id = 'p' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36); }
    while (profiles.find(p => p.id === id));
    return id;
  }

  /** Eindeutiger Name: "Neues Profil", "Neues Profil 2", ... */
  function uniqueName(base) {
    if (!profiles.find(p => p.name.toLowerCase() === base.toLowerCase())) return base;
    let i = 2;
    while (profiles.find(p => p.name.toLowerCase() === (base + ' ' + i).toLowerCase())) i++;
    return base + ' ' + i;
  }

  /**
   * Neues Profil anlegen.
   * baseId (optional): Werte dieses Profils als Startpunkt kopieren.
   * Ohne baseId: Kopie vom aktiven Profil. Wird sofort aktiv.
   */
  function create(baseId) {
    const src = profiles.find(p => p.id === baseId) || getActive();
    const p = Object.assign(
      { name: '', jtac: '', cas: '', med: '', freqCas: 'Ch. 2 TAD', freqMed: 'Ch. 2 TAD', laser: '1111', map: 'altis', notes: '' },
      src ? clone(src) : {},
      { id: uid() }
    );
    p.name = uniqueName(src && src.name ? 'Kopie von ' + src.name : 'Neues Profil');
    profiles.push(p);
    activeId = p.id;
    save();
    return p;
  }

  /** Leeres Profil anlegen (nichts vorbelegt außer Funk/Laser-Standard). */
  function createEmpty() {
    const p = {
      id: uid(),
      name: uniqueName('Neues Profil'),
      jtac: '', cas: '', med: '',
      freqCas: 'Ch. 2 TAD', freqMed: 'Ch. 2 TAD',
      laser: '1111', map: 'altis', notes: ''
    };
    profiles.push(p);
    activeId = p.id;
    save();
    return p;
  }

  /** Profil duplizieren (Name bekommt " (Kopie)"). */
  function duplicate(id) {
    const src = profiles.find(p => p.id === id);
    if (!src) return null;
    const p = clone(src);
    p.id = uid();
    p.name = uniqueName(src.name + ' Kopie');
    profiles.push(p);
    activeId = p.id;
    save();
    return p;
  }

  /**
   * Profil löschen. Das letzte Profil kann nicht gelöscht werden –
   * sonst hätte die App kein Profil mehr.
   * @returns {'ok'|'last'|'missing'}
   */
  function remove(id) {
    if (!profiles.find(p => p.id === id)) return 'missing';
    if (profiles.length <= 1) return 'last';
    profiles = profiles.filter(p => p.id !== id);
    if (activeId === id) activeId = profiles[0].id;
    save();
    return 'ok';
  }

  /**
   * Werks-Presets (GRANITE 10/11/FLEX) wieder hinzufügen –
   * nur fehlende, eigene Profile bleiben unangetastet.
   * @returns {number} Anzahl hinzugefügter Presets
   */
  function restorePresets() {
    let added = 0;
    DEFAULT_PROFILES.forEach(def => {
      if (!profiles.find(p => p.name.toUpperCase() === def.name.toUpperCase())) {
        const p = clone(def);
        p.id = uid();
        profiles.push(p);
        added++;
      }
    });
    if (added) save();
    return added;
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

      // Karten-Aktionen: Aktiv-Hinweis + Duplizieren + Löschen
      const actions = document.createElement('div');
      actions.className = 'profile-card-actions';

      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = p.id === activeId ? 'Aktiv' : 'Klicken zum Aktivieren';
      actions.appendChild(tag);

      const dupBtn = document.createElement('button');
      dupBtn.className = 'btn btn-ghost small';
      dupBtn.title = 'Profil duplizieren';
      dupBtn.textContent = '⧉';
      dupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const neu = duplicate(p.id);
        afterStructureChange();
        if (window.App) window.App.toast('Dupliziert: ' + (neu ? neu.name : ''));
      });
      actions.appendChild(dupBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-ghost small danger';
      delBtn.title = 'Profil löschen';
      delBtn.textContent = '🗑';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!confirm('Profil „' + p.name + '" wirklich löschen?')) return;
        const r = remove(p.id);
        if (r === 'last') {
          if (window.App) window.App.toast('Das letzte Profil kann nicht gelöscht werden.', true);
          return;
        }
        afterStructureChange();
        if (window.App) window.App.toast('Profil gelöscht.');
      });
      actions.appendChild(delBtn);

      card.appendChild(actions);

      card.addEventListener('click', () => {
        setActive(p.id);
        renderCards(containerId);
        renderEditForm();
        if (window.App && window.App.onProfileChange) window.App.onProfileChange();
      });

      root.appendChild(card);
    });

    // "+ Neues Profil"-Karte am Ende
    const add = document.createElement('button');
    add.className = 'profile-card profile-card-add';
    add.id = 'profile-add-card';
    add.innerHTML = '<span class="profile-add-ico">＋</span><span class="profile-add-txt">Neues Profil<br><small>Kopie vom aktiven</small></span>';
    add.addEventListener('click', () => {
      create();
      afterStructureChange();
      if (window.App) window.App.toast('Neues Profil angelegt – unten anpassen & speichern.');
    });
    root.appendChild(add);
  }

  /** Nach Anlegen/Duplizieren/Löschen alles sauber neu zeichnen. */
  function afterStructureChange() {
    renderCards('profile-list');
    renderEditForm();
    if (window.App && window.App.refreshAllProfiles) window.App.refreshAllProfiles();
    if (window.App && window.App.onProfileChange) window.App.onProfileChange();
  }

  /** Aktives Profil in das Bearbeitungsformular laden. */
  function renderEditForm() {
    const p = getActive();
    const head = document.getElementById('pf-edit-title');
    if (head) head.textContent = '„' + p.name + '" bearbeiten';
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

  window.JTProfiles = {
    getProfiles, getActive, setActive, update,
    create, createEmpty, duplicate, remove, restorePresets,
    renderCards, renderEditForm, readEditForm, renderAirframeHint, mapName
  };
})();
