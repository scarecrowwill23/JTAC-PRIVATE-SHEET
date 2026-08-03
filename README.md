# JTAC Private Sheet

Private Desktop-App für **JTAC in Arma 3** – läuft lokal auf deinem Laptop, komplett offline.
Nur du benutzt sie: Es gibt keinen Server, keine Anmeldung, keine Daten werden übertragen.
Alles wird im Browser-Speicher der App gespeichert (`localStorage`).

---

## Funktionen (aktueller Stand)

| Modul | Was es kann |
|---|---|
| **9-Line CAS** | Briefing in 9 Zeilen aufbauen, Live-Vorschau, per Klick in die Zwischenablage kopieren |
| **9-Line MEDEVAC** | NATO-Medevac mit Prioritäten (A–E), Litter/Ambulatory, Sicherheitslage, ABC … |
| **Grid-Rechner** | MGRS (ACE) ↔ Lat/Long, Arma-Grids (6/8/10-stellig), Distanz & Peilung in Grad + Mil, Einzelpunkt-Konvertierung |
| **Timer / TOT** | Countdown bis Time-on-Target, automatisches Lase-Fenster (T–30 … T+30), Piep-Alarme |
| **Profile & Netze** | Bis zu 3 feste Profile: Callsigns, Frequenzen, Laser-Code, Karten-Voreinstellung, Notizen |
| **Referenzen** | Brevity-Wörterbuch (durchsuchbar), CAS-Ablauf, 5er-/6er-Line, Laser-Codes, Rauchfarben |

Karten-Voreinstellungen mit korrekten UTM-Zonen: Altis/Stratis (35S), Malden (33T), Livonia (34U),
Tanoa (60K), Chernarus (33U), Takistan (42S).

## Starten (Entwicklung)

```bash
npm install
npm start
```

## Tests

```bash
npm test
```
Testet die gesamte Rechenlogik (MGRS-Umrechnung, Distanz/Peilung, Zonen) und die UI ohne Fenster (jsdom).

## Windows-Paket bauen

```bash
npm install
npm run pack:win
```
Ergebnis im Ordner `build/JTAC-Private-Sheet-win32-x64/` – die `JTAC-Private-Sheet.exe` starten,
am besten als Verknüpfung/angeheftet, damit sie neben Arma 3 bereitsteht.

> Hinweis: `npm run pack:win` lädt beim ersten Mal das Electron-Laufzeitpaket für Windows herunter
> (ca. 100 MB). Danach ist die App komplett offline nutzbar.

## Projektstruktur

```
main.js              – Electron-Fenster (Main-Prozess)
preload.js           – sichere Brücke (Clipboard, Titel)
src/
  index.html         – Oberfläche (alle Ansichten)
  css/styles.css     – Design (dunkel/hell)
  js/
    lib/mgrs.js      – MGRS-Bibliothek (MIT, von proj4js)
    data/refdata.js  – Referenzdaten (9-Line-Felder, Karten, Brevity)
    modules/         – Grid-Rechner, Formulare, Timer, Profile, Referenzen
    app.js           – Router & Verdrahtung
test/                – Logik- und UI-Tests
```

## Ausblick (sobald die Quell-PDFs da sind)

- 9-Line-Formate & Felder exakt nach den Unit-Dokumenten (CGF 160th SOAR, 24th STS, TFW 18E, Ghost)
- Erweiterte Referenzen aus den PDFs (Verfahren, Abkürzungen, Terminologie)
