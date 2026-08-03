// ============================================================
// JTAC Helper – Briefs & Formulare
// Satz-Output (vorlesbar), Pilot-Callsign, Schnell-Buttons,
// Standard-Phrasen, Reset, Senden → Mission-Log + Readback.
// ============================================================

(function () {
  'use strict';

  const FORMATS = window.REF.briefFormats; // [{id, label}]
  let current = 'cas5';                     // FOKUS: 5-Line (Rotary)
  let forms = {};                            // id -> form
  const session = {};                        // In-Memory (App-Start = leer)
  let lastScript = '';

  function sessionKey(id) { return 'brief.' + id; }

  function buildForm(id) {
    const def = window.REF[id];
    const load = () => JSON.parse(JSON.stringify(session[sessionKey(id)] || {}));
    const save = (v) => { session[sessionKey(id)] = v; };
    const onChange = () => renderPreview(id);

    forms[id] = window.JTForms.initBriefForm('brief-form', def, { load, save, onChange });

    document.getElementById('brief-form-title').textContent = def.name + '  (' + def.use + ')';
    document.getElementById('brief-hint').textContent = window.JTForms.readbackHint(def);
    // Pilot-Feld
    const pInput = document.getElementById('brief-pilot');
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

  function renderPreview(id) {
    const def = window.REF[id];
    const f = forms[id];
    if (!f) return;
    const values = { ...f.getValues() };
    const pInput = document.getElementById('brief-pilot');
    if (pInput && pInput.value.trim()) values.pilot = pInput.value.trim();

    lastScript = window.JTForms.buildScript(def, values, { profile: window.JTProfiles.getActive() });
    const pre = document.getElementById('brief-preview');
    pre.textContent = lastScript || pre.dataset.blank || '';
    pre.dataset.plain = lastScript || '';
    pre.classList.toggle('blank', !lastScript);
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
    renderAirframeRef();
    renderPhrases();
    renderReadbackBox();
  }

  function renderAirframeRef() {
    const box = document.getElementById('brief-airframe');
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

  // ---------- Datalists ----------
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
    add('target-list', window.REF.targets);
    add('ordnance-list', window.REF.ordnance);
    add('mark-list', window.REF.laserCodes.map(c => 'Lase ' + c).concat(window.REF.smokeColors.map(c => c + ' Rauch'), ['IR Pointer', 'IR Strobe', 'VS-17 Panel', 'GPS']));
    add('count-list', ['1', '2', '3', '4', '5', '6']);
  }

  // ---------- Schnell-Buttons (Brevity) ----------
  function renderQuickButtons() {
    const root = document.getElementById('brief-quick');
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
    const pre = document.getElementById('brief-preview');
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
    const root = document.getElementById('brief-phrases');
    if (!root) return;
    root.innerHTML = '';
    const p = window.JTProfiles.getActive();
    const jtac = p.jtac || 'JTAC';
    const pilot = (document.getElementById('brief-pilot') || {}).value || p.cas || 'Pilot';

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
    const root = document.getElementById('brief-readback');
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
    // In Mission-Log
    const logged = window.JTMissions.addScript(window.REF[current].briefName || current, lastScript);
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
    const pInput = document.getElementById('brief-pilot');
    if (pInput) pInput.value = window.JTProfiles.getActive().cas || '';
    const pre = document.getElementById('brief-preview');
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

  /** Favoriten-Grid in den Brief übernehmen. */
  function applyGrid(grid) {
    const def = window.REF[current];
    const f = forms[current];
    if (!f) return;
    const values = f.getValues();
    const target = grid;
    if (current === 'cas5') {
      values.target = { ...(values.target || {}), grid: target };
    } else if (current === 'cas9') {
      values.grid = { grid: target };
    } else if (current === 'hlz') {
      values.loc = { loc: target };
    } else if (current === 'medevac') {
      values.loc = { loc: target };
    } else {
      // generisch: erstes Text-Feld mit "grid"-Key befüllen
      for (const ld of def.lines) {
        if (ld.fields && ld.fields.some(fd => fd.key === 'grid' || fd.key === 'loc' || fd.key === 'target' || fd.key === 'poi' || fd.key === 'loc')) {
          values[ld.key] = { ...(values[ld.key] || {}), grid: target };
          break;
        }
      }
    }
    f.setValues(values);
    window.App.toast('Grid übernommen: ' + target);
  }

  /** Grid-Rechner-Ergebnis in den Brief übernehmen. */
  function applyGridResult(result) {
    // result = { grid, distM, bearingDeg }
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
    }
    f.setValues(values);
    window.App.toast('Grid-Rechner-Ergebnis in den Brief übernommen.');
  }

  function open(id) {
    if (!FORMATS.find(f => f.id === id)) id = 'cas5';
    current = id;
    renderTabs();
    buildForm(current);
    requestAnimationFrame(() => {
      const form = document.getElementById('brief-form');
      const input = form && form.querySelector('.subfield input, .field-row input');
      if (input && !input.value) input.focus();
    });
  }

  function init() {
    initDatalists();
    renderQuickButtons();
    renderTabs();
    buildForm(current);

    document.getElementById('brief-send').addEventListener('click', send);
    document.getElementById('brief-reset').addEventListener('click', resetForm);
    document.getElementById('brief-copy').addEventListener('click', copyCurrent);

    window.JTBriefs.onProfileChange = () => {
      renderAirframeRef();
      renderPhrases();
      const f = forms[current];
      if (f) renderPreview(current);
    };
  }

  window.JTBriefs = {
    init, open, copyCurrent, applyGrid, applyGridResult, current: () => current,
    getLastScript: () => lastScript
  };
})();
