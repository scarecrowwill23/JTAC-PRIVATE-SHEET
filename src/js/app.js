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
  const routes = ['home', 'mission', 'casflow', 'briefs', 'grid', 'timer', 'profile', 'refs'];

  function renderDashboard() {
    const p = window.JTProfiles.getActive();
    const m = window.JTMissions.getActive();

    // Mission-Box
    const mbox = document.getElementById('dash-mission-box');
    if (mbox) {
      if (m) {
        mbox.innerHTML = `
          <div class="dash-mission-grid">
            <div class="kv"><span>Mission</span><b>${m.name}</b></div>
            <div class="kv"><span>Karte</span><b>${window.JTProfiles.mapName(m.map)}</b></div>
            <div class="kv"><span>Funksprüche</span><b>${m.scripts.length}</b></div>
            <div class="kv"><span>BDA</span><b>${m.bda.length}</b></div>
            <div class="kv"><span>Profil</span><b>${p.name}</b></div>
            <div class="kv"><span>Funk</span><b>${p.freqCas || '–'}</b></div>
          </div>`;
      } else {
        mbox.innerHTML = '<p class="hint">Keine Mission aktiv – <a href="#/mission">hier eine anlegen</a>, dann sammelt die App alles.</p>';
      }
    }

    const box = document.getElementById('dash-airframe-box');
    if (box) {
      const af = window.REF.findAirframe(p.cas);
      if (!af) {
        box.innerHTML = '<span class="hint">Kein Airframe-Callsign im Profil hinterlegt.</span>';
      } else {
        box.innerHTML =
          `<div class="af-head"><b>${af.cs}</b> — ${af.name} <span class="af-cat">${af.cat}</span></div>` +
          `<div class="af-row"><span>Bewaffnung</span>${af.info}</div>` +
          `<div class="af-row"><span>Features</span>${af.feat}</div>` +
          `<div class="af-row"><span>Crew</span>${af.crew}</div>`;
      }
    }
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
        if (tab && window.JTBriefs) window.JTBriefs.open(tab);
        location.hash = '#/' + btn.dataset.goto;
      });
    });
    document.querySelectorAll('.nav-item[data-tab]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.JTBriefs) window.JTBriefs.open(a.dataset.tab);
        location.hash = '#/briefs';
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

    const dl = document.createElement('datalist');
    dl.id = 'airframe-cs';
    window.REF.airframesFlat.forEach(a => {
      const o = document.createElement('option');
      o.value = a.cs;
      o.label = a.name + ' – ' + a.info;
      dl.appendChild(o);
    });
    document.body.appendChild(dl);

    document.getElementById('pf-cas').addEventListener('input', () => {
      window.JTProfiles.renderAirframeHint();
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
    window.JTBriefs.init();
    window.JTCasFlow.init();
    window.JTProfiles.renderCards('profile-list');

    document.getElementById('copy-all-btn').addEventListener('click', () => {
      const hash = (location.hash || '#/home').replace('#/', '');
      if (hash === 'briefs') window.JTBriefs.copyCurrent();
      else if (hash === 'casflow') {
        const pre = document.getElementById('casflow-preview');
        if (pre) App.copy(pre.dataset.plain || pre.textContent);
        else App.toast('Kein Funkspruch in dieser Ansicht.', true);
      } else {
        App.toast('Kein Funkspruch in dieser Ansicht.', true);
      }
    });

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
