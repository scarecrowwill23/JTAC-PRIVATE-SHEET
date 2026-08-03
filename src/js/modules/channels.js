// ============================================================
// JTAC Helper – Channels (ACRE-2)
// Short Range (SR) & Long Range (LR) Kanäle selbst verwalten.
// Wird in den Einstellungen bearbeitet und in den Profilen
// als Auswahl (Datalist) genutzt.
// ============================================================

(function () {
  'use strict';

  const KEY = 'jtac.channels';

  let channels = load();

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(stored) && stored.length ? stored : JSON.parse(JSON.stringify(window.REF.defaultChannels));
    } catch (e) {
      return JSON.parse(JSON.stringify(window.REF.defaultChannels));
    }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(channels)); }

  function getChannels() { return channels; }
  function getByName(name) { return channels.find(c => c.name === name) || null; }

  function add(name, type, freq, note) {
    const c = { id: 'ch' + Date.now().toString(36), name: name || 'Ch. ' + (channels.length + 1), type: type === 'SR' ? 'SR' : 'LR', freq: freq || '', note: note || '' };
    channels.push(c);
    save();
    return c;
  }
  function update(id, patch) {
    const c = channels.find(x => x.id === id);
    if (!c) return;
    Object.assign(c, patch);
    save();
  }
  function remove(id) {
    channels = channels.filter(c => c.id !== id);
    save();
  }
  function resetDefaults() {
    channels = JSON.parse(JSON.stringify(window.REF.defaultChannels));
    save();
  }

  // ---------- UI ----------
  function render(rootEl) {
    if (!rootEl) return;
    rootEl.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'view-head';
    const h = document.createElement('h2');
    h.textContent = 'Channels (ACRE-2) – Short Range & Long Range';
    head.appendChild(h);
    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn btn-ghost';
    resetBtn.textContent = '↺ Standard';
    resetBtn.addEventListener('click', () => { if (confirm('Channels auf Standard zurücksetzen?')) { resetDefaults(); render(rootEl); } });
    head.appendChild(resetBtn);
    rootEl.appendChild(head);

    const lead = document.createElement('p');
    lead.className = 'lead';
    lead.textContent = 'Lege deine Funk-Kanäle an: Long Range (Backpack, z. B. AN/PRC-117F) und Short Range (Handfunk, z. B. AN/PRC-152/343). Die Namen erscheinen dann als Auswahl in den Profilen.';
    rootEl.appendChild(lead);

    // Tabelle
    const table = document.createElement('table');
    table.className = 'data-table';
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    ['Kanal', 'Typ', 'Frequenz (optional)', 'Notiz', ''].forEach(t => {
      const th = document.createElement('th'); th.textContent = t; trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    channels.forEach(c => {
      const tr = document.createElement('tr');
      const td1 = document.createElement('td');
      const nameIn = document.createElement('input');
      nameIn.className = 'input mono';
      nameIn.value = c.name;
      nameIn.addEventListener('change', () => update(c.id, { name: nameIn.value.trim() || c.name }));
      td1.appendChild(nameIn);
      const td2 = document.createElement('td');
      const sel = document.createElement('select');
      sel.className = 'select';
      window.REF.channelTypes.forEach(t => {
        const o = document.createElement('option');
        o.value = t.id; o.textContent = t.id + ' – ' + t.label;
        sel.appendChild(o);
      });
      sel.value = c.type;
      sel.addEventListener('change', () => update(c.id, { type: sel.value }));
      td2.appendChild(sel);
      const td3 = document.createElement('td');
      const freqIn = document.createElement('input');
      freqIn.className = 'input mono';
      freqIn.placeholder = 'z. B. 36.50';
      freqIn.value = c.freq || '';
      freqIn.addEventListener('change', () => update(c.id, { freq: freqIn.value.trim() }));
      td3.appendChild(freqIn);
      const td4 = document.createElement('td');
      const noteIn = document.createElement('input');
      noteIn.className = 'input';
      noteIn.placeholder = 'z. B. TAD – CAS';
      noteIn.value = c.note || '';
      noteIn.addEventListener('change', () => update(c.id, { note: noteIn.value.trim() }));
      td4.appendChild(noteIn);
      const td5 = document.createElement('td');
      const del = document.createElement('button');
      del.className = 'btn btn-ghost small';
      del.textContent = '✕';
      del.addEventListener('click', () => { if (confirm('Kanal "' + c.name + '" löschen?')) { remove(c.id); render(rootEl); } });
      td5.appendChild(del);
      [td1, td2, td3, td4, td5].forEach(td => tr.appendChild(td));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    rootEl.appendChild(table);

    // Neu hinzufügen
    const addPanel = document.createElement('div');
    addPanel.className = 'panel';
    addPanel.style.marginTop = '16px';
    const h2 = document.createElement('h2');
    h2.textContent = 'Neuen Kanal anlegen';
    addPanel.appendChild(h2);
    const form = document.createElement('div');
    form.className = 'form';
    const row = document.createElement('div');
    row.className = 'field-row';
    const f1 = document.createElement('div');
    f1.className = 'field';
    const l1 = document.createElement('label'); l1.className = 'field-label'; l1.textContent = 'Name';
    const i1 = document.createElement('input'); i1.className = 'input mono'; i1.id = 'ch-new-name'; i1.placeholder = 'z. B. Ch. 6 Air';
    f1.appendChild(l1); f1.appendChild(i1);
    const f2 = document.createElement('div');
    f2.className = 'field';
    const l2 = document.createElement('label'); l2.className = 'field-label'; l2.textContent = 'Typ';
    const s2 = document.createElement('select'); s2.className = 'select'; s2.id = 'ch-new-type';
    window.REF.channelTypes.forEach(t => {
      const o = document.createElement('option'); o.value = t.id; o.textContent = t.id + ' – ' + t.label;
      s2.appendChild(o);
    });
    f2.appendChild(l2); f2.appendChild(s2);
    const f3 = document.createElement('div');
    f3.className = 'field';
    const l3 = document.createElement('label'); l3.className = 'field-label'; l3.textContent = 'Frequenz (optional)';
    const i3 = document.createElement('input'); i3.className = 'input mono'; i3.id = 'ch-new-freq'; i3.placeholder = 'z. B. 36.50';
    f3.appendChild(l3); f3.appendChild(i3);
    const f4 = document.createElement('div');
    f4.className = 'field grow';
    const l4 = document.createElement('label'); l4.className = 'field-label'; l4.textContent = 'Notiz';
    const i4 = document.createElement('input'); i4.className = 'input'; i4.id = 'ch-new-note'; i4.placeholder = 'z. B. für CAS';
    f4.appendChild(l4); f4.appendChild(i4);
    row.appendChild(f1); row.appendChild(f2); row.appendChild(f3); row.appendChild(f4);
    form.appendChild(row);
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = '+ Kanal anlegen';
    btn.addEventListener('click', () => {
      const name = document.getElementById('ch-new-name').value.trim();
      const type = document.getElementById('ch-new-type').value;
      const freq = document.getElementById('ch-new-freq').value.trim();
      const note = document.getElementById('ch-new-note').value.trim();
      if (!name) { window.App.toast('Kanalname fehlt.', true); return; }
      add(name, type, freq, note);
      window.App.toast('Kanal angelegt: ' + name);
      render(rootEl);
    });
    form.appendChild(btn);
    addPanel.appendChild(form);
    rootEl.appendChild(addPanel);
  }

  window.JTChannels = { getChannels, getByName, add, update, remove, resetDefaults, render };
})();
