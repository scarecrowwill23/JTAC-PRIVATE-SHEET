// ============================================================
// JTAC Private Sheet – Referenzen
// Tabs: Brevity · 12 Schritte · Danger Close · Höhen/Keyhole ·
// Airframes · Funk · Verfahren
// ============================================================

(function () {
  'use strict';

  const TABS = [
    { id: 'brevity', label: 'Brevity' },
    { id: 'steps', label: '12 Schritte CAS' },
    { id: 'dangerclose', label: 'Danger Close' },
    { id: 'altitude', label: 'Höhen & Keyhole' },
    { id: 'airframes', label: 'Airframes' },
    { id: 'radio', label: 'Funk' },
    { id: 'procedures', label: 'Verfahren' }
  ];
  let current = 'brevity';

  function renderTabs() {
    const root = document.getElementById('refs-tabs');
    root.innerHTML = '';
    TABS.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'tab' + (t.id === current ? ' active' : '');
      btn.textContent = t.label;
      btn.addEventListener('click', () => { current = t.id; renderTabs(); renderContent(); });
      root.appendChild(btn);
    });
  }

  function renderContent() {
    const root = document.getElementById('refs-root');
    root.innerHTML = '';
    root.className = 'refs-grid';
    const R = window.REF;

    switch (current) {
      case 'brevity': renderBrevity(root, R); break;
      case 'steps': renderSteps(root, R); break;
      case 'dangerclose': renderDangerClose(root, R); break;
      case 'altitude': renderAltitude(root, R); break;
      case 'airframes': renderAirframes(root, R); break;
      case 'radio': renderRadio(root, R); break;
      case 'procedures': renderProcedures(root, R); break;
    }
  }

  // ---------- Brevity ----------
  function renderBrevity(root, R) {
    const wrap = document.createElement('div');
    wrap.style.gridColumn = '1 / -1';
    const input = document.createElement('input');
    input.className = 'input mono';
    input.type = 'text';
    input.placeholder = 'Brevity durchsuchen … z. B. „lase", „sparkle", „type 3"';
    wrap.appendChild(input);
    root.appendChild(wrap);

    const cats = [...new Set(R.brevity.map(b => b.cat))];
    cats.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'ref-card';
      const h = document.createElement('h2');
      h.textContent = cat;
      card.appendChild(h);
      const ul = document.createElement('ul');
      ul.id = 'brevity-' + cat;
      card.appendChild(ul);
      root.appendChild(card);
    });

    const renderList = (q) => {
      q = (q || '').toLowerCase();
      cats.forEach(cat => {
        const ul = document.getElementById('brevity-' + cat);
        ul.innerHTML = '';
        R.brevity
          .filter(b => b.cat === cat)
          .filter(b => !q || b.code.toLowerCase().includes(q) || b.text.toLowerCase().includes(q))
          .forEach(b => {
            const li = document.createElement('li');
            const code = document.createElement('b');
            code.textContent = b.code;
            li.appendChild(code);
            li.appendChild(document.createTextNode(' – ' + b.text));
            ul.appendChild(li);
          });
      });
    };
    renderList('');
    input.addEventListener('input', () => renderList(input.value));
  }

  // ---------- 12 Schritte ----------
  function renderSteps(root, R) {
    R.casSteps.forEach(s => {
      const card = document.createElement('div');
      card.className = 'ref-card';
      const h = document.createElement('h2');
      h.textContent = `${s.n}. ${s.title}`;
      card.appendChild(h);
      const p = document.createElement('p');
      p.style.margin = '0';
      p.textContent = s.body;
      card.appendChild(p);
      root.appendChild(card);
    });
  }

  // ---------- Danger Close ----------
  function renderDangerClose(root, R) {
    const dc = R.dangerClose;
    const card = document.createElement('div');
    card.className = 'ref-card';
    card.style.gridColumn = '1 / -1';
    const h = document.createElement('h2');
    h.textContent = 'Danger Close – Übersicht';
    card.appendChild(h);
    const note = document.createElement('p');
    note.style.margin = '0 0 10px';
    note.textContent = dc.note;
    card.appendChild(note);

    dc.groups.forEach(g => {
      const gh = document.createElement('h3');
      gh.textContent = g.name;
      gh.style.margin = '14px 0 6px';
      card.appendChild(gh);
      const t = document.createElement('table');
      const trh = document.createElement('tr');
      ['Waffe', 'Lenkung', 'Danger Close'].forEach(x => {
        const th = document.createElement('th'); th.textContent = x; trh.appendChild(th);
      });
      t.appendChild(trh);
      g.items.forEach(it => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td'); td1.textContent = it.w;
        const td2 = document.createElement('td'); td2.textContent = it.g;
        const td3 = document.createElement('td'); td3.textContent = it.d ? it.d + ' m' : '–';
        [td1, td2, td3].forEach(td => tr.appendChild(td));
        t.appendChild(tr);
      });
      card.appendChild(t);
    });
    root.appendChild(card);
  }

  // ---------- Höhen & Keyhole ----------
  function renderAltitude(root, R) {
    const card = document.createElement('div');
    card.className = 'ref-card';
    const h = document.createElement('h2');
    h.textContent = 'Keyhole & Altitude Blocks';
    card.appendChild(h);
    const t = document.createElement('table');
    const trh = document.createElement('tr');
    ['Block', 'Höhe', 'Referenz'].forEach(x => {
      const th = document.createElement('th'); th.textContent = x; trh.appendChild(th);
    });
    t.appendChild(trh);
    R.altitudeBlocks.forEach(b => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td'); td1.textContent = 'Block ' + b.block;
      const td2 = document.createElement('td'); td2.textContent = b.alt;
      const td3 = document.createElement('td'); td3.textContent = b.ref;
      [td1, td2, td3].forEach(td => tr.appendChild(td));
      t.appendChild(tr);
    });
    card.appendChild(t);
    const ul = document.createElement('ul');
    ul.style.marginTop = '12px';
    R.keyhole.forEach(k => {
      const li = document.createElement('li'); li.textContent = k; ul.appendChild(li);
    });
    card.appendChild(ul);
    root.appendChild(card);
  }

  // ---------- Airframes ----------
  function renderAirframes(root, R) {
    const groups = [
      ['Transport Variants', R.airframes.transport],
      ['Close Air Support Variants', R.airframes.cas],
      ['Other Airframes', R.airframes.other]
    ];
    groups.forEach(([title, list]) => {
      const card = document.createElement('div');
      card.className = 'ref-card';
      card.style.gridColumn = '1 / -1';
      const h = document.createElement('h2');
      h.textContent = title;
      card.appendChild(h);
      list.forEach(a => {
        const box = document.createElement('div');
        box.style.cssText = 'border:1px solid var(--border);border-radius:6px;padding:10px 12px;margin-bottom:10px;background:var(--bg)';
        const cs = document.createElement('div');
        cs.innerHTML = `<b style="color:var(--accent-2);font-family:var(--mono)">${a.cs}</b>  <span style="font-weight:700">${a.name}</span>`;
        box.appendChild(cs);
        const info = document.createElement('div');
        info.style.cssText = 'font-size:12.5px;color:var(--text-dim);margin-top:4px;line-height:1.5';
        info.textContent = a.info;
        box.appendChild(info);
        const feat = document.createElement('div');
        feat.style.cssText = 'font-size:12px;margin-top:4px';
        feat.innerHTML = '<span style="color:var(--text-dim)">Features:</span> ' + a.feat;
        box.appendChild(feat);
        const crew = document.createElement('div');
        crew.style.cssText = 'font-size:12px;margin-top:2px';
        crew.innerHTML = '<span style="color:var(--text-dim)">Crew:</span> ' + a.crew;
        box.appendChild(crew);
        card.appendChild(box);
      });
      root.appendChild(card);
    });
  }

  // ---------- Funk ----------
  function renderRadio(root, R) {
    const card = document.createElement('div');
    card.className = 'ref-card';
    card.style.gridColumn = '1 / -1';
    const h = document.createElement('h2');
    h.textContent = 'Funkgeräte (TFW 18E)';
    card.appendChild(h);
    const t = document.createElement('table');
    const trh = document.createElement('tr');
    ['Gerät', 'Leistung', 'Band', 'Reichweite', 'Hinweis'].forEach(x => {
      const th = document.createElement('th'); th.textContent = x; trh.appendChild(th);
    });
    t.appendChild(trh);
    R.radios.forEach(r => {
      const tr = document.createElement('tr');
      [r.name, r.power, r.range, r.dist, r.note].forEach(v => {
        const td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
      });
      t.appendChild(tr);
    });
    card.appendChild(t);
    root.appendChild(card);

    // Funketikette
    const card2 = document.createElement('div');
    card2.className = 'ref-card';
    const h2 = document.createElement('h2');
    h2.textContent = 'Funketikette';
    card2.appendChild(h2);
    const ul = document.createElement('ul');
    R.radioEtiquette.forEach(e => { const li = document.createElement('li'); li.textContent = e; ul.appendChild(li); });
    card2.appendChild(ul);
    root.appendChild(card2);

    // PACE
    const card3 = document.createElement('div');
    card3.className = 'ref-card';
    const h3 = document.createElement('h2');
    h3.textContent = 'PACE-Plan';
    card3.appendChild(h3);
    card3.appendChild(table(R.pace));
    root.appendChild(card3);

    // Phonetik
    const card4 = document.createElement('div');
    card4.className = 'ref-card';
    const h4 = document.createElement('h2');
    h4.textContent = 'NATO-Phonetik';
    card4.appendChild(h4);
    const pt = document.createElement('table');
    for (let i = 0; i < R.phonetic.length; i += 2) {
      const tr = document.createElement('tr');
      const a1 = R.phonetic[i], a2 = R.phonetic[i + 1];
      const td1 = document.createElement('td'); td1.textContent = a1[0] + ' → ' + a1[1];
      const td2 = document.createElement('td'); td2.textContent = a2 ? a2[0] + ' → ' + a2[1] : '';
      tr.appendChild(td1); tr.appendChild(td2);
      pt.appendChild(tr);
    }
    card4.appendChild(pt);
    const h5 = document.createElement('h2');
    h5.textContent = 'Zahlen';
    card4.appendChild(h5);
    card4.appendChild(table(R.numbers));
    root.appendChild(card4);
  }

  // ---------- Verfahren ----------
  function renderProcedures(root, R) {
    const ir = document.createElement('div');
    ir.className = 'ref-card';
    const h = document.createElement('h2');
    h.textContent = 'IR-Pointer-Prozedur (Sparkle)';
    ir.appendChild(h);
    const ul = document.createElement('ul');
    R.procedures.irPointer.forEach(s => { const li = document.createElement('li'); li.textContent = s; ul.appendChild(li); });
    ir.appendChild(ul);
    root.appendChild(ir);

    const las = document.createElement('div');
    las.className = 'ref-card';
    const h2 = document.createElement('h2');
    h2.textContent = 'Laser-Prozeduren';
    las.appendChild(h2);
    const ul2 = document.createElement('ul');
    R.procedures.laser.forEach(s => { const li = document.createElement('li'); li.textContent = s; ul2.appendChild(li); });
    las.appendChild(ul2);
    root.appendChild(las);

    const smk = document.createElement('div');
    smk.className = 'ref-card';
    const h3 = document.createElement('h2');
    h3.textContent = 'Rauch-Markierung';
    smk.appendChild(h3);
    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = 'KEIN weißer Rauch für Zielmarkierung verwenden. Farbe beim Mark nicht durchgeben – der Pilot bestätigt die Farbe bei „Tally" selbst.';
    smk.appendChild(p);
    root.appendChild(smk);

    const dc = document.createElement('div');
    dc.className = 'ref-card';
    const h4 = document.createElement('h2');
    h4.textContent = 'Marking & Terminal Guidance (9-Line Z.7)';
    dc.appendChild(h4);
    const ul3 = document.createElement('ul');
    [
      'Laser-Designator: Laser-Code im Brief angeben (z. B. Lase 1688).',
      'LTL (Laser-to-Target-Line): Richtung des Lasers in Grad/Kardinal.',
      'IR-Pointer (SPARKLE): Ziel mit IR markieren; „Snake" zum Oszillieren.',
      'Rauch: Farbe nicht nennen; Pilot bestätigt Farbe bei Tally.',
      'GPS/VDL: Koordinaten digital übermitteln (8–10-stellig).'
    ].forEach(s => { const li = document.createElement('li'); li.textContent = s; ul3.appendChild(li); });
    dc.appendChild(ul3);
    root.appendChild(dc);
  }

  function table(rows) {
    const t = document.createElement('table');
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      r.forEach(v => {
        const td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      t.appendChild(tr);
    });
    return t;
  }

  function render() {
    renderTabs();
    renderContent();
  }

  window.JTRefs = { render };
})();
