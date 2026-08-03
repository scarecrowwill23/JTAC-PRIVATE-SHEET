// ============================================================
// JTAC Private Sheet – Referenzen
// Abkürzungen/Brevity (durchsuchbar), CAS-Ablauf, 5er/6er-Line.
// Wird mit Inhalten aus den PDFs erweitert.
// ============================================================

(function () {
  'use strict';

  function render() {
    const root = document.getElementById('refs-root');
    if (!root) return;
    root.innerHTML = '';

    // Suche
    const searchWrap = document.createElement('div');
    searchWrap.className = 'form';
    searchWrap.style.gridColumn = '1 / -1';
    const input = document.createElement('input');
    input.className = 'input mono';
    input.type = 'text';
    input.id = 'brevity-search';
    input.placeholder = 'Brevity durchsuchen … z. B. „lase", „hold", „target"';
    searchWrap.appendChild(input);
    root.appendChild(searchWrap);

    // Brevity-Karten
    const brevCard = card('Brevity & Abkürzungen');
    const ul = document.createElement('ul');
    ul.id = 'brevity-list';
    brevCard.appendChild(ul);
    root.appendChild(brevCard);

    const renderList = (filter) => {
      ul.innerHTML = '';
      const q = (filter || '').toLowerCase();
      window.REF.brevity
        .filter(b => !q || b.code.toLowerCase().includes(q) || b.text.toLowerCase().includes(q))
        .forEach(b => {
          const li = document.createElement('li');
          const code = document.createElement('b');
          code.textContent = b.code;
          li.appendChild(code);
          li.appendChild(document.createTextNode(' – ' + b.text));
          ul.appendChild(li);
        });
    };
    renderList('');
    input.addEventListener('input', () => renderList(input.value));

    // CAS-Ablauf
    const flowCard = card('CAS-Ablauf (Standard)');
    const flow = document.createElement('ul');
    window.REF.casFlow.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      flow.appendChild(li);
    });
    flowCard.appendChild(flow);
    root.appendChild(flowCard);

    // 5er- & 6er-Line
    const lineCard = card('5er-Line (Wetter) & 6er-Line (Luftraum)');
    const h5 = document.createElement('h2');
    h5.textContent = '5er-Line (Wetter)';
    lineCard.appendChild(h5);
    lineCard.appendChild(table(window.REF.airLines.five));
    const h6 = document.createElement('h2');
    h6.textContent = '6er-Line (Luftraum)';
    lineCard.appendChild(h6);
    lineCard.appendChild(table(window.REF.airLines.six));
    root.appendChild(lineCard);

    // Laser & Smoke
    const lsCard = card('Laser-Codes & Smoke');
    const p1 = document.createElement('p');
    p1.innerHTML = 'Gängige Laser-Codes: <b>' + window.REF.laserCodes.join(' · ') + '</b>';
    const p2 = document.createElement('p');
    p2.innerHTML = 'Rauchfarben: <b>' + window.REF.smokeColors.join(' · ') + '</b>';
    const p3 = document.createElement('p');
    p3.innerHTML = 'Risiko-Stufen: <b>' + window.REF.riskLevels.join(' · ') + '</b>';
    [p1, p2, p3].forEach(p => { p.style.margin = '6px 0'; lsCard.appendChild(p); });
    root.appendChild(lsCard);
  }

  function card(title) {
    const c = document.createElement('div');
    c.className = 'ref-card';
    const h = document.createElement('h2');
    h.textContent = title;
    c.appendChild(h);
    return c;
  }

  function table(rows) {
    const t = document.createElement('table');
    rows.forEach(([a, b]) => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td'); td1.textContent = a;
      const td2 = document.createElement('td'); td2.textContent = b;
      tr.appendChild(td1); tr.appendChild(td2);
      t.appendChild(tr);
    });
    return t;
  }

  window.JTRefs = { render };
})();
