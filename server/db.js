const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { dbPath, dataDir } = require("./paths");

const pendingRestorePath = path.join(dataDir, "restore-pending.sqlite");
if (fs.existsSync(pendingRestorePath)) {
  fs.copyFileSync(pendingRestorePath, dbPath);
  fs.unlinkSync(pendingRestorePath);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function now() {
  return new Date().toISOString();
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
}

function runSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category TEXT,
      brand TEXT,
      model TEXT,
      aliases TEXT,
      condition TEXT,
      transport_length REAL,
      transport_width REAL,
      transport_height REAL,
      transport_cbm REAL,
      dimension_unit TEXT DEFAULT 'meter',
      weight REAL,
      transport_method TEXT DEFAULT 'Bulk Cargo',
      reference_price REAL,
      params TEXT,
      remark TEXT,
      image_path TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      search_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ports (
      id TEXT PRIMARY KEY,
      country_name TEXT NOT NULL,
      country_chinese_name TEXT,
      country_code TEXT,
      port_name TEXT NOT NULL,
      port_chinese_name TEXT,
      un_locode TEXT,
      aliases TEXT,
      is_origin_port INTEGER NOT NULL DEFAULT 0,
      is_destination_port INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Active',
      remark TEXT,
      search_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS freight_rates (
      id TEXT PRIMARY KEY,
      origin_port_id TEXT NOT NULL,
      destination_port_id TEXT NOT NULL,
      origin_display_name TEXT,
      destination_display_name TEXT,
      destination_country TEXT,
      shipping_method TEXT NOT NULL DEFAULT 'Bulk Cargo',
      rate REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      rate_unit TEXT NOT NULL DEFAULT 'USD/CBM',
      effective_month TEXT NOT NULL,
      effective_start_date TEXT,
      effective_end_date TEXT,
      freight_forwarder TEXT,
      remark TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      search_text TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(origin_port_id) REFERENCES ports(id),
      FOREIGN KEY(destination_port_id) REFERENCES ports(id)
    );

    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      quote_number TEXT,
      status TEXT,
      buyer_json TEXT,
      settings_snapshot_json TEXT,
      terms_json TEXT,
      total_machine_price REAL DEFAULT 0,
      total_freight REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      include_freight_in_total INTEGER DEFAULT 1,
      show_freight_detail_in_pdf INTEGER DEFAULT 0,
      quote_date TEXT,
      valid_until TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotation_items (
      id TEXT PRIMARY KEY,
      quotation_id TEXT NOT NULL,
      product_id TEXT,
      product_snapshot_json TEXT NOT NULL,
      price_snapshot_json TEXT NOT NULL,
      freight_snapshot_json TEXT,
      include_freight_in_total INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
    );
  `);
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function upgradeDefaultAdminPassword() {
  const admin = db.prepare("SELECT * FROM users WHERE username='admin'").get();
  if (!admin) return;
  if (bcrypt.compareSync("admin123", admin.password_hash)) {
    db.prepare("UPDATE users SET password_hash=?, role='owner', status='Active', updated_at=? WHERE username='admin'")
      .run(bcrypt.hashSync("Aa1234//", 10), now());
  }
}

function seed() {
  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (!userCount) {
    const passwordHash = bcrypt.hashSync("Aa1234//", 10);
    const stmt = db.prepare("INSERT INTO users (id, username, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run("user-admin", "admin", passwordHash, "owner", "Active", now(), now());
  }

  db.prepare("UPDATE users SET role='owner', updated_at=? WHERE username='admin' AND role='admin'").run(now());
  upgradeDefaultAdminPassword();
  db.prepare("UPDATE users SET status='Inactive', updated_at=? WHERE username='staff' AND id='user-staff'").run(now());

  const settingsCount = db.prepare("SELECT COUNT(*) AS count FROM company_settings").get().count;
  if (!settingsCount) {
    db.prepare("INSERT INTO company_settings (id, data_json, created_at, updated_at) VALUES (1, ?, ?, ?)").run(JSON.stringify({
      companyNameEn: "Jinwanwa International Trading Co., Ltd.",
      companyNameZh: "合肥金万挖工程机械有限公司",
      contactPerson: "Ethan",
      companyPhone: "",
      companyEmail: "",
      companyAddressEn: "Hefei, China",
      companyAddressZh: "中国合肥",
      currency: "USD",
      showFreightDetailInPdf: false,
      logoPath: "",
      backgroundPath: "",
      stampPath: ""
    }), now(), now());
  }

  if (!db.prepare("SELECT COUNT(*) AS count FROM ports").get().count) {
    const ports = [
      ["port-shanghai", "China", "中国", "CN", "Shanghai Port", "上海港", "CNSHA", "上海, 上海港, Shanghai, Shanghai Port, CNSHA, 中国上海", 1, 0, "Active", ""],
      ["port-tanga", "Tanzania", "坦桑尼亚", "TZ", "Tanga Port", "坦噶港", "", "坦噶, 坦噶港, Tanga, Tanga Port, Tanzania Tanga, 坦桑坦噶, 坦桑", 0, 1, "Active", ""],
      ["port-dar", "Tanzania", "坦桑尼亚", "TZ", "Dar es Salaam Port", "达累斯萨拉姆港", "", "达累斯萨拉姆, 达累斯, Dar, Dar es Salaam, Dar es Salaam Port, Tanzania Dar, 坦桑", 0, 1, "Active", ""],
      ["port-beira", "Mozambique", "莫桑比克", "MZ", "Beira Port", "贝拉港", "", "贝拉, 贝拉港, Beira, Beira Port, Mozambique Beira, 莫桑比克贝拉", 0, 1, "Active", ""],
      ["port-mombasa", "Kenya", "肯尼亚", "KE", "Mombasa Port", "蒙巴萨港", "", "蒙巴萨, 蒙巴萨港, Mombasa, Mombasa Port, Kenya Mombasa", 0, 1, "Active", ""]
    ];
    const stmt = db.prepare(`INSERT INTO ports
      (id, country_name, country_chinese_name, country_code, port_name, port_chinese_name, un_locode, aliases, is_origin_port, is_destination_port, status, remark, search_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    ports.forEach((p) => stmt.run(...p, normalize(p.join(" ")), now(), now()));
  }

  if (!db.prepare("SELECT COUNT(*) AS count FROM products").get().count) {
    const products = [
      ["product-sany-215c", "Excavator", "SANY", "SANY 215C", "三一215, 三一215C, 31215, 31215C, SANY215, SANY 215C, SY215, SY215C, 215C", "Used", null, null, null, null, "meter", null, "Bulk Cargo", null, "", "Transport dimension required", "", "Active"],
      ["product-cat-320c", "Excavator", "CAT", "CAT 320C", "卡特320, 卡特320C, CAT320, CAT320C, Caterpillar 320C, 320C", "Used", null, null, null, null, "meter", null, "Bulk Cargo", null, "", "Large excavator. Accurate transport dimension required.", "", "Active"],
      ["product-cat-140h", "Motor Grader", "CAT", "CAT 140H", "卡特140H, CAT140H, Caterpillar 140H, 140H", "Used", null, null, null, null, "meter", null, "Bulk Cargo", null, "", "Transport dimension required", "", "Active"],
      ["product-sdlg-956f", "Wheel Loader", "SDLG", "SDLG 956F", "临工956F, 956F, SDLG956F", "Used", null, null, null, null, "meter", null, "Bulk Cargo", null, "", "Transport dimension required", "", "Active"]
    ];
    const stmt = db.prepare(`INSERT INTO products
      (id, category, brand, model, aliases, condition, transport_length, transport_width, transport_height, transport_cbm, dimension_unit, weight, transport_method, reference_price, params, remark, image_path, status, search_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    products.forEach((p) => stmt.run(...p, normalize(p.join(" ")), now(), now()));
  }

  if (!db.prepare("SELECT COUNT(*) AS count FROM freight_rates").get().count) {
    const rates = [
      ["freight-sha-tanga-202606", "port-shanghai", "port-tanga", "Shanghai Port, China", "Tanga Port, Tanzania", "Tanzania", "Bulk Cargo", 112, "USD", "USD/CBM", "2026-06", "2026-06-01", "2026-06-30", "", "Reference rate only", "Active"],
      ["freight-sha-beira-202606", "port-shanghai", "port-beira", "Shanghai Port, China", "Beira Port, Mozambique", "Mozambique", "Bulk Cargo", 120, "USD", "USD/CBM", "2026-06", "2026-06-01", "2026-06-30", "", "For Zimbabwe cargo via Beira Port", "Active"],
      ["freight-sha-dar-202606", "port-shanghai", "port-dar", "Shanghai Port, China", "Dar es Salaam Port, Tanzania", "Tanzania", "Bulk Cargo", 115, "USD", "USD/CBM", "2026-06", "2026-06-01", "2026-06-30", "", "Reference rate only", "Active"]
    ];
    const stmt = db.prepare(`INSERT INTO freight_rates
      (id, origin_port_id, destination_port_id, origin_display_name, destination_display_name, destination_country, shipping_method, rate, currency, rate_unit, effective_month, effective_start_date, effective_end_date, freight_forwarder, remark, status, search_text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    rates.forEach((r) => stmt.run(...r, normalize(r.join(" ")), now(), now()));
  }
}

runSchema();
seed();

module.exports = { db, id, now, normalize, dbPath };
