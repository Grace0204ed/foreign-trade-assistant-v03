const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");

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
    title: "Quotation System / 报价系统",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadURL(`http://127.0.0.1:${desktopPort}/index.html`);
}

app.whenReady().then(createWindow);

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

