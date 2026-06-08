const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("quotationDesktop", {
  selectPdfPath: () => ipcRenderer.invoke("select-pdf-path"),
  exportCurrentPdf: () => ipcRenderer.invoke("export-current-pdf"),
  openDataDir: () => ipcRenderer.invoke("open-data-dir"),
  selectRestoreDb: () => ipcRenderer.invoke("select-restore-db"),
  selectImportJson: () => ipcRenderer.invoke("select-import-json")
});
