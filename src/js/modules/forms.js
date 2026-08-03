// ============================================================
// JTAC Private Sheet – Generischer Brief-Formular-Builder
// Unterstützt Textfelder, Selects, Zahlengruppen (z. B. Patienten)
// und Pflicht-Readback-Kennzeichnung (rb).
// ============================================================

(function () {
  'use strict';

  const LS = { cas9: 'jtac.cas9', cas5: 'jtac.cas5', medevac: 'jtac.medevac', gunship: 'jtac.gunship',
               cca: 'jtac.cca', rpas: 'jtac.rpas', hlz: 'jtac.hlz', alz: 'jtac.alz',
               airdrop: 'jtac.airdrop', cff: 'jtac.cff' };

  /** Eine Formularzeile aus einem Feld-Def bauen. */
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
    if (def.rb) labelText += '  ⚠ READBACK';
    label.textContent = labelText;
    if (def.help) label.title = def.help;
    grow.appendChild(label);

    // Gruppen-Feld (Zahlenfelder)
    if (def.group) {
      const group = document.createElement('div');
      group.className = 'numgroup';
      def.group.forEach(g => {
        const wrap = document.createElement('span');
        wrap.className = 'numwrap';
        const lab = document.createElement('span');
        lab.className = 'numlab';
        lab.textContent = g.code;
        lab.title = g.label;
        const num = document.createElement('input');
        num.className = 'input num';
        num.type = 'text';
        num.inputMode = 'numeric';
        num.placeholder = '0';
        num.dataset.gk = g.code;
        num.value = (value && value[g.code] !== undefined) ? value[g.code] : '';
        wrap.appendChild(lab);
        wrap.appendChild(num);
        group.appendChild(wrap);
      });
      div.dataset.nums = '1';
      grow.appendChild(group);
    }
    // Select-Feld
    else if (def.select) {
      const sel = document.createElement('select');
      sel.className = 'select';
      const ph = document.createElement('option');
      ph.value = '';
      ph.textContent = '— auswählen —';
      sel.appendChild(ph);
      def.select.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.v;
        opt.textContent = o.t;
        sel.appendChild(opt);
      });
      sel.value = value || '';
      grow.appendChild(sel);
    }
    // Textfeld
    else {
      const input = document.createElement('input');
      input.className = 'input mono';
      input.type = 'text';
      input.placeholder = def.ph || '';
      input.title = def.help || '';
      input.value = value || '';
      if (def.list) input.setAttribute('list', def.list);
      grow.appendChild(input);
    }

    div.appendChild(badge);
    div.appendChild(grow);
    return div;
  }

  /**
   * Formular aus einer Brief-Definition bauen.
   * def = { name, lines: [{n,key,label,short,ph,help,rb,group,select}] }
   */
  function initBriefForm(containerId, def, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = '';

    const form = { rows: {}, els: {} };
    def.lines.forEach(ld => {
      const value = opts.load()[ld.key];
      const row = buildLineRow(ld, value);
      container.appendChild(row);
      form.rows[ld.key] = row;
      if (!row.dataset.nums) {
        const input = row.querySelector('.input, .select');
        if (input) form.els[ld.key] = input;
      }
    });

    container.addEventListener('input', onUpdate);
    container.addEventListener('change', onUpdate);

    function getValues() {
      const v = {};
      def.lines.forEach(ld => {
        const el = form.els[ld.key];
        if (el) {
          v[ld.key] = el.value.trim();
        } else {
          const nums = form.rows[ld.key].querySelectorAll('input[data-gk]');
          if (nums.length) {
            const o = {};
            nums.forEach(n => { o[n.dataset.gk] = n.value.trim(); });
            v[ld.key] = o;
          }
        }
      });
      return v;
    }

    function setValues(values) {
      def.lines.forEach(ld => {
        const el = form.els[ld.key];
        const val = values[ld.key];
        if (el) {
          if (el.value !== (val || '')) el.value = val || '';
        } else {
          const nums = form.rows[ld.key].querySelectorAll('input[data-gk]');
          nums.forEach(n => { n.value = (val && val[n.dataset.gk]) || ''; });
        }
      });
      onUpdate();
    }

    function onUpdate() {
      const v = getValues();
      opts.onChange(v);
      opts.save(v);
      // Badges „erledigt"
      def.lines.forEach(ld => {
        const row = form.rows[ld.key];
        if (!row) return;
        const badge = row.querySelector('.line-badge');
        if (!badge) return;
        let filled = false;
        const val = v[ld.key];
        if (val !== undefined && val !== null) {
          filled = typeof val === 'object' ? Object.values(val).some(Boolean) : String(val).trim() !== '';
        }
        badge.classList.toggle('done', filled);
      });
    }

    return { getValues, setValues, onUpdate };
  }

  /** Funkspruch-Text aus Werten bauen. */
  function buildPreview(def, values, opts = {}) {
    const out = [];
    def.lines.forEach(ld => {
      let v = values[ld.key];
      if (v === undefined || v === null) return;
      if (typeof v === 'object') {
        const parts = Object.keys(v).filter(k => v[k]);
        if (!parts.length) return;
        v = parts.map(k => `${k}:${v[k]}`).join(' ');
      }
      v = String(v).trim();
      if (!v) return;
      out.push(`${ld.n}. ${ld.short || ld.n}: ${v}`);
    });
    if (opts.header && out.length) out.unshift(opts.header);
    return out.join('\n');
  }

  /** Kurzen Readback-Hinweis erzeugen. */
  function readbackHint(def) {
    const rb = def.lines.filter(l => l.rb).map(l => l.n).join(', ');
    return rb ? '⚠ Pflicht-Readback: Zeile ' + rb : '';
  }

  window.JTForms = { LS, initBriefForm, buildPreview, readbackHint };
})();
