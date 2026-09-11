const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require("electron");

let serverProcess;
const desktopPort = 18765;

function dataDir() {
  return app.getPath("userData");
}

function waitForServer(url, timeoutMs = 20000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });

      req.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Local server start timeout."));
          return;
        }
        setTimeout(tick, 300);
      });

      req.setTimeout(1000, () => {
        req.destroy();
      });
    };

    tick();
  });
}

function startLocalServer() {
  if (serverProcess && !serverProcess.killed) return;

  const projectRoot = path.join(__dirname, "..");
  const serverEntry = path.join(projectRoot, "server", "index.js");
  serverProcess = spawn(process.env.QUOTE_NODE_EXE || "node", [serverEntry], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(desktopPort),
      QUOTE_DATA_DIR: dataDir()
    },
    windowsHide: true,
    stdio: "ignore"
  });
}

async function createWindow() {
  startLocalServer();
  await waitForServer(`http://127.0.0.1:${desktopPort}/index.html`);

  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1120,
    minHeight: 720,
    title: "外贸助手",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadURL(`http://127.0.0.1:${desktopPort}/index.html`);
}

function sendMenuAction(action) {
  const win = BrowserWindow.getAllWindows()[0];
  if (win && !win.isDestroyed()) win.webContents.send("desktop-menu-action", action);
}

function installChineseMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label:"设置", submenu:[
      { label:"系统设置", click:()=>sendMenuAction("settings") },
      { label:"用户管理", click:()=>sendMenuAction("users") },
      { label:"管理后台", click:()=>sendMenuAction("data") },
      { type:"separator" },
      { label:"使用说明", click:()=>sendMenuAction("help") },
      { label:"退出登录", click:()=>sendMenuAction("logout") },
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

app.whenReady().then(() => { installChineseMenu(); return createWindow(); });

app.on("window-all-closed", () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
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

