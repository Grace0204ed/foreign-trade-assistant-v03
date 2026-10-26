const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("licenseGenerator",{
  status:()=>ipcRenderer.invoke("license:status"),
  generate:(input)=>ipcRenderer.invoke("license:generate",input),
  copy:(text)=>ipcRenderer.invoke("license:copy",text),
  openData:()=>ipcRenderer.invoke("license:open-data"),
  backup:()=>ipcRenderer.invoke("license:backup")
});

