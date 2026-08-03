// ============================================================
// JTAC Helper – Einstellungen & Daten
// Drei Bereiche:
//   1. Einstellungen – Theme, Standard-Profil, Standard-Karte
//   2. Channels     – Short/Long-Range-Kanäle (ACRE-2)
//   3. Daten        – eigene Ziele, Ordnance, Kontext, Callsigns
// Eigene Daten werden zu den Standard-Listen dazugemischt.
// ============================================================

(function () {
  'use strict';

  // ============================================================
  // JTData – eigene Listen (localStorage)
  // ============================================================
  const DKEY = { targets: 'jtac.data.targets', ordnance: 'jtac.data.ordnance', context: 'jtac.data.context', air: 'jtac.data.air' };

  function getCustom(key) {
    try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function setCustom(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }

  const JTData = {
    getTargets() { return [...new Set([...window.REF.targets, ...getCustom(DKEY.targets)])]; },
    getOrdnance() { return [...new Set([...window.REF.ordnance, ...getCustom(DKEY.ordnance)])]; },
    getContext() { return [...new Set([...window.REF.targetContext, ...getCustom(DKEY.context)])]; },
    getCustomAir() { return getCustom(DKEY.air); }, // [{cs, name, info}]
    getAirframes() {
      const base = window.REF.airframesFlat.map(a => ({ cs: a.cs, name: a.name, info: a.info }));
      return [...base, ...getCustom(DKEY.air)];
    },
    addTarget(v) { const a = getCustom(DKEY.targets); if (!a.includes(v)) { a.push(v); setCustom(DKEY.targets, a); } },
    removeTarget(v) { setCustom(DKEY.targets, getCustom(DKEY.targets).filter(x => x !== v)); },
    addOrdnance(v) { const a = getCustom(DKEY.ordnance); if (!a.includes(v)) { a.push(v); setCustom(DKEY.ordnance, a); } },
    removeOrdnance(v) { setCustom(DKEY.ordnance, getCustom(DKEY.ordnance).filter(x => x !== v)); },
    addContext(v) { const a = getCustom(DKEY.context); if (!a.includes(v)) { a.push(v); setCustom(DKEY.context, a); } },
    removeContext(v) { setCustom(DKEY.context, getCustom(DKEY.context).filter(x => x !== v)); },
    addAir(cs, name, info) { const a = getCustom(DKEY.air); a.push({ cs, name, info }); setCustom(DKEY.air, a); },
    removeAir(cs) { setCustom(DKEY.air, getCustom(DKEY.air).filter(x => x.cs !== cs)); }
  };

  // ============================================================
  // JTSettings – UI
  // ============================================================
  const SETKEY = 'jtac.settings';

  function getSettings() {
    try { return JSON.parse(localStorage.getItem(SETKEY)) || {}; }
    catch (e) { return {}; }
  }
  function setSettings(patch) {
    const s = getSettings();
    Object.assign(s, patch);
    localStorage.setItem(SETKEY, JSON.stringify(s));
  }

  let currentTab = 'general';

  function render(rootEl) {
    if (!rootEl) return;
    rootEl.innerHTML = '';

    const h1 = document.createElement('h1');
    h1.textContent = 'Einstellungen & Daten';
    rootEl.appendChild(h1);
    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Alles anpassen: Kanäle (SR/LR), eigene Ziele/Ordnance/Callsigns und allgemeine Einstellungen.';
    rootEl.appendChild(lead);

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    [['general', '⚙ Einstellungen'], ['channels', '📻 Channels (SR/LR)'], ['data', '🗄 Daten'], ['update', '🔄 Update']].forEach(([id, label]) => {
      const b = document.createElement('button');
      b.className = 'tab' + (id === currentTab ? ' active' : '');
      b.textContent = labelFor(id, label);
      b.dataset.tabId = id;
      b.addEventListener('click', () => { currentTab = id; render(rootEl); });
      tabs.appendChild(b);
    });
    rootEl.appendChild(tabs);

    const body = document.createElement('div');
    body.className = 'settings-body';
    rootEl.appendChild(body);

    if (currentTab === 'general') renderGeneral(body);
    else if (currentTab === 'channels') window.JTChannels.render(body);
    else if (currentTab === 'update') { if (window.JTUpdate) window.JTUpdate.render(body); }
    else renderData(body);
  }

  /** Tab-Beschriftung: markiert den Update-Tab, wenn was Neues da ist. */
  function labelFor(id, base) {
    if (id === 'update' && window.JTUpdate) {
      const res = window.JTUpdate.getLast();
      if (res && res.ok && res.updateAvailable) return base + ' 🟠 NEU';
    }
    return base;
  }

  /** Aktualisiert die Tab-Beschriftungen (z. B. nach einem Update-Check). */
  function refreshTabLabels() {
    document.querySelectorAll('#settings-root .tab[data-tab-id]').forEach(b => {
      const id = b.dataset.tabId;
      const base = { general: '⚙ Einstellungen', channels: '📻 Channels (SR/LR)', data: '🗄 Daten', update: '🔄 Update' }[id];
      if (base) b.textContent = labelFor(id, base);
    });
  }

  /** Öffnet einen bestimmten Einstellungs-Tab (wird z. B. vom Update-Banner genutzt). */
  function openTab(id) { currentTab = id; }

  // ---------- Allgemein ----------
  function renderGeneral(root) {
    const s = getSettings();

    const panel = document.createElement('div');
    panel.className = 'panel';
    const h2 = document.createElement('h2');
    h2.textContent = 'Allgemeine Einstellungen';
    panel.appendChild(h2);
    const form = document.createElement('div');
    form.className = 'form';

    // Theme
    const row1 = document.createElement('div');
    row1.className = 'field-row';
    const f1 = document.createElement('div');
    f1.className = 'field';
    const l1 = document.createElement('label'); l1.className = 'field-label'; l1.textContent = 'Design';
    const sel1 = document.createElement('select'); sel1.className = 'select'; sel1.id = 'set-theme';
    [['dark', 'Dunkel (militärisch)'], ['light', 'Hell']].forEach(([v, t]) => {
      const o = document.createElement('option'); o.value = v; o.textContent = t; sel1.appendChild(o);
    });
    sel1.value = document.documentElement.dataset.theme || 'dark';
    sel1.addEventListener('change', () => {
      document.documentElement.dataset.theme = sel1.value;
      localStorage.setItem('jtac.theme', sel1.value);
      setSettings({ theme: sel1.value });
    });
    f1.appendChild(l1); f1.appendChild(sel1);

    // Standard-Profil
    const f2 = document.createElement('div');
    f2.className = 'field';
    const l2 = document.createElement('label'); l2.className = 'field-label'; l2.textContent = 'Standard-Profil (beim Start)';
    const sel2 = document.createElement('select'); sel2.className = 'select'; sel2.id = 'set-profile';
    window.JTProfiles.getProfiles().forEach(p => {
      const o = document.createElement('option'); o.value = p.id; o.textContent = p.name; sel2.appendChild(o);
    });
    sel2.value = s.defaultProfile || 'p1';
    sel2.addEventListener('change', () => setSettings({ defaultProfile: sel2.value }));
    f2.appendChild(l2); f2.appendChild(sel2);

    // Standard-Karte
    const f3 = document.createElement('div');
    f3.className = 'field';
    const l3 = document.createElement('label'); l3.className = 'field-label'; l3.textContent = 'Standard-Karte (neue Missionen)';
    const sel3 = document.createElement('select'); sel3.className = 'select'; sel3.id = 'set-map';
    window.REF.maps.filter(m => m.id !== 'custom').forEach(m => {
      const o = document.createElement('option'); o.value = m.id; o.textContent = m.name; sel3.appendChild(o);
    });
    sel3.value = s.defaultMap || 'altis';
    sel3.addEventListener('change', () => setSettings({ defaultMap: sel3.value }));
    f3.appendChild(l3); f3.appendChild(sel3);

    row1.appendChild(f1); row1.appendChild(f2); row1.appendChild(f3);
    form.appendChild(row1);

    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'Standard-Laser-Code und Callsigns stellst du in deinem Profil ein (☎ Profile & Netze).';
    form.appendChild(hint);
    panel.appendChild(form);
    root.appendChild(panel);
  }

  // ---------- Daten ----------
  function renderData(root) {
    const renderList = (title, items, addPh, onAdd, onRemove, mono) => {
      const panel = document.createElement('div');
      panel.className = 'panel';
      const h2 = document.createElement('h2');
      h2.textContent = title;
      panel.appendChild(h2);

      const list = document.createElement('div');
      list.className = 'chip-list';
      items.forEach(it => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        const txt = document.createElement('span');
        txt.textContent = it;
        const del = document.createElement('button');
        del.className = 'chip-del';
        del.textContent = '✕';
        del.addEventListener('click', () => { onRemove(it); refreshAll(); });
        chip.appendChild(txt);
        chip.appendChild(del);
        list.appendChild(chip);
      });
      if (!items.length) {
        const e = document.createElement('p');
        e.className = 'hint';
        e.textContent = 'Noch nichts hinzugefügt.';
        list.appendChild(e);
      }
      panel.appendChild(list);

      const addRow = document.createElement('div');
      addRow.className = 'field-row';
      const input = document.createElement('input');
      input.className = 'input' + (mono ? ' mono' : '');
      input.placeholder = addPh;
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.textContent = '+';
      btn.addEventListener('click', () => {
        const v = input.value.trim();
        if (!v) { window.App.toast('Bitte etwas eintragen.', true); return; }
        onAdd(v);
        input.value = '';
        refreshAll();
      });
      addRow.appendChild(input);
      addRow.appendChild(btn);
      panel.appendChild(addRow);
      return panel;
    };

    const refreshAll = () => {
      render(root.parentElement.querySelector('.settings-body') || root);
      if (window.JTBriefs && window.JTBriefs.refreshDatalists) window.JTBriefs.refreshDatalists();
    };

    root.appendChild(renderList('Eigene Ziele (zusätzlich zur Standard-Liste)', getCustom(DKEY.targets), 'z. B. MT-LB (ERA)', JTData.addTarget, JTData.removeTarget, false));
    root.appendChild(renderList('Eigene Bewaffnung / Ordnance', getCustom(DKEY.ordnance), 'z. B. GAU-19 12.7mm', JTData.addOrdnance, JTData.removeOrdnance, false));
    root.appendChild(renderList('Eigene Ziel-Lage-Begriffe', getCustom(DKEY.context), 'z. B. on the rooftop', JTData.addContext, JTData.removeContext, false));

    // Eigene Callsigns (Luftfahrzeuge)
    const airPanel = document.createElement('div');
    airPanel.className = 'panel';
    const h2a = document.createElement('h2');
    h2a.textContent = 'Eigene Callsigns / Luftfahrzeuge';
    airPanel.appendChild(h2a);
    const airList = document.createElement('div');
    airList.className = 'chip-list';
    JTData.getCustomAir().forEach(a => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      const txt = document.createElement('span');
      txt.textContent = a.cs + (a.name ? ' – ' + a.name : '');
      const del = document.createElement('button');
      del.className = 'chip-del';
      del.textContent = '✕';
      del.addEventListener('click', () => { JTData.removeAir(a.cs); refreshAll(); });
      chip.appendChild(txt);
      chip.appendChild(del);
      airList.appendChild(chip);
    });
    if (!JTData.getCustomAir().length) {
      const e = document.createElement('p');
      e.className = 'hint';
      e.textContent = 'Noch keine eigenen Callsigns.';
      airList.appendChild(e);
    }
    airPanel.appendChild(airList);
    const airForm = document.createElement('div');
    airForm.className = 'field-row';
    const ai1 = document.createElement('input'); ai1.className = 'input mono'; ai1.placeholder = 'Callsign (z. B. VIPER 2-1)';
    const ai2 = document.createElement('input'); ai2.className = 'input'; ai2.placeholder = 'Name (z. B. F-16)';
    const ai3 = document.createElement('input'); ai3.className = 'input'; ai3.placeholder = 'Bewaffnung/Info (optional)';
    const ab = document.createElement('button'); ab.className = 'btn btn-primary'; ab.textContent = '+';
    ab.addEventListener('click', () => {
      const cs = ai1.value.trim();
      if (!cs) { window.App.toast('Callsign fehlt.', true); return; }
      JTData.addAir(cs, ai2.value.trim(), ai3.value.trim());
      ai1.value = ''; ai2.value = ''; ai3.value = '';
      refreshAll();
      window.JTBriefs.refreshDatalists();
      if (window.App.buildAirframeList) window.App.buildAirframeList();
      window.App.toast('Callsign hinzugefügt: ' + cs);
    });
    airForm.appendChild(ai1); airForm.appendChild(ai2); airForm.appendChild(ai3); airForm.appendChild(ab);
    airPanel.appendChild(airForm);
    root.appendChild(airPanel);
  }

  // ---------- Initialisierung ----------
  function applyDefaultProfile() {
    const s = getSettings();
    if (s.defaultProfile) {
      window.JTProfiles.setActive(s.defaultProfile);
    }
  }

  window.JTData = Object.assign({}, JTData, { getCustom, setCustom });
  window.JTSettings = { render, getSettings, setSettings, applyDefaultProfile, openTab, refreshTabLabels };
})();
