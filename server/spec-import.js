const multer = require("multer");
const XLSX = require("xlsx");
const { PDFParse } = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const definitions = [
  ["brand", "品牌/厂家", "Brand / Manufacturer", ["品牌", "厂家", "制造商", "brand", "manufacturer", "maker"]],
  ["model", "型号", "Model", ["型号", "model"]],
  ["dimensions", "外形尺寸", "Overall Dimensions", ["外形尺寸", "整车尺寸", "尺寸", "overall dimension", "dimensions"]],
  ["driveType", "驱动形式", "Drive Type", ["驱动形式", "驱动", "drive type", "drivetrain"]],
  ["engine", "发动机", "Engine", ["发动机型号", "发动机", "engine"]],
  ["horsepower", "马力/功率", "Horsepower / Power", ["马力", "功率", "horsepower", "power"]],
  ["capacity", "容量/承载", "Capacity / Payload", ["罐体容量", "容量", "容积", "承载", "载重", "额定载荷", "capacity", "payload", "rated load"]],
  ["ratedTonnage", "额定吨位", "Rated Tonnage", ["额定吨位", "起重量", "吊重", "rated capacity", "lifting capacity"]],
  ["boomSections", "臂节/臂型", "Boom Sections / Type", ["臂节", "折臂", "直臂", "夹臂", "boom section", "boom type"]],
  ["boomLength", "臂长/作业高度", "Boom Length / Working Height", ["臂长", "作业高度", "工作高度", "boom length", "working height"]],
  ["tankMaterial", "罐体材质", "Tank Material", ["罐体材质", "材质", "tank material"]],
  ["wheelbase", "轴距", "Wheelbase", ["轴距", "wheelbase"]],
  ["emission", "排放标准", "Emission Standard", ["排放", "排放标准", "emission"]]
];

function clean(value) { return String(value || "").replace(/\u0000/g, " ").replace(/[ \t]+/g, " ").trim(); }
function extract(text, configured = []) {
  const lines = clean(text).split(/\r?\n/).map(clean).filter(Boolean);
  const defs = [...definitions];
  for (const field of configured) {
    if (!field?.key || defs.some(d => d[0] === field.key)) continue;
    defs.push([field.key, field.zh || field.key, field.en || field.zh || field.key, [field.zh, field.en, field.key].filter(Boolean)]);
  }
  const found = new Map();
  for (const [key, zh, en, labels] of defs) {
    for (const line of lines) {
      const label = labels.find(x => x && line.toLowerCase().includes(String(x).toLowerCase()));
      if (!label) continue;
      let value = line.replace(new RegExp(String(label).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "").replace(/^[\s:：=\-—]+/, "").trim();
      if (!value && lines.length > lines.indexOf(line) + 1) value = lines[lines.indexOf(line) + 1];
      if (value && value.length < 180) { found.set(key, { key, zh, en, value, confidence: /[:：=]/.test(line) ? 0.95 : 0.8, source: line }); break; }
    }
  }
  const joined = lines.join(" ");
  if (!found.has("driveType")) {
    const m = joined.match(/\b(4\s*[x×]\s*2|6\s*[x×]\s*4|8\s*[x×]\s*4|10\s*[x×]\s*4)\b/i);
    if (m) found.set("driveType", { key:"driveType", zh:"驱动形式", en:"Drive Type", value:m[1].replace(/x/i,"×").replace(/\s/g,""), confidence:0.9, source:m[0] });
  }
  return [...found.values()];
}

async function fileToText(file) {
  const ext = (file.originalname.split(".").pop() || "").toLowerCase();
  if (["xlsx", "xls"].includes(ext)) {
    const wb = XLSX.read(file.buffer, { type: "buffer" });
    return wb.SheetNames.map(name => `【${name}】\n${XLSX.utils.sheet_to_csv(wb.Sheets[name])}`).join("\n");
  }
  if (ext === "pdf") {
    const parser = new PDFParse({ data: file.buffer });
    try { const result = await parser.getText(); return result.text || ""; } finally { await parser.destroy(); }
  }
  return file.buffer.toString("utf8");
}

function installSpecImportRoutes(app, { requireLogin, requireAdmin, ok, fail }) {
  app.post("/api/catalog/extract-specs", requireLogin, requireAdmin, upload.single("file"), async (req, res) => {
    try {
      const text = req.file ? await fileToText(req.file) : String(req.body?.text || "");
      if (!clean(text)) return fail(res, 422, "No readable text found.", req.file?.originalname?.toLowerCase().endsWith(".pdf") ? "PDF 中没有识别到可复制文字，可能是扫描版，请先进行 OCR 后再导入。" : "没有识别到可分析的文字。");
      let configured = []; try { configured = JSON.parse(req.body?.fields || "[]"); } catch {}
      ok(res, { candidates: extract(text, configured), textPreview: clean(text).slice(0, 3000), fileName: req.file?.originalname || "粘贴文本" });
    } catch (error) { fail(res, 400, error.message, `文件解析失败：${error.message}`); }
  });
}

module.exports = { installSpecImportRoutes, extract };
