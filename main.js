// JTAC Private Sheet – Electron Main Process
const { app, BrowserWindow, ipcMain, clipboard, Menu, shell } = require('electron');
const path = require('path');
const https = require('https');
const VersionLib = require('./src/js/lib/version.js');

let win = null;

// Wo die App nach Updates schaut: package.json auf dem main-Branch (öffentlich erreichbar).
const UPDATE_VERSION_URL = 'https://raw.githubusercontent.com/scarecrowwill23/JTAC-PRIVATE-SHEET/main/package.json';
const UPDATE_PAGE_URL = 'https://github.com/scarecrowwill23/JTAC-PRIVATE-SHEET';

/** Holt die Versionsnummer der neuesten Veröffentlichung (main-Branch). */
function fetchLatestVersion(redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    const req = https.get(UPDATE_VERSION_URL, {
      headers: { 'User-Agent': 'JTAC-Helper-Update-Check', 'Accept': 'application/json' }
    }, (res) => {
      // Redirects folgen (z. B. falls GitHub die Adresse mal umbaut)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        res.resume();
        return resolve(fetchLatestVersion(redirectsLeft - 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('Antwort ' + res.statusCode));
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const m = body.match(/"version"\s*:\s*"([^"]+)"/);
          if (m) resolve(m[1]);
          else reject(new Error('Keine Versionsnummer gefunden'));
        } catch (e) { reject(e); }
      });
    });
    req.setTimeout(8000, () => req.destroy(new Error('Zeitüberschreitung')));
    req.on('error', reject);
  });
}

// --- IPC: Update-Check (App-Version vs. GitHub/main) ---
ipcMain.handle('check-update', async () => {
  const current = app.getVersion();
  try {
    const latest = await fetchLatestVersion();
    return {
      ok: true,
      current,
      latest,
      updateAvailable: VersionLib.isNewer(latest, current),
      url: UPDATE_PAGE_URL
    };
  } catch (e) {
    return { ok: false, current, error: String(e && e.message ? e.message : e), url: UPDATE_PAGE_URL };
  }
});

// --- IPC: Update-Seite im normalen Browser öffnen ---
ipcMain.handle('open-update-page', () => {
  shell.openExternal(UPDATE_PAGE_URL);
  return true;
});

function createWindow() {
  win = new BrowserWindow({
    width: 1380,
    height: 860,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#101410',
    title: 'JTAC Helper',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.setMenuBarVisibility(false);
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'src', 'index.html'));

  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC: Clipboard ---
ipcMain.handle('clipboard-write', (_evt, text) => {
  clipboard.writeText(String(text ?? ''));
  return true;
});

// --- IPC: App-Version ---
ipcMain.handle('app-version', () => app.getVersion());

// --- IPC: Fenster-Titel kurz setzen (Status-Info) ---
ipcMain.on('set-title', (_evt, title) => {
  if (win && !win.isDestroyed()) win.setTitle(String(title || 'JTAC Helper'));
});
