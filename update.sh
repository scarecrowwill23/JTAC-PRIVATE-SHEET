#!/usr/bin/env bash
# ============================================================
#  JTAC HELPER - AUTOMATISCHES UPDATE (Mac/Linux)
#  Einfach ausführen:  ./update.sh
#  Das Skript macht alles von allein.
# ============================================================
set -e
cd "$(dirname "$0")"

echo
echo "  ========================================================"
echo "         JTAC HELPER  -  AUTOMATISCHES UPDATE"
echo "  ========================================================"
echo
echo "  Einfach zugucken. Am Ende steht hier: FERTIG!"
echo "  Deine Missionen und Einstellungen bleiben erhalten."
echo

echo "  [1/2] Lade die neue Version herunter ..."
git pull --ff-only || {
  echo
  echo "  >>> FEHLER: Konnte nicht aktualisieren. <<<"
  echo "  Kein Internet? Oder Dateien geändert?"
  echo "  Plan B: App neu herunterladen:"
  echo "  https://github.com/scarecrowwill23/JTAC-PRIVATE-SHEET"
  exit 1
}
echo "        OK."

echo
echo "  [2/2] Aktualisiere die App-Zutaten ..."
npm install --no-audit --no-fund
echo "        OK."

echo
echo "  ========================================================"
echo "                    F E R T I G !"
echo "  ========================================================"
echo
echo "  Das Update ist drauf. Starte die App einfach wieder."
echo
