const { spawnSync } = require("child_process");

function sqliteWorks() {
  try {
    require("better-sqlite3");
    return true;
  } catch (error) {
    console.log("SQLite needs rebuild / SQLite 需要修复:");
    console.log(error.message);
    return false;
  }
}

if (sqliteWorks()) {
  console.log("SQLite ready / SQLite 已就绪");
  process.exit(0);
}

const result = spawnSync("npm", ["rebuild", "better-sqlite3"], {
  stdio: "inherit",
  shell: true
});

if (result.status !== 0) {
  console.error("SQLite rebuild failed / SQLite 修复失败");
  process.exit(result.status || 1);
}

if (!sqliteWorks()) {
  console.error("SQLite still cannot load / SQLite 仍然无法加载");
  process.exit(1);
}

console.log("SQLite repaired / SQLite 已修复");
