// Logik-Tests: GridCalc (MGRS/Arma-Grid/LatLong, Distanz, Peilung)
// Nutzt die mgrs-Lib und die echten App-Module.
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

global.window = global;
global.self = global;
const mgrsLib = require(path.join(ROOT, 'src/js/lib/mgrs.js'));
window.mgrs = mgrsLib;
const REF = require(path.join(ROOT, 'src/js/data/refdata.js'));
window.REF = REF;
require(path.join(ROOT, 'src/js/modules/grid.js'));
const G = window.GridCalc;

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } else console.log('PASS:', msg); };

const p1 = G.parsePoint('35S LE 20476 18769');
ok(p1 && p1.kind === 'mgrs' && p1.mgrs === '35SLE2047618769', 'MGRS mit Leerzeichen: ' + (p1 && p1.mgrs));
const p2 = G.parsePoint('18SUJ2161204570');
ok(p2 && p2.kind === 'mgrs' && Math.abs(p2.lat - 38.8719) < 0.002, 'MGRS kompakt (Pentagon): ' + (p2 ? p2.lat + ',' + p2.lon : 'null'));

const g1 = G.parsePoint('123 456');
ok(g1 && g1.kind === 'grid' && g1.e === 12300 && g1.n === 45600, 'Arma-Grid 6-stellig');
const g2 = G.parsePoint('1234 5678');
ok(g2 && g2.kind === 'grid' && g2.e === 12340 && g2.n === 56780, 'Arma-Grid 8-stellig');
const g3 = G.parsePoint('12345 67890');
ok(g3 && g3.kind === 'grid' && g3.e === 12345 && g3.n === 67890, 'Arma-Grid 10-stellig');

const l1 = G.parsePoint('39.5123, 24.8901');
ok(l1 && l1.kind === 'latlon' && Math.abs(l1.lat - 39.5123) < 1e-6, 'Lat/Long dezimal');
const l2 = G.parsePoint('39°30\'44.3"N 24°53\'24.4"E');
ok(l2 && l2.kind === 'latlon' && Math.abs(l2.lat - 39.5123) < 0.01, 'Lat/Long DMS');

const r = G.compute('100 100', '200 300', REF.maps[0]);
ok(r && !r.error && Math.abs(r.distM - Math.hypot(10000, 20000)) < 1, 'Distanz 2 Arma-Grids: ' + Math.round(r.distM) + ' m');
ok(r && Math.abs(r.bearingDeg - 26.565) < 0.1, 'Peilung 2 Arma-Grids: ' + r.bearingDeg.toFixed(2) + '° = ' + r.bearingMil + ' mil');

const r2 = G.compute('18SUJ2161204570', '18SUJ2340306470', REF.maps[0]);
ok(r2 && !r2.error && r2.distM > 2000 && r2.distM < 3200, 'MGRS→MGRS Distanz: ' + Math.round(r2.distM) + ' m');

const r3 = G.compute('000 000', '35S LE 20476 18769', REF.maps.find(m => m.id === 'altis'));
ok(r3 && !r3.error && r3.approx && r3.distM > 15000 && r3.distM < 30000, 'Arma-Grid + MGRS (Näherung über Altis-Anker): ' + Math.round(r3.distM) + ' m');

const s = G.convertSingle('35S LE 20476 18769', REF.maps[0]);
ok(s && s.mgrs && s.latlon, 'Einzelpunkt MGRS→Lat/Long: ' + s.latlon);
const s2 = G.convertSingle('39.5123, 24.8901', REF.maps[0]);
ok(s2 && s2.mgrs, 'Einzelpunkt Lat/Long→MGRS: ' + s2.mgrs);

// Zonen aller Karten gegen die mgrs-Lib prüfen
let zoneFails = 0;
for (const m of REF.maps) {
  if (!m.sw) continue;
  const [lon, lat] = m.sw;
  const str = mgrsLib.forward([lon + 0.05, lat + 0.05], 5);
  const zoneMatch = str.slice(0, 3) === m.zone;
  if (!zoneMatch) { zoneFails++; fails++; }
  console.log((zoneMatch ? 'PASS' : 'FAIL') + ': Zone ' + m.id + ' = ' + m.zone + ' (Lib: ' + str.slice(0, 3) + ')');
}
if (zoneFails) console.log('✘ ' + zoneFails + ' Zonen-Fehler');

console.log(fails === 0 ? '\n✔ ALLE LOGIK-TESTS BESTANDEN' : '\n✘ ' + fails + ' FEHLER');
process.exit(fails ? 1 : 0);
