(function () {
  const keys = {
    settings: "quote_assistant_v01_settings",
    products: "quote_assistant_v01_products",
    quotes: "quote_assistant_v01_quotes"
  };
  const defaultBg = "./assets/company-background.png";
  const defaultTermFields = [
    f("付款方式", "Payment", "payment", "text", false, true, 10),
    f("交货时间", "Delivery Time", "deliveryTime", "text", false, true, 20),
    f("运输方式", "Shipping", "shipping", "text", false, true, 30),
    f("目的港", "Destination Port", "port", "text", false, true, 40),
    f("售后说明", "After-sales", "afterSales", "textarea", false, true, 50),
    f("质保说明", "Warranty", "warranty", "textarea", false, true, 60),
    f("备注", "Notes", "notes", "textarea", false, true, 70)
  ];

  const defaultTemplates = [
    {
      name: "二手工程机械",
      desc: "适用于二手设备",
      fields: [
        f("产品类型", "Product Type", "productType", "text", true, true, 10),
        f("品牌", "Brand", "brand", "text", true, true, 20),
        f("型号", "Model", "model", "text", true, true, 30),
        f("年份", "Year", "year", "text", false, true, 40),
        f("工时", "Working Hours", "hours", "text", false, true, 50),
        f("数量", "Quantity", "qty", "number", true, true, 60),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 70),
        f("货币单位", "Currency", "currency", "select", true, true, 80),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 90),
        f("备注", "Remark", "remark", "textarea", false, true, 100),
        f("产品图片", "Product Image", "productImage", "image", false, true, 110)
      ],
      termFields: defaultTermFields
    },
    {
      name: "新车报价",
      desc: "适用于新车和新设备",
      fields: [
        f("品牌", "Brand", "brand", "text", true, true, 10),
        f("型号", "Model", "model", "text", true, true, 20),
        f("参数", "Parameters", "params", "textarea", false, true, 30),
        f("配置", "Configuration", "config", "textarea", false, true, 40),
        f("质保时间", "Warranty", "warranty", "text", false, true, 50),
        f("数量", "Quantity", "qty", "number", true, true, 60),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 70),
        f("货币单位", "Currency", "currency", "select", true, true, 80),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 90),
        f("产品图片", "Product Image", "productImage", "image", false, true, 100)
      ],
      termFields: defaultTermFields
    }
  ];

  const defaultSettings = {
    companyNameEn: "Jinwanwa International Trading Co., Ltd.",
    companyNameZh: "合肥金万挖工程机械有限公司",
    contactPerson: "Ethan",
    companyPhone: "",
    companyEmail: "",
    companyAddressEn: "Hefei, China",
    companyAddressZh: "中国合肥",
    currency: "USD",
    businessLineEn: "Used construction machinery and vehicles.",
    businessLineZh: "二手工程机械及车辆供应。",
    quoteStyle: "business",
    logoDataUrl: "",
    backgroundDataUrl: "",
    categories: ["挖掘机", "装载机", "推土机", "压路机", "平地机", "自卸车", "叉车", "TLB"],
    templates: defaultTemplates
  };

  let settings = load(keys.settings, defaultSettings);
  let products = load(keys.products, []);
  let quotes = load(keys.quotes, []);
  let currentQuote = null;
  let editingProductId = "";
  let editingFieldIndex = -1;
  let editingFieldTarget = "product";
  let editingCategoryIndex = -1;

  const $ = (id) => document.getElementById(id);

  function f(zh, en, fieldKey, fieldType = "text", required = false, visible = true, sortOrder = 0) {
    return { zh, en, fieldKey, fieldType, required, visible, sortOrder };
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return structuredClone(fallback);
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : structuredClone(fallback);
      return { ...structuredClone(fallback), ...(parsed || {}) };
    } catch {
      return structuredClone(fallback);
    }
  }

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function bi(en, zh) {
    return `<span>${escapeHtml(en)}</span><small>${escapeHtml(zh)}</small>`;
  }

  function toast(text) {
    const el = $("toast");
    el.textContent = text;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function money(amount, currency) {
    return `${currency || settings.currency || "USD"} ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
  }

  function fieldKeyOf(field) {
    return field.fieldKey || field.key || normalize(field.en || field.zh || "field");
  }

  function fieldTypeOf(field) {
    return field.fieldType || field.type || "text";
  }

  function visibleOf(field) {
    return field.visible !== undefined ? field.visible : field.show !== false;
  }

  function normalizeField(field, index) {
    const en = field.en || field.englishName || field.labelEn || `Field ${index + 1}`;
    const zh = field.zh || field.chineseName || field.labelZh || en;
    return {
      zh,
      en,
      fieldKey: fieldKeyOf(field),
      fieldType: fieldTypeOf(field),
      required: !!field.required,
      visible: visibleOf(field),
      sortOrder: Number(field.sortOrder ?? (index + 1) * 10)
    };
  }

  function normalizeTemplate(tpl) {
    return {
      name: tpl.name,
      desc: tpl.desc || "",
      fields: (tpl.fields || []).map(normalizeField).sort((a, b) => a.sortOrder - b.sortOrder),
      termFields: (tpl.termFields || defaultTermFields).map(normalizeField).sort((a, b) => a.sortOrder - b.sortOrder)
    };
  }

  function normalizeTemplates() {
    settings.templates = (settings.templates || defaultTemplates).map(normalizeTemplate);
  }

  function normalizeCategories() {
    const source = Array.isArray(settings.categories) && settings.categories.length
      ? settings.categories
      : defaultSettings.categories;
    settings.categories = source
      .map((item) => typeof item === "string" ? item : item?.name)
      .map((name) => String(name || "").trim())
      .filter(Boolean);
    if (!settings.categories.length) {
      settings.categories = structuredClone(defaultSettings.categories);
    }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function normalizeImage(file, w = 1200, h = 800) {
    const data = await fileToDataUrl(file);
    const img = new Image();
    img.src = data;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    const sourceRatio = img.width / img.height;
    const targetRatio = w / h;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (sourceRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.88);
  }

  function switchView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    if (name === "history") renderHistory();
    if (name === "products") renderProducts();
    if (name === "settings") renderSettings();
    if (name === "quote") renderQuoteEditor();
  }

  function renderSettings() {
    normalizeTemplates();
    normalizeCategories();
    document.querySelectorAll("[data-setting]").forEach((input) => {
      input.value = settings[input.dataset.setting] || "";
    });
    renderCategoryList();
    renderTemplateSelect();
    fillTemplateForm(settings.templates[0]?.name);
    $("logo-preview").src = settings.logoDataUrl || "";
    $("logo-preview").hidden = !settings.logoDataUrl;
    $("background-preview").src = settings.backgroundDataUrl || defaultBg;
  }

  function renderTemplateSelect(selected) {
    $("template-select").innerHTML = settings.templates.map((t) => `<option ${t.name === selected ? "selected" : ""}>${escapeHtml(t.name)}</option>`).join("");
  }

  function fillTemplateForm(name) {
    normalizeTemplates();
    const tpl = settings.templates.find((t) => t.name === (name || $("template-select").value)) || settings.templates[0];
    if (!tpl) return;
    $("template-name-input").value = tpl.name;
    $("template-desc-input").value = tpl.desc || "";
    renderTemplateSelect(tpl.name);
    renderFieldList(tpl);
    renderTermFieldList(tpl);
  }

  function currentTemplate() {
    normalizeTemplates();
    return settings.templates.find((t) => t.name === ($("template-select").value || $("template-name-input").value)) || settings.templates[0];
  }

  function renderCategoryList() {
    normalizeCategories();
    $("category-list").innerHTML = settings.categories.map((name, index) => `
      <tr draggable="true" data-category-index="${index}">
        <td>
          <span class="drag-handle">☰</span>
          ${(index + 1) * 10}
        </td>
        <td>${escapeHtml(name)}</td>
        <td class="field-actions">
          <button type="button" data-category-action="edit">编辑</button>
          <button type="button" data-category-action="delete">删除</button>
          <button type="button" data-category-action="up">上移</button>
          <button type="button" data-category-action="down">下移</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="3" class="empty">暂无分类，请点击“新增分类”。</td></tr>`;
  }

  function openCategoryModal(index = -1) {
    normalizeCategories();
    editingCategoryIndex = index;
    $("category-modal-title").textContent = index >= 0 ? "编辑分类" : "新增分类";
    $("category-name-input").value = index >= 0 ? settings.categories[index] || "" : "";
    $("category-modal").hidden = false;
    $("category-name-input").focus();
  }

  function closeCategoryModal() {
    $("category-modal").hidden = true;
  }

  function saveCategoryFromModal() {
    normalizeCategories();
    const name = $("category-name-input").value.trim();
    if (!name) return toast("请填写产品分类名称。");
    const exists = settings.categories.some((item, index) => item === name && index !== editingCategoryIndex);
    if (exists) return toast("分类名称已存在。");
    if (editingCategoryIndex >= 0) settings.categories[editingCategoryIndex] = name;
    else settings.categories.push(name);
    save(keys.settings, settings);
    renderCategoryList();
    renderAllSelectors();
    closeCategoryModal();
    toast("分类已保存。");
  }

  function moveCategory(index, delta) {
    normalizeCategories();
    const target = index + delta;
    if (target < 0 || target >= settings.categories.length) return;
    const [name] = settings.categories.splice(index, 1);
    settings.categories.splice(target, 0, name);
    save(keys.settings, settings);
    renderCategoryList();
    renderAllSelectors();
  }

  function deleteCategory(index) {
    normalizeCategories();
    const name = settings.categories[index];
    if (!name) return;
    if (settings.categories.length <= 1) return toast("至少保留一个产品分类。");
    if (!confirm(`确定删除分类“${name}”吗？`)) return;
    settings.categories.splice(index, 1);
    save(keys.settings, settings);
    renderCategoryList();
    renderAllSelectors();
    toast("分类已删除。");
  }

  function handleCategoryListClick(event) {
    const row = event.target.closest("tr[data-category-index]");
    if (!row) return;
    const index = Number(row.dataset.categoryIndex);
    const action = event.target.dataset.categoryAction;
    if (action === "edit") openCategoryModal(index);
    if (action === "delete") deleteCategory(index);
    if (action === "up") moveCategory(index, -1);
    if (action === "down") moveCategory(index, 1);
  }

  function handleCategoryDragStart(event) {
    const row = event.target.closest("tr[data-category-index]");
    if (!row) return;
    event.dataTransfer.setData("text/plain", row.dataset.categoryIndex);
  }

  function handleCategoryDrop(event) {
    const row = event.target.closest("tr[data-category-index]");
    if (!row) return;
    event.preventDefault();
    normalizeCategories();
    const from = Number(event.dataTransfer.getData("text/plain"));
    const to = Number(row.dataset.categoryIndex);
    if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;
    const [name] = settings.categories.splice(from, 1);
    settings.categories.splice(to, 0, name);
    save(keys.settings, settings);
    renderCategoryList();
    renderAllSelectors();
  }

  function renderFieldRows(fields, target) {
    return fields.map((field, index) => `
      <tr draggable="true" data-field-index="${index}">
        <td>
          <span class="drag-handle">☰</span>
          ${field.sortOrder}
        </td>
        <td>${escapeHtml(field.zh)}</td>
        <td>${escapeHtml(field.en)}</td>
        <td><code>${escapeHtml(field.fieldKey)}</code></td>
        <td>${escapeHtml(field.fieldType)}</td>
        <td><input class="field-required-toggle" type="checkbox" ${field.required ? "checked" : ""} /></td>
        <td><input class="field-visible-toggle" type="checkbox" ${field.visible ? "checked" : ""} /></td>
        <td class="field-actions">
          <button type="button" data-field-action="edit" data-field-target="${target}">编辑</button>
          <button type="button" data-field-action="delete">删除</button>
          <button type="button" data-field-action="up">上移</button>
          <button type="button" data-field-action="down">下移</button>
        </td>
      </tr>
    `).join("");
  }

  function renderFieldList(tpl = currentTemplate()) {
    const fields = (tpl?.fields || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    $("template-field-list").innerHTML = renderFieldRows(fields, "product") || `<tr><td colspan="8" class="empty">暂无字段，请点击“新增字段”。</td></tr>`;
  }

  function renderTermFieldList(tpl = currentTemplate()) {
    const fields = (tpl?.termFields || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    $("template-term-field-list").innerHTML = renderFieldRows(fields, "terms") || `<tr><td colspan="8" class="empty">暂无条款字段，请点击“新增条款字段”。</td></tr>`;
  }

  function activeFields(tpl = currentTemplate()) {
    return editingFieldTarget === "terms" ? tpl.termFields : tpl.fields;
  }

  function resequenceFields(fields) {
    fields.forEach((field, index) => {
      field.sortOrder = (index + 1) * 10;
    });
  }

  function openFieldModal(index = -1, target = "product") {
    const tpl = currentTemplate();
    editingFieldTarget = target;
    const fields = activeFields(tpl);
    editingFieldIndex = index;
    const field = index >= 0 ? fields[index] : f("", "", "", "text", false, true, (fields.length + 1) * 10);
    $("field-modal-title").textContent = `${index >= 0 ? "编辑" : "新增"}${target === "terms" ? "条款字段" : "字段"}`;
    $("field-zh-input").value = field.zh || "";
    $("field-en-input").value = field.en || "";
    $("field-key-input").value = field.fieldKey || "";
    $("field-type-input").value = field.fieldType || "text";
    $("field-required-input").value = field.required ? "true" : "false";
    $("field-visible-input").value = field.visible ? "true" : "false";
    $("field-sort-input").value = field.sortOrder || (fields.length + 1) * 10;
    $("field-modal").hidden = false;
  }

  function closeFieldModal() {
    $("field-modal").hidden = true;
  }

  function saveFieldFromModal() {
    const tpl = currentTemplate();
    const fields = activeFields(tpl);
    const zh = $("field-zh-input").value.trim();
    const en = $("field-en-input").value.trim();
    if (!zh || !en) return toast("请填写中文字段名和英文字段名。");
    const field = {
      zh,
      en,
      fieldKey: $("field-key-input").value.trim() || normalize(en),
      fieldType: $("field-type-input").value,
      required: $("field-required-input").value === "true",
      visible: $("field-visible-input").value === "true",
      sortOrder: Number($("field-sort-input").value || 0)
    };
    if (editingFieldIndex >= 0) fields[editingFieldIndex] = field;
    else fields.push(field);
    fields.sort((a, b) => a.sortOrder - b.sortOrder);
    resequenceFields(fields);
    renderFieldList(tpl);
    renderTermFieldList(tpl);
    closeFieldModal();
  }

  function moveField(index, delta, target = "product") {
    const tpl = currentTemplate();
    editingFieldTarget = target;
    const fields = activeFields(tpl);
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const [field] = fields.splice(index, 1);
    fields.splice(targetIndex, 0, field);
    resequenceFields(fields);
    renderFieldList(tpl);
    renderTermFieldList(tpl);
  }

  function deleteField(index, target = "product") {
    const tpl = currentTemplate();
    editingFieldTarget = target;
    const fields = activeFields(tpl);
    const field = fields[index];
    if (!field) return;
    if (!confirm(`确定删除字段“${field.zh} / ${field.en}”吗？`)) return;
    fields.splice(index, 1);
    resequenceFields(fields);
    renderFieldList(tpl);
    renderTermFieldList(tpl);
  }

  function handleFieldListClick(event) {
    const row = event.target.closest("tr[data-field-index]");
    if (!row) return;
    const index = Number(row.dataset.fieldIndex);
    const tpl = currentTemplate();
    editingFieldTarget = event.currentTarget.id === "template-term-field-list" ? "terms" : "product";
    const fields = activeFields(tpl);
    if (event.target.matches(".field-required-toggle")) {
      fields[index].required = event.target.checked;
      return;
    }
    if (event.target.matches(".field-visible-toggle")) {
      fields[index].visible = event.target.checked;
      return;
    }
    const action = event.target.dataset.fieldAction;
    if (action === "edit") openFieldModal(index, editingFieldTarget);
    if (action === "delete") deleteField(index, editingFieldTarget);
    if (action === "up") moveField(index, -1, editingFieldTarget);
    if (action === "down") moveField(index, 1, editingFieldTarget);
  }

  function handleFieldDragStart(event) {
    const row = event.target.closest("tr[data-field-index]");
    if (!row) return;
    event.dataTransfer.setData("text/plain", row.dataset.fieldIndex);
  }

  function handleFieldDrop(event) {
    const row = event.target.closest("tr[data-field-index]");
    if (!row) return;
    event.preventDefault();
    editingFieldTarget = event.currentTarget.id === "template-term-field-list" ? "terms" : "product";
    const from = Number(event.dataTransfer.getData("text/plain"));
    const to = Number(row.dataset.fieldIndex);
    if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;
    const tpl = currentTemplate();
    const fields = activeFields(tpl);
    const [field] = fields.splice(from, 1);
    fields.splice(to, 0, field);
    resequenceFields(fields);
    renderFieldList(tpl);
    renderTermFieldList(tpl);
  }

  function saveSettings() {
    normalizeTemplates();
    normalizeCategories();
    document.querySelectorAll("[data-setting]").forEach((input) => {
      settings[input.dataset.setting] = input.value.trim();
    });
    save(keys.settings, settings);
    renderAllSelectors();
    renderCategoryList();
    toast("设置已保存。");
  }

  function saveTemplate() {
    const name = $("template-name-input").value.trim();
    if (!name) return toast("请输入模板名称。");
    const old = currentTemplate();
    const tpl = {
      name,
      desc: $("template-desc-input").value.trim(),
      fields: (old?.fields || []).map(normalizeField).sort((a, b) => a.sortOrder - b.sortOrder),
      termFields: (old?.termFields || defaultTermFields).map(normalizeField).sort((a, b) => a.sortOrder - b.sortOrder)
    };
    const idx = settings.templates.findIndex((t) => t.name === name);
    if (idx >= 0) settings.templates[idx] = tpl;
    else settings.templates.push(tpl);
    save(keys.settings, settings);
    renderAllSelectors();
    fillTemplateForm(name);
    toast("模板已保存。");
  }

  function deleteTemplate() {
    const name = $("template-select").value;
    if (settings.templates.length <= 1) return toast("至少保留一个模板。");
    settings.templates = settings.templates.filter((t) => t.name !== name);
    save(keys.settings, settings);
    renderAllSelectors();
    fillTemplateForm(settings.templates[0]?.name);
    toast("模板已删除。");
  }

  function renderAllSelectors() {
    normalizeTemplates();
    normalizeCategories();
    const catOptions = settings.categories.map((c) => `<option>${escapeHtml(c)}</option>`).join("");
    $("product-category").innerHTML = catOptions;
    $("quote-template").innerHTML = settings.templates.map((t) => `<option>${escapeHtml(t.name)}</option>`).join("");
    $("library-product-select").innerHTML = `<option value="">选择产品库产品</option>` + products.map((p) => `<option value="${p.id}">${escapeHtml(p.brand)} ${escapeHtml(p.model)}</option>`).join("");
  }

  function clearProductForm() {
    editingProductId = "";
    ["product-brand", "product-model", "product-tonnage", "product-year", "product-hours", "product-price", "product-params", "product-remark"].forEach((id) => $(id).value = "");
    $("product-image-preview").src = "";
    $("product-image-preview").dataset.image = "";
  }

  function collectProductForm() {
    return {
      id: editingProductId || uid("product"),
      category: $("product-category").value,
      brand: $("product-brand").value.trim(),
      model: $("product-model").value.trim(),
      tonnage: $("product-tonnage").value.trim(),
      year: $("product-year").value.trim(),
      hours: $("product-hours").value.trim(),
      referencePrice: $("product-price").value,
      params: $("product-params").value.trim(),
      remark: $("product-remark").value.trim(),
      imageDataUrl: $("product-image-preview").dataset.image || ""
    };
  }

  function saveProduct() {
    const product = collectProductForm();
    if (!product.brand && !product.model) return toast("请至少填写品牌或型号。");
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) products[idx] = product;
    else products.unshift(product);
    save(keys.products, products);
    renderProducts();
    renderAllSelectors();
    clearProductForm();
    toast("产品已保存。");
  }

  function editProduct(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    normalizeCategories();
    editingProductId = p.id;
    $("product-category").value = p.category || settings.categories[0];
    $("product-brand").value = p.brand || "";
    $("product-model").value = p.model || "";
    $("product-tonnage").value = p.tonnage || "";
    $("product-year").value = p.year || "";
    $("product-hours").value = p.hours || "";
    $("product-price").value = p.referencePrice || "";
    $("product-params").value = p.params || "";
    $("product-remark").value = p.remark || "";
    $("product-image-preview").src = p.imageDataUrl || "";
    $("product-image-preview").dataset.image = p.imageDataUrl || "";
  }

  function deleteProduct(id) {
    products = products.filter((p) => p.id !== id);
    save(keys.products, products);
    renderProducts();
    renderAllSelectors();
  }

  function renderProducts() {
    const kw = normalize($("product-search").value);
    const list = products.filter((p) => !kw || normalize(`${p.category}${p.brand}${p.model}`).includes(kw));
    $("product-list").innerHTML = list.map((p) => `
      <article class="list-item">
        ${p.imageDataUrl ? `<img src="${p.imageDataUrl}" alt="">` : `<div class="thumb-empty">No Image</div>`}
        <div><b>${escapeHtml(p.brand)} ${escapeHtml(p.model)}</b><p>${escapeHtml(p.category)} | ${escapeHtml(p.tonnage)} | ${escapeHtml(p.year)} | ${escapeHtml(p.hours)}</p><p>${escapeHtml(p.remark)}</p></div>
        <div class="actions"><button onclick="window.quoteApp.editProduct('${p.id}')">编辑</button><button onclick="window.quoteApp.deleteProduct('${p.id}')">删除</button></div>
      </article>
    `).join("") || `<p class="empty">暂无产品。</p>`;
  }

  function renderQuoteEditor() {
    if (!currentQuote) {
      newQuote();
      return;
    }
    bindQuoteToForm();
    renderQuoteItems();
    renderPreview();
  }

  function newQuote() {
    const d = today();
    currentQuote = {
      id: uid("quote"),
      status: "草稿",
      quoteNumber: `QA-${d.replaceAll("-", "")}-${String(quotes.length + 1).padStart(3, "0")}`,
      quoteDate: d,
      validUntil: addDays(7),
      buyer: {},
      templateName: settings.templates[0]?.name || "",
      items: [],
      terms: {
        payment: "30% deposit, 70% balance before shipment",
        deliveryTime: "",
        shipping: "",
        port: "",
        afterSales: "",
        warranty: "",
        notes: ""
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    bindQuoteToForm();
    renderQuoteItems();
    renderPreview();
  }

  function template() {
    normalizeTemplates();
    return settings.templates.find((t) => t.name === $("quote-template").value) || settings.templates[0];
  }

  function bindQuoteToForm() {
    $("quote-template").value = currentQuote.templateName || settings.templates[0]?.name || "";
    $("quote-status").value = currentQuote.status || "草稿";
    $("quote-number").value = currentQuote.quoteNumber || "";
    $("quote-date").value = currentQuote.quoteDate || today();
    $("valid-until").value = currentQuote.validUntil || addDays(7);
    $("buyer-country").value = currentQuote.buyer.country || "";
    $("buyer-company").value = currentQuote.buyer.company || "";
    $("buyer-contact").value = currentQuote.buyer.contact || "";
    $("buyer-phone").value = currentQuote.buyer.phone || "";
    $("buyer-email").value = currentQuote.buyer.email || "";
    $("buyer-address").value = currentQuote.buyer.address || "";
    renderQuoteTerms();
  }

  function renderQuoteTerms() {
    const tpl = template();
    const values = currentQuote.terms || {};
    const fields = (tpl.termFields || defaultTermFields)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((field) => field.visible && field.fieldType !== "calculated" && field.fieldType !== "image");
    $("quote-terms").innerHTML = fields.map((field) => `
      <label class="${field.fieldType === "textarea" ? "wide" : ""}">
        <span>${escapeHtml(field.en)} / ${escapeHtml(field.zh)}${field.required ? " *" : ""}</span>
        ${renderTermInput(field, values[field.fieldKey] || "")}
      </label>
    `).join("") || `<p class="empty wide">当前报价类型没有需要填写的条款字段。</p>`;
  }

  function collectQuoteFromForm() {
    currentQuote.templateName = $("quote-template").value;
    currentQuote.status = $("quote-status").value;
    currentQuote.quoteNumber = $("quote-number").value;
    currentQuote.quoteDate = $("quote-date").value;
    currentQuote.validUntil = $("valid-until").value;
    currentQuote.buyer = {
      country: $("buyer-country").value,
      company: $("buyer-company").value,
      contact: $("buyer-contact").value,
      phone: $("buyer-phone").value,
      email: $("buyer-email").value,
      address: $("buyer-address").value
    };
    currentQuote.terms = {};
    document.querySelectorAll("[data-termfield]").forEach((input) => currentQuote.terms[input.dataset.termfield] = input.value);
    currentQuote.items = Array.from(document.querySelectorAll(".quote-item")).map((card) => {
      const values = {};
      card.querySelectorAll("[data-qfield]").forEach((input) => values[input.dataset.qfield] = input.value);
      return { id: card.dataset.id, values, imageDataUrl: card.querySelector("[data-image]")?.dataset.image || "" };
    });
    currentQuote.updatedAt = new Date().toISOString();
  }

  function itemCard(item = {}) {
    const tpl = template();
    const id = item.id || uid("item");
    const vals = item.values || {};
    const fields = tpl.fields.slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible && field.fieldType !== "calculated" && field.fieldType !== "image");
    const showImage = tpl.fields.some((field) => field.visible && field.fieldType === "image");
    return `
      <article class="quote-item panel" data-id="${id}">
        <div class="quote-item-grid">
          ${fields.map((field) => `
            <label class="${field.fieldType === "textarea" ? "wide" : ""}">
              <span>${escapeHtml(field.en)} / ${escapeHtml(field.zh)}${field.required ? " *" : ""}</span>
              ${renderFieldInput(field, vals[field.fieldKey] || "")}
            </label>
          `).join("")}
          ${showImage ? `
          <div>
            <span class="field-title">产品图片</span>
            <label class="file-btn">上传图片<input class="quote-image-input" type="file" accept="image/*" /></label>
            <img class="product-preview" data-image src="${item.imageDataUrl || ""}" alt="" />
          </div>
          ` : ""}
        </div>
        <div class="actions"><button class="remove-quote-item" type="button">删除本产品</button></div>
      </article>
    `;
  }

  function renderQuoteItems() {
    $("quote-items").innerHTML = (currentQuote.items || []).map(itemCard).join("");
  }

  function renderFieldInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (field.fieldType === "textarea") return `<textarea data-qfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-qfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-qfield="${key}" type="number" value="${val}" />`;
    if (field.fieldType === "select") {
      const options = field.fieldKey === "currency"
        ? ["USD", "CNY", "EUR", "AED"]
        : ["Option 1", "Option 2"];
      return `<select data-qfield="${key}">${options.map((option) => `<option value="${option}"${option === value ? " selected" : ""}>${option}</option>`).join("")}</select>`;
    }
    return `<input data-qfield="${key}" type="text" value="${val}" />`;
  }

  function renderTermInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (field.fieldType === "textarea") return `<textarea data-termfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-termfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-termfield="${key}" type="number" value="${val}" />`;
    if (field.fieldType === "select") return `<select data-termfield="${key}"><option value="${val}" selected>${val || "请选择"}</option></select>`;
    return `<input data-termfield="${key}" type="text" value="${val}" />`;
  }

  function addManualProduct() {
    collectQuoteFromForm();
    currentQuote.items.push({ id: uid("item"), values: { currency: settings.currency, qty: "1" }, imageDataUrl: "" });
    renderQuoteItems();
  }

  function addProductFromLibrary() {
    const p = products.find((x) => x.id === $("library-product-select").value);
    if (!p) return toast("请选择产品库产品。");
    collectQuoteFromForm();
    currentQuote.items.push({
      id: uid("item"),
      imageDataUrl: p.imageDataUrl || "",
      values: {
        brand: p.brand,
        model: p.model,
        year: p.year,
        hours: p.hours,
        unitPrice: p.referencePrice,
        currency: settings.currency,
        qty: "1",
        params: p.params,
        remark: p.remark
      }
    });
    renderQuoteItems();
  }

  function total() {
    return (currentQuote.items || []).reduce((sum, item) => sum + Number(item.values.qty || 0) * Number(item.values.unitPrice || 0), 0);
  }

  function itemSubtotal(item) {
    return Number(item.values.qty || 0) * Number(item.values.unitPrice || 0);
  }

  function displayFieldValue(item, field) {
    if (field.fieldType === "calculated") return money(itemSubtotal(item), item.values.currency || settings.currency);
    if (field.fieldType === "image") return item.imageDataUrl ? "Image attached / 已上传图片" : "";
    return item.values[field.fieldKey] || "";
  }

  function renderPreview() {
    collectQuoteFromForm();
    const tpl = template();
    const visibleFields = tpl.fields.slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible);
    const visibleTermFields = (tpl.termFields || defaultTermFields).slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible);
    const showProductPhotos = visibleFields.some((field) => field.fieldType === "image");
    const bg = settings.backgroundDataUrl || defaultBg;
    $("quote-preview").innerHTML = `
      <section class="preview-banner" style="background-image:linear-gradient(90deg,rgba(8,25,48,.78),rgba(8,25,48,.42)),url('${bg}')">
        <div class="preview-company">${settings.logoDataUrl ? `<img src="${settings.logoDataUrl}">` : ""}<div><h2>${escapeHtml(settings.companyNameEn)}</h2><p>${escapeHtml(settings.companyNameZh)}</p></div></div>
        <p>${escapeHtml(settings.companyAddressEn)} | ${escapeHtml(settings.companyAddressZh)} | Contact: ${escapeHtml(settings.contactPerson)} | ${escapeHtml(settings.companyPhone)} | ${escapeHtml(settings.companyEmail)}</p>
      </section>
      <section class="preview-top">
        <div><h2>Quotation<br><small>报价单</small></h2><p>${escapeHtml(settings.businessLineEn)}<br>${escapeHtml(settings.businessLineZh)}</p></div>
        <div class="preview-meta"><p>Quotation No. / 报价编号：${escapeHtml(currentQuote.quoteNumber)}</p><p>Date / 日期：${escapeHtml(currentQuote.quoteDate)}</p><p>Valid Until / 有效期：${escapeHtml(currentQuote.validUntil)}</p></div>
      </section>
      <section class="preview-panel"><h3>Customer Information / 客户信息</h3><div class="preview-fields"><p>Company / 公司：${escapeHtml(currentQuote.buyer.company)}</p><p>Country / 国家：${escapeHtml(currentQuote.buyer.country)}</p><p>Contact / 负责人：${escapeHtml(currentQuote.buyer.contact)}</p><p>Phone / 电话：${escapeHtml(currentQuote.buyer.phone)}</p><p>Email / 邮箱：${escapeHtml(currentQuote.buyer.email)}</p><p>Address / 地址：${escapeHtml(currentQuote.buyer.address)}</p></div></section>
      <section class="preview-panel"><h3>Quotation Items / 报价明细</h3><table><thead><tr>${visibleFields.map(x => `<th>${escapeHtml(x.en)}<small>${escapeHtml(x.zh)}</small></th>`).join("")}</tr></thead><tbody>${currentQuote.items.map(item => `<tr>${visibleFields.map(x => `<td>${escapeHtml(displayFieldValue(item, x))}</td>`).join("")}</tr>`).join("")}</tbody></table><div class="preview-total">Total / 总金额：${money(total(), settings.currency)}</div></section>
      ${showProductPhotos && currentQuote.items.some(i => i.imageDataUrl) ? `<section class="preview-panel"><h3>Product Photos / 产品图片</h3><div class="photo-grid">${currentQuote.items.filter(i => i.imageDataUrl).map(i => `<article class="photo-card"><img src="${i.imageDataUrl}"><div>${escapeHtml(i.values.brand || "")} ${escapeHtml(i.values.model || "")}</div></article>`).join("")}</div></section>` : ""}
      ${visibleTermFields.length ? `<section class="preview-panel"><h3>Terms / 条款</h3>${visibleTermFields.map((field) => `<p>${escapeHtml(field.en)} / ${escapeHtml(field.zh)}：${escapeHtml(currentQuote.terms[field.fieldKey] || "")}</p>`).join("")}</section>` : ""}
    `;
  }

  function saveQuote() {
    renderPreview();
    const idx = quotes.findIndex((q) => q.id === currentQuote.id);
    if (idx >= 0) quotes[idx] = structuredClone(currentQuote);
    else quotes.unshift(structuredClone(currentQuote));
    save(keys.quotes, quotes);
    toast("报价已保存到历史报价。");
    renderHistory();
  }

  function editQuote(id) {
    currentQuote = structuredClone(quotes.find((q) => q.id === id));
    switchView("quote");
    bindQuoteToForm();
    renderQuoteItems();
    renderPreview();
  }

  function copyQuote(id) {
    const q = structuredClone(quotes.find((x) => x.id === id));
    q.id = uid("quote");
    q.quoteNumber = `${q.quoteNumber}-COPY`;
    q.status = "草稿";
    currentQuote = q;
    switchView("quote");
    bindQuoteToForm();
    renderQuoteItems();
    renderPreview();
  }

  function deleteQuote(id) {
    quotes = quotes.filter((q) => q.id !== id);
    save(keys.quotes, quotes);
    renderHistory();
  }

  function renderHistory() {
    const kw = normalize($("history-keyword").value);
    const date = $("history-date").value;
    const status = $("history-status").value;
    const list = quotes.filter((q) => {
      const productsText = q.items.map(i => Object.values(i.values || {}).join(" ")).join(" ");
      const hay = normalize(`${q.buyer.company} ${q.buyer.country} ${productsText}`);
      return (!kw || hay.includes(kw)) && (!date || q.quoteDate === date) && (!status || q.status === status);
    });
    $("history-list").innerHTML = list.map((q) => `<article class="list-item"><div><b>${escapeHtml(q.quoteNumber)}</b><p>${escapeHtml(q.buyer.company)} | ${escapeHtml(q.buyer.country)} | ${escapeHtml(q.quoteDate)} | ${escapeHtml(q.status)}</p><p>${q.items.length} products | ${money(q.items.reduce((s,i)=>s+Number(i.values.qty||0)*Number(i.values.unitPrice||0),0), settings.currency)}</p></div><div class="actions"><button onclick="window.quoteApp.editQuote('${q.id}')">查看/编辑</button><button onclick="window.quoteApp.copyQuote('${q.id}')">复制为新报价</button><button onclick="window.quoteApp.deleteQuote('${q.id}')">删除</button><button onclick="window.quoteApp.editQuote('${q.id}'); setTimeout(()=>window.print(),200)">重新导出PDF</button></div></article>`).join("") || `<p class="empty">暂无历史报价。</p>`;
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));
    document.querySelectorAll("[data-view-target]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.viewTarget)));
    $("template-select").addEventListener("change", () => fillTemplateForm());
    $("save-template-btn").addEventListener("click", saveTemplate);
    $("delete-template-btn").addEventListener("click", deleteTemplate);
    $("add-category-btn").addEventListener("click", () => openCategoryModal(-1));
    $("close-category-modal-btn").addEventListener("click", closeCategoryModal);
    $("save-category-btn").addEventListener("click", saveCategoryFromModal);
    $("category-list").addEventListener("click", handleCategoryListClick);
    $("category-list").addEventListener("dragstart", handleCategoryDragStart);
    $("category-list").addEventListener("dragover", (e) => e.preventDefault());
    $("category-list").addEventListener("drop", handleCategoryDrop);
    $("add-field-btn").addEventListener("click", () => openFieldModal(-1));
    $("add-term-field-btn").addEventListener("click", () => openFieldModal(-1, "terms"));
    $("close-field-modal-btn").addEventListener("click", closeFieldModal);
    $("save-field-btn").addEventListener("click", saveFieldFromModal);
    $("template-field-list").addEventListener("click", handleFieldListClick);
    $("template-field-list").addEventListener("dragstart", handleFieldDragStart);
    $("template-field-list").addEventListener("dragover", (e) => e.preventDefault());
    $("template-field-list").addEventListener("drop", handleFieldDrop);
    $("template-term-field-list").addEventListener("click", handleFieldListClick);
    $("template-term-field-list").addEventListener("dragstart", handleFieldDragStart);
    $("template-term-field-list").addEventListener("dragover", (e) => e.preventDefault());
    $("template-term-field-list").addEventListener("drop", handleFieldDrop);
    $("save-settings-btn").addEventListener("click", saveSettings);
    $("logo-input").addEventListener("change", async e => { settings.logoDataUrl = await fileToDataUrl(e.target.files[0]); renderSettings(); });
    $("background-input").addEventListener("change", async e => { settings.backgroundDataUrl = await fileToDataUrl(e.target.files[0]); renderSettings(); });
    $("remove-logo-btn").addEventListener("click", () => { settings.logoDataUrl = ""; renderSettings(); });
    $("reset-background-btn").addEventListener("click", () => { settings.backgroundDataUrl = ""; renderSettings(); });
    $("product-image").addEventListener("change", async e => { const data = await normalizeImage(e.target.files[0]); $("product-image-preview").src = data; $("product-image-preview").dataset.image = data; });
    $("save-product-btn").addEventListener("click", saveProduct);
    $("clear-product-btn").addEventListener("click", clearProductForm);
    $("product-search").addEventListener("input", renderProducts);
    $("add-manual-product-btn").addEventListener("click", addManualProduct);
    $("add-library-product-btn").addEventListener("click", addProductFromLibrary);
    $("quote-template").addEventListener("change", () => { collectQuoteFromForm(); currentQuote.items = []; renderQuoteTerms(); renderQuoteItems(); renderPreview(); });
    $("quote-items").addEventListener("input", renderPreview);
    $("quote-items").addEventListener("change", async e => { if (e.target.matches(".quote-image-input")) { const img = await normalizeImage(e.target.files[0]); const prev = e.target.closest(".quote-item").querySelector("[data-image]"); if (prev) { prev.src = img; prev.dataset.image = img; } renderPreview(); } });
    $("quote-items").addEventListener("click", e => { if (e.target.matches(".remove-quote-item")) { e.target.closest(".quote-item").remove(); renderPreview(); } });
    $("preview-quote-btn").addEventListener("click", renderPreview);
    $("save-quote-btn").addEventListener("click", saveQuote);
    $("export-pdf-btn").addEventListener("click", () => { renderPreview(); window.print(); });
    $("new-quote-btn").addEventListener("click", newQuote);
    $("history-search-btn").addEventListener("click", renderHistory);
  }

  function init() {
    bindEvents();
    renderAllSelectors();
    renderSettings();
    renderProducts();
    newQuote();
  }

  window.quoteApp = { editProduct, deleteProduct, editQuote, copyQuote, deleteQuote };
  init();
})();
