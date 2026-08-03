// Versions-Tests: compareVersions / isNewer (Update-System)
'use strict';
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const V = require(path.join(ROOT, 'src/js/lib/version.js'));

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } else console.log('PASS:', msg); };

ok(V.compareVersions('1.0.0', '1.0.0') === 0, 'gleich: 1.0.0 = 1.0.0');
ok(V.compareVersions('1.1.0', '1.0.0') === 1, 'neuer: 1.1.0 > 1.0.0');
ok(V.compareVersions('1.0.0', '1.1.0') === -1, 'älter: 1.0.0 < 1.1.0');
ok(V.compareVersions('1.10.0', '1.9.0') === 1, 'zweistellig: 1.10.0 > 1.9.0');
ok(V.compareVersions('2.0.0', '1.99.9') === 1, 'Major: 2.0.0 > 1.99.9');
ok(V.compareVersions('1.0', '1.0.0') === 0, 'kurz = lang: 1.0 = 1.0.0');
ok(V.compareVersions('v1.2.3', '1.2.3') === 0, 'führendes v wird ignoriert');
ok(V.compareVersions('1.2.3-beta', '1.2.3') === 0, 'Prerelease-Suffix wird ignoriert');
ok(V.isNewer('1.0.1', '1.0.0') === true, 'isNewer: Patch-Update erkannt');
ok(V.isNewer('1.0.0', '1.0.1') === false, 'isNewer: kein Update, wenn remote älter');
ok(V.isNewer('1.0.0', '1.0.0') === false, 'isNewer: kein Update bei gleicher Version');
ok(V.compareVersions('', '1.0.0') === -1, 'leer < 1.0.0 (robust)');

console.log(fails === 0 ? '\n✔ ALLE VERSIONS-TESTS BESTANDEN' : '\n✘ ' + fails + ' FEHLER');
process.exit(fails ? 1 : 0);
