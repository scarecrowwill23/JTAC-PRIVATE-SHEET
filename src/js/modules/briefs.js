// ============================================================
// JTAC Helper – Briefs & Formulare (Controller-Factory)
// Zwei Instanzen:
//   JTBriefs      – Haupt-Formate (5-Line, HLZ, 9-Line, MEDEVAC)
//   JTExtraBriefs – Briefing Area (Gunship, RPAS, ALZ, Airdrop,
//                   Call for Fire, CCA 5-Line)
// Satz-Output (vorlesbar), Schnell-Buttons, Phrasen,
// Readback-Abhaken, Senden → Mission-Log.
// ============================================================

(function () {
  'use strict';

  function createController(prefix, formats) {
    const ids = {
      tabs: prefix + '-tabs',
      form: prefix + '-form',
      formTitle: prefix + '-form-title',
      hint: prefix + '-hint',
      pilot: prefix + '-pilot',
      preview: prefix + '-preview',
      airframe: prefix + '-airframe',
      quick: prefix + '-quick',
      phrases: prefix + '-phrases',
      readback: prefix + '-readback',
      send: prefix + '-send',
      reset: prefix + '-reset',
      copy: prefix + '-copy'
    };

    let current = formats.length ? formats[0].id : null;
    let forms = {};             // id -> form
    const session = {};         // In-Memory (App-Start = leer)
    let lastScript = '';

    function sessionKey(id) { return prefix + '.' + id; }

    // ---------- Formular ----------
    function buildForm(id) {
      const def = window.REF[id];
      const load = () => JSON.parse(JSON.stringify(session[sessionKey(id)] || {}));
      const save = (v) => { session[sessionKey(id)] = v; };
      const onChange = () => renderPreview(id);

      forms[id] = window.JTForms.initBriefForm(ids.form, def, { load, save, onChange });

      const title = document.getElementById(ids.formTitle);
      if (title) title.textContent = def.name + '  (' + def.use + ')';
      const hint = document.getElementById(ids.hint);
      if (hint) hint.textContent = window.JTForms.readbackHint(def);

      const pInput = document.getElementById(ids.pilot);
      if (pInput) {
        const p = window.JTProfiles.getActive();
        const saved = (session[sessionKey(id)] || {}).pilot;
        pInput.value = saved || p.cas || '';
        pInput.oninput = () => {
          const v = session[sessionKey(id)] || {};
          v.pilot = pInput.value.trim();
          session[sessionKey(id)] = v;
          renderPreview(id);
        };
      }
    }

    // ---------- Vorschau ----------
    function renderPreview(id) {
      const def = window.REF[id];
      const f = forms[id];
      if (!f) return;
      const values = { ...f.getValues() };
      const pInput = document.getElementById(ids.pilot);
      if (pInput && pInput.value.trim()) values.pilot = pInput.value.trim();

      lastScript = window.JTForms.buildScript(def, values, { profile: window.JTProfiles.getActive() });
      const pre = document.getElementById(ids.preview);
      pre.textContent = lastScript || pre.dataset.blank || '';
      pre.dataset.plain = lastScript || '';
      pre.classList.toggle('blank', !lastScript);
    }

    // ---------- Tabs ----------
    function renderTabs() {
      const root = document.getElementById(ids.tabs);
      if (!root) return;
      root.innerHTML = '';
      formats.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'tab' + (f.id === current ? ' active' : '');
        btn.textContent = f.label;
        btn.addEventListener('click', () => { current = f.id; renderTabs(); buildForm(current); });
        root.appendChild(btn);
      });
      renderAirframeRef();
      renderPhrases();
      renderReadbackBox();
    }

    function renderAirframeRef() {
      const box = document.getElementById(ids.airframe);
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

    // ---------- Datalists (mit eigenen Daten aus JTData gemischt) ----------
    function getMerged(which) {
      if (window.JTData && window.JTData['get' + which]) return window.JTData['get' + which]();
      return which === 'Targets' ? window.REF.targets : which === 'Ordnance' ? window.REF.ordnance : window.REF.targetContext;
    }

    function initDatalists() {
      const add = (id, items) => {
        const existing = document.getElementById(id);
        if (existing) existing.remove();
        const dl = document.createElement('datalist');
        dl.id = id;
        items.forEach(v => {
          const o = document.createElement('option');
          o.value = v;
          dl.appendChild(o);
        });
        document.body.appendChild(dl);
      };
      add('target-list', getMerged('Targets'));
      add('ordnance-list', getMerged('Ordnance'));
      add('context-list', getMerged('Context'));
      add('mark-list', window.REF.laserCodes.map(c => 'Lase ' + c).concat(window.REF.smokeColors.map(c => c + ' Rauch'), ['IR Pointer', 'IR Strobe', 'VS-17 Panel', 'GPS']));
      add('count-list', ['1', '2', '3', '4', '5', '6']);
    }

    /** Datalists neu aufbauen (nach Änderungen in den eigenen Daten). */
    function refreshDatalists() {
      if (!window.JTData) return;
      initDatalists();
    }

    // ---------- Schnell-Buttons ----------
    function renderQuickButtons() {
      const root = document.getElementById(ids.quick);
      if (!root) return;
      root.innerHTML = '';
      const items = [
        'CONTACT', 'TALLY', 'NO JOY', 'CLEARED HOT', 'CLEARED TO ENGAGE',
        'RIFLE', 'PICKLE', 'GUNS', 'SPLASH', 'SHACK', 'LASE ON', 'LASE OFF', 'COPY', 'OUT'
      ];
      items.forEach(code => {
        const b = document.createElement('button');
        b.className = 'quick-btn';
        b.textContent = code;
        b.title = 'An den Funkspruch anhängen';
        b.addEventListener('click', () => appendToScript(code));
        root.appendChild(b);
      });
    }

    function appendToScript(text) {
      const pre = document.getElementById(ids.preview);
      const currentText = pre.dataset.plain || '';
      const newText = currentText ? currentText + '\n' + text : text;
      pre.textContent = newText;
      pre.dataset.plain = newText;
      pre.classList.toggle('blank', !newText);
      lastScript = newText;
      window.App.toast('Angehängt: ' + text);
    }

    // ---------- Standard-Phrasen ----------
    function renderPhrases() {
      const root = document.getElementById(ids.phrases);
      if (!root) return;
      root.innerHTML = '';
      const p = window.JTProfiles.getActive();
      const jtac = p.jtac || 'JTAC';
      const pilot = (document.getElementById(ids.pilot) || {}).value || p.cas || 'Pilot';

      window.REF.standardPhrases.forEach(ph => {
        const b = document.createElement('button');
        b.className = 'phrase-btn';
        const resolved = ph.replace(/\{pilot\}/g, pilot).replace(/\{jtac\}/g, jtac);
        b.textContent = resolved;
        b.title = 'An den Funkspruch anhängen';
        b.addEventListener('click', () => appendToScript(resolved));
        root.appendChild(b);
      });
    }

    // ---------- Readback-Abhaken ----------
    function renderReadbackBox() {
      const root = document.getElementById(ids.readback);
      if (!root) return;
      root.innerHTML = '';
      const def = window.REF[current];
      const rbs = window.JTForms.readbackLines(def);
      const box = document.createElement('div');
      box.className = 'readback-box';
      const h = document.createElement('b');
      h.textContent = 'Readback abhaken (nach Bestätigung des Piloten)';
      box.appendChild(h);
      const rows = document.createElement('div');
      rows.className = 'readback-rows';
      rbs.forEach(r => {
        const label = document.createElement('label');
        label.className = 'check-item';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.addEventListener('change', () => {
          if (cb.checked) window.App.toast('Readback Zeile ' + r.n + ' bestätigt ✓');
        });
        const span = document.createElement('span');
        span.textContent = 'Zeile ' + r.n + ' – ' + r.label;
        label.appendChild(cb);
        label.appendChild(span);
        rows.appendChild(label);
      });
      box.appendChild(rows);
      root.appendChild(box);
    }

    // ---------- Senden ----------
    function send() {
      renderPreview(current);
      if (!lastScript) { window.App.toast('Funkspruch ist leer – erst ausfüllen.', true); return; }
      window.App.copy(lastScript);
      const def = window.REF[current];
      const logged = window.JTMissions.addScript(def.briefName || def.name || current, lastScript);
      if (logged) {
        window.App.toast('📤 Gesendet & ins Missions-Log geschrieben.');
        renderReadbackBox();
      } else {
        window.App.toast('⧉ Kopiert (keine aktive Mission – Log übersprungen).');
      }
    }

    function resetForm() {
      const f = forms[current];
      if (f) f.clear();
      const pInput = document.getElementById(ids.pilot);
      if (pInput) pInput.value = window.JTProfiles.getActive().cas || '';
      const pre = document.getElementById(ids.preview);
      pre.textContent = pre.dataset.blank || '';
      pre.dataset.plain = '';
      lastScript = '';
      renderReadbackBox();
      window.App.toast('Formular geleert.');
    }

    function copyCurrent() {
      renderPreview(current);
      window.App.copy(lastScript);
    }

    // ---------- Favoriten / Grid übernehmen ----------
    function applyGrid(grid) {
      const def = window.REF[current];
      const f = forms[current];
      if (!f) return;
      const values = f.getValues();
      let applied = false;
      for (const ld of def.lines) {
        if (!ld.fields) continue;
        const fd = ld.fields.find(x => ['grid', 'loc', 'target', 'poi'].includes(x.key));
        if (fd) {
          values[ld.key] = { ...(values[ld.key] || {}), [fd.key]: grid };
          applied = true;
          break;
        }
      }
      if (applied) { f.setValues(values); window.App.toast('Grid übernommen: ' + grid); }
      else window.App.toast('Kein passendes Grid-Feld in diesem Format.', true);
    }

    function applyGridResult(result) {
      const f = forms[current];
      if (!f) return;
      const values = f.getValues();
      if (current === 'cas5') {
        values.target = { ...(values.target || {}), grid: result.grid || (values.target || {}).grid };
        if (result.distM) {
          values.friendly = { ...(values.friendly || {}), loc: `~${window.GridCalc.fmt(result.distM)} m from target` };
        }
      } else if (current === 'cas9') {
        values.grid = { grid: result.grid || (values.grid || {}).grid };
        if (result.bearingDeg) values.dir = { dir: Math.round(result.bearingDeg) + '°' };
        if (result.distM) values.dist = { dist: (result.distM / 1000).toFixed(1).replace('.', ',') + ' km' };
      } else {
        applyGrid(result.grid || '');
        return;
      }
      f.setValues(values);
      window.App.toast('Grid-Rechner-Ergebnis in den Brief übernommen.');
    }

    // ---------- Ziel-Beschreibung einfügen ----------
    function insertTarget(text) {
      const def = window.REF[current];
      const f = forms[current];
      if (!f) return;
      // passt nur, wenn das aktuelle Format ein Beschreibungs-Feld hat
      let found = false;
      for (const ld of def.lines) {
        if (!ld.fields) continue;
        const fd = ld.fields.find(x => x.key === 'desc' || x.label === 'Beschreibung');
        if (fd) {
          const values = f.getValues();
          values[ld.key] = { ...(values[ld.key] || {}), [fd.key]: text };
          f.setValues(values);
          window.App.toast('Ziel übernommen: ' + text);
          found = true;
          break;
        }
      }
      if (!found) window.App.toast('Dieses Format hat kein Beschreibungs-Feld.', true);
    }

    // ---------- Öffnen ----------
    function open(id) {
      if (!formats.find(f => f.id === id)) id = formats.length ? formats[0].id : null;
      if (!id) return;
      current = id;
      renderTabs();
      buildForm(current);
      requestAnimationFrame(() => {
        const form = document.getElementById(ids.form);
        const input = form && form.querySelector('.subfield input, .field-row input');
        if (input && !input.value) input.focus();
      });
    }

    // ---------- Init ----------
    function init() {
      if (!formats.length) return;
      initDatalists();
      renderQuickButtons();
      renderTabs();
      buildForm(current);

      const sendBtn = document.getElementById(ids.send);
      if (sendBtn) sendBtn.addEventListener('click', send);
      const resetBtn = document.getElementById(ids.reset);
      if (resetBtn) resetBtn.addEventListener('click', resetForm);
      const copyBtn = document.getElementById(ids.copy);
      if (copyBtn) copyBtn.addEventListener('click', copyCurrent);
    }

    return {
      init, open, copyCurrent, applyGrid, applyGridResult, insertTarget,
      send, resetForm, refreshDatalists,
      current: () => current,
      getLastScript: () => lastScript,
      onProfileChange: () => {
        renderAirframeRef();
        renderPhrases();
        const f = forms[current];
        if (f) renderPreview(current);
      }
    };
  }

  // Zwei Instanzen (init() wird in app.js nach dem Laden ALLER Module aufgerufen,
  // weil JTProfiles erst später geladen wird)
  window.JTBriefs = createController('brief', window.REF.briefFormatsMain);
  window.JTExtraBriefs = createController('extra', window.REF.briefFormatsExtra);
})();
