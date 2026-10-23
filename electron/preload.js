const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("quotationDesktop", {
  selectPdfPath: () => ipcRenderer.invoke("select-pdf-path"),
  exportCurrentPdf: (fileName) => ipcRenderer.invoke("export-current-pdf", fileName),
  openDataDir: () => ipcRenderer.invoke("open-data-dir"),
  selectRestoreDb: () => ipcRenderer.invoke("select-restore-db"),
  selectImportJson: () => ipcRenderer.invoke("select-import-json"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateState: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("app-update-state", listener);
    return () => ipcRenderer.removeListener("app-update-state", listener);
  },
  onMenuAction: (callback) => {
    const listener = (_event, action) => callback(action);
    ipcRenderer.on("desktop-menu-action", listener);
    return () => ipcRenderer.removeListener("desktop-menu-action", listener);
  },
  adjustZoom: (direction) => {
    const current = webFrame.getZoomFactor();
    const next = direction === 0 ? 1 : Math.min(2, Math.max(0.6, current + (direction > 0 ? 0.1 : -0.1)));
    webFrame.setZoomFactor(Number(next.toFixed(2)));
    return webFrame.getZoomFactor();
  }
});
