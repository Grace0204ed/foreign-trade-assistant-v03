const { app } = require("electron");

app.whenReady().then(() => {
  const Database = require("better-sqlite3");
  const probe = new Database(":memory:");
  probe.prepare("SELECT 1 AS ok").get();
  probe.close();
  console.log("Electron SQLite ready / Electron SQLite 已就绪");
  app.exit(0);
}).catch((error) => {
  console.error("Electron SQLite check failed / Electron SQLite 检查失败");
  console.error(error);
  app.exit(1);
});
