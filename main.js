// JTAC Private Sheet – Electron Main Process
const { app, BrowserWindow, ipcMain, clipboard, Menu } = require('electron');
const path = require('path');

let win = null;

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
