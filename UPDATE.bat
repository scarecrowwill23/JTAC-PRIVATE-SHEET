@echo off
REM ============================================================
REM  JTAC HELPER - AUTOMATISCHES UPDATE
REM  Einfach DOPPELKLICKEN. Das Fenster macht alles von allein.
REM ============================================================
chcp 65001 >nul
setlocal EnableDelayedExpansion
title JTAC HELPER - UPDATE
cd /d "%~dp0"

echo.
echo  ========================================================
echo          JTAC HELPER  -  AUTOMATISCHES UPDATE
echo  ========================================================
echo.
echo   Keine Panik: Du musst hier NICHTS eintippen.
echo   Einfach zugucken. Am Ende steht hier: FERTIG!
echo.
echo   Deine Missionen und Einstellungen bleiben erhalten.
echo.
echo  --------------------------------------------------------
echo.

REM ---- Schritt 1: Gibt es "git" auf diesem PC? ----
where git >nul 2>nul
if errorlevel 1 goto NOGIT

REM ---- Schritt 2: Neue Version herunterladen ----
echo   [1/3] Lade die neue Version herunter ...
echo.
git pull --ff-only
if errorlevel 1 goto PULLFAIL
echo.
echo         OK - neue Version ist da.
echo.
goto STEPNPM

:STEPNPMSKIP
echo.

REM ---- Schritt 3: Zutaten nachinstallieren ----
:STEPNPM
where npm >nul 2>nul
if errorlevel 1 goto NONPM
echo   [2/3] Aktualisiere die App-Zutaten (dauert kurz) ...
echo.
call npm install --no-audit --no-fund
if errorlevel 1 goto NPMFAIL
echo.
echo         OK.
echo.

REM ---- Schritt 4: Windows-Programm (EXE) neu bauen? ----
echo   [3/3] Soll das Windows-Programm (die EXE) neu gebaut werden?
echo         Nur noetig, wenn du die App ueber die EXE startest.
echo.
set "BUILD=J"
set /p "BUILD=        Enter = JA bauen     (n = ueberspringen): "
if /i "%BUILD%"=="n" goto DONE

echo.
echo         Baue Windows-Programm ... (das dauert 1-2 Minuten)
echo.
call npm run pack:win
if errorlevel 1 goto BUILDFAIL
echo.
echo         OK - das neue Programm liegt im Ordner "build".
if exist "build" ( start "" explorer "build" )
goto DONE

REM ============================================================
REM  Fehler-Meldungen (in einfachem Deutsch)
REM ============================================================
:NOGIT
color 0C
echo.
echo  >>> FEHLER: Das Programm "git" fehlt auf deinem PC. <<<
echo.
echo  So reparierst du das (3 Minuten):
echo    1. Im Browser oeffnen:  https://git-scm.com/download/win
echo    2. Herunterladen und installieren (immer nur "Weiter" klicken).
echo    3. Diese UPDATE.bat nochmal doppelklicken.
echo.
goto END

:PULLFAIL
color 0C
echo.
echo  >>> FEHLER: Konnte die neue Version nicht laden. <<<
echo.
echo  Moegliche Gruende:
echo    - Kein Internet? (WLAN/LAN pruefen, dann nochmal versuchen)
echo    - Du hast Dateien in der App geaendert.
echo.
echo  Im Zweifel: App einmal komplett neu herunterladen:
echo    https://github.com/scarecrowwill23/JTAC-PRIVATE-SHEET
echo    (gruener Knopf "Code" -^> "Download ZIP")
echo.
goto END

:NONPM
color 0C
echo.
echo  >>> FEHLER: Das Programm "npm" fehlt auf deinem PC. <<<
echo.
echo  So reparierst du das (3 Minuten):
echo    1. Im Browser oeffnen:  https://nodejs.org
echo    2. Die LTS-Version installieren (immer nur "Weiter" klicken).
echo    3. Diese UPDATE.bat nochmal doppelklicken.
echo.
goto END

:NPMFAIL
color 0C
echo.
echo  >>> FEHLER: "npm install" ist schiefgelaufen. <<<
echo.
echo  Meistens hilft: PC neu starten und diese UPDATE.bat
echo  nochmal doppelklicken. (Ja, wirklich.)
echo.
goto END

:BUILDFAIL
color 0C
echo.
echo  >>> FEHLER beim Bauen des Windows-Programms. <<<
echo.
echo  Gute Nachricht: Das Update an sich hat geklappt.
echo  Starte die App einfach ueber  "npm start"  (wie immer)
echo  oder doppelklicke diese UPDATE.bat nochmal.
echo.
goto END

REM ============================================================
:DONE
color 0A
echo.
echo  ========================================================
echo                     F E R T I G !
echo  ========================================================
echo.
echo   Das Update ist drauf. Starte die App einfach wieder.
echo.
:END
echo.
echo   (Zum Zumachen: irgendeine Taste druecken)
pause >nul
endlocal
