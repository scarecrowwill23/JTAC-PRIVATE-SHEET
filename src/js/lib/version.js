// ============================================================
// Versions-Vergleich (Semver-light) – läuft überall:
// im Browser (window.VersionLib), im Electron-Main und in Node-Tests.
// ============================================================
(function (root, factory) {
  const lib = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  if (root) root.VersionLib = lib;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  /** "v1.2.3-beta" -> [1, 2, 3] */
  function parse(v) {
    return String(v == null ? '' : v)
      .trim()
      .replace(/^[vV]/, '')
      .split('-')[0]
      .split(/[^0-9]+/)
      .filter(s => s !== '')
      .map(s => parseInt(s, 10) || 0);
  }

  /**
   * Vergleicht zwei Versionsnummern.
   * @returns {number} 1 wenn a > b, -1 wenn a < b, 0 wenn gleich
   */
  function compareVersions(a, b) {
    const pa = parse(a), pb = parse(b);
    const len = Math.max(pa.length, pb.length, 3);
    for (let i = 0; i < len; i++) {
      const x = pa[i] || 0, y = pb[i] || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }
    return 0;
  }

  /** true, wenn remote neuer ist als local. */
  function isNewer(remote, local) {
    return compareVersions(remote, local) === 1;
  }

  return { parse, compareVersions, isNewer };
});
