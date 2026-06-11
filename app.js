(function () {
  const keys = {
    settings: "quote_assistant_v01_settings",
    products: "quote_assistant_v01_products",
    quotes: "quote_assistant_v01_quotes",
    sidebarCollapsed: "quote_assistant_sidebar_collapsed",
    settingsSection: "quote_assistant_settings_section"
  };
  const defaultBg = "./assets/company-background.png";
  const defaultTermFields = [
    f("付款方式", "Payment Ratio", "payment", "select", false, true, 10),
    f("交货时间", "Delivery Time", "deliveryTime", "text", false, true, 20),
    f("贸易方式", "Trade Term", "shipping", "select", false, true, 30),
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
        f("运费", "Freight", "freight", "money", false, true, 80),
        f("拖车到港费", "Trucking to Port", "truckingToPort", "money", false, true, 90),
        f("货币单位", "Currency", "currency", "select", true, true, 100),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 110),
        f("备注", "Remark", "remark", "textarea", false, true, 120),
        f("产品图片", "Product Image", "productImage", "image", false, true, 130)
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
        f("运费", "Freight", "freight", "money", false, true, 80),
        f("拖车到港费", "Trucking to Port", "truckingToPort", "money", false, true, 90),
        f("货币单位", "Currency", "currency", "select", true, true, 100),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 110),
        f("产品图片", "Product Image", "productImage", "image", false, true, 120)
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
    contactFields: [
      { id: "contact-phone", labelEn: "Phone", labelZh: "电话", type: "text", value: "", visible: true, sortOrder: 10 },
      { id: "contact-whatsapp", labelEn: "WhatsApp", labelZh: "WhatsApp", type: "text", value: "", visible: true, sortOrder: 20 },
      { id: "contact-email", labelEn: "Email", labelZh: "邮箱", type: "text", value: "", visible: true, sortOrder: 30 },
      { id: "contact-wechat", labelEn: "WeChat", labelZh: "微信", type: "text", value: "", visible: true, sortOrder: 40 }
    ],
    quoteStyle: "business",
    logoDataUrl: "",
    backgroundDataUrl: "",
    stampDataUrl: "",
    costFieldsMigratedV1: false,
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
  let currentUser = null;
  let users = [];
  let serverProducts = [];
  let ports = [];
  let freightRates = [];
  let editingPortId = "";
  let editingFreightId = "";
  let lastFreightCalculation = null;
  let activeSettingsSection = localStorage.getItem(keys.settingsSection) || "company";

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

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.message || data.zh || "API request failed");
    return data;
  }

  function isAdmin() {
    return ["owner", "admin"].includes(currentUser?.role);
  }

  function ensureLoginView() {
    if ($("view-login")) return;
    const section = document.createElement("section");
    section.id = "view-login";
    section.className = "view active no-print";
    section.innerHTML = `
      <div class="login-required-card">
        <h2>Login Required / 请先登录</h2>
        <p>Only authorized users can use this quotation system. / 只有授权账号才可以使用报价系统。</p>
        <p>Accounts must be created by the owner in Settings. / 账号必须由所有者在设置中添加。</p>
      </div>
    `;
    document.querySelector(".main")?.prepend(section);
  }

  function toLegacyProduct(product) {
    return {
      id: product.id,
      category: product.category,
      brand: product.brand,
      model: product.model,
      tonnage: product.weight || "",
      year: "",
      hours: "",
      referencePrice: product.referencePrice || "",
      params: product.params || "",
      remark: product.remark || "",
      imageDataUrl: product.imagePath || "",
      aliases: product.aliases || "",
      transportCbm: product.transportCbm || "",
      transportMethod: product.transportMethod || "Bulk Cargo"
    };
  }

  async function login(username, password) {
    const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
    currentUser = data.user;
    renderLogin();
    applyAuthLock();
    await loadServerData();
    toast("Logged in successfully. / 登录成功。");
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    currentUser = null;
    renderLogin();
    applyAuthLock();
  }

  function renderLogin() {
    $("login-status").textContent = currentUser ? `${currentUser.username} / ${currentUser.role}` : "Not logged in / 未登录";
    $("login-btn").hidden = !!currentUser;
    $("login-box").hidden = !!currentUser;
    $("user-info-box").hidden = !currentUser;
    if (currentUser) {
      $("user-info-name").textContent = currentUser.username || "-";
      $("user-info-id").textContent = `ID: ${currentUser.id || "-"}`;
      $("user-info-role").textContent = `Role / 权限编号: ${currentUser.role || "user"}`;
    }
  }

  function applyAuthLock() {
    ensureLoginView();
    document.body.classList.toggle("auth-locked", !currentUser);
    document.body.classList.toggle("auth-ready", !!currentUser);
    document.body.classList.toggle("is-admin", isAdmin());
    updateAdminControls();
    document.querySelectorAll(".nav-btn, .entry-card").forEach((button) => {
      button.disabled = !currentUser;
    });
    if (!currentUser) {
      $("login-status").textContent = "Not logged in / 未登录";
      $("login-box").hidden = false;
      switchView("login");
    } else if ($("view-login")?.classList.contains("active")) {
      switchView("home");
    }
  }

  async function checkLogin() {
    try {
      const data = await api("/api/auth/me");
      currentUser = data.user;
      renderLogin();
      applyAuthLock();
      if (currentUser) await loadServerData();
    } catch {
      renderLogin();
      applyAuthLock();
    }
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

  const paymentOptions = [
    { value: "30/70", label: "30/70 - 30% deposit, 70% before shipment / 3/7付款" },
    { value: "40/60", label: "40/60 - 40% deposit, 60% before shipment / 4/6付款" },
    { value: "100%", label: "100% before shipment / 百分百付款" }
  ];

  const tradeTermOptions = [
    { value: "EXW", label: "EXW - Ex Works / 工厂交货价", desc: "EXW: Seller provides goods at factory; buyer handles pickup, export, freight and insurance. / 工厂交货，买方负责提货、出口、运输和保险。" },
    { value: "FOB", label: "FOB - Free On Board / 装运港船上交货", desc: "FOB: Seller delivers goods to the departure port and loads on board; buyer pays sea freight and insurance. / 我们负责把货运到装运港并装船，买方负责海运和保险。" },
    { value: "CIF", label: "CIF - Cost Insurance Freight / 成本保险加运费", desc: "CIF: Seller pays cost, insurance and sea freight to buyer's destination port. / 我们负责货值、保险和海运到客户指定目的港。" }
  ];

  function tradeDescription(value) {
    return tradeTermOptions.find((option) => option.value === value)?.desc || "";
  }

  function applySidebarState() {
    const collapsed = localStorage.getItem(keys.sidebarCollapsed) === "true";
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    if ($("sidebar-toggle-btn")) {
      $("sidebar-toggle-btn").textContent = collapsed ? "显示侧边栏" : "隐藏侧边栏";
    }
  }

  function toggleSidebar() {
    const collapsed = !document.body.classList.contains("sidebar-collapsed");
    localStorage.setItem(keys.sidebarCollapsed, collapsed ? "true" : "false");
    applySidebarState();
  }

  function showSettingsSection(section) {
    activeSettingsSection = section || "company";
    localStorage.setItem(keys.settingsSection, activeSettingsSection);
    document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.settingsPanel !== activeSettingsSection;
    });
    document.querySelectorAll(".settings-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.settingsSection === activeSettingsSection);
    });
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

  function migrateDefaultCostFields() {
    if (settings.costFieldsMigratedV1) return;
    normalizeTemplates();
    settings.templates.forEach((tpl) => {
      const hasFreight = tpl.fields.some((field) => field.fieldKey === "freight");
      const hasTrucking = tpl.fields.some((field) => field.fieldKey === "truckingToPort");
      const additions = [];
      if (!hasFreight) additions.push(f("运费", "Freight", "freight", "money", false, true, 0));
      if (!hasTrucking) additions.push(f("拖车到港费", "Trucking to Port", "truckingToPort", "money", false, true, 0));
      if (additions.length) {
        const unitPriceIndex = tpl.fields.findIndex((field) => field.fieldKey === "unitPrice");
        tpl.fields.splice(unitPriceIndex >= 0 ? unitPriceIndex + 1 : tpl.fields.length, 0, ...additions);
        resequenceFields(tpl.fields);
      }
    });
    settings.costFieldsMigratedV1 = true;
    save(keys.settings, settings);
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
    if (!file) return Promise.resolve("");
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
    if (!currentUser && name !== "login") {
      ensureLoginView();
      name = "login";
    }
    if (["users", "data"].includes(name) && !isAdmin()) {
      toast("Admin permission required. / 需要管理员权限。");
      name = "home";
    }
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    if (name === "history") renderHistory();
    if (name === "products") renderProducts();
    if (name === "settings") renderSettings();
    if (name === "users") {
      ensureUserManagerPanel();
      renderUsers();
    }
    if (name === "quote") renderQuoteEditor();
    if (name === "freight") {
      renderPorts();
      renderFreightRates();
      renderFreightSelectors();
    }
  }

  function renderSettings() {
    ensureUserManagerPanel();
    ensureContactFieldsPanel();
    ensureTermsSettingsPanel();
    normalizeContactFields();
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
    $("stamp-preview").src = settings.stampDataUrl || "";
    $("stamp-preview").hidden = !settings.stampDataUrl;
    $("stamp-preview").title = settings.stampDataUrl ? "Electronic seal uploaded / 电子公章已上传" : "No electronic seal / 未上传电子公章";
    renderContactFields();
    renderUsers();
    showSettingsSection(activeSettingsSection);
  }

  function normalizeContactFields() {
    const existing = Array.isArray(settings.contactFields) ? settings.contactFields : [];
    const legacy = [
      { id: "contact-phone", labelEn: "Phone", labelZh: "电话", type: "text", value: settings.companyPhone || "", visible: true, sortOrder: 10 },
      { id: "contact-email", labelEn: "Email", labelZh: "邮箱", type: "text", value: settings.companyEmail || "", visible: true, sortOrder: 30 }
    ];
    const merged = existing.length ? existing : legacy;
    settings.contactFields = merged.map((field, index) => ({
      id: field.id || uid("contact"),
      labelEn: field.labelEn || "Contact",
      labelZh: field.labelZh || "联系方式",
      type: field.type || "text",
      value: field.value || "",
      visible: field.visible !== false,
      sortOrder: Number(field.sortOrder || (index + 1) * 10)
    })).sort((a, b) => a.sortOrder - b.sortOrder);
    const phoneField = settings.contactFields.find((field) => field.id === "contact-phone");
    const emailField = settings.contactFields.find((field) => field.id === "contact-email");
    if (phoneField && !phoneField.value && settings.companyPhone) phoneField.value = settings.companyPhone;
    if (emailField && !emailField.value && settings.companyEmail) emailField.value = settings.companyEmail;
  }

  function ensureContactFieldsPanel() {
    if ($("contact-fields-panel")) return;
    const panel = document.createElement("div");
    panel.id = "contact-fields-panel";
    panel.className = "panel";
    panel.dataset.settingsPanel = "company";
    panel.innerHTML = `
      <div class="row-head">
        <div>
          <h3>Quotation Contact Fields / 报价负责人联系方式</h3>
          <p class="hint">These fields belong to the company quotation contact person. Add WhatsApp, WeChat QR code, platform account or other contact fields. / 这里是公司负责该报价的对接人联系方式，可新增 WhatsApp、微信二维码、平台账号等。</p>
        </div>
        <button id="add-contact-field-btn" type="button">Add / 新增</button>
      </div>
      <table class="field-table contact-table">
        <thead>
          <tr>
            <th>Sort / 排序</th>
            <th>English / 英文</th>
            <th>中文</th>
            <th>Type / 类型</th>
            <th>Value / 内容</th>
            <th>Show / 显示</th>
            <th>Actions / 操作</th>
          </tr>
        </thead>
        <tbody id="contact-field-list"></tbody>
      </table>
    `;
    const companyPanel = document.querySelector("#view-settings .panel");
    companyPanel?.after(panel);
  }

  function renderContactFields() {
    if (!$("contact-field-list")) return;
    normalizeContactFields();
    $("contact-field-list").innerHTML = settings.contactFields.map((field, index) => `
      <tr data-contact-index="${index}">
        <td><span class="drag-handle">::</span>${index + 1}</td>
        <td><input data-contact-prop="labelEn" value="${escapeHtml(field.labelEn)}" /></td>
        <td><input data-contact-prop="labelZh" value="${escapeHtml(field.labelZh)}" /></td>
        <td>
          <select data-contact-prop="type">
            <option value="text"${field.type === "text" ? " selected" : ""}>Text / 文本</option>
            <option value="image"${field.type === "image" ? " selected" : ""}>Image / 图片二维码</option>
          </select>
        </td>
        <td>
          ${field.type === "image"
            ? `<label class="file-btn">Upload / 上传<input data-contact-image="${index}" type="file" accept="image/*" /></label>${field.value ? `<img class="contact-thumb" src="${field.value}" alt="">` : ""}`
            : `<input data-contact-prop="value" value="${escapeHtml(field.value)}" />`}
        </td>
        <td><input data-contact-visible type="checkbox"${field.visible ? " checked" : ""} /></td>
        <td class="field-actions">
          <button data-contact-action="up" type="button">Up / 上移</button>
          <button data-contact-action="down" type="button">Down / 下移</button>
          <button data-contact-action="delete" type="button">Delete / 删除</button>
        </td>
      </tr>
    `).join("");
  }

  function collectContactFields() {
    if (!$("contact-field-list")) return;
    const rows = Array.from(document.querySelectorAll("#contact-field-list tr[data-contact-index]"));
    rows.forEach((row, rowIndex) => {
      const field = settings.contactFields[Number(row.dataset.contactIndex)];
      row.querySelectorAll("[data-contact-prop]").forEach((input) => {
        field[input.dataset.contactProp] = input.value;
      });
      field.visible = !!row.querySelector("[data-contact-visible]")?.checked;
      field.sortOrder = (rowIndex + 1) * 10;
    });
  }

  function addContactField() {
    collectContactFields();
    settings.contactFields.push({
      id: uid("contact"),
      labelEn: "WhatsApp",
      labelZh: "WhatsApp",
      type: "text",
      value: "",
      visible: true,
      sortOrder: (settings.contactFields.length + 1) * 10
    });
    renderContactFields();
  }

  function handleContactFieldAction(event) {
    const row = event.target.closest("tr[data-contact-index]");
    if (!row) return;
    collectContactFields();
    const index = Number(row.dataset.contactIndex);
    const action = event.target.dataset.contactAction;
    if (event.target.matches("[data-contact-visible]")) {
      settings.contactFields[index].visible = event.target.checked;
      return;
    }
    if (event.target.matches("[data-contact-image]")) return;
    if (action === "delete") {
      if (!confirm("Delete this contact field? / 确认删除这个联系方式字段吗？")) return;
      settings.contactFields.splice(index, 1);
    }
    if (action === "up" && index > 0) {
      [settings.contactFields[index - 1], settings.contactFields[index]] = [settings.contactFields[index], settings.contactFields[index - 1]];
    }
    if (action === "down" && index < settings.contactFields.length - 1) {
      [settings.contactFields[index + 1], settings.contactFields[index]] = [settings.contactFields[index], settings.contactFields[index + 1]];
    }
    settings.contactFields.forEach((field, i) => field.sortOrder = (i + 1) * 10);
    renderContactFields();
  }

  async function handleContactImageChange(event) {
    const input = event.target.closest("[data-contact-image]");
    if (!input) return;
    const index = Number(input.dataset.contactImage);
    collectSettingsDraft();
    settings.contactFields[index].value = await fileToDataUrl(input.files[0]);
    settings.contactFields[index].type = "image";
    renderContactFields();
  }

  function ensureUserManagerPanel() {
    if ($("user-manager-panel")) return;
    const section = document.createElement("div");
    section.id = "user-manager-panel";
    section.className = "panel admin-only";
    section.innerHTML = `
      <div class="row-head">
        <div>
          <h3>User Management / 用户管理</h3>
          <p class="hint">Username supports English letters, numbers, or email. New accounts are normal users by default. / 用户名支持英文、数字或邮箱，新账号默认是普通用户。</p>
        </div>
      </div>
      <div class="form-grid">
        <label><span>Username or Email / 用户名或邮箱</span><input id="user-username" autocomplete="off" placeholder="ethan01 or name@example.com" /></label>
        <label><span>Password / 密码</span><input id="user-password" type="password" autocomplete="new-password" /></label>
        <label>
          <span>Role / 角色</span>
          <select id="user-role">
            <option value="user">Normal User / 普通用户</option>
            <option value="owner">Owner / 所有者</option>
          </select>
        </label>
      </div>
      <div class="actions">
        <button id="save-user-btn" class="primary" type="button">Add User / 新增用户</button>
        <button id="clear-user-btn" type="button">Cancel / 取消</button>
      </div>
      <table class="field-table">
        <thead>
          <tr>
            <th>Username / 用户名</th>
            <th>Role / 角色</th>
            <th>Status / 状态</th>
            <th>Actions / 操作</th>
          </tr>
        </thead>
        <tbody id="user-list"></tbody>
      </table>
    `;
    const host = $("user-management-host") || document.querySelector(".sticky-actions");
    host?.appendChild(section);
  }

  function ensureTermsSettingsPanel() {
    if ($("terms-settings-panel")) return;
    const panel = document.createElement("div");
    panel.id = "terms-settings-panel";
    panel.className = "panel";
    panel.dataset.settingsPanel = "terms";
    panel.innerHTML = `
      <div class="row-head">
        <div>
          <h3>报价条款设置</h3>
          <p class="hint">维护付款方式、贸易方式、交货时间、售后、质保等条款字段。</p>
        </div>
        <button id="add-term-field-proxy-btn" class="primary" type="button">新增条款字段</button>
      </div>
      <div id="terms-field-host"></div>
    `;
    const sticky = document.querySelector(".sticky-actions");
    sticky?.before(panel);
    const termManager = $("template-term-field-list")?.closest(".field-manager");
    if (termManager) $("terms-field-host").appendChild(termManager);
  }

  function updateAdminControls() {
    document.querySelectorAll(".admin-only").forEach((el) => {
      el.hidden = !isAdmin();
    });
    ["save-settings-btn", "backup-db-btn", "restore-db-btn", "export-data-btn", "import-data-btn"].forEach((id) => {
      const button = $(id);
      if (button) button.hidden = !isAdmin();
    });
  }

  function renderUsers() {
    updateAdminControls();
    if (!$("user-list")) return;
    if (!isAdmin()) {
      $("user-list").innerHTML = "";
      return;
    }
    $("user-list").innerHTML = users.map((user) => `
      <tr data-user-id="${escapeHtml(user.id)}">
        <td>${escapeHtml(user.username)}</td>
        <td>${escapeHtml(user.role === "owner" || user.role === "admin" ? "Owner / 所有者" : "Normal User / 普通用户")}</td>
        <td>${escapeHtml(user.status === "Inactive" ? "Inactive / 已停用" : "Active / 启用")}</td>
        <td class="actions">
          <button class="reset-user-password" type="button">Change Password / 改密码</button>
          <button class="toggle-user-status" type="button" ${user.username === "admin" ? "disabled" : ""}>${user.status === "Inactive" ? "Activate / 启用" : "Disable / 停用"}</button>
          <button class="delete-user" type="button" ${user.username === "admin" ? "disabled" : ""}>Delete / 删除</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="4">No users / 暂无用户</td></tr>`;
  }

  async function refreshUsers() {
    if (!isAdmin()) return;
    const data = await api("/api/users");
    users = data.users || [];
    renderUsers();
  }

  function clearUserForm() {
    if (!$("user-username")) return;
    $("user-username").value = "";
    $("user-password").value = "";
    $("user-role").value = "user";
  }

  function validUsernameInput(username) {
    const value = String(username || "").trim();
    if (value.includes("@")) return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
    return /^[A-Za-z0-9._-]{3,50}$/.test(value);
  }

  async function saveUser() {
    const username = $("user-username").value.trim();
    const password = $("user-password").value;
    const role = $("user-role").value;
    if (!username || !password) return toast("Username and password are required. / 用户名和密码不能为空。");
    if (!validUsernameInput(username)) return toast("Use English letters/numbers or email. / 请使用英文、数字或邮箱。");
    await api("/api/users", { method: "POST", body: JSON.stringify({ username, password, role }) });
    clearUserForm();
    await refreshUsers();
    toast("Saved successfully. / 保存成功。");
  }

  async function handleUserAction(event) {
    const row = event.target.closest("tr[data-user-id]");
    if (!row) return;
    const user = users.find((x) => x.id === row.dataset.userId);
    if (!user) return;

    if (event.target.matches(".reset-user-password")) {
      const password = prompt("New Password / 新密码");
      if (!password) return;
      await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ role: user.role, status: user.status, password }) });
      await refreshUsers();
      toast("Saved successfully. / 保存成功。");
    }

    if (event.target.matches(".toggle-user-status")) {
      const status = user.status === "Inactive" ? "Active" : "Inactive";
      await api(`/api/users/${user.id}`, { method: "PUT", body: JSON.stringify({ role: user.role, status }) });
      await refreshUsers();
      toast(status === "Inactive" ? "Marked as inactive successfully. / 已成功标记为停用。" : "Saved successfully. / 保存成功。");
    }

    if (event.target.matches(".delete-user")) {
      if (!confirm("Are you sure you want to delete this user? / 确认删除这个用户吗？")) return;
      await api(`/api/users/${user.id}`, { method: "DELETE" });
      await refreshUsers();
      toast("Marked as inactive successfully. / 已成功标记为停用。");
    }
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
    collectSettingsDraft();
    const phone = settings.contactFields.find((field) => normalize(field.labelEn + field.labelZh).includes("phone") || field.labelZh.includes("电话"));
    const email = settings.contactFields.find((field) => normalize(field.labelEn + field.labelZh).includes("email") || field.labelZh.includes("邮箱"));
    if (phone?.type === "text") settings.companyPhone = phone.value || settings.companyPhone || "";
    if (email?.type === "text") settings.companyEmail = email.value || settings.companyEmail || "";
    save(keys.settings, settings);
    renderAllSelectors();
    renderCategoryList();
    toast("设置已保存。");
  }

  function collectSettingsDraft() {
    collectContactFields();
    document.querySelectorAll("[data-setting]").forEach((input) => {
      settings[input.dataset.setting] = input.value.trim();
    });
  }

  async function updateSettingsAsset(input, key, message) {
    const file = input.files?.[0];
    if (!file) return;
    collectSettingsDraft();
    settings[key] = await fileToDataUrl(file);
    input.value = "";
    renderSettings();
    toast(message);
  }

  function clearSettingsAsset(key, message) {
    collectSettingsDraft();
    settings[key] = "";
    renderSettings();
    toast(message);
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
    renderFreightSelectors();
  }

  async function loadServerData() {
    if (!currentUser) return;
    try {
      const [productData, portData, freightData] = await Promise.all([
        api("/api/products"),
        api("/api/ports"),
        api("/api/freight-rates")
      ]);
      serverProducts = productData.products || [];
      products = serverProducts.map(toLegacyProduct);
      ports = portData.ports || [];
      freightRates = freightData.freightRates || [];
      if (isAdmin()) {
        const userData = await api("/api/users");
        users = userData.users || [];
        renderUsers();
      }
      renderAllSelectors();
      renderProducts();
      renderPorts();
      renderFreightRates();
    } catch (error) {
      toast(error.message);
    }
  }

  function renderFreightSelectors() {
    const portOptions = `<option value="">Select Port / 选择港口</option>` + ports.map((p) => `<option value="${p.id}">${escapeHtml(p.displayName)}</option>`).join("");
    ["freight-origin", "freight-destination", "calc-origin", "calc-destination"].forEach((id) => {
      const el = $(id);
      if (el) el.innerHTML = portOptions;
    });
    const productOptions = `<option value="">Select Product / 选择产品</option>` + products.map((p) => `<option value="${p.id}">${escapeHtml(p.brand)} ${escapeHtml(p.model)}</option>`).join("");
    if ($("calc-product")) $("calc-product").innerHTML = productOptions;
  }

  function displayPort(port) {
    return port ? `${port.portName}, ${port.countryName}` : "";
  }

  function renderPorts() {
    const q = normalize($("port-search")?.value || "");
    const list = ports.filter((p) => !q || normalize(`${p.displayName}${p.portChineseName}${p.aliases}${p.unLocode}${p.countryChineseName}`).includes(q));
    $("port-list").innerHTML = list.map((p) => `
      <article class="list-item">
        <div><b>${escapeHtml(p.displayName)}</b><p>${escapeHtml(p.portChineseName)} | ${escapeHtml(p.unLocode)} | ${escapeHtml(p.status)}</p><p>${escapeHtml(p.aliases)}</p></div>
        <div class="actions">
          <button type="button" data-port-action="copy" data-id="${p.id}">Copy / 复制</button>
          <button type="button" data-port-action="edit" data-id="${p.id}">Edit / 编辑</button>
          <button type="button" data-port-action="delete" data-id="${p.id}">Delete / 删除</button>
        </div>
      </article>
    `).join("") || `<p class="empty">No port found. / 未找到港口。</p>`;
  }

  function clearPortForm() {
    editingPortId = "";
    ["port-country", "port-country-zh", "port-country-code", "port-name", "port-name-zh", "port-locode", "port-aliases"].forEach((id) => $(id).value = "");
  }

  async function savePort() {
    const payload = {
      countryName: $("port-country").value.trim(),
      countryChineseName: $("port-country-zh").value.trim(),
      countryCode: $("port-country-code").value.trim(),
      portName: $("port-name").value.trim(),
      portChineseName: $("port-name-zh").value.trim(),
      unLocode: $("port-locode").value.trim(),
      aliases: $("port-aliases").value.trim(),
      isOriginPort: true,
      isDestinationPort: true,
      status: "Active"
    };
    if (!payload.countryName || !payload.portName) return toast("Please enter country and port. / 请填写国家和港口。");
    await api(editingPortId ? `/api/ports/${editingPortId}` : "/api/ports", { method: editingPortId ? "PUT" : "POST", body: JSON.stringify(payload) });
    clearPortForm();
    await loadServerData();
    toast("Saved successfully. / 保存成功。");
  }

  async function handlePortAction(event) {
    const button = event.target.closest("[data-port-action]");
    if (!button) return;
    const port = ports.find((p) => p.id === button.dataset.id);
    if (!port) return;
    if (button.dataset.portAction === "copy") {
      await navigator.clipboard.writeText(port.displayName);
      return toast("Copied successfully. / 复制成功。");
    }
    if (button.dataset.portAction === "edit") {
      editingPortId = port.id;
      $("port-country").value = port.countryName;
      $("port-country-zh").value = port.countryChineseName;
      $("port-country-code").value = port.countryCode;
      $("port-name").value = port.portName;
      $("port-name-zh").value = port.portChineseName;
      $("port-locode").value = port.unLocode;
      $("port-aliases").value = port.aliases;
      return;
    }
    if (!confirm("Are you sure you want to delete this port?\n确认删除这个港口吗？")) return;
    const result = await api(`/api/ports/${port.id}`, { method: "DELETE" });
    await loadServerData();
    toast(`${result.message} / ${result.zh}`);
  }

  function renderFreightRates() {
    const q = normalize($("freight-search")?.value || "");
    const list = freightRates.filter((r) => !q || normalize(`${r.originDisplayName}${r.destinationDisplayName}${r.destinationCountry}${r.shippingMethod}${r.effectiveMonth}${r.remark}`).includes(q));
    $("freight-list").innerHTML = list.map((r) => `
      <article class="list-item">
        <div><b>${escapeHtml(r.originDisplayName)} → ${escapeHtml(r.destinationDisplayName)}</b><p>${escapeHtml(r.shippingMethod)} | ${Number(r.rate).toLocaleString("en-US")} ${escapeHtml(r.rateUnit)} | ${escapeHtml(r.effectiveMonth)} | ${escapeHtml(r.status)}</p><p>${escapeHtml(r.remark)}</p></div>
        <div class="actions">
          <button type="button" data-freight-action="copy-rate" data-id="${r.id}">Copy Rate / 复制运费</button>
          <button type="button" data-freight-action="copy-route" data-id="${r.id}">Copy Route / 复制路线</button>
          <button type="button" data-freight-action="use" data-id="${r.id}">Use in Quotation / 导入报价单</button>
          <button type="button" data-freight-action="edit" data-id="${r.id}">Edit / 编辑</button>
          <button type="button" data-freight-action="delete" data-id="${r.id}">Delete / 删除</button>
        </div>
      </article>
    `).join("") || `<p class="empty">No freight rate found. / 未找到运费。</p>`;
  }

  function clearFreightForm() {
    editingFreightId = "";
    ["freight-origin", "freight-destination", "freight-rate", "freight-agent", "freight-remark"].forEach((id) => $(id).value = "");
    $("freight-method").value = "Bulk Cargo";
    $("freight-month").value = new Date().toISOString().slice(0, 7);
  }

  async function saveFreightRate() {
    const payload = {
      originPortId: $("freight-origin").value,
      destinationPortId: $("freight-destination").value,
      shippingMethod: $("freight-method").value,
      rate: $("freight-rate").value,
      effectiveMonth: $("freight-month").value || new Date().toISOString().slice(0, 7),
      freightForwarder: $("freight-agent").value.trim(),
      remark: $("freight-remark").value.trim()
    };
    if (!payload.originPortId || !payload.destinationPortId || !payload.rate) return toast("Please enter route and freight rate. / 请填写路线和运费。");
    await api(editingFreightId ? `/api/freight-rates/${editingFreightId}` : "/api/freight-rates", { method: editingFreightId ? "PUT" : "POST", body: JSON.stringify(payload) });
    clearFreightForm();
    await loadServerData();
    toast("Freight rate saved successfully. / 运费保存成功。");
  }

  async function handleFreightAction(event) {
    const button = event.target.closest("[data-freight-action]");
    if (!button) return;
    const rate = freightRates.find((r) => r.id === button.dataset.id);
    if (!rate) return;
    const action = button.dataset.freightAction;
    if (action === "copy-rate") {
      await navigator.clipboard.writeText(`${rate.rate} ${rate.rateUnit}`);
      return toast("Copied successfully. / 复制成功。");
    }
    if (action === "copy-route") {
      await navigator.clipboard.writeText(`${rate.originDisplayName} → ${rate.destinationDisplayName}: ${rate.rate} ${rate.rateUnit}`);
      return toast("Copied successfully. / 复制成功。");
    }
    if (action === "use") {
      $("calc-origin").value = rate.originPortId;
      $("calc-destination").value = rate.destinationPortId;
      $("calc-method").value = rate.shippingMethod;
      $("calc-rate").value = rate.rate;
      switchView("freight");
      return toast("Imported to quotation successfully. / 已成功导入报价单。");
    }
    if (action === "edit") {
      editingFreightId = rate.id;
      $("freight-origin").value = rate.originPortId;
      $("freight-destination").value = rate.destinationPortId;
      $("freight-method").value = rate.shippingMethod;
      $("freight-rate").value = rate.rate;
      $("freight-month").value = rate.effectiveMonth;
      $("freight-agent").value = rate.freightForwarder;
      $("freight-remark").value = rate.remark;
      return;
    }
    if (!confirm("Are you sure you want to delete this freight rate?\n确认删除这条运费吗？")) return;
    const result = await api(`/api/freight-rates/${rate.id}`, { method: "DELETE" });
    await loadServerData();
    toast(`${result.message} / ${result.zh}`);
  }

  async function autoCalculateFreight() {
    const product = products.find((p) => p.id === $("calc-product").value);
    if (product && !$("calc-cbm").value) {
      $("calc-cbm").value = product.transportCbm || "";
      if (!product.transportCbm) toast("No transport CBM found. Please enter CBM manually. / 未找到运输立方，请手动输入。");
    }
    const originPortId = $("calc-origin").value;
    const destinationPortId = $("calc-destination").value;
    const shippingMethod = $("calc-method").value;
    let rate = $("calc-rate").value;
    let rateInfo = null;
    if (originPortId && destinationPortId && !rate) {
      const data = await api(`/api/freight-rates/search?originPortId=${encodeURIComponent(originPortId)}&destinationPortId=${encodeURIComponent(destinationPortId)}&shippingMethod=${encodeURIComponent(shippingMethod)}&effectiveMonth=${new Date().toISOString().slice(0, 7)}`);
      if (data.found) {
        rateInfo = data.freightRate;
        rate = rateInfo.rate;
        $("calc-rate").value = rate;
        if (data.fallback) toast(`${data.message} / ${data.zh}`);
      } else {
        toast("No freight rate found. Please enter freight manually or add a new freight rate. / 未找到运费，请手动输入或新增运费。");
      }
    }
    const cbm = $("calc-cbm").value;
    const qty = $("calc-qty").value || 1;
    const data = await api("/api/freight/calculate", { method: "POST", body: JSON.stringify({ transportCbm: cbm, freightRate: rate, quantity: qty }) });
    $("calc-amount").value = data.freightAmount;
    lastFreightCalculation = {
      productId: product?.id || "",
      productName: product ? `${product.brand} ${product.model}` : "",
      transportCbm: Number(cbm || 0),
      freightRate: Number(rate || 0),
      quantity: Number(qty || 1),
      freightAmount: data.freightAmount,
      calculationFormula: data.calculationFormula,
      originPortId,
      destinationPortId,
      originDisplayName: ports.find((p) => p.id === originPortId)?.displayName || "",
      destinationDisplayName: ports.find((p) => p.id === destinationPortId)?.displayName || "",
      shippingMethod,
      freightRateId: rateInfo?.id || "",
      freightEffectiveMonth: rateInfo?.effectiveMonth || ""
    };
    $("calc-result").textContent = `${lastFreightCalculation.calculationFormula} / Sea Freight 海运费: ${money(data.freightAmount, "USD")}`;
  }

  async function copyFreightAmount() {
    const amount = $("calc-amount").value;
    if (!amount) return toast("Please calculate freight first. / 请先计算运费。");
    await navigator.clipboard.writeText(money(amount, "USD"));
    toast("Copied successfully. / 复制成功。");
  }

  function useFreightInQuotation() {
    if (!currentQuote) return toast("Please create a quotation first. / 请先新建报价。");
    if (!lastFreightCalculation) return toast("Please calculate freight first. / 请先计算运费。");
    collectQuoteFromForm();
    currentQuote.items.push({
      id: uid("item"),
      values: {
        productType: "Sea Freight",
        brand: lastFreightCalculation.originDisplayName,
        model: lastFreightCalculation.destinationDisplayName,
        qty: "1",
        unitPrice: lastFreightCalculation.freightAmount,
        freight: "",
        truckingToPort: "",
        currency: "USD",
        remark: lastFreightCalculation.calculationFormula
      },
      imageDataUrl: "",
      freightSnapshot: structuredClone(lastFreightCalculation)
    });
    renderQuoteItems();
    renderPreview();
    switchView("quote");
    toast("Imported to quotation successfully. / 已成功导入报价单。");
  }

  async function backupDatabase() {
    const data = await api("/api/system/backup-db");
    toast(`${data.message} / ${data.zh}: ${data.path}`);
  }

  function exportAllData() {
    window.open("/api/system/export", "_blank");
  }

  async function restoreDatabase() {
    try {
      let filePath = "";
      if (window.quotationDesktop?.selectRestoreDb) {
        filePath = await window.quotationDesktop.selectRestoreDb();
      } else {
        filePath = prompt("Backup file path / 备份文件路径");
      }
      if (!filePath) return;
      const data = await api("/api/system/restore-db", { method: "POST", body: JSON.stringify({ path: filePath }) });
      toast(`${data.message} / ${data.zh}`);
    } catch (error) {
      toast(error.message);
    }
  }

  async function importData() {
    try {
      let filePath = "";
      if (window.quotationDesktop?.selectImportJson) {
        filePath = await window.quotationDesktop.selectImportJson();
      } else {
        filePath = prompt("Import JSON file path / 导入 JSON 文件路径");
      }
      if (!filePath) return;
      const data = await api("/api/system/import", { method: "POST", body: JSON.stringify({ path: filePath }) });
      await loadServerData();
      toast(`${data.message} / ${data.zh}`);
    } catch (error) {
      toast(error.message);
    }
  }

  async function exportPdf() {
    renderPreview();
    if (window.quotationDesktop?.exportCurrentPdf) {
      const filePath = await window.quotationDesktop.exportCurrentPdf();
      if (filePath) toast(`PDF exported. / PDF 已导出：${filePath}`);
      return;
    }
    window.print();
  }

  async function openDataFolder() {
    if (window.quotationDesktop?.openDataDir) {
      const dir = await window.quotationDesktop.openDataDir();
      toast(`Data folder / 数据目录: ${dir}`);
    } else {
      const data = await api("/api/system/paths");
      toast(`Data folder / 数据目录: ${data.dataDir}`);
    }
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

  function splitImportLine(line) {
    const normalized = line.trim();
    const separator = /[\t,，]/.test(normalized) ? /[\t,，]+/ : /\s+/;
    return normalized.split(separator).map((cell) => cell.trim()).filter(Boolean);
  }

  function normalizeHeaderKey(text) {
    const value = normalize(text);
    const map = [
      [["category", "type", "产品类型", "分类", "种类"], "category"],
      [["brand", "品牌", "厂家"], "brand"],
      [["model", "型号", "机型"], "model"],
      [["tonnage", "吨位", "吨"], "tonnage"],
      [["year", "年份", "年限"], "year"],
      [["hours", "工时", "小时", "工作小时"], "hours"],
      [["price", "底价", "参考价格", "售价", "单价", "价格", "成本"], "referencePrice"],
      [["params", "参数", "配置"], "params"],
      [["remark", "备注", "说明"], "remark"]
    ];
    return map.find(([aliases]) => aliases.some((alias) => value.includes(normalize(alias))))?.[1] || "";
  }

  function looksLikeHeader(cells) {
    return cells.filter((cell) => normalizeHeaderKey(cell)).length >= 2;
  }

  function parsePriceNumber(text) {
    const match = String(text || "").replace(/[,，]/g, "").match(/\d+(?:\.\d+)?/);
    return match ? match[0] : "";
  }

  function productKey(product) {
    return normalize(`${product.category}|${product.brand}|${product.model}|${product.year}`);
  }

  function productFromImportObject(row) {
    const category = row.category || settings.categories[0] || "未分类";
    return {
      id: uid("product"),
      category,
      brand: row.brand || "",
      model: row.model || "",
      tonnage: row.tonnage || "",
      year: row.year || "",
      hours: row.hours || "",
      referencePrice: parsePriceNumber(row.referencePrice),
      params: row.params || "",
      remark: row.remark || "",
      imageDataUrl: ""
    };
  }

  function parseProductWithoutHeader(cells) {
    const categoryNames = settings.categories || [];
    const categoryIndex = cells.findIndex((cell) => categoryNames.some((name) => normalize(name) === normalize(cell)));
    const category = categoryIndex >= 0 ? cells.splice(categoryIndex, 1)[0] : (settings.categories[0] || "未分类");
    let priceIndex = -1;
    for (let index = cells.length - 1; index >= 0; index -= 1) {
      if (parsePriceNumber(cells[index])) {
        priceIndex = index;
        break;
      }
    }
    const referencePrice = priceIndex >= 0 ? parsePriceNumber(cells.splice(priceIndex, 1)[0]) : "";
    const yearIndex = cells.findIndex((cell) => /^(19|20)\d{2}$/.test(cell));
    const year = yearIndex >= 0 ? cells.splice(yearIndex, 1)[0] : "";
    const brand = cells.shift() || "";
    const model = cells.shift() || "";
    const hoursIndex = cells.findIndex((cell) => /\d/.test(cell) && (/小时|工时|h$/i.test(cell) || /^\d+(?:\.\d+)?$/.test(cell)));
    const hours = hoursIndex >= 0 ? parsePriceNumber(cells.splice(hoursIndex, 1)[0]) : "";
    return {
      id: uid("product"),
      category,
      brand,
      model,
      tonnage: "",
      year,
      hours,
      referencePrice,
      params: "",
      remark: cells.join(" "),
      imageDataUrl: ""
    };
  }

  function importPriceList() {
    normalizeCategories();
    const raw = $("price-import-text").value.trim();
    if (!raw) return toast("请先粘贴价格表文本。");
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return toast("没有可导入的内容。");
    const firstCells = splitImportLine(lines[0]);
    const hasHeader = looksLikeHeader(firstCells);
    const headers = hasHeader ? firstCells.map(normalizeHeaderKey) : [];
    const dataLines = hasHeader ? lines.slice(1) : lines;
    let added = 0;
    let updated = 0;
    let skipped = 0;
    dataLines.forEach((line) => {
      const cells = splitImportLine(line);
      if (!cells.length) return;
      let product;
      if (hasHeader) {
        const row = {};
        headers.forEach((key, index) => {
          if (key) row[key] = cells[index] || "";
        });
        product = productFromImportObject(row);
      } else {
        product = parseProductWithoutHeader([...cells]);
      }
      if (!product.brand && !product.model) {
        skipped += 1;
        return;
      }
      const key = productKey(product);
      const existingIndex = products.findIndex((item) => productKey(item) === key);
      if (existingIndex >= 0) {
        products[existingIndex] = { ...products[existingIndex], ...product, id: products[existingIndex].id, imageDataUrl: products[existingIndex].imageDataUrl || "" };
        updated += 1;
      } else {
        products.unshift(product);
        added += 1;
      }
    });
    save(keys.products, products);
    renderProducts();
    renderAllSelectors();
    $("price-import-result").textContent = `导入完成：新增 ${added} 条，更新 ${updated} 条，跳过 ${skipped} 条。`;
    toast("价格表导入完成。");
  }

  async function loadPriceImportFile(file) {
    if (!file) return;
    const text = await file.text();
    $("price-import-text").value = text;
    $("price-import-result").textContent = `已读取文件：${file.name}。确认内容无误后点击“导入价格表”。`;
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
        payment: "30/70",
        deliveryTime: "",
        shipping: "FOB",
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
      let freightSnapshot = null;
      try { freightSnapshot = card.dataset.freightSnapshot ? JSON.parse(decodeURIComponent(card.dataset.freightSnapshot)) : null; } catch { freightSnapshot = null; }
      return { id: card.dataset.id, kind: card.dataset.kind || "product", values, imageDataUrl: card.querySelector("[data-image]")?.dataset.image || "", freightSnapshot };
    });
    currentQuote.updatedAt = new Date().toISOString();
  }

  function itemKindLabel(kind) {
    const map = {
      product: "Product Price / 产品价格",
      freight: "Sea Freight / 海运费",
      trucking: "Inland Trucking / 陆路运输费",
      custom: "Custom Item / 自定义费用"
    };
    return map[kind || "product"] || map.product;
  }

  function itemCard(item = {}) {
    const tpl = template();
    const id = item.id || uid("item");
    const kind = item.kind || "product";
    const vals = item.values || {};
    if (kind !== "product") {
      return `
        <article class="quote-item panel cost-item" data-id="${id}" data-kind="${kind}">
          <div class="row-head">
            <h3>${itemKindLabel(kind)}</h3>
            <span class="manual-badge">Auto Calculate / 自动计价</span>
          </div>
          <div class="quote-item-grid">
            <label><span>Item Name / 项目名称</span><input data-qfield="itemName" value="${escapeHtml(vals.itemName || itemKindLabel(kind))}" /></label>
            <label><span>Quantity / 数量</span><input data-qfield="qty" type="number" value="${escapeHtml(vals.qty || "1")}" /></label>
            <label><span>Unit Price / 单价</span><input data-qfield="unitPrice" type="number" value="${escapeHtml(vals.unitPrice || "")}" /></label>
            <label><span>Currency / 货币</span><select data-qfield="currency">${["USD", "CNY", "EUR", "AED"].map((option) => `<option value="${option}"${option === (vals.currency || settings.currency) ? " selected" : ""}>${option}</option>`).join("")}</select></label>
            <label class="wide"><span>Description / 说明</span><input data-qfield="description" value="${escapeHtml(vals.description || "")}" /></label>
            <label class="wide"><span>Remark / 备注</span><textarea data-qfield="remark">${escapeHtml(vals.remark || "")}</textarea></label>
          </div>
          <div class="actions"><button class="remove-quote-item" type="button">Delete / 删除本项</button></div>
        </article>
      `;
    }
    const fields = tpl.fields
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((field) => field.visible && field.fieldType !== "calculated" && field.fieldType !== "image" && !["freight", "truckingToPort"].includes(field.fieldKey));
    const showImage = tpl.fields.some((field) => field.visible && field.fieldType === "image");
    return `
      <article class="quote-item panel" data-id="${id}" data-kind="product" data-freight-snapshot="${item.freightSnapshot ? encodeURIComponent(JSON.stringify(item.freightSnapshot)) : ""}">
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
    if (field.fieldKey === "payment") {
      const selected = value || "30/70";
      return `<select data-termfield="${key}">${paymentOptions.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>`;
    }
    if (field.fieldKey === "shipping" || field.fieldKey === "tradeTerm") {
      const selected = value || "FOB";
      return `<select data-termfield="${key}" data-trade-term>${tradeTermOptions.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select><p class="term-desc">${escapeHtml(tradeDescription(selected))}</p>`;
    }
    if (field.fieldType === "textarea") return `<textarea data-termfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-termfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-termfield="${key}" type="number" value="${val}" />`;
    if (field.fieldType === "select") return `<select data-termfield="${key}"><option value="${val}" selected>${val || "请选择"}</option></select>`;
    return `<input data-termfield="${key}" type="text" value="${val}" />`;
  }

  function addManualProduct() {
    collectQuoteFromForm();
    currentQuote.items.push({ id: uid("item"), kind: "product", values: { currency: settings.currency, qty: "1" }, imageDataUrl: "" });
    renderQuoteItems();
  }

  function addCostItem(kind) {
    collectQuoteFromForm();
    currentQuote.items.push({
      id: uid("item"),
      kind,
      values: {
        itemName: itemKindLabel(kind),
        qty: "1",
        unitPrice: "",
        currency: settings.currency,
        description: "",
        remark: ""
      },
      imageDataUrl: ""
    });
    renderQuoteItems();
    renderPreview();
  }

  function addQuoteItemByType() {
    const type = $("add-item-type").value;
    if (type === "product") {
      if ($("library-product-select").value) addProductFromLibrary();
      else addManualProduct();
      return;
    }
    addCostItem(type);
  }

  function addProductFromLibrary() {
    const p = products.find((x) => x.id === $("library-product-select").value);
    if (!p) return toast("请选择产品库产品。");
    collectQuoteFromForm();
    currentQuote.items.push({
      id: uid("item"),
      kind: "product",
      imageDataUrl: p.imageDataUrl || "",
      values: {
        brand: p.brand,
        model: p.model,
        year: p.year,
        hours: p.hours,
        unitPrice: p.referencePrice,
        freight: "",
        truckingToPort: "",
        currency: settings.currency,
        qty: "1",
        params: p.params,
        remark: p.remark
      }
    });
    renderQuoteItems();
  }

  function total() {
    return quoteTotal(currentQuote);
  }

  function quoteTemplate(quote) {
    normalizeTemplates();
    return settings.templates.find((tpl) => tpl.name === quote?.templateName) || settings.templates[0];
  }

  function quoteTotal(quote) {
    const tpl = quoteTemplate(quote);
    return (quote?.items || []).reduce((sum, item) => sum + itemSubtotal(item, tpl), 0);
  }

  function extraMoneyFields(tpl = template()) {
    return (tpl.fields || [])
      .filter((field) => field.fieldType === "money" && field.fieldKey !== "unitPrice" && !["freight", "truckingToPort"].includes(field.fieldKey))
      .map((field) => field.fieldKey);
  }

  function itemSubtotal(item, tpl = template()) {
    const values = item.values || {};
    if ((item.kind || "product") !== "product") {
      return Number(values.qty || 0) * Number(values.unitPrice || 0);
    }
    const machineAmount = Number(values.qty || 0) * Number(values.unitPrice || 0);
    const extraAmount = extraMoneyFields(tpl).reduce((sum, key) => sum + Number(values[key] || 0), 0);
    return machineAmount + extraAmount;
  }

  function displayFieldValue(item, field) {
    if ((item.kind || "product") !== "product") {
      if (field.fieldKey === "productType") return itemKindLabel(item.kind);
      if (field.fieldKey === "brand") return item.values.itemName || itemKindLabel(item.kind);
      if (field.fieldKey === "model") return item.values.description || "";
      if (field.fieldKey === "qty") return item.values.qty || "";
      if (field.fieldKey === "unitPrice") return item.values.unitPrice ? money(item.values.unitPrice, item.values.currency || settings.currency) : "";
      if (field.fieldKey === "currency") return item.values.currency || settings.currency;
      if (field.fieldKey === "remark") return item.values.remark || "";
    }
    if (field.fieldType === "calculated") return money(itemSubtotal(item), item.values.currency || settings.currency);
    if (field.fieldType === "image") return item.imageDataUrl ? "Image attached / 已上传图片" : "";
    if (field.fieldType === "money") return item.values[field.fieldKey] === "" || item.values[field.fieldKey] === undefined ? "" : money(item.values[field.fieldKey], item.values.currency || settings.currency);
    return item.values[field.fieldKey] || "";
  }

  function previewDescription(item) {
    const values = item.values || {};
    if ((item.kind || "product") !== "product") return values.description || values.itemName || itemKindLabel(item.kind);
    const tpl = quoteTemplate(currentQuote);
    const skip = new Set(["qty", "unitPrice", "currency", "totalAmount", "productImage", "freight", "truckingToPort", "remark"]);
    const parts = (tpl.fields || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((field) => field.visible && !skip.has(field.fieldKey) && field.fieldType !== "image" && field.fieldType !== "calculated")
      .map((field) => values[field.fieldKey] ? `${field.en || field.zh}: ${values[field.fieldKey]}` : "")
      .filter(Boolean);
    return parts.length ? parts.join(" | ") : [values.productType, values.brand, values.model, values.year].filter(Boolean).join(" ");
  }

  function previewRemark(item) {
    return item.values?.remark || "";
  }

  function visibleQuoteField(key) {
    const tpl = quoteTemplate(currentQuote);
    const field = (tpl.fields || []).find((item) => item.fieldKey === key);
    return field ? field.visible !== false : true;
  }

  function quotePreviewColumns() {
    return [
      { key: "type", en: "Type", zh: "费用类型", visible: true },
      { key: "description", en: "Description", zh: "说明", visible: true },
      { key: "qty", en: "Qty", zh: "数量", visible: visibleQuoteField("qty") },
      { key: "unitPrice", en: "Unit Price", zh: "单价", visible: visibleQuoteField("unitPrice") },
      { key: "amount", en: "Amount", zh: "金额", visible: visibleQuoteField("totalAmount") },
      { key: "remark", en: "Remark", zh: "备注", visible: visibleQuoteField("remark") }
    ].filter((column) => column.visible);
  }

  function renderQuotePreviewHead() {
    return quotePreviewColumns().map((column) => `<th>${escapeHtml(column.en)}<small>${escapeHtml(column.zh)}</small></th>`).join("");
  }

  function quotePreviewCell(item, column) {
    const values = item.values || {};
    const currency = values.currency || settings.currency;
    if (column.key === "type") return itemKindLabel(item.kind || "product");
    if (column.key === "description") return previewDescription(item);
    if (column.key === "qty") return values.qty || "1";
    if (column.key === "unitPrice") return values.unitPrice ? money(values.unitPrice, currency) : "";
    if (column.key === "amount") return money(itemSubtotal(item), currency);
    if (column.key === "remark") return previewRemark(item);
    return "";
  }

  function renderQuotePreviewRows() {
    const columns = quotePreviewColumns();
    return (currentQuote.items || []).map((item) => {
      return `<tr>${columns.map((column) => `<td>${escapeHtml(quotePreviewCell(item, column))}</td>`).join("")}</tr>`;
    }).join("");
  }

  function displayTermValue(field) {
    const value = currentQuote.terms[field.fieldKey] || "";
    if (field.fieldKey === "payment") {
      return paymentOptions.find((option) => option.value === value)?.label || value;
    }
    if (field.fieldKey === "shipping" || field.fieldKey === "tradeTerm") {
      return `${value || "FOB"} - ${tradeDescription(value || "FOB")}`;
    }
    return value;
  }

  function renderCompanyContactPreview() {
    normalizeContactFields();
    const fields = settings.contactFields.filter((field) => field.visible && field.value);
    if (!fields.length) {
      return `<p>${escapeHtml(settings.companyAddressEn)} | ${escapeHtml(settings.companyAddressZh)} | Quotation Contact / 报价负责人: ${escapeHtml(settings.contactPerson)}</p>`;
    }
    return `<div class="preview-contact-list">
      <p>${escapeHtml(settings.companyAddressEn)} | ${escapeHtml(settings.companyAddressZh)} | Quotation Contact / 报价负责人: ${escapeHtml(settings.contactPerson)}</p>
      <div>${fields.map((field) => field.type === "image"
        ? `<span class="preview-contact-image"><b>${escapeHtml(field.labelEn)} / ${escapeHtml(field.labelZh)}</b><img src="${field.value}" alt=""></span>`
        : `<span><b>${escapeHtml(field.labelEn)} / ${escapeHtml(field.labelZh)}:</b> ${escapeHtml(field.value)}</span>`).join("")}</div>
    </div>`;
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
        ${renderCompanyContactPreview()}
      </section>
      <section class="preview-top">
        <div><h2>Quotation<br><small>报价单</small></h2><p>${escapeHtml(settings.businessLineEn)}<br>${escapeHtml(settings.businessLineZh)}</p></div>
        <div class="preview-meta"><p>Quotation No. / 报价编号：${escapeHtml(currentQuote.quoteNumber)}</p><p>Date / 日期：${escapeHtml(currentQuote.quoteDate)}</p><p>Valid Until / 有效期：${escapeHtml(currentQuote.validUntil)}</p></div>
      </section>
      <section class="preview-panel"><h3>Customer Information / 客户信息</h3><div class="preview-fields"><p>Company / 公司：${escapeHtml(currentQuote.buyer.company)}</p><p>Country / 国家：${escapeHtml(currentQuote.buyer.country)}</p><p>Contact / 负责人：${escapeHtml(currentQuote.buyer.contact)}</p><p>Phone / 电话：${escapeHtml(currentQuote.buyer.phone)}</p><p>Email / 邮箱：${escapeHtml(currentQuote.buyer.email)}</p><p>Address / 地址：${escapeHtml(currentQuote.buyer.address)}</p></div></section>
      <section class="preview-panel"><h3>Quotation Items / 报价明细</h3><table><thead><tr>${renderQuotePreviewHead()}</tr></thead><tbody>${renderQuotePreviewRows()}</tbody></table>${visibleQuoteField("totalAmount") ? `<div class="preview-total">Total / 总金额：${money(total(), settings.currency)}</div>` : ""}</section>
      ${showProductPhotos && currentQuote.items.some(i => i.imageDataUrl) ? `<section class="preview-panel"><h3>Product Photos / 产品图片</h3><div class="photo-grid">${currentQuote.items.filter(i => i.imageDataUrl).map(i => `<article class="photo-card"><img src="${i.imageDataUrl}"><div>${escapeHtml(i.values.brand || "")} ${escapeHtml(i.values.model || "")}</div></article>`).join("")}</div></section>` : ""}
      ${visibleTermFields.length || settings.stampDataUrl ? `<section class="preview-panel terms-panel"><div class="terms-content"><h3>Terms / 条款</h3>${visibleTermFields.map((field) => `<p>${escapeHtml(field.en)} / ${escapeHtml(field.zh)}：${escapeHtml(displayTermValue(field))}</p>`).join("")}</div>${settings.stampDataUrl ? `<div class="stamp-box"><img src="${settings.stampDataUrl}" alt="Company Stamp"><span>Company Stamp / 公司公章</span></div>` : ""}</section>` : ""}
    `;
  }

  async function saveQuote() {
    renderPreview();
    const idx = quotes.findIndex((q) => q.id === currentQuote.id);
    if (idx >= 0) quotes[idx] = structuredClone(currentQuote);
    else quotes.unshift(structuredClone(currentQuote));
    save(keys.quotes, quotes);
    if (currentUser) {
      const apiItems = (currentQuote.items || []).map((item) => {
        const qty = Number(item.values.qty || 0);
        const unitPrice = Number(item.values.unitPrice || 0);
        const freightSnapshot = item.freightSnapshot || null;
        return {
          id: item.id,
          productId: item.values.productId || "",
          productSnapshot: {
            productId: item.values.productId || "",
            productName: `${item.values.brand || ""} ${item.values.model || ""}`.trim(),
            machineCategory: item.values.productType || "",
            brand: item.values.brand || "",
            model: item.values.model || "",
            transportCbm: freightSnapshot?.transportCbm || item.values.transportCbm || ""
          },
          priceSnapshot: {
            quantity: qty,
            unitPrice,
            currency: item.values.currency || settings.currency,
            values: item.values
          },
          machineAmount: qty * unitPrice,
          freightSnapshot,
          includeFreightInTotal: true
        };
      });
      await api("/api/quotations", {
        method: "POST",
        body: JSON.stringify({
          id: currentQuote.id,
          quoteNumber: currentQuote.quoteNumber,
          status: currentQuote.status,
          buyer: currentQuote.buyer,
          terms: currentQuote.terms,
          quoteDate: currentQuote.quoteDate,
          validUntil: currentQuote.validUntil,
          settingsSnapshot: settings,
          showFreightDetailInPdf: !!currentQuote.showFreightDetailInPdf,
          items: apiItems
        })
      });
    }
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
    $("history-list").innerHTML = list.map((q) => `<article class="list-item"><div><b>${escapeHtml(q.quoteNumber)}</b><p>${escapeHtml(q.buyer.company)} | ${escapeHtml(q.buyer.country)} | ${escapeHtml(q.quoteDate)} | ${escapeHtml(q.status)}</p><p>${q.items.length} products | ${money(quoteTotal(q), settings.currency)}</p></div><div class="actions"><button onclick="window.quoteApp.editQuote('${q.id}')">查看/编辑</button><button onclick="window.quoteApp.copyQuote('${q.id}')">复制为新报价</button><button onclick="window.quoteApp.deleteQuote('${q.id}')">删除</button><button onclick="window.quoteApp.editQuote('${q.id}'); setTimeout(()=>window.print(),200)">重新导出PDF</button></div></article>`).join("") || `<p class="empty">暂无历史报价。</p>`;
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));
    document.querySelectorAll("[data-view-target]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.viewTarget)));
    $("login-btn").addEventListener("click", () => login($("login-username").value.trim(), $("login-password").value));
    $("logout-btn").addEventListener("click", logout);
    $("sidebar-toggle-btn").addEventListener("click", toggleSidebar);
    document.querySelectorAll(".settings-tab").forEach((button) => {
      button.addEventListener("click", () => showSettingsSection(button.dataset.settingsSection));
    });
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
    $("backup-db-btn").addEventListener("click", backupDatabase);
    $("restore-db-btn").addEventListener("click", restoreDatabase);
    $("export-data-btn").addEventListener("click", exportAllData);
    $("import-data-btn").addEventListener("click", importData);
    $("open-data-dir-btn").addEventListener("click", openDataFolder);
    $("logo-input").addEventListener("change", e => updateSettingsAsset(e.target, "logoDataUrl", "Logo uploaded. / Logo 已上传。"));
    $("background-input").addEventListener("change", e => updateSettingsAsset(e.target, "backgroundDataUrl", "Background uploaded. / 背景图已上传。"));
    $("stamp-input").addEventListener("change", e => updateSettingsAsset(e.target, "stampDataUrl", "Electronic seal uploaded. / 电子公章已上传。"));
    $("remove-logo-btn").addEventListener("click", () => clearSettingsAsset("logoDataUrl", "Logo removed. / Logo 已删除。"));
    $("reset-background-btn").addEventListener("click", () => clearSettingsAsset("backgroundDataUrl", "Default background restored. / 已恢复默认背景。"));
    $("remove-stamp-btn").addEventListener("click", () => clearSettingsAsset("stampDataUrl", "Electronic seal removed. / 电子公章已删除。"));
    $("product-image").addEventListener("change", async e => { const data = await normalizeImage(e.target.files[0]); $("product-image-preview").src = data; $("product-image-preview").dataset.image = data; });
    $("save-product-btn").addEventListener("click", saveProduct);
    $("clear-product-btn").addEventListener("click", clearProductForm);
    $("price-import-file").addEventListener("change", async e => loadPriceImportFile(e.target.files[0]));
    $("import-price-btn").addEventListener("click", importPriceList);
    $("clear-import-text-btn").addEventListener("click", () => { $("price-import-text").value = ""; $("price-import-result").textContent = ""; });
    $("product-search").addEventListener("input", renderProducts);
    $("add-quote-item-btn").addEventListener("click", addQuoteItemByType);
    $("quote-template").addEventListener("change", () => { collectQuoteFromForm(); currentQuote.items = []; renderQuoteTerms(); renderQuoteItems(); renderPreview(); });
    $("quote-items").addEventListener("input", renderPreview);
    $("quote-items").addEventListener("change", async e => { if (e.target.matches(".quote-image-input")) { const img = await normalizeImage(e.target.files[0]); const prev = e.target.closest(".quote-item").querySelector("[data-image]"); if (prev) { prev.src = img; prev.dataset.image = img; } renderPreview(); } });
    $("quote-items").addEventListener("click", e => { if (e.target.matches(".remove-quote-item")) { e.target.closest(".quote-item").remove(); renderPreview(); } });
    $("preview-quote-btn").addEventListener("click", renderPreview);
    $("quote-terms").addEventListener("change", (event) => {
      if (event.target.matches("[data-trade-term]")) {
        const desc = event.target.closest("label")?.querySelector(".term-desc");
        if (desc) desc.textContent = tradeDescription(event.target.value);
      }
      renderPreview();
    });
    $("save-quote-btn").addEventListener("click", saveQuote);
    $("export-pdf-btn").addEventListener("click", exportPdf);
    $("new-quote-btn").addEventListener("click", newQuote);
    $("history-search-btn").addEventListener("click", renderHistory);
    $("refresh-ports-btn").addEventListener("click", renderPorts);
    $("save-port-btn").addEventListener("click", savePort);
    $("clear-port-btn").addEventListener("click", clearPortForm);
    $("port-list").addEventListener("click", handlePortAction);
    $("refresh-freight-btn").addEventListener("click", renderFreightRates);
    $("save-freight-btn").addEventListener("click", saveFreightRate);
    $("clear-freight-btn").addEventListener("click", clearFreightForm);
    $("freight-list").addEventListener("click", handleFreightAction);
    $("calc-product").addEventListener("change", () => {
      const product = products.find((p) => p.id === $("calc-product").value);
      $("calc-cbm").value = product?.transportCbm || "";
      $("calc-method").value = product?.transportMethod || "Bulk Cargo";
    });
    $("auto-calc-freight-btn").addEventListener("click", autoCalculateFreight);
    $("copy-freight-amount-btn").addEventListener("click", copyFreightAmount);
    $("use-freight-in-quote-btn").addEventListener("click", useFreightInQuotation);
    document.addEventListener("click", (event) => {
      if (event.target.id === "save-user-btn") saveUser();
      if (event.target.id === "clear-user-btn") clearUserForm();
      if (event.target.id === "add-term-field-proxy-btn") openFieldModal(-1, "terms");
      if (event.target.id === "add-contact-field-btn") addContactField();
      if (event.target.matches("[data-contact-action], [data-contact-visible]")) handleContactFieldAction(event);
      if (event.target.matches(".reset-user-password, .toggle-user-status, .delete-user")) handleUserAction(event);
    });
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-contact-image]")) handleContactImageChange(event);
      if (event.target.matches("#contact-field-list input, #contact-field-list select")) collectContactFields();
    });
  }

  async function init() {
    $("login-username").value = "";
    $("login-password").value = "";
    bindEvents();
    applySidebarState();
    migrateDefaultCostFields();
    renderAllSelectors();
    renderSettings();
    renderProducts();
    newQuote();
    await checkLogin();
    applyAuthLock();
  }

  window.quoteApp = { editProduct, deleteProduct, editQuote, copyQuote, deleteQuote };
  init();
})();

