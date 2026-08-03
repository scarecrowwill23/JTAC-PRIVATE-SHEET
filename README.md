# JTAC Helper

Private Desktop-App für **JTAC in Arma 3** – basierend auf den Unit-Dokumenten:
**CGF 160th SOAR** (Airframes), **JTAC Protocols 24th STS**, **ATG Reference Sheet**,
**Ghost's JTAC Cheatsheet** und **TFW 18E Course**.

Läuft lokal auf deinem Laptop (neben deinem Arma-PC), komplett offline. Nur du benutzt sie –
keine Anmeldung, kein Server, keine Datenübertragung.

---

## Funktionen

| Modul | Was es kann |
|---|---|
| **Start (Dashboard)** | Einsatz-Zentrale: aktive Mission, dein CAS-Airframe mit Bewaffnung, große Schnellzugriff-Buttons (Fokus: 5-Line & HLZ, Briefing Area) |
| **📋 Mission** | Jede Mission extra anlegen (Name + Karte + **Campaign**). Sie sammelt: **Funkspruch-Log**, **BDA-History mit Schnellbewertungen** (Destroyed / Immobilized / X/10), **Koordinaten-Favoriten**, **Pre-Mission-Checkliste**, **„Ich bin hier"**. **Campaign-Report** (6 Missionen): alle Funksprüche + BDA als Text. Export/Import als JSON. |
| **Start (Mission-first)** | Beim Öffnen steht die **Mission groß im Mittelpunkt** (anlegen oder Details), **History rechts daneben** – dann die Schnellzugriffe. |
| **🚁 5-Line CAS (Rotary)** | Dein Standard-Brief. Felder: Game Plan (Type/MOA/Anzahl/Ordnance), Friendly, Target Grid, Beschreibung/Mark, Remarks (LTL/FAH/Danger Close). |
| **🛬 HLZ Brief** | Landeplatz-Briefing: Grid, Markierung, Hindernisse, Friendly/Enemy SITREP, Security (Green/Yellow/Red). |
| **🎯 9-Line CAS** | Fixed-Wing-Brief im Original-Format eurer Unit, Pflicht-Readbacks rot markiert. |
| **✚ MEDEVAC** | Prioritäten A–E, Ausrüstung, Litter/Ambulatory, Security, Markierung, Nationalität, CBRN. |
| **🗂 Briefing Area** | Eigener Bereich für die weniger häufigen Briefings aus dem ATG Reference Sheet &amp; Ghost's Cheatsheet: **SOF Gunship, RPAS (UAV), ALZ, Airdrop, Call for Fire, CCA 5-Line** – alles mit Satz-Output, Senden &amp; Log. |
| **➤ 12-Schritte-CAS** | Geführter Ablauf: Check-in → TEFACHR → Game Plan → Brief → Remarks → BDA, als durchgehender Funkspruch. |
| **⌖ Grid-Rechner** | MGRS ↔ Lat/Long, Arma-Grids, Distanz & Peilung in Grad + Mil. „📌 In Brief einfügen" überträgt das Ergebnis direkt in die 5-/9-Line. |
| **⏱ Timer / TOT** | Countdown mit automatischem Lase-Fenster (T–30 … T+30) + Piep-Alarmen. |
| **☎ Profile** | Presets **GRANITE 10 / GRANITE 11 / FLEX** (ACRE-2-Channels, Laser 1111), Airframe-Auswahl mit Bewaffnungs-Details. |
| **⚙ Einstellungen** | **Einstellungen** (Design, Standard-Profil, Standard-Karte) · **📻 Channels (SR/LR)** – eigene Short-/Long-Range-Kanäle anlegen (ACRE-2) · **🗄 Daten** – eigene Ziele, Ordnance, Lage-Begriffe und Callsigns eintragen (fließen überall ein). |
| **▤ Referenzen** | Brevity (93 Begriffe, durchsuchbar), Danger Close, Höhen/Keyhole, Airframes, Funk, Verfahren + **📄 Original-PDFs zum Nachschlagen**. |
| **⚡ Schnelligkeit** | Globale Suche (Brevity, Ziele, Favoriten, Missionen), Sidebar-Pins (Favoriten), Schnell-Buttons (CONTACT, CLEARED HOT, SHACK …), Standard-Sprüche, Auto-Fokus. |

## 🔑 Kern-Feature: Vorlesbarer Funkspruch

Die App baut jeden Brief als **fertige Sätze**, die du direkt am Funk ablesen kannst – kein
Zettel, kein Notieren:

```
ARCHER 3-1, this is GRANITE 10, ready for 5-Line?
ARCHER 3-1, this is GRANITE 10, 5-Line
Type 2 control, BOT, 2 times, 114 Kilo
Friendly position is 200 m westlich marked by smoke
Target is on grid 0453 0976
Target is BTR-42A marked by laser
Laser to target line 342
```

**📤 Senden & ins Log** kopiert den Spruch, schreibt ihn in die Missions-Historie und zeigt dir
die Readback-Zeilen zum Abhaken, wenn der Pilot bestätigt hat.

## Starten (Entwicklung)

```bash
npm install
npm start
```

## Tests

```bash
npm test
```
Testet Rechenlogik, UI (jsdom), Satz-Output und den kompletten Workflow inkl. Missions-Log.

## Windows-Paket bauen (finale Version)

```bash
npm install
npm run pack:win
```
Ergebnis im Ordner `build/JTAC-Helper-win32-x64/` – die `JTAC-Helper.exe` starten, fertig.
Die App braucht danach kein Internet mehr. Alle Daten liegen lokal im App-Profil-Ordner.

## Projektstruktur

```
main.js              – Electron-Fenster (Main-Prozess)
preload.js           – sichere Brücke (Clipboard, Titel)
src/
  index.html         – Oberfläche
  css/styles.css     – Design (dunkel/hell)
  docs/              – deine Original-PDFs (Dokumente-View)
  js/
    lib/mgrs.js      – MGRS-Bibliothek (MIT, proj4js)
    data/refdata.js  – alle Referenzdaten + Satz-Vorlagen
    modules/         – grid, forms, missions, briefs, workflow, timer, profiles, refs
    app.js           – Router, Suche, Pins, Verdrahtung
test/                – Logik-, UI- und Workflow-Tests
```
