const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('quotationDesktop',{
 exportCurrentPdf:name=>ipcRenderer.invoke('qa-pdf',name),
 selectPdfDirectory:()=>ipcRenderer.invoke('qa-directory'),
 exportBatchPdf:(_token,name)=>ipcRenderer.invoke('qa-pdf',name),
 finishPdfBatch:()=>Promise.resolve()
});
