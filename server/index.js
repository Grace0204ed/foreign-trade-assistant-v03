const fs = require("fs");
const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { db, id, now, normalize, dbPath } = require("./db");
const { dataDir, uploadDir, backupDir, exportDir, browserStatePath, ensureDir } = require("./paths");
const { installVehicleQuoteRoutes } = require("./vehicle-quotes");
const { installSpecImportRoutes } = require("./spec-import");

const app = express();
const PORT = Number(process.env.PORT || 8765);
const ROOT = path.resolve(__dirname, "..");
// Temporary local-first mode: set PASSWORD_LOGIN_ENABLED=1 to restore password login.
const PASSWORD_LOGIN_DISABLED = process.env.PASSWORD_LOGIN_ENABLED !== "1";

function ensureAutomaticOwner(req) {
  if (!PASSWORD_LOGIN_DISABLED) return req.session.user || null;
  if (req.session.user) return req.session.user;
  const user = db.prepare("SELECT id, username, role FROM users WHERE username='admin' AND status='Active'").get();
  if (!user) return null;
  req.session.user = { id: user.id, username: user.username, role: user.role };
  return req.session.user;
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(session({
  secret: process.env.SESSION_SECRET || "quote-assistant-local-secret",
  resave: false,
  saveUninitialized: false
}));
app.use("/uploads", express.static(uploadDir));
app.post("/api/uploads/image", requireLogin, requireAdmin, express.raw({ type: ["image/jpeg","image/png","image/webp"], limit: "8mb" }), (req, res) => {
  const types = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
  const extension = types[String(req.headers["content-type"] || "").split(";")[0]];
  if (!extension || !Buffer.isBuffer(req.body) || !req.body.length) return fail(res, 400, "Invalid image.", "请选择 JPG、PNG 或 WebP 图片。");
  const fileName = `vehicle-${Date.now()}-${Math.random().toString(36).slice(2,8)}${extension}`;
  fs.writeFileSync(path.join(uploadDir, fileName), req.body);
  ok(res, { path: `/uploads/${fileName}`, zh: "图片上传成功。" });
});
app.use("/crm", (req, res, next) => {
  if (ensureAutomaticOwner(req)) return next();
  return res.redirect("/");
}, express.static(path.join(ROOT, "crm")));
app.use(express.static(ROOT, { index: false }));

function ok(res, data = {}) {
  res.json({ ok: true, ...data });
}

function fail(res, status, message, zh) {
  res.status(status).json({ ok: false, message, zh });
}

function requireLogin(req, res, next) {
  if (ensureAutomaticOwner(req)) return next();
  return fail(res, 401, "Please log in.", "请先登录。");
}

function requireAdmin(req, res, next) {
  if (["owner", "admin"].includes(req.session.user?.role)) return next();
  return fail(res, 403, "Admin permission required.", "需要管理员权限。");
}

function parseCustomer(row) {
  if (!row) return null;
  return {
    ...row,
    project_tags: JSON.parse(row.project_tags || "[]"),
    equipment_tags: JSON.parse(row.equipment_tags || "[]")
  };
}

function rowToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    category: row.category || "",
    brand: row.brand || "",
    model: row.model || "",
    aliases: row.aliases || "",
    condition: row.condition || "",
    transportLength: row.transport_length,
    transportWidth: row.transport_width,
    transportHeight: row.transport_height,
    transportCbm: row.transport_cbm,
    dimensionUnit: row.dimension_unit || "meter",
    weight: row.weight,
    transportMethod: row.transport_method || "Bulk Cargo",
    referencePrice: row.reference_price,
    recordType: row.record_type || "model",
    modelProductId: row.model_product_id || "",
    inventoryCode: row.inventory_code || "",
    year: row.year || "",
    workingHours: row.working_hours,
    specificPrice: row.specific_price,
    currency: row.currency || "USD",
    priceStatus: row.price_status || (row.specific_price == null ? "pending" : "quoted"),
    transportDataStatus: row.transport_data_status || "reference",
    transportPlans: JSON.parse(row.transport_plans_json || "[]"),
    rawImportText: row.raw_import_text || "",
    params: row.params || "",
    remark: row.remark || "",
    imagePath: row.image_path || "",
    status: row.status || "Active",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function productSearchText(product) {
  return normalize([
    product.category,
    product.brand,
    product.model,
    product.aliases,
    product.condition,
    product.inventoryCode,
    product.year,
    product.workingHours,
    product.remark
  ].join(" "));
}

function portDisplay(row) {
  return `${row.port_name}, ${row.country_name}`;
}

function rowToPort(row) {
  if (!row) return null;
  return {
    id: row.id,
    countryName: row.country_name,
    countryChineseName: row.country_chinese_name || "",
    countryCode: row.country_code || "",
    portName: row.port_name,
    portChineseName: row.port_chinese_name || "",
    unLocode: row.un_locode || "",
    aliases: row.aliases || "",
    isOriginPort: !!row.is_origin_port,
    isDestinationPort: !!row.is_destination_port,
    status: row.status || "Active",
    remark: row.remark || "",
    displayName: portDisplay(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function portSearchText(port) {
  return normalize([
    port.countryName,
    port.countryChineseName,
    port.countryCode,
    port.portName,
    port.portChineseName,
    port.unLocode,
    port.aliases,
    port.remark
  ].join(" "));
}

function rowToFreight(row) {
  if (!row) return null;
  return {
    id: row.id,
    originPortId: row.origin_port_id,
    destinationPortId: row.destination_port_id,
    originDisplayName: row.origin_display_name,
    destinationDisplayName: row.destination_display_name,
    destinationCountry: row.destination_country,
    shippingMethod: row.shipping_method,
    rate: row.rate,
    currency: row.currency,
    rateUnit: row.rate_unit,
    effectiveMonth: row.effective_month,
    effectiveStartDate: row.effective_start_date || "",
    effectiveEndDate: row.effective_end_date || "",
    freightForwarder: row.freight_forwarder || "",
    billingMode: row.billing_mode || "cbm",
    containerType: row.container_type || "",
    partnerId: row.partner_id || "",
    includedFees: JSON.parse(row.included_fees_json || "[]"),
    excludedFees: JSON.parse(row.excluded_fees_json || "[]"),
    minimumCharge: Number(row.minimum_charge || 0),
    quoteDate: row.quote_date || "",
    validUntil: row.valid_until || row.effective_end_date || "",
    transitDays: row.transit_days || "",
    cargoLimit: row.cargo_limit || "",
    chargeRule: row.charge_rule || "standard",
    rateStatus: row.rate_status || (Number(row.rate) ? "quoted" : "pending"),
    feeItems: JSON.parse(row.fee_items_json || "[]"),
    remark: row.remark || "",
    status: row.status || "Active",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function freightSearchText(rate) {
  return normalize([
    rate.originDisplayName,
    rate.destinationDisplayName,
    rate.destinationCountry,
    rate.shippingMethod,
    rate.effectiveMonth,
    rate.freightForwarder,
    rate.rateUnit,
    rate.cargoLimit,
    rate.remark
  ].join(" "));
}

function calculateCbm(length, width, height, unit) {
  const l = Number(length || 0);
  const w = Number(width || 0);
  const h = Number(height || 0);
  if (!l || !w || !h) return null;
  const raw = unit === "mm" ? l * w * h / 1000000000 : unit === "cm" ? l * w * h / 1000000 : l * w * h;
  return Number(raw.toFixed(2));
}

function freightAmount(cbm, rate, quantity) {
  const amount = Number(cbm || 0) * Number(rate || 0) * Number(quantity || 1);
  return Number(amount.toFixed(2));
}

function rowToUser(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validUsername(username) {
  const value = String(username || "").trim();
  if (!value) return false;
  if (value.includes("@")) {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
  }
  return /^[A-Za-z0-9._-]{3,50}$/.test(value);
}

function referenced(table, column, value) {
  if (table === "products") {
    const rows = db.prepare("SELECT product_snapshot_json FROM quotation_items").all();
    return rows.some((row) => {
      try { return JSON.parse(row.product_snapshot_json || "{}").productId === value; } catch { return false; }
    });
  }
  if (table === "ports" || table === "freight_rates") {
    const rows = db.prepare("SELECT freight_snapshot_json FROM quotation_items WHERE freight_snapshot_json IS NOT NULL").all();
    return rows.some((row) => {
      try {
        const freight = JSON.parse(row.freight_snapshot_json || "{}");
        return freight[column] === value;
      } catch {
        return false;
      }
    });
  }
  return false;
}

app.post("/api/auth/login", (req, res) => {
  if (PASSWORD_LOGIN_DISABLED) {
    const user = ensureAutomaticOwner(req);
    if (!user) return fail(res, 500, "Automatic owner account is unavailable.", "管理员账号不可用。");
    return ok(res, { user, passwordLoginDisabled: true, message: "Entered automatically.", zh: "已自动进入系统。" });
  }
  const { username, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND status = 'Active'").get(username);
  if (!user || !bcrypt.compareSync(password || "", user.password_hash)) {
    return fail(res, 401, "Invalid username or password.", "账号或密码错误。");
  }
  req.session.user = { id: user.id, username: user.username, role: user.role };
  ok(res, { user: req.session.user, message: "Logged in successfully.", zh: "登录成功。" });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => ok(res, { message: "Logged out.", zh: "已退出登录。" }));
});

app.get("/api/auth/me", (req, res) => ok(res, { user: ensureAutomaticOwner(req), passwordLoginDisabled: PASSWORD_LOGIN_DISABLED }));

app.get("/api/users", requireLogin, requireAdmin, (req, res) => {
  const users = db.prepare("SELECT * FROM users ORDER BY created_at DESC").all().map(rowToUser);
  ok(res, { users });
});

app.post("/api/users", requireLogin, requireAdmin, (req, res) => {
  const payload = req.body || {};
  const username = String(payload.username || "").trim();
  const password = String(payload.password || "");
  const role = payload.role === "owner" ? "owner" : "user";
  if (!username || !password) return fail(res, 400, "Username and password are required.", "用户名和密码不能为空。");
  if (!validUsername(username)) {
    return fail(res, 400, "Username must use English letters/numbers or a valid email address.", "用户名必须使用英文、数字，或填写有效邮箱。");
  }
  if (db.prepare("SELECT id FROM users WHERE username=?").get(username)) {
    return fail(res, 409, "Username already exists.", "用户名已存在。");
  }
  const userId = id("user");
  db.prepare("INSERT INTO users (id, username, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'Active', ?, ?)")
    .run(userId, username, bcrypt.hashSync(password, 10), role, now(), now());
  ok(res, { user: rowToUser(db.prepare("SELECT * FROM users WHERE id=?").get(userId)), message: "Saved successfully.", zh: "保存成功。" });
});

app.put("/api/users/:id", requireLogin, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  if (!existing) return fail(res, 404, "User not found.", "用户不存在。");
  const payload = req.body || {};
  const role = payload.role === "owner" ? "owner" : "user";
  const status = payload.status === "Inactive" ? "Inactive" : "Active";
  if (existing.username === "admin" && (role !== "owner" || status !== "Active")) {
    return fail(res, 400, "The owner account cannot be disabled or downgraded.", "所有者账号不能停用或降级。");
  }
  db.prepare("UPDATE users SET role=?, status=?, updated_at=? WHERE id=?").run(role, status, now(), req.params.id);
  if (payload.password) {
    db.prepare("UPDATE users SET password_hash=?, updated_at=? WHERE id=?").run(bcrypt.hashSync(String(payload.password), 10), now(), req.params.id);
  }
  ok(res, { user: rowToUser(db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id)), message: "Saved successfully.", zh: "保存成功。" });
});

app.delete("/api/users/:id", requireLogin, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  if (!existing) return fail(res, 404, "User not found.", "用户不存在。");
  if (existing.username === "admin" || existing.id === req.session.user.id) {
    return fail(res, 400, "This account cannot be deleted.", "该账号不能删除。");
  }
  db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
  ok(res, { mode: "deleted", message: "Deleted successfully.", zh: "账号已永久删除。" });
});

app.get("/api/admin/overview", requireLogin, requireAdmin, (req, res) => {
  const count = table => db.prepare(`SELECT COUNT(*) count FROM ${table}`).get().count;
  const audits = db.prepare("SELECT a.*,u.username FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 100").all();
  ok(res, { counts:{ users:count("users"),customers:count("customers"),products:count("products"),quotations:count("quotations"),vehicleQuotes:count("quote_versions"),followUps:count("follow_ups"),freightRates:count("freight_rates") }, audits });
});
app.get("/api/products", requireLogin, (req, res) => {
  const q = normalize(req.query.keyword || "");
  const includeInactive = req.query.includeInactive === "true";
  let rows = db.prepare("SELECT * FROM products ORDER BY updated_at DESC").all();
  if (!includeInactive) rows = rows.filter((row) => row.status !== "Inactive");
  if (q) rows = rows.filter((row) => normalize(row.search_text).includes(q));
  ok(res, { products: rows.map(rowToProduct) });
});

app.post("/api/products", requireLogin, (req, res) => {
  const p = req.body || {};
  const transportCbm = p.transportCbm || calculateCbm(p.transportLength, p.transportWidth, p.transportHeight, p.dimensionUnit);
  const productId = p.id || id("product");
  const payload = {
    category: p.category || "",
    brand: p.brand || "",
    model: p.model || "",
    aliases: p.aliases || "",
    condition: p.condition || "Used",
    transportLength: p.transportLength || null,
    transportWidth: p.transportWidth || null,
    transportHeight: p.transportHeight || null,
    transportCbm: transportCbm || null,
    dimensionUnit: p.dimensionUnit || "meter",
    weight: p.weight || null,
    transportMethod: p.transportMethod || "Bulk Cargo",
    referencePrice: p.referencePrice || null,
    recordType: p.recordType === "inventory" ? "inventory" : "model",
    modelProductId: p.modelProductId || "",
    inventoryCode: p.inventoryCode || "",
    year: p.year || "",
    workingHours: p.workingHours === "" || p.workingHours == null ? null : Number(p.workingHours),
    specificPrice: p.specificPrice === "" || p.specificPrice == null ? null : Number(p.specificPrice),
    currency: p.currency || "USD",
    priceStatus: p.specificPrice === "" || p.specificPrice == null ? "pending" : (p.priceStatus || "quoted"),
    transportDataStatus: p.transportDataStatus === "confirmed" ? "confirmed" : "reference",
    transportPlans: Array.isArray(p.transportPlans) ? p.transportPlans : [],
    rawImportText: p.rawImportText || "",
    params: p.params || "",
    remark: p.remark || "",
    imagePath: p.imagePath || "",
    status: p.status || "Active"
  };
  db.prepare(`INSERT INTO products
    (id, category, brand, model, aliases, condition, transport_length, transport_width, transport_height, transport_cbm, dimension_unit, weight, transport_method, reference_price, record_type, model_product_id, inventory_code, year, working_hours, specific_price, currency, price_status, transport_data_status, transport_plans_json, raw_import_text, params, remark, image_path, status, search_text, created_at, updated_at)
    VALUES (@id, @category, @brand, @model, @aliases, @condition, @transportLength, @transportWidth, @transportHeight, @transportCbm, @dimensionUnit, @weight, @transportMethod, @referencePrice, @recordType, @modelProductId, @inventoryCode, @year, @workingHours, @specificPrice, @currency, @priceStatus, @transportDataStatus, @transportPlansJson, @rawImportText, @params, @remark, @imagePath, @status, @searchText, @createdAt, @updatedAt)`)
    .run({ id: productId, ...payload, transportPlansJson:JSON.stringify(payload.transportPlans), searchText: productSearchText(payload), createdAt: now(), updatedAt: now() });
  ok(res, { product: rowToProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(productId)), message: "Saved successfully.", zh: "保存成功。" });
});

app.post("/api/products/bulk-upsert", requireLogin, (req, res) => {
  const rows = Array.isArray(req.body?.products) ? req.body.products : [];
  if (!rows.length) return fail(res, 400, "No products to import.", "没有可导入的产品。");
  if (rows.length > 5000) return fail(res, 400, "Too many products in one import.", "单次导入产品数量过多。");

  const existingRows = db.prepare("SELECT * FROM products").all();
  const existingByKey = new Map(existingRows.map((row) => [normalize(`${row.category}|${row.brand}|${row.model}`), row]));
  const selectProduct = db.prepare("SELECT * FROM products WHERE id = ?");
  const insertProduct = db.prepare(`INSERT INTO products
    (id, category, brand, model, aliases, condition, transport_length, transport_width, transport_height, transport_cbm, dimension_unit, weight, transport_method, reference_price, params, remark, image_path, status, search_text, created_at, updated_at)
    VALUES (@id, @category, @brand, @model, @aliases, @condition, @transportLength, @transportWidth, @transportHeight, @transportCbm, @dimensionUnit, @weight, @transportMethod, @referencePrice, @params, @remark, @imagePath, @status, @searchText, @createdAt, @updatedAt)`);
  const updateProduct = db.prepare(`UPDATE products SET category=@category, brand=@brand, model=@model, aliases=@aliases, condition=@condition,
    transport_length=@transportLength, transport_width=@transportWidth, transport_height=@transportHeight, transport_cbm=@transportCbm,
    dimension_unit=@dimensionUnit, weight=@weight, transport_method=@transportMethod, reference_price=@referencePrice, params=@params,
    remark=@remark, image_path=@imagePath, status=@status, search_text=@searchText, updated_at=@updatedAt WHERE id=@id`);

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const importedIds = [];
  const upsert = db.transaction((items) => {
    items.forEach((p) => {
      const category = String(p.category || "").trim();
      const brand = String(p.brand || "").trim();
      const model = String(p.model || "").trim();
      if (!brand && !model) {
        skipped += 1;
        return;
      }
      const key = normalize(`${category}|${brand}|${model}`);
      const existing = existingByKey.get(key);
      const payload = {
        id: existing?.id || p.id || id("product"),
        category,
        brand,
        model,
        aliases: p.aliases || existing?.aliases || "",
        condition: p.condition || existing?.condition || "Used",
        transportLength: p.transportLength ?? existing?.transport_length ?? null,
        transportWidth: p.transportWidth ?? existing?.transport_width ?? null,
        transportHeight: p.transportHeight ?? existing?.transport_height ?? null,
        transportCbm: p.transportCbm ?? existing?.transport_cbm ?? calculateCbm(p.transportLength, p.transportWidth, p.transportHeight, p.dimensionUnit) ?? null,
        dimensionUnit: p.dimensionUnit || existing?.dimension_unit || "meter",
        weight: p.weight ?? existing?.weight ?? null,
        transportMethod: p.transportMethod || existing?.transport_method || "Bulk Cargo",
        referencePrice: p.referencePrice || existing?.reference_price || null,
        params: p.params || existing?.params || "",
        remark: p.remark || existing?.remark || "",
        imagePath: existing?.image_path || p.imagePath || "",
        status: p.status || existing?.status || "Active",
        createdAt: existing?.created_at || now(),
        updatedAt: now()
      };
      payload.searchText = productSearchText(payload);
      if (existing) {
        updateProduct.run(payload);
        updated += 1;
      } else {
        insertProduct.run(payload);
        existingByKey.set(key, { id: payload.id, category, brand, model });
        added += 1;
      }
      importedIds.push(payload.id);
    });
  });

  upsert(rows);
  const products = importedIds.map((productId) => rowToProduct(selectProduct.get(productId))).filter(Boolean);
  ok(res, { added, updated, skipped, products, message: "Import completed.", zh: "导入完成。" });
});

app.put("/api/products/:id", requireLogin, (req, res) => {
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!existing) return fail(res, 404, "Product not found.", "产品不存在。");
  const p = req.body || {};
  const payload = {
    category: p.category ?? existing.category,
    brand: p.brand ?? existing.brand,
    model: p.model ?? existing.model,
    aliases: p.aliases ?? existing.aliases,
    condition: p.condition ?? existing.condition,
    transportLength: p.transportLength ?? existing.transport_length,
    transportWidth: p.transportWidth ?? existing.transport_width,
    transportHeight: p.transportHeight ?? existing.transport_height,
    transportCbm: p.transportCbm ?? calculateCbm(p.transportLength, p.transportWidth, p.transportHeight, p.dimensionUnit) ?? existing.transport_cbm,
    dimensionUnit: p.dimensionUnit ?? existing.dimension_unit,
    weight: p.weight ?? existing.weight,
    transportMethod: p.transportMethod ?? existing.transport_method,
    referencePrice: p.referencePrice ?? existing.reference_price,
    recordType: p.recordType ?? existing.record_type ?? "model",
    modelProductId: p.modelProductId ?? existing.model_product_id ?? "",
    inventoryCode: p.inventoryCode ?? existing.inventory_code ?? "",
    year: p.year ?? existing.year ?? "",
    workingHours: p.workingHours === "" ? null : (p.workingHours ?? existing.working_hours),
    specificPrice: p.specificPrice === "" ? null : (p.specificPrice ?? existing.specific_price),
    currency: p.currency ?? existing.currency ?? "USD",
    priceStatus: p.specificPrice === "" ? "pending" : (p.priceStatus ?? existing.price_status ?? "pending"),
    transportDataStatus: p.transportDataStatus ?? existing.transport_data_status ?? "reference",
    transportPlans: Array.isArray(p.transportPlans) ? p.transportPlans : JSON.parse(existing.transport_plans_json || "[]"),
    rawImportText: p.rawImportText ?? existing.raw_import_text ?? "",
    params: p.params ?? existing.params,
    remark: p.remark ?? existing.remark,
    imagePath: p.imagePath ?? existing.image_path,
    status: p.status ?? existing.status
  };
  db.prepare(`UPDATE products SET category=@category, brand=@brand, model=@model, aliases=@aliases, condition=@condition,
    transport_length=@transportLength, transport_width=@transportWidth, transport_height=@transportHeight, transport_cbm=@transportCbm,
    dimension_unit=@dimensionUnit, weight=@weight, transport_method=@transportMethod, reference_price=@referencePrice,
    record_type=@recordType, model_product_id=@modelProductId, inventory_code=@inventoryCode, year=@year, working_hours=@workingHours,
    specific_price=@specificPrice, currency=@currency, price_status=@priceStatus, transport_data_status=@transportDataStatus,
    transport_plans_json=@transportPlansJson, raw_import_text=@rawImportText, params=@params,
    remark=@remark, image_path=@imagePath, status=@status, search_text=@searchText, updated_at=@updatedAt WHERE id=@id`)
    .run({ id: req.params.id, ...payload, transportPlansJson:JSON.stringify(payload.transportPlans), searchText: productSearchText(payload), updatedAt: now() });
  ok(res, { product: rowToProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id)), message: "Saved successfully.", zh: "保存成功。" });
});

app.patch("/api/products/:id/cbm", requireLogin, (req, res) => {
  const p = req.body || {};
  const cbm = p.transportCbm || calculateCbm(p.transportLength, p.transportWidth, p.transportHeight, p.dimensionUnit);
  db.prepare("UPDATE products SET transport_length=?, transport_width=?, transport_height=?, transport_cbm=?, dimension_unit=?, updated_at=? WHERE id=?")
    .run(p.transportLength || null, p.transportWidth || null, p.transportHeight || null, cbm || null, p.dimensionUnit || "meter", now(), req.params.id);
  ok(res, { transportCbm: cbm, message: "Product transport CBM updated successfully.", zh: "产品运输立方已保存。" });
});

app.delete("/api/products/:id", requireLogin, requireAdmin, (req, res) => {
  if (referenced("products", "productId", req.params.id)) {
    db.prepare("UPDATE products SET status='Inactive', updated_at=? WHERE id=?").run(now(), req.params.id);
    return ok(res, { mode: "inactive", message: "Marked as inactive successfully.", zh: "已成功标记为停用。" });
  }
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  ok(res, { mode: "deleted", message: "Deleted successfully.", zh: "删除成功。" });
});

app.get("/api/ports", requireLogin, (req, res) => {
  const q = normalize(req.query.keyword || "");
  let rows = db.prepare("SELECT * FROM ports ORDER BY country_name, port_name").all();
  if (req.query.includeInactive !== "true") rows = rows.filter((row) => row.status !== "Inactive");
  if (q) rows = rows.filter((row) => normalize(row.search_text).includes(q));
  ok(res, { ports: rows.map(rowToPort) });
});

app.post("/api/ports", requireLogin, requireAdmin, (req, res) => {
  const p = req.body || {};
  const portId = p.id || id("port");
  const payload = {
    countryName: p.countryName || "",
    countryChineseName: p.countryChineseName || "",
    countryCode: p.countryCode || "",
    portName: p.portName || "",
    portChineseName: p.portChineseName || "",
    unLocode: p.unLocode || "",
    aliases: p.aliases || "",
    isOriginPort: p.isOriginPort ? 1 : 0,
    isDestinationPort: p.isDestinationPort === false ? 0 : 1,
    status: p.status || "Active",
    remark: p.remark || ""
  };
  db.prepare(`INSERT INTO ports (id, country_name, country_chinese_name, country_code, port_name, port_chinese_name, un_locode, aliases, is_origin_port, is_destination_port, status, remark, search_text, created_at, updated_at)
    VALUES (@id, @countryName, @countryChineseName, @countryCode, @portName, @portChineseName, @unLocode, @aliases, @isOriginPort, @isDestinationPort, @status, @remark, @searchText, @createdAt, @updatedAt)`)
    .run({ id: portId, ...payload, searchText: portSearchText(payload), createdAt: now(), updatedAt: now() });
  ok(res, { port: rowToPort(db.prepare("SELECT * FROM ports WHERE id=?").get(portId)), message: "Saved successfully.", zh: "保存成功。" });
});

app.put("/api/ports/:id", requireLogin, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM ports WHERE id=?").get(req.params.id);
  if (!existing) return fail(res, 404, "Port not found.", "港口不存在。");
  const p = req.body || {};
  const payload = {
    countryName: p.countryName ?? existing.country_name,
    countryChineseName: p.countryChineseName ?? existing.country_chinese_name,
    countryCode: p.countryCode ?? existing.country_code,
    portName: p.portName ?? existing.port_name,
    portChineseName: p.portChineseName ?? existing.port_chinese_name,
    unLocode: p.unLocode ?? existing.un_locode,
    aliases: p.aliases ?? existing.aliases,
    isOriginPort: p.isOriginPort === undefined ? existing.is_origin_port : (p.isOriginPort ? 1 : 0),
    isDestinationPort: p.isDestinationPort === undefined ? existing.is_destination_port : (p.isDestinationPort ? 1 : 0),
    status: p.status ?? existing.status,
    remark: p.remark ?? existing.remark
  };
  db.prepare(`UPDATE ports SET country_name=@countryName, country_chinese_name=@countryChineseName, country_code=@countryCode,
    port_name=@portName, port_chinese_name=@portChineseName, un_locode=@unLocode, aliases=@aliases, is_origin_port=@isOriginPort,
    is_destination_port=@isDestinationPort, status=@status, remark=@remark, search_text=@searchText, updated_at=@updatedAt WHERE id=@id`)
    .run({ id: req.params.id, ...payload, searchText: portSearchText(payload), updatedAt: now() });
  ok(res, { port: rowToPort(db.prepare("SELECT * FROM ports WHERE id=?").get(req.params.id)), message: "Saved successfully.", zh: "保存成功。" });
});

app.delete("/api/ports/:id", requireLogin, requireAdmin, (req, res) => {
  if (referenced("ports", "originPortId", req.params.id) || referenced("ports", "destinationPortId", req.params.id)) {
    db.prepare("UPDATE ports SET status='Inactive', updated_at=? WHERE id=?").run(now(), req.params.id);
    return ok(res, { mode: "inactive", message: "Marked as inactive successfully.", zh: "已成功标记为停用。" });
  }
  db.prepare("DELETE FROM ports WHERE id=?").run(req.params.id);
  ok(res, { mode: "deleted", message: "Deleted successfully.", zh: "删除成功。" });
});

app.get("/api/country-routes", requireLogin, (req,res) => {
  const country=String(req.query.country||"").trim();
  let rows=db.prepare(`SELECT l.*,p.port_name,p.port_chinese_name,p.country_name,p.country_chinese_name,p.un_locode
    FROM country_route_links l JOIN ports p ON p.id=l.destination_port_id WHERE l.status='Active' ORDER BY l.is_favorite DESC,l.sort_order,l.updated_at DESC`).all();
  if(country)rows=rows.filter(row=>normalize(row.customer_country)===normalize(country)||normalize(row.customer_country).includes(normalize(country)));
  ok(res,{routes:rows.map(row=>({id:row.id,customerCountry:row.customer_country,dischargeCountry:row.discharge_country,destinationPortId:row.destination_port_id,isFavorite:!!row.is_favorite,sortOrder:row.sort_order,remark:row.remark,destinationDisplayName:row.port_name+(row.port_chinese_name?" / "+row.port_chinese_name:""),destinationCountry:row.country_name,unLocode:row.un_locode||""}))});
});

app.post("/api/country-routes",requireLogin,requireAdmin,(req,res)=>{const b=req.body||{};if(!b.customerCountry||!b.destinationPortId)return fail(res,400,"Country and destination required.","请选择客户目的国和目的港/口岸/站点。");const rid=b.id||id("route"),timestamp=now();db.prepare(`INSERT OR REPLACE INTO country_route_links (id,customer_country,discharge_country,destination_port_id,is_favorite,sort_order,status,remark,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,COALESCE((SELECT created_at FROM country_route_links WHERE id=?),?),?)`).run(rid,b.customerCountry,b.dischargeCountry||"",b.destinationPortId,b.isFavorite?1:0,Number(b.sortOrder||0),b.status||"Active",b.remark||"",rid,timestamp,timestamp);ok(res,{id:rid});});

app.delete("/api/country-routes/:id",requireLogin,requireAdmin,(req,res)=>{db.prepare("UPDATE country_route_links SET status='Inactive',updated_at=? WHERE id=?").run(now(),req.params.id);ok(res,{zh:"路线关联已停用。"});});

function latestFreight({ originPortId, destinationPortId, shippingMethod, effectiveMonth }) {
  const rows = db.prepare(`SELECT * FROM freight_rates
    WHERE origin_port_id=? AND destination_port_id=? AND shipping_method=? AND status='Active'
    ORDER BY effective_month DESC`).all(originPortId, destinationPortId, shippingMethod || "Bulk Cargo");
  if (!rows.length) return { rate: null, fallback: false };
  const exact = effectiveMonth ? rows.find((row) => row.effective_month === effectiveMonth) : null;
  return { rate: exact || rows[0], fallback: !!effectiveMonth && !exact };
}

app.get("/api/freight-rates", requireLogin, (req, res) => {
  const q = normalize(req.query.keyword || "");
  let rows = db.prepare("SELECT * FROM freight_rates ORDER BY effective_month DESC, destination_display_name").all();
  if (req.query.includeInactive !== "true") rows = rows.filter((row) => row.status !== "Inactive");
  if (req.query.originPortId) rows = rows.filter((row) => row.origin_port_id === req.query.originPortId);
  if (req.query.destinationPortId) rows = rows.filter((row) => row.destination_port_id === req.query.destinationPortId);
  if (req.query.shippingMethod) rows = rows.filter((row) => row.shipping_method === req.query.shippingMethod);
  if (req.query.effectiveMonth) rows = rows.filter((row) => row.effective_month === req.query.effectiveMonth);
  if (q) rows = rows.filter((row) => normalize(row.search_text).includes(q));
  ok(res, { freightRates: rows.map(rowToFreight) });
});

app.get("/api/freight-rates/search", requireLogin, (req, res) => {
  const result = latestFreight(req.query);
  if (!result.rate) return ok(res, { found: false, message: "No freight rate found.", zh: "未找到运费。" });
  ok(res, {
    found: true,
    freightRate: rowToFreight(result.rate),
    fallback: result.fallback,
    message: result.fallback ? `Current month rate not found. Using latest available reference rate: ${result.rate.effective_month}.` : "Freight rate found.",
    zh: result.fallback ? `当前月份运费未找到，使用最近有效月份：${result.rate.effective_month}。` : "已找到运费。"
  });
});

app.post("/api/freight-rates", requireLogin, requireAdmin, (req, res) => {
  const r = req.body || {};
  const origin = db.prepare("SELECT * FROM ports WHERE id=?").get(r.originPortId);
  const dest = db.prepare("SELECT * FROM ports WHERE id=?").get(r.destinationPortId);
  if (!origin || !dest) return fail(res, 400, "Port not found.", "港口不存在。");
  const rateId = r.id || id("freight");
  const payload = {
    originPortId: origin.id,
    destinationPortId: dest.id,
    originDisplayName: portDisplay(origin),
    destinationDisplayName: portDisplay(dest),
    destinationCountry: dest.country_name,
    shippingMethod: r.shippingMethod || "Bulk Cargo",
    rate: Number(r.rate || 0),
    currency: r.currency || "USD",
    rateUnit: r.rateUnit || "USD/CBM",
    effectiveMonth: r.effectiveMonth || new Date().toISOString().slice(0, 7),
    effectiveStartDate: r.effectiveStartDate || "",
    effectiveEndDate: r.effectiveEndDate || "",
    freightForwarder: r.freightForwarder || "",
    billingMode: r.billingMode || (r.shippingMethod === "Container" ? "container" : "cbm"),
    containerType: r.containerType || "",
    quoteDate: r.quoteDate || new Date().toISOString().slice(0,10),
    validUntil: r.validUntil || r.effectiveEndDate || "",
    transitDays: r.transitDays || "",
    cargoLimit: r.cargoLimit || "",
    chargeRule: r.chargeRule || "standard",
    rateStatus: r.rate === "" || r.rate == null ? "pending" : (r.rateStatus || "quoted"),
    feeItems: Array.isArray(r.feeItems) ? r.feeItems : [],
    includedFees: Array.isArray(r.includedFees) ? r.includedFees : [],
    excludedFees: Array.isArray(r.excludedFees) ? r.excludedFees : [],
    remark: r.remark || "",
    status: r.status || "Active"
  };
  db.prepare(`INSERT INTO freight_rates (id, origin_port_id, destination_port_id, origin_display_name, destination_display_name, destination_country, shipping_method, rate, currency, rate_unit, effective_month, effective_start_date, effective_end_date, freight_forwarder, billing_mode, container_type, quote_date, valid_until, transit_days, cargo_limit, charge_rule, rate_status, fee_items_json, included_fees_json, excluded_fees_json, remark, status, search_text, created_at, updated_at)
    VALUES (@id, @originPortId, @destinationPortId, @originDisplayName, @destinationDisplayName, @destinationCountry, @shippingMethod, @rate, @currency, @rateUnit, @effectiveMonth, @effectiveStartDate, @effectiveEndDate, @freightForwarder, @billingMode, @containerType, @quoteDate, @validUntil, @transitDays, @cargoLimit, @chargeRule, @rateStatus, @feeItemsJson, @includedFeesJson, @excludedFeesJson, @remark, @status, @searchText, @createdAt, @updatedAt)`)
    .run({ id: rateId, ...payload, feeItemsJson:JSON.stringify(payload.feeItems), includedFeesJson:JSON.stringify(payload.includedFees), excludedFeesJson:JSON.stringify(payload.excludedFees), searchText: freightSearchText(payload), createdAt: now(), updatedAt: now() });
  ok(res, { freightRate: rowToFreight(db.prepare("SELECT * FROM freight_rates WHERE id=?").get(rateId)), message: "Freight rate saved successfully.", zh: "运费保存成功。" });
});

app.put("/api/freight-rates/:id", requireLogin, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM freight_rates WHERE id=?").get(req.params.id);
  if (!existing) return fail(res, 404, "Freight rate not found.", "运费不存在。");
  const r = { ...rowToFreight(existing), ...(req.body || {}) };
  const origin = db.prepare("SELECT * FROM ports WHERE id=?").get(r.originPortId);
  const dest = db.prepare("SELECT * FROM ports WHERE id=?").get(r.destinationPortId);
  const payload = {
    originPortId: origin.id,
    destinationPortId: dest.id,
    originDisplayName: portDisplay(origin),
    destinationDisplayName: portDisplay(dest),
    destinationCountry: dest.country_name,
    shippingMethod: r.shippingMethod,
    rate: Number(r.rate || 0),
    currency: r.currency,
    rateUnit: r.rateUnit,
    effectiveMonth: r.effectiveMonth,
    effectiveStartDate: r.effectiveStartDate,
    effectiveEndDate: r.effectiveEndDate,
    freightForwarder: r.freightForwarder,
    billingMode: r.billingMode || (r.shippingMethod === "Container" ? "container" : "cbm"),
    containerType: r.containerType || "",
    quoteDate: r.quoteDate || "",
    validUntil: r.validUntil || r.effectiveEndDate || "",
    transitDays: r.transitDays || "",
    cargoLimit: r.cargoLimit || "",
    chargeRule: r.chargeRule || "standard",
    rateStatus: r.rate === "" || r.rate == null ? "pending" : (r.rateStatus || "quoted"),
    feeItems: Array.isArray(r.feeItems) ? r.feeItems : [],
    includedFees: Array.isArray(r.includedFees) ? r.includedFees : [],
    excludedFees: Array.isArray(r.excludedFees) ? r.excludedFees : [],
    remark: r.remark,
    status: r.status
  };
  db.prepare(`UPDATE freight_rates SET origin_port_id=@originPortId, destination_port_id=@destinationPortId, origin_display_name=@originDisplayName,
    destination_display_name=@destinationDisplayName, destination_country=@destinationCountry, shipping_method=@shippingMethod, rate=@rate,
    currency=@currency, rate_unit=@rateUnit, effective_month=@effectiveMonth, effective_start_date=@effectiveStartDate, effective_end_date=@effectiveEndDate,
    freight_forwarder=@freightForwarder, billing_mode=@billingMode, container_type=@containerType, quote_date=@quoteDate, valid_until=@validUntil,
    transit_days=@transitDays, cargo_limit=@cargoLimit, charge_rule=@chargeRule, rate_status=@rateStatus, fee_items_json=@feeItemsJson,
    included_fees_json=@includedFeesJson, excluded_fees_json=@excludedFeesJson,
    remark=@remark, status=@status, search_text=@searchText, updated_at=@updatedAt WHERE id=@id`)
    .run({ id: req.params.id, ...payload, feeItemsJson:JSON.stringify(payload.feeItems), includedFeesJson:JSON.stringify(payload.includedFees), excludedFeesJson:JSON.stringify(payload.excludedFees), searchText: freightSearchText(payload), updatedAt: now() });
  ok(res, { freightRate: rowToFreight(db.prepare("SELECT * FROM freight_rates WHERE id=?").get(req.params.id)), message: "Saved successfully.", zh: "保存成功。" });
});

app.delete("/api/freight-rates/:id", requireLogin, requireAdmin, (req, res) => {
  if (referenced("freight_rates", "freightRateId", req.params.id)) {
    db.prepare("UPDATE freight_rates SET status='Inactive', updated_at=? WHERE id=?").run(now(), req.params.id);
    return ok(res, { mode: "inactive", message: "Marked as inactive successfully.", zh: "已成功标记为停用。" });
  }
  db.prepare("DELETE FROM freight_rates WHERE id=?").run(req.params.id);
  ok(res, { mode: "deleted", message: "Deleted successfully.", zh: "删除成功。" });
});

app.post("/api/freight-rates/copy-month", requireLogin, requireAdmin, (req, res) => {
  const { fromMonth, toMonth } = req.body || {};
  const rows = db.prepare("SELECT * FROM freight_rates WHERE effective_month=?").all(fromMonth);
  const insert = db.prepare(`INSERT INTO freight_rates (id, origin_port_id, destination_port_id, origin_display_name, destination_display_name, destination_country, shipping_method, rate, currency, rate_unit, effective_month, effective_start_date, effective_end_date, freight_forwarder, remark, status, search_text, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  rows.forEach((row) => insert.run(id("freight"), row.origin_port_id, row.destination_port_id, row.origin_display_name, row.destination_display_name, row.destination_country, row.shipping_method, row.rate, row.currency, row.rate_unit, toMonth, "", "", row.freight_forwarder, row.remark, row.status, row.search_text.replace(fromMonth, toMonth), now(), now()));
  ok(res, { count: rows.length, message: "Saved successfully.", zh: "保存成功。" });
});

app.post("/api/freight/calculate", requireLogin, (req, res) => {
  const body=req.body||{}, mode=body.billingMode||"cbm", quantity=Number(body.quantity||1), rate=Number(body.freightRate||0);
  if(body.freightRate==="" || body.freightRate==null) return ok(res,{complete:false,freightAmount:null,message:"Freight rate pending.",zh:"运价待询，无法形成完整报价。"});
  if(["volume_weight_max","manual"].includes(body.chargeRule)) return ok(res,{complete:false,requiresManualReview:true,freightAmount:null,message:"Manual freight review required.",zh:"该运价采用体积重量择大或人工规则，请人工核价。"});
  let base=0, formula="";
  if(mode==="container"){const count=Number(body.containerCount||1);base=count*rate;formula=`${count} × ${rate}`;}
  else if(mode==="ton"){const weight=Number(body.weight||0);base=weight*rate*quantity;formula=`${weight} × ${rate} × ${quantity}`;}
  else if(mode==="unit"||mode==="fixed"){base=rate*quantity;formula=`${quantity} × ${rate}`;}
  else {base=freightAmount(body.transportCbm,rate,quantity);formula=`${body.transportCbm||0} × ${rate} × ${quantity}`;}
  if(Number(body.minimumCharge||0)>base){base=Number(body.minimumCharge);formula=`minimum ${body.minimumCharge}`;}
  const fees=(Array.isArray(body.fees)?body.fees:[]).map(f=>({name:f.name||"其他费用",mode:f.mode==="percent"?"percent":"amount",value:Number(f.value||0),amount:f.mode==="percent"?Math.round(base*Number(f.value||0))/100:Number(f.value||0),includeInTotal:f.includeInTotal!==false}));
  const extras=fees.filter(f=>f.includeInTotal).reduce((s,f)=>s+f.amount,0),amount=Math.round((base+extras)*100)/100;
  ok(res, {
    complete:true,baseFreight:Math.round(base*100)/100,fees,freightAmount:amount,
    calculationFormula: `${formula} + ${extras} = ${amount} ${body.currency||"USD"}`
  });
});

app.get("/api/logistics/partners",requireLogin,(req,res)=>ok(res,{partners:db.prepare("SELECT * FROM logistics_partners WHERE status='Active' ORDER BY company_name").all()}));
app.post("/api/logistics/partners",requireLogin,requireAdmin,(req,res)=>{const b=req.body||{},pid=id("partner");if(!b.companyName)return fail(res,400,"Company required.","请填写物流合作伙伴名称。");db.prepare("INSERT INTO logistics_partners (id,company_name,contact_name,phone,email,wechat,status,remark,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)").run(pid,b.companyName,b.contactName||"",b.phone||"",b.email||"",b.wechat||"",b.status||"Active",b.remark||"",now(),now());ok(res,{id:pid});});

app.get("/api/agent-authorizations", requireLogin, (req, res) => {
  const rows = db.prepare("SELECT * FROM agent_authorizations WHERE status<>'Deleted' ORDER BY updated_at DESC").all();
  ok(res, { authorizations: rows.map((row) => ({ ...JSON.parse(row.data_json || "{}"), id: row.id, authorizationNumber: row.authorization_number, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at })) });
});

app.post("/api/agent-authorizations", requireLogin, (req, res) => {
  const data = req.body || {};
  if (!data.agentName || !data.country) return fail(res, 400, "Agent name and country required.", "请填写代理人姓名和授权国家。");
  const recordId = data.id || id("agency"), timestamp = now();
  const existing = db.prepare("SELECT created_at,data_json FROM agent_authorizations WHERE id=?").get(recordId);
  db.prepare(`INSERT OR REPLACE INTO agent_authorizations (id,authorization_number,agent_name,country,status,data_json,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(recordId, data.authorizationNumber || recordId, data.agentName, data.country, data.status || "Active", JSON.stringify({ ...data, id: recordId }), req.session.user?.id || "", existing?.created_at || timestamp, timestamp);
  db.prepare("INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
    .run(id("audit"), req.session.user?.id || "", existing ? "update_agent_authorization" : "create_agent_authorization", "agent_authorization", recordId, existing?.data_json || "{}", JSON.stringify({ ...data, id:recordId }), existing ? "更新代理授权书" : "新建代理授权书", timestamp);
  ok(res, { id: recordId, updatedAt: timestamp, message: "Authorization saved.", zh: "代理授权书已保存。" });
});

app.delete("/api/agent-authorizations/:id", requireLogin, (req, res) => {
  const timestamp = now(), existing = db.prepare("SELECT data_json,status FROM agent_authorizations WHERE id=?").get(req.params.id);
  db.prepare("UPDATE agent_authorizations SET status='Deleted', updated_at=? WHERE id=?").run(timestamp, req.params.id);
  db.prepare("INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
    .run(id("audit"), req.session.user?.id || "", "delete_agent_authorization", "agent_authorization", req.params.id, existing?.data_json || "{}", JSON.stringify({ status:"Deleted" }), "删除代理授权书", timestamp);
  ok(res, { message: "Authorization deleted.", zh: "代理授权书已删除。" });
});

app.get("/api/settings", requireLogin, (req, res) => {
  const row = db.prepare("SELECT data_json FROM company_settings WHERE id=1").get();
  ok(res, { settings: JSON.parse(row.data_json) });
});

app.put("/api/settings", requireLogin, requireAdmin, (req, res) => {
  db.prepare("UPDATE company_settings SET data_json=?, updated_at=? WHERE id=1").run(JSON.stringify(req.body || {}), now());
  ok(res, { message: "Saved successfully.", zh: "保存成功。" });
});

app.get("/api/hs-codes", requireLogin, (req, res) => {
  const codes = db.prepare("SELECT id,code,name_zh AS nameZh,name_en AS nameEn,keywords,created_at AS createdAt,updated_at AS updatedAt FROM custom_hs_codes ORDER BY code").all();
  ok(res, { codes });
});

app.post("/api/hs-codes", requireLogin, (req, res) => {
  const code = String(req.body?.code || "").trim();
  const nameZh = String(req.body?.nameZh || "").trim();
  const nameEn = String(req.body?.nameEn || "").trim();
  const keywords = String(req.body?.keywords || "").trim();
  if (!/^\d{8}$/.test(code)) return fail(res, 400, "HS code must contain exactly 8 digits.", "海关编码必须是8位数字。");
  if (!nameZh) return fail(res, 400, "Chinese product name is required.", "请填写中文产品名称。");
  const existing = db.prepare("SELECT id FROM custom_hs_codes WHERE code=?").get(code);
  const recordId = existing?.id || id("hs");
  db.prepare(`INSERT INTO custom_hs_codes (id,code,name_zh,name_en,keywords,created_by,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(code) DO UPDATE SET name_zh=excluded.name_zh,name_en=excluded.name_en,keywords=excluded.keywords,updated_at=excluded.updated_at`)
    .run(recordId, code, nameZh, nameEn, keywords, req.session.user?.id || "", now(), now());
  ok(res, { code:{ id:recordId, code, nameZh, nameEn, keywords }, zh: existing ? "海关编码已更新。" : "海关编码已保存。" });
});

app.post("/api/quotations", requireLogin, (req, res) => {
  const q = req.body || {};
  const formal=!!q.formal;
  const seriesId=q.seriesId || q.id || id("standard-series");
  const latestVersion=formal ? Number(db.prepare("SELECT COALESCE(MAX(version),0) version FROM quotations WHERE series_id=?").get(seriesId).version) : 0;
  const version=formal ? latestVersion+1 : Number(q.version || 0);
  const quoteId=formal ? id("quote-version") : (q.isFormal ? id("quote-draft") : (q.id || id("quote")));
  const items = q.items || [];
  const totalMachinePrice = items.reduce((sum, item) => sum + Number(item.machineAmount || 0), 0);
  const totalFreight = items.reduce((sum, item) => sum + (item.includeFreightInTotal === false ? 0 : Number(item.freightSnapshot?.freightAmount || 0)), 0);
  const settingsSnapshot = { ...(q.settingsSnapshot || {}), _quoteMeta:{ documentType:q.documentType || "quotation", pdfLanguage:q.pdfLanguage || "bilingual", currency:q.currency || "USD", validityRangeText:q.validityRangeText || "", showProductPhotos:q.showProductPhotos !== false } };
  db.prepare(`INSERT OR REPLACE INTO quotations (id, customer_id, quote_number, status, buyer_json, settings_snapshot_json, terms_json, total_machine_price, total_freight, total_amount, include_freight_in_total, show_freight_detail_in_pdf, quote_date, valid_until, series_id, version, is_formal, source_quote_id, formalized_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM quotations WHERE id=?), ?), ?)`)
    .run(quoteId, q.customerId || null, q.quoteNumber, formal?"Formal":(q.status || "Draft"), JSON.stringify(q.buyer || {}), JSON.stringify(settingsSnapshot), JSON.stringify(q.terms || {}), totalMachinePrice, totalFreight, totalMachinePrice + totalFreight, q.includeFreightInTotal === false ? 0 : 1, q.showFreightDetailInPdf ? 1 : 0, q.quoteDate || now().slice(0, 10), q.validUntil || "", seriesId, version, formal?1:0,q.sourceQuoteId||"",formal?now():null,quoteId,now(),now());
  db.prepare("DELETE FROM quotation_items WHERE quotation_id=?").run(quoteId);
  const insertItem = db.prepare(`INSERT INTO quotation_items (id, quotation_id, product_id, product_snapshot_json, price_snapshot_json, freight_snapshot_json, include_freight_in_total, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  items.forEach((item, index) => insertItem.run(formal ? id("item") : (item.id || id("item")), quoteId, item.productId || "", JSON.stringify(item.productSnapshot || {}), JSON.stringify(item.priceSnapshot || {}), JSON.stringify(item.freightSnapshot || {}), item.includeFreightInTotal === false ? 0 : 1, index, now(), now()));
  if(formal && q.customerId){const customer=db.prepare("SELECT stage,grade,next_follow_up,next_follow_purpose FROM customers WHERE id=?").get(q.customerId);if(customer){db.prepare("UPDATE customers SET stage='报价评估中',updated_at=? WHERE id=?").run(now(),q.customerId);db.prepare("INSERT INTO follow_ups (customer_id,content,contact_type,outcome,old_stage,new_stage,old_grade,new_grade,next_follow_up,next_follow_purpose,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(q.customerId,`生成正式报价 ${q.quoteNumber} V${version}，金额 ${q.currency||"USD"} ${totalMachinePrice+totalFreight}`,"系统","正式报价",customer.stage,"报价评估中",customer.grade,customer.grade,customer.next_follow_up,customer.next_follow_purpose,now());}}
  if(formal)db.prepare("INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)").run(id("audit"),req.session.user.id,"create_formal_version","quotation",quoteId,JSON.stringify({sourceQuoteId:q.sourceQuoteId||q.id||""}),JSON.stringify({seriesId,version,total:totalMachinePrice+totalFreight}),"生成正式报价版本",now());
  ok(res, { id: quoteId,seriesId,version,isFormal:formal, message: "Quotation saved successfully.", zh: formal?"正式报价版本已生成。":"报价保存成功。" });
});

app.get("/api/quotations", requireLogin, (req, res) => {
  const keyword=String(req.query.q || "").trim().toLowerCase(), date=String(req.query.date || "").trim();
  const rows = db.prepare("SELECT * FROM quotations ORDER BY updated_at DESC").all();
  const quotations=rows.map(row=>{
    const buyer=JSON.parse(row.buyer_json || "{}"), terms=JSON.parse(row.terms_json || "{}"), settingsSnapshot=JSON.parse(row.settings_snapshot_json || "{}");
    const items=db.prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY sort_order").all(row.id).map(item=>({
      id:item.id, productId:item.product_id, productSnapshot:JSON.parse(item.product_snapshot_json || "{}"), priceSnapshot:JSON.parse(item.price_snapshot_json || "{}"), freightSnapshot:JSON.parse(item.freight_snapshot_json || "{}"), includeFreightInTotal:!!item.include_freight_in_total
    }));
    return {...row,buyer,terms,settingsSnapshot,items};
  }).filter(row=>{
    if(date && row.quote_date!==date)return false;
    if(!keyword)return true;
    const itemText=row.items.map(item=>`${item.productSnapshot.productName||""} ${item.productSnapshot.machineCategory||""} ${item.productSnapshot.brand||""} ${item.productSnapshot.model||""} ${Object.values(item.priceSnapshot.values||{}).join(" ")}`).join(" ");
    return `${row.quote_number||""} ${row.buyer.company||""} ${row.buyer.contact||""} ${row.buyer.country||""} ${Object.values(row.terms||{}).join(" ")} ${itemText}`.toLowerCase().includes(keyword);
  });
  ok(res, { quotations });
});

app.get("/api/quotations/:id", requireLogin, (req, res) => {
  const quote = db.prepare("SELECT * FROM quotations WHERE id=?").get(req.params.id);
  if (!quote) return fail(res, 404, "Quotation not found.", "报价单不存在。");
  const items = db.prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY sort_order").all(req.params.id);
  ok(res, { quotation:{...quote,buyer:JSON.parse(quote.buyer_json||"{}"),terms:JSON.parse(quote.terms_json||"{}"),settingsSnapshot:JSON.parse(quote.settings_snapshot_json||"{}")}, items:items.map(item=>({...item,productSnapshot:JSON.parse(item.product_snapshot_json||"{}"),priceSnapshot:JSON.parse(item.price_snapshot_json||"{}"),freightSnapshot:JSON.parse(item.freight_snapshot_json||"{}")})) });
});

app.delete("/api/quotations/:id", requireLogin, (req, res) => {
  const quote = db.prepare("SELECT * FROM quotations WHERE id=?").get(req.params.id);
  if (!quote) return fail(res, 404, "Quotation not found.", "报价单不存在。");
  if (quote.is_formal) {
    db.prepare("UPDATE quotations SET status='Void',updated_at=? WHERE id=?").run(now(), req.params.id);
    db.prepare("INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(id("audit"), req.session.user.id, "void_formal_quotation", "quotation", req.params.id, JSON.stringify({ status:quote.status }), JSON.stringify({ status:"Void" }), "历史报价中作废", now());
    return ok(res, { action:"void", message:"Formal quotation voided.", zh:"正式报价已作废并保留审计记录。" });
  }
  db.transaction(() => {
    db.prepare("DELETE FROM quotation_items WHERE quotation_id=?").run(req.params.id);
    db.prepare("DELETE FROM quotations WHERE id=?").run(req.params.id);
  })();
  ok(res, { action:"delete", message: "Draft deleted successfully.", zh: "草稿已删除。" });
});

app.post("/api/quotations/:id/copy", requireLogin, (req, res) => {
  const quote = db.prepare("SELECT * FROM quotations WHERE id=?").get(req.params.id);
  if (!quote) return fail(res, 404, "Quotation not found.", "报价单不存在。");
  const items = db.prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY sort_order").all(req.params.id);
  const newId = id("quote");
  db.prepare(`INSERT INTO quotations (id, quote_number, status, buyer_json, settings_snapshot_json, terms_json, total_machine_price, total_freight, total_amount, include_freight_in_total, show_freight_detail_in_pdf, quote_date, valid_until, created_at, updated_at)
    VALUES (?, ?, 'Draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(newId, `${quote.quote_number || "QUOTE"}-COPY`, quote.buyer_json, quote.settings_snapshot_json, quote.terms_json, quote.total_machine_price, quote.total_freight, quote.total_amount, quote.include_freight_in_total, quote.show_freight_detail_in_pdf, now().slice(0, 10), quote.valid_until, now(), now());
  const insertItem = db.prepare(`INSERT INTO quotation_items (id, quotation_id, product_id, product_snapshot_json, price_snapshot_json, freight_snapshot_json, include_freight_in_total, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  items.forEach((item, index) => insertItem.run(id("item"), newId, item.product_id, item.product_snapshot_json, item.price_snapshot_json, item.freight_snapshot_json, item.include_freight_in_total, index, now(), now()));
  ok(res, { id: newId, message: "Copied successfully.", zh: "复制成功。" });
});

app.get("/api/system/paths", requireLogin, (req, res) => ok(res, { dataDir, uploadDir, backupDir, exportDir, dbPath }));

app.get("/api/system/browser-state", requireLogin, (req, res) => {
  if (!fs.existsSync(browserStatePath)) {
    return ok(res, { exists: false, state: null, updatedAt: "" });
  }
  try {
    const state = JSON.parse(fs.readFileSync(browserStatePath, "utf8"));
    ok(res, { exists: true, state, updatedAt: state.updatedAt || "" });
  } catch {
    fail(res, 500, "Saved browser data is damaged.", "浏览器备份数据损坏。");
  }
});

app.put("/api/system/browser-state", requireLogin, (req, res) => {
  const state = {
    updatedAt: now(),
    settings: req.body?.settings || {},
    products: Array.isArray(req.body?.products) ? req.body.products : [],
    quotes: Array.isArray(req.body?.quotes) ? req.body.quotes : []
  };
  fs.writeFileSync(browserStatePath, JSON.stringify(state, null, 2), "utf8");
  ok(res, { updatedAt: state.updatedAt, path: browserStatePath, message: "Local data backup saved.", zh: "本地数据备份已保存。" });
});

app.get("/api/system/export", requireLogin, requireAdmin, (req, res) => {
  const data = {
    exportedAt: now(),
    settings: JSON.parse(db.prepare("SELECT data_json FROM company_settings WHERE id=1").get().data_json),
    products: db.prepare("SELECT * FROM products").all(),
    ports: db.prepare("SELECT * FROM ports").all(),
    freightRates: db.prepare("SELECT * FROM freight_rates").all(),
    quotations: db.prepare("SELECT * FROM quotations").all(),
    quotationItems: db.prepare("SELECT * FROM quotation_items").all(),
    browserState: fs.existsSync(browserStatePath) ? JSON.parse(fs.readFileSync(browserStatePath, "utf8")) : null
  };
  res.setHeader("Content-Disposition", "attachment; filename=quotation-system-export.json");
  res.json(data);
});

app.post("/api/system/import", requireLogin, requireAdmin, (req, res) => {
  const source = req.body?.path;
  if (!source || !fs.existsSync(source)) return fail(res, 400, "Import file not found.", "导入文件不存在。");
  const data = JSON.parse(fs.readFileSync(source, "utf8"));
  const tx = db.transaction(() => {
    if (data.settings) {
      db.prepare("UPDATE company_settings SET data_json=?, updated_at=? WHERE id=1").run(JSON.stringify(data.settings), now());
    }
    if (Array.isArray(data.products)) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO products (id, category, brand, model, aliases, condition, transport_length, transport_width, transport_height, transport_cbm, dimension_unit, weight, transport_method, reference_price, params, remark, image_path, status, search_text, created_at, updated_at)
        VALUES (@id, @category, @brand, @model, @aliases, @condition, @transport_length, @transport_width, @transport_height, @transport_cbm, @dimension_unit, @weight, @transport_method, @reference_price, @params, @remark, @image_path, @status, @search_text, @created_at, @updated_at)`);
      data.products.forEach((row) => stmt.run(row));
    }
    if (Array.isArray(data.ports)) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO ports (id, country_name, country_chinese_name, country_code, port_name, port_chinese_name, un_locode, aliases, is_origin_port, is_destination_port, status, remark, search_text, created_at, updated_at)
        VALUES (@id, @country_name, @country_chinese_name, @country_code, @port_name, @port_chinese_name, @un_locode, @aliases, @is_origin_port, @is_destination_port, @status, @remark, @search_text, @created_at, @updated_at)`);
      data.ports.forEach((row) => stmt.run(row));
    }
    if (Array.isArray(data.freightRates)) {
      const stmt = db.prepare(`INSERT OR REPLACE INTO freight_rates (id, origin_port_id, destination_port_id, origin_display_name, destination_display_name, destination_country, shipping_method, rate, currency, rate_unit, effective_month, effective_start_date, effective_end_date, freight_forwarder, remark, status, search_text, created_at, updated_at)
        VALUES (@id, @origin_port_id, @destination_port_id, @origin_display_name, @destination_display_name, @destination_country, @shipping_method, @rate, @currency, @rate_unit, @effective_month, @effective_start_date, @effective_end_date, @freight_forwarder, @remark, @status, @search_text, @created_at, @updated_at)`);
      data.freightRates.forEach((row) => stmt.run(row));
    }
    if (data.browserState) {
      fs.writeFileSync(browserStatePath, JSON.stringify({ ...data.browserState, updatedAt: now() }, null, 2), "utf8");
    }
  });
  tx();
  ok(res, { message: "Import completed successfully.", zh: "导入完成。" });
});

app.get("/api/system/backup-db", requireLogin, requireAdmin, (req, res) => {
  ensureDir(backupDir);
  const fileName = `quotation-system-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`;
  const target = path.join(backupDir, fileName);
  fs.copyFileSync(dbPath, target);
  ok(res, { path: target, message: "Database backup created.", zh: "数据库备份已创建。" });
});

app.post("/api/system/restore-db", requireLogin, requireAdmin, (req, res) => {
  const source = req.body?.path;
  if (!source || !fs.existsSync(source)) return fail(res, 400, "Backup file not found.", "备份文件不存在。");
  const pending = path.join(dataDir, "restore-pending.sqlite");
  fs.copyFileSync(source, pending);
  ok(res, {
    message: "Restore file prepared. Please restart the application to complete restore.",
    zh: "恢复文件已准备好，请重启软件完成恢复。"
  });
});

// 客户跟进模块：与报价系统共用登录、服务器和数据库。
app.get("/api/customers", requireLogin, (req, res) => {
  const rows = db.prepare(`SELECT c.*,
    (SELECT COUNT(*) FROM follow_ups f WHERE f.customer_id=c.id) AS follow_up_count
    FROM customers c
    ORDER BY CASE grade WHEN 'S' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 ELSE 4 END, updated_at DESC`).all();
  res.json(rows.map(parseCustomer));
});

app.get("/api/dashboard", requireLogin, (req, res) => {
  const completed = Number(db.prepare(`SELECT COUNT(DISTINCT customer_id) AS count FROM follow_ups
    WHERE date(created_at, 'localtime')=date('now', 'localtime')`).get().count);
  const pending = Number(db.prepare(`SELECT COUNT(*) AS count FROM customers
    WHERE next_follow_up<>'' AND next_follow_up<=date('now', 'localtime')
    AND stage NOT IN ('无效客户','已采购')`).get().count);
  const total = completed + pending;
  res.json({ completed, pending, total, progress: total ? Math.round(completed * 100 / total) : 100 });
});

app.get("/api/customers/:id", requireLogin, (req, res) => {
  const customer = parseCustomer(db.prepare("SELECT * FROM customers WHERE id=?").get(req.params.id));
  if (!customer) return res.status(404).json({ error: "客户不存在" });
  customer.follow_ups = db.prepare("SELECT * FROM follow_ups WHERE customer_id=? ORDER BY created_at DESC").all(req.params.id);
  customer.quotations = db.prepare("SELECT id, quote_number, status, total_amount, quote_date, updated_at FROM quotations WHERE customer_id=? ORDER BY updated_at DESC").all(req.params.id);
  customer.vehicle_quotations = db.prepare(`SELECT v.id,v.version,v.status,v.currency,v.final_total,v.formalized_at,v.updated_at,s.quote_number
    FROM quote_versions v JOIN quote_series s ON s.id=v.series_id WHERE v.customer_id=? ORDER BY COALESCE(v.formalized_at,v.updated_at) DESC`).all(req.params.id);
  const parse=(text,fallback={})=>{try{return JSON.parse(text||"")}catch{return fallback}};
  const ordinaryHistory=db.prepare("SELECT * FROM quotations WHERE customer_id=? ORDER BY updated_at DESC").all(req.params.id).map(q=>{
    const terms=parse(q.terms_json),settingsSnapshot=parse(q.settings_snapshot_json),meta=settingsSnapshot._quoteMeta||{};
    const items=db.prepare("SELECT product_snapshot_json,price_snapshot_json FROM quotation_items WHERE quotation_id=? ORDER BY sort_order").all(q.id).map(item=>({product:parse(item.product_snapshot_json),price:parse(item.price_snapshot_json)}));
    return {id:q.id,type:"standard",seriesId:q.series_id||q.id,quoteNumber:q.quote_number,version:q.version||null,status:q.status,currency:meta.currency||items[0]?.price?.currency||"USD",total:q.total_amount,date:q.quote_date||q.updated_at,updatedAt:q.updated_at,formalizedAt:q.formalized_at||null,sourceQuoteId:q.source_quote_id||null,documentType:meta.documentType||"quotation",port:terms.port||terms.destinationPort||"",machineSummary:items.map(item=>`${item.product.machineCategory||""} ${item.product.brand||""} ${item.product.model||""} ${item.product.productName||""}`.trim()).filter(Boolean).join("；"),quantity:items.reduce((sum,item)=>sum+Number(item.price.quantity||item.price.values?.qty||0),0)};
  });
  const vehicleHistory=db.prepare(`SELECT v.*,s.quote_number,s.source_quote_id FROM quote_versions v JOIN quote_series s ON s.id=v.series_id WHERE v.customer_id=? ORDER BY COALESCE(v.formalized_at,v.updated_at) DESC`).all(req.params.id).map(q=>{
    const snapshot=parse(q.snapshot_json),items=snapshot.items||[];
    return {id:q.id,type:"vehicle",seriesId:q.series_id,quoteNumber:q.quote_number,version:q.version,status:q.status,currency:q.currency,total:q.final_total,date:snapshot.quoteDate||q.formalized_at||q.updated_at,updatedAt:q.updated_at,formalizedAt:q.formalized_at,sourceQuoteId:q.source_quote_id,documentType:snapshot.documentType||"quotation",port:snapshot.buyer?.destinationPort||snapshot.terms?.destinationPort||"",machineSummary:items.map(item=>`${item.vehicleType?.name_zh||item.vehicleType?.name_en||""} ${item.chassis?.brand||""} ${item.chassis?.model||""} ${item.chassis?.drive_type||""} / ${item.superstructure?.brand||""} ${item.superstructure?.model||""}`).join("；"),quantity:items.reduce((sum,item)=>sum+Number(item.quantity||0),0)};
  });
  customer.quote_history=[...ordinaryHistory,...vehicleHistory].sort((a,b)=>String(b.formalizedAt||b.updatedAt||b.date||"").localeCompare(String(a.formalizedAt||a.updatedAt||a.date||"")));
  const latestBySeries=new Set();customer.quote_history.forEach((q,index)=>{q.isLatest=index===0;const key=q.type==="vehicle"?q.seriesId:q.id;q.isLatestVersion=!latestBySeries.has(key);latestBySeries.add(key)});
  customer.quote_summary={total:customer.quote_history.length,formal:customer.quote_history.filter(q=>q.formalizedAt||q.status==="Formal"||q.status==="已发送").length,latest:customer.quote_history[0]||null};
  res.json(customer);
});

app.post("/api/customers", requireLogin, (req, res) => {
  const body = req.body || {};
  if (!String(body.name || "").trim()) return res.status(400).json({ error: "客户名称不能为空" });
  const timestamp = now();
  const result = db.prepare(`INSERT INTO customers
    (name,company,phone,country,buyer_type,stage,grade,project_tags,equipment_tags,requirement,arrival_precision,arrival_value,next_follow_up,next_follow_purpose,whatsapp_number,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      String(body.name).trim(), body.company || "", body.phone || "", body.country || "", body.buyer_type || "公司买家",
      body.stage || "需求确认中", body.grade || "B", JSON.stringify(body.project_tags || []),
      JSON.stringify(body.equipment_tags || []), body.requirement || "", body.arrival_precision || "none",
      body.arrival_value || "", body.next_follow_up || "", body.next_follow_purpose || "",
      String(body.phone || "").replace(/\D/g, ""), timestamp, timestamp
    );
  res.json({ id: Number(result.lastInsertRowid) });
});

installVehicleQuoteRoutes(app, { db, requireLogin, requireAdmin, ok, fail });
installSpecImportRoutes(app, { requireLogin, requireAdmin, ok, fail });

app.post("/api/customers/:id/followups", requireLogin, (req, res) => {
  const customer = db.prepare("SELECT * FROM customers WHERE id=?").get(req.params.id);
  if (!customer) return res.status(404).json({ error: "客户不存在" });
  const body = req.body || {};
  if (!String(body.content || "").trim() && !body.outcome) return res.status(400).json({ error: "请填写跟进内容或未联系成功原因" });
  const timestamp = now();
  const newStage = body.stage || customer.stage;
  const newGrade = body.grade || customer.grade;
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO follow_ups
      (customer_id,content,contact_type,outcome,old_stage,new_stage,old_grade,new_grade,next_follow_up,next_follow_purpose,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
        customer.id, body.content || "", body.contact_type || "WhatsApp", body.outcome || "",
        customer.stage, newStage, customer.grade, newGrade, body.next_follow_up || "",
        body.next_follow_purpose || "", timestamp
      );
    db.prepare(`UPDATE customers SET stage=?,grade=?,arrival_precision=?,arrival_value=?,next_follow_up=?,next_follow_purpose=?,updated_at=? WHERE id=?`).run(
      newStage, newGrade, body.arrival_precision || customer.arrival_precision,
      body.arrival_value ?? customer.arrival_value, body.next_follow_up || "",
      body.next_follow_purpose || "", timestamp, customer.id
    );
  });
  tx();
  res.json({ ok: true });
});

app.post("/api/backup", requireLogin, requireAdmin, (req, res) => {
  ensureDir(backupDir);
  const target = path.join(backupDir, `foreign-trade-assistant-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`);
  db.backup(target).then(() => res.json({ path: target })).catch((error) => res.status(500).json({ error: error.message }));
});

app.get("/crm", (req, res) => {
  if (!req.session.user) return res.redirect("/?next=crm");
  res.sendFile(path.join(ROOT, "crm", "index.html"));
});

app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));

function startServer(port = PORT) {
  return new Promise((resolve) => {
    const server = app.listen(port, "0.0.0.0", () => resolve(server));
  });
}

if (require.main === module) {
  startServer().then(() => {
    console.log(`Foreign Trade Assistant / 外贸助手 running at http://0.0.0.0:${PORT}`);
    console.log(`Data directory: ${dataDir}`);
  });
}

module.exports = { app, startServer };

