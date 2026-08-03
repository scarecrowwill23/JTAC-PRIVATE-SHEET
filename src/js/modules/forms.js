// ============================================================
// JTAC Private Sheet – 9-Line Formulare (CAS + MEDEVAC)
// Live-Vorschau, Auto-Speicherung (localStorage), Copy-Button.
// ============================================================

(function () {
  'use strict';

  const LS = { cas: 'jtac.cas', medevac: 'jtac.medevac' };

  function buildLineRow(lineDef, value, opts = {}) {
    const div = document.createElement('div');
    div.className = 'field-row align';
    div.dataset.line = lineDef.line;

    const badge = document.createElement('span');
    badge.className = 'line-badge';
    badge.textContent = lineDef.line;

    const grow = document.createElement('div');
    grow.className = 'field grow';

    const label = document.createElement('label');
    label.className = 'field-label';
    label.textContent = `${lineDef.short} – ${lineDef.label}`;
    if (lineDef.help) label.title = lineDef.help;

    let input;
    if (opts.selectOptions) {
      input = document.createElement('select');
      input.className = 'select';
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = opts.placeholder || '— auswählen —';
      input.appendChild(ph);
      opts.selectOptions.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        input.appendChild(opt);
      });
    } else if (opts.numberInputs) {
      // mehrere kleine Zahlenfelder (z. B. Medevac Prioritäten)
      input = document.createElement('div');
      input.className = 'numgroup';
      opts.numberInputs.forEach(ni => {
        const wrap = document.createElement('span');
        wrap.className = 'numwrap';
        const lab = document.createElement('span');
        lab.className = 'numlab';
        lab.textContent = ni.code;
        lab.title = ni.label;
        const num = document.createElement('input');
        num.className = 'input num';
        num.type = 'text';
        num.inputMode = 'numeric';
        num.placeholder = '0';
        num.dataset.numKey = ni.code;
        num.value = (value && value[ni.code] !== undefined) ? value[ni.code] : '';
        wrap.appendChild(lab);
        wrap.appendChild(num);
        input.appendChild(wrap);
      });
      div.dataset.nums = '1';   // Markierung: Zahlenfeld-Gruppe, kein Einzel-Input
      label.textContent = `${lineDef.short} – ${lineDef.label}`;
      grow.appendChild(label);
      grow.appendChild(input);
      div.appendChild(badge);
      div.appendChild(grow);
      return div;
    } else {
      input = document.createElement('input');
      input.className = 'input mono';
      input.type = 'text';
      input.placeholder = opts.placeholder || lineDef.ph || '';
      input.title = lineDef.help || '';
      input.value = value || '';
      if (opts.list) input.setAttribute('list', opts.list);
    }

    grow.appendChild(label);
    grow.appendChild(input);
    div.appendChild(badge);
    div.appendChild(grow);
    return div;
  }

  /** Formular für CAS oder MEDEVAC bauen. */
  function initForm(containerId, lines, opts) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = '';

    const form = { rows: {}, els: {} };
    lines.forEach(ld => {
      const value = opts.load()[ld.key];
      let row;
      if (opts.special && opts.special[ld.key]) {
        row = opts.special[ld.key](ld, value);
      } else {
        row = buildLineRow(ld, value, opts.fieldOpts && opts.fieldOpts[ld.key] || {});
      }
      container.appendChild(row);
      form.rows[ld.key] = row;
      // Zeilen mit Zahlenfeldern (data-nums) haben kein einzelnes Eingabeelement
      if (!row.dataset.nums) {
        const input = row.querySelector('.input, .select');
        if (input) form.els[ld.key] = input;
      }
    });

    // Live-Update
    container.addEventListener('input', () => {
      opts.onChange(getValues());
      opts.save(getValues());
    });
    container.addEventListener('change', () => {
      opts.onChange(getValues());
      opts.save(getValues());
    });

    function getValues() {
      const v = {};
      lines.forEach(ld => {
        const el = form.els[ld.key];
        if (el) {
          v[ld.key] = el.value.trim();
        } else {
          const nums = form.rows[ld.key].querySelectorAll('input[data-num-key]');
          if (nums.length) {
            const o = {};
            nums.forEach(n => { o[n.dataset.numKey] = n.value.trim(); });
            v[ld.key] = o;
          }
        }
      });
      return v;
    }

    return { getValues, setValues(values) { applyValues(values); } };

    function applyValues(values) {
      lines.forEach(ld => {
        const el = form.els[ld.key];
        const val = values[ld.key];
        if (el) {
          if (el.value !== (val || '')) el.value = val || '';
        } else {
          const nums = form.rows[ld.key].querySelectorAll('input[data-num-key]');
          nums.forEach(n => { n.value = (val && val[n.dataset.numKey]) || ''; });
        }
      });
      opts.onChange(getValues());
    }
  }

  /** Vorschau-Text für einen Linien-Satz erzeugen. */
  function buildPreview(lines, values, opts = {}) {
    const out = [];
    lines.forEach(ld => {
      let v = values[ld.key];
      if (!v || (typeof v === 'object' && Object.keys(v).every(k => !v[k]))) return;
      if (typeof v === 'object') {
        const parts = Object.keys(v).filter(k => v[k]);
        if (!parts.length) return;
        v = parts.map(k => `${k}:${v[k]}`).join(' ');
      }
      out.push(`${ld.line}. ${ld.short}: ${v}`);
    });
    if (opts.header && out.length) out.unshift(opts.header);
    return out.join('\n');
  }

  /** Badges „erledigt" setzen. */
  function updateBadges(formEl, values, requiredKeys) {
    formEl.querySelectorAll('.field-row.align').forEach(row => {
      const line = row.dataset.line;
      const badge = row.querySelector('.line-badge');
      if (!badge || !line) return;
      const key = requiredKeys[line];
      let filled = false;
      if (key) {
        const v = values[key];
        filled = v && (typeof v !== 'object' || Object.values(v).some(Boolean));
      }
      badge.classList.toggle('done', filled);
    });
  }

  window.JTForms = {
    LS, initForm, buildLineRow, buildPreview, updateBadges
  };
})();
