const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("quotationDesktop", {
  selectPdfPath: () => ipcRenderer.invoke("select-pdf-path"),
  exportCurrentPdf: (fileName) => ipcRenderer.invoke("export-current-pdf", fileName),
  openDataDir: () => ipcRenderer.invoke("open-data-dir"),
  selectRestoreDb: () => ipcRenderer.invoke("select-restore-db"),
  selectImportJson: () => ipcRenderer.invoke("select-import-json"),
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
