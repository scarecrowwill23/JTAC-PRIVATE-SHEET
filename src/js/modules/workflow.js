// ============================================================
// JTAC Private Sheet – 12-Schritte-CAS Workflow
// Geführter Ablauf: Check-in → SITREP (TEFACHR) → Game Plan →
// Brief → Remarks → BDA; sammelt alles in einem Funkspruch.
// ============================================================

(function () {
  'use strict';

  const LS = 'jtac.casflow';
  const STEPS = window.REF.casSteps;
  let current = 0;
  let forms = {}; // step.form -> Form
  let session = {}; // In-Memory: nichts vom letzten Einsatz beim App-Start

  function load() {
    return session;
  }
  function save(v) { session = v; }

  function buildStepForm(step) {
    const container = document.getElementById('casflow-form');
    container.innerHTML = '';
    if (!step.form) return;
    if (step.form === 'brief') { buildBriefPicker(); return; }

    const FIELDS = {
      checkin: { def: { name: 'Check-in', lines: window.REF.checkinFields.map((f, i) => ({ n: i + 1, key: f.key, short: f.label.split(' ')[0], label: f.label, ph: f.ph, help: f.help })) }, header: 'CAS Check-in' },
      tefachr: { def: { name: 'SITREP', lines: window.REF.tefachrFields.map((f, i) => ({ n: i + 1, key: f.key, short: f.label.split(' ')[0], label: f.label, ph: f.ph, help: f.help })) }, header: 'Situation Update (TEFACHR)' },
      gameplan: { def: { name: 'Game Plan', lines: window.REF.gameplanFields.map((f, i) => ({ n: i + 1, key: f.key, short: f.short || f.label.split(' ')[0], label: f.label, ph: f.ph, select: f.select, help: f.help })) }, header: 'Game Plan' },
      remarks: { def: { name: 'Remarks', lines: window.REF.remarksFields.map((f, i) => ({ n: i + 1, key: f.key, short: f.label.split(' ')[0], label: f.label, ph: f.ph, help: f.help })) }, header: 'Remarks & Restrictions' },
      bda: { def: { name: 'BDA', lines: window.REF.bdaFields.map((f, i) => ({ n: i + 1, key: f.key, short: f.label, label: f.label, ph: f.ph })) }, header: 'BDA (SALT-R)' }
    };

    const cfg = FIELDS[step.form];
    const all = load();
    forms[step.form] = window.JTForms.initBriefForm('casflow-form', cfg.def, {
      load: () => all[step.form] || {},
      save: (v) => { const d = load(); d[step.form] = v; save(d); },
      onChange: renderPreview
    });
  }

  function renderStep() {
    const step = STEPS[current];
    document.getElementById('casflow-title').textContent = `Schritt ${step.n}: ${step.title}`;
    document.getElementById('casflow-body').textContent = step.body;
    buildStepForm(step);

    // Stepper
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
    const p = window.JTProfiles.getActive();
    const all = load();

    if (all.checkin) {
      const c = all.checkin;
      parts.push(`CAS CHECK-IN (${p.jtac || 'JTAC'})`);
      window.REF.checkinFields.forEach(f => { if (c[f.key]) parts.push(`• ${f.label}: ${c[f.key]}`); });
    }
    if (all.tefachr) {
      const t = all.tefachr;
      parts.push(`SITREP (${p.jtac || 'JTAC'})`);
      window.REF.tefachrFields.forEach(f => { if (t[f.key]) parts.push(`• ${f.label}: ${t[f.key]}`); });
    }
    if (all.gameplan) {
      const g = all.gameplan;
      parts.push('GAME PLAN');
      window.REF.gameplanFields.forEach(f => { if (g[f.key]) parts.push(`• ${f.label}: ${g[f.key]}`); });
    }
    if (all.brief) {
      const b = all.brief;
      parts.push('CAS BRIEF');
      if (b.type === 'cas9') {
        parts.push(`${p.jtac || 'JTAC'} – 9-Line, ready to copy.`);
        window.REF.cas9.lines.forEach(l => { if (b[l.key]) parts.push(`${l.n}. ${l.short}: ${b[l.key]}`); });
      } else if (b.type === 'cas5') {
        parts.push(`${p.jtac || 'JTAC'} – 5-Line, über.`);
        window.REF.cas5.lines.forEach(l => { if (b[l.key]) parts.push(`${l.n}. ${l.short}: ${b[l.key]}`); });
      }
    }
    if (all.remarks) {
      const r = all.remarks;
      parts.push('REMARKS & RESTRICTIONS');
      window.REF.remarksFields.forEach(f => { if (r[f.key]) parts.push(`• ${f.label}: ${r[f.key]}`); });
    }
    if (all.bda) {
      const d = all.bda;
      parts.push('BDA (SALT-R)');
      window.REF.bdaFields.forEach(f => { if (d[f.key]) parts.push(`• ${f.label}: ${d[f.key]}`); });
    }

    const text = parts.join('\n');
    pre.textContent = text || pre.dataset.blank || '';
    pre.dataset.plain = text || '';
    pre.classList.toggle('blank', !text);
  }

  /** Mini-Brief-Auswahl für Schritt 5 (9-Line vs 5-Line). */
  function buildBriefPicker() {
    const container = document.getElementById('casflow-form');
    container.innerHTML = '';
    const all = load();
    const b = all.brief || {};

    const row = document.createElement('div');
    row.className = 'field-row';
    const typeField = document.createElement('div');
    typeField.className = 'field';
    const lbl = document.createElement('label');
    lbl.className = 'field-label';
    lbl.textContent = 'Brief-Typ';
    const sel = document.createElement('select');
    sel.className = 'select';
    [['cas9', '9-Line CAS (Fixed-Wing)'], ['cas5', '5-Line CAS (Rotary / AC-130)']].forEach(([v, t]) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = t; sel.appendChild(o);
    });
    sel.value = b.type || 'cas9';
    typeField.appendChild(lbl); typeField.appendChild(sel);
    row.appendChild(typeField);
    container.appendChild(row);

    const def = window.REF[b.type === 'cas5' ? 'cas5' : 'cas9'];
    const sub = document.createElement('div');
    sub.id = 'casflow-brief-sub';
    container.appendChild(sub);

    const renderSub = () => {
      sub.innerHTML = '';
      const subForm = window.JTForms.initBriefForm('casflow-brief-sub', def, {
        load: () => b,
        save: (v) => { const d = load(); d.brief = { ...b, ...v, type: sel.value }; save(d); },
        onChange: renderPreview
      });
      forms.brief = subForm;
    };
    renderSub();
    sel.addEventListener('change', () => {
      const d = load();
      d.brief = { ...b, type: sel.value };
      save(d);
      renderStep();
      renderPreview();
    });
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
