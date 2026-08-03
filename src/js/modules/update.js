// ============================================================
// JTUpdate – App-Update (ganz einfach)
//
//  • Prüft beim Start automatisch, ob es auf GitHub eine neue
//    Version gibt. Wenn ja: großes oranges Schild auf der Startseite.
//  • Eigene Seite unter Einstellungen → „🔄 Update“ mit einer
//    Schritt-für-Schritt-Anleitung, die jeder hinkriegt.
// ============================================================

(function () {
  'use strict';

  let lastResult = null;   // letztes Prüf-Ergebnis
  let checking = false;    // läuft gerade eine Prüfung?

  const api = () => (window.jtacAPI && window.jtacAPI.checkUpdate) ? window.jtacAPI : null;

  /** Prüft auf Updates (mit Cache). force=true → immer neu prüfen. */
  async function check(force) {
    if (!api()) { lastResult = { ok: false, error: 'no-app', current: null }; return lastResult; }
    if (checking) return lastResult;
    if (!force && lastResult && lastResult.ok) return lastResult;
    checking = true;
    try {
      lastResult = await window.jtacAPI.checkUpdate();
    } catch (e) {
      lastResult = { ok: false, error: String(e), current: null };
    }
    checking = false;
    return lastResult;
  }

  /** X escapen (Sicherheit bei innerHTML). */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ------------------------------------------------------------
  // Banner auf der Startseite
  // ------------------------------------------------------------
  function showBanner(res) {
    const view = document.getElementById('view-home');
    if (!view || document.getElementById('update-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'update-banner';
    banner.id = 'update-banner';
    banner.innerHTML =
      '<div class="update-banner-text">' +
      '  <span class="update-banner-ico">🔄</span>' +
      '  <div><b>Neue Version da: v' + esc(res.latest) + '</b> <span class="update-banner-sub">(du hast v' + esc(res.current) + ')</span>' +
      '  <div class="update-banner-hint">Updaten dauert 2 Minuten – Anleitung klicken:</div></div>' +
      '</div>' +
      '<button class="btn btn-primary big" id="update-banner-btn">📖 Anleitung zeigen</button>';
    banner.querySelector('#update-banner-btn').addEventListener('click', openPage);
    view.insertBefore(banner, view.firstChild);
  }

  /** Startseiten-Banner aktualisieren (nach manuellem Check). */
  function refreshBanner(res) {
    const old = document.getElementById('update-banner');
    if (old) old.remove();
    if (res && res.ok && res.updateAvailable) showBanner(res);
  }

  // ------------------------------------------------------------
  // Update-Seite (Einstellungen → 🔄 Update)
  // ------------------------------------------------------------
  function statusBox(res) {
    if (checking) {
      return '<div class="update-status update-status-checking">⏳ <b>Suche läuft …</b> – einen Moment.</div>';
    }
    if (!res || (res.error === 'no-app')) {
      return '<div class="update-status">Drück einfach auf <b>„Jetzt nach Update suchen“</b> – die App schaut dann auf GitHub nach.</div>';
    }
    if (!res.ok) {
      return '<div class="update-status update-status-warn">⚠️ <b>Konnte gerade nicht prüfen.</b><br>' +
        'Meistens heißt das: kein Internet. Kein Problem – die App funktioniert normal weiter.<br>' +
        '<span class="hint">(Fehler: ' + esc(res.error) + ')</span></div>';
    }
    if (res.updateAvailable) {
      return '<div class="update-status update-status-new">🔄 <b>Es gibt ein Update!</b><br>' +
        'Neue Version: <b>v' + esc(res.latest) + '</b> &nbsp;·&nbsp; du hast: v' + esc(res.current) + '<br>' +
        '<b>Mach einfach die 5 Schritte unten – fertig.</b></div>';
    }
    return '<div class="update-status update-status-ok">✅ <b>Alles gut – du hast die neueste Version</b> (v' + esc(res.current) + ').<br>Hier musst du nichts tun.</div>';
  }

  function stepsBox(res) {
    if (!res || !res.ok || !res.updateAvailable) return '';
    return '' +
      '<div class="panel update-steps-panel">' +
      '  <h2>Update in 5 Schritten (kann man nicht falsch machen)</h2>' +
      '  <ol class="update-steps">' +
      '    <li><b>App zumachen</b> (dieses Fenster).</li>' +
      '    <li>Den <b>Ordner der App</b> öffnen <span class="hint">(da, wo du sie damals hin gelegt hast – im Ordner <code>JTAC-PRIVATE-SHEET</code>)</span>.</li>' +
      '    <li><b>Doppelklick auf <code>UPDATE.bat</code></b> (Windows). Ein schwarzes Fenster geht auf und macht <b>alles von allein</b>.</li>' +
      '    <li><b>Warten, bis „FERTIG!“ da steht.</b> Dann Taste drücken, Fenster zu.</li>' +
      '    <li><b>App wieder starten</b> – fertig. 🎉</li>' +
      '  </ol>' +
      '  <p class="update-goodnews">😌 <b>Keine Angst um deine Daten:</b> Alle Missionen, Profile und Einstellungen bleiben erhalten – die liegen getrennt von der App.</p>' +
      '  <div class="field-row">' +
      '    <button class="btn" id="update-open-page">🌐 Update-Seite im Browser öffnen</button>' +
      '  </div>' +
      '  <p class="hint">Plan B: Auf der Seite oben → grüner Knopf <b>„Code“</b> → <b>„Download ZIP“</b> → ZIP auspacken → damit den alten App-Ordner ersetzen.</p>' +
      '</div>';
  }

  /** Rendert die Update-Seite in den Einstellungen. */
  function render(root) {
    if (!root) return;
    root.innerHTML = '';

    const panel = document.createElement('div');
    panel.className = 'panel update-panel';
    panel.innerHTML =
      '<h2>App-Update</h2>' +
      '<p class="lead">Die App sagt dir <b>von allein</b> Bescheid, wenn es was Neues gibt – du musst hier also fast nie reingucken.</p>' +
      '<div class="field-row">' +
      '  <button class="btn btn-primary big" id="update-check-btn">🔍 Jetzt nach Update suchen</button>' +
      '</div>' +
      '<div id="update-status-slot" style="margin-top:12px">' + statusBox(lastResult) + '</div>';
    root.appendChild(panel);

    const stepsHost = document.createElement('div');
    stepsHost.id = 'update-steps-host';
    stepsHost.innerHTML = stepsBox(lastResult);
    root.appendChild(stepsHost);

    // Button-Verdrahtung
    root.querySelector('#update-check-btn').addEventListener('click', async () => {
      const slot = root.querySelector('#update-status-slot');
      checking = true;
      slot.innerHTML = statusBox(null);
      const res = await check(true);
      slot.innerHTML = statusBox(res);
      root.querySelector('#update-steps-host').innerHTML = stepsBox(res);
      wireSteps();
      refreshBanner(res);
      if (window.JTSettings && window.JTSettings.refreshTabLabels) window.JTSettings.refreshTabLabels();
    });
    wireSteps();

    function wireSteps() {
      const b = root.querySelector('#update-open-page');
      if (b) b.addEventListener('click', () => {
        if (window.jtacAPI && window.jtacAPI.openUpdatePage) window.jtacAPI.openUpdatePage();
      });
    }
  }

  /** Öffnet Einstellungen → Update (vom Banner aus). */
  function openPage() {
    location.hash = '#/settings';
    setTimeout(() => {
      if (window.JTSettings && window.JTSettings.openTab) {
        window.JTSettings.openTab('update');
        const rootEl = document.getElementById('settings-root');
        if (rootEl) window.JTSettings.render(rootEl);
      }
    }, 50);
  }

  /** Auto-Check beim Programmstart (still, ohne Fehlermeldungen). */
  function initAuto() {
    if (!api()) return; // läuft außerhalb der App (Browser/Tests) → nichts tun
    setTimeout(async () => {
      const res = await check(true);
      refreshBanner(res);
      if (window.JTSettings && window.JTSettings.refreshTabLabels) window.JTSettings.refreshTabLabels();
    }, 2500); // kurz warten, damit der Start schnell bleibt
  }

  window.JTUpdate = {
    check,
    render,
    openPage,
    initAuto,
    getLast: () => lastResult
  };
})();
