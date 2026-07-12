(function () {
  const keys = {
    settings: "quote_assistant_v01_settings",
    products: "quote_assistant_v01_products",
    quotes: "quote_assistant_v01_quotes",
    sidebarCollapsed: "quote_assistant_sidebar_collapsed",
    settingsSection: "quote_assistant_settings_section",
    stateUpdatedAt: "quote_assistant_state_updated_at",
    quoteSequence: "quote_assistant_quote_sequence"
  };
  const defaultBg = "./assets/company-background.png";
  const defaultTermFields = [
    f("付款方式", "Payment Ratio", "payment", "select", false, true, 10),
    f("交货时间", "Delivery Time", "deliveryTime", "text", false, true, 20),
    f("贸易方式", "Trade Term", "shipping", "select", false, true, 30),
    f("起运港", "Origin Port", "originPort", "select", false, true, 35),
    f("目的港", "Destination Port", "port", "select", false, true, 40),
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
        f("货币单位", "Currency", "currency", "select", true, true, 100),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 110),
        f("产品图片", "Product Image", "productImage", "image", false, true, 120)
      ],
      termFields: defaultTermFields
    }
  ];

  const defaultCostTemplates = {
    freight: {
      name: "Sea Freight / 海运费",
      fields: [
        f("费用类型", "Charge Type", "productType", "text", false, true, 10),
        f("运输产品", "Related Product", "itemName", "text", false, true, 20),
        f("起运港", "Origin Port", "originPort", "text", false, true, 30),
        f("目的港", "Destination Port", "destinationPort", "text", false, true, 40),
        f("运输时间", "Transit Time", "transitTime", "text", false, true, 50),
        f("路线说明", "Route Remark", "description", "text", false, true, 60),
        f("数量", "Quantity", "qty", "number", true, true, 70),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 80),
        f("货币", "Currency", "currency", "select", true, true, 90),
        f("备注", "Remark", "remark", "textarea", false, true, 100)
      ]
    },
    trucking: {
      name: "Inland Trucking / 陆路运输费",
      fields: [
        f("费用类型", "Charge Type", "productType", "text", false, true, 10),
        f("运输产品", "Related Product", "itemName", "text", false, true, 20),
        f("起点", "From", "originPort", "text", false, true, 30),
        f("终点", "To", "destinationPort", "text", false, true, 40),
        f("运输时间", "Transit Time", "transitTime", "text", false, false, 50),
        f("路线说明", "Route Remark", "description", "text", false, true, 60),
        f("数量", "Quantity", "qty", "number", true, true, 70),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 80),
        f("货币", "Currency", "currency", "select", true, true, 90),
        f("备注", "Remark", "remark", "textarea", false, true, 100)
      ]
    },
    custom: {
      name: "Custom Row / 自定义行",
      fields: [
        f("产品类型", "Product Type", "productType", "text", false, true, 10),
        f("品牌", "Brand", "brand", "text", false, true, 20),
        f("型号", "Model", "model", "text", false, true, 30),
        f("年份", "Year", "year", "text", false, true, 40),
        f("工时", "Working Hours", "hours", "text", false, true, 50),
        f("数量", "Quantity", "qty", "number", true, true, 60),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 70),
        f("货币", "Currency", "currency", "select", true, true, 80),
        f("备注", "Remark", "remark", "textarea", false, true, 90)
      ]
    }
  };

  const defaultQuoteLineColumns = [
    { key: "tradeTerm", labelZh: "贸易条款", labelEn: "Trade Term", type: "tradeTerm", visible: true, required: false, system: true, sortOrder: 10 },
    { key: "description", labelZh: "商品信息 / 产品描述", labelEn: "Product Description", type: "textarea", visible: true, required: true, system: true, sortOrder: 20 },
    { key: "qty", labelZh: "数量", labelEn: "Qty", type: "number", visible: true, required: true, system: true, sortOrder: 30 },
    { key: "unitPrice", labelZh: "单价", labelEn: "Unit Price", type: "money", visible: true, required: true, system: true, sortOrder: 40 },
    { key: "currency", labelZh: "币种", labelEn: "Currency", type: "currency", visible: true, required: true, system: true, sortOrder: 50 },
    { key: "amount", labelZh: "总价", labelEn: "Amount", type: "calculated", visible: true, required: false, system: true, sortOrder: 60 },
    { key: "image", labelZh: "图片", labelEn: "Image", type: "image", visible: false, required: false, system: true, sortOrder: 70 },
    { key: "remark", labelZh: "备注", labelEn: "Remark", type: "text", visible: true, required: false, system: true, sortOrder: 80 }
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
    bankFields: [
      { id: "bank-transfer-title", labelEn: "Payment Terms", labelZh: "付款条款", value: "T/T 100%", visible: true, sortOrder: 10 },
      { id: "bank-pay-to", labelEn: "Please make a SWIFT(T/T) Payment of", labelZh: "请通过 SWIFT(T/T) 付款至", value: "", visible: true, sortOrder: 20 },
      { id: "bank-account-number", labelEn: "Account Number", labelZh: "银行账号", value: "79969931082731", visible: true, sortOrder: 30 },
      { id: "bank-account-name", labelEn: "Account Name", labelZh: "账户名称", value: "Hefei Jinwanwa International Trade Co., Ltd.", visible: true, sortOrder: 40 },
      { id: "bank-name", labelEn: "Bank Name", labelZh: "银行名称", value: "DBS Bank (Hong Kong) Limited", visible: true, sortOrder: 50 },
      { id: "bank-swift", labelEn: "SWIFT/BIC Code", labelZh: "SWIFT/BIC 代码", value: "DHBKHKHH (DHBKHKHHXXX for 11-character requirement)", visible: true, sortOrder: 60 },
      { id: "bank-branch", labelEn: "Branch Code", labelZh: "分行代码", value: "478", visible: true, sortOrder: 70 },
      { id: "bank-address", labelEn: "Bank Address", labelZh: "银行地址", value: "11th Floor, The Center, 99 Queen's Road Central, Central, Hong Kong", visible: true, sortOrder: 80 },
      { id: "bank-country", labelEn: "Country/Region", labelZh: "国家/地区", value: "Hong Kong (China)", visible: true, sortOrder: 90 },
      { id: "bank-account-type", labelEn: "Account Type", labelZh: "账户类型", value: "Business Account", visible: true, sortOrder: 100 },
      { id: "bank-payment-method", labelEn: "Payment Method Notes", labelZh: "付款方式备注", value: "For the payment of goods, please make a SWIFT(T/T) or CHATS(HK Local Payment) payment.", visible: true, sortOrder: 110 },
      { id: "bank-note", labelEn: "Notes", labelZh: "备注", value: "Please include [Buyer's Name, Invoice/Contract Number, and Product Name] in the memo or note section when making the payment. The deposit is non-refundable.", visible: true, sortOrder: 120 }
    ],
    paymentQrFields: [
      { id: "qr-wechat-pay", labelEn: "WeChat Pay QR Code", labelZh: "微信收款码", value: "", visible: true, sortOrder: 10 },
      { id: "qr-alipay", labelEn: "Alipay QR Code", labelZh: "支付宝收款码", value: "", visible: true, sortOrder: 20 }
    ],
    quoteStyle: "business",
    showQuoteNumberInPdf: true,
    showQuoteDateInPdf: true,
    showValidUntilInPdfTop: true,
    showValidityRangeInPdfBottom: true,
    validityRangeLabelEn: "Quotation Validity",
    validityRangeLabelZh: "报价有效期",
    quoteLineColumns: defaultQuoteLineColumns,
    currencies: ["USD", "EUR", "GBP", "CNY", "RUB", "AED", "SAR", "JPY", "AUD", "CAD"],
    tradeTerms: ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"],
    logoDataUrl: "",
    backgroundDataUrl: "",
    stampDataUrl: "",
    costFieldsMigratedV1: false,
    costTemplates: defaultCostTemplates,
    categories: [
      { id: "cat-used-excavator", labelEn: "Used Excavator", labelZh: "二手挖掘机", parentId: "", visible: true, sortOrder: 10 },
      { id: "cat-used-loader", labelEn: "Used Loader", labelZh: "二手装载机", parentId: "", visible: true, sortOrder: 20 },
      { id: "cat-used-dozer", labelEn: "Used Bulldozer", labelZh: "二手推土机", parentId: "", visible: true, sortOrder: 30 },
      { id: "cat-freight", labelEn: "Freight", labelZh: "运费", parentId: "", visible: true, sortOrder: 100 },
      { id: "cat-sea-freight", labelEn: "Sea Freight by Machine", labelZh: "单机海运费", parentId: "cat-freight", visible: true, sortOrder: 110 },
      { id: "cat-combined-freight", labelEn: "Combined Sea Freight", labelZh: "合并海运费", parentId: "cat-freight", visible: true, sortOrder: 120 },
      { id: "cat-trucking", labelEn: "Inland Trucking", labelZh: "陆路运输费", parentId: "", visible: true, sortOrder: 200 },
      { id: "cat-yard-to-port", labelEn: "Yard to Port Trucking", labelZh: "场地到港口拖车费", parentId: "cat-trucking", visible: true, sortOrder: 210 },
      { id: "cat-custom", labelEn: "Custom Charge", labelZh: "自定义费用", parentId: "", visible: true, sortOrder: 300 }
    ],
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
  let stateBackupTimer = null;
  let restoringPersistentState = false;
  let activeSettingsSection = localStorage.getItem(keys.settingsSection) || "company";
  const portRegionOrder = [
    "China / 中国",
    "Africa / 非洲",
    "Europe / 欧洲",
    "South America / 南美洲",
    "North America / 北美洲",
    "Middle East / 中东",
    "Asia / 亚洲",
    "Oceania / 大洋洲",
    "Other / 其他"
  ];
  const portRegionByCountry = {
    China: "China / 中国",
    "Hong Kong": "China / 中国",
    Nigeria: "Africa / 非洲",
    Ghana: "Africa / 非洲",
    "Cote d'Ivoire": "Africa / 非洲",
    Senegal: "Africa / 非洲",
    Togo: "Africa / 非洲",
    Benin: "Africa / 非洲",
    Guinea: "Africa / 非洲",
    "Sierra Leone": "Africa / 非洲",
    Liberia: "Africa / 非洲",
    Tanzania: "Africa / 非洲",
    Kenya: "Africa / 非洲",
    Djibouti: "Africa / 非洲",
    Somaliland: "Africa / 非洲",
    Somalia: "Africa / 非洲",
    Mozambique: "Africa / 非洲",
    "South Africa": "Africa / 非洲",
    Namibia: "Africa / 非洲",
    Angola: "Africa / 非洲",
    Egypt: "Africa / 非洲",
    Morocco: "Africa / 非洲",
    Algeria: "Africa / 非洲",
    Tunisia: "Africa / 非洲",
    Sudan: "Africa / 非洲",
    Netherlands: "Europe / 欧洲",
    Germany: "Europe / 欧洲",
    Belgium: "Europe / 欧洲",
    "United Kingdom": "Europe / 欧洲",
    Italy: "Europe / 欧洲",
    Greece: "Europe / 欧洲",
    Spain: "Europe / 欧洲",
    Brazil: "South America / 南美洲",
    Argentina: "South America / 南美洲",
    Peru: "South America / 南美洲",
    Chile: "South America / 南美洲",
    Colombia: "South America / 南美洲",
    "United States": "North America / 北美洲",
    Canada: "North America / 北美洲",
    Mexico: "North America / 北美洲",
    "United Arab Emirates": "Middle East / 中东",
    "Saudi Arabia": "Middle East / 中东",
    Qatar: "Middle East / 中东",
    Singapore: "Asia / 亚洲",
    Malaysia: "Asia / 亚洲",
    Thailand: "Asia / 亚洲",
    Indonesia: "Asia / 亚洲",
    Philippines: "Asia / 亚洲",
    Vietnam: "Asia / 亚洲",
    Bangladesh: "Asia / 亚洲",
    India: "Asia / 亚洲",
    Pakistan: "Asia / 亚洲",
    Australia: "Oceania / 大洋洲",
    "New Zealand": "Oceania / 大洋洲"
  };
  const countryOptions = [
    ["Tanzania", "坦桑尼亚"], ["Zimbabwe", "津巴布韦"], ["Zambia", "赞比亚"], ["Nigeria", "尼日利亚"], ["Kenya", "肯尼亚"],
    ["Ghana", "加纳"], ["Mozambique", "莫桑比克"], ["South Africa", "南非"], ["Angola", "安哥拉"], ["Egypt", "埃及"],
    ["Ethiopia", "埃塞俄比亚"], ["Uganda", "乌干达"], ["Rwanda", "卢旺达"], ["Burundi", "布隆迪"], ["Malawi", "马拉维"],
    ["Congo", "刚果"], ["DR Congo", "刚果（金）"], ["Cameroon", "喀麦隆"], ["Senegal", "塞内加尔"], ["Cote d'Ivoire", "科特迪瓦"],
    ["Brazil", "巴西"], ["Argentina", "阿根廷"], ["Chile", "智利"], ["Peru", "秘鲁"], ["Colombia", "哥伦比亚"],
    ["United States", "美国"], ["Canada", "加拿大"], ["Mexico", "墨西哥"], ["United Kingdom", "英国"], ["Germany", "德国"],
    ["France", "法国"], ["Netherlands", "荷兰"], ["Belgium", "比利时"], ["Spain", "西班牙"], ["Italy", "意大利"],
    ["United Arab Emirates", "阿联酋"], ["Saudi Arabia", "沙特阿拉伯"], ["Qatar", "卡塔尔"], ["Oman", "阿曼"], ["Kuwait", "科威特"],
    ["India", "印度"], ["Pakistan", "巴基斯坦"], ["Bangladesh", "孟加拉国"], ["Vietnam", "越南"], ["Thailand", "泰国"],
    ["Malaysia", "马来西亚"], ["Singapore", "新加坡"], ["Indonesia", "印度尼西亚"], ["Philippines", "菲律宾"], ["Australia", "澳大利亚"],
    ["New Zealand", "新西兰"], ["China", "中国"]
  ];
  const countryDialCodes = {
    zambia: "+260",
    赞比亚: "+260",
    tanzania: "+255",
    坦桑尼亚: "+255",
    zimbabwe: "+263",
    津巴布韦: "+263",
    kenya: "+254",
    肯尼亚: "+254",
    nigeria: "+234",
    尼日利亚: "+234",
    ghana: "+233",
    加纳: "+233",
    mozambique: "+258",
    莫桑比克: "+258",
    "southafrica": "+27",
    南非: "+27",
    uganda: "+256",
    乌干达: "+256",
    rwanda: "+250",
    卢旺达: "+250",
    burundi: "+257",
    布隆迪: "+257",
    malawi: "+265",
    马拉维: "+265",
    ethiopia: "+251",
    埃塞俄比亚: "+251",
    cameroon: "+237",
    喀麦隆: "+237",
    senegal: "+221",
    塞内加尔: "+221",
    angola: "+244",
    安哥拉: "+244"
  };

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
    if ([keys.settings, keys.products, keys.quotes].includes(key)) {
      localStorage.setItem(keys.stateUpdatedAt, new Date().toISOString());
      schedulePersistentStateBackup();
    }
  }

  function localStatePayload() {
    return {
      settings,
      products,
      quotes,
      updatedAt: localStorage.getItem(keys.stateUpdatedAt) || ""
    };
  }

  function hasLocalUserData() {
    return !!localStorage.getItem(keys.settings)
      || (Array.isArray(products) && products.length > 0)
      || (Array.isArray(quotes) && quotes.length > 0);
  }

  function applyPersistentState(state) {
    if (!state) return;
    restoringPersistentState = true;
    if (state.settings) {
      settings = { ...structuredClone(defaultSettings), ...state.settings };
      localStorage.setItem(keys.settings, JSON.stringify(settings));
    }
    if (Array.isArray(state.products)) {
      products = state.products;
      localStorage.setItem(keys.products, JSON.stringify(products));
    }
    if (Array.isArray(state.quotes)) {
      quotes = state.quotes;
      localStorage.setItem(keys.quotes, JSON.stringify(quotes));
    }
    if (state.updatedAt) localStorage.setItem(keys.stateUpdatedAt, state.updatedAt);
    restoringPersistentState = false;
  }

  function schedulePersistentStateBackup() {
    if (!currentUser || restoringPersistentState) return;
    clearTimeout(stateBackupTimer);
    stateBackupTimer = setTimeout(backupPersistentState, 800);
  }

  async function backupPersistentState() {
    if (!currentUser) return;
    try {
      await api("/api/system/browser-state", {
        method: "PUT",
        body: JSON.stringify(localStatePayload())
      });
    } catch (error) {
      console.warn("Local data backup failed", error);
    }
  }

  async function restorePersistentStateIfNeeded() {
    if (!currentUser) return;
    try {
      const data = await api("/api/system/browser-state");
      if (data.exists && data.state && !hasLocalUserData()) {
        applyPersistentState(data.state);
        renderAllSelectors();
        renderSettings();
        renderProducts();
        renderHistory();
        toast("已从本机数据目录恢复产品库、设置和历史报价。");
        return;
      }
      await backupPersistentState();
    } catch (error) {
      console.warn("Local data restore failed", error);
    }
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

  function displayMode() {
    return currentQuote?.pdfLanguage || $("pdf-language")?.value || "bilingual";
  }

  function labelText(en, zh, mode = displayMode()) {
    if (mode === "en") return en;
    if (mode === "zh") return zh;
    return `${en} / ${zh}`;
  }

  function labelHtml(en, zh, mode = displayMode()) {
    if (mode === "en") return escapeHtml(en);
    if (mode === "zh") return escapeHtml(zh);
    return `${escapeHtml(en)}<small>${escapeHtml(zh)}</small>`;
  }

  function localizedText(en, zh, separator = " | ") {
    const mode = displayMode();
    if (mode === "en") return en || "";
    if (mode === "zh") return zh || "";
    return [en, zh].filter(Boolean).join(separator);
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
    await restorePersistentStateIfNeeded();
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
    $("login-status").textContent = currentUser ? `${currentUser.username} / ${currentUser.role}` : "未登录";
    $("login-btn").hidden = !!currentUser;
    $("login-box").hidden = !!currentUser;
    $("user-info-box").hidden = !currentUser;
    if (currentUser) {
      $("user-info-name").textContent = currentUser.username || "-";
      $("user-info-id").textContent = `ID: ${currentUser.id || "-"}`;
      $("user-info-role").textContent = `权限编号: ${currentUser.role || "user"}`;
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
      $("login-status").textContent = "未登录";
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
      if (currentUser) {
        await restorePersistentStateIfNeeded();
        await loadServerData();
      }
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

  function quoteDateKey(date = today()) {
    return String(date || today()).replaceAll("-", "");
  }

  function nextQuoteNumber(date = today(), advance = false) {
    const key = quoteDateKey(date);
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(keys.quoteSequence) || "{}");
    } catch {
      data = {};
    }
    const sameDayQuotes = quotes
      .map((quote) => String(quote.quoteNumber || "").match(new RegExp(`QA-${key}-(\\d+)$`)))
      .filter(Boolean)
      .map((match) => Number(match[1] || 0));
    const currentSeq = Math.max(Number(data[key] || 0), ...sameDayQuotes, 0);
    const seq = advance ? currentSeq + 1 : Math.max(currentSeq, 1);
    if (advance) {
      data[key] = seq;
      localStorage.setItem(keys.quoteSequence, JSON.stringify(data));
    }
    return `QA-${key}-${String(seq).padStart(3, "0")}`;
  }

  function syncQuoteSequenceFromNumber(number) {
    const match = String(number || "").match(/^QA-(\d{8})-(\d+)$/);
    if (!match) return;
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(keys.quoteSequence) || "{}");
    } catch {
      data = {};
    }
    data[match[1]] = Math.max(Number(data[match[1]] || 0), Number(match[2] || 0));
    localStorage.setItem(keys.quoteSequence, JSON.stringify(data));
  }

  function safeFilePart(value, fallback = "客户") {
    const cleaned = String(value || "")
      .trim()
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 80);
    return cleaned || fallback;
  }

  function currentPdfFileName() {
    collectQuoteFromForm();
    const date = currentQuote.quoteDate || today();
    const customer = safeFilePart(currentQuote.buyer?.company || currentQuote.buyer?.contact || "客户");
    return `${date} ${customer} ${currentQuote.quoteNumber || "Quotation"}.pdf`;
  }

  function applyPrintTitle() {
    if (!currentQuote) return;
    document.title = currentPdfFileName().replace(/\.pdf$/i, "");
  }

  function money(amount, currency) {
    return `${currency || settings.currency || "USD"} ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const paymentOptions = [
    { value: "30/70", label: "30/70 - 30% deposit, 70% before shipment / 3/7付款" },
    { value: "40/60", label: "40/60 - 40% deposit, 60% before shipment / 4/6付款" },
    { value: "100%", label: "100% before shipment / 百分百付款" }
  ];

  function normalizeTradeTerms() {
    const fallback = defaultSettings.tradeTerms || ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];
    const list = Array.isArray(settings.tradeTerms) && settings.tradeTerms.length ? settings.tradeTerms : fallback;
    settings.tradeTerms = [...new Set(list.map((item) => String(item || "").trim().toUpperCase()).filter(Boolean))];
    if (!settings.tradeTerms.length) settings.tradeTerms = [...fallback];
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
    if (activeSettingsSection === "quote-fields") activeSettingsSection = "company";
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
    const termFields = (tpl.termFields || defaultTermFields).map(normalizeField).sort((a, b) => a.sortOrder - b.sortOrder);
    if (!termFields.some((field) => field.fieldKey === "originPort")) {
      termFields.splice(Math.max(0, termFields.findIndex((field) => field.fieldKey === "port")), 0, f("起运港", "Origin Port", "originPort", "select", false, true, 35));
    }
    termFields.forEach((field) => {
      if (field.fieldKey === "port") {
        field.zh = field.zh || "目的港";
        field.en = field.en || "Destination Port";
        field.fieldType = "select";
      }
      if (field.fieldKey === "originPort") field.fieldType = "select";
    });
    return {
      name: tpl.name,
      desc: tpl.desc || "",
      fields: (tpl.fields || [])
        .map(normalizeField)
        .filter((field) => !["freight", "truckingToPort"].includes(field.fieldKey))
        .sort((a, b) => a.sortOrder - b.sortOrder),
      termFields: termFields.sort((a, b) => a.sortOrder - b.sortOrder)
    };
  }

  function normalizeTemplates() {
    settings.templates = (settings.templates || defaultTemplates).map(normalizeTemplate);
  }

  function normalizeCostTemplates() {
    const current = settings.costTemplates || {};
    settings.costTemplates = {};
    ["freight", "trucking", "custom"].forEach((kind) => {
      const source = current[kind] || defaultCostTemplates[kind];
      settings.costTemplates[kind] = {
        name: source?.name || defaultCostTemplates[kind].name,
        fields: (source?.fields || defaultCostTemplates[kind].fields)
          .map(normalizeField)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      };
    });
  }

  function removeLegacyCostFields() {
    normalizeTemplates();
    settings.templates.forEach((tpl) => {
      tpl.fields = (tpl.fields || []).filter((field) => !["freight", "truckingToPort"].includes(field.fieldKey));
      resequenceFields(tpl.fields);
    });
    ensureDefaultCategory("cat-freight", "Freight", "运费", "");
    ensureDefaultCategory("cat-sea-freight", "Sea Freight by Machine", "单机海运费", "cat-freight");
    ensureDefaultCategory("cat-combined-freight", "Combined Sea Freight", "合并海运费", "cat-freight");
    ensureDefaultCategory("cat-trucking", "Inland Trucking", "陆路运输费", "");
    ensureDefaultCategory("cat-yard-to-port", "Yard to Port Trucking", "场地到港口拖车费", "cat-trucking");
    ensureDefaultCategory("cat-custom", "Custom Charge", "自定义费用", "");
    save(keys.settings, settings);
  }

  function categoryObject(item, index = 0) {
    if (typeof item === "string") {
      const name = item.trim();
      const map = {
        "挖掘机": ["Used Excavator", "二手挖掘机"],
        "装载机": ["Used Loader", "二手装载机"],
        "推土机": ["Used Bulldozer", "二手推土机"],
        "压路机": ["Used Road Roller", "二手压路机"],
        "平地机": ["Used Motor Grader", "二手平地机"],
        "自卸车": ["Used Dump Truck", "二手自卸车"],
        "叉车": ["Used Forklift", "二手叉车"],
        "TLB": ["Used TLB", "二手 TLB"],
        "海运费": ["Sea Freight by Machine", "单机海运费"],
        "陆路运输费": ["Yard to Port Trucking", "场地到港口拖车费"],
        "自定义费用": ["Custom Charge", "自定义费用"]
      };
      const mapped = map[name] || [name, name];
      const parentId = ["海运费"].includes(name) ? "cat-freight" : (["陆路运输费"].includes(name) ? "cat-trucking" : "");
      return { id: uid("cat"), labelEn: mapped[0], labelZh: mapped[1], parentId, visible: true, sortOrder: (index + 1) * 10 };
    }
    return {
      id: item?.id || uid("cat"),
      labelEn: item?.labelEn || item?.en || item?.name || item?.labelZh || "Category",
      labelZh: item?.labelZh || item?.zh || item?.name || item?.labelEn || "分类",
      parentId: item?.parentId || "",
      visible: item?.visible !== false,
      sortOrder: Number(item?.sortOrder || (index + 1) * 10)
    };
  }

  function categoryLabel(category) {
    const item = typeof category === "string" ? categoryObject(category) : category;
    return `${item.labelEn} / ${item.labelZh}`;
  }

  function categoryFullLabel(category) {
    const item = typeof category === "string" ? categoryObject(category) : category;
    const parent = settings.categories?.find((cat) => cat.id === item.parentId);
    return parent ? `${categoryLabel(parent)} > ${categoryLabel(item)}` : categoryLabel(item);
  }

  function ensureDefaultCategory(id, labelEn, labelZh, parentId = "") {
    normalizeCategories();
    const existing = settings.categories.find((cat) => cat.id === id || cat.labelZh === labelZh || cat.labelEn === labelEn);
    if (existing) {
      existing.id = id;
      existing.labelEn = labelEn;
      existing.labelZh = labelZh;
      existing.parentId = parentId;
      return;
    }
    settings.categories.push({ id, labelEn, labelZh, parentId, visible: true, sortOrder: (settings.categories.length + 1) * 10 });
  }

  function normalizeCategories() {
    const source = Array.isArray(settings.categories) && settings.categories.length
      ? settings.categories
      : defaultSettings.categories;
    settings.categories = source.map(categoryObject).filter((item) => item.labelEn || item.labelZh).sort((a, b) => a.sortOrder - b.sortOrder);
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
    const scale = Math.min(w / img.width, h / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const dx = (w - drawWidth) / 2;
    const dy = (h - drawHeight) / 2;
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, drawWidth, drawHeight);
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
    ensureBankFieldsPanel();
    ensureQuoteLineSettingsPanel();
    ensureTermsSettingsPanel();
    normalizeContactFields();
    normalizeBankFields();
    normalizePaymentQrFields();
    normalizeQuoteLineColumns();
    normalizeCurrencies();
    normalizeTradeTerms();
    normalizeTemplates();
    normalizeCostTemplates();
    normalizeCategories();
    document.querySelectorAll("[data-setting]").forEach((input) => {
      if (input.type === "checkbox") input.checked = settings[input.dataset.setting] !== false;
      else input.value = settings[input.dataset.setting] || "";
    });
    renderCategoryList();
    renderBankFields();
    renderPaymentQrFields();
    renderQuoteLineColumns();
    renderCurrencies();
    renderTradeTerms();
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
    document.querySelectorAll("[data-setting]").forEach((input) => {
      if (input.type === "checkbox") input.checked = settings[input.dataset.setting] !== false;
      else input.value = settings[input.dataset.setting] || "";
    });
  }

  function normalizeQuoteLineColumns() {
    const existing = Array.isArray(settings.quoteLineColumns) ? settings.quoteLineColumns : [];
    const byKey = new Map(existing.map((column) => [column.key, column]));
    settings.quoteLineColumns = defaultQuoteLineColumns.map((column) => ({
      ...column,
      ...(byKey.get(column.key) || {}),
      system: true
    }));
    existing.filter((column) => !defaultQuoteLineColumns.some((item) => item.key === column.key)).forEach((column) => {
      settings.quoteLineColumns.push({
        key: column.key || uid("col"),
        labelZh: column.labelZh || "自定义列",
        labelEn: column.labelEn || "Custom Field",
        type: column.type || "text",
        visible: column.visible !== false,
        required: !!column.required,
        system: false,
        sortOrder: Number(column.sortOrder || (settings.quoteLineColumns.length + 1) * 10)
      });
    });
    settings.quoteLineColumns.sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }

  function ensureQuoteLineSettingsPanel() {
    if ($("quote-line-settings-panel")) return;
    const panel = document.createElement("div");
    panel.id = "quote-line-settings-panel";
    panel.className = "panel";
    panel.dataset.settingsPanel = "quote-lines";
    panel.innerHTML = `
      <div class="row-head">
        <div>
          <h3>报价明细设置</h3>
          <p class="hint">这里控制报价明细表格的列名、显示隐藏、必填、排序和自定义列。图片列也可以在这里设置显示或必填。</p>
        </div>
        <button id="add-quote-line-column-btn" class="primary" type="button">新增列</button>
      </div>
      <table class="field-table">
        <thead>
          <tr>
            <th>排序</th>
            <th>中文列名</th>
            <th>英文列名</th>
            <th>字段</th>
            <th>类型</th>
            <th>显示</th>
            <th>必填</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody id="quote-line-column-list"></tbody>
      </table>
    `;
    const termsTabPanel = $("terms-settings-panel");
    if (termsTabPanel) termsTabPanel.before(panel);
    else document.querySelector(".sticky-actions")?.before(panel);
  }

  function renderQuoteLineColumns() {
    if (!$("quote-line-column-list")) return;
    normalizeQuoteLineColumns();
    $("quote-line-column-list").innerHTML = settings.quoteLineColumns.map((column, index) => `
      <tr data-quote-line-column="${index}">
        <td>${index + 1}</td>
        <td><input data-ql-prop="labelZh" value="${escapeHtml(column.labelZh)}" /></td>
        <td><input data-ql-prop="labelEn" value="${escapeHtml(column.labelEn)}" /></td>
        <td><code>${escapeHtml(column.key)}</code></td>
        <td>${escapeHtml(column.type)}</td>
        <td><input data-ql-prop="visible" type="checkbox"${column.visible !== false ? " checked" : ""} /></td>
        <td><input data-ql-prop="required" type="checkbox"${column.required ? " checked" : ""}${column.type === "calculated" ? " disabled" : ""} /></td>
        <td class="field-actions">
          <button data-ql-action="up" type="button">上移</button>
          <button data-ql-action="down" type="button">下移</button>
          <button data-ql-action="delete" type="button"${column.system ? " disabled" : ""}>删除</button>
        </td>
      </tr>
    `).join("");
  }

  function collectQuoteLineColumns() {
    if (!$("quote-line-column-list")) return;
    document.querySelectorAll("#quote-line-column-list tr[data-quote-line-column]").forEach((row) => {
      const column = settings.quoteLineColumns[Number(row.dataset.quoteLineColumn)];
      row.querySelectorAll("[data-ql-prop]").forEach((input) => {
        column[input.dataset.qlProp] = input.type === "checkbox" ? input.checked : input.value.trim();
      });
    });
  }

  function addQuoteLineColumn() {
    collectQuoteLineColumns();
    settings.quoteLineColumns.push({
      key: uid("custom").replaceAll("-", "_"),
      labelZh: "自定义列",
      labelEn: "Custom Field",
      type: "text",
      visible: true,
      required: false,
      system: false,
      sortOrder: (settings.quoteLineColumns.length + 1) * 10
    });
    save(keys.settings, settings);
    renderQuoteLineColumns();
    renderQuoteItems();
    renderPreview();
  }

  function handleQuoteLineColumnAction(event) {
    const row = event.target.closest("tr[data-quote-line-column]");
    if (!row) return;
    collectQuoteLineColumns();
    const index = Number(row.dataset.quoteLineColumn);
    const action = event.target.dataset.qlAction;
    if (action === "delete") {
      if (settings.quoteLineColumns[index]?.system) return;
      if (!confirm("确认删除这个报价明细列吗？")) return;
      settings.quoteLineColumns.splice(index, 1);
    }
    if (action === "up" && index > 0) {
      [settings.quoteLineColumns[index - 1], settings.quoteLineColumns[index]] = [settings.quoteLineColumns[index], settings.quoteLineColumns[index - 1]];
    }
    if (action === "down" && index < settings.quoteLineColumns.length - 1) {
      [settings.quoteLineColumns[index + 1], settings.quoteLineColumns[index]] = [settings.quoteLineColumns[index], settings.quoteLineColumns[index + 1]];
    }
    settings.quoteLineColumns.forEach((column, i) => column.sortOrder = (i + 1) * 10);
    save(keys.settings, settings);
    renderQuoteLineColumns();
    renderQuoteItems();
    renderPreview();
  }

  function normalizeContactFields() {
    const existing = Array.isArray(settings.contactFields) ? settings.contactFields : [];
    const legacy = [
      { id: "contact-person", labelEn: "Quotation Contact", labelZh: "报价负责人", type: "text", value: settings.contactPerson || "", visible: true, sortOrder: 5 },
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
    const contactPersonField = settings.contactFields.find((field) => field.id === "contact-person" || field.labelZh.includes("负责人") || normalize(field.labelEn).includes("quotationcontact"));
    if (!settings.contactFields.some((field) => field.id === "contact-person")) {
      settings.contactFields.unshift({ id: "contact-person", labelEn: "Quotation Contact", labelZh: "报价负责人", type: "text", value: settings.contactPerson || "", visible: true, sortOrder: 5 });
      settings.contactFields.forEach((field, index) => field.sortOrder = (index + 1) * 10);
    }
    if (contactPersonField && !contactPersonField.value && settings.contactPerson) contactPersonField.value = settings.contactPerson;
    if (phoneField && !phoneField.value && settings.companyPhone) phoneField.value = settings.companyPhone;
    if (emailField && !emailField.value && settings.companyEmail) emailField.value = settings.companyEmail;
  }

  function normalizeBankFields() {
    const existing = Array.isArray(settings.bankFields) ? settings.bankFields : [];
    const fallback = defaultSettings.bankFields || [];
    const looksLikeOldDefault = existing.length && existing.some((field) => field.id === "bank-beneficiary") && !existing.some((field) => field.id === "bank-account-number");
    const merged = existing.length && !looksLikeOldDefault ? existing : fallback;
    settings.bankFields = merged.map((field, index) => ({
      id: field.id || uid("bank"),
      labelEn: field.labelEn || "Bank Field",
      labelZh: field.labelZh || "银行字段",
      value: field.value || "",
      visible: field.visible !== false,
      sortOrder: Number(field.sortOrder || (index + 1) * 10)
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizePaymentQrFields() {
    const existing = Array.isArray(settings.paymentQrFields) ? settings.paymentQrFields : [];
    const fallback = defaultSettings.paymentQrFields || [];
    const merged = existing.length ? existing : fallback;
    settings.paymentQrFields = merged.map((field, index) => ({
      id: field.id || uid("qr"),
      labelEn: field.labelEn || "Payment QR Code",
      labelZh: field.labelZh || "收款码",
      value: field.value || "",
      visible: field.visible !== false,
      sortOrder: Number(field.sortOrder || (index + 1) * 10)
    })).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizeCurrencies() {
    const fallback = defaultSettings.currencies || ["USD"];
    const list = Array.isArray(settings.currencies) && settings.currencies.length ? settings.currencies : fallback;
    settings.currencies = [...new Set(list.map((item) => String(item || "").trim().toUpperCase()).filter(Boolean))];
    if (!settings.currencies.length) settings.currencies = [...fallback];
    if (!settings.currencies.includes(String(settings.currency || "USD").toUpperCase())) {
      settings.currencies.unshift(String(settings.currency || "USD").toUpperCase());
    }
    settings.currency = String(settings.currency || settings.currencies[0] || "USD").toUpperCase();
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

  function ensureBankFieldsPanel() {
    if ($("bank-fields-panel")) return;
    const panel = document.createElement("div");
    panel.id = "bank-fields-panel";
    panel.className = "panel";
    panel.dataset.settingsPanel = "company";
    panel.innerHTML = `
      <div class="row-head">
        <div>
          <h3>Bank Payment Information / 银行收款信息</h3>
          <p class="hint">Editable for different companies. Only visible rows will appear in PDF. / 适合不同公司自行维护，只有勾选显示的内容会出现在 PDF。</p>
        </div>
        <button id="add-bank-field-btn" type="button">Add / 新增</button>
      </div>
      <table class="field-table">
        <thead>
          <tr>
            <th>Sort / 排序</th>
            <th>English / 英文</th>
            <th>中文</th>
            <th>Value / 内容</th>
            <th>Show / 显示</th>
            <th>Actions / 操作</th>
          </tr>
        </thead>
        <tbody id="bank-field-list"></tbody>
      </table>
      <div class="row-head sub-row-head">
        <div>
          <h4>Payment QR Codes / 收款码</h4>
          <p class="hint">Upload, replace or delete WeChat Pay and Alipay QR codes. / 可上传、替换或删除微信、支付宝收款码。</p>
        </div>
      </div>
      <table class="field-table">
        <thead>
          <tr>
            <th>Sort / 排序</th>
            <th>English / 英文</th>
            <th>中文</th>
            <th>QR Code / 收款码</th>
            <th>Show / 显示</th>
            <th>Actions / 操作</th>
          </tr>
        </thead>
        <tbody id="payment-qr-list"></tbody>
      </table>
    `;
    $("contact-fields-panel")?.after(panel);
  }

  function renderPaymentQrFields() {
    if (!$("payment-qr-list")) return;
    normalizePaymentQrFields();
    $("payment-qr-list").innerHTML = settings.paymentQrFields.map((field, index) => `
      <tr data-qr-index="${index}">
        <td><span class="drag-handle">::</span>${index + 1}</td>
        <td><input data-qr-prop="labelEn" value="${escapeHtml(field.labelEn)}" /></td>
        <td><input data-qr-prop="labelZh" value="${escapeHtml(field.labelZh)}" /></td>
        <td>
          <label class="file-btn">Upload / 上传<input data-qr-image="${index}" type="file" accept="image/*" /></label>
          ${field.value ? `<button data-qr-action="clear" type="button">Delete Image / 删除图片</button><img class="contact-thumb" src="${field.value}" alt="">` : ""}
        </td>
        <td><input data-qr-visible type="checkbox"${field.visible ? " checked" : ""} /></td>
        <td class="field-actions">
          <button data-qr-action="up" type="button">Up / 上移</button>
          <button data-qr-action="down" type="button">Down / 下移</button>
        </td>
      </tr>
    `).join("");
  }

  function collectPaymentQrFields() {
    if (!$("payment-qr-list")) return;
    const rows = Array.from(document.querySelectorAll("#payment-qr-list tr[data-qr-index]"));
    rows.forEach((row, rowIndex) => {
      const field = settings.paymentQrFields[Number(row.dataset.qrIndex)];
      row.querySelectorAll("[data-qr-prop]").forEach((input) => {
        field[input.dataset.qrProp] = input.value;
      });
      field.visible = !!row.querySelector("[data-qr-visible]")?.checked;
      field.sortOrder = (rowIndex + 1) * 10;
    });
  }

  async function handlePaymentQrImageChange(event) {
    const input = event.target.closest("[data-qr-image]");
    if (!input) return;
    const index = Number(input.dataset.qrImage);
    collectSettingsDraft();
    settings.paymentQrFields[index].value = await fileToDataUrl(input.files[0]);
    input.value = "";
    renderPaymentQrFields();
  }

  function handlePaymentQrAction(event) {
    const row = event.target.closest("tr[data-qr-index]");
    if (!row) return;
    collectPaymentQrFields();
    const index = Number(row.dataset.qrIndex);
    const action = event.target.dataset.qrAction;
    if (event.target.matches("[data-qr-visible]")) {
      settings.paymentQrFields[index].visible = event.target.checked;
      return;
    }
    if (action === "clear") {
      settings.paymentQrFields[index].value = "";
    }
    if (action === "up" && index > 0) {
      [settings.paymentQrFields[index - 1], settings.paymentQrFields[index]] = [settings.paymentQrFields[index], settings.paymentQrFields[index - 1]];
    }
    if (action === "down" && index < settings.paymentQrFields.length - 1) {
      [settings.paymentQrFields[index + 1], settings.paymentQrFields[index]] = [settings.paymentQrFields[index], settings.paymentQrFields[index + 1]];
    }
    settings.paymentQrFields.forEach((field, i) => field.sortOrder = (i + 1) * 10);
    renderPaymentQrFields();
  }

  function renderBankFields() {
    if (!$("bank-field-list")) return;
    normalizeBankFields();
    $("bank-field-list").innerHTML = settings.bankFields.map((field, index) => `
      <tr data-bank-index="${index}">
        <td><span class="drag-handle">::</span>${index + 1}</td>
        <td><input data-bank-prop="labelEn" value="${escapeHtml(field.labelEn)}" /></td>
        <td><input data-bank-prop="labelZh" value="${escapeHtml(field.labelZh)}" /></td>
        <td><textarea data-bank-prop="value">${escapeHtml(field.value)}</textarea></td>
        <td><input data-bank-visible type="checkbox"${field.visible ? " checked" : ""} /></td>
        <td class="field-actions">
          <button data-bank-action="up" type="button">Up / 上移</button>
          <button data-bank-action="down" type="button">Down / 下移</button>
          <button data-bank-action="delete" type="button">Delete / 删除</button>
        </td>
      </tr>
    `).join("");
  }

  function collectBankFields() {
    if (!$("bank-field-list")) return;
    const rows = Array.from(document.querySelectorAll("#bank-field-list tr[data-bank-index]"));
    rows.forEach((row, rowIndex) => {
      const field = settings.bankFields[Number(row.dataset.bankIndex)];
      row.querySelectorAll("[data-bank-prop]").forEach((input) => {
        field[input.dataset.bankProp] = input.value;
      });
      field.visible = !!row.querySelector("[data-bank-visible]")?.checked;
      field.sortOrder = (rowIndex + 1) * 10;
    });
  }

  function addBankField() {
    collectBankFields();
    settings.bankFields.push({
      id: uid("bank"),
      labelEn: "Bank Field",
      labelZh: "银行字段",
      value: "",
      visible: true,
      sortOrder: (settings.bankFields.length + 1) * 10
    });
    renderBankFields();
  }

  function handleBankFieldAction(event) {
    const row = event.target.closest("tr[data-bank-index]");
    if (!row) return;
    collectBankFields();
    const index = Number(row.dataset.bankIndex);
    const action = event.target.dataset.bankAction;
    if (event.target.matches("[data-bank-visible]")) {
      settings.bankFields[index].visible = event.target.checked;
      return;
    }
    if (action === "delete") {
      if (!confirm("Delete this bank field? / 确认删除这个银行字段吗？")) return;
      settings.bankFields.splice(index, 1);
    }
    if (action === "up" && index > 0) {
      [settings.bankFields[index - 1], settings.bankFields[index]] = [settings.bankFields[index], settings.bankFields[index - 1]];
    }
    if (action === "down" && index < settings.bankFields.length - 1) {
      [settings.bankFields[index + 1], settings.bankFields[index]] = [settings.bankFields[index], settings.bankFields[index + 1]];
    }
    settings.bankFields.forEach((field, i) => field.sortOrder = (i + 1) * 10);
    renderBankFields();
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
            ? `<label class="file-btn">Upload / 上传<input data-contact-image="${index}" type="file" accept="image/*" /></label>${field.value ? `<button data-contact-action="clear-image" type="button">Delete Image / 删除图片</button><img class="contact-thumb" src="${field.value}" alt="">` : ""}`
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
    if (action === "clear-image") {
      settings.contactFields[index].value = "";
      renderContactFields();
      return;
    }
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
      <div class="form-grid">
        <label><span>Default Currency / 默认货币</span><select id="default-currency-select" data-setting="currency"></select></label>
      </div>
      <div class="currency-manager">
        <div class="row-head">
          <h4>PDF Display Options / PDF显示选项</h4>
        </div>
        <div class="form-grid">
          <label class="check-row"><input data-setting="showQuoteNumberInPdf" type="checkbox" /> <span>显示报价编号</span></label>
          <label class="check-row"><input data-setting="showQuoteDateInPdf" type="checkbox" /> <span>显示报价日期</span></label>
          <label class="check-row"><input data-setting="showValidUntilInPdfTop" type="checkbox" /> <span>顶部显示截止有效期</span></label>
          <label class="check-row"><input data-setting="showValidityRangeInPdfBottom" type="checkbox" /> <span>底部显示有效期范围</span></label>
          <label><span>底部有效期英文标题</span><input data-setting="validityRangeLabelEn" placeholder="Quotation Validity" /></label>
          <label><span>底部有效期中文标题</span><input data-setting="validityRangeLabelZh" placeholder="报价有效期" /></label>
        </div>
      </div>
      <div class="currency-manager">
        <div class="row-head">
          <h4>Currency Options / 货币选项</h4>
          <div class="actions">
            <input id="currency-input" placeholder="GBP" maxlength="10" />
            <button id="add-currency-btn" type="button">Add / 新增</button>
          </div>
        </div>
        <table class="field-table"><tbody id="currency-list"></tbody></table>
      </div>
      <div class="currency-manager">
        <div class="row-head">
          <h4>Trade Terms / 贸易方式</h4>
          <div class="actions">
            <input id="trade-term-input" placeholder="DDP" maxlength="12" />
            <button id="add-trade-term-btn" type="button">Add / 新增</button>
          </div>
        </div>
        <table class="field-table"><tbody id="trade-term-list"></tbody></table>
      </div>
      <div id="terms-field-host"></div>
    `;
    const sticky = document.querySelector(".sticky-actions");
    sticky?.before(panel);
    const termManager = $("template-term-field-list")?.closest(".field-manager");
    if (termManager) $("terms-field-host").appendChild(termManager);
  }

  function renderCurrencies() {
    if (!$("currency-list")) return;
    normalizeCurrencies();
    if ($("default-currency-select")) {
      $("default-currency-select").innerHTML = settings.currencies.map((currency) => `<option value="${escapeHtml(currency)}"${currency === settings.currency ? " selected" : ""}>${escapeHtml(currency)}</option>`).join("");
    }
    $("currency-list").innerHTML = settings.currencies.map((currency, index) => `
      <tr data-currency-index="${index}">
        <td>${index + 1}</td>
        <td><b>${escapeHtml(currency)}</b></td>
        <td class="field-actions">
          <button data-currency-action="up" type="button">Up / 上移</button>
          <button data-currency-action="down" type="button">Down / 下移</button>
          <button data-currency-action="delete" type="button"${settings.currencies.length <= 1 ? " disabled" : ""}>Delete / 删除</button>
        </td>
      </tr>
    `).join("");
  }

  function addCurrency() {
    normalizeCurrencies();
    const value = $("currency-input").value.trim().toUpperCase();
    if (!value) return toast("Please enter currency code. / 请输入货币代码。");
    if (settings.currencies.includes(value)) return toast("Currency already exists. / 货币已存在。");
    settings.currencies.push(value);
    $("currency-input").value = "";
    save(keys.settings, settings);
    renderCurrencies();
    renderAllSelectors();
  }

  function renderTradeTerms() {
    if (!$("trade-term-list")) return;
    normalizeTradeTerms();
    $("trade-term-list").innerHTML = settings.tradeTerms.map((term, index) => `
      <tr data-trade-index="${index}">
        <td>${index + 1}</td>
        <td><b>${escapeHtml(term)}</b></td>
        <td class="field-actions">
          <button data-trade-action="up" type="button">Up / 上移</button>
          <button data-trade-action="down" type="button">Down / 下移</button>
          <button data-trade-action="delete" type="button"${settings.tradeTerms.length <= 1 ? " disabled" : ""}>Delete / 删除</button>
        </td>
      </tr>
    `).join("");
  }

  function addTradeTerm() {
    normalizeTradeTerms();
    const value = $("trade-term-input").value.trim().toUpperCase();
    if (!value) return toast("Please enter trade term. / 请输入贸易方式。");
    if (settings.tradeTerms.includes(value)) return toast("Trade term already exists. / 贸易方式已存在。");
    settings.tradeTerms.push(value);
    $("trade-term-input").value = "";
    save(keys.settings, settings);
    renderTradeTerms();
    renderQuoteTerms();
  }

  function handleTradeTermAction(event) {
    const row = event.target.closest("tr[data-trade-index]");
    if (!row) return;
    normalizeTradeTerms();
    const index = Number(row.dataset.tradeIndex);
    const action = event.target.dataset.tradeAction;
    if (action === "delete") {
      if (settings.tradeTerms.length <= 1) return;
      if (!confirm("Delete this trade term? / 确认删除这个贸易方式吗？")) return;
      settings.tradeTerms.splice(index, 1);
    }
    if (action === "up" && index > 0) {
      [settings.tradeTerms[index - 1], settings.tradeTerms[index]] = [settings.tradeTerms[index], settings.tradeTerms[index - 1]];
    }
    if (action === "down" && index < settings.tradeTerms.length - 1) {
      [settings.tradeTerms[index + 1], settings.tradeTerms[index]] = [settings.tradeTerms[index], settings.tradeTerms[index + 1]];
    }
    save(keys.settings, settings);
    renderTradeTerms();
    renderQuoteTerms();
  }

  function handleCurrencyAction(event) {
    const row = event.target.closest("tr[data-currency-index]");
    if (!row) return;
    normalizeCurrencies();
    const index = Number(row.dataset.currencyIndex);
    const action = event.target.dataset.currencyAction;
    if (action === "delete") {
      if (settings.currencies.length <= 1) return;
      if (!confirm("Delete this currency? / 确认删除这个货币吗？")) return;
      const [removed] = settings.currencies.splice(index, 1);
      if (settings.currency === removed) settings.currency = settings.currencies[0] || "USD";
    }
    if (action === "up" && index > 0) {
      [settings.currencies[index - 1], settings.currencies[index]] = [settings.currencies[index], settings.currencies[index - 1]];
    }
    if (action === "down" && index < settings.currencies.length - 1) {
      [settings.currencies[index + 1], settings.currencies[index]] = [settings.currencies[index], settings.currencies[index + 1]];
    }
    save(keys.settings, settings);
    renderCurrencies();
    renderAllSelectors();
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
    renderCostFieldLists();
  }

  function currentTemplate() {
    normalizeTemplates();
    return settings.templates.find((t) => t.name === ($("template-select").value || $("template-name-input").value)) || settings.templates[0];
  }

  function renderCategoryList() {
    normalizeCategories();
    $("category-list").innerHTML = settings.categories.map((category, index) => {
      const parent = settings.categories.find((item) => item.id === category.parentId);
      return `
      <tr draggable="true" data-category-index="${index}">
        <td>
          <span class="drag-handle">☰</span>
          ${(index + 1) * 10}
        </td>
        <td>${parent ? escapeHtml(categoryLabel(parent)) : "Level 1 / 一级"}</td>
        <td>${escapeHtml(category.labelEn)}</td>
        <td>${escapeHtml(category.labelZh)}</td>
        <td>${category.visible ? "Show / 显示" : "Hide / 隐藏"}</td>
        <td class="field-actions">
          <button type="button" data-category-action="edit">编辑</button>
          <button type="button" data-category-action="delete">删除</button>
          <button type="button" data-category-action="up">上移</button>
          <button type="button" data-category-action="down">下移</button>
        </td>
      </tr>
    `;
    }).join("") || `<tr><td colspan="6" class="empty">暂无分类，请点击“新增分类”。</td></tr>`;
  }

  function openCategoryModal(index = -1) {
    normalizeCategories();
    editingCategoryIndex = index;
    const current = index >= 0 ? settings.categories[index] : null;
    $("category-modal-title").textContent = index >= 0 ? "编辑分类" : "新增分类";
    $("category-parent-input").innerHTML = `<option value="">Level 1 / 一级分类</option>` + settings.categories
      .filter((item, itemIndex) => itemIndex !== index && !item.parentId)
      .map((item) => `<option value="${escapeHtml(item.id)}"${item.id === current?.parentId ? " selected" : ""}>${escapeHtml(categoryLabel(item))}</option>`)
      .join("");
    $("category-en-input").value = current?.labelEn || "";
    $("category-zh-input").value = current?.labelZh || "";
    $("category-visible-input").value = current?.visible === false ? "false" : "true";
    $("category-modal").hidden = false;
    $("category-en-input").focus();
  }

  function closeCategoryModal() {
    $("category-modal").hidden = true;
  }

  function saveCategoryFromModal() {
    normalizeCategories();
    const labelEn = $("category-en-input").value.trim();
    const labelZh = $("category-zh-input").value.trim();
    if (!labelEn || !labelZh) return toast("Please enter English and Chinese category names. / 请填写中英文分类名称。");
    const parentId = $("category-parent-input").value;
    const visible = $("category-visible-input").value !== "false";
    const exists = settings.categories.some((item, index) => normalize(item.labelEn) === normalize(labelEn) && normalize(item.labelZh) === normalize(labelZh) && index !== editingCategoryIndex);
    if (exists) return toast("分类名称已存在。");
    if (editingCategoryIndex >= 0) {
      settings.categories[editingCategoryIndex] = { ...settings.categories[editingCategoryIndex], labelEn, labelZh, parentId, visible };
    } else {
      settings.categories.push({ id: uid("cat"), labelEn, labelZh, parentId, visible, sortOrder: (settings.categories.length + 1) * 10 });
    }
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
    const [category] = settings.categories.splice(index, 1);
    settings.categories.splice(target, 0, category);
    settings.categories.forEach((item, itemIndex) => item.sortOrder = (itemIndex + 1) * 10);
    save(keys.settings, settings);
    renderCategoryList();
    renderAllSelectors();
  }

  function deleteCategory(index) {
    normalizeCategories();
    const category = settings.categories[index];
    if (!category) return;
    if (settings.categories.length <= 1) return toast("至少保留一个产品分类。");
    if (settings.categories.some((item) => item.parentId === category.id)) return toast("请先删除这个一级分类下面的二级分类。");
    if (!confirm(`Are you sure you want to delete this category?\n确认删除分类“${categoryLabel(category)}”吗？`)) return;
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
    const [category] = settings.categories.splice(from, 1);
    settings.categories.splice(to, 0, category);
    settings.categories.forEach((item, index) => item.sortOrder = (index + 1) * 10);
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

  function costKindFromTarget(target) {
    return String(target || "").startsWith("cost:") ? String(target).split(":")[1] : "";
  }

  function renderCostFieldLists() {
    const host = $("cost-field-template-list");
    if (!host) return;
    normalizeCostTemplates();
    host.innerHTML = ["freight", "trucking", "custom"].map((kind) => {
      const tpl = settings.costTemplates[kind];
      return `
        <section class="cost-template-panel">
          <div class="row-head">
            <h4>${escapeHtml(tpl.name)}</h4>
            <button type="button" data-add-cost-field="${kind}">新增字段</button>
          </div>
          <table class="field-table">
            <thead>
              <tr>
                <th>排序</th><th>中文字段名</th><th>英文字段名</th><th>fieldKey</th><th>字段类型</th><th>必填</th><th>报价单显示</th><th>操作</th>
              </tr>
            </thead>
            <tbody id="cost-field-list-${kind}" data-cost-kind="${kind}">${renderFieldRows(tpl.fields || [], `cost:${kind}`) || `<tr><td colspan="8" class="empty">暂无字段，请点击“新增字段”。</td></tr>`}</tbody>
          </table>
        </section>
      `;
    }).join("");
  }

  function activeFields(tpl = currentTemplate()) {
    const costKind = costKindFromTarget(editingFieldTarget);
    if (costKind) {
      normalizeCostTemplates();
      return settings.costTemplates[costKind].fields;
    }
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
    const costKind = costKindFromTarget(target);
    $("field-modal-title").textContent = `${index >= 0 ? "编辑" : "新增"}${costKind ? settings.costTemplates[costKind].name : (target === "terms" ? "条款字段" : "字段")}`;
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
    renderCostFieldLists();
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
    renderCostFieldLists();
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
    renderCostFieldLists();
  }

  function handleFieldListClick(event) {
    const row = event.target.closest("tr[data-field-index]");
    if (!row) return;
    const index = Number(row.dataset.fieldIndex);
    const tpl = currentTemplate();
    editingFieldTarget = event.currentTarget.dataset.costKind ? `cost:${event.currentTarget.dataset.costKind}` : (event.currentTarget.id === "template-term-field-list" ? "terms" : "product");
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
    editingFieldTarget = event.currentTarget.dataset.costKind ? `cost:${event.currentTarget.dataset.costKind}` : (event.currentTarget.id === "template-term-field-list" ? "terms" : "product");
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
    renderCostFieldLists();
  }

  function handleCostFieldListClick(event) {
    const tbody = event.target.closest("[data-cost-kind]");
    if (!tbody) return;
    const row = event.target.closest("tr[data-field-index]");
    if (!row) return;
    const index = Number(row.dataset.fieldIndex);
    editingFieldTarget = `cost:${tbody.dataset.costKind}`;
    const fields = activeFields();
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

  function handleCostFieldDragStart(event) {
    const row = event.target.closest("#cost-field-template-list tr[data-field-index]");
    if (!row) return;
    event.dataTransfer.setData("text/plain", row.dataset.fieldIndex);
  }

  function handleCostFieldDrop(event) {
    const row = event.target.closest("#cost-field-template-list tr[data-field-index]");
    const tbody = event.target.closest("[data-cost-kind]");
    if (!row || !tbody) return;
    event.preventDefault();
    editingFieldTarget = `cost:${tbody.dataset.costKind}`;
    const from = Number(event.dataTransfer.getData("text/plain"));
    const to = Number(row.dataset.fieldIndex);
    if (Number.isNaN(from) || Number.isNaN(to) || from === to) return;
    const fields = activeFields();
    const [field] = fields.splice(from, 1);
    fields.splice(to, 0, field);
    resequenceFields(fields);
    renderCostFieldLists();
  }

  function saveSettings() {
    normalizeTemplates();
    normalizeCostTemplates();
    normalizeCategories();
    normalizeCurrencies();
    collectSettingsDraft();
    const phone = settings.contactFields.find((field) => normalize(field.labelEn + field.labelZh).includes("phone") || field.labelZh.includes("电话"));
    const email = settings.contactFields.find((field) => normalize(field.labelEn + field.labelZh).includes("email") || field.labelZh.includes("邮箱"));
    const contactPerson = settings.contactFields.find((field) => field.id === "contact-person" || field.labelZh.includes("负责人") || normalize(field.labelEn).includes("quotationcontact"));
    if (contactPerson?.type === "text") settings.contactPerson = contactPerson.value || settings.contactPerson || "";
    if (phone?.type === "text") settings.companyPhone = phone.value || settings.companyPhone || "";
    if (email?.type === "text") settings.companyEmail = email.value || settings.companyEmail || "";
    save(keys.settings, settings);
    renderAllSelectors();
    renderCategoryList();
    renderCostFieldLists();
    toast("设置已保存。");
  }

  function collectSettingsDraft() {
    collectContactFields();
    collectBankFields();
    collectPaymentQrFields();
    document.querySelectorAll("[data-setting]").forEach((input) => {
      settings[input.dataset.setting] = input.type === "checkbox" ? input.checked : input.value.trim();
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
    normalizeCurrencies();
    normalizeTradeTerms();
    const catOptions = settings.categories
      .filter((c) => c.visible !== false)
      .map((c) => `<option value="${escapeHtml(categoryLabel(c))}">${escapeHtml(categoryFullLabel(c))}</option>`)
      .join("");
    $("product-category").innerHTML = catOptions;
    if ($("product-template")) {
      $("product-template").innerHTML = settings.templates.map((tpl) => `<option value="${escapeHtml(tpl.name)}">${escapeHtml(tpl.name)}</option>`).join("");
      if (!editingProductId && $("product-dynamic-fields")) renderProductDynamicFields();
    }
    $("quote-template").innerHTML = settings.templates.map((t) => `<option>${escapeHtml(t.name)}</option>`).join("");
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
      const mergedProducts = new Map(serverProducts.map((product) => [product.id, toLegacyProduct(product)]));
      products.forEach((product) => mergedProducts.set(product.id, product));
      products = Array.from(mergedProducts.values());
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
    const originOptions = portDatalistOptions(ports.filter(isChinaOriginPort));
    const destinationOptions = portDatalistOptions(ports.filter(isWorldDestinationPort));
    ["freight-origin-options", "calc-origin-options"].forEach((id) => {
      const el = $(id);
      if (el) el.innerHTML = originOptions;
    });
    ["freight-destination-options", "calc-destination-options"].forEach((id) => {
      const el = $(id);
      if (el) el.innerHTML = destinationOptions;
    });
    const productOptions = `<option value="">Select Product / 选择产品</option>` + products.map((p) => `<option value="${p.id}">${escapeHtml(p.brand)} ${escapeHtml(p.model)}</option>`).join("");
    if ($("calc-product")) $("calc-product").innerHTML = productOptions;
    renderCountryOptions();
  }

  function renderCountryOptions() {
    const fromPorts = ports.map((port) => [port.countryName, port.countryChineseName]).filter((item) => item[0] || item[1]);
    const map = new Map();
    [...countryOptions, ...fromPorts].forEach(([en, zh]) => {
      const key = normalize(`${en}${zh}`);
      if (!key) return;
      map.set(key, [en || zh, zh || en]);
    });
    if ($("country-options")) {
      $("country-options").innerHTML = Array.from(map.values())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([en, zh]) => `<option value="${escapeHtml(en)} / ${escapeHtml(zh)}"></option><option value="${escapeHtml(zh)}"></option><option value="${escapeHtml(en)}"></option>`)
        .join("");
    }
  }

  function dialCodeForCountry(value) {
    const normalized = normalize(value);
    if (!normalized) return "";
    const direct = countryDialCodes[normalized] || countryDialCodes[String(value || "").trim().toLowerCase()];
    if (direct) return direct;
    const option = countryOptions.find(([en, zh]) => normalized.includes(normalize(en)) || normalized.includes(normalize(zh)));
    if (!option) return "";
    return countryDialCodes[normalize(option[0])] || countryDialCodes[normalize(option[1])] || "";
  }

  function applyBuyerCountryDialCode() {
    const phone = $("buyer-phone");
    if (!phone || phone.value.trim()) return;
    const code = dialCodeForCountry($("buyer-country")?.value || "");
    if (code) phone.value = `${code} `;
  }

  function pastePlainTextIntoInput(event) {
    const input = event.target;
    const text = event.clipboardData?.getData("text/plain");
    if (!text) return;
    event.preventDefault();
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.setRangeText(text, start, end, "end");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function displayPort(port) {
    return port ? portOptionLabel(port) : "";
  }

  function portDatalistOptions(list) {
    return list
      .map((p) => `<option value="${escapeHtml(portOptionLabel(p))}"></option>`)
      .join("");
  }

  function findPortByInput(value, originOnly = false) {
    const text = String(value || "").trim();
    if (!text) return null;
    const source = ports.filter((port) => originOnly ? isChinaOriginPort(port) : isWorldDestinationPort(port));
    const normalized = normalize(text);
    return source.find((port) => port.id === text)
      || source.find((port) => normalize(portOptionLabel(port)) === normalized)
      || source.find((port) => normalize(port.displayName || "") === normalized)
      || source.find((port) => normalize(`${port.portName}${port.portChineseName}${port.aliases}${port.unLocode}${port.countryName}${port.countryChineseName}`).includes(normalized))
      || null;
  }

  function portInputId(id, originOnly = false) {
    return findPortByInput($(id)?.value || "", originOnly)?.id || "";
  }

  function setPortInputValue(id, portId) {
    const port = ports.find((p) => p.id === portId);
    if ($(id)) $(id).value = port ? portOptionLabel(port) : (portId || "");
  }

  function isChinaOriginPort(port) {
    return port?.isOriginPort && ["China", "Hong Kong", "Macau", "Taiwan"].includes(port.countryName);
  }

  function isWorldDestinationPort(port) {
    return port?.isDestinationPort && !["China", "Hong Kong", "Macau", "Taiwan"].includes(port.countryName);
  }

  function portOptionLabel(port) {
    return `${port.portName}${port.portChineseName ? ` / ${port.portChineseName}` : ""}, ${port.countryName}${port.countryChineseName ? ` / ${port.countryChineseName}` : ""}`;
  }

  function portRegion(port) {
    return portRegionByCountry[port.countryName] || "Other / 其他";
  }

  function groupedPortOptions(list) {
    const groups = new Map();
    list.forEach((port) => {
      const region = portRegion(port);
      if (!groups.has(region)) groups.set(region, []);
      groups.get(region).push(port);
    });
    return portRegionOrder
      .filter((region) => groups.has(region))
      .map((region) => `
        <optgroup label="${escapeHtml(region)}">
          ${groups.get(region).sort((a, b) => portOptionLabel(a).localeCompare(portOptionLabel(b))).map((port) => `<option value="${port.id}">${escapeHtml(portOptionLabel(port))}</option>`).join("")}
        </optgroup>
      `).join("");
  }

  function renderPorts() {
    const q = normalize($("port-search")?.value || "");
    const list = ports.filter((p) => !q || normalize(`${p.displayName}${p.portChineseName}${p.aliases}${p.unLocode}${p.countryChineseName}`).includes(q));
    $("port-list").innerHTML = list.map((p) => `
      <article class="list-item">
        <div><b>${escapeHtml(portOptionLabel(p))}</b><p>${escapeHtml(portRegion(p))} | ${escapeHtml(p.unLocode)} | ${escapeHtml(p.status)}</p><p>${escapeHtml(p.aliases)}</p></div>
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
    const originPortId = portInputId("freight-origin", true);
    const destinationPortId = portInputId("freight-destination", false);
    const payload = {
      originPortId,
      destinationPortId,
      shippingMethod: $("freight-method").value,
      rate: $("freight-rate").value,
      effectiveMonth: $("freight-month").value || new Date().toISOString().slice(0, 7),
      freightForwarder: $("freight-agent").value.trim(),
      remark: $("freight-remark").value.trim()
    };
    if (!payload.originPortId || !payload.destinationPortId || !payload.rate) return toast("保存运费库需要从港口库候选里选择起运港和目的港，并填写运费。手动输入港口可用于报价和运费计算。");
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
      setPortInputValue("calc-origin", rate.originPortId);
      setPortInputValue("calc-destination", rate.destinationPortId);
      $("calc-method").value = rate.shippingMethod;
      $("calc-rate").value = rate.rate;
      switchView("freight");
      return toast("Imported to quotation successfully. / 已成功导入报价单。");
    }
    if (action === "edit") {
      editingFreightId = rate.id;
      setPortInputValue("freight-origin", rate.originPortId);
      setPortInputValue("freight-destination", rate.destinationPortId);
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
    const originInput = $("calc-origin").value.trim();
    const destinationInput = $("calc-destination").value.trim();
    const originPortId = portInputId("calc-origin", true);
    const destinationPortId = portInputId("calc-destination", false);
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
    } else if ((originInput || destinationInput) && !rate && (!originPortId || !destinationPortId)) {
      toast("手动输入港口时不会自动匹配运费库，请手动填写运费单价。");
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
      originDisplayName: ports.find((p) => p.id === originPortId)?.displayName || originInput,
      destinationDisplayName: ports.find((p) => p.id === destinationPortId)?.displayName || destinationInput,
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
      kind: "freight",
      values: {
        productType: "海运费",
        itemName: "Sea Freight / 海运费",
        description: `${lastFreightCalculation.originDisplayName} to ${lastFreightCalculation.destinationDisplayName}`,
        qty: "1",
        unitPrice: lastFreightCalculation.freightAmount,
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
    if (!validateQuoteLines()) return;
    syncQuoteSequenceFromNumber(currentQuote.quoteNumber);
    const fileName = currentPdfFileName();
    if (window.quotationDesktop?.exportCurrentPdf) {
      const filePath = await window.quotationDesktop.exportCurrentPdf(fileName);
      if (filePath) toast(`PDF exported. / PDF 已导出：${filePath}`);
      return;
    }
    applyPrintTitle();
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
    if ($("product-template")) $("product-template").value = settings.templates[0]?.name || "";
    renderProductDynamicFields();
    $("product-image-preview").src = "";
    $("product-image-preview").dataset.image = "";
  }

  function productValues(product = {}) {
    return {
      ...(product.values || {}),
      productType: product.values?.productType || product.category || "",
      brand: product.values?.brand || product.brand || "",
      model: product.values?.model || product.model || "",
      tonnage: product.values?.tonnage || product.tonnage || "",
      year: product.values?.year || product.year || "",
      hours: product.values?.hours || product.hours || "",
      unitPrice: product.values?.unitPrice || product.referencePrice || "",
      referencePrice: product.values?.referencePrice || product.referencePrice || "",
      params: product.values?.params || product.params || "",
      remark: product.values?.remark || product.remark || "",
      currency: product.values?.currency || settings.currency
    };
  }

  function productTemplateByName(name) {
    normalizeTemplates();
    return settings.templates.find((tpl) => tpl.name === name) || settings.templates[0];
  }

  function renderProductDynamicFields(product = {}) {
    const host = $("product-dynamic-fields");
    if (!host) return;
    const tpl = productTemplateByName($("product-template")?.value || product.templateName);
    const values = productValues(product);
    const fields = (tpl?.fields || [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .filter((field) => field.visible && field.fieldType !== "calculated" && field.fieldType !== "image");
    host.innerHTML = fields.map((field) => `
      <label class="${field.fieldType === "textarea" ? "wide" : ""}">
        <span>${escapeHtml(field.en)} / ${escapeHtml(field.zh)}${field.required ? " *" : ""}</span>
        ${renderProductLibraryFieldInput(field, values[field.fieldKey] || "")}
      </label>
    `).join("");
  }

  function renderProductLibraryFieldInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (field.fieldKey === "currency") return renderCurrencySelectFor("product", field.fieldKey, value);
    if (field.fieldType === "textarea") return `<textarea data-product-field="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-product-field="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-product-field="${key}" type="number" value="${val}" />`;
    return `<input data-product-field="${key}" type="text" value="${val}" />`;
  }

  function collectProductForm() {
    const values = {};
    document.querySelectorAll("[data-product-field]").forEach((input) => values[input.dataset.productField] = input.value);
    return {
      id: editingProductId || uid("product"),
      category: $("product-category").value,
      templateName: $("product-template")?.value || settings.templates[0]?.name || "",
      values,
      brand: values.brand || "",
      model: values.model || "",
      tonnage: values.tonnage || "",
      year: values.year || "",
      hours: values.hours || "",
      referencePrice: values.unitPrice || values.referencePrice || "",
      params: values.params || "",
      remark: values.remark || "",
      imageDataUrl: $("product-image-preview").dataset.image || ""
    };
  }

  function saveProduct() {
    const product = collectProductForm();
    if (!Object.values(product.values || {}).some(Boolean)) return toast("请至少填写一个产品字段。");
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
    $("product-category").value = p.category || categoryLabel(settings.categories[0]);
    if ($("product-template")) $("product-template").value = p.templateName || settings.templates[0]?.name || "";
    renderProductDynamicFields(p);
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
    const category = row.category || categoryLabel(settings.categories[0]) || "Uncategorized / 未分类";
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
    const categoryIndex = cells.findIndex((cell) => categoryNames.some((cat) => [cat.labelEn, cat.labelZh, categoryLabel(cat), categoryFullLabel(cat)].some((name) => normalize(name) === normalize(cell))));
    const category = categoryIndex >= 0 ? cells.splice(categoryIndex, 1)[0] : (categoryLabel(settings.categories[0]) || "Uncategorized / 未分类");
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
    const list = products.filter((p) => !kw || normalize(`${p.category}${p.brand}${p.model}${Object.values(p.values || {}).join(" ")}`).includes(kw));
    $("product-list").innerHTML = list.map((p) => `
      <article class="list-item">
        ${p.imageDataUrl ? `<img src="${p.imageDataUrl}" alt="">` : `<div class="thumb-empty">No Image</div>`}
        <div><b>${escapeHtml(productDisplayName(p))}</b><p>${escapeHtml(p.category)} | ${escapeHtml(productSummary(p))}</p><p>${escapeHtml(p.remark)}</p></div>
        <div class="actions"><button onclick="window.quoteApp.editProduct('${p.id}')">编辑</button><button onclick="window.quoteApp.deleteProduct('${p.id}')">删除</button></div>
      </article>
    `).join("") || `<p class="empty">暂无产品。</p>`;
  }

  function productDisplayName(product) {
    const values = productValues(product);
    return [values.brand, values.model].filter(Boolean).join(" ") || values.productType || values.name || "未命名产品";
  }

  function productSummary(product) {
    const values = productValues(product);
    return [values.year, values.hours ? `${values.hours}h` : "", values.tonnage, values.params].filter(Boolean).join(" | ");
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

  function newQuote(advanceNumber = false) {
    const d = today();
    currentQuote = {
      id: uid("quote"),
      status: "草稿",
      quoteNumber: nextQuoteNumber(d, advanceNumber),
      quoteDate: d,
      validUntil: addDays(7),
      validityRangeText: "",
      pdfLanguage: "bilingual",
      buyer: {},
      templateName: settings.templates[0]?.name || "",
      items: [blankQuoteLine()],
      terms: {
        payment: "30/70",
        deliveryTime: "",
        shipping: "EXW",
        originPort: "Shanghai Port / 上海港, China / 中国",
        port: "",
        afterSales: "",
        warranty: "",
        notes: "Freight and/or inland trucking charges, if listed, are paid by seller on buyer's behalf only. The trade term remains EXW and seller does not assume CIF carrier or insurance liability. / 如报价中列明海运费或陆路运输费，该费用仅为我方代客户代付或垫付，贸易方式仍为 EXW，我方不承担 CIF 项下承运或保险责任。"
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
    if ($("quote-status")) $("quote-status").value = currentQuote.status || "普通报价";
    $("quote-number").value = currentQuote.quoteNumber || "";
    $("quote-date").value = currentQuote.quoteDate || today();
    $("valid-until").value = currentQuote.validUntil || addDays(7);
    $("validity-range-text").value = currentQuote.validityRangeText || "";
    $("pdf-language").value = currentQuote.pdfLanguage || "bilingual";
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
    currentQuote.status = $("quote-status")?.value || "普通报价";
    currentQuote.quoteNumber = $("quote-number").value;
    currentQuote.quoteDate = $("quote-date").value;
    currentQuote.validUntil = $("valid-until").value;
    currentQuote.validityRangeText = $("validity-range-text").value.trim();
    currentQuote.pdfLanguage = $("pdf-language").value || "bilingual";
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
    const lineRows = Array.from(document.querySelectorAll(".quote-line"));
    currentQuote.items = lineRows.length ? lineRows.map((row) => {
      const values = {};
      row.querySelectorAll("[data-qfield]").forEach((input) => values[input.dataset.qfield] = input.value);
      return {
        id: row.dataset.id,
        kind: row.dataset.kind || "product",
        values,
        imageDataUrl: row.dataset.image || "",
        freightSnapshot: null
      };
    }) : Array.from(document.querySelectorAll(".quote-item")).map((card) => {
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
      custom: "Custom Row / 自定义行"
    };
    return map[kind || "product"] || map.product;
  }

  function blankQuoteLine(values = {}) {
    return {
      id: uid("item"),
      kind: "product",
      values: {
        tradeTerm: currentQuote?.terms?.shipping || "EXW",
        description: "",
        qty: "1",
        unitPrice: "",
        currency: settings.currency,
        remark: "",
        ...values
      },
      imageDataUrl: ""
    };
  }

  function tradeTermSelect(value) {
    normalizeTradeTerms();
    const selected = value === undefined ? (currentQuote?.terms?.shipping || "EXW") : value;
    const options = ["", ...settings.tradeTerms];
    return `<select data-qfield="tradeTerm">${options.map((term) => `<option value="${escapeHtml(term)}"${term === selected ? " selected" : ""}>${term ? escapeHtml(term) : "空白"}</option>`).join("")}</select>`;
  }

  function lineDescription(item) {
    const values = item.values || {};
    return values.description
      || [values.productType, values.brand, values.model, values.year, values.hours].filter(Boolean).join(" ")
      || values.remark
      || "";
  }

  function quoteLineColumns() {
    normalizeQuoteLineColumns();
    return settings.quoteLineColumns
      .slice()
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .filter((column) => column.visible !== false);
  }

  function renderQuoteLineInput(column, item) {
    const values = item.values || {};
    const key = escapeHtml(column.key);
    const required = column.required ? " required" : "";
    if (column.key === "tradeTerm") return tradeTermSelect(values.tradeTerm);
    if (column.key === "description") return `<textarea data-qfield="description"${required} placeholder="例如：Used CAT 320 Excavator / 二手卡特320挖掘机">${escapeHtml(lineDescription(item))}</textarea>`;
    if (column.key === "qty") return `<input data-qfield="qty" type="number" min="0" step="1" value="${escapeHtml(values.qty || "1")}"${required} />`;
    if (column.key === "unitPrice") return `<input data-qfield="unitPrice" type="number" min="0" step="0.01" value="${escapeHtml(values.unitPrice || "")}"${required} />`;
    if (column.key === "currency") return renderCurrencySelect("currency", values.currency || settings.currency);
    if (column.key === "amount") return `<span class="line-amount">${escapeHtml(money(itemSubtotal(item), values.currency || settings.currency))}</span>`;
    if (column.key === "image") {
      return `
        <div class="line-image-box">
          <label class="file-btn">上传<input class="quote-line-image-input" type="file" accept="image/*"${required} /></label>
          <button class="clear-line-image" type="button">删除</button>
          <img src="${item.imageDataUrl || ""}" alt=""${item.imageDataUrl ? "" : " hidden"} />
        </div>
      `;
    }
    if (column.key === "remark") return `<input data-qfield="remark" value="${escapeHtml(values.remark || "")}"${required} />`;
    return `<input data-qfield="${key}" value="${escapeHtml(values[column.key] || "")}"${required} />`;
  }

  function itemCard(item = {}) {
    const tpl = template();
    const id = item.id || uid("item");
    const kind = item.kind || "product";
    const vals = item.values || {};
    if (["freight", "trucking", "custom"].includes(kind)) {
      const costTpl = costTemplate(kind);
      const fields = (costTpl.fields || []).slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible && field.fieldType !== "calculated" && field.fieldType !== "image");
    const customTitle = kind === "custom"
        ? [vals.productType, vals.brand, vals.model, vals.itemName, vals.description].filter(Boolean).join(" ") || "自定义行"
        : (vals.productType || costTpl.name || itemKindLabel(kind));
      return `
        <article class="quote-item panel cost-item" data-id="${id}" data-kind="${kind}">
          <div class="row-head">
            <h3>${escapeHtml(customTitle)}</h3>
            <span class="manual-badge">${kind === "custom" ? "Manual Input / 手动输入" : "Configurable Fields / 字段可配置"}</span>
          </div>
          <div class="quote-item-grid">
            ${fields.map((field) => `
              <label class="${field.fieldType === "textarea" ? "wide" : ""}">
                <span>${escapeHtml(field.en)} / ${escapeHtml(field.zh)}${field.required ? " *" : ""}</span>
                ${renderCostFieldInput(field, vals[field.fieldKey] ?? defaultCostValue(kind, field.fieldKey))}
              </label>
            `).join("")}
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
            <img class="product-preview" data-image="${escapeHtml(item.imageDataUrl || "")}" src="${item.imageDataUrl || ""}" alt="" />
          </div>
          ` : ""}
        </div>
        <div class="actions"><button class="remove-quote-item" type="button">删除本产品</button></div>
      </article>
    `;
  }

  function renderQuoteItems() {
    if (!currentQuote.items?.length) currentQuote.items = [blankQuoteLine()];
    const columns = quoteLineColumns();
    $("quote-items").innerHTML = `
      <div class="quote-line-table-wrap">
        <table class="quote-line-table">
          <thead>
            <tr>
              ${columns.map((column) => `<th>${escapeHtml(column.labelZh)}${column.required ? " *" : ""}</th>`).join("")}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${(currentQuote.items || []).map((item) => {
              const values = item.values || {};
              const currency = values.currency || settings.currency;
              return `
                <tr class="quote-line" data-id="${escapeHtml(item.id || uid("item"))}" data-kind="${escapeHtml(item.kind || "product")}" data-image="${escapeHtml(item.imageDataUrl || "")}">
                  ${columns.map((column) => `<td>${renderQuoteLineInput(column, item)}</td>`).join("")}
                  <td><button class="remove-quote-item" type="button">删除</button></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function updateQuoteLineAmounts() {
    document.querySelectorAll(".quote-line").forEach((row) => {
      const qty = Number(row.querySelector("[data-qfield='qty']")?.value || 0);
      const unitPrice = Number(row.querySelector("[data-qfield='unitPrice']")?.value || 0);
      const currency = row.querySelector("[data-qfield='currency']")?.value || settings.currency;
      const target = row.querySelector(".line-amount");
      if (target) target.textContent = money(qty * unitPrice, currency);
    });
  }

  function renderFieldInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (field.fieldKey === "productType") return renderCategorySelect(field.fieldKey, value);
    if (field.fieldType === "textarea") return `<textarea data-qfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-qfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-qfield="${key}" type="number" value="${val}" />`;
    if (field.fieldType === "select") {
      const options = field.fieldKey === "currency"
        ? settings.currencies
        : ["Option 1", "Option 2"];
      return `<select data-qfield="${key}">${options.map((option) => `<option value="${option}"${option === value ? " selected" : ""}>${option}</option>`).join("")}</select>`;
    }
    return `<input data-qfield="${key}" type="text" value="${val}" />`;
  }

  function openProductPicker() {
    renderProductPicker();
    $("product-picker-modal").hidden = false;
    $("product-picker-search").focus();
  }

  function closeProductPicker() {
    $("product-picker-modal").hidden = true;
  }

  function renderProductPicker() {
    const keyword = normalize($("product-picker-search")?.value || "");
    const list = products.filter((product) => !keyword || normalize(`${product.category}${product.brand}${product.model}${product.remark}`).includes(keyword));
    $("product-picker-list").innerHTML = list.map((product) => `
      <article class="product-pick-card" data-product-id="${escapeHtml(product.id)}">
        ${product.imageDataUrl ? `<img src="${product.imageDataUrl}" alt="">` : `<div class="thumb-empty">No Image</div>`}
        <div>
          <h4>${escapeHtml(productDisplayName(product))}</h4>
          <p>${escapeHtml(product.category || "")}</p>
          <p>${escapeHtml(productSummary(product))}</p>
          <p>${product.referencePrice ? money(product.referencePrice, settings.currency) : ""}</p>
          <small>${escapeHtml(product.remark || "")}</small>
        </div>
        <button type="button" data-pick-product="${escapeHtml(product.id)}">Import to Quotation / 导入报价单</button>
      </article>
    `).join("") || `<p class="empty">No product found. / 未找到产品。</p>`;
  }

  function renderCostFieldInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (field.fieldKey === "currency") return renderCurrencySelect(field.fieldKey, value);
    if (field.fieldType === "textarea") return `<textarea data-qfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-qfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-qfield="${key}" type="number" value="${val}" />`;
    if (field.fieldType === "select") return `<input data-qfield="${key}" type="text" value="${val}" />`;
    return `<input data-qfield="${key}" type="text" value="${val}" />`;
  }

  function costTemplate(kind) {
    normalizeCostTemplates();
    return settings.costTemplates[kind] || defaultCostTemplates[kind] || defaultCostTemplates.custom;
  }

  function defaultCostValue(kind, key) {
    if (key === "qty") return "1";
    if (key === "currency") return settings.currency;
    if (key === "productType") {
      if (kind === "freight") return "Sea Freight / 海运费";
      if (kind === "trucking") return "Inland Trucking / 陆路运输费";
      return "";
    }
    return "";
  }

  function renderCurrencySelect(fieldKey, value) {
    normalizeCurrencies();
    const selected = String(value || settings.currency || settings.currencies[0] || "USD").toUpperCase();
    return `<select data-qfield="${escapeHtml(fieldKey)}">${settings.currencies.map((option) => `<option value="${escapeHtml(option)}"${option === selected ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  }

  function renderCurrencySelectFor(scope, fieldKey, value) {
    normalizeCurrencies();
    const selected = String(value || settings.currency || settings.currencies[0] || "USD").toUpperCase();
    const attr = scope === "product" ? "data-product-field" : "data-qfield";
    return `<select ${attr}="${escapeHtml(fieldKey)}">${settings.currencies.map((option) => `<option value="${escapeHtml(option)}"${option === selected ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  }

  function defaultCostCategory(kind) {
    if (kind === "freight") return categoryLabel(settings.categories.find((cat) => cat.id === "cat-sea-freight")) || itemKindLabel(kind);
    if (kind === "trucking") return categoryLabel(settings.categories.find((cat) => cat.id === "cat-yard-to-port")) || itemKindLabel(kind);
    return categoryLabel(settings.categories.find((cat) => cat.id === "cat-custom")) || itemKindLabel(kind);
  }

  function renderCategorySelect(fieldKey, value) {
    normalizeCategories();
    const key = escapeHtml(fieldKey);
    const selected = value || categoryLabel(settings.categories.find((cat) => cat.visible !== false) || settings.categories[0]);
    const options = settings.categories
      .filter((cat) => cat.visible !== false)
      .map((cat) => {
        const val = categoryLabel(cat);
        return `<option value="${escapeHtml(val)}"${val === selected ? " selected" : ""}>${escapeHtml(categoryFullLabel(cat))}</option>`;
      }).join("");
    return `<select data-qfield="${key}">${options}</select>`;
  }

  function renderTermInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (["originPort", "port", "destinationPort"].includes(field.fieldKey)) {
      const originOnly = field.fieldKey === "originPort";
      const listId = `${key}-options`;
      const sourcePorts = ports.filter((port) => originOnly ? isChinaOriginPort(port) : isWorldDestinationPort(port));
      const datalistOptions = sourcePorts.map((port) => `<option value="${escapeHtml(portOptionLabel(port))}"></option>`).join("");
      const placeholder = originOnly ? "Shanghai Port / 上海港" : "Dar es Salaam Port / 达累斯萨拉姆港";
      return `
        <input class="combo-input" data-termfield="${key}" list="${listId}" value="${val}" placeholder="${placeholder}" />
        <datalist id="${listId}">${datalistOptions}</datalist>
        <p class="term-desc">${originOnly ? "可直接输入，也可点击下拉选择中国起运港。" : "可直接输入港口，也可点击下拉选择全球目的港。"}</p>
      `;
    }
    if (field.fieldKey === "payment") {
      const selected = value || "30/70";
      return `<select data-termfield="${key}">${paymentOptions.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>`;
    }
    if (field.fieldKey === "shipping" || field.fieldKey === "tradeTerm") {
      normalizeTradeTerms();
      const selected = value === undefined ? "EXW" : value;
      const options = ["", ...settings.tradeTerms];
      return `<select data-termfield="${key}" data-trade-term>${options.map((option) => `<option value="${escapeHtml(option)}"${option === selected ? " selected" : ""}>${option ? escapeHtml(option) : "空白"}</option>`).join("")}</select>`;
    }
    if (field.fieldType === "textarea") return `<textarea data-termfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-termfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-termfield="${key}" type="number" value="${val}" />`;
    if (field.fieldType === "select") return `<select data-termfield="${key}"><option value="${val}" selected>${val || "请选择"}</option></select>`;
    return `<input data-termfield="${key}" type="text" value="${val}" />`;
  }

  function addManualProduct() {
    collectQuoteFromForm();
    currentQuote.items.push(blankQuoteLine());
    renderQuoteItems();
    renderPreview();
  }

  function addCostItem(kind) {
    collectQuoteFromForm();
    const fields = costTemplate(kind).fields || [];
    const values = {};
    fields.forEach((field) => {
      values[field.fieldKey] = defaultCostValue(kind, field.fieldKey);
    });
    currentQuote.items.push({
      id: uid("item"),
      kind,
      values,
      imageDataUrl: ""
    });
    renderQuoteItems();
    renderPreview();
  }

  function addQuoteItemByType() {
    addManualProduct();
  }

  function addProductFromLibrary(productId) {
    const p = products.find((x) => x.id === productId);
    if (!p) return toast("请选择产品库产品。");
    collectQuoteFromForm();
    const values = productValues(p);
    currentQuote.items.push({
      id: uid("item"),
      kind: "product",
      imageDataUrl: p.imageDataUrl || "",
      values: {
        ...values,
        tradeTerm: currentQuote?.terms?.shipping || "EXW",
        description: [values.productType || p.category, values.brand || p.brand, values.model || p.model, values.year || p.year].filter(Boolean).join(" "),
        productType: values.productType || p.category || "",
        brand: values.brand || p.brand || "",
        model: values.model || p.model || "",
        year: values.year || p.year || "",
        hours: values.hours || p.hours || "",
        unitPrice: values.unitPrice || values.referencePrice || p.referencePrice || "",
        currency: values.currency || settings.currency,
        qty: "1",
        params: values.params || p.params || "",
        remark: values.remark || p.remark || ""
      }
    });
    renderQuoteItems();
    closeProductPicker();
    renderPreview();
    toast("已导入报价单。");
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
    if (values.description) return values.description;
    if (["freight", "trucking", "custom"].includes(item.kind || "")) {
      const skip = new Set(["qty", "unitPrice", "currency", "remark"]);
      const fields = (costTemplate(item.kind).fields || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const parts = fields
        .filter((field) => field.visible && !skip.has(field.fieldKey))
        .map((field) => values[field.fieldKey] ? `${field.en || field.zh}: ${values[field.fieldKey]}` : "")
        .filter(Boolean);
      return parts.join(" | ") || itemKindLabel(item.kind);
    }
    if ((item.kind || "product") === "custom") {
      return [values.productType, values.brand, values.model, values.year, values.hours].filter(Boolean).join(" | ") || values.remark || itemKindLabel(item.kind);
    }
    if ((item.kind || "product") !== "product") return [values.itemName, values.description].filter(Boolean).join(" | ") || itemKindLabel(item.kind);
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
    return quoteLineColumns().map((column) => ({
      key: column.key,
      en: column.labelEn || column.key,
      zh: column.labelZh || column.key,
      type: column.type,
      visible: column.visible !== false
    }));
  }

  function renderQuotePreviewHead() {
    return quotePreviewColumns().map((column) => `<th>${labelHtml(column.en, column.zh)}</th>`).join("");
  }

  function quotePreviewCell(item, column) {
    const values = item.values || {};
    const currency = values.currency || settings.currency;
    if (column.key === "tradeTerm") return Object.prototype.hasOwnProperty.call(values, "tradeTerm") ? values.tradeTerm : (currentQuote?.terms?.shipping || "EXW");
    if (column.key === "type") return values.productType || itemKindLabel(item.kind || "product");
    if (column.key === "description") return previewDescription(item);
    if (column.key === "qty") return values.qty || "1";
    if (column.key === "unitPrice") return values.unitPrice ? money(values.unitPrice, currency) : "";
    if (column.key === "amount") return money(itemSubtotal(item), currency);
    if (column.key === "currency") return currency;
    if (column.key === "image") return item.imageDataUrl ? "Image attached / 已上传图片" : "";
    if (column.key === "remark") return previewRemark(item);
    if (values[column.key]) return values[column.key];
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
      return value || "EXW";
    }
    return value;
  }

  function renderCompanyContactPreview() {
    normalizeContactFields();
    const fields = settings.contactFields.filter((field) => field.visible && field.value);
    const address = localizedText(settings.companyAddressEn, settings.companyAddressZh);
    if (!fields.length) {
      return `<p>${escapeHtml(address)} | ${labelText("Quotation Contact", "报价负责人")}: ${escapeHtml(settings.contactPerson)}</p>`;
    }
    return `<div class="preview-contact-list">
      <p>${escapeHtml(address)} | ${labelText("Quotation Contact", "报价负责人")}: ${escapeHtml(settings.contactPerson)}</p>
      <div>${fields.map((field) => field.type === "image"
        ? `<span class="preview-contact-image"><b>${labelText(field.labelEn, field.labelZh)}</b><img src="${field.value}" alt=""></span>`
        : `<span><b>${labelText(field.labelEn, field.labelZh)}:</b> ${escapeHtml(field.value)}</span>`).join("")}</div>
    </div>`;
  }

  function renderBankPreview() {
    normalizeBankFields();
    normalizePaymentQrFields();
    const fields = settings.bankFields.filter((field) => field.visible && field.value);
    const qrFields = settings.paymentQrFields.filter((field) => field.visible && field.value);
    if (!fields.length && !qrFields.length) return "";
    return `<section class="preview-panel bank-panel">
      <h3>${labelText("Bank Payment Information", "银行收款信息")}</h3>
      ${fields.length ? `<div class="bank-grid">
        ${fields.map((field) => `<p><b>${labelText(field.labelEn, field.labelZh)}:</b> ${escapeHtml(field.value)}</p>`).join("")}
      </div>` : ""}
      ${qrFields.length ? `<div class="payment-qr-grid">${qrFields.map((field) => `<figure><img src="${field.value}" alt=""><figcaption>${labelText(field.labelEn, field.labelZh)}</figcaption></figure>`).join("")}</div>` : ""}
    </section>`;
  }

  function renderQuoteMetaPreview() {
    const rows = [];
    if (settings.showQuoteNumberInPdf !== false) rows.push(`<p>${labelText("Quotation No.", "报价编号")}：${escapeHtml(currentQuote.quoteNumber)}</p>`);
    if (settings.showQuoteDateInPdf !== false) rows.push(`<p>${labelText("Date", "日期")}：${escapeHtml(currentQuote.quoteDate)}</p>`);
    if (settings.showValidUntilInPdfTop !== false) rows.push(`<p>${labelText("Valid Until", "有效期至")}：${escapeHtml(currentQuote.validUntil)}</p>`);
    return rows.length ? `<div class="preview-meta">${rows.join("")}</div>` : "";
  }

  function renderValidityRangePreview() {
    if (settings.showValidityRangeInPdfBottom === false) return "";
    const text = currentQuote.validityRangeText
      || [currentQuote.quoteDate, currentQuote.validUntil].filter(Boolean).join(" - ");
    if (!text) return "";
    const labelEn = settings.validityRangeLabelEn || "Quotation Validity";
    const labelZh = settings.validityRangeLabelZh || "报价有效期";
    return `<p><b>${labelText(labelEn, labelZh)}：</b>${escapeHtml(text)}</p>`;
  }

  function validateQuoteLines() {
    const requiredColumns = quoteLineColumns().filter((column) => column.required);
    for (let rowIndex = 0; rowIndex < (currentQuote.items || []).length; rowIndex += 1) {
      const item = currentQuote.items[rowIndex];
      for (const column of requiredColumns) {
        if (column.key === "amount") continue;
        if (column.key === "image") {
          if (!item.imageDataUrl) {
            toast(`第 ${rowIndex + 1} 行请上传图片。`);
            return false;
          }
          continue;
        }
        if (!String(item.values?.[column.key] || "").trim()) {
          toast(`第 ${rowIndex + 1} 行请填写：${column.labelZh || column.key}`);
          return false;
        }
      }
    }
    return true;
  }

  function renderPreview() {
    collectQuoteFromForm();
    const tpl = template();
    const visibleFields = tpl.fields.slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible);
    const visibleTermFields = (tpl.termFields || defaultTermFields).slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible);
    const showProductPhotos = quoteLineColumns().some((column) => column.key === "image" && column.visible !== false);
    const bg = settings.backgroundDataUrl || defaultBg;
    const title = labelText("Quotation", "报价单");
    const companySub = localizedText("", settings.companyNameZh);
    const businessLine = localizedText(settings.businessLineEn, settings.businessLineZh, "<br>");
    $("quote-preview").innerHTML = `
      <section class="preview-banner">
        <img class="preview-banner-bg" src="${bg}" alt="">
        <div class="preview-company">${settings.logoDataUrl ? `<img src="${settings.logoDataUrl}">` : ""}<div><h2>${escapeHtml(displayMode() === "zh" ? settings.companyNameZh : settings.companyNameEn)}</h2>${companySub && displayMode() !== "en" ? `<p>${escapeHtml(companySub)}</p>` : ""}</div></div>
        ${renderCompanyContactPreview()}
      </section>
      <section class="preview-top">
        <div class="preview-title"><h2>${escapeHtml(title)}</h2><p>${businessLine.split("<br>").map(escapeHtml).join("<br>")}</p></div>
        ${renderQuoteMetaPreview()}
      </section>
      <section class="preview-panel"><h3>${labelText("Customer Information", "客户信息")}</h3><div class="preview-fields"><p>${labelText("Company", "公司")}：${escapeHtml(currentQuote.buyer.company)}</p><p>${labelText("Country", "国家")}：${escapeHtml(currentQuote.buyer.country)}</p><p>${labelText("Contact", "负责人")}：${escapeHtml(currentQuote.buyer.contact)}</p><p>${labelText("Phone", "电话")}：${escapeHtml(currentQuote.buyer.phone)}</p><p>${labelText("Email", "邮箱")}：${escapeHtml(currentQuote.buyer.email)}</p><p>${labelText("Address", "地址")}：${escapeHtml(currentQuote.buyer.address)}</p></div></section>
      <section class="preview-panel"><h3>${labelText("Quotation Items", "报价明细")}</h3><table><thead><tr>${renderQuotePreviewHead()}</tr></thead><tbody>${renderQuotePreviewRows()}</tbody></table>${visibleQuoteField("totalAmount") ? `<div class="preview-total">${labelText("Total", "总金额")}：${money(total(), settings.currency)}</div>` : ""}</section>
      ${showProductPhotos && currentQuote.items.some(i => (i.kind || "product") === "product" && i.imageDataUrl) ? `<section class="preview-panel"><h3>${labelText("Product Photos", "产品图片")}</h3><div class="photo-grid">${currentQuote.items.filter(i => (i.kind || "product") === "product" && i.imageDataUrl).map(i => `<article class="photo-card"><img src="${i.imageDataUrl}"><div>${escapeHtml(i.values.description || `${i.values.brand || ""} ${i.values.model || ""}`.trim())}</div></article>`).join("")}</div></section>` : ""}
      ${visibleTermFields.length || settings.stampDataUrl || renderValidityRangePreview() ? `<section class="preview-panel terms-panel"><div class="terms-content"><h3>${labelText("Terms", "条款")}</h3>${visibleTermFields.map((field) => `<p>${labelText(field.en, field.zh)}：${escapeHtml(displayTermValue(field))}</p>`).join("")}${renderValidityRangePreview()}</div>${settings.stampDataUrl ? `<div class="stamp-box"><img src="${settings.stampDataUrl}" alt="Company Stamp"><span>${labelText("Company Stamp", "公司公章")}</span></div>` : ""}</section>` : ""}
      ${renderBankPreview()}
    `;
  }

  async function saveQuote() {
    renderPreview();
    if (!validateQuoteLines()) return;
    syncQuoteSequenceFromNumber(currentQuote.quoteNumber);
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
            productName: item.values.description || `${item.values.brand || ""} ${item.values.model || ""}`.trim(),
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
          validityRangeText: currentQuote.validityRangeText,
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
    closeProductPicker();
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
    const list = quotes.filter((q) => {
      const productsText = q.items.map(i => Object.values(i.values || {}).join(" ")).join(" ");
      const hay = normalize(`${q.buyer.company} ${q.buyer.country} ${productsText}`);
      return (!kw || hay.includes(kw)) && (!date || q.quoteDate === date);
    });
    $("history-list").innerHTML = list.map((q) => `<article class="list-item"><div><b>${escapeHtml(q.quoteNumber)}</b><p>${escapeHtml(q.buyer.company)} | ${escapeHtml(q.buyer.country)} | ${escapeHtml(q.quoteDate)}</p><p>${q.items.length} products | ${money(quoteTotal(q), settings.currency)}</p></div><div class="actions"><button onclick="window.quoteApp.editQuote('${q.id}')">查看/编辑</button><button onclick="window.quoteApp.copyQuote('${q.id}')">复制为新报价</button><button onclick="window.quoteApp.deleteQuote('${q.id}')">删除</button><button onclick="window.quoteApp.editQuote('${q.id}'); setTimeout(()=>window.print(),200)">重新导出PDF</button></div></article>`).join("") || `<p class="empty">暂无历史报价。</p>`;
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
    $("product-template").addEventListener("change", () => renderProductDynamicFields());
    $("save-product-btn").addEventListener("click", saveProduct);
    $("clear-product-btn").addEventListener("click", clearProductForm);
    $("price-import-file").addEventListener("change", async e => loadPriceImportFile(e.target.files[0]));
    $("import-price-btn").addEventListener("click", importPriceList);
    $("clear-import-text-btn").addEventListener("click", () => { $("price-import-text").value = ""; $("price-import-result").textContent = ""; });
    $("product-search").addEventListener("input", renderProducts);
    $("open-product-picker-btn").addEventListener("click", openProductPicker);
    $("close-product-picker-btn").addEventListener("click", closeProductPicker);
    $("product-picker-search").addEventListener("input", renderProductPicker);
    $("product-picker-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-pick-product]");
      if (button) addProductFromLibrary(button.dataset.pickProduct);
    });
    $("add-quote-item-btn").addEventListener("click", addQuoteItemByType);
    $("pdf-language").addEventListener("change", renderPreview);
    $("buyer-country").addEventListener("change", applyBuyerCountryDialCode);
    $("buyer-country").addEventListener("blur", applyBuyerCountryDialCode);
    $("buyer-phone").addEventListener("paste", pastePlainTextIntoInput);
    $("quote-template").addEventListener("change", () => { collectQuoteFromForm(); currentQuote.items = []; renderQuoteTerms(); renderQuoteItems(); renderPreview(); });
    $("quote-items").addEventListener("input", () => { updateQuoteLineAmounts(); renderPreview(); });
    $("quote-items").addEventListener("change", async e => {
      if (e.target.matches(".quote-line-image-input")) {
        const img = await normalizeImage(e.target.files[0]);
        const row = e.target.closest(".quote-line");
        if (row) {
          row.dataset.image = img;
          const preview = row.querySelector(".line-image-box img");
          if (preview) {
            preview.src = img;
            preview.hidden = false;
          }
        }
      }
      if (e.target.matches(".quote-image-input")) {
        const img = await normalizeImage(e.target.files[0]);
        const prev = e.target.closest(".quote-item").querySelector("[data-image]");
        if (prev) { prev.src = img; prev.dataset.image = img; }
      }
      updateQuoteLineAmounts();
      renderPreview();
    });
    $("quote-items").addEventListener("click", e => {
      if (e.target.matches(".remove-quote-item")) {
        const target = e.target.closest(".quote-line") || e.target.closest(".quote-item");
        target?.remove();
        if (!document.querySelector(".quote-line, .quote-item")) {
          currentQuote.items = [blankQuoteLine()];
          renderQuoteItems();
        }
        updateQuoteLineAmounts();
        renderPreview();
      }
      if (e.target.matches(".clear-line-image")) {
        const row = e.target.closest(".quote-line");
        if (row) {
          row.dataset.image = "";
          const preview = row.querySelector(".line-image-box img");
          if (preview) {
            preview.src = "";
            preview.hidden = true;
          }
        }
        renderPreview();
      }
    });
    $("preview-quote-btn").addEventListener("click", renderPreview);
    $("quote-terms").addEventListener("change", (event) => {
      if (event.target.matches("[data-port-picker]")) {
        const target = event.target.closest("label")?.querySelector(`[data-termfield="${event.target.dataset.portPicker}"]`);
        if (target && event.target.value) target.value = event.target.value;
      }
      renderPreview();
    });
    $("save-quote-btn").addEventListener("click", saveQuote);
    $("export-pdf-btn").addEventListener("click", exportPdf);
    $("new-quote-btn").addEventListener("click", () => {
      if (currentQuote?.quoteNumber) syncQuoteSequenceFromNumber(currentQuote.quoteNumber);
      newQuote(true);
    });
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
    window.addEventListener("beforeprint", applyPrintTitle);
    document.addEventListener("click", (event) => {
      if (event.target.id === "save-user-btn") saveUser();
      if (event.target.id === "clear-user-btn") clearUserForm();
      if (event.target.id === "add-term-field-proxy-btn") openFieldModal(-1, "terms");
      if (event.target.matches("[data-add-cost-field]")) openFieldModal(-1, `cost:${event.target.dataset.addCostField}`);
      if (event.target.id === "add-contact-field-btn") addContactField();
      if (event.target.id === "add-bank-field-btn") addBankField();
      if (event.target.id === "add-currency-btn") addCurrency();
      if (event.target.id === "add-trade-term-btn") addTradeTerm();
      if (event.target.id === "add-quote-line-column-btn") addQuoteLineColumn();
      if (event.target.matches("[data-contact-action], [data-contact-visible]")) handleContactFieldAction(event);
      if (event.target.matches("[data-bank-action], [data-bank-visible]")) handleBankFieldAction(event);
      if (event.target.matches("[data-qr-action], [data-qr-visible]")) handlePaymentQrAction(event);
      if (event.target.matches("[data-currency-action]")) handleCurrencyAction(event);
      if (event.target.matches("[data-trade-action]")) handleTradeTermAction(event);
      if (event.target.matches("[data-ql-action]")) handleQuoteLineColumnAction(event);
      if (event.target.closest("#cost-field-template-list [data-field-action], #cost-field-template-list .field-required-toggle, #cost-field-template-list .field-visible-toggle")) handleCostFieldListClick(event);
      if (event.target.matches(".reset-user-password, .toggle-user-status, .delete-user")) handleUserAction(event);
    });
    document.addEventListener("dragstart", handleCostFieldDragStart);
    document.addEventListener("dragover", (event) => {
      if (event.target.closest("#cost-field-template-list tr[data-field-index]")) event.preventDefault();
    });
    document.addEventListener("drop", handleCostFieldDrop);
    document.addEventListener("change", (event) => {
      if (event.target.matches("[data-contact-image]")) handleContactImageChange(event);
      if (event.target.matches("[data-qr-image]")) handlePaymentQrImageChange(event);
      if (event.target.matches("#contact-field-list input, #contact-field-list select")) {
        collectContactFields();
        if (event.target.matches("[data-contact-prop='type']")) renderContactFields();
      }
      if (event.target.matches("#bank-field-list input, #bank-field-list textarea")) collectBankFields();
      if (event.target.matches("#payment-qr-list input")) collectPaymentQrFields();
      if (event.target.matches("#quote-line-column-list input")) {
        collectQuoteLineColumns();
        settings.quoteLineColumns.forEach((column, i) => column.sortOrder = (i + 1) * 10);
        save(keys.settings, settings);
        renderQuoteItems();
        renderPreview();
      }
    });
  }

  async function init() {
    $("login-username").value = "";
    $("login-password").value = "";
    bindEvents();
    applySidebarState();
    removeLegacyCostFields();
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

