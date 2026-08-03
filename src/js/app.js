// ============================================================
// JTAC Private Sheet – App-Steuerung
// Router, Theme, Toast, Kopieren, Formular-Wiring.
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
  const routes = ['home', 'cas', 'medevac', 'grid', 'timer', 'profile', 'refs'];

  function route() {
    const hash = (location.hash || '#/home').replace('#/', '');
    const name = routes.includes(hash) ? hash : 'home';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.route === name);
    });
    if (name === 'refs') window.JTRefs.render();
    if (name === 'profile') {
      window.JTProfiles.renderCards('profile-list');
      window.JTProfiles.renderEditForm();
    }
    // Kopieren-Button in Seitenkopf aktivieren
    document.querySelectorAll('[data-copy-target]').forEach(b => {
      const target = b.dataset.copyTarget;
      b.onclick = () => {
        const pre = document.getElementById(target);
        if (pre) App.copy(pre.dataset.plain || pre.textContent);
      };
    });
  }

  // ---------- 9-Line CAS ----------
  let casForm = null, medevacForm = null;

  function initCAS() {
    const load = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(window.JTForms.LS.cas) || '{}');
        const p = window.JTProfiles.getActive();
        // Profil-Werte als Default, falls Feld leer
        const merged = { ...stored };
        if (!merged.grid && p.laser) merged.grid = '';
        return merged;
      } catch (e) { return {}; }
    };
    const save = (v) => localStorage.setItem(window.JTForms.LS.cas, JSON.stringify(v));

    const fieldOpts = {
      mark: { list: 'cas-mark-list' },
      grid: { list: 'cas-grid-list' }
    };

    casForm = window.JTForms.initForm('cas-form', window.REF.casLines, {
      load, save,
      fieldOpts,
      onChange: renderCASPreview
    });

    // Datalists
    const dl = document.createElement('datalist');
    dl.id = 'cas-mark-list';
    const marks = [];
    window.REF.laserCodes.forEach(c => marks.push('Lase ' + c));
    window.REF.smokeColors.forEach(c => marks.push(c + ' Rauch'));
    marks.push('IR-Strobe', 'VS-17 Panel', 'GPS-Koordinaten', 'In die Offene legen');
    marks.forEach(m => { const o = document.createElement('option'); o.value = m; dl.appendChild(o); });
    document.body.appendChild(dl);

    const dl2 = document.createElement('datalist');
    dl2.id = 'cas-grid-list';
    window.REF.maps.filter(m => m.id !== 'custom').forEach(m => {
      const o = document.createElement('option');
      o.value = 'Grid: ' + m.zone + ' (siehe Grid-Rechner)';
      dl2.appendChild(o);
    });
    document.body.appendChild(dl2);
  }

  function renderCASPreview() {
    const values = casForm.getValues();
    const p = window.JTProfiles.getActive();
    const header = `${p.jtac || 'JTAC'} – 9-Line CAS, ready to copy.`;
    const text = window.JTForms.buildPreview(window.REF.casLines, values, { header });
    setPreview('cas-preview', text);
    const req = {};
    window.REF.casLines.forEach(l => req[l.line] = l.key);
    window.JTForms.updateBadges(document.getElementById('cas-form'), values, req);
  }

  // ---------- 9-Line MEDEVAC ----------
  function initMEDEVAC() {
    const load = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(window.JTForms.LS.medevac) || '{}');
        const p = window.JTProfiles.getActive();
        // Frequenz/Callsign aus dem Profil vorbelegen, falls leer
        const merged = { ...stored };
        if (!merged.freq && p.freqMed) {
          merged.freq = p.freqMed + (p.med ? ' / ' + p.med : '');
        }
        return merged;
      } catch (e) { return {}; }
    };
    const save = (v) => localStorage.setItem(window.JTForms.LS.medevac, JSON.stringify(v));

    const fieldOpts = {
      loc: { list: 'med-grid-list' },
      security: { selectOptions: ['N – kein Feind', 'P – möglich', 'E – Feind', 'X – bewaffnete Eskorte'] },
      equip: { selectOptions: ['A – keine', 'B – Seilwinde', 'C – Extraktion', 'D – Beatmung'] },
      nbc: { selectOptions: ['keine', 'NBC 1', 'NBC 2', 'NBC 3'] }
    };
    const special = {
      patients: (ld, value) => window.JTForms.buildLineRow(ld, value, {
        numberInputs: [
          { code: 'A', label: 'A – urgent' },
          { code: 'B', label: 'B – urgent-surgical' },
          { code: 'C', label: 'C – priority' },
          { code: 'D', label: 'D – routine' },
          { code: 'E', label: 'E – convenience' }
        ]
      }),
      type: (ld, value) => window.JTForms.buildLineRow(ld, value, {
        numberInputs: [
          { code: 'L', label: 'L – liegend (Litter)' },
          { code: 'A', label: 'A – gehend (Ambulatory)' }
        ]
      })
    };

    medevacForm = window.JTForms.initForm('medevac-form', window.REF.medevacLines, {
      load, save, fieldOpts, special,
      onChange: renderMEDEVACPreview
    });
  }

  function renderMEDEVACPreview() {
    const values = medevacForm.getValues();
    const p = window.JTProfiles.getActive();
    const freq = values.freq || (p.freqMed ? p.freqMed + ' / ' + p.med : '');
    const header = `${p.med || 'MEDEVAC'} – 9-Line, über.`;
    const text = window.JTForms.buildPreview(window.REF.medevacLines, values, { header });
    setPreview('medevac-preview', text);
    const req = {};
    window.REF.medevacLines.forEach(l => req[l.line] = l.key);
    window.JTForms.updateBadges(document.getElementById('medevac-form'), values, req);
  }

  function setPreview(id, text) {
    const pre = document.getElementById(id);
    if (!pre) return;
    pre.textContent = text || pre.dataset.blank || '';
    pre.dataset.plain = text || '';
    pre.classList.toggle('blank', !text);
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

    const fmtSel = document.getElementById('grid-format');
    const fmtNum = () => parseInt(fmtSel.value, 10);
    const preset = () => window.REF.maps.find(m => m.id === zoneSel.value) || window.REF.maps[0];

    const run = () => {
      const a = document.getElementById('grid-a').value;
      const b = document.getElementById('grid-b').value;
      const res = document.getElementById('grid-result');
      const set = (id, val, cls) => {
        const el = document.getElementById(id);
        if (el) { el.textContent = val; el.className = cls || ''; }
      };
      if (!a && !b) {
        ['gr-dist', 'gr-bearing-mil', 'gr-bearing-deg', 'gr-format-a', 'gr-format-b'].forEach(id => set(id, '–'));
        return;
      }
      const r = window.GridCalc.compute(a, b, preset());
      if (r.error) {
        set('gr-dist', r.error, 'bad');
        set('gr-bearing-mil', '–'); set('gr-bearing-deg', '–');
        set('gr-format-a', '–'); set('gr-format-b', '–');
        return;
      }
      set('gr-dist', window.GridCalc.fmt(r.distM) + ' m' + (r.distM >= 1000 ? '  (' + (r.distM / 1000).toFixed(2).replace('.', ',') + ' km)' : ''), 'ok');
      set('gr-bearing-mil', r.bearingMil + ' mil', '');
      set('gr-bearing-deg', r.bearingDeg.toFixed(1) + '°', '');
      const fmtMGRS = (s) => {
        if (!s) return '–';
        return s.slice(0, -4) + ' ' + s.slice(-4);
      };
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

    // Einzelpunkt
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
    // Profile-Auswahl & Karten-Zone synchron
    const sel = document.getElementById('profile-select');
    if (sel) sel.value = window.JTProfiles.getActive().id;
    const zoneSel = document.getElementById('grid-zone');
    if (zoneSel) zoneSel.value = window.JTProfiles.getActive().map || 'altis';
    if (casForm) renderCASPreview();
    if (medevacForm) renderMEDEVACPreview();
    if (window.jtacAPI && window.jtacAPI.setTitle) {
      window.jtacAPI.setTitle('JTAC Private Sheet – ' + window.JTProfiles.getActive().name);
    }
  }

  // Profil-Wechsel (z. B. aus Karten-Klick) → alles aktualisieren
  App.onProfileChange = onProfileChange;

  // ---------- Start ----------
  window.App = App;
  window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCAS();
    initMEDEVAC();
    initGrid();
    initProfilesUI();
    window.JTTimer.init();
    window.JTProfiles.renderCards('profile-list');

    document.getElementById('copy-all-btn').addEventListener('click', () => {
      const hash = (location.hash || '#/home').replace('#/', '');
      if (hash === 'cas') renderCASPreview();
      if (hash === 'medevac') renderMEDEVACPreview();
      const map = { cas: 'cas-preview', medevac: 'medevac-preview' };
      const pre = map[hash] && document.getElementById(map[hash]);
      if (pre) App.copy(pre.dataset.plain || pre.textContent);
      else App.toast('Kein Funkspruch in dieser Ansicht.', true);
    });

    window.addEventListener('hashchange', route);
    route();
    onProfileChange();
    // Version im Header
    try {
      const sub = document.getElementById('brand-sub');
      if (sub && window.jtacAPI) {
        const v = window.jtacAPI.version();
        if (v && v !== '0.0.0') sub.textContent = 'CGF 160th SOAR · v' + v;
      }
    } catch (e) {}
  });
})();
