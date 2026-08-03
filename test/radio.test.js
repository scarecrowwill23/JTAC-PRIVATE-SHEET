// RadioEN-Tests: Deutsche Begriffe werden im Funkspruch automatisch englisch
'use strict';
const path = require('path');
const R = require(path.resolve(__dirname, '../src/js/lib/radio.js'));

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL:', msg); } else console.log('PASS:', msg); };
const eq = (input, expected) => ok(R.radioEN(input) === expected, `"${input}"  ->  "${R.radioEN(input)}" (erwartet: "${expected}")`);

// Richtungen
eq('200 m westlich des Ziels', '200 m west of the target');
eq('200 m südlich, kein Kontakt', '200 m south, no contact');
eq('100 m nordöstlich', '100 m north-east');
eq('200 m nordwestlich, IR-Strobe', '200 m north-west, IR-Strobe');
eq('400 m südlich', '400 m south');
eq('500 m östlich', '500 m east');
eq('250 m nördlich des Ziels', '250 m north of the target');
eq('Richtung Nord', 'heading north');
eq('Egress Nord, dann HA Alpha', 'Egress north, then HA Alpha');

// Markierungen / Farben
eq('grün Rauch', 'green smoke');
eq('rot Rauch', 'red smoke');
eq('kein Mark', 'no mark');
eq('keine Markierung', 'no mark');

// Orte & Objekte
eq('T-72 im Hangar', 'T-72 in the hangar');
eq('Hochspannung 100 m westlich', 'power lines 100 m west');
eq('im Gebäude', 'in the building');
eq('auf dem Dach', 'on the rooftop');
eq('im Freien', 'in the open');
eq('offene Fläche', 'open area');

// Einzelbegriffe
eq('AAA bei Grid 123 456, MANPADS möglich', 'AAA at Grid 123 456, MANPADS possible');
eq('ZSU-23 bei 123 456, SEAD aktiv', 'ZSU-23 at 123 456, SEAD active');
eq('GBU-12, Zerstörung', 'GBU-12, destruction');
eq('6 Runden', '6 rounds');
eq('3 km Sicht, Wind 270/12', '3 km visibility, Wind 270/12');
eq('nur Guns', 'only Guns');
eq('ACA Nord frei', 'ACA north clear');
eq('keine', 'none');

// BDA
eq('BTR zerstört', 'BTR destroyed');
eq('kein Feuer', 'no fire');
eq('Re-Attack möglich', 'Re-Attack possible');

// Unberührt & robust
eq('Target is BTR-42A marked by laser', 'Target is BTR-42A marked by laser');
eq('Friendly position is 200 m west of the target', 'Friendly position is 200 m west of the target');
ok(R.radioEN(R.radioEN('200 m westlich des Ziels')) === '200 m west of the target', 'Idempotent (2x anwenden)');
ok(R.radioEN('') === '', 'Leerstring bleibt leer');
ok(R.radioEN(null) === null && R.radioEN(undefined) === undefined, 'null/undefined robust');

console.log(fails === 0 ? '\n✔ ALLE RADIO-TESTS BESTANDEN' : '\n✘ ' + fails + ' FEHLER');
process.exit(fails ? 1 : 0);
