// ============================================================
// JTAC Helper – 12-Schritte-CAS Workflow
// Geführter Ablauf: Check-in → SITREP (TEFACHR) → Game Plan →
// Brief (5/9-Line als Satz-Output) → Remarks → BDA
// ============================================================

(function () {
  'use strict';

  const STEPS = window.REF.casSteps;
  let current = 0;
  let forms = {};   // step.form -> Form
  let session = {}; // In-Memory

  function load() { return session; }
  function save(v) { session = v; }

  // Alte einfache Feldstrukturen in Lines umwandeln
  function simpleLines(fields, startN) {
    return fields.map((f, i) => ({
      n: startN + i,
      key: f.key,
      short: (f.short || f.label.split(' ')[0]),
      label: f.label,
      ph: f.ph,
      help: f.help,
      select: f.select
    }));
  }

  function buildStepForm(step) {
    const container = document.getElementById('casflow-form');
    container.innerHTML = '';
    if (!step.form) return;
    if (step.form === 'brief') { buildBriefPicker(); return; }

    const FIELDS = {
      checkin:  { fields: window.REF.checkinFields },
      tefachr:  { fields: window.REF.tefachrFields },
      gameplan: { fields: window.REF.gameplanFields },
      remarks:  { fields: window.REF.remarksFields },
      bda:      { fields: window.REF.bdaFields }
    };
    const cfg = FIELDS[step.form];
    const def = { name: step.title, lines: simpleLines(cfg.fields, 1) };
    const all = load();
    forms[step.form] = window.JTForms.initBriefForm('casflow-form', def, {
      load: () => all[step.form] || {},
      save: (v) => { const d = load(); d[step.form] = v; save(d); },
      onChange: renderPreview
    });
  }

  function buildBriefPicker() {
    const container = document.getElementById('casflow-form');
    container.innerHTML = '';
    const all = load();
    const b = all.brief || {};
    const type = b.type || 'cas5';

    const row = document.createElement('div');
    row.className = 'field-row';
    const typeField = document.createElement('div');
    typeField.className = 'field';
    const lbl = document.createElement('label');
    lbl.className = 'field-label';
    lbl.textContent = 'Brief-Typ';
    const sel = document.createElement('select');
    sel.className = 'select';
    [['cas5', '5-Line (Rotary / AC-130)'], ['cas9', '9-Line (Fixed-Wing)']].forEach(([v, t]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = t;
      sel.appendChild(o);
    });
    sel.value = type;
    typeField.appendChild(lbl);
    typeField.appendChild(sel);
    row.appendChild(typeField);
    container.appendChild(row);

    const sub = document.createElement('div');
    sub.id = 'casflow-brief-sub';
    container.appendChild(sub);

    const renderSub = () => {
      sub.innerHTML = '';
      const def = window.REF[sel.value];
      forms.brief = window.JTForms.initBriefForm('casflow-brief-sub', def, {
        load: () => b,
        save: (v) => { const d = load(); d.brief = { ...b, ...v, type: sel.value }; save(d); },
        onChange: renderPreview
      });
    };
    renderSub();
    sel.addEventListener('change', () => {
      const d = load();
      d.brief = { ...b, type: sel.value };
      save(d);
      buildBriefPicker();
      renderPreview();
    });
  }

  function renderStep() {
    const step = STEPS[current];
    document.getElementById('casflow-title').textContent = `Schritt ${step.n}: ${step.title}`;
    document.getElementById('casflow-body').textContent = step.body;
    buildStepForm(step);

    const stepper = document.getElementById('casflow-stepper');
    stepper.innerHTML = '';
    STEPS.forEach((s, i) => {
      const el = document.createElement('div');
      el.className = 'step' + (i === current ? ' active' : '') + (i < current ? ' done' : '');
      el.innerHTML = `<span class="step-n">${s.n}</span><span class="step-t">${s.title}</span>`;
      el.addEventListener('click', () => { current = i; renderStep(); renderPreview(); });
      stepper.appendChild(el);
    });

    document.getElementById('casflow-prev').disabled = current === 0;
    document.getElementById('casflow-next').textContent = current === STEPS.length - 1 ? 'Fertig ✓' : 'Weiter →';
    renderPreview();
  }

  function renderPreview() {
    const pre = document.getElementById('casflow-preview');
    const parts = [];
    const all = load();
    const p = window.JTProfiles.getActive();
    // Deutsche Freitext-Eingaben automatisch ins Funk-Englisch übersetzen
    const en = (s) => (window.RadioEN ? window.RadioEN.radioEN(s) : s);

    if (all.checkin) {
      parts.push('CAS CHECK-IN (' + (p.jtac || 'JTAC') + ')');
      window.REF.checkinFields.forEach(f => { if (all.checkin[f.key]) parts.push('• ' + f.label + ': ' + en(all.checkin[f.key])); });
    }
    if (all.tefachr) {
      parts.push('SITREP (' + (p.jtac || 'JTAC') + ')');
      window.REF.tefachrFields.forEach(f => { if (all.tefachr[f.key]) parts.push('• ' + f.label + ': ' + en(all.tefachr[f.key])); });
    }
    if (all.gameplan) {
      parts.push('GAME PLAN');
      window.REF.gameplanFields.forEach(f => { if (all.gameplan[f.key]) parts.push('• ' + f.label + ': ' + en(all.gameplan[f.key])); });
    }
    if (all.brief) {
      const b = all.brief;
      const type = b.type === 'cas9' ? 'cas9' : 'cas5';
      const def = window.REF[type];
      const values = { ...b };
      values.pilot = b.pilot || p.cas || 'Pilot';
      const script = window.JTForms.buildScript(def, values, { profile: p });
      if (script) parts.push('CAS BRIEF', script);
    }
    if (all.remarks) {
      parts.push('REMARKS & RESTRICTIONS');
      window.REF.remarksFields.forEach(f => { if (all.remarks[f.key]) parts.push('• ' + f.label + ': ' + en(all.remarks[f.key])); });
    }
    if (all.bda) {
      parts.push('BDA (SALT-R)');
      window.REF.bdaFields.forEach(f => { if (all.bda[f.key]) parts.push('• ' + f.label + ': ' + en(all.bda[f.key])); });
    }

    const text = parts.join('\n');
    pre.textContent = text || pre.dataset.blank || '';
    pre.dataset.plain = text || '';
    pre.classList.toggle('blank', !text);
  }

  function init() {
    document.getElementById('casflow-prev').addEventListener('click', () => { if (current > 0) { current--; renderStep(); } });
    document.getElementById('casflow-next').addEventListener('click', () => { if (current < STEPS.length - 1) { current++; renderStep(); } });
    document.getElementById('casflow-copy').addEventListener('click', () => {
      const pre = document.getElementById('casflow-preview');
      window.App.copy(pre.dataset.plain || pre.textContent);
    });
    renderStep();
  }

  window.JTCasFlow = { init, renderStep, renderPreview, current: () => current };
})();
