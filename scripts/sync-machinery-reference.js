const fs = require("fs");
const path = require("path");
const vm = require("vm");

async function main() {
  const root = path.resolve(__dirname, "..");
  const source = fs.readFileSync(path.join(root, "assets", "price-lists", "machinery-price-products.js"), "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  const rows = sandbox.window.machineryPriceReferenceProducts || [];
  const products = rows.map((row) => ({
    category: row.categoryBilingual || row.category || "机械设备",
    brand: row.brand || "",
    model: row.model || "",
    aliases: [row.category, row.categoryBilingual, row.brand, row.model].filter(Boolean).join(" "),
    condition: "Used",
    params: [row.spec1, row.spec2, row.spec3, row.spec4, row.usageRange].filter(Boolean).join(" | "),
    remark: [
      row.remarks,
      row.originalUsedYearRange ? `原版二手机：${row.originalUsedYearRange} / ${row.originalPriceRange || "待填写"}` : "",
      row.refurbishedYearRange ? `翻新机：${row.refurbishedYearRange} / ${row.refurbishedPriceRange || "待填写"}` : "",
      row.newMachineAvailability ? `全新机：${row.newMachineAvailability} / ${row.newPriceRange || "待填写"}` : ""
    ].filter(Boolean).join("；"),
    transportMethod: "Bulk Cargo",
    status: "Active"
  })).filter((p) => p.brand || p.model);

  const base = process.env.FTA_URL || "http://localhost:8765";
  const login = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: process.env.FTA_USER || "admin", password: process.env.FTA_PASSWORD || "Aa1234//" }) });
  if (!login.ok) throw new Error(`Login failed: ${login.status}`);
  const cookie = login.headers.get("set-cookie")?.split(";")[0] || "";
  const response = await fetch(`${base}/api/products/bulk-upsert`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ products }) });
  const result = await response.json();
  if (!response.ok || result.ok === false) throw new Error(result.zh || result.message || `HTTP ${response.status}`);
  console.log(JSON.stringify({ sourceRows: rows.length, submitted: products.length, added: result.added, updated: result.updated, skipped: result.skipped }, null, 2));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
