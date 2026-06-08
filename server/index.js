const fs = require("fs");
const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { db, id, now, normalize, dbPath } = require("./db");
const { dataDir, uploadDir, backupDir, exportDir, ensureDir } = require("./paths");

const app = express();
const PORT = Number(process.env.PORT || 8765);
const ROOT = path.resolve(__dirname, "..");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(session({
  secret: process.env.SESSION_SECRET || "quote-assistant-local-secret",
  resave: false,
  saveUninitialized: false
}));
app.use("/uploads", express.static(uploadDir));
app.use(express.static(ROOT));

function ok(res, data = {}) {
  res.json({ ok: true, ...data });
}

function fail(res, status, message, zh) {
  res.status(status).json({ ok: false, message, zh });
}

function requireLogin(req, res, next) {
  if (req.session.user) return next();
  return fail(res, 401, "Please log in.", "请先登录。");
}

function requireAdmin(req, res, next) {
  if (["owner", "admin"].includes(req.session.user?.role)) return next();
  return fail(res, 403, "Admin permission required.", "需要管理员权限。");
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
    rate.remark
  ].join(" "));
}

function calculateCbm(length, width, height, unit) {
  const l = Number(length || 0);
  const w = Number(width || 0);
  const h = Number(height || 0);
  if (!l || !w || !h) return null;
  const raw = unit === "mm" ? l * w * h / 1000000000 : l * w * h;
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

app.get("/api/auth/me", (req, res) => ok(res, { user: req.session.user || null }));

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
  db.prepare("UPDATE users SET status='Inactive', updated_at=? WHERE id=?").run(now(), req.params.id);
  ok(res, { mode: "inactive", message: "Marked as inactive successfully.", zh: "已成功标记为停用。" });
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
    params: p.params || "",
    remark: p.remark || "",
    imagePath: p.imagePath || "",
    status: p.status || "Active"
  };
  db.prepare(`INSERT INTO products
    (id, category, brand, model, aliases, condition, transport_length, transport_width, transport_height, transport_cbm, dimension_unit, weight, transport_method, reference_price, params, remark, image_path, status, search_text, created_at, updated_at)
    VALUES (@id, @category, @brand, @model, @aliases, @condition, @transportLength, @transportWidth, @transportHeight, @transportCbm, @dimensionUnit, @weight, @transportMethod, @referencePrice, @params, @remark, @imagePath, @status, @searchText, @createdAt, @updatedAt)`)
    .run({ id: productId, ...payload, searchText: productSearchText(payload), createdAt: now(), updatedAt: now() });
  ok(res, { product: rowToProduct(db.prepare("SELECT * FROM products WHERE id = ?").get(productId)), message: "Saved successfully.", zh: "保存成功。" });
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
    params: p.params ?? existing.params,
    remark: p.remark ?? existing.remark,
    imagePath: p.imagePath ?? existing.image_path,
    status: p.status ?? existing.status
  };
  db.prepare(`UPDATE products SET category=@category, brand=@brand, model=@model, aliases=@aliases, condition=@condition,
    transport_length=@transportLength, transport_width=@transportWidth, transport_height=@transportHeight, transport_cbm=@transportCbm,
    dimension_unit=@dimensionUnit, weight=@weight, transport_method=@transportMethod, reference_price=@referencePrice, params=@params,
    remark=@remark, image_path=@imagePath, status=@status, search_text=@searchText, updated_at=@updatedAt WHERE id=@id`)
    .run({ id: req.params.id, ...payload, searchText: productSearchText(payload), updatedAt: now() });
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
    remark: r.remark || "",
    status: r.status || "Active"
  };
  db.prepare(`INSERT INTO freight_rates (id, origin_port_id, destination_port_id, origin_display_name, destination_display_name, destination_country, shipping_method, rate, currency, rate_unit, effective_month, effective_start_date, effective_end_date, freight_forwarder, remark, status, search_text, created_at, updated_at)
    VALUES (@id, @originPortId, @destinationPortId, @originDisplayName, @destinationDisplayName, @destinationCountry, @shippingMethod, @rate, @currency, @rateUnit, @effectiveMonth, @effectiveStartDate, @effectiveEndDate, @freightForwarder, @remark, @status, @searchText, @createdAt, @updatedAt)`)
    .run({ id: rateId, ...payload, searchText: freightSearchText(payload), createdAt: now(), updatedAt: now() });
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
    remark: r.remark,
    status: r.status
  };
  db.prepare(`UPDATE freight_rates SET origin_port_id=@originPortId, destination_port_id=@destinationPortId, origin_display_name=@originDisplayName,
    destination_display_name=@destinationDisplayName, destination_country=@destinationCountry, shipping_method=@shippingMethod, rate=@rate,
    currency=@currency, rate_unit=@rateUnit, effective_month=@effectiveMonth, effective_start_date=@effectiveStartDate, effective_end_date=@effectiveEndDate,
    freight_forwarder=@freightForwarder, remark=@remark, status=@status, search_text=@searchText, updated_at=@updatedAt WHERE id=@id`)
    .run({ id: req.params.id, ...payload, searchText: freightSearchText(payload), updatedAt: now() });
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
  const { transportCbm, freightRate, quantity } = req.body || {};
  const amount = freightAmount(transportCbm, freightRate, quantity);
  ok(res, {
    freightAmount: amount,
    calculationFormula: `${transportCbm || 0} × ${freightRate || 0} × ${quantity || 1} = ${amount} USD`
  });
});

app.get("/api/settings", requireLogin, (req, res) => {
  const row = db.prepare("SELECT data_json FROM company_settings WHERE id=1").get();
  ok(res, { settings: JSON.parse(row.data_json) });
});

app.put("/api/settings", requireLogin, requireAdmin, (req, res) => {
  db.prepare("UPDATE company_settings SET data_json=?, updated_at=? WHERE id=1").run(JSON.stringify(req.body || {}), now());
  ok(res, { message: "Saved successfully.", zh: "保存成功。" });
});

app.post("/api/quotations", requireLogin, (req, res) => {
  const q = req.body || {};
  const quoteId = q.id || id("quote");
  const items = q.items || [];
  const totalMachinePrice = items.reduce((sum, item) => sum + Number(item.machineAmount || 0), 0);
  const totalFreight = items.reduce((sum, item) => sum + (item.includeFreightInTotal === false ? 0 : Number(item.freightSnapshot?.freightAmount || 0)), 0);
  db.prepare(`INSERT OR REPLACE INTO quotations (id, quote_number, status, buyer_json, settings_snapshot_json, terms_json, total_machine_price, total_freight, total_amount, include_freight_in_total, show_freight_detail_in_pdf, quote_date, valid_until, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM quotations WHERE id=?), ?), ?)`)
    .run(quoteId, q.quoteNumber, q.status || "Draft", JSON.stringify(q.buyer || {}), JSON.stringify(q.settingsSnapshot || {}), JSON.stringify(q.terms || {}), totalMachinePrice, totalFreight, totalMachinePrice + totalFreight, q.includeFreightInTotal === false ? 0 : 1, q.showFreightDetailInPdf ? 1 : 0, q.quoteDate || now().slice(0, 10), q.validUntil || "", quoteId, now(), now());
  db.prepare("DELETE FROM quotation_items WHERE quotation_id=?").run(quoteId);
  const insertItem = db.prepare(`INSERT INTO quotation_items (id, quotation_id, product_id, product_snapshot_json, price_snapshot_json, freight_snapshot_json, include_freight_in_total, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  items.forEach((item, index) => insertItem.run(item.id || id("item"), quoteId, item.productId || "", JSON.stringify(item.productSnapshot || {}), JSON.stringify(item.priceSnapshot || {}), JSON.stringify(item.freightSnapshot || {}), item.includeFreightInTotal === false ? 0 : 1, index, now(), now()));
  ok(res, { id: quoteId, message: "Quotation saved successfully.", zh: "报价保存成功。" });
});

app.get("/api/quotations", requireLogin, (req, res) => {
  const rows = db.prepare("SELECT * FROM quotations ORDER BY updated_at DESC").all();
  ok(res, { quotations: rows.map((row) => ({ ...row, buyer: JSON.parse(row.buyer_json || "{}") })) });
});

app.get("/api/quotations/:id", requireLogin, (req, res) => {
  const quote = db.prepare("SELECT * FROM quotations WHERE id=?").get(req.params.id);
  if (!quote) return fail(res, 404, "Quotation not found.", "报价单不存在。");
  const items = db.prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY sort_order").all(req.params.id);
  ok(res, { quotation: quote, items });
});

app.delete("/api/quotations/:id", requireLogin, (req, res) => {
  db.prepare("DELETE FROM quotations WHERE id=?").run(req.params.id);
  ok(res, { message: "Deleted successfully.", zh: "删除成功。" });
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

app.get("/api/system/export", requireLogin, requireAdmin, (req, res) => {
  const data = {
    exportedAt: now(),
    settings: JSON.parse(db.prepare("SELECT data_json FROM company_settings WHERE id=1").get().data_json),
    products: db.prepare("SELECT * FROM products").all(),
    ports: db.prepare("SELECT * FROM ports").all(),
    freightRates: db.prepare("SELECT * FROM freight_rates").all(),
    quotations: db.prepare("SELECT * FROM quotations").all(),
    quotationItems: db.prepare("SELECT * FROM quotation_items").all()
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

app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));

function startServer(port = PORT) {
  return new Promise((resolve) => {
    const server = app.listen(port, "127.0.0.1", () => resolve(server));
  });
}

if (require.main === module) {
  startServer().then(() => {
    console.log(`Quotation System / 报价系统 running at http://127.0.0.1:${PORT}`);
    console.log(`Data directory: ${dataDir}`);
  });
}

module.exports = { app, startServer };

