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

    CREATE TABLE IF NOT EXISTS custom_hs_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name_zh TEXT NOT NULL,
      name_en TEXT DEFAULT '',
      keywords TEXT DEFAULT '',
      created_by TEXT,
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

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      country TEXT DEFAULT '',
      buyer_type TEXT DEFAULT '公司买家',
      stage TEXT DEFAULT '需求确认中',
      grade TEXT DEFAULT 'B',
      project_tags TEXT DEFAULT '[]',
      equipment_tags TEXT DEFAULT '[]',
      requirement TEXT DEFAULT '',
      arrival_precision TEXT DEFAULT 'none',
      arrival_value TEXT DEFAULT '',
      next_follow_up TEXT DEFAULT '',
      next_follow_purpose TEXT DEFAULT '',
      whatsapp_number TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      content TEXT DEFAULT '',
      contact_type TEXT DEFAULT 'WhatsApp',
      outcome TEXT DEFAULT '',
      old_stage TEXT DEFAULT '',
      new_stage TEXT DEFAULT '',
      old_grade TEXT DEFAULT '',
      new_grade TEXT DEFAULT '',
      next_follow_up TEXT DEFAULT '',
      next_follow_purpose TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicle_types (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name_zh TEXT NOT NULL, name_en TEXT DEFAULT '',
      image_path TEXT DEFAULT '', description_zh TEXT DEFAULT '', description_en TEXT DEFAULT '', quote_fields_json TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chassis (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, brand TEXT NOT NULL, series TEXT DEFAULT '', model TEXT NOT NULL,
      drive_type TEXT DEFAULT '', engine TEXT DEFAULT '', horsepower TEXT DEFAULT '', emission TEXT DEFAULT '', wheelbase TEXT DEFAULT '',
      cab TEXT DEFAULT '', capacity TEXT DEFAULT '', params_zh TEXT DEFAULT '{}', params_en TEXT DEFAULT '{}', image_path TEXT DEFAULT '',
      currency TEXT DEFAULT 'USD', cost_price REAL DEFAULT 0, sale_price REAL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active',
      search_text TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS superstructures (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT DEFAULT '', brand TEXT NOT NULL, model TEXT NOT NULL,
      rated_capacity TEXT DEFAULT '', boom_sections TEXT DEFAULT '', boom_length TEXT DEFAULT '', crane_form TEXT DEFAULT '', tank_capacity TEXT DEFAULT '',
      params_zh TEXT DEFAULT '{}', params_en TEXT DEFAULT '{}', image_path TEXT DEFAULT '', currency TEXT DEFAULT 'USD',
      cost_price REAL DEFAULT 0, sale_price REAL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active', search_text TEXT DEFAULT '',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vehicle_options (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name_zh TEXT NOT NULL, name_en TEXT DEFAULT '', params_zh TEXT DEFAULT '{}', params_en TEXT DEFAULT '{}',
      currency TEXT DEFAULT 'USD', cost_price REAL DEFAULT 0, sale_price REAL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active',
      search_text TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS vehicle_attachments (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name_zh TEXT NOT NULL, name_en TEXT DEFAULT '', attachment_type TEXT DEFAULT '',
      brand TEXT DEFAULT '', model TEXT DEFAULT '', params_zh TEXT DEFAULT '{}', params_en TEXT DEFAULT '{}', image_path TEXT DEFAULT '',
      transport_length REAL DEFAULT 0, transport_width REAL DEFAULT 0, transport_height REAL DEFAULT 0, transport_cbm REAL DEFAULT 0,
      dimension_unit TEXT DEFAULT 'meter', weight REAL DEFAULT 0, currency TEXT DEFAULT 'USD', cost_price REAL DEFAULT 0, sale_price REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active', search_text TEXT DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS compatibility_rules (
      id TEXT PRIMARY KEY, vehicle_type_id TEXT NOT NULL, chassis_id TEXT NOT NULL, superstructure_id TEXT NOT NULL,
      price_mode TEXT NOT NULL DEFAULT 'standard', price_value REAL DEFAULT 0, currency TEXT DEFAULT 'USD', status TEXT NOT NULL DEFAULT 'Active',
      transport_length REAL DEFAULT 0, transport_width REAL DEFAULT 0, transport_height REAL DEFAULT 0, transport_cbm REAL DEFAULT 0,
      dimension_unit TEXT DEFAULT 'meter', transport_method TEXT DEFAULT 'Bulk Cargo',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(vehicle_type_id, chassis_id, superstructure_id),
      FOREIGN KEY(vehicle_type_id) REFERENCES vehicle_types(id), FOREIGN KEY(chassis_id) REFERENCES chassis(id),
      FOREIGN KEY(superstructure_id) REFERENCES superstructures(id)
    );
    CREATE TABLE IF NOT EXISTS compatibility_options (
      compatibility_id TEXT NOT NULL, option_id TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY(compatibility_id, option_id), FOREIGN KEY(compatibility_id) REFERENCES compatibility_rules(id) ON DELETE CASCADE,
      FOREIGN KEY(option_id) REFERENCES vehicle_options(id)
    );
    CREATE TABLE IF NOT EXISTS compatibility_attachments (
      compatibility_id TEXT NOT NULL, attachment_id TEXT NOT NULL, created_at TEXT NOT NULL,
      PRIMARY KEY(compatibility_id, attachment_id), FOREIGN KEY(compatibility_id) REFERENCES compatibility_rules(id) ON DELETE CASCADE,
      FOREIGN KEY(attachment_id) REFERENCES vehicle_attachments(id)
    );
    CREATE TABLE IF NOT EXISTS quote_series (
      id TEXT PRIMARY KEY, quote_number TEXT UNIQUE NOT NULL, quote_type TEXT NOT NULL DEFAULT 'standard', customer_id INTEGER,
      source_quote_id TEXT, created_by TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS quote_versions (
      id TEXT PRIMARY KEY, series_id TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'Draft',
      is_formal INTEGER NOT NULL DEFAULT 0, customer_id INTEGER, buyer_json TEXT NOT NULL DEFAULT '{}', currency TEXT NOT NULL DEFAULT 'USD',
      terms_json TEXT NOT NULL DEFAULT '{}', fees_json TEXT NOT NULL DEFAULT '{}', subtotal REAL DEFAULT 0, final_total REAL DEFAULT 0,
      snapshot_json TEXT NOT NULL DEFAULT '{}', search_text TEXT DEFAULT '', created_by TEXT, formalized_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(series_id, version), FOREIGN KEY(series_id) REFERENCES quote_series(id), FOREIGN KEY(customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS quote_vehicle_items (
      id TEXT PRIMARY KEY, quote_version_id TEXT NOT NULL, compatibility_id TEXT, quantity INTEGER NOT NULL DEFAULT 1,
      snapshot_json TEXT NOT NULL DEFAULT '{}', unit_price REAL DEFAULT 0, line_total REAL DEFAULT 0, sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(quote_version_id) REFERENCES quote_versions(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY, user_id TEXT, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
      before_json TEXT DEFAULT '{}', after_json TEXT DEFAULT '{}', reason TEXT DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_quote_versions_search ON quote_versions(search_text);
    CREATE INDEX IF NOT EXISTS idx_quote_versions_customer ON quote_versions(customer_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_quote_items_version ON quote_vehicle_items(quote_version_id);
  `);

  const quotationColumns = db.prepare("PRAGMA table_info(quotations)").all().map((column) => column.name);
  if (!quotationColumns.includes("customer_id")) {
    db.exec("ALTER TABLE quotations ADD COLUMN customer_id INTEGER REFERENCES customers(id)");
  }

  const customerColumns = db.prepare("PRAGMA table_info(customers)").all().map((column) => column.name);
  if (!customerColumns.includes("company")) db.exec("ALTER TABLE customers ADD COLUMN company TEXT DEFAULT ''");
  const addColumns = (table, definitions) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(column => column.name);
    for (const [name, definition] of definitions) if (!columns.includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
  };
  addColumns("vehicle_types", [["image_path","TEXT DEFAULT ''"],["description_zh","TEXT DEFAULT ''"],["description_en","TEXT DEFAULT ''"],["quote_fields_json","TEXT DEFAULT '[]'"]]);
  addColumns("chassis", [["length","REAL DEFAULT 0"],["width","REAL DEFAULT 0"],["height","REAL DEFAULT 0"],["dimension_unit","TEXT DEFAULT 'mm'"],["factory_price","REAL DEFAULT 0"]]);
  addColumns("superstructures", [["length","REAL DEFAULT 0"],["width","REAL DEFAULT 0"],["height","REAL DEFAULT 0"],["dimension_unit","TEXT DEFAULT 'mm'"],["factory_price","REAL DEFAULT 0"]]);
  addColumns("compatibility_rules", [["transport_length","REAL DEFAULT 0"],["transport_width","REAL DEFAULT 0"],["transport_height","REAL DEFAULT 0"],["transport_cbm","REAL DEFAULT 0"],["dimension_unit","TEXT DEFAULT 'meter'"],["transport_method","TEXT DEFAULT 'Bulk Cargo'"]]);
  addColumns("freight_rates", [["billing_mode","TEXT DEFAULT 'cbm'"],["container_type","TEXT DEFAULT ''"],["partner_id","TEXT DEFAULT ''"],["included_fees_json","TEXT DEFAULT '[]'"],["excluded_fees_json","TEXT DEFAULT '[]'"],["minimum_charge","REAL DEFAULT 0"]]);
  addColumns("products", [["record_type","TEXT DEFAULT 'model'"],["model_product_id","TEXT DEFAULT ''"],["inventory_code","TEXT DEFAULT ''"],["year","TEXT DEFAULT ''"],["working_hours","REAL"],["specific_price","REAL"],["currency","TEXT DEFAULT 'USD'"],["price_status","TEXT DEFAULT 'pending'"],["transport_data_status","TEXT DEFAULT 'reference'"],["transport_plans_json","TEXT DEFAULT '[]'"],["raw_import_text","TEXT DEFAULT ''"]]);
  addColumns("freight_rates", [["quote_date","TEXT DEFAULT ''"],["valid_until","TEXT DEFAULT ''"],["transit_days","TEXT DEFAULT ''"],["cargo_limit","TEXT DEFAULT ''"],["charge_rule","TEXT DEFAULT 'standard'"],["rate_status","TEXT DEFAULT 'quoted'"],["fee_items_json","TEXT DEFAULT '[]'"]]);
  addColumns("quotations", [["logistics_snapshot_json","TEXT DEFAULT '{}'" ],["series_id","TEXT DEFAULT ''"],["version","INTEGER DEFAULT 0"],["is_formal","INTEGER DEFAULT 0"],["source_quote_id","TEXT DEFAULT ''"],["formalized_at","TEXT"]]);
  db.exec("CREATE INDEX IF NOT EXISTS idx_quotations_series_version ON quotations(series_id, version DESC)");
  db.exec(`CREATE TABLE IF NOT EXISTS logistics_partners (
    id TEXT PRIMARY KEY, company_name TEXT NOT NULL, contact_name TEXT, phone TEXT, email TEXT, wechat TEXT,
    status TEXT NOT NULL DEFAULT 'Active', remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS logistics_calculations (
    id TEXT PRIMARY KEY, product_id TEXT, origin_port_id TEXT, destination_port_id TEXT, freight_rate_id TEXT, partner_id TEXT,
    shipping_method TEXT, billing_mode TEXT, container_type TEXT, quantity REAL DEFAULT 1, chargeable_cbm REAL DEFAULT 0,
    container_count REAL DEFAULT 0, unit_rate REAL DEFAULT 0, base_freight REAL DEFAULT 0, fee_items_json TEXT DEFAULT '[]',
    total_amount REAL DEFAULT 0, currency TEXT DEFAULT 'USD', snapshot_json TEXT NOT NULL, created_by TEXT, created_at TEXT NOT NULL
  );`);
  db.exec(`CREATE TABLE IF NOT EXISTS agent_authorizations (
    id TEXT PRIMARY KEY,
    authorization_number TEXT NOT NULL,
    agent_name TEXT DEFAULT '',
    country TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    data_json TEXT NOT NULL DEFAULT '{}',
    created_by TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_agent_authorizations_updated ON agent_authorizations(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_agent_authorizations_agent ON agent_authorizations(agent_name, country);`);
  db.exec(`CREATE TABLE IF NOT EXISTS country_route_links (
    id TEXT PRIMARY KEY, customer_country TEXT NOT NULL, discharge_country TEXT DEFAULT '', destination_port_id TEXT NOT NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0, sort_order INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'Active', remark TEXT DEFAULT '',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(customer_country,destination_port_id),
    FOREIGN KEY(destination_port_id) REFERENCES ports(id)
  );
  CREATE INDEX IF NOT EXISTS idx_country_route_links_country ON country_route_links(customer_country,status,sort_order);
  CREATE INDEX IF NOT EXISTS idx_products_model_inventory ON products(model_product_id,record_type,status);`);
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

function seedDefaultPorts() {
  const rows = [
    ["port-shanghai", "China", "中国", "CN", "Shanghai Port", "上海港", "CNSHA", "上海, 上海港, Shanghai, CNSHA, 华东, China origin", 1, 1, "Active", "China origin port"],
    ["port-ningbo", "China", "中国", "CN", "Ningbo-Zhoushan Port", "宁波舟山港", "CNNGB", "宁波, 舟山, 宁波港, 宁波舟山, Ningbo, Zhoushan, China origin", 1, 1, "Active", "China origin port"],
    ["port-tianjin", "China", "中国", "CN", "Tianjin Port", "天津港", "CNTXG", "天津, 天津新港, Xingang, Tianjin Xingang, China origin", 1, 1, "Active", "China origin port"],
    ["port-qingdao", "China", "中国", "CN", "Qingdao Port", "青岛港", "CNQDG", "青岛, 青岛港, Qingdao, China origin", 1, 1, "Active", "China origin port"],
    ["port-lianyungang", "China", "中国", "CN", "Lianyungang Port", "连云港港", "CNLYG", "连云港, 连云港港, Lianyungang, China origin", 1, 1, "Active", "China origin port"],
    ["port-shenzhen", "China", "中国", "CN", "Shenzhen Port", "深圳港", "CNSZX", "深圳, 盐田, 蛇口, Yantian, Shekou, Shenzhen, China origin", 1, 1, "Active", "China origin port"],
    ["port-guangzhou-nansha", "China", "中国", "CN", "Guangzhou Nansha Port", "广州南沙港", "CNNNS", "广州, 南沙, 广州港, Nansha, Guangzhou, China origin", 1, 1, "Active", "China origin port"],
    ["port-xiamen", "China", "中国", "CN", "Xiamen Port", "厦门港", "CNXMN", "厦门, 厦门港, Xiamen, China origin", 1, 1, "Active", "China origin port"],
    ["port-dalian", "China", "中国", "CN", "Dalian Port", "大连港", "CNDLC", "大连, 大连港, Dalian, China origin", 1, 1, "Active", "China origin port"],
    ["port-yantai", "China", "中国", "CN", "Yantai Port", "烟台港", "CNYNT", "烟台, 烟台港, Yantai, China origin", 1, 1, "Active", "China origin port"],
    ["port-hongkong", "Hong Kong", "中国香港", "HK", "Hong Kong Port", "香港港", "HKHKG", "香港, Hong Kong, HKG", 1, 1, "Active", "China area port"],
    ["port-fuzhou", "China", "中国", "CN", "Fuzhou Port", "福州港", "CNFOC", "福州, 福州港, Fuzhou, China origin", 1, 1, "Active", "China origin port"],
    ["port-quanzhou", "China", "中国", "CN", "Quanzhou Port", "泉州港", "CNQZJ", "泉州, 泉州港, Quanzhou, China origin", 1, 1, "Active", "China origin port"],
    ["port-wenzhou", "China", "中国", "CN", "Wenzhou Port", "温州港", "CNWNZ", "温州, 温州港, Wenzhou, China origin", 1, 1, "Active", "China origin port"],
    ["port-zhoushan", "China", "中国", "CN", "Zhoushan Port", "舟山港", "CNZOS", "舟山, 舟山港, Zhoushan, China origin", 1, 1, "Active", "China origin port"],
    ["port-taicang", "China", "中国", "CN", "Taicang Port", "太仓港", "CNTAG", "太仓, 太仓港, Taicang, Suzhou, China origin", 1, 1, "Active", "China origin port"],
    ["port-nantong", "China", "中国", "CN", "Nantong Port", "南通港", "CNNTG", "南通, 南通港, Nantong, China origin", 1, 1, "Active", "China origin port"],
    ["port-zhangjiagang", "China", "中国", "CN", "Zhangjiagang Port", "张家港港", "CNZJG", "张家港, Zhangjiagang, China origin", 1, 1, "Active", "China origin port"],
    ["port-nanjing", "China", "中国", "CN", "Nanjing Port", "南京港", "CNNKG", "南京, 南京港, Nanjing, China origin", 1, 1, "Active", "China origin port"],
    ["port-wuhan", "China", "中国", "CN", "Wuhan Port", "武汉港", "CNWUH", "武汉, 武汉港, Wuhan, Yangtze River, China origin", 1, 1, "Active", "China inland origin port"],
    ["port-chongqing", "China", "中国", "CN", "Chongqing Port", "重庆港", "CNCQI", "重庆, 重庆港, Chongqing, Yangtze River, China origin", 1, 1, "Active", "China inland origin port"],
    ["port-yingkou", "China", "中国", "CN", "Yingkou Port", "营口港", "CNYIK", "营口, 营口港, Yingkou, Bayuquan, 鲅鱼圈, China origin", 1, 1, "Active", "China origin port"],
    ["port-jinzhou", "China", "中国", "CN", "Jinzhou Port", "锦州港", "CNJNZ", "锦州, 锦州港, Jinzhou, China origin", 1, 1, "Active", "China origin port"],
    ["port-caofeidian", "China", "中国", "CN", "Caofeidian Port", "曹妃甸港", "CNCFD", "曹妃甸, 曹妃甸港, Caofeidian, Tangshan, 唐山, China origin", 1, 1, "Active", "China origin port"],
    ["port-huanghua", "China", "中国", "CN", "Huanghua Port", "黄骅港", "CNHGH", "黄骅, 黄骅港, Huanghua, Cangzhou, 沧州, China origin", 1, 1, "Active", "China origin port"],
    ["port-rizhao", "China", "中国", "CN", "Rizhao Port", "日照港", "CNRZH", "日照, 日照港, Rizhao, China origin", 1, 1, "Active", "China origin port"],
    ["port-weihai", "China", "中国", "CN", "Weihai Port", "威海港", "CNWEI", "威海, 威海港, Weihai, China origin", 1, 1, "Active", "China origin port"],
    ["port-shantou", "China", "中国", "CN", "Shantou Port", "汕头港", "CNSWA", "汕头, 汕头港, Shantou, China origin", 1, 1, "Active", "China origin port"],
    ["port-zhuhai", "China", "中国", "CN", "Zhuhai Port", "珠海港", "CNZUH", "珠海, 珠海港, Gaolan, 高栏港, Zhuhai, China origin", 1, 1, "Active", "China origin port"],
    ["port-zhanjiang", "China", "中国", "CN", "Zhanjiang Port", "湛江港", "CNZHA", "湛江, 湛江港, Zhanjiang, China origin", 1, 1, "Active", "China origin port"],
    ["port-fangchenggang", "China", "中国", "CN", "Fangchenggang Port", "防城港", "CNFAN", "防城港, Fangchenggang, Guangxi, 广西, China origin", 1, 1, "Active", "China origin port"],
    ["port-qinzhou", "China", "中国", "CN", "Qinzhou Port", "钦州港", "CNQZH", "钦州, 钦州港, Qinzhou, Guangxi, 广西, China origin", 1, 1, "Active", "China origin port"],
    ["port-haikou", "China", "中国", "CN", "Haikou Port", "海口港", "CNHAK", "海口, 海口港, Haikou, Hainan, 海南, China origin", 1, 1, "Active", "China origin port"],
    ["port-sanya", "China", "中国", "CN", "Sanya Port", "三亚港", "CNSYX", "三亚, 三亚港, Sanya, Hainan, 海南, China origin", 1, 1, "Active", "China origin port"],

    ["port-lagos-apapa", "Nigeria", "尼日利亚", "NG", "Lagos Apapa Port", "拉各斯阿帕帕港", "NGAPP", "Lagos, Apapa, 拉各斯, 拉克丝, 莱各斯, 阿帕帕, 尼日利亚, Nigeria", 0, 1, "Active", "West Africa"],
    ["port-tincan", "Nigeria", "尼日利亚", "NG", "Tin Can Island Port", "廷坎岛港", "NGTIN", "Tin Can, Tincan, Lagos, 廷坎, 拉各斯, 拉克丝, 尼日利亚", 0, 1, "Active", "West Africa"],
    ["port-onne", "Nigeria", "尼日利亚", "NG", "Onne Port", "奥内港", "NGONN", "Onne, 奥内, Port Harcourt, 哈科特港, Nigeria, 尼日利亚", 0, 1, "Active", "West Africa"],
    ["port-tema", "Ghana", "加纳", "GH", "Tema Port", "特马港", "GHTEM", "Tema, 特马, Ghana, 加纳", 0, 1, "Active", "West Africa"],
    ["port-takoradi", "Ghana", "加纳", "GH", "Takoradi Port", "塔科拉迪港", "GHTKD", "Takoradi, 塔科拉迪, Ghana, 加纳", 0, 1, "Active", "West Africa"],
    ["port-abidjan", "Cote d'Ivoire", "科特迪瓦", "CI", "Abidjan Port", "阿比让港", "CIABJ", "Abidjan, 阿比让, Cote d'Ivoire, Ivory Coast, 科特迪瓦", 0, 1, "Active", "West Africa"],
    ["port-dakar", "Senegal", "塞内加尔", "SN", "Dakar Port", "达喀尔港", "SNDKR", "Dakar, 达喀尔, Senegal, 塞内加尔", 0, 1, "Active", "West Africa"],
    ["port-douala", "Cameroon", "喀麦隆", "CM", "Douala Port", "杜阿拉港", "CMDLA", "Douala, 杜阿拉, Cameroon, 喀麦隆", 0, 1, "Active", "Central Africa"],
    ["port-lome", "Togo", "多哥", "TG", "Lome Port", "洛美港", "TGLFW", "Lome, Lomé, 洛美, Togo, 多哥", 0, 1, "Active", "West Africa"],
    ["port-cotonou", "Benin", "贝宁", "BJ", "Cotonou Port", "科托努港", "BJCOO", "Cotonou, 科托努, Benin, 贝宁, Niger, 尼日尔", 0, 1, "Active", "West Africa"],
    ["port-conakry", "Guinea", "几内亚", "GN", "Conakry Port", "科纳克里港", "GNCKY", "Conakry, 科纳克里, Guinea, 几内亚", 0, 1, "Active", "West Africa"],
    ["port-freetown", "Sierra Leone", "塞拉利昂", "SL", "Freetown Port", "弗里敦港", "SLFNA", "Freetown, 弗里敦, Sierra Leone, 塞拉利昂", 0, 1, "Active", "West Africa"],
    ["port-monrovia", "Liberia", "利比里亚", "LR", "Monrovia Port", "蒙罗维亚港", "LRMLW", "Monrovia, 蒙罗维亚, Liberia, 利比里亚", 0, 1, "Active", "West Africa"],

    ["port-dar", "Tanzania", "坦桑尼亚", "TZ", "Dar es Salaam Port", "达累斯萨拉姆港", "TZDAR", "Dar, Dar es Salaam, 达累斯萨拉姆, 达累斯, 坦桑尼亚, Tanzania, Uganda, Rwanda, Burundi, Zambia", 0, 1, "Active", "East Africa"],
    ["port-tanga", "Tanzania", "坦桑尼亚", "TZ", "Tanga Port", "坦噶港", "TZTGT", "Tanga, 坦噶, 坦桑尼亚, Tanzania", 0, 1, "Active", "East Africa"],
    ["port-mombasa", "Kenya", "肯尼亚", "KE", "Mombasa Port", "蒙巴萨港", "KEMBA", "Mombasa, 蒙巴萨, Kenya, 肯尼亚, Uganda, Rwanda, Burundi", 0, 1, "Active", "East Africa"],
    ["port-djibouti", "Djibouti", "吉布提", "DJ", "Djibouti Port", "吉布提港", "DJJIB", "Djibouti, 吉布提, Ethiopia, 埃塞俄比亚", 0, 1, "Active", "East Africa"],
    ["port-berbera", "Somaliland", "索马里兰", "SO", "Berbera Port", "柏培拉港", "SOBBO", "Berbera, 柏培拉, Somalia, Somaliland, 索马里, 索马里兰", 0, 1, "Active", "East Africa"],
    ["port-mogadishu", "Somalia", "索马里", "SO", "Mogadishu Port", "摩加迪沙港", "SOMGQ", "Mogadishu, 摩加迪沙, Somalia, 索马里", 0, 1, "Active", "East Africa"],

    ["port-beira", "Mozambique", "莫桑比克", "MZ", "Beira Port", "贝拉港", "MZBEW", "Beira, 贝拉, 莫桑比克, Mozambique, Zimbabwe, 津巴布韦, Zambia, Malawi, 马拉维", 0, 1, "Active", "Southern Africa corridor"],
    ["port-maputo", "Mozambique", "莫桑比克", "MZ", "Maputo Port", "马普托港", "MZMPM", "Maputo, 马普托, 莫桑比克, Mozambique, South Africa, 南非", 0, 1, "Active", "Southern Africa"],
    ["port-nacala", "Mozambique", "莫桑比克", "MZ", "Nacala Port", "纳卡拉港", "MZMNC", "Nacala, 纳卡拉, Mozambique, 莫桑比克, Malawi, 马拉维", 0, 1, "Active", "Southern Africa"],
    ["port-durban", "South Africa", "南非", "ZA", "Durban Port", "德班港", "ZADUR", "Durban, 德班, South Africa, 南非, Zimbabwe, 津巴布韦, Zambia, Botswana, 博茨瓦纳", 0, 1, "Active", "Southern Africa"],
    ["port-cape-town", "South Africa", "南非", "ZA", "Cape Town Port", "开普敦港", "ZACPT", "Cape Town, 开普敦, South Africa, 南非", 0, 1, "Active", "Southern Africa"],
    ["port-ngqura", "South Africa", "南非", "ZA", "Ngqura Port", "恩古拉港", "ZANGQ", "Ngqura, Coega, 恩古拉, 库哈, South Africa, 南非", 0, 1, "Active", "Southern Africa"],
    ["port-walvis-bay", "Namibia", "纳米比亚", "NA", "Walvis Bay Port", "鲸湾港", "NAWVB", "Walvis Bay, 鲸湾, Namibia, 纳米比亚", 0, 1, "Active", "Southern Africa"],
    ["port-luanda", "Angola", "安哥拉", "AO", "Luanda Port", "罗安达港", "AOLAD", "Luanda, 罗安达, Angola, 安哥拉", 0, 1, "Active", "Southern Africa"],
    ["port-lobito", "Angola", "安哥拉", "AO", "Lobito Port", "洛比托港", "AOLOB", "Lobito, 洛比托, Angola, 安哥拉", 0, 1, "Active", "Southern Africa"],

    ["port-alexandria", "Egypt", "埃及", "EG", "Alexandria Port", "亚历山大港", "EGALY", "Alexandria, 亚历山大, Egypt, 埃及", 0, 1, "Active", "North Africa"],
    ["port-port-said", "Egypt", "埃及", "EG", "Port Said Port", "塞得港", "EGPSD", "Port Said, 塞得港, Egypt, 埃及", 0, 1, "Active", "North Africa"],
    ["port-sokhna", "Egypt", "埃及", "EG", "Ain Sokhna Port", "苏赫纳港", "EGSOK", "Sokhna, Ain Sokhna, 苏赫纳, 埃及, Egypt", 0, 1, "Active", "North Africa"],
    ["port-casablanca", "Morocco", "摩洛哥", "MA", "Casablanca Port", "卡萨布兰卡港", "MACAS", "Casablanca, 卡萨布兰卡, Morocco, 摩洛哥", 0, 1, "Active", "North Africa"],
    ["port-tanger-med", "Morocco", "摩洛哥", "MA", "Tanger Med Port", "丹吉尔地中海港", "MAPTM", "Tanger Med, Tangier, 丹吉尔, 摩洛哥, Morocco", 0, 1, "Active", "North Africa"],
    ["port-algiers", "Algeria", "阿尔及利亚", "DZ", "Algiers Port", "阿尔及尔港", "DZALG", "Algiers, 阿尔及尔, Algeria, 阿尔及利亚", 0, 1, "Active", "North Africa"],
    ["port-rades", "Tunisia", "突尼斯", "TN", "Rades Port", "拉德斯港", "TNRDS", "Rades, 拉德斯, Tunisia, 突尼斯", 0, 1, "Active", "North Africa"],
    ["port-port-sudan", "Sudan", "苏丹", "SD", "Port Sudan", "苏丹港", "SDPZU", "Port Sudan, 苏丹港, Sudan, 苏丹, South Sudan, 南苏丹", 0, 1, "Active", "North Africa"],

    ["port-rotterdam", "Netherlands", "荷兰", "NL", "Rotterdam Port", "鹿特丹港", "NLRTM", "Rotterdam, 鹿特丹, Netherlands, 荷兰, Europe, 欧洲", 0, 1, "Active", "Europe"],
    ["port-hamburg", "Germany", "德国", "DE", "Hamburg Port", "汉堡港", "DEHAM", "Hamburg, 汉堡, Germany, 德国, Europe, 欧洲", 0, 1, "Active", "Europe"],
    ["port-antwerp", "Belgium", "比利时", "BE", "Antwerp-Bruges Port", "安特卫普布鲁日港", "BEANR", "Antwerp, Bruges, 安特卫普, 布鲁日, Belgium, 比利时, Europe, 欧洲", 0, 1, "Active", "Europe"],
    ["port-felixstowe", "United Kingdom", "英国", "GB", "Felixstowe Port", "费利克斯托港", "GBFXT", "Felixstowe, 费利克斯托, UK, United Kingdom, 英国, Europe, 欧洲", 0, 1, "Active", "Europe"],
    ["port-genoa", "Italy", "意大利", "IT", "Genoa Port", "热那亚港", "ITGOA", "Genoa, Genova, 热那亚, Italy, 意大利, Europe, 欧洲", 0, 1, "Active", "Europe"],
    ["port-piraeus", "Greece", "希腊", "GR", "Piraeus Port", "比雷埃夫斯港", "GRPIR", "Piraeus, 比雷埃夫斯, Greece, 希腊, Europe, 欧洲", 0, 1, "Active", "Europe"],
    ["port-valencia", "Spain", "西班牙", "ES", "Valencia Port", "瓦伦西亚港", "ESVLC", "Valencia, 瓦伦西亚, Spain, 西班牙, Europe, 欧洲", 0, 1, "Active", "Europe"],

    ["port-santos", "Brazil", "巴西", "BR", "Santos Port", "桑托斯港", "BRSSZ", "Santos, 桑托斯, Brazil, 巴西, South America, 南美洲", 0, 1, "Active", "South America"],
    ["port-rio", "Brazil", "巴西", "BR", "Rio de Janeiro Port", "里约热内卢港", "BRRIO", "Rio, Rio de Janeiro, 里约, 里约热内卢, Brazil, 巴西, 南美洲", 0, 1, "Active", "South America"],
    ["port-buenos-aires", "Argentina", "阿根廷", "AR", "Buenos Aires Port", "布宜诺斯艾利斯港", "ARBUE", "Buenos Aires, 布宜诺斯艾利斯, Argentina, 阿根廷, 南美洲", 0, 1, "Active", "South America"],
    ["port-callao", "Peru", "秘鲁", "PE", "Callao Port", "卡亚俄港", "PECLL", "Callao, 卡亚俄, Peru, 秘鲁, South America, 南美洲", 0, 1, "Active", "South America"],
    ["port-san-antonio", "Chile", "智利", "CL", "San Antonio Port", "圣安东尼奥港", "CLSAI", "San Antonio, 圣安东尼奥, Chile, 智利, South America, 南美洲", 0, 1, "Active", "South America"],
    ["port-cartagena-colombia", "Colombia", "哥伦比亚", "CO", "Cartagena Port", "卡塔赫纳港", "COCTG", "Cartagena, 卡塔赫纳, Colombia, 哥伦比亚, South America, 南美洲", 0, 1, "Active", "South America"],

    ["port-jebel-ali", "United Arab Emirates", "阿联酋", "AE", "Jebel Ali Port", "杰贝阿里港", "AEJEA", "Jebel Ali, Dubai, 杰贝阿里, 迪拜, UAE, 阿联酋, Middle East, 中东", 0, 1, "Active", "Middle East"],
    ["port-dammam", "Saudi Arabia", "沙特阿拉伯", "SA", "Dammam Port", "达曼港", "SADMM", "Dammam, 达曼, Saudi Arabia, 沙特, Middle East, 中东", 0, 1, "Active", "Middle East"],
    ["port-jeddah", "Saudi Arabia", "沙特阿拉伯", "SA", "Jeddah Islamic Port", "吉达伊斯兰港", "SAJED", "Jeddah, 吉达, Saudi Arabia, 沙特, Middle East, 中东", 0, 1, "Active", "Middle East"],
    ["port-hamad", "Qatar", "卡塔尔", "QA", "Hamad Port", "哈马德港", "QAHMD", "Hamad, Doha, 哈马德, 多哈, Qatar, 卡塔尔, Middle East, 中东", 0, 1, "Active", "Middle East"],

    ["port-singapore", "Singapore", "新加坡", "SG", "Singapore Port", "新加坡港", "SGSIN", "Singapore, 新加坡, Southeast Asia, 东南亚", 0, 1, "Active", "Asia"],
    ["port-port-klang", "Malaysia", "马来西亚", "MY", "Port Klang", "巴生港", "MYPKG", "Klang, Port Klang, 巴生港, Malaysia, 马来西亚, Southeast Asia, 东南亚", 0, 1, "Active", "Asia"],
    ["port-laem-chabang", "Thailand", "泰国", "TH", "Laem Chabang Port", "林查班港", "THLCH", "Laem Chabang, 林查班, Thailand, 泰国, Southeast Asia, 东南亚", 0, 1, "Active", "Asia"],
    ["port-jakarta", "Indonesia", "印度尼西亚", "ID", "Jakarta Tanjung Priok Port", "雅加达丹戎不碌港", "IDJKT", "Jakarta, Tanjung Priok, 雅加达, 丹戎不碌, Indonesia, 印尼", 0, 1, "Active", "Asia"],
    ["port-manila", "Philippines", "菲律宾", "PH", "Manila Port", "马尼拉港", "PHMNL", "Manila, 马尼拉, Philippines, 菲律宾", 0, 1, "Active", "Asia"],
    ["port-ho-chi-minh", "Vietnam", "越南", "VN", "Ho Chi Minh Port", "胡志明港", "VNSGN", "Ho Chi Minh, Saigon, 胡志明, 西贡, Vietnam, 越南", 0, 1, "Active", "Asia"],
    ["port-chittagong", "Bangladesh", "孟加拉国", "BD", "Chittagong Port", "吉大港", "BDCGP", "Chittagong, Chattogram, 吉大港, Bangladesh, 孟加拉", 0, 1, "Active", "Asia"],
    ["port-mumbai", "India", "印度", "IN", "Mumbai Port", "孟买港", "INBOM", "Mumbai, Nhava Sheva, 孟买, 那瓦舍瓦, India, 印度", 0, 1, "Active", "Asia"],
    ["port-karachi", "Pakistan", "巴基斯坦", "PK", "Karachi Port", "卡拉奇港", "PKKHI", "Karachi, 卡拉奇, Pakistan, 巴基斯坦", 0, 1, "Active", "Asia"],

    ["port-los-angeles", "United States", "美国", "US", "Los Angeles Port", "洛杉矶港", "USLAX", "Los Angeles, LA, 洛杉矶, USA, 美国, North America, 北美洲", 0, 1, "Active", "North America"],
    ["port-long-beach", "United States", "美国", "US", "Long Beach Port", "长滩港", "USLGB", "Long Beach, 长滩, USA, 美国, North America, 北美洲", 0, 1, "Active", "North America"],
    ["port-new-york", "United States", "美国", "US", "New York/New Jersey Port", "纽约新泽西港", "USNYC", "New York, New Jersey, 纽约, 新泽西, USA, 美国, North America, 北美洲", 0, 1, "Active", "North America"],
    ["port-vancouver", "Canada", "加拿大", "CA", "Vancouver Port", "温哥华港", "CAVAN", "Vancouver, 温哥华, Canada, 加拿大, North America, 北美洲", 0, 1, "Active", "North America"],
    ["port-manzanillo-mx", "Mexico", "墨西哥", "MX", "Manzanillo Port", "曼萨尼约港", "MXZLO", "Manzanillo, 曼萨尼约, Mexico, 墨西哥, North America, 北美洲", 0, 1, "Active", "North America"],

    ["port-melbourne", "Australia", "澳大利亚", "AU", "Melbourne Port", "墨尔本港", "AUMEL", "Melbourne, 墨尔本, Australia, 澳大利亚, Oceania, 大洋洲", 0, 1, "Active", "Oceania"],
    ["port-sydney", "Australia", "澳大利亚", "AU", "Sydney Port Botany", "悉尼博塔尼港", "AUSYD", "Sydney, Port Botany, 悉尼, 博塔尼, Australia, 澳大利亚, Oceania, 大洋洲", 0, 1, "Active", "Oceania"],
    ["port-auckland", "New Zealand", "新西兰", "NZ", "Auckland Port", "奥克兰港", "NZAKL", "Auckland, 奥克兰, New Zealand, 新西兰, Oceania, 大洋洲", 0, 1, "Active", "Oceania"]
  ];

  const insert = db.prepare(`INSERT OR IGNORE INTO ports
    (id, country_name, country_chinese_name, country_code, port_name, port_chinese_name, un_locode, aliases, is_origin_port, is_destination_port, status, remark, search_text, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const update = db.prepare(`UPDATE ports SET
    country_name=?, country_chinese_name=?, country_code=?, port_name=?, port_chinese_name=?, un_locode=?, aliases=?,
    is_origin_port=?, is_destination_port=?, status=?, remark=?, search_text=?, updated_at=? WHERE id=?`);
  rows.forEach((row) => {
    const searchText = normalize(row.join(" "));
    insert.run(...row, searchText, now(), now());
    update.run(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9], row[10], row[11], searchText, now(), row[0]);
  });
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
  seedDefaultPorts();

  const ensureKnownFreightRate = db.prepare(`INSERT OR IGNORE INTO freight_rates
    (id, origin_port_id, destination_port_id, origin_display_name, destination_display_name, destination_country, shipping_method, rate, currency, rate_unit, effective_month, effective_start_date, effective_end_date, freight_forwarder, billing_mode, container_type, remark, status, search_text, created_at, updated_at)
    VALUES (?, 'port-shanghai', 'port-durban', 'Shanghai Port / 上海港, China / 中国', 'Durban Port / 德班港, South Africa / 南非', 'South Africa', ?, ?, 'USD', ?, '2026-09', '', '', '', ?, ?, ?, 'Active', ?, ?, ?)`);
  ensureKnownFreightRate.run("freight-sha-durban-bulk-202609", "Bulk Cargo", 80, "USD/CBM", "cbm", "", "全包参考价 / All inclusive", normalize("上海 德班 南非 Durban Bulk Cargo 散杂 80 USD 全包 2026-09"), now(), now());
  ensureKnownFreightRate.run("freight-sha-durban-40hq-202609", "Container", 5600, "USD/Container", "container", "40HQ", "40HQ高柜全包参考价 / 40HQ all inclusive", normalize("上海 德班 南非 Durban Container 40HQ 高柜 5600 USD 全包 2026-09"), now(), now());

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
  db.prepare("UPDATE products SET transport_cbm=85, dimension_unit='meter', updated_at=? WHERE id='product-cat-320c' AND (transport_cbm IS NULL OR transport_cbm<=0)").run(now());

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

  if (!db.prepare("SELECT COUNT(*) AS count FROM vehicle_types").get().count) {
    const rows = [["truck-crane","随车吊","Truck-mounted crane"],["garbage-compactor","垃圾压缩车","Garbage compactor truck"],["sewer-cleaner","清洗吸污车","Sewer cleaning truck"],["sprinkler","洒水车","Water sprinkler truck"],["fuel-tanker","油罐车","Fuel tanker truck"],["aerial-platform","高空作业车","Aerial work platform"]];
    const stmt = db.prepare("INSERT INTO vehicle_types (id,code,name_zh,name_en,status,created_at,updated_at) VALUES (?,?,?,?, 'Active',?,?)");
    rows.forEach(([code, zh, en]) => stmt.run(`vt-${code}`, code, zh, en, now(), now()));
  }
  const expandedVehicleTypes = [
    ["truck-crane", "随车吊", "Truck-mounted Crane"], ["garbage-compactor", "垃圾压缩车", "Garbage Compactor Truck"],
    ["sewer-cleaner", "清洗吸污车", "Sewer Cleaning Truck"], ["sprinkler", "洒水车/水罐车", "Water Tank Truck"],
    ["fuel-tanker", "油罐车", "Fuel Tank Truck"], ["aerial-platform", "高空作业车", "Aerial Work Platform"],
    ["dump-truck", "自卸卡车", "Dump Truck"], ["mining-dump-truck", "矿山自卸卡车", "Mining Dump Truck"],
    ["tractor-head", "牵引车", "Tractor Head"], ["telehandler", "伸缩臂叉装车", "Telehandler"],
    ["mobile-crane", "汽车起重机", "Mobile Crane"], ["crawler-crane", "履带吊", "Crawler Crane"],
    ["special-vehicle", "其他特种车辆", "Other Special Purpose Vehicle"]
  ];
  const insertVehicleType = db.prepare("INSERT OR IGNORE INTO vehicle_types (id,code,name_zh,name_en,status,created_at,updated_at) VALUES (?,?,?,?, 'Active',?,?)");
  expandedVehicleTypes.forEach(([code, zh, en]) => insertVehicleType.run(`vt-${code}`, code, zh, en, now(), now()));
}


runSchema();
seed();

module.exports = { db, id, now, normalize, dbPath };
