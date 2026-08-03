// JTAC Private Sheet – Preload (sichere Brücke)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('jtacAPI', {
  /** Text in die Zwischenablage kopieren (wird über den Main-Prozess gemacht). */
  copyText: (text) => ipcRenderer.invoke('clipboard-write', text),

  /** Fenstertitel setzen (z. B. für aktiven Einsatz/Profil). */
  setTitle: (title) => ipcRenderer.send('set-title', title),

  /** App-Version (aus package.json). */
  version: () => ipcRenderer.invoke('app-version'),

  /** Prüft auf GitHub, ob es eine neuere Version gibt. */
  checkUpdate: () => ipcRenderer.invoke('check-update'),

  /** Öffnet die Update-Seite (GitHub) im normalen Browser. */
  openUpdatePage: () => ipcRenderer.invoke('open-update-page'),

  platform: process.platform
});
