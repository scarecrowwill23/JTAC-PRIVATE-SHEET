// ============================================================
// JTAC Private Sheet – Timer / TOT
// Countdown bis Time-on-Target, Lase-Fenster T-30 … T+30,
// Piep-Alarme via WebAudio (keine Audiodateien nötig).
// ============================================================

(function () {
  'use strict';

  const T_LASE = 30;   // Lase-Fenster: T-30 bis T+30

  let state = 'idle';  // idle | running | lase | done
  let mode = null;     // 'tot' (absolute Uhrzeit) | 'countdown'
  let endAt = 0;       // Zielzeitpunkt (epoch ms)
  let startAt = 0;
  let rafId = null;

  const els = {
    display: () => document.getElementById('timer-display'),
    state: () => document.getElementById('timer-state'),
    input: () => document.getElementById('timer-tot')
  };

  function beep(times, freq = 880, dur = 0.12) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      let t = ctx.currentTime;
      for (let i = 0; i < times; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
        t += dur + 0.12;
      }
      setTimeout(() => ctx.close(), t * 1000 + 200);
    } catch (e) { /* Audio nicht verfügbar – kein Fehler nötig */ }
  }

  function fmtMs(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    const pad = x => String(x).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function parseInput(text) {
    text = text.trim();

    // HH:MM:SS → absolute TOT-Uhrzeit (heute; wenn schon vorbei, morgen)
    let m = text.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m) {
      const now = new Date();
      const target = new Date(now);
      target.setHours(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return { mode: 'tot', ms: target.getTime() - now.getTime(), target };
    }

    // MM:SS → Countdown
    m = text.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
      const [mi, s] = [parseInt(m[1]), parseInt(m[2])];
      return { mode: 'countdown', ms: (mi * 60 + s) * 1000, label: text };
    }
    return null;
  }

  function tick() {
    const now = Date.now();
    const remain = endAt - now;
    const disp = els.display(), st = els.state();
    if (!disp || !st) return;

    if (remain <= -T_LASE * 1000) {
      state = 'done';
      disp.textContent = fmtMs(0);
      disp.classList.remove('warn', 'danger');
      st.textContent = 'Lase OFF – Vorgang beendet';
      st.className = 'timer-state';
      markChecklist('done');
      stopRaf();
      return;
    }

    disp.textContent = fmtMs(remain);

    const sec = Math.round(remain / 1000);
    if (state !== 'done') {
      if (remain <= T_LASE * 1000 && remain > 0) {
        state = 'lase';
        st.textContent = 'LASE FENSTER – Laser an, Ziel anpeilen';
        st.className = 'timer-state lase';
        disp.classList.remove('danger');
        disp.classList.add('warn');
      } else if (remain <= 0) {
        state = 'lase';
        st.textContent = 'T–0 – Einschlag! „Lase off" bei T+30';
        st.className = 'timer-state lase';
        disp.classList.remove('warn');
        disp.classList.add('danger');
      } else {
        st.textContent = mode === 'tot' ? 'Countdown bis TOT' : 'Countdown läuft';
        st.className = 'timer-state';
        disp.classList.remove('warn', 'danger');
      }
    }

    // Alarme
    if (sec === -T_LASE) { beep(3, 660); st.textContent = 'T+30 – LASE OFF'; }
    else if (sec === -10) beep(2, 880);
    else if (sec === 0) beep(4, 1320);
    else if (sec === T_LASE) beep(2, 990);
    else if (sec === 10) beep(1, 880);

    markChecklist(sec);

    rafId = requestAnimationFrame(tick);
  }

  function markChecklist(sec) {
    const set = (id, cls) => { const el = document.getElementById(id); if (el) { el.className = cls; } };
    set('lase-t30', 'active');
    set('lase-t10', sec <= 10 ? (sec > 0 ? 'active' : 'done') : '');
    set('lase-t0', sec <= 0 ? 'done' : '');
    set('lase-t30a', sec <= -T_LASE ? 'done' : '');
  }

  function stopRaf() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  function start() {
    const parsed = parseInput(els.input().value);
    if (!parsed) {
      if (window.App) window.App.toast('Bitte TOT als HH:MM:SS oder Countdown als MM:SS eingeben.', true);
      return;
    }
    mode = parsed.mode;
    startAt = Date.now();
    endAt = parsed.mode === 'tot' ? parsed.target.getTime() : startAt + parsed.ms;
    state = 'running';
    markChecklist(999);
    stopRaf();
    tick();
  }

  function stop() {
    stopRaf();
    const remain = endAt - Date.now();
    els.display().textContent = fmtMs(remain);
    els.state().textContent = 'Pausiert (Zeit bleibt stehen)';
    els.state().className = 'timer-state';
    state = 'idle';
  }

  function reset() {
    stopRaf();
    state = 'idle';
    els.display().textContent = '00:00:00';
    els.display().classList.remove('warn', 'danger');
    els.state().textContent = 'Bereit';
    els.state().className = 'timer-state';
    els.input().value = '';
    ['lase-t30', 'lase-t10', 'lase-t0', 'lase-t30a'].forEach(id => {
      const el = document.getElementById(id); if (el) el.className = '';
    });
  }

  function init() {
    document.getElementById('timer-start').addEventListener('click', start);
    document.getElementById('timer-stop').addEventListener('click', stop);
    document.getElementById('timer-reset').addEventListener('click', reset);
    els.input().addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
  }

  window.JTTimer = { init, start, stop, reset };
})();
