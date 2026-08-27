const { id, now, normalize } = require("./db");

const safeJson = (value, fallback = {}) => { try { return JSON.parse(value || ""); } catch { return fallback; } };
const money = (value) => Math.round((Number(value) || 0) * 100) / 100;
const active = (value) => value === "Inactive" ? "Inactive" : "Active";
const normalizePhone = (value) => String(value || "").replace(/\D/g, "");
const hasCostAccess = req => ["owner", "admin"].includes(req.session.user?.role);
function redactSnapshot(snapshot) {
  const copy = JSON.parse(JSON.stringify(snapshot || {}));
  (copy.items || []).forEach(item => {
    if (item.chassis) delete item.chassis.cost_price;
    if (item.superstructure) delete item.superstructure.cost_price;
    (item.options || []).forEach(option => delete option.cost_price);
    (item.attachments || []).forEach(attachment => delete attachment.cost_price);
    if (item.pricing) delete item.pricing.standardCost;
  });
  return copy;
}

function installVehicleQuoteRoutes(app, { db, requireLogin, requireAdmin, ok, fail }) {
  const audit = (req, action, entityType, entityId, before = {}, after = {}, reason = "") => db.prepare(
    "INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,before_json,after_json,reason,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
  ).run(id("audit"), req.session.user?.id || "", action, entityType, entityId, JSON.stringify(before), JSON.stringify(after), reason, now());

  const configs = {
    "vehicle-types": { table: "vehicle_types", fields: ["code","name_zh","name_en","image_path","description_zh","description_en","quote_fields_json","status"] },
    chassis: { table: "chassis", fields: ["code","brand","series","model","drive_type","engine","horsepower","emission","wheelbase","cab","capacity","length","width","height","dimension_unit","params_zh","params_en","image_path","currency","factory_price","cost_price","sale_price","status"] },
    superstructures: { table: "superstructures", fields: ["code","type","brand","model","rated_capacity","boom_sections","boom_length","crane_form","tank_capacity","length","width","height","dimension_unit","params_zh","params_en","image_path","currency","factory_price","cost_price","sale_price","status"] },
    options: { table: "vehicle_options", fields: ["code","name_zh","name_en","params_zh","params_en","currency","cost_price","sale_price","status"] },
    attachments: { table: "vehicle_attachments", fields: ["code","name_zh","name_en","attachment_type","brand","model","params_zh","params_en","image_path","transport_length","transport_width","transport_height","transport_cbm","dimension_unit","weight","currency","cost_price","sale_price","status"] }
  };

  Object.entries(configs).forEach(([route, config]) => {
    app.get(`/api/catalog/${route}`, requireLogin, (req, res) => {
      const includeInactive = req.query.all === "1" && ["owner","admin"].includes(req.session.user?.role);
      const rows = db.prepare(`SELECT * FROM ${config.table} ${includeInactive ? "" : "WHERE status='Active'"} ORDER BY updated_at DESC`).all();
      if (!["owner","admin"].includes(req.session.user?.role)) rows.forEach(row => delete row.cost_price);
      ok(res, { items: rows });
    });
    app.post(`/api/catalog/${route}`, requireLogin, requireAdmin, (req, res) => {
      const body = req.body || {}; const rowId = body.id || id(route.replace(/s$/, ""));
      const values = config.fields.map(field => field === "status" ? active(body[field]) : (["factory_price","cost_price","sale_price","length","width","height","transport_length","transport_width","transport_height","transport_cbm","weight"].includes(field) ? money(body[field]) : (body[field] ?? "")));
      const columns = ["id", ...config.fields, "created_at", "updated_at"];
      db.prepare(`INSERT INTO ${config.table} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`).run(rowId, ...values, now(), now());
      if (["chassis","superstructures","options","attachments"].includes(route)) {
        const searchText = normalize(Object.values(body).join(" "));
        db.prepare(`UPDATE ${config.table} SET search_text=? WHERE id=?`).run(searchText, rowId);
      }
      audit(req, "create", config.table, rowId, {}, body);
      ok(res, { id: rowId, zh: "保存成功。" });
    });
    app.put(`/api/catalog/${route}/:id`, requireLogin, requireAdmin, (req, res) => {
      const before = db.prepare(`SELECT * FROM ${config.table} WHERE id=?`).get(req.params.id);
      if (!before) return fail(res, 404, "Not found.", "记录不存在。");
      const body = req.body || {};
      const values = config.fields.map(field => field === "status" ? active(body[field] ?? before[field]) : (["factory_price","cost_price","sale_price","length","width","height","transport_length","transport_width","transport_height","transport_cbm","weight"].includes(field) ? money(body[field] ?? before[field]) : (body[field] ?? before[field])));
      db.prepare(`UPDATE ${config.table} SET ${config.fields.map(f => `${f}=?`).join(",")}, updated_at=? WHERE id=?`).run(...values, now(), req.params.id);
      audit(req, body.status === "Inactive" ? "deactivate" : "update", config.table, req.params.id, before, body, body.reason || "");
      ok(res, { zh: "更新成功。" });
    });
  });

  app.get("/api/compatibility", requireLogin, (req, res) => {
    const clauses = ["r.status='Active'"], values = [];
    for (const [query, column] of [["vehicleTypeId","r.vehicle_type_id"],["chassisId","r.chassis_id"],["superstructureId","r.superstructure_id"]]) {
      if (req.query[query]) { clauses.push(`${column}=?`); values.push(req.query[query]); }
    }
    const rows = db.prepare(`SELECT r.*,vt.name_zh vehicle_type_name,c.brand chassis_brand,c.model chassis_model,c.drive_type,
      s.brand superstructure_brand,s.model superstructure_model FROM compatibility_rules r
      JOIN vehicle_types vt ON vt.id=r.vehicle_type_id JOIN chassis c ON c.id=r.chassis_id JOIN superstructures s ON s.id=r.superstructure_id
      WHERE ${clauses.join(" AND ")} ORDER BY vt.name_zh,c.brand,c.model,s.brand,s.model`).all(...values);
    rows.forEach(row => { row.option_ids = db.prepare("SELECT option_id FROM compatibility_options WHERE compatibility_id=?").all(row.id).map(x => x.option_id); row.attachment_ids = db.prepare("SELECT attachment_id FROM compatibility_attachments WHERE compatibility_id=?").all(row.id).map(x => x.attachment_id); });
    ok(res, { items: rows });
  });

  app.post("/api/compatibility", requireLogin, requireAdmin, (req, res) => {
    const body = req.body || {}, ruleId = body.id || id("compat");
    if (!body.vehicleTypeId || !body.chassisId || !body.superstructureId) return fail(res, 400, "Missing compatibility fields.", "车型、底盘和上装不能为空。");
    const tx = db.transaction(() => {
      db.prepare("INSERT INTO compatibility_rules (id,vehicle_type_id,chassis_id,superstructure_id,price_mode,price_value,currency,status,transport_length,transport_width,transport_height,transport_cbm,dimension_unit,transport_method,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
        .run(ruleId, body.vehicleTypeId, body.chassisId, body.superstructureId, body.priceMode || "standard", money(body.priceValue), body.currency || "USD", active(body.status), money(body.transportLength), money(body.transportWidth), money(body.transportHeight), money(body.transportCbm), body.dimensionUnit || "meter", body.transportMethod || "Bulk Cargo", now(), now());
      const add = db.prepare("INSERT INTO compatibility_options (compatibility_id,option_id,created_at) VALUES (?,?,?)");
      (body.optionIds || []).forEach(optionId => add.run(ruleId, optionId, now()));
      const addAttachment = db.prepare("INSERT INTO compatibility_attachments (compatibility_id,attachment_id,created_at) VALUES (?,?,?)");
      (body.attachmentIds || []).forEach(attachmentId => addAttachment.run(ruleId, attachmentId, now()));
      audit(req, "create", "compatibility", ruleId, {}, body);
    }); tx(); ok(res, { id: ruleId, zh: "兼容组合已保存。" });
  });

  app.put("/api/compatibility/:id", requireLogin, requireAdmin, (req, res) => {
    const before = db.prepare("SELECT * FROM compatibility_rules WHERE id=?").get(req.params.id);
    if (!before) return fail(res, 404, "Not found.", "兼容组合不存在。");
    const body = req.body || {};
    const tx = db.transaction(() => {
      db.prepare("UPDATE compatibility_rules SET vehicle_type_id=?,chassis_id=?,superstructure_id=?,price_mode=?,price_value=?,currency=?,status=?,transport_length=?,transport_width=?,transport_height=?,transport_cbm=?,dimension_unit=?,transport_method=?,updated_at=? WHERE id=?")
        .run(body.vehicleTypeId || before.vehicle_type_id, body.chassisId || before.chassis_id, body.superstructureId || before.superstructure_id, body.priceMode || before.price_mode, money(body.priceValue ?? before.price_value), body.currency || before.currency, active(body.status ?? before.status), money(body.transportLength ?? before.transport_length), money(body.transportWidth ?? before.transport_width), money(body.transportHeight ?? before.transport_height), money(body.transportCbm ?? before.transport_cbm), body.dimensionUnit || before.dimension_unit || "meter", body.transportMethod || before.transport_method || "Bulk Cargo", now(), req.params.id);
      const nextOptionIds = Array.isArray(body.optionIds) ? body.optionIds : db.prepare("SELECT option_id FROM compatibility_options WHERE compatibility_id=?").all(req.params.id).map(x=>x.option_id);
      const nextAttachmentIds = Array.isArray(body.attachmentIds) ? body.attachmentIds : db.prepare("SELECT attachment_id FROM compatibility_attachments WHERE compatibility_id=?").all(req.params.id).map(x=>x.attachment_id);
      db.prepare("DELETE FROM compatibility_options WHERE compatibility_id=?").run(req.params.id);
      const add = db.prepare("INSERT INTO compatibility_options (compatibility_id,option_id,created_at) VALUES (?,?,?)");
      nextOptionIds.forEach(optionId => add.run(req.params.id, optionId, now()));
      db.prepare("DELETE FROM compatibility_attachments WHERE compatibility_id=?").run(req.params.id);
      const addAttachment = db.prepare("INSERT INTO compatibility_attachments (compatibility_id,attachment_id,created_at) VALUES (?,?,?)");
      nextAttachmentIds.forEach(attachmentId => addAttachment.run(req.params.id, attachmentId, now()));
      audit(req, "update", "compatibility", req.params.id, before, body, body.reason || "");
    }); tx(); ok(res, { zh: "兼容组合已更新。" });
  });

  function buildVehicleSnapshot(item, currency, strict = true) {
    const rule = db.prepare("SELECT * FROM compatibility_rules WHERE id=? AND status='Active'").get(item.compatibilityId);
    if (!rule) { if (strict) throw new Error("该组合尚未配置，请联系管理员维护"); return null; }
    const vt = db.prepare("SELECT * FROM vehicle_types WHERE id=? AND status='Active'").get(rule.vehicle_type_id);
    const chassis = db.prepare("SELECT * FROM chassis WHERE id=? AND status='Active'").get(rule.chassis_id);
    const upper = db.prepare("SELECT * FROM superstructures WHERE id=? AND status='Active'").get(rule.superstructure_id);
    if (!vt || !chassis || !upper) throw new Error("组合中的产品已停用，请联系管理员维护");
    const allowed = new Set(db.prepare("SELECT option_id FROM compatibility_options WHERE compatibility_id=?").all(rule.id).map(x => x.option_id));
    const optionIds = [...new Set(item.optionIds || [])];
    if (optionIds.some(optionId => !allowed.has(optionId))) throw new Error("选择了不兼容的选装件");
    const options = optionIds.map(optionId => db.prepare("SELECT * FROM vehicle_options WHERE id=? AND status='Active'").get(optionId));
    if (options.some(x => !x)) throw new Error("选装件不存在或已停用");
    const allowedAttachments = new Set(db.prepare("SELECT attachment_id FROM compatibility_attachments WHERE compatibility_id=?").all(rule.id).map(x => x.attachment_id));
    const attachmentIds = [...new Set(item.attachmentIds || [])];
    if (attachmentIds.some(attachmentId => !allowedAttachments.has(attachmentId))) throw new Error("选择了不兼容的属具或工具头");
    const attachments = attachmentIds.map(attachmentId => db.prepare("SELECT * FROM vehicle_attachments WHERE id=? AND status='Active'").get(attachmentId));
    if (attachments.some(x => !x)) throw new Error("属具或工具头不存在或已停用");
    const standardSale = money(chassis.sale_price + upper.sale_price + options.reduce((sum, x) => sum + x.sale_price, 0) + attachments.reduce((sum, x) => sum + x.sale_price, 0));
    const standardCost = money(chassis.cost_price + upper.cost_price + options.reduce((sum, x) => sum + x.cost_price, 0) + attachments.reduce((sum, x) => sum + x.cost_price, 0));
    let calculated = rule.price_mode === "fixed" ? money(rule.price_value) : rule.price_mode === "adjustment" ? money(standardSale + rule.price_value) : standardSale;
    const manual = item.manualUnitPrice === "" || item.manualUnitPrice == null ? null : money(item.manualUnitPrice);
    if (manual != null && manual !== calculated && !String(item.overrideReason || "").trim()) throw new Error("手工改价必须填写原因");
    const unitPrice = manual == null ? calculated : manual, quantity = Math.max(1, parseInt(item.quantity || 1, 10));
    return { compatibilityId: rule.id, currency, vehicleType: vt, chassis, superstructure: upper, options, attachments, specs: item.specs || {}, transport:{length:rule.transport_length,width:rule.transport_width,height:rule.transport_height,cbm:rule.transport_cbm,dimensionUnit:rule.dimension_unit,method:rule.transport_method},
      pricing: { mode: rule.price_mode, specialValue: rule.price_value, standardSale, standardCost, calculatedUnitPrice: calculated,
        manualUnitPrice: manual, overrideReason: item.overrideReason || "", finalUnitPrice: unitPrice }, quantity, unitPrice, lineTotal: money(unitPrice * quantity) };
  }

  const feeValue = (fee, base) => fee?.mode === "percent" ? money(base * Number(fee.value || 0) / 100) : money(fee?.value);
  function calculate(payload, strict = true) {
    const currency = payload.currency || "USD";
    const items = (payload.items || []).map(item => buildVehicleSnapshot(item, currency, strict)).filter(Boolean);
    const subtotal = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
    let running = subtotal; const fees = {};
    for (const key of ["freight","tax","service"]) { fees[key] = feeValue(payload.fees?.[key], running); running = money(running + fees[key]); }
    fees.discount = feeValue(payload.fees?.discount, running); running = money(running - fees.discount);
    return { currency, items, subtotal, fees, finalTotal: Math.max(0, running) };
  }

  app.post("/api/vehicle-quotes/calculate", requireLogin, (req, res) => { try { ok(res, calculate(req.body || {})); } catch (error) { fail(res, 400, error.message, error.message); } });

  function matchCustomer(buyer) {
    const phone = normalizePhone(buyer.phone);
    if (phone) {
      const matches = db.prepare("SELECT * FROM customers").all().filter(row => normalizePhone(row.phone || row.whatsapp_number) === phone);
      if (matches.length === 1) return { customer: matches[0], ambiguous: [] };
      if (matches.length > 1) return { customer: null, ambiguous: matches };
    }
    if (buyer.company && buyer.country) {
      const matches = db.prepare("SELECT * FROM customers WHERE lower(company)=lower(?) AND lower(country)=lower(?)").all(buyer.company.trim(), buyer.country.trim());
      if (matches.length === 1) return { customer: matches[0], ambiguous: [] };
      if (matches.length > 1) return { customer: null, ambiguous: matches };
    }
    return { customer: null, ambiguous: [] };
  }
  app.post("/api/customers/match", requireLogin, (req, res) => ok(res, matchCustomer(req.body || {})));

  function quoteNumber() {
    const day = now().slice(0,10).replace(/-/g, "");
    const count = db.prepare("SELECT COUNT(*) count FROM quote_series WHERE quote_number LIKE ?").get(`QA-${day}-%`).count + 1;
    return `QA-${day}-${String(count).padStart(3,"0")}`;
  }
  function searchText(payload, calc, number) {
    return normalize([number, payload.buyer?.company, payload.buyer?.contact, payload.buyer?.country, payload.currency,
      ...calc.items.flatMap(x => [x.vehicleType.name_zh,x.vehicleType.name_en,x.chassis.brand,x.chassis.series,x.chassis.model,x.chassis.drive_type,
        x.superstructure.brand,x.superstructure.model,x.superstructure.rated_capacity,x.superstructure.boom_sections,x.superstructure.boom_length,x.superstructure.tank_capacity,
        ...x.options.flatMap(o => [o.name_zh,o.name_en,o.code]), ...x.attachments.flatMap(o => [o.name_zh,o.name_en,o.brand,o.model,o.code])])].join(" "));
  }
  function saveVehicleQuote(req, res, formal) {
    try {
      const body = req.body || {}, calc = calculate(body, formal);
      let customerId = body.customerId || null;
      if (!customerId) {
        const matched = matchCustomer(body.buyer || {});
        if (matched.ambiguous.length) return fail(res, 409, "Multiple customers match.", "匹配到多个客户，请选择一个客户。");
        customerId = matched.customer?.id || null;
      }
      const result = db.transaction(() => {
        let series = body.seriesId ? db.prepare("SELECT * FROM quote_series WHERE id=?").get(body.seriesId) : null;
        if (!series) {
          const seriesId = id("series"), number = quoteNumber();
          db.prepare("INSERT INTO quote_series (id,quote_number,quote_type,customer_id,source_quote_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)")
            .run(seriesId, number, "vehicle", customerId, body.sourceQuoteId || null, req.session.user.id, now(), now());
          series = db.prepare("SELECT * FROM quote_series WHERE id=?").get(seriesId);
        } else db.prepare("UPDATE quote_series SET customer_id=?,updated_at=? WHERE id=?").run(customerId, now(), series.id);
        const latest = db.prepare("SELECT * FROM quote_versions WHERE series_id=? ORDER BY version DESC LIMIT 1").get(series.id);
        let version = latest?.version || 1, versionId = latest?.id;
        if (!latest || latest.is_formal || formal) { version = latest ? latest.version + (latest.is_formal ? 1 : 0) : 1; versionId = id("qv"); }
        const snapshot = { quoteType:"vehicle", documentType:body.documentType || "quotation", language:body.language||"bilingual", buyer: body.buyer || {}, currency:calc.currency, items:calc.items, feesInput:body.fees || {}, fees:calc.fees, logistics:body.logistics||null, subtotal:calc.subtotal, finalTotal:calc.finalTotal, terms:body.terms || {}, quoteDate:body.quoteDate || now().slice(0,10), validUntil:body.validUntil || "" };
        const values = [series.id,version,formal?"Formal":(body.status||"Draft"),formal?1:0,customerId,JSON.stringify(body.buyer||{}),calc.currency,JSON.stringify(body.terms||{}),JSON.stringify({input:body.fees||{},calculated:calc.fees}),calc.subtotal,calc.finalTotal,JSON.stringify(snapshot),searchText(body,calc,series.quote_number),req.session.user.id,formal?now():null,now(),now()];
        if (db.prepare("SELECT id FROM quote_versions WHERE id=?").get(versionId)) db.prepare("UPDATE quote_versions SET customer_id=?,buyer_json=?,currency=?,terms_json=?,fees_json=?,subtotal=?,final_total=?,snapshot_json=?,search_text=?,updated_at=? WHERE id=?")
          .run(customerId,values[5],calc.currency,values[7],values[8],calc.subtotal,calc.finalTotal,values[11],values[12],now(),versionId);
        else db.prepare("INSERT INTO quote_versions (id,series_id,version,status,is_formal,customer_id,buyer_json,currency,terms_json,fees_json,subtotal,final_total,snapshot_json,search_text,created_by,formalized_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(versionId,...values);
        db.prepare("DELETE FROM quote_vehicle_items WHERE quote_version_id=?").run(versionId);
        const insert = db.prepare("INSERT INTO quote_vehicle_items (id,quote_version_id,compatibility_id,quantity,snapshot_json,unit_price,line_total,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)");
        calc.items.forEach((item,index) => insert.run(id("qvi"),versionId,item.compatibilityId,item.quantity,JSON.stringify(item),item.unitPrice,item.lineTotal,index,now(),now()));
        if (formal && customerId) {
          const customer = db.prepare("SELECT * FROM customers WHERE id=?").get(customerId);
          db.prepare("UPDATE customers SET stage='报价评估中',updated_at=? WHERE id=?").run(now(),customerId);
          db.prepare("INSERT INTO follow_ups (customer_id,content,contact_type,outcome,old_stage,new_stage,old_grade,new_grade,next_follow_up,next_follow_purpose,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            .run(customerId,`生成正式报价 ${series.quote_number} V${version}，金额 ${calc.currency} ${calc.finalTotal}`,"系统","正式报价",customer.stage,"报价评估中",customer.grade,customer.grade,customer.next_follow_up,customer.next_follow_purpose,now());
        }
        audit(req, formal ? "formalize" : "save_draft", "quote_version", versionId, latest || {}, snapshot, body.overrideReason || "");
        return { seriesId:series.id, versionId, quoteNumber:series.quote_number, version, total:calc.finalTotal };
      })();
      ok(res, result);
    } catch (error) { fail(res, 400, error.message, error.message); }
  }
  app.post("/api/vehicle-quotes/draft", requireLogin, (req,res) => saveVehicleQuote(req,res,false));
  app.post("/api/vehicle-quotes/formalize", requireLogin, (req,res) => saveVehicleQuote(req,res,true));

  app.get("/api/vehicle-quotes/history", requireLogin, (req, res) => {
    const clauses = ["1=1"], values = [];
    if (req.query.q) { clauses.push("v.search_text LIKE ?"); values.push(`%${normalize(req.query.q)}%`); }
    if (req.query.status) { clauses.push("v.status=?"); values.push(req.query.status); }
    if (req.query.from) { clauses.push("date(v.created_at)>=date(?)"); values.push(req.query.from); }
    if (req.query.to) { clauses.push("date(v.created_at)<=date(?)"); values.push(req.query.to); }
    const rows = db.prepare(`SELECT v.*,s.quote_number,s.source_quote_id,u.username sales_name FROM quote_versions v JOIN quote_series s ON s.id=v.series_id LEFT JOIN users u ON u.id=v.created_by WHERE ${clauses.join(" AND ")} ORDER BY v.updated_at DESC`).all(...values);
    ok(res, { quotations: rows.map(row => { let snapshot=safeJson(row.snapshot_json); if(!hasCostAccess(req))snapshot=redactSnapshot(snapshot); return { id:row.id,seriesId:row.series_id,quoteNumber:row.quote_number,version:row.version,status:row.status,isFormal:!!row.is_formal,buyer:snapshot.buyer||{},currency:row.currency,subtotal:row.subtotal,total:row.final_total,fees:snapshot.fees||{},items:snapshot.items||[],quoteDate:snapshot.quoteDate||row.created_at.slice(0,10),sourceQuoteId:row.source_quote_id,salesName:row.sales_name,updatedAt:row.updated_at }; }) });
  });
  app.get("/api/vehicle-quotes/:id", requireLogin, (req,res) => {
    const row=db.prepare("SELECT v.*,s.quote_number,s.source_quote_id FROM quote_versions v JOIN quote_series s ON s.id=v.series_id WHERE v.id=?").get(req.params.id);
    if(!row)return fail(res,404,"Not found.","报价不存在。"); let snapshot=safeJson(row.snapshot_json);if(!hasCostAccess(req))snapshot=redactSnapshot(snapshot);delete row.snapshot_json;ok(res,{quotation:{...row,snapshot}});
  });
  app.get("/api/vehicle-quotes/:id/excel", requireLogin, (req,res) => {
    const row=db.prepare("SELECT v.*,s.quote_number FROM quote_versions v JOIN quote_series s ON s.id=v.series_id WHERE v.id=?").get(req.params.id);
    if(!row)return fail(res,404,"Not found.","报价不存在。"); const snap=safeJson(row.snapshot_json), internal=req.query.internal==="1";
    if(internal&&!["owner","admin"].includes(req.session.user?.role))return fail(res,403,"Admin permission required.","内部版仅管理员可导出。");
    const csv=x=>`"${String(x??"").replace(/"/g,'""')}"`; const header=["Quote No","Version","Customer","Country","Vehicle","Chassis","Drive","Superstructure","Options","Qty","Currency","Unit Price","Amount"];
    if(internal)header.push("Unit Cost","Gross Profit"); const lines=[header.map(csv).join(",")];
    (snap.items||[]).forEach(x=>{const values=[row.quote_number,row.version,snap.buyer?.company||snap.buyer?.contact,snap.buyer?.country,x.vehicleType?.name_en||x.vehicleType?.name_zh,`${x.chassis?.brand} ${x.chassis?.model}`,x.chassis?.drive_type,`${x.superstructure?.brand} ${x.superstructure?.model}`,(x.options||[]).map(o=>o.name_en||o.name_zh).join("; "),x.quantity,snap.currency,x.unitPrice,x.lineTotal];if(internal)values.push(x.pricing?.standardCost,(x.unitPrice-x.pricing?.standardCost)*x.quantity);lines.push(values.map(csv).join(","));});
    lines.push(["","","","","","","","","","","","TOTAL",snap.finalTotal].map(csv).join(","));
    res.setHeader("Content-Type","text/csv; charset=utf-8");res.setHeader("Content-Disposition",`attachment; filename=${row.quote_number}-V${row.version}${internal?"-internal":""}.csv`);res.send("\ufeff"+lines.join("\r\n"));
  });
  app.post("/api/vehicle-quotes/:id/copy", requireLogin, (req,res) => {
    const row=db.prepare("SELECT v.*,s.quote_number FROM quote_versions v JOIN quote_series s ON s.id=v.series_id WHERE v.id=?").get(req.params.id);
    if(!row)return fail(res,404,"Not found.","报价不存在。");
    const snap=safeJson(row.snapshot_json), seriesId=id("series"), number=quoteNumber();
    db.prepare("INSERT INTO quote_series (id,quote_number,quote_type,customer_id,source_quote_id,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)").run(seriesId,number,"vehicle",row.customer_id,row.id,req.session.user.id,now(),now());
    ok(res,{seriesId,quoteNumber:number,sourceQuoteNumber:row.quote_number,draft:{...snap,seriesId,sourceQuoteId:row.id}});
  });
  app.post("/api/vehicle-quotes/:id/void", requireLogin, (req,res) => {
    const row=db.prepare("SELECT * FROM quote_versions WHERE id=?").get(req.params.id); if(!row)return fail(res,404,"Not found.","报价不存在。");
    db.prepare("UPDATE quote_versions SET status='Void',updated_at=? WHERE id=?").run(now(),req.params.id); audit(req,"void","quote_version",req.params.id,row,{status:"Void"},req.body?.reason||""); ok(res,{zh:"报价已作废。"});
  });
  app.get("/api/audit-logs", requireLogin, requireAdmin, (req,res)=>ok(res,{items:db.prepare("SELECT a.*,u.username FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 500").all()}));
}

module.exports = { installVehicleQuoteRoutes };
