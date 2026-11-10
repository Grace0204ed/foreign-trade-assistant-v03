const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("quotationDesktop", {
  createDocumentPreview: payload => ipcRenderer.invoke('document-preview-create',payload),
  setDocumentPreviewMode: (token,mode) => ipcRenderer.invoke('document-preview-mode',token,mode),
  exportDocumentPreview: (token,batchToken) => ipcRenderer.invoke('document-preview-export',token,batchToken),
  printDocumentPreview: (token,options) => ipcRenderer.invoke('document-preview-print',token,options),
  closeDocumentPreview: token => ipcRenderer.invoke('document-preview-close',token),
  exportCatalogPdf: html => ipcRenderer.invoke('export-catalog-pdf',html),
  printCatalog: html => ipcRenderer.invoke('print-catalog',html),
  selectPdfDirectory: () => ipcRenderer.invoke('select-pdf-directory'),
  exportBatchPdf: (token,name) => ipcRenderer.invoke('export-batch-pdf',token,name),
  finishPdfBatch: token => ipcRenderer.invoke('finish-pdf-batch',token),
  selectPdfPath: () => ipcRenderer.invoke("select-pdf-path"),
  exportCurrentPdf: (fileName) => ipcRenderer.invoke("export-current-pdf", fileName),
  openDataDir: () => ipcRenderer.invoke("open-data-dir"),
  selectRestoreDb: () => ipcRenderer.invoke("select-restore-db"),
  selectImportJson: () => ipcRenderer.invoke("select-import-json"),
  getLicenseStatus: () => ipcRenderer.invoke("get-license-status"),
  getPublisherContact: () => ipcRenderer.invoke('get-publisher-contact'),
  savePublisherContact: value => ipcRenderer.invoke('save-publisher-contact',value),
  activateLicense: (activationCode) => ipcRenderer.invoke("activate-license", activationCode),
  completeActivation: () => ipcRenderer.invoke("complete-activation"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getUpdateState: () => ipcRenderer.invoke("get-update-state"),
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
