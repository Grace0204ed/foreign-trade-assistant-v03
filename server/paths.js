const fs = require("fs");
const os = require("os");
const path = require("path");

function defaultDataDir() {
  if (process.env.QUOTE_DATA_DIR) return process.env.QUOTE_DATA_DIR;
  const base = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
  return path.join(base, "Quotation System");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const dataDir = ensureDir(defaultDataDir());
const uploadDir = ensureDir(path.join(dataDir, "uploads"));
const backupDir = ensureDir(path.join(dataDir, "backups"));
const exportDir = ensureDir(path.join(dataDir, "exports"));
const dbPath = path.join(dataDir, "quotation-system.sqlite");
const browserStatePath = path.join(dataDir, "browser-state.json");

module.exports = { dataDir, uploadDir, backupDir, exportDir, dbPath, browserStatePath, ensureDir };
