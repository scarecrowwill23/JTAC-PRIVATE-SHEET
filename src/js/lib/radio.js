// ============================================================
// RadioEN – "Funk-Übersetzer"
//
// Erkennt typische deutsche Begriffe in den Freitext-Feldern und
// übersetzt sie automatisch ins Funk-Englisch, damit der fertige
// Funkspruch immer sauber englisch ist:
//
//   "200 m westlich des Ziels"  ->  "200 m west of the target"
//   "grün Rauch"                ->  "green smoke"
//   "Egress Nord"               ->  "Egress north"
//
// Alles, was nicht im Wörterbuch steht, bleibt unverändert.
// Läuft im Browser (window.RadioEN) und in Node-Tests.
// ============================================================
(function (root, factory) {
  const lib = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = lib;
  if (root) root.RadioEN = lib;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this), function () {
  'use strict';

  // Wortgrenzen, die auch Umlaute sauber behandeln (\b kann das nicht zuverlässig)
  function rx(s) {
    return new RegExp('(?<![A-Za-zÀ-ÿ])' + s + '(?![A-Za-zÀ-ÿ])', 'gi');
  }

  // Reihenfolge wichtig: zusammengesetzte Richtungen ZUERST,
  // sonst würde "östlich" das "nordöstlich" auseinanderreißen.
  const MAP = [
    // --- Richtungen (zusammengesetzt) ---
    [rx('nord[-\\s]?östlich'), 'north-east'],
    [rx('nord[-\\s]?westlich'), 'north-west'],
    [rx('süd[-\\s]?östlich'), 'south-east'],
    [rx('süd[-\\s]?westlich'), 'south-west'],
    [rx('nordosten'), 'north-east'],
    [rx('nordwesten'), 'north-west'],
    [rx('südosten'), 'south-east'],
    [rx('südwesten'), 'south-west'],
    // --- Richtungen (einfach) ---
    [rx('nördlich'), 'north'],
    [rx('südlich'), 'south'],
    [rx('östlich'), 'east'],
    [rx('westlich'), 'west'],
    [rx('nord(en)?'), 'north'],
    [rx('ost(en)?'), 'east'],
    [rx('süd(en)?'), 'south'],
    [rx('west(en)?'), 'west'],
    // --- Bezug zum Ziel ---
    [rx('des Ziels'), 'of the target'],
    [rx('vom Ziel'), 'from the target'],
    [rx('am Ziel'), 'at the target'],
    [rx('zum Ziel'), 'to the target'],
    // --- Häufige Phrasen ---
    [rx('kein[en]? Kontakt'), 'no contact'],
    [rx('kein Mark(ierung)?'), 'no mark'],
    [rx('keine Mark(ierung)?'), 'no mark'],
    [rx('im Freien'), 'in the open'],
    [rx('offene[n]? Fläche'), 'open area'],
    [rx('im Hangar'), 'in the hangar'],
    [rx('im Gebäude'), 'in the building'],
    [rx('auf dem Dach'), 'on the rooftop'],
    [rx('Hochspannung(sleitung(en)?)?'), 'power lines'],
    [rx('Richtung'), 'heading'],
    // --- Farben (vor "Rauch"!) ---
    [rx('grün(en)?'), 'green'],
    [rx('rot(e|en)?'), 'red'],
    [rx('gelb(en)?'), 'yellow'],
    [rx('weiß(en)?'), 'white'],
    [rx('blau(en)?'), 'blue'],
    [rx('lila'), 'purple'],
    [rx('schwarz(en)?'), 'black'],
    [rx('Rauch'), 'smoke'],
    // --- Einzelne Begriffe ---
    [rx('rechts'), 'right'],
    [rx('links'), 'left'],
    [rx('bei'), 'at'],
    [rx('dann'), 'then'],
    [rx('aktiv'), 'active'],
    [rx('möglich'), 'possible'],
    [rx('gedeckt'), 'under cover'],
    [rx('Zerstörung'), 'destruction'],
    [rx('zerstört(e|en)?'), 'destroyed'],
    [rx('Feuer'), 'fire'],
    [rx('Runden'), 'rounds'],
    [rx('Salve'), 'salvo'],
    [rx('Sicht'), 'visibility'],
    [rx('Türme'), 'towers'],
    [rx('keine'), 'none'],
    [rx('kein'), 'no'],
    [rx('nur'), 'only'],
    [rx('frei'), 'clear']
  ];

  /**
   * Übersetzt bekannte deutsche Begriffe in einem Text ins Funk-Englisch.
   * Unbekanntes bleibt 1:1 stehen. Idempotent (mehrfach anwenden = kein Schaden).
   */
  function radioEN(text) {
    if (text == null) return text;
    let out = String(text);
    for (const [re, en] of MAP) out = out.replace(re, en);
    return out.replace(/ {2,}/g, ' ').trim();
  }

  return { radioEN };
});
