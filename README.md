# JTAC Private Sheet

Private Desktop-App für **JTAC in Arma 3** – basierend auf den Unit-Dokumenten:
**CGF 160th SOAR** (Airframes), **JTAC Protocols 24th STS**, **ATG Reference Sheet**,
**Ghost's JTAC Cheatsheet** und **TFW 18E Course**.

Läuft lokal auf deinem Laptop, komplett offline. Nur du benutzt sie – keine Anmeldung,
kein Server, keine Datenübertragung. Alles wird im Browser-Speicher der App gespeichert (`localStorage`).

---

## Funktionen

| Modul | Was es kann |
|---|---|
| **Start (Dashboard)** | Einsatz-Zentrale beim Öffnen: aktive Mission (Profil, JTAC, Funk, Laser, Karte, MEDEVAC), dein CAS-Airframe mit Bewaffnung, große Schnellzugriff-Buttons, „Funkspruch kopieren" mit einem Klick |
| **9-Line CAS** | Direkt erreichbar (Sidebar & Dashboard): alle 9 Zeilen, Live-Funkspruch, ⧉ kopieren, Auto-Fokus aufs erste Feld |
| **MEDEVAC** | Direkt erreichbar – NATO-Medevac mit Prioritäten A–E, Sicherheitslage, CBRN |
| **Immer leer beim Start** | Formulare starten bei jedem App-Start leer – nichts vom letzten Einsatz. Während der Sitzung bleiben Werte beim Tab-Wechsel erhalten. |
| **Großzügiges Layout** | Große, luftige Felder (gut lesbar aus Entfernung), Pflicht-Readback-Zeilen (4, 6, 8 …) rot hinterlegt & markiert – Original-Reihenfolge bleibt erhalten |
| **Briefs & Formulare** | **10 Formate**: 9-Line CAS, 5-Line CAS, MEDEVAC/CASEVAC, SOF Gunship, CCA 5-Line, RPAS (UAV), HLZ, ALZ, Airdrop, Call for Fire – mit ⚠-Kennzeichnung der Pflicht-Readbacks |
| **Grid-Rechner** | MGRS (ACE) ↔ Lat/Long, Arma-Grids (6/8/10-stellig), Distanz & Peilung in Grad + Mil, Einzelpunkt-Umrechnung |
| **Timer / TOT** | Countdown bis Time-on-Target, automatisches Lase-Fenster (T–30 … T+30), Piep-Alarme |
| **Profile & Netze** | 3 Presets: **GRANITE 10**, **GRANITE 11**, **FLEX** – mit euren Callsigns, Funk (Channel 2 TAD), Laser 1111, Karten-Voreinstellung, Notizen |
| **Referenzen** | Durchsuchbares Brevity-Wörterbuch (89 Begriffe, 8 Kategorien), Danger-Close-Tabelle, Keyhole & Höhenblöcke, Airframes der 160th SOAR, Funkgeräte, Funketikette, PACE, Phonetik, Laser-/IR-Prozeduren |

### Inhalte aus den Dokumenten

- **12 Schritte CAS** (Routing → Check-in → TEFACHR → Game Plan → Brief → Readbacks → Korrelation → Angriff → BDA → Egress)
- **Danger Close** nach Waffe: MK-82 285 m, GBU-12 270 m, GBU-31 465 m, GBU-32 340 m, GBU-38 270 m, GBU-54 280 m, Hydra 70 270 m, APKWS 105 m, AGM-65 175 m, AGM-114 115 m, 20/25/30 mm 60–200 m, 105 mm (AC-130) 160 m … Standard: 400 m
- **CGF 160th SOAR Airframes**: PRINCE 6-X (MH-60M), BUFFALO 2-X (MH-47G), VALIANT 5-X (MH-6M), SPIRIT 7-X (MEDEVAC), ARCHER 3-X (MH-60M DAP), LANCER 4-X (DAP MLASS), LYNX 8-X (AH-6M), GHOSTRIDER 1-X (AC-130), AVENGER 9 (MQ-9), MC-130J
- **Airframe-Auswahl überall**: CAS-Callsign als Dropdown (Auto-Vervollständigung) mit allen euren Callsigns; bei Auswahl werden Bewaffnung, Features & Crew direkt angezeigt (im Profil-Editor und in der Briefs-Ansicht)
- **Kontrolltypen** 1/2/3, **BOT/BOC**, **Keyhole-Methode**, **Höhenblöcke** (Cherubs/Angels)
- **TEFACHR**-SITREP, **SALT-R**-BDA, Laser-/IR-/Smoke-Markierungsprozeduren

## Starten (Entwicklung)

```bash
npm install
npm start
```

## Tests

```bash
npm test
```
Testet Rechenlogik (MGRS, Distanz/Peilung, Zonen), die komplette UI (jsdom) und den
12-Schritte-Workflow (Funkspruch-Erzeugung).

## Windows-Paket bauen

```bash
npm install
npm run pack:win
```
Ergebnis im Ordner `build/JTAC-Private-Sheet-win32-x64/` – die `JTAC-Private-Sheet.exe` starten.
> `pack:win` lädt beim ersten Mal das Electron-Laufzeitpaket für Windows herunter (ca. 100 MB).

## Projektstruktur

```
main.js              – Electron-Fenster (Main-Prozess)
preload.js           – sichere Brücke (Clipboard, Titel)
src/
  index.html         – Oberfläche (alle Ansichten)
  css/styles.css     – Design (dunkel/hell)
  js/
    lib/mgrs.js      – MGRS-Bibliothek (MIT, proj4js)
    data/refdata.js  – alle Referenzdaten aus den Unit-Dokumenten
    modules/         – grid, forms, briefs, workflow, timer, profiles, refs
    app.js           – Router & Verdrahtung
test/                – Logik-, UI- und Workflow-Tests
```
