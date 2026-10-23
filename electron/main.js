const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");

let localServer;
let desktopPort = 18765;
// Keep installed upgrades on the same local data directory as the existing desktop app.
app.setPath("userData", process.env.QUOTE_DATA_DIR || path.join(app.getPath("appData"), "foreign-trade-assistant"));
const ownsInstance = app.requestSingleInstanceLock();
if (!ownsInstance) app.quit();
app.on("second-instance", () => {
  const win=BrowserWindow.getAllWindows()[0];
  if(win){if(win.isMinimized())win.restore();if(!win.isVisible())win.show();win.focus();}
});
function dataDir() { return app.getPath("userData"); }

async function startLocalServer() {
  if(localServer)return;
  process.env.QUOTE_DATA_DIR=dataDir();
  const {startServer}=require("../server/index");
  try { localServer=await startServer(desktopPort); }
  catch(error) {
    if(error.code!=="EADDRINUSE")throw error;
    // Never load an older service accidentally when a development copy is still running.
    localServer=await startServer(0);
  }
  desktopPort=localServer.address().port;
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
  await win.loadURL(`http://127.0.0.1:${desktopPort}/index.html`);
}

function publishUpdateState(payload) {
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
  autoUpdater.on("update-downloaded",info=>publishUpdateState({status:"downloaded",version:info.version,message:"更新已下载，可以重启安装"}));
  autoUpdater.on("error",error=>publishUpdateState({status:"error",message:`更新失败：${error.message}`}));
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
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label:"设置", submenu:[
      { label:"系统设置", click:()=>sendMenuAction("settings") },
      { label:"管理后台", click:()=>sendMenuAction("data") },
      { type:"separator" },
      { label:"使用说明", click:()=>sendMenuAction("help") },
      { type:"separator" },
      { role:"quit", label:"退出软件" }
    ] },
    { label:"文字操作", submenu:[{ role:"undo", label:"撤销" },{ role:"redo", label:"重做" },{ type:"separator" },{ role:"cut", label:"剪切" },{ role:"copy", label:"复制" },{ role:"paste", label:"粘贴" },{ role:"selectAll", label:"全选" }] },
    { label:"视图", submenu:[{ role:"reload", label:"刷新" },{ role:"forceReload", label:"强制刷新" },{ role:"toggleDevTools", label:"开发者工具" },{ type:"separator" },{ role:"resetZoom", label:"实际大小" },{ role:"zoomIn", label:"放大" },{ role:"zoomOut", label:"缩小" },{ role:"togglefullscreen", label:"全屏" }] },
    { label:"窗口", submenu:[{ role:"minimize", label:"最小化" },{ role:"close", label:"关闭窗口" }] },
    { label:"帮助", submenu:[
      { label:"使用说明", click:()=>sendMenuAction("help") },
      { label:"联系我们", click:()=>sendMenuAction("contact") }
    ] }
  ]));
}

if(ownsInstance)app.whenReady().then(() => { installChineseMenu();configureUpdater();return createWindow(); }).catch(startupError);

app.on("window-all-closed", () => {
  if (localServer) { localServer.close(); localServer=null; }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (ownsInstance && BrowserWindow.getAllWindows().length === 0) createWindow().catch(startupError);
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
ipcMain.handle("check-for-updates",async()=>{
  if(!app.isPackaged)return {status:"development",message:"开发模式不执行在线更新"};
  try { const result=await autoUpdater.checkForUpdates();return {status:"checked",version:result?.updateInfo?.version||""}; }
  catch(error){publishUpdateState({status:"error",message:`检查更新失败：${error.message}`});throw error;}
});
ipcMain.handle("download-update",async()=>{if(!app.isPackaged)throw new Error("开发模式不能下载安装包");await autoUpdater.downloadUpdate();return true;});
ipcMain.handle("install-update",()=>{if(!app.isPackaged)throw new Error("开发模式不能安装更新");setImmediate(()=>autoUpdater.quitAndInstall(false,true));return true;});

