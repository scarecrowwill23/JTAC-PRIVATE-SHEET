// ============================================================
// JTAC Private Sheet – Grid-Rechner
// MGRS (ACE) / Arma-Grid / Lat-Long umrechnen,
// Distanz & Peilung zwischen zwei Punkten.
// Nutzt die mgrs-Bibliothek (MIT) für MGRS ↔ Lat/Long.
// ============================================================

(function () {
  'use strict';

  const MGRS_LIB = window.mgrs; // aus src/js/lib/mgrs.js

  // ---------- kleine Helfer ----------
  const fmt = (n, digits) => n.toLocaleString('de-DE', { maximumFractionDigits: digits || 0 });

  function toMils(deg) { return Math.round((((deg % 360) + 360) % 360) * 17.777778); }

  function parseDMS(str) {
    // "39°30'44.3"N 24°53'24.4"E"  oder  "39 30 44 N 24 53 24 E"
    const re = /(-?\d+(?:\.\d+)?)\s*[°d]\s*(?:(\d+(?:\.\d+)?)\s*['′]\s*)?(?:(\d+(?:\.\d+)?)\s*(?:["″]|'')?\s*)?([NSEW])/gi;
    let m, lat = null, lon = null;
    while ((m = re.exec(str)) !== null) {
      const deg = parseFloat(m[1]);
      const min = m[2] ? parseFloat(m[2]) : 0;
      const sec = m[3] ? parseFloat(m[3]) : 0;
      const dir = m[4].toUpperCase();
      let val = deg + min / 60 + sec / 3600;
      if (dir === 'S' || dir === 'W') val = -val;
      if (dir === 'N' || dir === 'S') lat = val; else lon = val;
    }
    return (lat !== null && lon !== null) ? { lat, lon } : null;
  }

  function parseLatLon(str) {
    // "39.5123, 24.8901" | "39.5123 24.8901" (Reihenfolge: Breite, Länge)
    const re = /^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/;
    const m = str.match(re);
    if (m) {
      const lat = parseFloat(m[1]), lon = parseFloat(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
    }
    const dms = parseDMS(str);
    if (dms) return dms;
    return null;
  }

  function parseMGRS(str) {
    const clean = String(str).trim().toUpperCase().replace(/\s+/g, '');
    const m = clean.match(/^(\d{1,2})([CDEFGHJKLMNPQRSTUVWX])([A-Z]{2})(\d+)$/);
    if (!m) return null;
    const zone = parseInt(m[1], 10);
    if (zone < 1 || zone > 60) return null;
    const digits = m[4];
    if (digits.length % 2 !== 0) return null;
    const half = digits.length / 2;
    const east = digits.slice(0, half), north = digits.slice(half);
    return { zone: m[1] + m[2], square: m[3], east, north, full: zone + m[2] + m[3] + east + north };
  }

  function parsePlainGrid(str) {
    // "123 456" (3+3, 100 m) | "1234 5678" (4+4, 10 m) | "12345 67890" (5+5, 1 m)
    const clean = String(str).trim().replace(/\s+/g, '');
    const m = clean.match(/^(\d{3})(\d{3})$|^(\d{4})(\d{4})$|^(\d{5})(\d{5})$/);
    if (!m) return null;
    const e = m[1] || m[3] || m[5];
    const n = m[2] || m[4] || m[6];
    const scale = 100 / Math.pow(10, e.length - 3);
    return { e: parseInt(e, 10) * scale, n: parseInt(n, 10) * scale, precision: scale };
  }

  /**
   * Einen Eingabetext in einen normalisierten Punkt verwandeln.
   * Rückgabe:
   *   { kind:'latlon', lat, lon }
   *   { kind:'grid',   e, n, precision, anchor: {lat, lon} }   – reines Arma-Grid
   *   { kind:'mgrs',   lat, lon, mgrs }                        – mit Zone/Quadrat
   */
  function parsePoint(text, mapPreset) {
    if (!text || !text.trim()) return null;
    text = text.trim();

    const mgrs = parseMGRS(text);
    if (mgrs) {
      try {
        const [lon, lat] = MGRS_LIB.toPoint(mgrs.full);
        return { kind: 'mgrs', lat, lon, mgrs: mgrs.full, display: mgrs.full };
      } catch (e) { /* fällt durch */ }
    }

    // WICHTIG: reines Zahlen-Grid VOR Lat/Long prüfen,
    // sonst wird "000 000" als 0°N/0°O interpretiert.
    const grid = parsePlainGrid(text);
    if (grid) {
      return { kind: 'grid', e: grid.e, n: grid.n, precision: grid.precision, display: text.replace(/\s+/g, ' ') };
    }

    const latlon = parseLatLon(text);
    if (latlon) {
      try {
        const mgrsStr = MGRS_LIB.forward([latlon.lon, latlon.lat], 5);
        return { kind: 'latlon', lat: latlon.lat, lon: latlon.lon, mgrs: mgrsStr, display: `${latlon.lat.toFixed(5)}, ${latlon.lon.toFixed(5)}` };
      } catch (e) {
        return { kind: 'latlon', lat: latlon.lat, lon: latlon.lon, mgrs: null, display: `${latlon.lat.toFixed(5)}, ${latlon.lon.toFixed(5)}` };
      }
    }

    return { kind: 'unknown', raw: text };
  }

  /** Reines Arma-Grid mit Karten-Ankerpunkt zu Lat/Long (Näherung). */
  function gridToLatLon(pt, preset) {
    if (!preset || !preset.sw) return null;
    const [swLon, swLat] = preset.sw;
    const lat = swLat + pt.n / 111320;
    const lon = swLon + pt.e / (111320 * Math.cos(swLat * Math.PI / 180));
    return { lat, lon };
  }

  /** Distanz (m) zwischen zwei Lat/Long-Punkten – Haversine. */
  function haversineMeters(a, b) {
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  /** Anfangspeilung A→B in Grad (0=Nord, 90=Ost …). */
  function bearingDeg(a, b) {
    const toRad = x => x * Math.PI / 180;
    const toDeg = x => x * 180 / Math.PI;
    const y = Math.sin(toRad(b.lon - a.lon)) * Math.cos(toRad(b.lat));
    const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
              Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lon - a.lon));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  function dms(lat, lon) {
    const f = (v, pos, neg) => {
      const d = Math.abs(v);
      const deg = Math.floor(d);
      const min = Math.floor((d - deg) * 60);
      const sec = Math.round(((d - deg) * 60 - min) * 60 * 10) / 10;
      return `${deg}°${String(min).padStart(2, '0')}'${sec.toFixed(1).padStart(4, '0')}"${v >= 0 ? pos : neg}`;
    };
    return `${f(lat, 'N', 'S')}  ${f(lon, 'E', 'W')}`;
  }

  // ---------- öffentliche API ----------
  const GridCalc = {
    parsePoint,
    gridToLatLon,
    haversineMeters,
    bearingDeg,
    dms,
    toMils,
    fmt,

    /** Vollständige Berechnung zweier Eingaben. */
    compute(aText, bText, mapPreset) {
      const A = parsePoint(aText, mapPreset);
      const B = parsePoint(bText, mapPreset);
      if (!A || A.kind === 'unknown') return { error: 'Punkt A nicht lesbar.' };
      if (!B || B.kind === 'unknown') return { error: 'Punkt B nicht lesbar.' };

      // Beide als reines Arma-Grid → exakte Rechnung über Grid-Differenz
      if (A.kind === 'grid' && B.kind === 'grid') {
        const dx = B.e - A.e, dy = B.n - A.n;
        const dist = Math.hypot(dx, dy);
        let deg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
        return {
          distM: dist,
          bearingDeg: deg,
          bearingMil: toMils(deg),
          approx: false,
          note: 'Beide Punkte als Arma-Grid – Distanz/Peilung direkt über Grid-Differenz (100-m-Raster bzw. gewählte Präzision).'
        };
      }

      // Mindestens ein geografischer Punkt → lat/lon auflösen
      const aLL = A.kind === 'grid' ? gridToLatLon(A, mapPreset) : { lat: A.lat, lon: A.lon };
      const bLL = B.kind === 'grid' ? gridToLatLon(B, mapPreset) : { lat: B.lat, lon: B.lon };
      if (!aLL || !bLL) {
        return { error: 'Für reine Arma-Grids wird eine Karten-Voreinstellung mit Ankerpunkt benötigt.' };
      }

      const dist = haversineMeters(aLL, bLL);
      const deg = bearingDeg(aLL, bLL);
      return {
        distM: dist,
        bearingDeg: deg,
        bearingMil: toMils(deg),
        approx: (A.kind === 'grid' || B.kind === 'grid'),
        a: aLL, b: bLL,
        aMgrs: A.mgrs || (() => { try { return MGRS_LIB.forward([aLL.lon, aLL.lat], 5); } catch (e) { return null; } })(),
        bMgrs: B.mgrs || (() => { try { return MGRS_LIB.forward([bLL.lon, bLL.lat], 5); } catch (e) { return null; } })(),
        note: (A.kind === 'grid' || B.kind === 'grid')
          ? 'Näherung: Arma-Grid wurde über den Karten-Ankerpunkt umgerechnet (für Spielzwecke ausreichend).'
          : 'Berechnet über Lat/Long (WGS84).'
      };
    },

    /** Einzelnen Punkt in alle Formate umwandeln. */
    convertSingle(text, mapPreset) {
      const P = parsePoint(text, mapPreset);
      if (!P || P.kind === 'unknown') return { error: 'Eingabe nicht lesbar.' };
      if (P.kind === 'grid') {
        const ll = gridToLatLon(P, mapPreset);
        if (!ll) return { error: 'Für reine Arma-Grids wird eine Karten-Voreinstellung mit Ankerpunkt benötigt.' };
        let mgrsStr = null;
        try { mgrsStr = MGRS_LIB.forward([ll.lon, ll.lat], 5); } catch (e) {}
        return {
          mgrs: mgrsStr, latlon: `${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)}`, dms: dms(ll.lat, ll.lon),
          utm: null, approx: true
        };
      }
      const ll = { lat: P.lat, lon: P.lon };
      return {
        mgrs: P.mgrs, latlon: `${ll.lat.toFixed(5)}, ${ll.lon.toFixed(5)}`, dms: dms(ll.lat, ll.lon),
        utm: null, approx: false
      };
    }
  };

  window.GridCalc = GridCalc;
})();
