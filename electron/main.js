const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const { getMachineId, getLicenseStatus, activateLicense } = require("./license");

let localServer;
let desktopPort = 18765;
let downloadedUpdateFile = "";
let latestUpdateState = { status: "idle", message: "尚未检查更新" };
const packagedSelfTest = process.env.FTA_PACKAGED_SELF_TEST === "1";
// Keep installed upgrades on the same local data directory as the existing desktop app.
app.setPath("userData", process.env.QUOTE_DATA_DIR || path.join(app.getPath("appData"), "foreign-trade-assistant"));
const ownsInstance = packagedSelfTest || app.requestSingleInstanceLock();
if (!ownsInstance) app.quit();
app.on("second-instance", () => {
  const win=BrowserWindow.getAllWindows()[0];
  if(win){if(win.isMinimized())win.restore();if(!win.isVisible())win.show();win.focus();}
});
function dataDir() { return app.getPath("userData"); }

function runPackagedSelfTest() {
  const Database = require("better-sqlite3");
  const probe = new Database(":memory:");
  const result = probe.prepare("SELECT 1 AS ok").get();
  probe.close();
  if (result?.ok !== 1) throw new Error("SQLite packaged runtime returned an invalid result");
  require("express");
  require("electron-updater");
  console.log(`FTA_PACKAGED_SELF_TEST_OK electron=${process.versions.electron} modules=${process.versions.modules} arch=${process.arch}`);
}

async function startLocalServer() {
  if(localServer?.listening){
    const currentAddress=localServer.address();
    if(currentAddress){desktopPort=currentAddress.port;return;}
  }
  localServer=null;
  process.env.QUOTE_DATA_DIR=dataDir();
  const {startServer}=require("../server/index");
  try { localServer=await startServer(desktopPort); }
  catch(error) {
    if(error.code!=="EADDRINUSE")throw error;
    // Never load an older service accidentally when a development copy is still running.
    localServer=await startServer(0);
  }
  let address=localServer?.address();
  if(!localServer?.listening||!address){
    try{localServer?.close();}catch(_){/* ignore stale server */}
    localServer=await startServer(0);
    address=localServer.address();
  }
  if(!address)throw new Error("本地服务启动后未能取得监听端口");
  desktopPort=address.port;
}
async function createWindow() {
  await startLocalServer();
  const win = new BrowserWindow({
    width:1360,height:900,minWidth:1000,minHeight:700,
    title:"外贸助手",show:false,icon:path.join(__dirname,"../assets/app-icon.png"),
    webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}
  });
  win.once("ready-to-show",()=>win.show());
  win.webContents.once("did-finish-load",()=>{if(!win.isVisible())win.show();});
  win.webContents.on("before-input-event",(event,input)=>{
    if(input.type==="keyDown"&&input.key==="F5"){
      event.preventDefault();
      win.webContents.reloadIgnoringCache();
    }
  });
  await win.loadURL(`http://127.0.0.1:${desktopPort}/index.html`);
}

async function createActivationWindow() {
  const win = new BrowserWindow({
    width:760,height:680,resizable:false,maximizable:false,
    title:"激活外贸助手",show:false,icon:path.join(__dirname,"../assets/app-icon.png"),
    webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}
  });
  win.once("ready-to-show",()=>win.show());
  await win.loadFile(path.join(__dirname,"activation.html"));
}

function developmentLicenseBypass() {
  return !app.isPackaged && process.env.FTA_LICENSE_BYPASS === "1";
}

async function openLicensedApplication() {
  if (developmentLicenseBypass() || getLicenseStatus(dataDir(), app.getVersion()).licensed) return createWindow();
  return createActivationWindow();
}

function publishUpdateState(payload) {
  latestUpdateState = { ...latestUpdateState, ...payload, updatedAt: new Date().toISOString() };
  try {
    fs.mkdirSync(dataDir(), { recursive: true });
    fs.appendFileSync(path.join(dataDir(), "update.log"), `${latestUpdateState.updatedAt} ${JSON.stringify(latestUpdateState)}\n`);
  } catch (_) { /* update logging must never block the application */ }
  BrowserWindow.getAllWindows().forEach(win=>{if(!win.isDestroyed())win.webContents.send("app-update-state",payload);});
}
function configureUpdater() {
  autoUpdater.autoDownload=false;
  autoUpdater.autoInstallOnAppQuit=true;
  autoUpdater.allowPrerelease=false;
  autoUpdater.on("checking-for-update",()=>publishUpdateState({status:"checking",message:"正在检查更新…"}));
  autoUpdater.on("update-available",info=>publishUpdateState({status:"available",version:info.version,message:`发现新版本 ${info.version}`}));
  autoUpdater.on("update-not-available",info=>publishUpdateState({status:"current",version:info.version,message:"当前已是最新正式版"}));
  autoUpdater.on("download-progress",progress=>publishUpdateState({status:"downloading",percent:Math.round(progress.percent||0),transferred:progress.transferred,total:progress.total,message:`正在下载 ${Math.round(progress.percent||0)}%`}));
  autoUpdater.on("update-downloaded",info=>{
    downloadedUpdateFile=String(info?.downloadedFile||"");
    publishUpdateState({status:"downloaded",version:info.version,downloadedFile:downloadedUpdateFile,message:"更新已下载，可以重启安装"});
  });
  autoUpdater.on("error",error=>publishUpdateState({status:"error",message:`更新失败：${error.message}`}));
}

function installDownloadedUpdate() {
  if (downloadedUpdateFile && fs.existsSync(downloadedUpdateFile)) {
    publishUpdateState({status:"installing",message:"正在关闭软件并安装更新…"});
    const child=spawn(downloadedUpdateFile,["/S"],{detached:true,stdio:"ignore",windowsHide:true});
    child.unref();
    setTimeout(()=>app.quit(),500);
    return { method:"verified-installer" };
  }
  publishUpdateState({status:"installing",message:"正在关闭软件并安装更新…"});
  setImmediate(()=>autoUpdater.quitAndInstall(false,true));
  return { method:"electron-updater" };
}
function startupError(error){
  fs.mkdirSync(dataDir(),{recursive:true});
  fs.appendFileSync(path.join(dataDir(),"startup-error.log"),new Date().toISOString()+" "+(error.stack||error)+"\n");
  dialog.showErrorBox("外贸助手启动失败","未能启动本地服务，历史数据未删除。\n"+error.message+"\n日志位置："+dataDir());
  app.quit();
}

function sendMenuAction(action) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win && !win.isDestroyed()) win.webContents.send("desktop-menu-action", action);
}

function installChineseMenu() {
  Menu.setApplicationMenu(null);
}

if(ownsInstance)app.whenReady().then(() => {
  if (packagedSelfTest) {
    runPackagedSelfTest();
    app.exit(0);
    return;
  }
  installChineseMenu();configureUpdater();return openLicensedApplication();
}).catch(error=>{
  if (packagedSelfTest) {
    console.error("FTA_PACKAGED_SELF_TEST_FAILED", error?.stack || error);
    app.exit(1);
    return;
  }
  startupError(error);
});

app.on("window-all-closed", () => {
  if (localServer) { localServer.close(); localServer=null; }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (ownsInstance && BrowserWindow.getAllWindows().length === 0) openLicensedApplication().catch(startupError);
});

ipcMain.handle("get-license-status",()=>getLicenseStatus(dataDir(),app.getVersion()));
ipcMain.handle("activate-license",(_event,activationCode)=>{
  try { return {ok:true,...activateLicense(dataDir(),app.getVersion(),activationCode)}; }
  catch(error){return {ok:false,machineId:getMachineId(),message:error.message};}
});
ipcMain.handle("complete-activation",async(event)=>{
  const status=getLicenseStatus(dataDir(),app.getVersion());
  if(!status.licensed)throw new Error(status.message||"授权验证失败");
  const activationWindow=BrowserWindow.fromWebContents(event.sender);
  await createWindow();
  if(activationWindow&&!activationWindow.isDestroyed())activationWindow.close();
  return true;
});

ipcMain.handle("select-pdf-path", async () => {
  const result = await dialog.showSaveDialog({
    title: "Export PDF / 导出 PDF",
    defaultPath: path.join(app.getPath("desktop"), "quotation.pdf"),
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  return result.canceled ? null : result.filePath;
});

function safePdfFileName(name) {
  const value = String(name || "quotation.pdf")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return value.toLowerCase().endsWith(".pdf") ? value : `${value || "quotation"}.pdf`;
}

ipcMain.handle("export-current-pdf", async (event, fileName) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(win, {
    title: "Export PDF / 导出 PDF",
    defaultPath: path.join(app.getPath("desktop"), safePdfFileName(fileName)),
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  if (result.canceled || !result.filePath) return null;
  await win.webContents.executeJavaScript(`(async()=>{
    await document.fonts.ready;
    const visibleImages=[...document.images].filter(img=>img.src&&getComputedStyle(img).display!=="none");
    await Promise.all(visibleImages.map(img=>img.complete&&img.naturalWidth>0?Promise.resolve():
      Promise.race([img.decode?.()||new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject}),new Promise(resolve=>setTimeout(resolve,5000))]).catch(()=>{})));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  })()`);
  const pdf = await win.webContents.printToPDF({
    printBackground: true,
    marginsType: 0,
    pageSize: "A4"
  });
  fs.writeFileSync(result.filePath, pdf);
  return result.filePath;
});

ipcMain.handle("open-data-dir", async () => {
  await shell.openPath(dataDir());
  return dataDir();
});

ipcMain.handle("select-restore-db", async () => {
  const result = await dialog.showOpenDialog({
    title: "Restore Database / 恢复数据库",
    filters: [{ name: "SQLite Database", extensions: ["sqlite", "db"] }],
    properties: ["openFile"]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("select-import-json", async () => {
  const result = await dialog.showOpenDialog({
    title: "Import Data / 导入数据",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"]
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("get-app-version",()=>({version:app.getVersion(),platform:process.platform,arch:process.arch,packaged:app.isPackaged}));
ipcMain.handle("get-update-state",()=>latestUpdateState);
ipcMain.handle("check-for-updates",async()=>{
  if(!app.isPackaged)return {status:"development",message:"开发模式不执行在线更新"};
  try { const result=await autoUpdater.checkForUpdates();return {status:"checked",version:result?.updateInfo?.version||""}; }
  catch(error){publishUpdateState({status:"error",message:`检查更新失败：${error.message}`});throw error;}
});
ipcMain.handle("download-update",async()=>{
  if(!app.isPackaged)throw new Error("开发模式不能下载安装包");
  try { await autoUpdater.downloadUpdate();return true; }
  catch(error){publishUpdateState({status:"error",message:`下载更新失败：${error.message}`});throw error;}
});
ipcMain.handle("install-update",()=>{
  if(!app.isPackaged)throw new Error("开发模式不能安装更新");
  return installDownloadedUpdate();
});

