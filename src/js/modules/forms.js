// ============================================================
// JTAC Helper – Generischer Brief-Formular-Builder
// - Zeilen mit mehreren Sub-Feldern (fields: text/select/num)
// - Pflicht-Readback-Kennzeichnung (rb)
// - Satz-Output: baut vorlesbare Funksprüche aus den Formaten
// ============================================================

(function () {
  'use strict';

  const LS = { cas9: 'jtac.cas9', cas5: 'jtac.cas5', medevac: 'jtac.medevac', gunship: 'jtac.gunship',
               cca: 'jtac.cca', rpas: 'jtac.rpas', hlz: 'jtac.hlz', alz: 'jtac.alz',
               airdrop: 'jtac.airdrop', cff: 'jtac.cff' };

  /** Ein Sub-Feld bauen (text / select / num). */
  function buildField(f, value) {
    const wrap = document.createElement('div');
    wrap.className = 'subfield';
    if (f.width) wrap.style.flex = `0 0 ${f.width}`;

    const label = document.createElement('label');
    label.className = 'field-label sub';
    label.textContent = f.label || '';
    wrap.appendChild(label);

    if (f.type === 'select') {
      const sel = document.createElement('select');
      sel.className = 'select';
      sel.dataset.fk = f.key;
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = f.ph || '—';
      sel.appendChild(ph);
      (f.options || []).forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.t;
        sel.appendChild(opt);
      });
      sel.value = value || '';
      wrap.appendChild(sel);
    } else if (f.type === 'num') {
      const num = document.createElement('input');
      num.className = 'input num mono';
      num.type = 'text';
      num.inputMode = 'numeric';
      num.placeholder = '0';
      num.dataset.fk = f.key;
      num.value = value || '';
      wrap.appendChild(num);
    } else {
      const input = document.createElement('input');
      input.className = 'input mono';
      input.type = 'text';
      input.placeholder = f.ph || '';
      input.dataset.fk = f.key;
      input.value = value || '';
      if (f.list) input.setAttribute('list', f.list);
      if (!f.mono) input.classList.remove('mono');
      wrap.appendChild(input);
    }
    return wrap;
  }

  /** Eine Formularzeile aus einem Line-Def bauen. */
  function buildLineRow(def, value) {
    const div = document.createElement('div');
    div.className = 'field-row align' + (def.rb ? ' rb' : '');
    div.dataset.line = def.n;

    const badge = document.createElement('span');
    badge.className = 'line-badge' + (def.rb ? ' rb' : '');
    badge.textContent = def.n;
    if (def.rb) badge.title = 'MANDATORY READBACK';

    const grow = document.createElement('div');
    grow.className = 'field grow';

    const label = document.createElement('label');
    label.className = 'field-label';
    let labelText = `${def.short || def.n} – ${def.label}`;
    if (def.rb) labelText += '  ⚠';
    label.textContent = labelText;
    grow.appendChild(label);

    // Sub-Felder (mehrere pro Zeile)
    if (def.fields) {
      const rowInner = document.createElement('div');
      rowInner.className = 'subfields';
      def.fields.forEach(f => {
        const v = value && typeof value === 'object' ? value[f.key] : '';
        rowInner.appendChild(buildField(f, v));
      });
      grow.appendChild(rowInner);
    } else if (def.select) {
      const sel = document.createElement('select');
      sel.className = 'select';
      const ph = document.createElement('option');
      ph.value = ''; ph.textContent = '— auswählen —';
      sel.appendChild(ph);
      def.select.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v; opt.textContent = o.t;
        sel.appendChild(opt);
      });
      sel.value = value || '';
      grow.appendChild(sel);
    } else {
      const input = document.createElement('input');
      input.className = 'input mono';
      input.type = 'text';
      input.placeholder = def.ph || '';
      input.value = value || '';
      input.dataset.fk = def.key;
      if (def.list) input.setAttribute('list', def.list);
      grow.appendChild(input);
    }

    div.appendChild(badge);
    div.appendChild(grow);
    return div;
  }

  /** Wert einer Zeile lesen (Objekt bei fields, sonst String). */
  function readLineValue(row, def) {
    if (def.fields) {
      const v = {};
      row.querySelectorAll('[data-fk]').forEach(el => { v[el.dataset.fk] = el.value.trim(); });
      return v;
    }
    const input = row.querySelector('.input, .select');
    return input ? input.value.trim() : '';
  }

  /** Formular bauen. def = { name, lines: [...] }. */
  function initBriefForm(containerId, def, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = '';

    const rows = {};
    def.lines.forEach(ld => {
      const value = (opts.load() || {})[ld.key];
      const row = buildLineRow(ld, value);
      container.appendChild(row);
      rows[ld.key] = row;
    });

    container.addEventListener('input', onUpdate);
    container.addEventListener('change', onUpdate);

    function getValues() {
      const v = {};
      def.lines.forEach(ld => { v[ld.key] = readLineValue(rows[ld.key], ld); });
      return v;
    }

    function setValues(values) {
      def.lines.forEach(ld => {
        const val = (values || {})[ld.key];
        const row = rows[ld.key];
        if (!row) return;
        if (ld.fields) {
          row.querySelectorAll('[data-fk]').forEach(el => {
            el.value = (val && val[el.dataset.fk]) || '';
          });
        } else {
          const input = row.querySelector('.input, .select');
          if (input && input.value !== (val || '')) input.value = val || '';
        }
      });
      onUpdate();
    }

    function clear() {
      def.lines.forEach(ld => {
        const row = rows[ld.key];
        if (!row) return;
        row.querySelectorAll('[data-fk], .input, .select').forEach(el => { el.value = ''; });
      });
      onUpdate();
    }

    function onUpdate() {
      const v = getValues();
      if (opts.onChange) opts.onChange(v);
      if (opts.save) opts.save(v);
      // Badges „erledigt"
      def.lines.forEach(ld => {
        const row = rows[ld.key];
        const badge = row && row.querySelector('.line-badge');
        if (!badge) return;
        const val = v[ld.key];
        let filled = false;
        if (val && typeof val === 'object') filled = Object.values(val).some(x => String(x).trim() !== '');
        else filled = val && String(val).trim() !== '';
        badge.classList.toggle('done', filled);
      });
    }

    return { getValues, setValues, clear, onUpdate };
  }

  /**
   * Vorlesbaren Funkspruch bauen (Satz-Output).
   * def: Format-Definition; values: {lineKey: wert, pilot?}; ctx: {profile}
   */
  function buildScript(def, values, ctx) {
    const profile = (ctx && ctx.profile) || {};
    const pilot = (values && values.pilot) || profile.cas || 'Pilot';
    const jtac = profile.jtac || 'JTAC';
    const lines = [];

    def.lines.forEach(ld => {
      const v = values ? values[ld.key] : undefined;
      if (v === undefined || v === null) return;
      const sentence = ld.sent ? ld.sent(v, { all: values, profile, pilot, jtac }) : null;
      if (sentence && String(sentence).trim()) lines.push(String(sentence).trim());
    });

    if (!lines.length) return '';

    const intro = def.intro ? def.intro({ pilot, jtac, profile }) : [];
    return [...intro, ...lines].join('\n');
  }

  /** Pflicht-Readback-Zeilen als Liste (für Abhaken). */
  function readbackLines(def) {
    return def.lines.filter(l => l.rb).map(l => ({ n: l.n, key: l.key, label: l.label }));
  }

  function readbackHint(def) {
    const rb = readbackLines(def).map(r => r.n);
    return rb.length ? '⚠ Pflicht-Readback: Zeile ' + rb.join(', ') : '';
  }

  window.JTForms = { LS, initBriefForm, buildScript, readbackLines, readbackHint };
})();
