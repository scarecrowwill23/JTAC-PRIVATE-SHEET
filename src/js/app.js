// ============================================================
// JTAC Helper – App-Steuerung
// Router, Theme, Toast, Kopieren, Suche, Sidebar-Pins, Verdrahtung
// ============================================================

(function () {
  'use strict';

  const App = {};

  // ---------- Toast ----------
  App.toast = function (msg, isError) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.borderColor = isError ? 'var(--danger)' : 'var(--accent)';
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2200);
  };

  // ---------- Kopieren ----------
  App.copy = async function (text) {
    if (!text) { App.toast('Nichts zu kopieren – erst ausfüllen.', true); return; }
    let ok = false;
    try {
      if (window.jtacAPI && window.jtacAPI.copyText) {
        ok = await window.jtacAPI.copyText(text);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch (e) { ok = false; }
    if (ok) App.toast('⧉ In die Zwischenablage kopiert.');
    else App.toast('Kopieren fehlgeschlagen.', true);
  };

  // ---------- Theme ----------
  function initTheme() {
    const saved = localStorage.getItem('jtac.theme') || 'dark';
    document.documentElement.dataset.theme = saved;
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('jtac.theme', next);
      App.toast(next === 'dark' ? 'Dunkelmodus' : 'Hellmodus');
    });
  }

  // ---------- Router ----------
  const routes = ['home', 'mission', 'casflow', 'briefs', 'briefing', 'grid', 'timer', 'profile', 'refs', 'settings'];

  /** Brief öffnen – je nach Gruppe (Haupt oder Briefing Area). */
  function openBrief(tab) {
    if (window.REF.briefFormatsMain.some(f => f.id === tab)) {
      window.JTBriefs.open(tab);
      location.hash = '#/briefs';
    } else if (window.REF.briefFormatsExtra.some(f => f.id === tab)) {
      window.JTExtraBriefs.open(tab);
      location.hash = '#/briefing';
    }
  }

  /** Mission-Feld auf der Startseite: groß + (bei aktiver Mission) Details. */
  function renderMissionBox() {
    const mbox = document.getElementById('dash-mission-box');
    if (!mbox) return;
    const m = window.JTMissions.getActive();
    const p = window.JTProfiles.getActive();

    if (!m) {
      // Große "Mission anlegen"-Box
      mbox.innerHTML = `
        <p class="lead" style="margin-bottom:12px">Noch keine Mission aktiv. Lege eine an – dann sammelt die App alle Funksprüche, BDA & Favoriten.</p>
        <div class="form">
          <div class="field-row">
            <div class="field grow">
              <label class="field-label">Name</label>
              <input id="home-new-name" class="input" placeholder="z. B. Op. Iron Wrath">
            </div>
            <div class="field">
              <label class="field-label">Karte</label>
              <select id="home-new-map" class="select"></select>
            </div>
            <div class="field">
              <label class="field-label">Campaign (optional)</label>
              <input id="home-new-campaign" class="input" placeholder="z. B. Iron Wrath" list="home-campaign-list">
            </div>
            <div class="field">
              <label class="field-label">Typ</label>
              <select id="home-new-type" class="select"></select>
            </div>
          </div>
          <div class="field-row">
            <button id="home-start" class="btn btn-primary big">🚀 Mission starten</button>
          </div>
        </div>`;
      const mapSel = document.getElementById('home-new-map');
      const setMap = window.JTSettings.getSettings().defaultMap || 'altis';
      window.REF.maps.filter(x => x.id !== 'custom').forEach(x => {
        const o = document.createElement('option');
        o.value = x.id; o.textContent = x.name;
        mapSel.appendChild(o);
      });
      mapSel.value = setMap;

      const typeSel = document.getElementById('home-new-type');
      window.REF.missionTypes.forEach(t => {
        const o = document.createElement('option');
        o.value = t.id; o.textContent = t.label;
        typeSel.appendChild(o);
      });

      const dl = document.createElement('datalist');
      dl.id = 'home-campaign-list';
      window.JTMissions.getCampaigns().forEach(c => {
        const o = document.createElement('option'); o.value = c; dl.appendChild(o);
      });
      mbox.appendChild(dl);

      document.getElementById('home-start').addEventListener('click', () => {
        const name = document.getElementById('home-new-name').value.trim();
        const map = document.getElementById('home-new-map').value;
        const campaign = document.getElementById('home-new-campaign').value.trim();
        const type = document.getElementById('home-new-type').value;
        window.JTMissions.create(name, map, campaign, type);
        App.toast('Mission gestartet: ' + window.JTMissions.getActive().name);
        onMissionChange();
        location.hash = '#/mission';
      });
      return;
    }

    // Aktive Mission groß anzeigen (mit Typ-Badge)
    const tInfo = window.JTMissions.typeInfo ? window.JTMissions.typeInfo(m.type) : window.REF.missionTypes[0];
    mbox.innerHTML = `
      <div class="dash-mission-big">
        <div class="dash-mission-title">${m.name} <span class="mission-badge" style="background:${tInfo.color}">${tInfo.badge}</span>${m.campaign ? '  <span class="chip">' + m.campaign + '</span>' : ''}</div>
        <div class="dash-mission-grid">
          <div class="kv"><span>Karte</span><b>${window.JTProfiles.mapName(m.map)}</b></div>
          <div class="kv"><span>Funksprüche</span><b>${m.scripts.length}</b></div>
          <div class="kv"><span>BDA</span><b>${m.bda.length}</b></div>
          <div class="kv"><span>Favoriten</span><b>${m.favs.length}</b></div>
          <div class="kv"><span>Profil</span><b>${p.name}</b></div>
          <div class="kv"><span>Funk</span><b>${p.freqCas || '–'}</b></div>
          <div class="kv"><span>JTAC</span><b>${p.jtac || '–'}</b></div>
          <div class="kv"><span>Laser</span><b>${p.laser || '–'}</b></div>
        </div>
        <div class="field-row" style="margin-top:12px">
          <button id="home-open-mission" class="btn btn-primary">📋 Zur Mission</button>
          <button id="home-end-mission" class="btn btn-ghost">Mission beenden</button>
        </div>
      </div>`;
    document.getElementById('home-open-mission').addEventListener('click', () => { location.hash = '#/mission'; });
    document.getElementById('home-end-mission').addEventListener('click', () => {
      if (confirm('Mission "' + m.name + '" beenden? Sie bleibt gespeichert.')) {
        window.JTMissions.setActive(null);
        onMissionChange();
      }
    });
  }

  /** History-Panel auf der Startseite (letzte Missionen). */
  function renderHistoryBox() {
    const box = document.getElementById('dash-history-box');
    if (!box) return;
    const missions = window.JTMissions.getMissions();
    if (!missions.length) {
      box.innerHTML = '<p class="hint">Noch keine Missionen – die History füllt sich nach deinen Einsätzen.</p>';
      return;
    }
    const recent = [...missions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    box.innerHTML = '';
    recent.forEach(m => {
      const row = document.createElement('button');
      row.className = 'history-row';
      const tInfo = window.JTMissions.typeInfo(m.type);
      row.innerHTML = `<b>${m.name} <span class="mission-badge" style="background:${tInfo.color}">${tInfo.badge}</span></b><span>${new Date(m.createdAt).toLocaleDateString('de-DE')} · ${m.scripts.length} Spruch · ${m.bda.length} BDA${m.campaign ? ' · ' + m.campaign : ''}</span>`;
      row.addEventListener('click', () => {
        window.JTMissions.setActive(m.id);
        onMissionChange();
        location.hash = '#/mission';
      });
      box.appendChild(row);
    });
    const link = document.createElement('button');
    link.className = 'btn btn-ghost small';
    link.style.marginTop = '8px';
    link.textContent = 'Alle Missionen →';
    link.addEventListener('click', () => { location.hash = '#/mission'; });
    box.appendChild(link);
  }

  function renderDashboard() {
    renderMissionBox();
    renderHistoryBox();
  }

  /** Sidebar-Pins: Favoriten-Punkte der aktiven Mission + Schnellzugriff. */
  function renderPins() {
    const root = document.getElementById('nav-pins');
    if (!root) return;
    root.innerHTML = '';
    const m = window.JTMissions.getActive();
    if (!m) return;
    if (!m.favs.length) {
      const hint = document.createElement('div');
      hint.className = 'pin-hint';
      hint.textContent = 'Pins: Mission-Favoriten erscheinen hier.';
      root.appendChild(hint);
      return;
    }
    const head = document.createElement('div');
    head.className = 'pin-head';
    head.textContent = 'Favoriten';
    root.appendChild(head);
    m.favs.forEach(f => {
      const btn = document.createElement('button');
      btn.className = 'pin-btn';
      btn.textContent = f.name;
      btn.title = f.grid + ' → in Brief übernehmen';
      btn.addEventListener('click', () => {
        if (window.JTBriefs && window.JTBriefs.applyGrid) window.JTBriefs.applyGrid(f.grid);
        location.hash = '#/briefs';
      });
      root.appendChild(btn);
    });
  }

  // ---------- Globale Suche ----------
  function initSearch() {
    const input = document.getElementById('global-search');
    const box = document.getElementById('search-results');
    if (!input || !box) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      box.innerHTML = '';
      if (q.length < 2) { box.style.display = 'none'; return; }

      const results = [];
      // Brevity
      window.REF.brevity
        .filter(b => b.code.toLowerCase().includes(q) || b.text.toLowerCase().includes(q))
        .slice(0, 5)
        .forEach(b => results.push({ type: 'Brevity', label: b.code, sub: b.text, action: () => { window.location.hash = '#/refs'; setTimeout(() => { const el = document.getElementById('refs-tabs'); if (el) [...el.children].find(t => t.textContent === 'Brevity')?.click(); }, 100); } }));
      // Ziele
      window.REF.targets
        .filter(t => t.toLowerCase().includes(q))
        .slice(0, 4)
        .forEach(t => results.push({ type: 'Ziel', label: t, sub: 'In Ziel-Beschreibung einfügen', action: () => { if (window.JTBriefs) window.JTBriefs.insertTarget(t); location.hash = '#/briefs'; } }));
      // Favoriten
      const m = window.JTMissions.getActive();
      if (m) {
        m.favs
          .filter(f => f.name.toLowerCase().includes(q) || (f.grid || '').includes(q))
          .slice(0, 4)
          .forEach(f => results.push({ type: 'Favorit', label: f.name, sub: f.grid, action: () => { if (window.JTBriefs) window.JTBriefs.applyGrid(f.grid); location.hash = '#/briefs'; } }));
      }
      // Missionen
      window.JTMissions.getMissions()
        .filter(x => x.name.toLowerCase().includes(q))
        .slice(0, 3)
        .forEach(x => results.push({ type: 'Mission', label: x.name, sub: window.JTProfiles.mapName(x.map), action: () => { window.JTMissions.setActive(x.id); window.App.onMissionChange(); location.hash = '#/mission'; } }));

      if (!results.length) { box.style.display = 'none'; return; }
      results.forEach(r => {
        const row = document.createElement('button');
        row.className = 'search-item';
        row.innerHTML = `<b>${r.label}</b> <span>${r.type}</span><div>${r.sub}</div>`;
        row.addEventListener('click', () => { r.action(); box.style.display = 'none'; input.value = ''; });
        box.appendChild(row);
      });
      box.style.display = 'block';
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.topbar-center')) box.style.display = 'none';
    });
  }

  function initGoButtons() {
    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) openBrief(tab);
        else location.hash = '#/' + btn.dataset.goto;
      });
    });
    document.querySelectorAll('.nav-item[data-tab]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        openBrief(a.dataset.tab);
      });
    });
    const dashCopy = document.getElementById('dash-copy');
    if (dashCopy) dashCopy.addEventListener('click', () => { if (window.JTBriefs) window.JTBriefs.copyCurrent(); });
    const dashMission = document.getElementById('dash-mission');
    if (dashMission) dashMission.addEventListener('click', () => { location.hash = '#/mission'; });
  }

  function route() {
    const hash = (location.hash || '#/home').replace('#/', '');
    const name = routes.includes(hash) ? hash : 'home';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.route === name);
    });
    if (name === 'home') renderDashboard();
    if (name === 'mission') window.JTMissions.render();
    if (name === 'refs') window.JTRefs.render();
    if (name === 'casflow') window.JTCasFlow.renderStep();
    if (name === 'settings') window.JTSettings.render(document.getElementById('settings-root'));
    if (name === 'profile') {
      window.JTProfiles.renderCards('profile-list');
      window.JTProfiles.renderEditForm();
    }
    renderPins();
    document.querySelectorAll('[data-copy-target]').forEach(b => {
      const target = b.dataset.copyTarget;
      b.onclick = () => {
        const pre = document.getElementById(target);
        if (pre) App.copy(pre.dataset.plain || pre.textContent);
      };
    });
  }

  // ---------- Grid-Rechner ----------
  function initGrid() {
    const zoneSel = document.getElementById('grid-zone');
    window.REF.maps.forEach(m => {
      const o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.name + (m.zone ? '  (' + m.zone + ')' : '');
      zoneSel.appendChild(o);
    });
    zoneSel.value = window.JTProfiles.getActive().map || 'altis';
    const preset = () => window.REF.maps.find(m => m.id === zoneSel.value) || window.REF.maps[0];
    let lastResult = null;

    const run = () => {
      const a = document.getElementById('grid-a').value;
      const b = document.getElementById('grid-b').value;
      const set = (id, val, cls) => {
        const el = document.getElementById(id);
        if (el) { el.textContent = val; el.className = cls || ''; }
      };
      if (!a && !b) {
        ['gr-dist', 'gr-bearing-mil', 'gr-bearing-deg', 'gr-format-a', 'gr-format-b'].forEach(id => set(id, '–'));
        lastResult = null;
        return;
      }
      const r = window.GridCalc.compute(a, b, preset());
      if (r.error) {
        set('gr-dist', r.error, 'bad');
        set('gr-bearing-mil', '–'); set('gr-bearing-deg', '–');
        set('gr-format-a', '–'); set('gr-format-b', '–');
        lastResult = null;
        return;
      }
      lastResult = { grid: b.trim(), distM: r.distM, bearingDeg: r.bearingDeg };
      set('gr-dist', window.GridCalc.fmt(r.distM) + ' m' + (r.distM >= 1000 ? '  (' + (r.distM / 1000).toFixed(2).replace('.', ',') + ' km)' : ''), 'ok');
      set('gr-bearing-mil', r.bearingMil + ' mil', '');
      set('gr-bearing-deg', r.bearingDeg.toFixed(1) + '°', '');
      const fmtMGRS = (s) => s ? s.slice(0, -4) + ' ' + s.slice(-4) : '–';
      set('gr-format-a', r.aMgrs ? fmtMGRS(r.aMgrs) : '–');
      set('gr-format-b', r.bMgrs ? fmtMGRS(r.bMgrs) : '–');
    };

    ['grid-a', 'grid-b'].forEach(id => {
      document.getElementById(id).addEventListener('input', run);
    });
    zoneSel.addEventListener('change', () => {
      const p = window.JTProfiles.getActive();
      window.JTProfiles.update(p.id, { map: zoneSel.value });
      run();
    });

    document.getElementById('grid-to-brief').addEventListener('click', () => {
      if (!lastResult) { App.toast('Erst zwei Punkte eingeben.', true); return; }
      if (window.JTBriefs) window.JTBriefs.applyGridResult(lastResult);
    });
    document.getElementById('grid-copy-result').addEventListener('click', () => {
      if (!lastResult) { App.toast('Erst zwei Punkte eingeben.', true); return; }
      const text = `Grid ${lastResult.grid} · Distanz ${window.GridCalc.fmt(lastResult.distM)} m · Peilung ${Math.round(lastResult.bearingDeg)}° / ${window.GridCalc.toMils(lastResult.bearingDeg)} mil`;
      App.copy(text);
    });

    const runSingle = () => {
      const text = document.getElementById('grid-single').value;
      const set = (id, val, cls) => {
        const el = document.getElementById(id);
        if (el) { el.textContent = val; el.className = cls || ''; }
      };
      if (!text) {
        ['gs-mgrs', 'gs-latlon', 'gs-dms', 'gs-utm'].forEach(id => set(id, '–'));
        return;
      }
      const r = window.GridCalc.convertSingle(text, preset());
      if (r.error) {
        ['gs-mgrs', 'gs-latlon', 'gs-dms', 'gs-utm'].forEach(id => set(id, '–'));
        set('gs-mgrs', r.error, 'bad');
        return;
      }
      set('gs-mgrs', r.mgrs ? r.mgrs.slice(0, -4) + ' ' + r.mgrs.slice(-4) : '–');
      set('gs-latlon', r.latlon || '–');
      set('gs-dms', r.dms || '–');
      set('gs-utm', r.utm || (r.approx ? '≈ über Ankerpunkt' : '–'));
    };
    document.getElementById('grid-single').addEventListener('input', runSingle);
  }

  // ---------- Profil-UI ----------
  function initProfilesUI() {
    const sel = document.getElementById('profile-select');
    const refresh = () => {
      sel.innerHTML = '';
      window.JTProfiles.getProfiles().forEach(p => {
        const o = document.createElement('option');
        o.value = p.id;
        o.textContent = p.name;
        sel.appendChild(o);
      });
      sel.value = window.JTProfiles.getActive().id;
    };
    refresh();
    sel.addEventListener('change', () => {
      window.JTProfiles.setActive(sel.value);
      onProfileChange();
      window.JTProfiles.renderCards('profile-list');
      App.toast('Profil: ' + window.JTProfiles.getActive().name);
    });

    window.App.buildAirframeList = function () {
      const existing = document.getElementById('airframe-cs');
      if (existing) existing.remove();
      const dl = document.createElement('datalist');
      dl.id = 'airframe-cs';
      const air = window.JTData ? window.JTData.getAirframes() : window.REF.airframesFlat;
      air.forEach(a => {
        const o = document.createElement('option');
        o.value = a.cs;
        o.label = (a.name || '') + (a.info ? ' – ' + a.info : '');
        dl.appendChild(o);
      });
      document.body.appendChild(dl);
    };
    window.App.buildAirframeList();

    document.getElementById('pf-cas').addEventListener('input', () => {
      window.JTProfiles.renderAirframeHint();
    });

    // Channels-Auswahl für die Funk-Felder (Datalist aus den Channels)
    const chDl = document.createElement('datalist');
    chDl.id = 'channels-list';
    window.JTChannels.getChannels().forEach(c => {
      const o = document.createElement('option');
      o.value = c.name + (c.freq ? '  (' + c.freq + ')' : '');
      chDl.appendChild(o);
    });
    document.body.appendChild(chDl);
    ['pf-freqcas', 'pf-freqmed'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('list', 'channels-list');
    });

    document.getElementById('profile-save').addEventListener('click', () => {
      const p = window.JTProfiles.getActive();
      const values = window.JTProfiles.readEditForm();
      if (!values.name) values.name = p.name || 'Profil';
      window.JTProfiles.update(p.id, values);
      refresh();
      window.JTProfiles.renderCards('profile-list');
      window.JTProfiles.renderEditForm();
      onProfileChange();
      App.toast('Profil gespeichert.');
    });

    document.getElementById('profile-reset').addEventListener('click', () => {
      if (confirm('Alle Profile auf Standard zurücksetzen?')) {
        window.JTProfiles.resetDefaults();
        refresh();
        window.JTProfiles.renderCards('profile-list');
        window.JTProfiles.renderEditForm();
        onProfileChange();
        App.toast('Profile zurückgesetzt.');
      }
    });
  }

  function onProfileChange() {
    const sel = document.getElementById('profile-select');
    if (sel) sel.value = window.JTProfiles.getActive().id;
    const zoneSel = document.getElementById('grid-zone');
    if (zoneSel) zoneSel.value = window.JTProfiles.getActive().map || 'altis';
    if (window.JTBriefs && window.JTBriefs.onProfileChange) window.JTBriefs.onProfileChange();
    if (window.JTExtraBriefs && window.JTExtraBriefs.onProfileChange) window.JTExtraBriefs.onProfileChange();
    if (window.JTCasFlow) window.JTCasFlow.renderPreview();
    renderDashboard();
    renderPins();
    if (window.jtacAPI && window.jtacAPI.setTitle) {
      window.jtacAPI.setTitle('JTAC Helper – ' + window.JTProfiles.getActive().name);
    }
  }
  App.onProfileChange = onProfileChange;

  function onMissionChange() {
    renderDashboard();
    renderPins();
    if (window.JTMissions.getActive()) window.JTMissions.render();
  }
  App.onMissionChange = onMissionChange;

  // ---------- Start ----------
  window.App = App;
  window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGrid();
    initProfilesUI();
    initGoButtons();
    initSearch();
    window.JTTimer.init();
    // Briefs-Controller nach dem Laden aller Module initialisieren (JTProfiles benötigt)
    window.JTBriefs.init();
    window.JTExtraBriefs.init();
    window.JTCasFlow.init();
    window.JTProfiles.renderCards('profile-list');

    document.getElementById('copy-all-btn').addEventListener('click', () => {
      const hash = (location.hash || '#/home').replace('#/', '');
      if (hash === 'briefs') window.JTBriefs.copyCurrent();
      else if (hash === 'briefing') window.JTExtraBriefs.copyCurrent();
      else if (hash === 'casflow') {
        const pre = document.getElementById('casflow-preview');
        if (pre) App.copy(pre.dataset.plain || pre.textContent);
        else App.toast('Kein Funkspruch in dieser Ansicht.', true);
      } else {
        App.toast('Kein Funkspruch in dieser Ansicht.', true);
      }
    });

    // Standard-Profil aus den Einstellungen anwenden (beim Start)
    if (window.JTSettings && window.JTSettings.applyDefaultProfile) window.JTSettings.applyDefaultProfile();

    // Update-Check: schaut still nach, ob es eine neue App-Version gibt
    if (window.JTUpdate && window.JTUpdate.initAuto) window.JTUpdate.initAuto();

    window.addEventListener('hashchange', route);
    route();
    onProfileChange();
    try {
      const sub = document.getElementById('brand-sub');
      if (sub && window.jtacAPI) {
        window.jtacAPI.version().then(v => {
          if (v && v !== '0.0.0') sub.textContent = 'CGF 160th SOAR · v' + v;
        });
      }
    } catch (e) {}
  });
})();
