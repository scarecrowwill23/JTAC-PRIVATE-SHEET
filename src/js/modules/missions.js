// ============================================================
// JTAC Helper – Missionen & Historie
// Jede Mission wird extra angelegt (Name + Karte) und sammelt:
// Funkspruch-Log, BDA, Koordinaten-Favoriten, Checkliste, Standort.
// Speicherung: localStorage. Export/Import als JSON.
// ============================================================

(function () {
  'use strict';

  const KEY = 'jtac.missions';
  const ACTIVE = 'jtac.activeMission';

  let missions = load();
  let activeId = localStorage.getItem(ACTIVE) || null;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(missions)); }

  function uid() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  // ---------- Basis ----------
  function getMissions() { return missions; }
  function getActive() { return missions.find(m => m.id === activeId) || null; }

  function create(name, map) {
    const m = {
      id: uid(),
      name: name || ('Mission ' + (missions.length + 1)),
      map: map || 'altis',
      createdAt: Date.now(),
      scripts: [],
      bda: [],
      favs: [],
      checklist: {},
      myPos: ''
    };
    missions.push(m);
    activeId = m.id;
    localStorage.setItem(ACTIVE, activeId);
    save();
    return m;
  }

  function setActive(id) {
    if (missions.find(m => m.id === id)) {
      activeId = id;
      localStorage.setItem(ACTIVE, id);
    }
  }

  function remove(id) {
    missions = missions.filter(m => m.id !== id);
    if (activeId === id) activeId = null;
    save();
  }

  function update(id, patch) {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    Object.assign(m, patch);
    save();
  }

  // ---------- Inhalte ----------
  function addScript(type, text) {
    const m = getActive();
    if (!m) return null;
    const entry = { ts: Date.now(), type, text };
    m.scripts.push(entry);
    save();
    return entry;
  }

  function addBDA(target, grid, result) {
    const m = getActive();
    if (!m) return null;
    const entry = { ts: Date.now(), target, grid, result };
    m.bda.push(entry);
    save();
    return entry;
  }

  function addFav(name, grid) {
    const m = getActive();
    if (!m) return null;
    const f = { id: uid(), name: name || 'Punkt', grid: grid || '' };
    m.favs.push(f);
    save();
    return f;
  }
  function removeFav(fid) {
    const m = getActive();
    if (!m) return;
    m.favs = m.favs.filter(f => f.id !== fid);
    save();
  }

  function setCheck(key, val) {
    const m = getActive();
    if (!m) return;
    m.checklist[key] = !!val;
    save();
  }
  function getCheck(key) {
    const m = getActive();
    return m ? !!m.checklist[key] : false;
  }

  function setMyPos(grid) {
    const m = getActive();
    if (!m) return;
    m.myPos = grid || '';
    save();
  }

  // ---------- Export / Import ----------
  function exportActive() {
    const m = getActive();
    if (!m) return null;
    return JSON.stringify(m, null, 2);
  }

  function importJSON(text) {
    try {
      const m = JSON.parse(text);
      if (!m || !m.name) throw new Error('keine Mission');
      // neu einfügen mit frischer ID
      m.id = uid();
      m.createdAt = Date.now();
      missions.push(m);
      activeId = m.id;
      localStorage.setItem(ACTIVE, activeId);
      save();
      return m;
    } catch (e) {
      return null;
    }
  }

  // ---------- UI ----------
  function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function render() {
    const root = document.getElementById('mission-root');
    if (!root) return;

    const active = getActive();
    if (!active) { renderNoMission(root); return; }
    renderActive(root, active);
  }

  function renderNoMission(root) {
    root.innerHTML = '';
    const h = document.createElement('h1');
    h.textContent = 'Missionen';
    root.appendChild(h);
    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Lege eine Mission an (Name + Karte) – sie sammelt dann automatisch alle deine Funksprüche, BDAs und Favoriten.';
    root.appendChild(lead);

    // Neues Formular
    const panel = document.createElement('div');
    panel.className = 'panel';
    const h2 = document.createElement('h2');
    h2.textContent = 'Neue Mission';
    panel.appendChild(h2);

    const form = document.createElement('div');
    form.className = 'form';
    const row1 = document.createElement('div');
    row1.className = 'field-row';
    const f1 = document.createElement('div');
    f1.className = 'field grow';
    const l1 = document.createElement('label');
    l1.className = 'field-label';
    l1.textContent = 'Name';
    const i1 = document.createElement('input');
    i1.className = 'input';
    i1.id = 'mission-new-name';
    i1.placeholder = 'z. B. Op. Iron Wrath';
    f1.appendChild(l1); f1.appendChild(i1);
    const f2 = document.createElement('div');
    f2.className = 'field';
    const l2 = document.createElement('label');
    l2.className = 'field-label';
    l2.textContent = 'Karte';
    const s2 = document.createElement('select');
    s2.className = 'select';
    s2.id = 'mission-new-map';
    window.REF.maps.filter(m => m.id !== 'custom').forEach(m => {
      const o = document.createElement('option');
      o.value = m.id; o.textContent = m.name;
      s2.appendChild(o);
    });
    s2.value = (window.JTProfiles.getActive().map) || 'altis';
    f2.appendChild(l2); f2.appendChild(s2);
    row1.appendChild(f1); row1.appendChild(f2);
    form.appendChild(row1);

    const btnRow = document.createElement('div');
    btnRow.className = 'field-row';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'Mission starten';
    btn.addEventListener('click', () => {
      const name = document.getElementById('mission-new-name').value.trim();
      const map = document.getElementById('mission-new-map').value;
      create(name, map);
      render();
      if (window.App && window.App.onMissionChange) window.App.onMissionChange();
    });
    btnRow.appendChild(btn);
    form.appendChild(btnRow);
    panel.appendChild(form);
    root.appendChild(panel);

    // Bestehende Missionen
    if (missions.length) {
      const h3 = document.createElement('h2');
      h3.className = 'dash-h2';
      h3.textContent = 'Bestehende Missionen';
      root.appendChild(h3);
      const list = document.createElement('div');
      list.className = 'profile-grid';
      missions.forEach(m => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        const hh = document.createElement('h3');
        hh.textContent = m.name;
        card.appendChild(hh);
        const kv = document.createElement('div');
        kv.className = 'kv';
        kv.innerHTML = `<span>Karte</span><b>${window.JTProfiles.mapName(m.map)}</b>`;
        card.appendChild(kv);
        const kv2 = document.createElement('div');
        kv2.className = 'kv';
        kv2.innerHTML = `<span>Funksprüche</span><b>${m.scripts.length}</b>`;
        card.appendChild(kv2);
        const kv3 = document.createElement('div');
        kv3.className = 'kv';
        kv3.innerHTML = `<span>BDA</span><b>${m.bda.length}</b>`;
        card.appendChild(kv3);
        const kv4 = document.createElement('div');
        kv4.className = 'kv';
        kv4.innerHTML = `<span>Erstellt</span><b>${new Date(m.createdAt).toLocaleDateString('de-DE')}</b>`;
        card.appendChild(kv4);

        const actions = document.createElement('div');
        actions.className = 'field-row';
        actions.style.marginTop = '10px';
        const open = document.createElement('button');
        open.className = 'btn btn-primary';
        open.textContent = 'Öffnen';
        open.addEventListener('click', () => { setActive(m.id); render(); if (window.App && window.App.onMissionChange) window.App.onMissionChange(); });
        const del = document.createElement('button');
        del.className = 'btn btn-ghost';
        del.textContent = 'Löschen';
        del.addEventListener('click', () => { if (confirm('Mission "' + m.name + '" wirklich löschen?')) { remove(m.id); render(); } });
        actions.appendChild(open);
        actions.appendChild(del);
        card.appendChild(actions);
        list.appendChild(card);
      });
      root.appendChild(list);
    }
  }

  function renderActive(root, m) {
    root.innerHTML = '';

    // Kopf
    const head = document.createElement('div');
    head.className = 'view-head';
    const hdiv = document.createElement('div');
    const h = document.createElement('h1');
    h.textContent = '📋 ' + m.name;
    hdiv.appendChild(h);
    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = `Karte: ${window.JTProfiles.mapName(m.map)} · Erstellt: ${new Date(m.createdAt).toLocaleString('de-DE')} · Funksprüche: ${m.scripts.length}`;
    hdiv.appendChild(lead);
    head.appendChild(hdiv);

    const actions = document.createElement('div');
    actions.className = 'field-row';
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn';
    exportBtn.textContent = '⬇ Export (JSON)';
    exportBtn.title = 'Mission als Datei sichern';
    exportBtn.addEventListener('click', exportFile);
    const importBtn = document.createElement('button');
    importBtn.className = 'btn';
    importBtn.textContent = '⬆ Import';
    importBtn.addEventListener('click', () => document.getElementById('mission-import-file').click());
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-ghost';
    closeBtn.textContent = 'Beenden';
    closeBtn.addEventListener('click', () => {
      if (confirm('Mission beenden? Sie bleibt gespeichert.')) { setActive(null); render(); if (window.App && window.App.onMissionChange) window.App.onMissionChange(); }
    });
    actions.appendChild(exportBtn);
    actions.appendChild(importBtn);
    actions.appendChild(closeBtn);
    head.appendChild(actions);
    root.appendChild(head);

    // versteckter File-Input für Import
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'mission-import-file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => {
      const f = fileInput.files && fileInput.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        const imported = importJSON(String(reader.result));
        if (imported) { window.App.toast('Mission importiert: ' + imported.name); render(); if (window.App && window.App.onMissionChange) window.App.onMissionChange(); }
        else window.App.toast('Import fehlgeschlagen – ungültige Datei.', true);
      };
      reader.readAsText(f);
      fileInput.value = '';
    });
    root.appendChild(fileInput);

    const grid = document.createElement('div');
    grid.className = 'mission-grid';

    // --- Log (Funksprüche) ---
    const logPanel = document.createElement('div');
    logPanel.className = 'panel mission-panel';
    const logH = document.createElement('h2');
    logH.textContent = 'Funkspruch-Log';
    logPanel.appendChild(logH);
    const logBox = document.createElement('div');
    logBox.className = 'log-box';
    if (!m.scripts.length) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'Noch keine Funksprüche gesendet. In den Briefs auf „📤 Senden & ins Log" klicken.';
      logBox.appendChild(empty);
    }
    [...m.scripts].reverse().forEach(s => {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      const head2 = document.createElement('div');
      head2.className = 'log-head';
      const t = document.createElement('b');
      t.textContent = s.type;
      const time = document.createElement('span');
      time.textContent = fmtTime(s.ts);
      head2.appendChild(t); head2.appendChild(time);
      const body = document.createElement('pre');
      body.className = 'log-text';
      body.textContent = s.text;
      const copy = document.createElement('button');
      copy.className = 'btn btn-ghost small';
      copy.textContent = '⧉ kopieren';
      copy.addEventListener('click', () => window.App.copy(s.text));
      entry.appendChild(head2);
      entry.appendChild(body);
      entry.appendChild(copy);
      logBox.appendChild(entry);
    });
    logPanel.appendChild(logBox);
    grid.appendChild(logPanel);

    // --- BDA ---
    const bdaPanel = document.createElement('div');
    bdaPanel.className = 'panel mission-panel';
    const bdaH = document.createElement('h2');
    bdaH.textContent = 'BDA eintragen';
    bdaPanel.appendChild(bdaH);
    const bdaForm = document.createElement('div');
    bdaForm.className = 'form';
    const bf1 = document.createElement('div');
    bf1.className = 'field';
    const bl1 = document.createElement('label');
    bl1.className = 'field-label';
    bl1.textContent = 'Ziel';
    const bi1 = document.createElement('input');
    bi1.className = 'input';
    bi1.id = 'bda-target';
    bi1.placeholder = 'z. B. BTR-42A, Gruppe 3';
    bf1.appendChild(bl1); bf1.appendChild(bi1);
    const bf2 = document.createElement('div');
    bf2.className = 'field';
    const bl2 = document.createElement('label');
    bl2.className = 'field-label';
    bl2.textContent = 'Grid (optional)';
    const bi2 = document.createElement('input');
    bi2.className = 'input mono';
    bi2.id = 'bda-grid';
    bi2.placeholder = 'z. B. 0453 0976';
    bf2.appendChild(bl2); bf2.appendChild(bi2);
    const bf3 = document.createElement('div');
    bf3.className = 'field';
    const bl3 = document.createElement('label');
    bl3.className = 'field-label';
    bl3.textContent = 'Ergebnis';
    const bi3 = document.createElement('input');
    bi3.className = 'input';
    bi3.id = 'bda-result';
    bi3.placeholder = 'z. B. zerstört / 50% / kein Effekt';
    bf3.appendChild(bl3); bf3.appendChild(bi3);
    const bb = document.createElement('button');
    bb.className = 'btn btn-primary';
    bb.textContent = '+ BDA speichern';
    bb.addEventListener('click', () => {
      const t = document.getElementById('bda-target').value.trim();
      const g = document.getElementById('bda-grid').value.trim();
      const r = document.getElementById('bda-result').value.trim();
      if (!t && !r) { window.App.toast('Bitte Ziel oder Ergebnis angeben.', true); return; }
      addBDA(t, g, r);
      window.App.toast('BDA gespeichert.');
      render();
    });
    bdaForm.appendChild(bf1); bdaForm.appendChild(bf2); bdaForm.appendChild(bf3); bdaForm.appendChild(bb);
    bdaPanel.appendChild(bdaForm);

    const bdaList = document.createElement('div');
    bdaList.className = 'bda-list';
    if (!m.bda.length) {
      const e = document.createElement('p');
      e.className = 'hint';
      e.textContent = 'Noch keine BDA-Einträge.';
      bdaList.appendChild(e);
    }
    [...m.bda].reverse().forEach(b => {
      const row = document.createElement('div');
      row.className = 'bda-entry';
      row.innerHTML = `<b>${b.target || '—'}</b> <span>${fmtTime(b.ts)}</span><div>${b.result || ''}${b.grid ? ' · ' + b.grid : ''}</div>`;
      bdaList.appendChild(row);
    });
    bdaPanel.appendChild(bdaList);
    grid.appendChild(bdaPanel);

    // --- Favoriten & Standort ---
    const favPanel = document.createElement('div');
    favPanel.className = 'panel mission-panel';
    const favH = document.createElement('h2');
    favH.textContent = 'Koordinaten-Favoriten';
    favPanel.appendChild(favH);
    const favForm = document.createElement('div');
    favForm.className = 'form';
    const ff1 = document.createElement('div');
    ff1.className = 'field-row';
    const fn = document.createElement('div');
    fn.className = 'field grow';
    const fnl = document.createElement('label');
    fnl.className = 'field-label';
    fnl.textContent = 'Name';
    const fni = document.createElement('input');
    fni.className = 'input';
    fni.id = 'fav-name';
    fni.placeholder = 'z. B. HLZ Nord';
    fn.appendChild(fnl); fn.appendChild(fni);
    const fg = document.createElement('div');
    fg.className = 'field grow';
    const fgl = document.createElement('label');
    fgl.className = 'field-label';
    fgl.textContent = 'Grid';
    const fgi = document.createElement('input');
    fgi.className = 'input mono';
    fgi.id = 'fav-grid';
    fgi.placeholder = 'z. B. 0453 0976';
    fg.appendChild(fgl); fg.appendChild(fgi);
    ff1.appendChild(fn); ff1.appendChild(fg);
    const fb = document.createElement('button');
    fb.className = 'btn btn-primary';
    fb.textContent = '+ Hinzufügen';
    fb.addEventListener('click', () => {
      const n = document.getElementById('fav-name').value.trim();
      const g = document.getElementById('fav-grid').value.trim();
      if (!g) { window.App.toast('Grid fehlt.', true); return; }
      addFav(n, g);
      window.App.toast('Favorit gespeichert.');
      render();
    });
    favForm.appendChild(ff1);
    favForm.appendChild(fb);
    favPanel.appendChild(favForm);

    const favList = document.createElement('div');
    favList.className = 'fav-list';
    if (!m.favs.length) {
      const e = document.createElement('p');
      e.className = 'hint';
      e.textContent = 'Keine Favoriten. Speichere bekannte Punkte (HLZ, IP, OP …).';
      favList.appendChild(e);
    }
    m.favs.forEach(f => {
      const row = document.createElement('div');
      row.className = 'fav-entry';
      const info = document.createElement('div');
      info.innerHTML = `<b>${f.name}</b> <span class="mono">${f.grid}</span>`;
      const acts = document.createElement('div');
      acts.className = 'field-row';
      const use = document.createElement('button');
      use.className = 'btn small';
      use.textContent = '→ in Brief';
      use.title = 'Grid in den aktuellen Brief übernehmen';
      use.addEventListener('click', () => {
        if (window.JTBriefs && window.JTBriefs.applyGrid) window.JTBriefs.applyGrid(f.grid);
        window.location.hash = '#/briefs';
      });
      const del = document.createElement('button');
      del.className = 'btn btn-ghost small';
      del.textContent = '✕';
      del.addEventListener('click', () => { removeFav(f.id); render(); });
      acts.appendChild(use);
      acts.appendChild(del);
      row.appendChild(info);
      row.appendChild(acts);
      favList.appendChild(row);
    });
    favPanel.appendChild(favList);

    // Standort
    const posPanel = document.createElement('div');
    posPanel.className = 'panel';
    const posH = document.createElement('h2');
    posH.textContent = 'Mein Standort („Ich bin hier")';
    posPanel.appendChild(posH);
    const posForm = document.createElement('div');
    posForm.className = 'form';
    const pf = document.createElement('div');
    pf.className = 'field-row';
    const pfi = document.createElement('div');
    pfi.className = 'field grow';
    const pfl = document.createElement('label');
    pfl.className = 'field-label';
    pfl.textContent = 'Dein aktuelles Grid';
    const pinput = document.createElement('input');
    pinput.className = 'input mono';
    pinput.id = 'my-pos';
    pinput.placeholder = 'z. B. 0453 0976';
    pinput.value = m.myPos || '';
    pfi.appendChild(pfl); pfi.appendChild(pinput);
    pf.appendChild(pfi);
    const psave = document.createElement('button');
    psave.className = 'btn btn-primary';
    psave.textContent = 'Speichern';
    psave.addEventListener('click', () => {
      setMyPos(document.getElementById('my-pos').value.trim());
      window.App.toast('Standort gespeichert.');
      render();
    });
    pf.appendChild(psave);
    posForm.appendChild(pf);

    const calcBox = document.createElement('div');
    calcBox.className = 'result-box';
    if (!m.myPos) {
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = 'Trage dein Grid ein, dann rechnet die App Distanz & Peilung zu allen Favoriten.';
      calcBox.appendChild(hint);
    } else {
      m.favs.forEach(f => {
        const r = window.GridCalc.compute(m.myPos, f.grid, window.REF.maps.find(x => x.id === m.map) || window.REF.maps[0]);
        if (r.error) return;
        const row = document.createElement('div');
        row.className = 'result-row';
        const name = document.createElement('span');
        name.textContent = '→ ' + f.name;
        const val = document.createElement('b');
        val.textContent = window.GridCalc.fmt(r.distM) + ' m · ' + r.bearingMil + ' mil';
        row.appendChild(name);
        row.appendChild(val);
        calcBox.appendChild(row);
      });
      const hint = document.createElement('div');
      hint.className = 'hint';
      hint.textContent = 'Distanz & Peilung von deinem Standort zu den Favoriten (Grid-Mil).';
      calcBox.appendChild(hint);
    }
    posPanel.appendChild(posForm);
    posPanel.appendChild(calcBox);

    // --- Checkliste ---
    const chkPanel = document.createElement('div');
    chkPanel.className = 'panel mission-panel';
    const chkH = document.createElement('h2');
    chkH.textContent = 'Pre-Mission-Checkliste';
    chkPanel.appendChild(chkH);
    const chkList = document.createElement('div');
    chkList.className = 'checklist';
    window.REF.checklist.forEach(item => {
      const li = document.createElement('label');
      li.className = 'check-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!m.checklist[item.key];
      cb.addEventListener('change', () => { setCheck(item.key, cb.checked); render(); });
      const span = document.createElement('span');
      span.textContent = item.label;
      li.appendChild(cb);
      li.appendChild(span);
      chkList.appendChild(li);
    });
    chkPanel.appendChild(chkList);
    grid.appendChild(chkPanel);

    // Panels anordnen: Log + BDA nebeneinander, Favoriten + Standort nebeneinander, Checkliste unten
    const rowA = document.createElement('div');
    rowA.className = 'grid-2';
    rowA.appendChild(logPanel);
    rowA.appendChild(bdaPanel);
    const rowB = document.createElement('div');
    rowB.className = 'grid-2';
    rowB.appendChild(favPanel);
    rowB.appendChild(posPanel);
    root.appendChild(rowA);
    root.appendChild(rowB);
    root.appendChild(chkPanel);
  }

  function exportFile() {
    const m = getActive();
    if (!m) return;
    const json = exportActive();
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (m.name || 'mission').replace(/[^a-z0-9-_ ]/gi, '_') + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
      window.App.toast('Mission exportiert.');
    } catch (e) {
      window.App.copy(json);
      window.App.toast('Export als Text kopiert (Datei nicht möglich).');
    }
  }

  window.JTMissions = {
    getMissions, getActive, create, setActive, remove, update,
    addScript, addBDA, addFav, removeFav, setCheck, getCheck, setMyPos,
    exportActive, importJSON, render
  };
})();
