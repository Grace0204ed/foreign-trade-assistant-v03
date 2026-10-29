(function () {
  const keys = {
    settings: "quote_assistant_v01_settings",
    products: "quote_assistant_v01_products",
    quotes: "quote_assistant_v01_quotes",
    invitations: "quote_assistant_v01_invitations",
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
    },
    {
      name: "商用卡车",
      desc: "适用于自卸车、牵引车、随车吊、水罐车等商用车辆",
      fields: [
        f("车辆名称", "Vehicle", "productType", "text", true, true, 10),
        f("品牌", "Brand", "brand", "text", true, true, 20),
        f("型号", "Model", "model", "text", true, true, 30),
        f("驱动形式", "Drive Type", "driveType", "text", false, true, 40),
        f("方向盘", "Steering", "steering", "text", false, true, 50),
        f("发动机", "Engine", "engine", "text", false, true, 60),
        f("配置参数", "Configuration", "config", "textarea", false, true, 70),
        f("数量", "Quantity", "qty", "number", true, true, 80),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 90),
        f("货币单位", "Currency", "currency", "select", true, true, 100),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 110),
        f("备注", "Remark", "remark", "textarea", false, true, 120),
        f("产品图片", "Product Image", "productImage", "image", false, true, 130)
      ], termFields: defaultTermFields
    },
    {
      name: "泵车及混凝土设备",
      desc: "适用于泵车、拖泵、湿喷机等混凝土设备",
      fields: [
        f("设备名称", "Equipment", "productType", "text", true, true, 10),
        f("品牌", "Brand", "brand", "text", true, true, 20),
        f("型号", "Model", "model", "text", true, true, 30),
        f("底盘", "Chassis", "chassis", "text", false, true, 40),
        f("工作能力", "Capacity", "capacity", "text", false, true, 50),
        f("技术参数", "Specifications", "params", "textarea", false, true, 60),
        f("数量", "Quantity", "qty", "number", true, true, 70),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 80),
        f("货币单位", "Currency", "currency", "select", true, true, 90),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 100),
        f("产品图片", "Product Image", "productImage", "image", false, true, 110)
      ], termFields: defaultTermFields
    },
    {
      name: "机械配件",
      desc: "适用于属具、破碎锤、铲斗及通用机械配件",
      fields: [
        f("配件名称", "Part Name", "productType", "text", true, true, 10),
        f("零件号/OE号", "Part / OE No.", "oeNumber", "text", false, true, 20),
        f("适配品牌", "Compatible Brand", "brand", "text", false, true, 30),
        f("适配型号", "Compatible Model", "model", "text", false, true, 40),
        f("规格", "Specification", "params", "textarea", false, true, 50),
        f("数量", "Quantity", "qty", "number", true, true, 60),
        f("单价", "Unit Price", "unitPrice", "money", true, true, 70),
        f("货币单位", "Currency", "currency", "select", true, true, 80),
        f("总金额", "Total Amount", "totalAmount", "calculated", true, true, 90),
        f("产品图片", "Product Image", "productImage", "image", false, true, 100)
      ], termFields: defaultTermFields
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
    { key: "itemType", labelZh: "条目类型", labelEn: "Item Type", type: "itemType", visible: true, required: true, system: true, sortOrder: 10 },
    { key: "description", labelZh: "商品信息 / 产品描述", labelEn: "Product Description", type: "textarea", visible: true, required: true, system: true, sortOrder: 20 },
    { key: "route", labelZh: "路线/运输方式", labelEn: "Route / Method", type: "text", visible: true, required: false, system: true, sortOrder: 22 },
    { key: "hsCode", labelZh: "海关编码", labelEn: "HS CODE", type: "text", visible: true, required: false, system: true, sortOrder: 25 },
    { key: "qty", labelZh: "数量", labelEn: "Qty", type: "number", visible: true, required: true, system: true, sortOrder: 30 },
    { key: "billingUnit", labelZh: "计费单位", labelEn: "Billing Unit", type: "text", visible: true, required: false, system: true, sortOrder: 35 },
    { key: "unitPrice", labelZh: "单价", labelEn: "Unit Price", type: "money", visible: true, required: true, system: true, sortOrder: 40 },
    { key: "currency", labelZh: "币种", labelEn: "Currency", type: "currency", visible: true, required: true, system: true, sortOrder: 50 },
    { key: "amount", labelZh: "总价", labelEn: "Amount", type: "calculated", visible: true, required: false, system: true, sortOrder: 60 },
    { key: "image", labelZh: "图片", labelEn: "Image", type: "image", visible: true, required: false, system: true, sortOrder: 70 },
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
      { id: "bank-pay-to", labelEn: "Payment Instructions", labelZh: "付款说明", value: "Please make payment via SWIFT (T/T) to the following account. / 请通过 SWIFT（T/T）汇款至以下账户。", visible: true, sortOrder: 20 },
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
    showValidityRangeInPdfBottom: false,
    documentTypes: [
      { key: "quotation", labelZh: "报价单", labelEn: "Quotation", visible: true, sortOrder: 10 },
      { key: "invoice", labelZh: "形式发票", labelEn: "Proforma Invoice", visible: true, sortOrder: 20 }
    ],
    quoteSectionTitles: {
      customer:{ labelEn:"Customer Information", labelZh:"客户信息" },
      items:{ labelEn:"Quotation Items", labelZh:"报价明细" },
      terms:{ labelEn:"Terms", labelZh:"条款" },
      bank:{ labelEn:"Bank Payment Information", labelZh:"银行收款信息" }
    },
    customerQuoteFields: [
      f("客户公司", "Company", "company", "text", false, true, 10),
      f("客户国家", "Country", "country", "text", false, true, 20),
      f("负责人姓名", "Contact", "contact", "text", false, true, 30),
      f("负责人电话", "Phone / WhatsApp", "phone", "text", false, true, 40),
      f("负责人邮箱", "Email", "email", "text", false, true, 50),
      f("客户公司地址", "Address", "address", "text", false, true, 60)
    ],
    invitationTitleEn: "Invitation Letter",
    invitationTitleZh: "邀请函",
    invitationDefaultReason: "The visitor is invited to China for business inspection, machinery inspection, order discussion and purchasing cooperation.",
    invitationEmbassy: "Embassy of the People's Republic of China",
    invitationCompanyNameEn: "",
    invitationCompanyNameZh: "",
    invitationCompanyAddressEn: "",
    invitationCompanyAddressZh: "",
    invitationCompanyPhone: "",
    invitationCompanyEmail: "",
    invitationSignerName: "",
    invitationSignerTitle: "",
    invitationSignatureDataUrl: "",
    invitationSignatureRotation: -90,
    validityRangeLabelEn: "Quotation Validity",
    validityRangeLabelZh: "报价有效期",
    quoteLineColumns: defaultQuoteLineColumns,
    currencies: ["USD", "EUR", "GBP", "CNY", "RUB", "AED", "SAR", "JPY", "AUD", "CAD"],
    tradeTerms: ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"],
    userModuleVisibility: { home:true, crm:true, quote:true, invitation:true, agency:true, history:true, products:true, freight:true, help:true },
    customerWorkspace: {
      fields: [
        {key:"name",label:"客户名称",type:"text",visible:true,required:true,sortOrder:10,active:true},
        {key:"company",label:"公司名称",type:"text",visible:true,required:false,sortOrder:20,active:true},
        {key:"phone",label:"电话 / WhatsApp",type:"text",visible:true,required:false,sortOrder:30,active:true},
        {key:"country",label:"国家/地区",type:"text",visible:true,required:false,sortOrder:40,active:true},
        {key:"requirement",label:"需求说明",type:"textarea",visible:true,required:false,sortOrder:50,active:true}
      ],
      groups:["重点客户","普通客户","长期培育"],
      statuses:["需求确认中","待报价","报价评估中","计划来华","采购确认中","已采购","长期培育","沉默客户","无效客户"],
      labels:["建筑项目","路桥项目","采矿项目","环卫项目","特殊需求"]
    },
    documentDesignerTemplates: [],
    documentConfigs: {},
    quoteTemplateConfigs: {},
    applicationLock: { enabled:false, autoLockMinutes:15, pinHash:"" },
    logoDataUrl: "",
    backgroundDataUrl: "",
    stampDataUrl: "",
    costFieldsMigratedV1: false,
    costTemplates: defaultCostTemplates,
    categories: [
      { id: "cat-used-excavator", labelEn: "Used Excavator", labelZh: "二手挖掘机", parentId: "", visible: true, sortOrder: 10 },
      { id: "cat-used-loader", labelEn: "Used Loader", labelZh: "二手装载机", parentId: "", visible: true, sortOrder: 20 },
      { id: "cat-used-dozer", labelEn: "Used Bulldozer", labelZh: "二手推土机", parentId: "", visible: true, sortOrder: 30 },
      { id: "cat-water-well-rig", labelEn: "Water Well Drilling Rig", labelZh: "水井钻机", parentId: "", visible: true, sortOrder: 40 },
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
  let invitations = load(keys.invitations, []);
  let currentQuote = null;
  let currentInvitation = null;
  let agentAuthorizations = [];
  let currentAgentAuthorization = null;
  let editingProductId = "";
  let editingFieldIndex = -1;
  let editingFieldTarget = "product";
  let editingCategoryIndex = -1;
  let editingCategoryId = "";
  let quickCategoryForProduct = false;
  let currentUser = {id:'local-owner',username:'本地用户',role:'owner'};
  let passwordLoginDisabled = false;
  let activeViewName = "home";
  const internalViewHistory = [];
  let users = [];
  let serverProducts = [];
  let ports = [];
  let freightRates = [];
  let countryRoutes = [];
  let freightTextPreviewRows = [];
  let editingPortId = "";
  let editingFreightId = "";
  let lastFreightCalculation = null;
  let stateBackupTimer = null;
  let restoringPersistentState = false;
  let activeSettingsSection = localStorage.getItem(keys.settingsSection) || "company";
  let customHsCodes = [];
  let activeHsCodeInput = null;
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
    Cameroon: "Africa / 非洲",
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
    if ([keys.settings, keys.products, keys.quotes, keys.invitations].includes(key)) {
      localStorage.setItem(keys.stateUpdatedAt, new Date().toISOString());
      schedulePersistentStateBackup();
    }
  }

  function localStatePayload() {
    return {
      settings,
      products,
      quotes,
      invitations,
      updatedAt: localStorage.getItem(keys.stateUpdatedAt) || ""
    };
  }

  function hasLocalUserData() {
    return !!localStorage.getItem(keys.settings)
      || (Array.isArray(products) && products.length > 0)
      || (Array.isArray(quotes) && quotes.length > 0)
      || (Array.isArray(invitations) && invitations.length > 0);
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
    if (Array.isArray(state.invitations)) {
      invitations = state.invitations;
      localStorage.setItem(keys.invitations, JSON.stringify(invitations));
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

  const quoteEsLabels = {
    "Item Type": "Tipo de concepto", "Billing Unit": "Unidad de facturación",
    "Quotation": "Cotización",
    "Proforma Invoice": "Factura Proforma",
    "Quotation No.": "No. de Cotización",
    "Date": "Fecha",
    "Valid Until": "Válido Hasta",
    "Customer Information": "Información del Cliente",
    "Company": "Empresa",
    "Country": "País",
    "Contact": "Contacto",
    "Phone": "Teléfono",
    "Email": "Correo Electrónico",
    "Address": "Dirección",
    "Quotation Items": "Detalles de Cotización",
    "Product Photos": "Fotos del Producto",
    "Terms": "Términos",
    "Total": "Total",
    "Company Stamp": "Sello de la Empresa",
    "Bank Payment Information": "Información Bancaria de Pago",
    "Quotation Contact": "Contacto de Cotización",
    "Quotation Validity": "Validez de la Cotización",
    "Trade Term": "Término Comercial",
    "Product Description": "Descripción del Producto",
    "Qty": "Cantidad",
    "Quantity": "Cantidad",
    "Unit Price": "Precio Unitario",
    "Currency": "Moneda",
    "Amount": "Importe",
    "Total Amount": "Importe Total",
    "Remark": "Observación",
    "Image": "Imagen",
    "Image attached": "Imagen adjunta",
    "Payment Ratio": "Forma de Pago",
    "Delivery Time": "Tiempo de Entrega",
    "Origin Port": "Puerto de Origen",
    "Destination Port": "Puerto de Destino",
    "After-sales": "Servicio Posventa",
    "Warranty": "Garantía",
    "Notes": "Notas",
    "Payment Terms": "Condiciones de Pago",
    "Account Number": "Número de Cuenta",
    "Account Name": "Nombre de la Cuenta",
    "Bank Name": "Nombre del Banco",
    "SWIFT/BIC Code": "Código SWIFT/BIC",
    "Branch Code": "Código de Sucursal",
    "Bank Address": "Dirección del Banco",
    "Country/Region": "País/Región",
    "Account Type": "Tipo de Cuenta",
    "Payment Method Notes": "Notas de Método de Pago",
    "WeChat Pay QR Code": "Código QR de WeChat Pay",
    "Alipay QR Code": "Código QR de Alipay"
  };

  function quoteEs(en, zh = "") {
    return quoteEsLabels[en] || quoteEsLabels[zh] || en || zh || "";
  }

  const quoteFrLabels = {
    "Item Type": "Type de poste", "Billing Unit": "Unité de facturation",
    "Quotation": "Devis", "Proforma Invoice": "Facture Proforma", "Quotation No.": "N° de Devis",
    "Date": "Date", "Valid Until": "Valable Jusqu'au", "Customer Information": "Informations Client",
    "Company": "Société", "Country": "Pays", "Contact": "Contact", "Phone": "Téléphone",
    "Email": "E-mail", "Address": "Adresse", "Quotation Items": "Détails du Devis",
    "Product Photos": "Photos du Produit", "Terms": "Conditions", "Total": "Total",
    "Company Stamp": "Cachet de la Société", "Bank Payment Information": "Informations Bancaires",
    "Quotation Contact": "Contact Commercial", "Quotation Validity": "Validité du Devis",
    "Trade Term": "Incoterm", "Condition": "État", "Product Description": "Description du Produit",
    "HS CODE": "Code SH", "Qty": "Qté", "Quantity": "Quantité", "Unit Price": "Prix Unitaire",
    "Currency": "Devise", "Amount": "Montant", "Total Amount": "Montant Total",
    "Remark": "Remarque", "Image": "Image", "Image attached": "Image jointe",
    "Payment Ratio": "Modalités de Paiement", "Delivery Time": "Délai de Livraison",
    "Origin Port": "Port de Départ", "Destination Port": "Port de Destination",
    "After-sales": "Service Après-vente", "Warranty": "Garantie", "Notes": "Remarques",
    "Payment Terms": "Conditions de Paiement", "Payment Instructions": "Instructions de Paiement",
    "Account Number": "Numéro de Compte", "Account Name": "Titulaire du Compte",
    "Bank Name": "Nom de la Banque", "SWIFT/BIC Code": "Code SWIFT/BIC",
    "Branch Code": "Code Agence", "Bank Address": "Adresse de la Banque",
    "Country/Region": "Pays/Région", "Account Type": "Type de Compte",
    "Payment Method Notes": "Remarques sur le Paiement"
  };

  function quoteFr(en, zh = "") {
    return quoteFrLabels[en] || quoteFrLabels[zh] || en || zh || "";
  }

  function labelText(en, zh, mode = displayMode()) {
    if (mode === "en") return en;
    if (mode === "zh") return zh;
    if (mode === "es") return quoteEs(en, zh);
    if (mode === "fr") return quoteFr(en, zh);
    if (mode === "zh-es") return `${quoteEs(en, zh)} / ${zh || en}`;
    if (mode === "zh-fr") return `${quoteFr(en, zh)} / ${zh || en}`;
    return `${en} / ${zh}`;
  }

  function labelHtml(en, zh, mode = displayMode()) {
    if (mode === "en") return escapeHtml(en);
    if (mode === "zh") return escapeHtml(zh);
    if (mode === "es") return escapeHtml(quoteEs(en, zh));
    if (mode === "fr") return escapeHtml(quoteFr(en, zh));
    if (mode === "zh-es") return `${escapeHtml(quoteEs(en, zh))}<small>${escapeHtml(zh || en)}</small>`;
    if (mode === "zh-fr") return `${escapeHtml(quoteFr(en, zh))}<small>${escapeHtml(zh || en)}</small>`;
    return `${escapeHtml(en)}<small>${escapeHtml(zh)}</small>`;
  }

  function localizedText(en, zh, separator = " | ") {
    const mode = displayMode();
    if (mode === "en") return en || "";
    if (mode === "zh") return zh || "";
    if (mode === "es") return en ? quoteEs(en) : "";
    if (mode === "fr") return en ? quoteFr(en) : "";
    if (mode === "zh-es") return [en ? quoteEs(en) : '', zh].filter(Boolean).join(separator);
    if (mode === "zh-fr") return [en ? quoteFr(en) : '', zh].filter(Boolean).join(separator);
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

  function ensureLoginView() {  }

  function toLegacyProduct(product) {
    return {
      id: product.id,
      category: product.category,
      brand: product.brand,
      model: product.model,
      tonnage: product.weight || "",
      weight: product.weight || "",
      year: "",
      hours: "",
      referencePrice: product.referencePrice || "",
      recordType: product.recordType || "model",
      modelProductId: product.modelProductId || "",
      inventoryCode: product.inventoryCode || "",
      specificPrice: product.specificPrice ?? "",
      currency: product.currency || "USD",
      priceStatus: product.priceStatus || (product.specificPrice == null ? "pending" : "quoted"),
      transportDataStatus: product.transportDataStatus || "reference",
      transportPlans: product.transportPlans || [],
      params: product.params || "",
      remark: product.remark || "",
      imageDataUrl: product.imagePath || "",
      aliases: product.aliases || "",
      transportCbm: product.transportCbm || "",
      transportMethod: product.transportMethod || "Bulk Cargo",
      transportLength: product.transportLength || "",
      transportWidth: product.transportWidth || "",
      transportHeight: product.transportHeight || "",
      dimensionUnit: product.dimensionUnit || "meter",
      serverManaged: true
    };
  }

  function serverProductFromLegacy(product) {
    const values = productValues(product);
    return {
      id: product.id,
      category: values.productType || product.category || "",
      brand: values.brand || product.brand || "",
      model: values.model || product.model || "",
      aliases: product.aliases || "",
      condition: product.condition || "Used",
      referencePrice: values.unitPrice || values.referencePrice || product.referencePrice || null,
      recordType: product.recordType || "model",
      modelProductId: product.modelProductId || "",
      inventoryCode: product.inventoryCode || "",
      year: product.year || values.year || "",
      workingHours: product.workingHours ?? values.hours ?? "",
      specificPrice: product.specificPrice === "" ? null : product.specificPrice,
      currency: product.currency || values.currency || settings.currency || "USD",
      priceStatus: product.specificPrice === "" || product.specificPrice == null ? "pending" : "quoted",
      transportDataStatus: product.transportDataStatus || "reference",
      transportPlans: product.transportPlans || [],
      rawImportText: product.rawImportText || "",
      params: [values.tonnage || product.tonnage, values.year || product.year, values.hours || product.hours, values.params || product.params].filter(Boolean).join(" | "),
      remark: values.remark || product.remark || "",
      imagePath: product.imagePath || product.imageDataUrl || "",
      status: product.status || "Active"
    };
  }

  function login() {  }

  function logout() {  }

  function renderLogin() {  }

  function applyAuthLock() { document.body.classList.add("auth-ready","is-admin"); updateAdminControls(); }

  async function checkLogin() {
    try {
      const data = await api("/api/auth/me");
      passwordLoginDisabled = data.passwordLoginDisabled === true;
      currentUser = data.user;
      renderLogin();
      applyAuthLock();
      if (currentUser) {
        localStorage.setItem(keys.sidebarCollapsed, "true");
        applySidebarState();
        await loadSharedSettings();
        await restorePersistentStateIfNeeded();
        await loadServerData();
        await applyQuoteFromUrl();
        window.dispatchEvent(new CustomEvent("foreign-trade-auth-ready", { detail: currentUser }));
      }
    } catch {
      renderLogin();
      applyAuthLock();
    }
  }

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function formatBilingualDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const en = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const zh = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    return `${en} / ${zh}`;
  }

  function formatInvitationDate(value, mode) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const en = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const zh = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    const es = d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
    if (mode === "en") return en;
    if (mode === "zh") return zh;
    if (mode === "zh-es") return `${es} / ${zh}`;
    const fr = d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
    if (mode === "fr") return fr;
    if (mode === "zh-fr") return `${fr} / ${zh}`;
    return `${en} / ${zh}`;
  }

  function quoteHistoryTimeText(q) {
    const created = formatDateTime(q.createdAt);
    const saved = formatDateTime(q.savedAt || q.updatedAt);
    if (created && saved && created !== saved) return `创建时间：${created} | 最近保存：${saved}`;
    return `创建/保存时间：${saved || created || q.quoteDate || ""}`;
  }

  function quoteHistorySortTime(q) {
    const value = q.savedAt || q.updatedAt || q.createdAt || q.quoteDate || "";
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
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

  function currentInvitationPdfFileName() {
    collectInvitationFromForm();
    const date = currentInvitation.date || today();
    const name = safeFilePart(currentInvitation.visitorName || "客户姓名");
    const company = safeFilePart(currentInvitation.visitorCompany || "客户公司");
    return `${date} ${name} ${company} 邀请函.pdf`;
  }

  function applyPrintTitle() {
    if (document.body.classList.contains("printing-agency")) {
      document.title = `${currentAgentAuthorization?.date || today()} ${currentAgentAuthorization?.agentName || "代理授权书"} 授权书`;
      return;
    }
    if (document.body.classList.contains("printing-invitation")) {
      if (!currentInvitation) return;
      document.title = currentInvitationPdfFileName().replace(/\.pdf$/i, "");
      return;
    }
    if (currentQuote) document.title = currentPdfFileName().replace(/\.pdf$/i, "");
  }

  function money(amount, currency) {
    return `${currency || settings.currency || "USD"} ${Number(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const paymentOptions = [
    { value: "30/70", label: "30/70 - 30% deposit, 70% before shipment / 3/7付款" },
    { value: "40/60", label: "40/60 - 40% deposit, 60% before shipment / 4/6付款" },
    { value: "50/50", label: "50/50 - 50% deposit, 50% before shipment / 50%定金，50%尾款发货前付清" },
    { value: "100%", label: "100% before shipment / 百分百付款" }
  ];

  function paymentLabel(value, mode = displayMode()) {
    const labels = {
      "30/70": {
        en: "30/70 - 30% deposit, 70% before shipment",
        zh: "3/7付款",
        es: "30/70 - 30% de anticipo, 70% antes del embarque",
        fr: "30/70 - 30% d'acompte, 70% avant expédition"
      },
      "40/60": {
        en: "40/60 - 40% deposit, 60% before shipment",
        zh: "4/6付款",
        es: "40/60 - 40% de anticipo, 60% antes del embarque",
        fr: "40/60 - 40% d'acompte, 60% avant expédition"
      },
      "50/50": {
        en: "50/50 - 50% deposit for production; remaining 50% paid in full before dispatch. Dispatch only after full balance received.",
        zh: "50/50 - 50%定金安排生产，50%尾款发货前付清；收齐尾款后才发货。",
        es: "50/50 - 50% de anticipo para producción; 50% restante antes del envío. Envío únicamente tras recibir el saldo completo.",
        fr: "50/50 - acompte de 50% pour la production ; solde de 50% avant expédition. Expédition uniquement après réception intégrale du solde."
      },
      "100%": {
        en: "100% before shipment",
        zh: "百分百付款",
        es: "100% antes del embarque",
        fr: "100% avant expédition"
      }
    };
    const item = labels[value];
    if (!item) return localizedSlashValue(value, mode);
    if (mode === "en") return item.en;
    if (mode === "zh") return item.zh;
    if (mode === "es") return item.es;
    if (mode === "fr") return item.fr;
    if (mode === "zh-es") return `${item.es} / ${item.zh}`;
    if (mode === "zh-fr") return `${item.fr} / ${item.zh}`;
    return `${item.en} / ${item.zh}`;
  }

  function normalizeTradeTerms() {
    const fallback = defaultSettings.tradeTerms || ["EXW", "FOB", "CFR", "CIF", "DAP", "DDP"];
    const list = Array.isArray(settings.tradeTerms) && settings.tradeTerms.length ? settings.tradeTerms : fallback;
    settings.tradeTerms = [...new Set(list.map((item) => String(item || "").trim().toUpperCase()).filter(Boolean))];
    if (!settings.tradeTerms.length) settings.tradeTerms = [...fallback];
  }

  function normalizeDocumentTypes() {
    const current = Array.isArray(settings.documentTypes) ? settings.documentTypes : [];
    const byKey = new Map(current.map((item) => [item.key, item]));
    settings.documentTypes = [...defaultSettings.documentTypes, {key:"contract",labelZh:"销售合同",labelEn:"Sales Contract",visible:true,sortOrder:30}, {key:"commercial",labelZh:"商业发票",labelEn:"Commercial Invoice",visible:true,sortOrder:40}, {key:"packing",labelZh:"装箱单",labelEn:"Packing List",visible:true,sortOrder:50}].map((item) => ({
      ...item,
      ...(byKey.get(item.key) || {})
    })).sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }

  function documentTypeOf(key) {
    normalizeDocumentTypes();
    return settings.documentTypes.find((item) => item.key === key) || settings.documentTypes[0] || defaultSettings.documentTypes[0];
  }

  function currentDocumentType() {
    return documentTypeOf(currentQuote?.documentType || "quotation");
  }

  function documentTypeTitle(q = currentQuote) {
    const doc = documentTypeOf(q?.documentType || "quotation");
    return labelText(doc.labelEn || "Quotation", doc.labelZh || "报价单");
  }

  const invitationLangPack = {
    en: {
      titleFallback: "Invitation Letter",
      toPrefix: "To",
      date: "Date",
      intro: "We hereby sincerely invite the following visitor to visit China for business inspection, machinery inspection, order discussion and purchasing cooperation.",
      details: "Visitor Information",
      name: "Name",
      company: "Company",
      country: "Country",
      gender: "Gender",
      birthDate: "Date of Birth",
      passport: "Passport No.",
      arrivalDate: "Arrival Date in China",
      departureDate: "Departure Date from China",
      visitPlace: "Place to Visit",
      visaType: "Visa Type",
      relationship: "Relationship",
      expenseSource: "Source of Expenses",
      reason: "Purpose of Visit",
      notes: "Additional Notes",
      responsibility: "Responsibility Statement",
      inviter: "Inviter",
      signature: "Authorized Signature",
      closing: "We kindly request the embassy to provide necessary visa assistance for the visitor's trip to China."
    },
    zh: {
      titleFallback: "邀请函",
      toPrefix: "致",
      date: "日期",
      intro: "我司诚挚邀请以下来访人来华进行商务考察、设备验机、订单洽谈及采购合作。",
      details: "来访人信息",
      name: "姓名",
      company: "公司",
      country: "国家/护照签发国家",
      gender: "性别",
      birthDate: "出生日期",
      passport: "护照编号",
      arrivalDate: "来华日期/入境日期",
      departureDate: "离境日期",
      visitPlace: "访问地点",
      visaType: "签证类型",
      relationship: "双方关系",
      expenseSource: "费用来源",
      reason: "邀请理由",
      notes: "补充说明",
      responsibility: "责任声明",
      inviter: "邀请人",
      signature: "授权签字",
      closing: "恳请贵使馆为该来访人的来华行程提供必要的签证协助。"
    },
    es: {
      titleFallback: "Carta de Invitación",
      toPrefix: "A",
      date: "Fecha",
      intro: "Por la presente invitamos cordialmente al siguiente visitante a China para inspección comercial, revisión de maquinaria, negociación de pedidos y cooperación de compra.",
      details: "Información del Visitante",
      name: "Nombre",
      company: "Empresa",
      country: "País",
      gender: "Género",
      birthDate: "Fecha de Nacimiento",
      passport: "No. de Pasaporte",
      arrivalDate: "Fecha de Entrada a China",
      departureDate: "Fecha de Salida de China",
      visitPlace: "Lugar de Visita",
      visaType: "Tipo de Visa",
      relationship: "Relación",
      expenseSource: "Fuente de Gastos",
      reason: "Motivo de la Visita",
      notes: "Notas Adicionales",
      responsibility: "Declaración de Responsabilidad",
      inviter: "Invitante",
      signature: "Firma Autorizada",
      closing: "Solicitamos amablemente a la embajada que brinde la asistencia necesaria para la visa del visitante para su viaje a China."
    }
  };

  function invitationLanguages(mode) {
    if(mode==='fr')return ['fr'];
    if(mode==='zh-fr')return ['fr','zh'];
    if (mode === "en") return ["en"];
    if (mode === "zh") return ["zh"];
    if (mode === "es") return ["es"];
    if (mode === "zh-es") return ["es", "zh"];
    return ["en", "zh"];
  }

  function invitationText(key, mode, custom = {}) {
    const french={titleFallback:'Lettre d’invitation professionnelle',toPrefix:'À',date:'Date',details:'Informations sur le visiteur',name:'Nom complet',company:'Société',country:'Nationalité',gender:'Sexe',birthDate:'Date de naissance',passport:'N° de passeport',arrivalDate:'Date d’arrivée',departureDate:'Date de départ',visitPlace:'Lieu de visite',visaType:'Type de visa',relationship:'Relation commerciale',expenseSource:'Prise en charge des frais',reason:'Objet de la visite',notes:'Informations complémentaires',responsibility:'Prise en charge des frais',inviter:'Signataire',signature:'Signature autorisée',closing:'Nous vous remercions de bien vouloir examiner sa demande de visa pour cette visite professionnelle.'};
    invitationLangPack.fr=french;
    return invitationLanguages(mode).map((lang) => {
      if (custom[lang]) return custom[lang];
      return invitationLangPack[lang]?.[key] || "";
    }).filter(Boolean).join(" / ");
  }

  const countryZhMap = {
    "south africa": "南非",
    "zimbabwe": "津巴布韦",
    "nigeria": "尼日利亚",
    "tanzania": "坦桑尼亚",
    "zambia": "赞比亚",
    "ghana": "加纳",
    "kenya": "肯尼亚",
    "uganda": "乌干达",
    "mozambique": "莫桑比克",
    "botswana": "博茨瓦纳",
    "angola": "安哥拉",
    "ethiopia": "埃塞俄比亚",
    "rwanda": "卢旺达",
    "senegal": "塞内加尔",
    "chile": "智利",
    "peru": "秘鲁",
    "colombia": "哥伦比亚",
    "mexico": "墨西哥",
    "spain": "西班牙"
  };

  function countryZhName(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const zhMatch = raw.match(/[\u4e00-\u9fa5]+/g);
    if (zhMatch?.length) return zhMatch.join("");
    const normalizedName = raw.toLowerCase().replace(/\/.*/, "").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
    return countryZhMap[normalizedName] || raw;
  }

  function defaultEmbassyForCountry(country) {
    const zh = countryZhName(country);
    if (!zh) return settings.invitationEmbassy || "中华人民共和国驻外大使馆";
    return `中华人民共和国驻${zh}大使馆`;
  }

  function invitationPartyInfo() {
    return {
      nameEn: settings.invitationCompanyNameEn || settings.companyNameEn || "",
      nameZh: settings.invitationCompanyNameZh || settings.companyNameZh || "",
      addressEn: settings.invitationCompanyAddressEn || settings.companyAddressEn || "",
      addressZh: settings.invitationCompanyAddressZh || settings.companyAddressZh || "",
      phone: settings.invitationCompanyPhone || settings.companyPhone || "",
      email: settings.invitationCompanyEmail || settings.companyEmail || "",
      signerName: settings.invitationSignerName || settings.contactPerson || "",
      signerTitle: settings.invitationSignerTitle || ""
    };
  }

  function applySidebarState() {
    const collapsed = localStorage.getItem(keys.sidebarCollapsed) === "true";
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    if ($("sidebar-toggle-btn")) {
      $("sidebar-toggle-btn").setAttribute("aria-label", collapsed ? "显示侧边栏" : "隐藏侧边栏");
      $("sidebar-toggle-btn").title = collapsed ? "显示侧边栏" : "隐藏侧边栏";
    }
  }

  function toggleSidebar() {
    const collapsed = !document.body.classList.contains("sidebar-collapsed");
    localStorage.setItem(keys.sidebarCollapsed, collapsed ? "true" : "false");
    applySidebarState();
  }

  function showSettingsSection(section) {
    activeSettingsSection = section || "company";
    if (["quote-fields","quote-lines","vehicle-fields","terms"].includes(activeSettingsSection)) activeSettingsSection = "quote-settings";
    localStorage.setItem(keys.settingsSection, activeSettingsSection);
    document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.settingsPanel !== activeSettingsSection || (panel.classList.contains("admin-only") && !isAdmin());
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
      id: field.id || `field-${fieldKeyOf(field)}`,
      parentId: field.parentId || "",
      zh,
      en,
      fieldKey: fieldKeyOf(field),
      fieldType: fieldTypeOf(field),
      required: !!field.required,
      visible: visibleOf(field),
      sortOrder: Number(field.sortOrder ?? (index + 1) * 10),
      active: field.active !== false,
      system: !!field.system,
      defaultValue: field.defaultValue ?? "",
      options: Array.isArray(field.options) ? field.options : [],
      itemTypesVersion: field.itemTypesVersion,
      deletedAt: field.deletedAt || ""
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
      id: tpl.id || `product-template-${normalize(tpl.name || Date.now())}`,
      name: tpl.name,
      desc: tpl.desc || "",
      productMode: tpl.productMode || "linked",
      productTemplateId: tpl.productTemplateId || "",
      fields: (tpl.fields || [])
        .map(normalizeField)
        .filter((field) => !field.deletedAt && !["freight", "truckingToPort"].includes(field.fieldKey))
        .sort((a, b) => a.sortOrder - b.sortOrder),
      termFields: termFields.sort((a, b) => a.sortOrder - b.sortOrder)
    };
  }

  function normalizeTemplates() {
    const existing = Array.isArray(settings.templates) ? settings.templates : [];
    const merged = [...existing];
    defaultTemplates.forEach((preset) => {
      if (!merged.some((item) => item.name === preset.name)) merged.push(structuredClone(preset));
    });
    settings.templates = merged.map(normalizeTemplate);
    settings.categoryFieldConfigs = settings.categoryFieldConfigs || {};
  }

  function openSettingsSection(section = "company") {
    switchView("settings");
    showSettingsSection(section);
    if (section === "users" && isAdmin()) {
      ensureUserManagerPanel();
      renderUsers();
    }
    if (section === "data" && isAdmin()) renderAdminOverview();
  }

  function showContactInformation() {
    if ($("contact-modal")) {
      if ($("contact-modal").parentElement !== document.body) document.body.appendChild($("contact-modal"));
      $("contact-modal").hidden = false;
    }
  }

  function handleDesktopMenuAction(action) {
    if (action === "settings") return openSettingsSection("company");
    if (action === "users") return openSettingsSection("users");
    if (action === "data") return openSettingsSection("data");
    if (action === "help") return switchView("help");
    if (action === "contact") return showContactInformation();
    if (action === "logout") return logout();
  }

  const userModules = [
    ["home","首页"],["crm","客户跟进"],["quote","新建报价"],["invitation","邀请函"],["agency","授权代理"],
    ["history","历史记录"],["products","产品库"],["help","帮助"]
  ];

  const hsCodeLibrary = [
    {code:"84295200",keywords:["挖掘机","excavator","360"],name:"360°回转挖掘机"},{code:"84295100",keywords:["装载机","loader","滑移"],name:"前端铲装载机"},{code:"84295900",keywords:["tlb","反铲"],name:"其他挖掘机械"},{code:"84291100",keywords:["推土机","bulldozer","dozer"],name:"履带式推土机"},{code:"84292000",keywords:["平地机","grader"],name:"平地机"},{code:"84294000",keywords:["压路机","road roller","roller"],name:"压路机"},{code:"84272000",keywords:["叉车","forklift","伸缩臂","telehandler"],name:"机动叉车或伸缩臂叉装车"},{code:"84304100",keywords:["水井钻机","旋挖钻机","钻机","drilling rig"],name:"自行式钻探机械"},{code:"87051091",keywords:["汽车起重机","汽车吊","truck crane","crane lorry"],name:"汽车起重机（最大起重量≤50吨）"},{code:"84264100",keywords:["轮胎吊","轮胎式起重机","tyre crane"],name:"轮胎式自行起重机"},{code:"84264900",keywords:["履带吊","crawler crane"],name:"其他自行式起重机"},{code:"87042300",keywords:["豪沃自卸","howo dump","公路自卸","自卸卡车","dump truck"],name:"柴油公路货车（车辆总重量>20吨）"},{code:"87041090",keywords:["矿山自卸","非公路自卸","off-highway dumper"],name:"其他非公路用货运自卸车"},{code:"87012000",keywords:["牵引车","tractor truck"],name:"半挂车用公路牵引车"},{code:"87059091",keywords:["混凝土泵车","concrete pump truck","concrete pump lorry"],name:"混凝土泵车"},{code:"87054000",keywords:["混凝土搅拌车","搅拌运输车","concrete mixer truck","concrete-mixer lorry"],name:"机动混凝土搅拌车"},{code:"87059000",keywords:["水罐车","油罐车","特种车辆","special purpose"],name:"其他特殊用途车辆"},{code:"84742000",keywords:["破碎机","crusher"],name:"破碎或研磨机器"},{code:"84743200",keywords:["沥青搅拌","asphalt mixing"],name:"矿物材料混合机器"},{code:"84743100",keywords:["自上料小型混凝土搅拌车","自上料搅拌车","自上料搅拌机","self-loading concrete mixer","混凝土搅拌","concrete mixing"],name:"混凝土或砂浆搅拌机器"}
  ];

  function allHsCodes() {
    const merged = new Map(hsCodeLibrary.map(item => [item.code, { ...item, nameZh:item.name, nameEn:"" }]));
    customHsCodes.forEach(item => merged.set(item.code, {
      ...item,
      name:item.nameZh,
      keywords:String(item.keywords || "").split(/[,，;；\n]/).map(value=>value.trim()).filter(Boolean)
    }));
    return [...merged.values()].sort((a,b)=>a.code.localeCompare(b.code));
  }

  function renderHsCodeOptions() {
    const list=$("hs-code-options");
    if(!list)return;
    list.innerHTML=allHsCodes().map(item=>`<option value="${escapeHtml(item.code)}">${escapeHtml(item.nameZh || item.name || "")}${item.nameEn?` / ${escapeHtml(item.nameEn)}`:""}</option>`).join("");
  }

  async function loadCustomHsCodes() {
    try {
      const data=await api("/api/hs-codes");
      customHsCodes=Array.isArray(data.codes)?data.codes:[];
      renderHsCodeOptions();
    } catch(error) { console.warn("HS code library load failed",error); }
  }

  function openHsCodeModal(input) {
    activeHsCodeInput=input || null;
    $("new-hs-code").value=input?.value || "";
    $("new-hs-name-zh").value="";
    $("new-hs-name-en").value="";
    $("new-hs-keywords").value="";
    $("hs-code-modal").hidden=false;
    $("new-hs-code").focus();
  }

  function closeHsCodeModal() {
    $("hs-code-modal").hidden=true;
    activeHsCodeInput=null;
  }

  async function saveCustomHsCode() {
    const code=$("new-hs-code").value.trim();
    const nameZh=$("new-hs-name-zh").value.trim();
    if(!/^\d{8}$/.test(code))return toast("海关编码必须是8位数字。");
    if(!nameZh)return toast("请填写中文产品名称。");
    try {
      const data=await api("/api/hs-codes",{method:"POST",body:JSON.stringify({code,nameZh,nameEn:$("new-hs-name-en").value.trim(),keywords:$("new-hs-keywords").value.trim()})});
      await loadCustomHsCodes();
      if(activeHsCodeInput){activeHsCodeInput.value=code;activeHsCodeInput.dispatchEvent(new Event("change",{bubbles:true}));}
      toast(data.zh || "海关编码已保存。");
      closeHsCodeModal();
    } catch(error) { toast(error.message); }
  }

  function normalizeUserModuleVisibility() {
    settings.userModuleVisibility = { ...defaultSettings.userModuleVisibility, ...(settings.userModuleVisibility || {}) };
  }

  async function loadSharedSettings() {
    if (!currentUser) return;
    try {
      const data=await api("/api/settings");
      if(data.settings && typeof data.settings==="object") {
        settings={...settings,...data.settings};
        save(keys.settings,settings);
        applyUserModuleVisibility();
      }
    } catch(error) { console.warn("Shared settings load failed",error); }
  }

  function applyUserModuleVisibility() {
    normalizeUserModuleVisibility();
    const limited=!!currentUser && !isAdmin();
    document.querySelectorAll(".nav-btn").forEach(button=>{
      const key=button.id==="crm-module-btn"?"crm":button.dataset.view;
      button.classList.toggle("module-hidden", limited && Object.prototype.hasOwnProperty.call(settings.userModuleVisibility,key) && settings.userModuleVisibility[key]===false);
    });
    document.querySelectorAll(".entry-card").forEach(button=>{
      const key=button.id==="crm-entry-btn"?"crm":button.dataset.viewTarget;
      button.classList.toggle("module-hidden", limited && Object.prototype.hasOwnProperty.call(settings.userModuleVisibility,key) && settings.userModuleVisibility[key]===false);
    });
  }

  function renderUserModuleVisibility() {
    const host=$("user-module-visibility"); if(!host)return;
    normalizeUserModuleVisibility();
    host.innerHTML=userModules.map(([key,label])=>`<label><input type="checkbox" data-user-module="${key}" ${settings.userModuleVisibility[key]!==false?"checked":""}><span>${label}</span></label>`).join("");
  }

  function organizeManagementModules() {
    // Retired fixed new-vehicle quotation/category interfaces are removed from
    // the live application. Historical standard documents remain readable.
    document.querySelector('.legacy-quote-settings')?.remove();
    $("category-modal")?.remove();
    $("view-vehicle-quote")?.remove();
    $("view-vehicle-admin")?.remove();
    $("vehicle-quote-workspace-host")?.remove();
    const oldDataView = $("view-data");
    const settingsDataHost = $("settings-data-host");
    if (oldDataView && settingsDataHost) {
      [...oldDataView.children].filter((node) => !node.matches?.("header.page-head")).forEach((node) => settingsDataHost.appendChild(node));
    }
    const freightSettingsHost = $("settings-freight-host");
    if (freightSettingsHost) {
      [document.querySelector(".country-route-panel"), document.querySelector(".freight-port-admin"), document.querySelector(".freight-rate-admin"), document.querySelector(".freight-text-import")]
        .filter(Boolean).forEach((panel) => freightSettingsHost.appendChild(panel));
    }
    document.querySelector(".product-library-tabs")?.remove();
    $("unified-vehicle-product-editor")?.remove();
    $("machinery-reference-editor")?.remove();
    $("vehicle-field-settings-panel")?.remove();
    const overview = $("admin-data-counts")?.closest(".panel");
    if (overview && $("admin-overview-host")) $("admin-overview-host").appendChild(overview);
  }

  function categoryConfigKey(categoryId = $("category-config-select")?.value, condition = $("category-condition-select")?.value) {
    return `${categoryId || settings.categories?.[0]?.id || "default"}:${condition || "general"}`;
  }

  function categoryFieldConfig(categoryId, condition) {
    normalizeTemplates();
    const key = categoryConfigKey(categoryId, condition);
    if (!settings.categoryFieldConfigs[key]) {
      const source = settings.templates[0]?.fields || defaultTemplates[0].fields;
      settings.categoryFieldConfigs[key] = source.map(normalizeField).sort((a,b)=>a.sortOrder-b.sortOrder);
    }
    return settings.categoryFieldConfigs[key];
  }

  function renderCategoryConfigSelectors() {
    const select = $("category-config-select");
    if (!select) return;
    const prior = select.value;
    const costCategoryIds=new Set(["cat-freight","cat-sea-freight","cat-combined-freight","cat-trucking","cat-yard-to-port","cat-custom"]);
    select.innerHTML = settings.categories.filter(c=>!costCategoryIds.has(c.id) && !costCategoryIds.has(c.parentId)).map(c=>{
      const parent=settings.categories.find(p=>p.id===c.parentId);
      return `<option value="${escapeHtml(c.id)}">${parent?`${escapeHtml(categoryLabel(parent))} → `:""}${escapeHtml(categoryLabel(c))}</option>`;
    }).join("");
    if (settings.categories.some(c=>c.id===prior)) select.value=prior;
  }

  function renderCategoryFieldLibrary() {
    const host=$("category-field-library");
    if(!host)return;
    const current=categoryFieldConfig(), selected=new Set(current.map(f=>f.fieldKey));
    const pool=new Map();
    [...defaultTemplates.flatMap(t=>t.fields||[]),...settings.templates.flatMap(t=>t.fields||[]),...current].forEach(f=>pool.set(f.fieldKey,normalizeField(f)));
    host.innerHTML=[...pool.values()].sort((a,b)=>a.sortOrder-b.sortOrder).map(f=>`<button type="button" class="${selected.has(f.fieldKey)?"active":""}" data-category-field="${escapeHtml(f.fieldKey)}">${escapeHtml(f.zh)} / ${escapeHtml(f.en)}</button>`).join("");
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
    if(!settings.categories.some(category=>category.id==="cat-water-well-rig"||category.labelZh==="水井钻机"))settings.categories.push({id:"cat-water-well-rig",labelEn:"Water Well Drilling Rig",labelZh:"水井钻机",parentId:"",visible:true,sortOrder:40});
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

  function updateBackButton() {
    const button = $("global-back-btn");
    if (!button) return;
    button.hidden = !currentUser || ["home", "login"].includes(activeViewName);
  }

  function isProductCategory(category) {
    const costIds=new Set(["cat-freight","cat-sea-freight","cat-combined-freight","cat-trucking","cat-yard-to-port","cat-custom"]);
    return !!category && !costIds.has(category.id) && !costIds.has(category.parentId);
  }

  function newSharedQuote() {
    newQuote(true, currentQuote?.documentType || "quotation");
  }
  window.quoteBusiness = { newShared:newSharedQuote };

  async function renderAdminOverview(){if(!isAdmin()||!$("admin-data-counts"))return;try{const data=await api("/api/admin/overview"),labels={customers:"客户",products:"产品",quotations:"普通报价",followUps:"跟进记录"},allowed=Object.keys(labels);$("admin-data-counts").innerHTML=Object.entries(data.counts||{}).filter(([key])=>allowed.includes(key)).map(([key,value])=>`<div><b>${Number(value).toLocaleString()}</b><span>${labels[key]}</span></div>`).join("");$("admin-audit-list").innerHTML=(data.audits||[]).map(x=>`<tr><td>${escapeHtml(x.created_at||"")}</td><td>${escapeHtml(x.action||"")}</td><td>${escapeHtml(`${x.entity_type||""} ${x.entity_id||""}`)}</td><td>${escapeHtml(x.reason||"")}</td></tr>`).join("")||'<tr><td colspan="4">暂无审计记录</td></tr>';}catch(e){toast(e.message);}}

  async function renderHomeDashboard(){
    if(!$("view-home"))return;
    const issuedAgency=agentAuthorizations.filter(item=>!item.isTemplate);
    const allDocuments=[...quotes,...invitations,...issuedAgency];
    const drafts=quotes.filter(item=>String(item.status||"").toLowerCase().includes("draft")||item.isFormal===false);
    if($("home-document-count"))$("home-document-count").textContent=allDocuments.length.toLocaleString();
    if($("home-product-count"))$("home-product-count").textContent=products.length.toLocaleString();
    if($("home-draft-count"))$("home-draft-count").textContent=drafts.length.toLocaleString();
    try{const customers=await api("/api/customers");if($("home-customer-count"))$("home-customer-count").textContent=customers.length.toLocaleString();}catch(_){if($("home-customer-count"))$("home-customer-count").textContent="—";}
    const labels={quotation:"报价单",invoice:"形式发票",contract:"销售合同",commercial:"商业发票",packing:"装箱单"};
    const recent=[...quotes].sort((a,b)=>String(b.updatedAt||b.createdAt||b.quoteDate||"").localeCompare(String(a.updatedAt||a.createdAt||a.quoteDate||""))).slice(0,5);
    if($("home-recent-documents"))$("home-recent-documents").innerHTML=recent.length?recent.map(item=>`<button type="button" class="home-recent-row" data-home-quote="${escapeHtml(item.id)}"><b>${escapeHtml(item.quoteNumber||"未编号")}</b><span>${escapeHtml(item.buyer?.company||item.buyer?.contact||"未填写客户")}</span><em>${escapeHtml(labels[item.documentType]||"报价单")}</em><i>${escapeHtml(item.status||"已保存")}</i></button>`).join(""):'<p class="home-empty">暂无历史文件</p>';
    renderOverviewRecords();
    const records=BusinessOverview.latest(quotes),monthly=BusinessOverview.month(records);
    const monthlyQuotes=monthly.filter(q=>(q.documentType||'quotation')==='quotation');
    const moneySummary=rows=>Object.entries(BusinessOverview.amounts(rows,quoteTotal)).map(([currency,value])=>escapeHtml(currency)+' '+value.toLocaleString(undefined,{maximumFractionDigits:2})).join('<br>')||'暂无金额';
    const metrics=[['本月报价',monthlyQuotes.length+' 份',moneySummary(monthlyQuotes)],['本月 PI／合同',monthly.filter(q=>['invoice','contract'].includes(q.documentType)).length+' 份','分别统计，不推算成交率'],['本月商业发票',monthly.filter(q=>q.documentType==='commercial').length+' 份',moneySummary(monthly.filter(q=>q.documentType==='commercial'))],['产品资料',products.length+' 条',new Set(products.map(p=>p.templateName||'未分类')).size+' 种产品模板']];
    $('overview-metrics').innerHTML=metrics.map(([label,value,note])=>`<article class="overview-metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');
    $('overview-progress-counts').innerHTML=Object.entries(BusinessOverview.labels).map(([type,label])=>`<button type="button" data-overview-type="${type}"><span>${label}</span><b>${records.filter(q=>(q.documentType||'quotation')===type).length}</b></button>`).join('');
  }

  function renderOverviewRecords(){
    const records=BusinessOverview.filter(quotes,{keyword:$('overview-search')?.value,type:$('overview-type')?.value,from:$('overview-from')?.value,to:$('overview-to')?.value});
    $('overview-record-count').textContent=records.length+' 份';
    $('overview-records-body').innerHTML=records.slice(0,30).map(q=>`<tr><td><button type="button" class="overview-link" data-home-quote="${escapeHtml(q.id)}">${escapeHtml(q.quoteNumber||'未编号')}</button></td><td>${escapeHtml(q.buyer?.company||q.buyer?.contact||'未填写客户')}</td><td>${BusinessOverview.labels[q.documentType||'quotation']||'单证'}</td><td class="amount-cell">${escapeHtml(q.currency||'USD')} ${quoteTotal(q).toLocaleString(undefined,{maximumFractionDigits:2})}</td><td><span class="overview-status">${escapeHtml(q.status||'已保存')}</span></td><td>${escapeHtml(BusinessOverview.dateOf(q))}</td><td><button type="button" data-home-quote="${escapeHtml(q.id)}">打开</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">没有匹配的单证记录</td></tr>';
  }

  const desktopViewMeta={
    home:["首页 · 概览看板","本地离线使用 · 数据仅保存在本机"],
    create:["新建单证","选择需要制作的单证类型"],
    quote:["新建单证","填写业务资料并实时预览"],
    invitation:["商务邀请函","填写来华访问资料并生成正式邀请函"],
    agency:["授权与佣金文件","制作授权书、佣金协议及结算单"],
    history:["历史记录","查找、打开和复用已保存的业务文件"],
    products:["产品库","维护可在单证中直接引用的产品资料"],
    settings:["设置","公司、模板、单证与本机功能设置"],
    data:["管理后台","本机数据、应用锁与使用记录"],
    help:["使用说明","外贸助手功能与本地数据说明"]
  };

  function updateDesktopTopbar(name){
    const [title,subtitle]=desktopViewMeta[name]||["外贸助手","本地离线使用 · 数据仅保存在本机"];
    if($("desktop-page-title"))$("desktop-page-title").textContent=title;
    if($("desktop-page-subtitle"))$("desktop-page-subtitle").textContent=subtitle;
  }

  function switchView(name, options = {}) {
    if (name === "vehicle-quote") name = "quote";
    if (!currentUser && name !== "login") {
      ensureLoginView();
      name = "login";
    }
    if (["users", "data"].includes(name) && !isAdmin()) {
      toast("Admin permission required. / 需要管理员权限。");
      name = "home";
    }
    normalizeUserModuleVisibility();
    if (currentUser && !isAdmin() && Object.prototype.hasOwnProperty.call(settings.userModuleVisibility,name) && settings.userModuleVisibility[name]===false) {
      toast("该功能未向当前用户开放，请联系管理员。");
      name="home";
    }
    if (!options.fromBack && activeViewName && activeViewName !== name && !["login"].includes(activeViewName)) {
      internalViewHistory.push(activeViewName);
      if (internalViewHistory.length > 30) internalViewHistory.shift();
    }
    activeViewName = name;
    updateDesktopTopbar(name);
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    if (name === "history") { renderHistory(); renderInvitationHistory(); loadAgentAuthorizations(); }
    if (name === "home") renderHomeDashboard();
    if (name === "products") { renderProducts(); window.dispatchEvent(new Event("product-library-opened")); }
    if (name === "settings") renderSettings();
    if (name === "users") {
      ensureUserManagerPanel();
      renderUsers();
    }
    if (name === "data") renderAdminOverview();
    if (name === "quote") {
      renderQuoteEditor();
    }
    if (name === "invitation") renderInvitationEditor();
    if (name === "agency") renderAgentAuthorizationEditor();
    if (name === "freight") {
      renderPorts();
      renderFreightRates();
      renderFreightSelectors();
    }
    updateBackButton();
  }

  function goBackInsideApp() {
    let previous = internalViewHistory.pop();
    while (previous === activeViewName) previous = internalViewHistory.pop();
    switchView(previous || "home", { fromBack: true });
  }

  function companyProfileData(source) {
    return structuredClone(Object.fromEntries(Object.entries(source).filter(([key]) => /^(companyName|companyAddress|companyPhone$|companyEmail$|contactPerson$|contactFields$|bankFields$|paymentQrFields$|logoDataUrl$|logoPath$|stampDataUrl$|stampPath$|agencySignature|agencyAuthorizer|invitationCompany|invitationSigner|invitationSignature|businessLine)/.test(key))));
  }

  function storeActiveCompany() {
    settings.companyProfiles ||= [];
    settings.activeCompanyId ||= 'company-default';
    const profile={id:settings.activeCompanyId,data:companyProfileData(settings)};
    const index=settings.companyProfiles.findIndex(p=>p.id===profile.id);
    if(index<0)settings.companyProfiles.push(profile);else settings.companyProfiles[index]=profile;
  }

  async function switchCompanyProfile(id) {
    const previous=structuredClone(settings);
    try {
      collectSettingsDraft();
      storeActiveCompany();
      const profile=settings.companyProfiles.find(p=>p.id===id);
      if(!profile)throw new Error('未找到公司资料');
      for(const key of Object.keys(companyProfileData(settings)))delete settings[key];
      Object.assign(settings,structuredClone(profile.data));
      settings.activeCompanyId=id;
      await api('/api/settings',{method:'PUT',body:JSON.stringify(settings)});
      save(keys.settings,settings);
      renderSettings();
      toast('已切换公司，新建单据将使用所选公司的资料。');
    } catch(error){settings=previous;renderSettings();toast(`公司切换失败：${error.message}`);}
  }

  function blankCompanyProfile() {
    const fields=companyProfileData({...defaultSettings,...settings});
    for(const key of Object.keys(fields)) fields[key]=Array.isArray(fields[key])?[]:'';
    fields.companyNameZh='新公司';
    fields.bankFields=(defaultSettings.bankFields||[]).map(f=>({...f,value:''}));
    fields.paymentQrFields=(defaultSettings.paymentQrFields||[]).map(f=>({...f,value:''}));
    fields.agencySignatureRotation=0;
    fields.invitationSignatureRotation=0;
    return fields;
  }

  async function changeCompanyProfiles(action) {
    const previous=structuredClone(settings);
    try {
      if(!isAdmin())throw new Error('请使用管理员账号管理公司资料');
      if(action==='delete') {
        if((settings.companyProfiles||[]).length<=1)return toast('至少保留一家公司。可以修改当前公司资料，或先新增公司再删除。');
        const name=settings.companyNameZh||settings.companyNameEn||'当前公司';
        if(!confirm(`删除公司“${name}”？该公司的收款资料、公章和签名将从公司列表移除，历史单据和已导出的文件不会删除。`))return;
        settings.companyProfiles=settings.companyProfiles.filter(p=>p.id!==settings.activeCompanyId);
        for(const key of Object.keys(companyProfileData(settings)))delete settings[key];
        const next=settings.companyProfiles[0];Object.assign(settings,structuredClone(next.data));settings.activeCompanyId=next.id;
      } else {
        collectSettingsDraft();storeActiveCompany();
        if(action==='add') {
          for(const key of Object.keys(companyProfileData(settings)))delete settings[key];
          Object.assign(settings,blankCompanyProfile());settings.activeCompanyId=uid('company');storeActiveCompany();
        } else if(!String(settings.companyNameZh||'').trim()&&!String(settings.companyNameEn||'').trim())throw new Error('请至少填写中文或英文公司名称');
      }
      await api('/api/settings',{method:'PUT',body:JSON.stringify(settings)});
      save(keys.settings,settings);renderSettings();
      if(action==='add')document.querySelector('[data-setting="companyNameZh"]')?.focus();
      toast(action==='add'?'空白公司已新增，请填写名称、联系方式和收款资料后保存。':action==='delete'?'公司已删除，历史单据已保留。':'当前公司资料已保存。');
    } catch(error){settings=previous;renderSettings();toast('公司操作失败：'+error.message);}
  }

  function renderSettings() {
    storeActiveCompany();
    const companySelect=$('company-profile-select');
    if(companySelect){companySelect.innerHTML=settings.companyProfiles.map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(p.data.companyNameZh||p.data.companyNameEn)}</option>`).join('');companySelect.value=settings.activeCompanyId;companySelect.onchange=()=>switchCompanyProfile(companySelect.value);}
    for(const [id,action] of [['add-company-profile','add'],['save-company-profile','save'],['delete-company-profile','delete']]){
      if($(id)){ $(id).onclick=()=>changeCompanyProfiles(action);$(id).disabled=!isAdmin(); }
    }
    window.freightWorkspace?.renderSettings();
    ensureUserManagerPanel();
    ensureContactFieldsPanel();
    ensureBankFieldsPanel();
    // Field, customer and trade-term configuration now lives inside each
    // document's own settings page. Do not recreate the retired shared panels.
    normalizeContactFields();
    normalizeBankFields();
    normalizeCustomerQuoteFields();
    normalizePaymentQrFields();
    normalizeQuoteLineColumns();
    normalizeCurrencies();
    normalizeTradeTerms();
    normalizeDocumentTypes();
    normalizeTemplates();
    normalizeCostTemplates();
    normalizeCategories();
    renderUserModuleVisibility();
    document.querySelectorAll("[data-setting]").forEach((input) => {
      if (input.type === "checkbox") input.checked = settings[input.dataset.setting] !== false;
      else input.value = settings[input.dataset.setting] || "";
    });
    renderBankFields();
    renderCustomerQuoteFields();
    renderPaymentQrFields();
    renderQuoteLineColumns();
    renderCurrencies();
    renderTradeTerms();
    renderDocumentTypes();
    $("logo-preview").src = settings.logoDataUrl || "";
    $("logo-preview").hidden = !settings.logoDataUrl;
    $("background-preview").src = settings.backgroundDataUrl || defaultBg;
    $("stamp-preview").src = settings.stampDataUrl || "";
    $("stamp-preview").hidden = !settings.stampDataUrl;
    $("stamp-preview").title = settings.stampDataUrl ? "Electronic seal uploaded / 电子公章已上传" : "No electronic seal / 未上传电子公章";
    renderCompanySignatureSettings();
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
      visible: column.key === "image" && !byKey.has("image") ? true : (byKey.get(column.key)?.visible ?? column.visible),
      system: true
    }));
    existing.filter((column) => column.key !== "tradeTerm" && !defaultQuoteLineColumns.some((item) => item.key === column.key)).forEach((column) => {
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
    panel.dataset.settingsPanel = "quote-settings";
    panel.innerHTML = `
      <div class="row-head">
        <div>
          <h3>二手/常规设备报价字段与排序</h3>
          <p class="hint">这里控制报价明细表格的列名、显示隐藏、必填、排序和自定义列。图片列也可以在这里设置显示或必填。</p>
        </div>
        <div class="actions"><button id="save-quote-line-columns-btn" class="primary" type="button">保存列设置</button><button id="add-quote-line-column-btn" type="button">新增列</button></div>
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
    const paymentInstructions = settings.bankFields.find((field) => field.id === "bank-pay-to");
    if (paymentInstructions && /Please make a SWIFT|请通过\s*SWIFT/i.test(`${paymentInstructions.labelEn} ${paymentInstructions.labelZh}`)) {
      paymentInstructions.labelEn = "Payment Instructions";
      paymentInstructions.labelZh = "付款说明";
      if (!paymentInstructions.value) paymentInstructions.value = "Please make payment via SWIFT (T/T) to the following account. / 请通过 SWIFT（T/T）汇款至以下账户。";
    }
  }

  function normalizeCustomerQuoteFields() {
    const existing = Array.isArray(settings.customerQuoteFields) ? settings.customerQuoteFields : [];
    const byKey = new Map(existing.map((field) => [fieldKeyOf(field), field]));
    settings.customerQuoteFields = defaultSettings.customerQuoteFields.map((field, index) => normalizeField({ ...field, ...(byKey.get(field.fieldKey) || {}), sortOrder:byKey.get(field.fieldKey)?.sortOrder ?? field.sortOrder }, index)).sort((a,b)=>a.sortOrder-b.sortOrder);
    const builtinKeys = new Set(defaultSettings.customerQuoteFields.map(field=>field.fieldKey));
    settings.customerQuoteFields.push(...existing.filter(field=>!builtinKeys.has(fieldKeyOf(field))).map((field,index)=>normalizeField(field,index)));
    settings.quoteSectionTitles = { ...defaultSettings.quoteSectionTitles, ...(settings.quoteSectionTitles || {}) };
    Object.keys(defaultSettings.quoteSectionTitles).forEach((key) => settings.quoteSectionTitles[key] = { ...defaultSettings.quoteSectionTitles[key], ...(settings.quoteSectionTitles[key] || {}) });
  }

  function renderCustomerQuoteFields() {
    const host=$("customer-quote-field-list");
    if(!host)return;
    normalizeCustomerQuoteFields();
    host.innerHTML=renderFieldRows(settings.customerQuoteFields,"customer");
    if(!document.getElementById('add-customer-basic-field')){
      const button=document.createElement('button');button.id='add-customer-basic-field';button.type='button';button.textContent='新增报价基础字段';
      button.onclick=()=>openFieldModal(-1,'customer');host.closest('table').before(button);
    }
    document.querySelectorAll("[data-section-title]").forEach((input)=>{
      const [section,prop]=input.dataset.sectionTitle.split(".");
      input.value=settings.quoteSectionTitles?.[section]?.[prop] || "";
    });
  }

  function ensureCustomerQuoteSettingsPanel() {
    if($("customer-quote-settings-panel"))return;
    const panel=document.createElement("div");
    panel.id="customer-quote-settings-panel";
    panel.className="panel";
    panel.dataset.settingsPanel="quote-settings";
    panel.innerHTML=`<div class="row-head"><div><h3>客户信息与PDF板块名称</h3><p class="hint">可修改客户字段和客户信息、报价明细、条款、银行信息四个PDF板块的中英文名称。</p></div><button id="save-customer-quote-fields-btn" class="primary" type="button">保存客户与板块设置</button></div><div class="form-grid section-title-grid">${Object.entries(defaultSettings.quoteSectionTitles).map(([key,title])=>`<label><span>${title.labelZh}板块中文名</span><input data-section-title="${key}.labelZh"></label><label><span>${title.labelEn} English</span><input data-section-title="${key}.labelEn"></label>`).join("")}</div><table class="field-table"><thead><tr><th>排序</th><th>中文字段名</th><th>英文字段名</th><th>字段</th><th>类型</th><th>必填</th><th>显示</th><th>操作</th></tr></thead><tbody id="customer-quote-field-list"></tbody></table>`;
    $("quote-line-settings-panel")?.before(panel);
    $("customer-quote-field-list").addEventListener("click",handleFieldListClick);
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
    $("company-profile-panel")?.after(panel);
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

  function ensureUserManagerPanel() {  }

  function ensureTermsSettingsPanel() {
    if ($("terms-settings-panel")) return;
    const panel = document.createElement("div");
    panel.id = "terms-settings-panel";
    panel.className = "panel";
    panel.dataset.settingsPanel = "quote-settings";
    panel.innerHTML = `
      <div class="row-head">
        <div>
          <h3>贸易条款设置</h3>
          <p class="hint">维护付款方式、贸易方式、交货时间、起运港、目的港、售后和质保等贸易条款。</p>
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
          <h4>Document Titles / 单据标题</h4>
          <p class="hint">这里控制导出 PDF 顶部的大标题，例如 Quotation 或 Proforma Invoice。</p>
        </div>
        <table class="field-table">
          <thead><tr><th>类型</th><th>英文标题</th><th>中文标题</th></tr></thead>
          <tbody id="document-type-list"></tbody>
        </table>
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

  function renderDocumentTypes() {
    normalizeDocumentTypes();
    if (!$("document-type-list")) return;
    $("document-type-list").innerHTML = settings.documentTypes.map((type, index) => `
      <tr data-document-type-index="${index}">
        <td><b>${escapeHtml(type.key === "invoice" ? "发票" : "报价单")}</b></td>
        <td><input data-document-title="labelEn" value="${escapeHtml(type.labelEn)}" /></td>
        <td><input data-document-title="labelZh" value="${escapeHtml(type.labelZh)}" /></td>
      </tr>
    `).join("");
  }

  function collectDocumentTypes() {
    if (!$("document-type-list")) return;
    normalizeDocumentTypes();
    document.querySelectorAll("#document-type-list tr[data-document-type-index]").forEach((row) => {
      const item = settings.documentTypes[Number(row.dataset.documentTypeIndex)];
      if (!item) return;
      row.querySelectorAll("[data-document-title]").forEach((input) => {
        item[input.dataset.documentTitle] = input.value.trim() || item[input.dataset.documentTitle];
      });
    });
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
      el.hidden = !isAdmin() || (el.hasAttribute("data-settings-panel") && el.dataset.settingsPanel !== activeSettingsSection);
    });
    ["save-settings-btn", "backup-db-btn", "restore-db-btn", "export-data-btn", "import-data-btn"].forEach((id) => {
      const button = $(id);
      if (button) button.hidden = !isAdmin();
    });
  }

  function renderUsers() {  }

  function refreshUsers() {  }

  function clearUserForm() {  }

  function validUsernameInput() {  }

  function saveUser() {  }

  function handleUserAction() {  }

  function renderTemplateSelect(selected) {
    $("template-select").innerHTML = settings.templates.map((t) => `<option ${t.name === selected ? "selected" : ""}>${escapeHtml(t.name)}</option>`).join("");
  }

  function fillTemplateForm(name) {
    normalizeTemplates();
    renderCategoryConfigSelectors();
    const category=settings.categories.find(c=>c.id===$("category-config-select")?.value)||settings.categories[0];
    const condition=$("category-condition-select")?.value||"general";
    const tpl = {name:`${categoryLabel(category)}-${condition}`,desc:"",fields:categoryFieldConfig(category?.id,condition),termFields:settings.templates[0]?.termFields||defaultTermFields};
    if (!tpl) return;
    $("template-name-input").value = tpl.name;
    $("template-desc-input").value = tpl.desc || "";
    renderTemplateSelect(tpl.name);
    renderFieldList(tpl);
    renderTermFieldList({termFields:settings.templates[0]?.termFields||defaultTermFields});
    renderCostFieldLists();
    renderCategoryFieldLibrary();
  }

  function currentTemplate() {
    normalizeTemplates();
    return {name:"分类字段",desc:"",fields:categoryFieldConfig(),termFields:settings.templates[0]?.termFields||defaultTermFields};
  }

  function renderCategoryList() {
    normalizeCategories();
    $("category-list").innerHTML = settings.categories.map((category, index) => {
      const parent = settings.categories.find((item) => item.id === category.parentId);
      return `
      <tr draggable="true" data-category-index="${index}" data-category-id="${escapeHtml(category.id)}">
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

  function openCategoryModal(categoryRef = -1) {
    normalizeCategories();
    const current = typeof categoryRef === "string" ? settings.categories.find((item) => item.id === categoryRef) : (categoryRef >= 0 ? settings.categories[categoryRef] : null);
    editingCategoryId = current?.id || "";
    editingCategoryIndex = current ? settings.categories.findIndex((item) => item.id === current.id) : -1;
    $("category-modal-title").textContent = current ? "编辑分类" : "新增分类";
    $("category-parent-input").innerHTML = `<option value="">Level 1 / 一级分类</option>` + settings.categories
      .filter((item) => item.id !== current?.id && !item.parentId)
      .map((item) => `<option value="${escapeHtml(item.id)}"${item.id === current?.parentId ? " selected" : ""}>${escapeHtml(categoryLabel(item))}</option>`)
      .join("");
    $("category-en-input").disabled = false;
    $("category-en-input").readOnly = false;
    $("category-zh-input").disabled = false;
    $("category-zh-input").readOnly = false;
    $("category-en-input").value = current?.labelEn || "";
    $("category-zh-input").value = current?.labelZh || "";
    $("category-visible-input").value = current?.visible === false ? "false" : "true";
    $("category-modal").hidden = false;
    $("category-en-input").focus();
  }

  function closeCategoryModal() {
    $("category-modal").hidden = true;
  }

  async function saveCategoryFromModal() {
    normalizeCategories();
    const labelEn = $("category-en-input").value.trim();
    const labelZh = $("category-zh-input").value.trim();
    if (!labelEn || !labelZh) return toast("Please enter English and Chinese category names. / 请填写中英文分类名称。");
    const parentId = $("category-parent-input").value;
    const visible = $("category-visible-input").value !== "false";
    const exists = settings.categories.some((item) => normalize(item.labelEn) === normalize(labelEn) && normalize(item.labelZh) === normalize(labelZh) && item.id !== editingCategoryId);
    if (exists) return toast("分类名称已存在。");
    let savedCategory;
    if (editingCategoryId) {
      const targetIndex = settings.categories.findIndex((item) => item.id === editingCategoryId);
      if (targetIndex < 0) return toast("分类已发生变化，请关闭后重新编辑。");
      settings.categories[targetIndex] = { ...settings.categories[targetIndex], labelEn, labelZh, parentId, visible };
      savedCategory=settings.categories[targetIndex];
    } else {
      savedCategory={ id: uid("cat"), labelEn, labelZh, parentId, visible, sortOrder: (settings.categories.length + 1) * 10 };
      settings.categories.push(savedCategory);
    }
    save(keys.settings, settings);
    if(isAdmin()){try{await api("/api/settings",{method:"PUT",body:JSON.stringify(settings)});}catch(error){toast(`分类已保存在本机，但手机端同步失败：${error.message}`);}}
    renderCategoryList();
    renderAllSelectors();
    if(quickCategoryForProduct && $("product-category")){
      $("product-category").value=categoryLabel(savedCategory);
      renderProductDynamicFields();
    }
    quickCategoryForProduct=false;
    editingCategoryId="";
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
    if (action === "edit") openCategoryModal(row.dataset.categoryId);
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
    if (editingFieldTarget === "customer") { normalizeCustomerQuoteFields(); return settings.customerQuoteFields; }
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
    $("field-modal-title").textContent = `${index >= 0 ? "编辑" : "新增"}${costKind ? settings.costTemplates[costKind].name : (target === "terms" ? "条款字段" : (target === "customer" ? "客户字段" : "字段"))}`;
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

  async function saveFieldFromModal() {
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
    renderCustomerQuoteFields();
    closeFieldModal();
    save(keys.settings, settings);
    if (isAdmin()) {
      try { await api("/api/settings", { method:"PUT", body:JSON.stringify(settings) }); }
      catch (error) { return toast(`字段已保存在本机，但手机端同步失败：${error.message}`); }
    }
    renderQuoteTerms();
    renderQuoteItems();
    applyCustomerQuoteFieldLabels();
    renderPreview();
    toast("字段名称和显示设置已保存并应用到报价与PDF。");
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
    editingFieldTarget = event.currentTarget.dataset.costKind ? `cost:${event.currentTarget.dataset.costKind}` : (event.currentTarget.id === "template-term-field-list" ? "terms" : (event.currentTarget.id === "customer-quote-field-list" ? "customer" : "product"));
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

  async function saveSettings() {
    normalizeTemplates();
    normalizeCostTemplates();
    normalizeCategories();
    normalizeCurrencies();
    normalizeDocumentTypes();
    collectSettingsDraft();
    collectQuoteLineColumns();
    document.querySelectorAll("[data-user-module]").forEach(input=>settings.userModuleVisibility[input.dataset.userModule]=input.checked);
    const phone = settings.contactFields.find((field) => normalize(field.labelEn + field.labelZh).includes("phone") || field.labelZh.includes("电话"));
    const email = settings.contactFields.find((field) => normalize(field.labelEn + field.labelZh).includes("email") || field.labelZh.includes("邮箱"));
    const contactPerson = settings.contactFields.find((field) => field.id === "contact-person" || field.labelZh.includes("负责人") || normalize(field.labelEn).includes("quotationcontact"));
    if (contactPerson?.type === "text") settings.contactPerson = contactPerson.value || settings.contactPerson || "";
    if (phone?.type === "text") settings.companyPhone = phone.value || settings.companyPhone || "";
    if (email?.type === "text") settings.companyEmail = email.value || settings.companyEmail || "";
    storeActiveCompany();
    save(keys.settings, settings);
    if (isAdmin()) {
      try { await api("/api/settings", { method:"PUT", body:JSON.stringify(settings) }); }
      catch(error) { return toast(`本机已保存，但主机同步失败：${error.message}`); }
    }
    renderAllSelectors();
    renderCategoryList();
    renderCategoryConfigSelectors();
    renderCategoryFieldLibrary();
    applyUserModuleVisibility();
    applyCustomerQuoteFieldLabels();
    renderQuoteTerms();
    renderPreview();
    renderCostFieldLists();
    toast(isAdmin() ? "设置已保存并同步到电脑和手机端。" : "设置已保存。");
  }

  function collectSettingsDraft() {
    collectContactFields();
    collectBankFields();
    collectPaymentQrFields();
    collectDocumentTypes();
    normalizeCustomerQuoteFields();
    document.querySelectorAll("[data-section-title]").forEach((input)=>{ const [section,prop]=input.dataset.sectionTitle.split("."); if(settings.quoteSectionTitles[section]) settings.quoteSectionTitles[section][prop]=input.value.trim() || settings.quoteSectionTitles[section][prop]; });
    document.querySelectorAll("[data-setting]").forEach((input) => {
      settings[input.dataset.setting] = input.type === "checkbox" ? input.checked : input.value.trim();
    });
  }

  async function updateSettingsAsset(input, key, message) {
    const file = input.files?.[0];
    if (!file) return;
    collectSettingsDraft();
    settings[key] = await fileToDataUrl(file);
    storeActiveCompany();
    input.value = "";
    save(keys.settings, settings);
    if (isAdmin()) {
      try { await api("/api/settings", { method: "PUT", body: JSON.stringify(settings) }); }
      catch (error) { renderSettings(); return toast(`图片已保存在本机，但手机端同步失败：${error.message}`); }
    }
    renderSettings();
    renderPreview();
    toast(`${message} 已自动保存并应用到PDF。`);
  }

  async function clearSettingsAsset(key, message) {
    collectSettingsDraft();
    settings[key] = "";
    storeActiveCompany();
    save(keys.settings, settings);
    if (isAdmin()) {
      try { await api("/api/settings", { method: "PUT", body: JSON.stringify(settings) }); }
      catch (error) { renderSettings(); return toast(`本机已删除，但手机端同步失败：${error.message}`); }
    }
    renderSettings();
    renderPreview();
    toast(message);
  }

  async function waitForPrintableImages(root = document) {
    const images = [...root.querySelectorAll("img")].filter((img) => img.src && !img.closest(".no-print"));
    await Promise.all(images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      try {
        await Promise.race([
          typeof img.decode === "function" ? img.decode() : new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("image timeout")), 5000))
        ]);
      } catch (_) { /* Broken optional images must not block the whole PDF export. */ }
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function saveTemplate() {
    const old = currentTemplate();
    settings.categoryFieldConfigs[categoryConfigKey()] = (old?.fields || []).map(normalizeField).sort((a,b)=>a.sortOrder-b.sortOrder);
    save(keys.settings, settings);
    renderAllSelectors();
    fillTemplateForm();
    toast("当前产品分类的字段设置已保存。");
  }

  function deleteTemplate() {
    delete settings.categoryFieldConfigs[categoryConfigKey()];
    save(keys.settings, settings);
    fillTemplateForm();
    toast("已恢复该分类的默认字段。");
  }

  function renderAllSelectors() {
    normalizeTemplates();
    normalizeCategories();
    normalizeCurrencies();
    normalizeTradeTerms();
    const catOptions = settings.categories
      .filter((c) => c.visible !== false && isProductCategory(c))
      .map((c) => `<option value="${escapeHtml(categoryLabel(c))}">${escapeHtml(categoryFullLabel(c))}</option>`)
      .join("");
    if($("product-category")) $("product-category").innerHTML = catOptions;
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
      const [productData, portData, freightData, routeData] = await Promise.all([
        api("/api/products"),
        api("/api/ports"),
        api("/api/freight-rates"),
        api("/api/country-routes")
      ]);
      serverProducts = productData.products || [];
      const mergedProducts = new Map(serverProducts.map((product) => [product.id, toLegacyProduct(product)]));
      products.forEach((product) => {
        const serverProduct = mergedProducts.get(product.id);
        mergedProducts.set(product.id, serverProduct ? { ...product, ...serverProduct, imageDataUrl: product.imageDataUrl || serverProduct.imageDataUrl || "" } : product);
      });
      products = Array.from(mergedProducts.values());
      const knownCategories=new Set(settings.categories.map(c=>normalize(`${c.labelEn}${c.labelZh}${categoryLabel(c)}`)));
      let addedCategory=false;
      [...new Set(products.map(p=>String(p.category||"").trim()).filter(Boolean))].forEach((name,index)=>{
        if (["freight","sea freight","trucking","custom charge","运费","海运费","陆路运输费","自定义费用"].some(x=>normalize(name).includes(normalize(x)))) return;
        const key=normalize(name); if([...knownCategories].some(k=>k.includes(key)||key.includes(k)))return;
        const parts=name.split("/").map(x=>x.trim()).filter(Boolean);
        settings.categories.push({id:uid("cat"),labelEn:parts[1]||parts[0]||name,labelZh:parts[0]||name,parentId:"",visible:true,sortOrder:(settings.categories.length+index+1)*10});
        knownCategories.add(key); addedCategory=true;
      });
      if(addedCategory)save(keys.settings,settings);
      ports = portData.ports || [];
      freightRates = freightData.freightRates || [];
      countryRoutes = routeData.routes || [];
      if (isAdmin()) {
        const userData = await api("/api/users");
        users = userData.users || [];
        renderUsers();
      }
      renderAllSelectors();
      renderProducts();
    } catch (error) {
      toast(error.message);
    }
  }

  function renderFreightSelectors() {
    const commonPanel = document.querySelector(".freight-common-panel");
    const calculatorPanel = document.querySelector(".freight-calculator-panel");
    if (commonPanel && calculatorPanel && commonPanel.nextElementSibling !== calculatorPanel) commonPanel.after(calculatorPanel);
    const volumePanel = document.querySelector(".freight-volume-panel");
    if (calculatorPanel && volumePanel && calculatorPanel.nextElementSibling !== volumePanel) calculatorPanel.after(volumePanel);
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
    renderCalcProductSuggestions();
    renderCommonFreightRoutes();
    renderVolumeProducts();
    renderCountryOptions();
  }

  function freightProductLabel(product) {
    return `${product.brand || ""} ${product.model || ""}`.trim() + (product.transportCbm ? ` · ${Number(product.transportCbm)} m³` : "");
  }

  function selectFreightProductFromSearch() {
    const query = normalize($("calc-product-search")?.value || "");
    const product = products.find((p) => normalize(freightProductLabel(p)) === query)
      || products.find((p) => query && normalize(`${p.brand} ${p.model} ${p.aliases || ""}`).includes(query));
    $("calc-product").value = product?.id || "";
    if (!product) return;
    $("calc-product-search").value = freightProductLabel(product);
    $("calc-cbm").value = product.transportCbm || "";
  }

  function renderCalcProductSuggestions() {
    const host = $("calc-product-suggestions");
    if (!host) return;
    const query = normalize($("calc-product-search")?.value || "");
    if (!query) { host.hidden = true; host.innerHTML = ""; return; }
    const matches = products.filter((p) => Number(p.transportCbm || 0) > 0 && normalize(`${p.brand} ${p.model} ${p.aliases || ""}`).includes(query)).slice(0, 8);
    host.innerHTML = matches.map((p) => `<button type="button" data-calc-product-id="${p.id}"><b>${escapeHtml(`${p.brand || ""} ${p.model || ""}`.trim())}</b><span>${Number(p.transportCbm)} m³</span></button>`).join("");
    host.hidden = matches.length === 0;
  }

  function chooseCalcProduct(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    $("calc-product").value = product.id;
    $("calc-product-search").value = freightProductLabel(product);
    $("calc-cbm").value = product.transportCbm || "";
    $("calc-weight").value = product.weight || "";
    $("calc-product-suggestions").hidden = true;
  }

  function syncFreightCalculationMode() {
    const method = $("calc-method")?.value || "Bulk Cargo";
    const container = method === "Container";
    $("calc-billing-mode").value = container ? "container" : "cbm";
    if (container && !$("calc-container-type").value) $("calc-container-type").value = "40HQ";
  }

  function renderCommonFreightRoutes() {
    if (window.freightWorkspace) return window.freightWorkspace.render();
    const host = $("common-freight-routes");
    if (!host) return;
    const preferred = ["port-durban", "port-lagos-apapa", "port-beira"];
    host.innerHTML = preferred.map((destinationId) => {
      const port = ports.find((p) => p.id === destinationId);
      if (!port) return "";
      const rates = freightRates.filter((r) => r.originPortId === "port-shanghai" && r.destinationPortId === destinationId)
        .sort((a, b) => String(b.effectiveMonth).localeCompare(String(a.effectiveMonth)));
      const latestByType = [...new Map(rates.map((r) => [`${r.shippingMethod}-${r.containerType || ""}`, r])).values()].slice(0, 3);
      return `<button type="button" class="freight-route-card" data-common-route="${destinationId}">
        <b>中国上海 → ${escapeHtml(port.countryChineseName || port.countryName)}${escapeHtml(port.portChineseName || port.portName)}</b>
        ${latestByType.length ? latestByType.map((r) => `<span>${escapeHtml(r.shippingMethod === "Bulk Cargo" ? "散杂" : r.shippingMethod === "Flat Rack" ? "框架" : (r.containerType || "集装箱"))}：USD ${Number(r.rate).toLocaleString("en-US")} ${r.billingMode === "container" ? "/ 柜" : "/ m³"}</span>`).join("") : `<span>暂无保存运价，点击后可录入</span>`}
      </button>`;
    }).join("");
  }

  function renderCountryRoutes() {
    const host = $("country-route-results");
    if (!host) return;
    const q = normalize($("route-country-search")?.value || "");
    const rows = countryRoutes.filter((route) => !q || normalize(route.customerCountry).includes(q));
    host.innerHTML = rows.map((route) => `<article class="freight-route-card route-result-card">
      <b>${escapeHtml(route.customerCountry)} → ${escapeHtml(route.destinationDisplayName)}</b>
      <span>实际卸货国：${escapeHtml(route.dischargeCountry || route.destinationCountry || "未填写")} ${route.unLocode ? `· ${escapeHtml(route.unLocode)}` : ""}</span>
      <span>${route.isFavorite ? "★ 常用路线" : "普通路线"}${route.remark ? ` · ${escapeHtml(route.remark)}` : ""}</span>
      <span class="actions"><button type="button" data-route-use="${escapeHtml(route.id)}">带入运费计算</button>${isAdmin()?`<button type="button" data-route-delete="${escapeHtml(route.id)}">停用</button>`:""}</span>
    </article>`).join("") || `<p class="empty">暂无关联路线，可由管理员在下方新增；也可直接搜索港口、口岸或站点。</p>`;
    if ($("country-route-admin")) $("country-route-admin").hidden = !isAdmin();
  }

  function renderCalcCountryRoutes() {
    if (window.freightWorkspace) return window.freightWorkspace.renderCountries();
    const host = $("calc-country-routes");
    if (!host) return;
    const q = normalize($("calc-country")?.value || "");
    if (!q) { host.innerHTML = '<p class="hint">选择客户目的国后，这里会推荐本国或邻国可用港口。</p>'; return; }
    const rows = countryRoutes.filter((route) => normalize(route.customerCountry).includes(q) || q.includes(normalize(route.customerCountry)));
    host.innerHTML = rows.map((route) => `<button type="button" class="freight-route-card" data-calc-route="${escapeHtml(route.id)}"><b>${escapeHtml(route.destinationDisplayName)}</b><span>${escapeHtml(route.dischargeCountry || route.destinationCountry || "")} ${route.unLocode ? `· ${escapeHtml(route.unLocode)}` : ""}</span><span>${route.isFavorite ? "★ 推荐路线" : "可选路线"}${route.remark ? ` · ${escapeHtml(route.remark)}` : ""}</span></button>`).join("") || '<p class="empty">暂无推荐港口。请到“设置 → 国家、港口与运费设置”添加关联。</p>';
  }

  function useCalcCountryRoute(routeId) {
    const route = countryRoutes.find((item) => item.id === routeId);
    if (!route) return;
    setPortInputValue("calc-destination", route.destinationPortId);
    if (!$("calc-origin").value) setPortInputValue("calc-origin", "port-shanghai");
    const latest = freightRates.filter((rate) => rate.destinationPortId === route.destinationPortId).sort((a,b)=>String(b.quoteDate||b.effectiveMonth).localeCompare(String(a.quoteDate||a.effectiveMonth)))[0];
    if (latest) {
      $("calc-method").value = latest.shippingMethod;
      $("calc-billing-mode").value = latest.billingMode || "cbm";
      $("calc-container-type").value = latest.containerType || "";
      $("calc-rate").value = latest.rateStatus === "pending" ? "" : latest.rate;
      $("calc-currency").value = latest.currency || "USD";
    }
  }

  async function saveCountryRoute() {
    const destinationPortId = portInputId("route-destination", false);
    const payload = {customerCountry:$("route-customer-country").value.trim(),dischargeCountry:$("route-discharge-country").value.trim(),destinationPortId,isFavorite:$("route-favorite").checked,sortOrder:$("route-sort").value,remark:$("route-remark").value.trim()};
    if (!payload.customerCountry || !destinationPortId) return toast("请选择客户目的国，并从候选项选择目的港、口岸或铁路站点。");
    await api("/api/country-routes",{method:"POST",body:JSON.stringify(payload)});
    $("route-country-search").value=payload.customerCountry;
    ["route-customer-country","route-discharge-country","route-destination","route-remark"].forEach(id=>$(id).value="");
    await loadServerData();
    toast("国家与运输路线关联已保存。");
  }

  async function handleCountryRoute(event) {
    const use=event.target.closest("[data-route-use]"),del=event.target.closest("[data-route-delete]");
    const route=countryRoutes.find(item=>item.id===(use?.dataset.routeUse||del?.dataset.routeDelete));
    if(!route)return;
    if(del){if(!confirm("确认停用这条国家路线关联吗？"))return;await api(`/api/country-routes/${route.id}`,{method:"DELETE"});await loadServerData();return;}
    setPortInputValue("calc-destination",route.destinationPortId);
    if(!$(("calc-origin")).value)setPortInputValue("calc-origin","port-shanghai");
    const latest=freightRates.filter(rate=>rate.destinationPortId===route.destinationPortId).sort((a,b)=>String(b.quoteDate||b.effectiveMonth).localeCompare(String(a.quoteDate||a.effectiveMonth)))[0];
    if(latest){$("calc-method").value=latest.shippingMethod;$("calc-billing-mode").value=latest.billingMode||"cbm";$("calc-container-type").value=latest.containerType||"";$("calc-rate").value=latest.rateStatus==="pending"?"":latest.rate;}
    if(latest&&$("calc-currency"))$("calc-currency").value=latest.currency||"USD";
    $("calc-product-search").focus();
  }

  function renderVolumeProducts() {
    const host = $("volume-product-list");
    if (!host) return;
    const q = normalize($("volume-product-search")?.value || "");
    const list = products.filter((p) => Number(p.transportCbm || 0) > 0 && (!q || normalize(`${p.brand} ${p.model} ${p.aliases || ""}`).includes(q)));
    host.innerHTML = list.map((p) => `<article class="list-item"><div><b>${escapeHtml(p.brand)} ${escapeHtml(p.model)}</b><p>运输体积：${Number(p.transportCbm)} m³ · ${escapeHtml(p.category || "未分类")}</p></div><div class="actions"><button type="button" data-volume-action="use" data-id="${p.id}">引用计算</button><button type="button" data-volume-action="delete" data-id="${p.id}">删除</button></div></article>`).join("") || `<p class="empty">还没有保存常用货物体积。</p>`;
  }

  async function saveVolumeProduct() {
    const brand = $("volume-brand").value.trim();
    const model = $("volume-model").value.trim();
    const transportCbm = Number($("volume-cbm").value || 0);
    if (!model || transportCbm <= 0) return toast("请填写货物型号和正确的运输体积。");
    const existing = products.find((p) => normalize(`${p.brand}|${p.model}`) === normalize(`${brand}|${model}`));
    if (existing) await api(`/api/products/${existing.id}/cbm`, { method: "PATCH", body: JSON.stringify({ transportCbm, dimensionUnit: "meter" }) });
    else await api("/api/products", { method: "POST", body: JSON.stringify({ category: "常用运输货物", brand, model, transportCbm, dimensionUnit: "meter", transportMethod: "Bulk Cargo", condition: "Used", remark: "运费查询中保存的常用体积" }) });
    $("volume-brand").value = $("volume-model").value = $("volume-cbm").value = "";
    await loadServerData();
    toast("货物体积已保存，并与产品库同步。");
  }

  async function handleVolumeProductAction(event) {
    const button = event.target.closest("[data-volume-action]");
    if (!button) return;
    const product = products.find((p) => p.id === button.dataset.id);
    if (!product) return;
    if (button.dataset.volumeAction === "use") {
      $("calc-product-search").value = freightProductLabel(product);
      selectFreightProductFromSearch();
      return $("calc-cbm").focus();
    }
    if (!confirm(`确认删除 ${product.brand || ""} ${product.model} 的常用体积资料吗？`)) return;
    const result = await api(`/api/products/${product.id}`, { method: "DELETE" });
    await loadServerData();
    toast(result.mode === "inactive" ? "该产品已被历史数据引用，现已停用，历史报价不受影响。" : "常用体积资料已删除。");
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
    const activeRegion=$("port-region-tabs")?.dataset.active||"全部", destinations=ports.filter(isWorldDestinationPort), regions=["全部",...portRegionOrder.filter(r=>destinations.some(p=>portRegion(p)===r))];
    if($("port-region-tabs")){$("port-region-tabs").innerHTML=regions.map(r=>`<button type="button" class="${r===activeRegion?'active':''}" data-region="${escapeHtml(r)}">${escapeHtml(r)}</button>`).join("");$("port-region-tabs").dataset.active=regions.includes(activeRegion)?activeRegion:"全部";}
    const selected=$("port-region-tabs")?.dataset.active||"全部",list=destinations.filter(p=>(selected==="全部"||portRegion(p)===selected)&&(!q||normalize(`${p.displayName}${p.portChineseName}${p.aliases}${p.unLocode}${p.countryChineseName}`).includes(q)));
    const groups=new Map();list.forEach(p=>{const k=`${p.countryChineseName||p.countryName} / ${p.countryName}`;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p);});
    $("port-list").innerHTML = [...groups.entries()].map(([country,ps])=>`<details class="port-country-group" open><summary>${escapeHtml(country)} <span>${ps.length} 个港口</span></summary>${ps.map((p) => `
      <article class="list-item">
        <div><b>${escapeHtml(portOptionLabel(p))}</b><p>${escapeHtml(portRegion(p))} | ${escapeHtml(p.unLocode)} | ${escapeHtml(p.status)}</p><p>${escapeHtml(p.aliases)}</p></div>
        <div class="actions">
          <button type="button" data-port-action="copy" data-id="${p.id}">Copy / 复制</button>
          <button type="button" data-port-action="edit" data-id="${p.id}">Edit / 编辑</button>
          <button type="button" data-port-action="delete" data-id="${p.id}">Delete / 删除</button>
        </div>
      </article>`).join("")}</details>`).join("") || `<p class="empty">No port found. / 未找到港口。</p>`;
  }

  function addLogisticsFee(name="报关费",value=""){const host=$("logistics-fee-list");host.insertAdjacentHTML("beforeend",`<div class="logistics-fee-row"><input data-fee-name list="logistics-fee-name-options" value="${escapeHtml(name)}" placeholder="下拉选择或输入费用名称"><select data-fee-mode><option value="amount">固定金额</option><option value="percent">百分比 %</option></select><input data-fee-value type="number" value="${escapeHtml(value)}" placeholder="金额/比例"><label><input data-fee-include type="checkbox" checked>计入总额</label><button type="button" data-remove-fee>删除</button></div>`);}
  function logisticsFees(){return [...document.querySelectorAll(".logistics-fee-row")].map(r=>({name:r.querySelector("[data-fee-name]").value,mode:r.querySelector("[data-fee-mode]").value,value:Number(r.querySelector("[data-fee-value]").value||0),includeInTotal:r.querySelector("[data-fee-include]").checked})).filter(x=>x.name);}

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
        <div><b>${escapeHtml(r.originDisplayName)} → ${escapeHtml(r.destinationDisplayName)}</b><p>${escapeHtml(r.shippingMethod === "Bulk Cargo" ? "散杂运输" : r.shippingMethod === "RORO" ? "滚装运输" : r.shippingMethod === "Flat Rack" ? "框架运输" : (r.containerType ? `集装箱 ${r.containerType}` : "集装箱运输"))} | ${r.rateStatus==="pending"?"待询价":`${escapeHtml(r.currency||"USD")} ${Number(r.rate).toLocaleString("en-US")} / ${({cbm:"m³",ton:"吨",unit:"台",container:"柜"})[r.billingMode]||"项"}`} | ${escapeHtml(r.freightForwarder||"未填写货代")} | ${escapeHtml(r.validUntil||r.effectiveMonth)} ${r.validUntil&&r.validUntil<today()?"· 已过期":""}</p><p>包含：${escapeHtml((r.includedFees||[]).join("、")||"未说明")}；不含：${escapeHtml((r.excludedFees||[]).join("、")||"未说明")}</p><p>${escapeHtml(r.remark)}</p></div>
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
    ["freight-origin", "freight-destination", "freight-rate", "freight-agent", "freight-remark","freight-transit-days","freight-cargo-limit","freight-included","freight-excluded","freight-valid-until"].forEach((id) => {if($(id))$(id).value = "";});
    $("freight-method").value = "Bulk Cargo";
    $("freight-container-type").value = "";
    if($("freight-billing-mode"))$("freight-billing-mode").value="cbm";
    if($("freight-currency"))$("freight-currency").value="USD";
    if($("freight-quote-date"))$("freight-quote-date").value=today();
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
      billingMode: $("freight-billing-mode").value,
      containerType: $("freight-method").value === "Container" ? ($("freight-container-type").value || "40HQ") : "",
      currency: $("freight-currency").value,
      rateUnit: ({cbm:"per CBM",ton:"per ton",unit:"per unit",container:"per container"})[$("freight-billing-mode").value],
      effectiveMonth: $("freight-month").value || new Date().toISOString().slice(0, 7),
      quoteDate: $("freight-quote-date").value || today(), validUntil:$("freight-valid-until").value,
      freightForwarder: $("freight-agent").value.trim(),
      transitDays:$("freight-transit-days").value.trim(),cargoLimit:$("freight-cargo-limit").value.trim(),
      includedFees:$("freight-included").value.split(/[,，]/).map(v=>v.trim()).filter(Boolean),excludedFees:$("freight-excluded").value.split(/[,，]/).map(v=>v.trim()).filter(Boolean),
      rateStatus:$("freight-rate").value===""?"pending":"quoted",
      remark: $("freight-remark").value.trim()
    };
    if (!payload.originPortId || !payload.destinationPortId) return toast("保存运费库需要从港口库候选里选择起运地和目的港/口岸/站点。运价可以留空并保存为待询价。");
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
      $("calc-billing-mode").value = rate.billingMode || (rate.shippingMethod === "Container" ? "container" : "cbm");
      $("calc-container-type").value = rate.containerType || (rate.shippingMethod === "Container" ? "40HQ" : "");
      $("calc-rate").value = rate.rate;
      if ($("calc-currency")) $("calc-currency").value = rate.currency || "USD";
      switchView("freight");
      return toast("Imported to quotation successfully. / 已成功导入报价单。");
    }
    if (action === "edit") {
      editingFreightId = rate.id;
      setPortInputValue("freight-origin", rate.originPortId);
      setPortInputValue("freight-destination", rate.destinationPortId);
      $("freight-method").value = rate.shippingMethod;
      $("freight-container-type").value = rate.containerType || "";
      $("freight-rate").value = rate.rateStatus === "pending" ? "" : rate.rate;
      if ($("freight-currency")) $("freight-currency").value = rate.currency || "USD";
      if ($("freight-billing-mode")) $("freight-billing-mode").value = rate.billingMode || "cbm";
      $("freight-month").value = rate.effectiveMonth;
      if ($("freight-quote-date")) $("freight-quote-date").value = rate.quoteDate || "";
      if ($("freight-valid-until")) $("freight-valid-until").value = rate.validUntil || "";
      $("freight-agent").value = rate.freightForwarder;
      if ($("freight-transit-days")) $("freight-transit-days").value = rate.transitDays || "";
      if ($("freight-cargo-limit")) $("freight-cargo-limit").value = rate.cargoLimit || "";
      if ($("freight-included")) $("freight-included").value = (rate.includedFees || []).join("，");
      if ($("freight-excluded")) $("freight-excluded").value = (rate.excludedFees || []).join("，");
      $("freight-remark").value = rate.remark;
      return;
    }
    if (!confirm("Are you sure you want to delete this freight rate?\n确认删除这条运费吗？")) return;
    const result = await api(`/api/freight-rates/${rate.id}`, { method: "DELETE" });
    await loadServerData();
    toast(`${result.message} / ${result.zh}`);
  }

  async function autoCalculateFreight() {
    // A typed model is not a selection. Preserve manually edited transport data.
    const product = products.find((p) => p.id === $("calc-product").value);
    if (product && !$("calc-cbm").value) {
      $("calc-cbm").value = product.transportCbm || "";
      if($("calc-weight")&&!$("calc-weight").value)$("calc-weight").value=product.weight||"";
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
        rate = rateInfo.rateStatus==="pending"?"":rateInfo.rate;
        $("calc-rate").value = rate;
        if ($("calc-currency")) $("calc-currency").value = rateInfo.currency || "USD";
        $("calc-billing-mode").value=rateInfo.billingMode||"cbm";
        if(rateInfo.containerType)$("calc-container-type").value=rateInfo.containerType;
        if (data.fallback) toast(`${data.message} / ${data.zh}`);
      } else {
        toast("No freight rate found. Please enter freight manually or add a new freight rate. / 未找到运费，请手动输入或新增运费。");
      }
    } else if ((originInput || destinationInput) && !rate && (!originPortId || !destinationPortId)) {
      toast("手动输入港口时不会自动匹配运费库，请手动填写运费单价。");
    }
    const cbm = $("calc-cbm").value;
    const qty = $("calc-qty").value || 1;
    const calculationCurrency=$("calc-currency")?.value||rateInfo?.currency||"USD";
    const data = await api("/api/freight/calculate", { method: "POST", body: JSON.stringify({ transportCbm: looseNumber(cbm),weight:looseNumber($("calc-weight")?.value), freightRate: rate === "" ? "" : looseNumber(rate), quantity: looseNumber(qty)||1,billingMode:$("calc-billing-mode").value,containerType:$("calc-container-type").value,containerCount:looseNumber($("calc-container-count").value)||1,minimumCharge:rateInfo?.minimumCharge||0,chargeRule:rateInfo?.chargeRule||"standard",fees:logisticsFees(),currency:calculationCurrency }) });
    $("calc-amount").value = data.freightAmount ?? "";
    if(data.complete===false)return toast(data.zh||"运价待询或需要人工核价。");
    lastFreightCalculation = {
      productId: product?.id || "",
      productName: product ? `${product.brand} ${product.model}` : "",
      transportCbm: looseNumber(cbm),
      weight:looseNumber($("calc-weight")?.value),
      freightRate: looseNumber(rate),
      currency: calculationCurrency,
      quantity: looseNumber(qty)||1,
      freightAmount: data.freightAmount,
      baseFreight:data.baseFreight,feeItems:data.fees,billingMode:$("calc-billing-mode").value,containerType:$("calc-container-type").value,containerCount:looseNumber($("calc-container-count").value),
      calculationFormula: data.calculationFormula,
      originPortId,
      destinationPortId,
      originDisplayName: ports.find((p) => p.id === originPortId)?.displayName || originInput,
      destinationDisplayName: ports.find((p) => p.id === destinationPortId)?.displayName || destinationInput,
      shippingMethod,
      freightRateId: rateInfo?.id || "",
      freightEffectiveMonth: rateInfo?.effectiveMonth || ""
    };
    $("calc-result").textContent = `${lastFreightCalculation.calculationFormula} / Sea Freight 海运费: ${money(data.freightAmount, calculationCurrency)}`;
  }

  async function copyFreightAmount() {
    const amount = $("calc-amount").value;
    if (!amount) return toast("Please calculate freight first. / 请先计算运费。");
    await navigator.clipboard.writeText(money(looseNumber(amount), $("calc-currency")?.value || "USD"));
    toast("Copied successfully. / 复制成功。");
  }

  function looseNumber(value) {
    const normalized=String(value??"").trim().replace(/，/g,",").replace(/\s/g,"").replace(/,/g,"");
    const number=Number(normalized);
    return Number.isFinite(number)?number:0;
  }

  function manualFreightSnapshot() {
    const amount=looseNumber($("calc-amount")?.value);
    if(!amount)return null;
    const originInput=$("calc-origin")?.value.trim()||"",destinationInput=$("calc-destination")?.value.trim()||"";
    const originPortId=portInputId("calc-origin",true),destinationPortId=portInputId("calc-destination",false);
    const product=products.find(p=>p.id===$("calc-product")?.value);
    return {productId:product?.id||"",productName:product?`${product.brand||""} ${product.model||""}`.trim():$("calc-product-search")?.value.trim()||"",transportCbm:looseNumber($("calc-cbm")?.value),weight:looseNumber($("calc-weight")?.value),freightRate:amount,currency:$("calc-currency")?.value||"USD",quantity:1,freightAmount:amount,baseFreight:amount,feeItems:logisticsFees(),billingMode:"fixed",containerType:$("calc-container-type")?.value||"",containerCount:looseNumber($("calc-container-count")?.value),calculationFormula:`Manual total / 手工海运费总额：${amount}`,originPortId,destinationPortId,originDisplayName:ports.find(p=>p.id===originPortId)?.displayName||originInput,destinationDisplayName:ports.find(p=>p.id===destinationPortId)?.displayName||destinationInput,shippingMethod:$("calc-method")?.value||"Bulk Cargo",freightRateId:"",freightEffectiveMonth:"",manualAmount:true};
  }

  function useFreightInQuotation() {
    if (!currentQuote) return toast("Please create a quotation first. / 请先新建报价。");
    const manual=manualFreightSnapshot();
    if(manual&&(!lastFreightCalculation||looseNumber($("calc-amount").value)!==Number(lastFreightCalculation.freightAmount)))lastFreightCalculation=manual;
    if (!lastFreightCalculation) return toast("请先自动计算运费，或者直接在“海运费”框中输入总金额。");
    if(confirm(`确认把 ${lastFreightCalculation.currency||"USD"} ${Number(lastFreightCalculation.freightAmount||0).toLocaleString()} 填入当前单证的海运费字段？`)) importFreightToUsed();
  }
  function importFreightToUsed(){
    if(!lastFreightCalculation)return;
    collectQuoteFromForm();
    const route=`${lastFreightCalculation.originDisplayName} → ${lastFreightCalculation.destinationDisplayName}`;
    const billingUnit=({cbm:"m³",ton:"吨",container:"柜",unit:"台",fixed:"项"})[lastFreightCalculation.billingMode]||"项";
    const qty=lastFreightCalculation.billingMode==="cbm"?lastFreightCalculation.transportCbm:lastFreightCalculation.billingMode==="ton"?lastFreightCalculation.weight:lastFreightCalculation.billingMode==="container"?lastFreightCalculation.containerCount:lastFreightCalculation.quantity;
    currentQuote.items.push({id:uid("item"),kind:"freight",values:{itemType:"海运费",productType:"海运费",itemName:"Sea Freight / 海运费",description:route,route,shippingMethod:lastFreightCalculation.shippingMethod,qty,billingUnit,unitPrice:lastFreightCalculation.freightRate,currency:lastFreightCalculation.currency||"USD",remark:lastFreightCalculation.calculationFormula},imageDataUrl:"",freightSnapshot:structuredClone(lastFreightCalculation)});
    (lastFreightCalculation.feeItems||[]).filter(fee=>fee.includeInTotal!==false&&Number(fee.amount||0)!==0).forEach((fee)=>{
      const text=String(fee.name||"");
      const kind=/保险/.test(text)?"insurance":/拆|装/.test(text)?"handling":/报关|港杂/.test(text)?"port":/国内|陆运/.test(text)?"trucking":"custom";
      const itemType=({insurance:"保险费",handling:"拆装费",port:"港杂及报关费",trucking:"国内运输费",custom:"其他费用"})[kind];
      currentQuote.items.push({id:uid("item"),kind,values:{itemType,productType:itemType,itemName:fee.name||itemType,description:fee.name||itemType,route,qty:"1",billingUnit:"项",unitPrice:Number(fee.amount||0),currency:lastFreightCalculation.currency||"USD",remark:"随本次物流方案自动引用，可在本次报价内修改"},imageDataUrl:"",freightSnapshot:structuredClone(lastFreightCalculation)});
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
    // Incomplete documents may be exported; formal validation stays in saveQuote(true).
    syncQuoteSequenceFromNumber(currentQuote.quoteNumber);
    await waitForPrintableImages($("quote-preview"));
    const fileName = currentPdfFileName();
    if (window.quotationDesktop?.exportCurrentPdf) {
      document.body.classList.add("printing-standard");
      let filePath;
      try { filePath = await window.quotationDesktop.exportCurrentPdf(fileName); }
      finally { document.body.classList.remove("printing-standard"); }
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
    ["product-transport-length","product-transport-width","product-transport-height","product-transport-cbm","product-weight"].forEach(id => { if ($(id)) $(id).value = ""; });
    if ($("product-dimension-unit")) $("product-dimension-unit").value = "meter";
    if ($("product-transport-method")) $("product-transport-method").value = "Bulk Cargo";
    ["product-inventory-code","product-condition","product-year","product-working-hours","product-specific-price","product-smart-paste"].forEach(id=>{if($(id))$(id).value="";});
    if($("product-record-type"))$("product-record-type").value="model";
    if($("product-model-reference"))$("product-model-reference").value="";
    if($("product-currency"))$("product-currency").value="USD";
    if($("product-transport-status"))$("product-transport-status").value="reference";
    if($("product-smart-preview"))$("product-smart-preview").innerHTML="";
    if($("product-smart-apply"))$("product-smart-apply").hidden=true;
    renderProductTransportPlans([]);
    if ($("save-product-btn")) $("save-product-btn").textContent = "保存产品";
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
      .filter((field) => !field.deletedAt && field.active !== false && field.fieldType !== "calculated" && field.fieldType !== "image");
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
    if (field.fieldType === "checkbox") return `<input data-product-field="${key}" type="checkbox" ${value===true||value==='true'?'checked':''} />`;
    if (["select","dictionary","hierarchy"].includes(field.fieldType)) {
      const options=(field.options||[]).filter(option=>option.active!==false);
      const optionDepth=(option)=>{let depth=0,parent=option.parentId,guard=0;while(parent&&guard++<20){depth+=1;parent=options.find(item=>item.id===parent)?.parentId||'';}return depth;};
      return `<select data-product-field="${key}"><option value="">请选择</option>${options.map(option=>`<option value="${escapeHtml(option.value)}" ${String(value)===String(option.value)?'selected':''}>${'　'.repeat(optionDepth(option))}${escapeHtml(option.labelZh||option.value)} / ${escapeHtml(option.labelEn||option.value)}</option>`).join('')}</select>`;
    }
    if (field.fieldType === "combobox") {
      const listId=`product-options-${key}`;
      return `<input data-product-field="${key}" list="${listId}" value="${val}" /><datalist id="${listId}">${(field.options||[]).filter(option=>option.active!==false).map(option=>`<option value="${escapeHtml(option.value)}">${escapeHtml(option.labelZh||option.value)}</option>`).join('')}</datalist>`;
    }
    if (field.fieldType === "multiselect") return `<select data-product-field="${key}" multiple>${(field.options||[]).filter(option=>option.active!==false).map(option=>`<option value="${escapeHtml(option.value)}" ${String(value).split(',').includes(String(option.value))?'selected':''}>${escapeHtml(option.labelZh||option.value)}</option>`).join('')}</select>`;
    return `<input data-product-field="${key}" type="text" value="${val}" />`;
  }

  let smartProductCandidate = null;

  function parseSmartProductText(raw) {
    const text=String(raw||"").trim(), result={rawImportText:text,warnings:[]};
    const brands=["卡特彼勒","卡特","Caterpillar","CAT","小松","Komatsu","三一","SANY","徐工","XCMG","柳工","LIUGONG","豪沃","HOWO","陕汽","东风","福田","解放","沃尔沃","Volvo","日立","Hitachi"];
    const brand=brands.find(name=>new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i").test(text)); if(brand)result.brand=brand;
    const model=text.match(/(?:型号[:：]?\s*)?\b([A-Z]{0,4}\d{2,4}[A-Z0-9.-]{0,6})\b/i); if(model)result.model=model[1].toUpperCase();
    if(/全新未使用|全新|新机|brand\s*new/i.test(text))result.condition="全新未使用"; else if(/翻新|refurb/i.test(text))result.condition="翻新"; else if(/二手|used/i.test(text))result.condition="二手";
    const year=text.match(/\b((?:19|20)\d{2})\b/); if(year)result.year=year[1];
    const hours=text.match(/(\d+(?:\.\d+)?)\s*(?:小时|工时|hours?|hrs?)/i); if(hours)result.workingHours=Number(hours[1]);
    const cbm=text.match(/(\d+(?:\.\d+)?)\s*(?:方|立方|m³|m3|cbm)/i); if(cbm)result.transportCbm=Number(cbm[1]);
    const weight=text.match(/(?:重量[:：]?\s*)?(\d+(?:\.\d+)?)\s*(吨|t\b|kg|公斤)/i); if(weight)result.weight=weight[2].toLowerCase()==="kg"||weight[2]==="公斤"?Number(weight[1])/1000:Number(weight[1]);
    const price=text.match(/(?:价格|售价|单价)[:：]?\s*(?:USD|CNY|RMB|¥|\$)?\s*([\d,.]+)\s*(USD|CNY|RMB|美元|人民币|元|万)?/i);
    if(/待询|询价|price\s*on\s*request/i.test(text))result.specificPrice="";
    else if(price){let amount=Number(price[1].replace(/,/g,""));if(price[2]==="万")amount*=10000;result.specificPrice=amount;result.currency=/CNY|RMB|人民币|元|万|¥/i.test(price[2]||price[0])?"CNY":"USD";}
    const dims=text.match(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(mm|毫米|cm|厘米|m|米)?/i);
    if(dims){const unit=(dims[4]||"").toLowerCase();const factor=/mm|毫米/.test(unit)?0.001:/cm|厘米/.test(unit)?0.01:1;result.transportLength=Number(dims[1])*factor;result.transportWidth=Number(dims[2])*factor;result.transportHeight=Number(dims[3])*factor;result.dimensionUnit="meter";const calculated=Number((result.transportLength*result.transportWidth*result.transportHeight).toFixed(2));result.calculatedCbm=calculated;if(result.transportCbm&&Math.abs(calculated-result.transportCbm)/Math.max(result.transportCbm,1)>.1)result.warnings.push(`长宽高计算为 ${calculated}m³，与文字提供的 ${result.transportCbm}m³ 不一致，请确认报价采用值。`);else if(!result.transportCbm)result.transportCbm=calculated;}
    if(!result.brand)result.warnings.push("未明确识别品牌，请手动确认。");
    if(!result.model)result.warnings.push("未明确识别型号，请手动确认。");
    return result;
  }

  function analyzeSmartProductText() {
    const raw=$("product-smart-paste")?.value||""; if(!raw.trim())return toast("请先粘贴产品资料。");
    smartProductCandidate=parseSmartProductText(raw);
    const labels={brand:"品牌",model:"型号",condition:"状态",year:"年份",workingHours:"工时",specificPrice:"具体价格",currency:"币种",transportLength:"长(m)",transportWidth:"宽(m)",transportHeight:"高(m)",weight:"重量(t)",transportCbm:"运输体积(m³)"};
    const rows=Object.entries(labels).filter(([key])=>smartProductCandidate[key]!==undefined).map(([key,label])=>`<span><b>${label}</b>${smartProductCandidate[key]===""?"待询价":escapeHtml(smartProductCandidate[key])}</span>`).join("");
    $("product-smart-preview").innerHTML=`<div class="smart-preview-grid">${rows||"未识别到明确字段"}</div>${smartProductCandidate.warnings.length?`<ul>${smartProductCandidate.warnings.map(w=>`<li>${escapeHtml(w)}</li>`).join("")}</ul>`:""}`;
    $("product-smart-apply").hidden=false;
  }

  function applySmartProductCandidate() {
    const c=smartProductCandidate;if(!c)return;
    const set=(id,value)=>{if($(id)&&value!==undefined)$(id).value=value;};
    set("product-condition",c.condition);set("product-year",c.year);set("product-working-hours",c.workingHours);set("product-specific-price",c.specificPrice);set("product-currency",c.currency);set("product-transport-length",c.transportLength);set("product-transport-width",c.transportWidth);set("product-transport-height",c.transportHeight);set("product-weight",c.weight);set("product-transport-cbm",c.transportCbm);
    const brand=document.querySelector('[data-product-field="brand"]'),model=document.querySelector('[data-product-field="model"]');if(brand&&c.brand)brand.value=c.brand;if(model&&c.model)model.value=c.model;
    $("product-smart-apply").hidden=true;toast("识别结果已填入表单，请核对后保存。");
  }

  function renderProductTransportPlans(plans=[]) {
    const host=$("product-transport-plan-list");if(!host)return;
    host.innerHTML=(plans.length?plans:[{name:"整机运输",mode:"Bulk Cargo",dataStatus:"reference"}]).map((plan,index)=>`<div class="transport-plan-row" data-plan-index="${index}">
      <input data-plan="name" value="${escapeHtml(plan.name||"")}" placeholder="方案名称">
      <select data-plan="mode"><option ${plan.mode==="Bulk Cargo"?"selected":""}>Bulk Cargo</option><option ${plan.mode==="RORO"?"selected":""}>RORO</option><option ${plan.mode==="Container"?"selected":""}>Container</option><option ${plan.mode==="Flat Rack"?"selected":""}>Flat Rack</option></select>
      <input data-plan="length" type="number" value="${escapeHtml(plan.length||"")}" placeholder="长(m)"><input data-plan="width" type="number" value="${escapeHtml(plan.width||"")}" placeholder="宽(m)"><input data-plan="height" type="number" value="${escapeHtml(plan.height||"")}" placeholder="高(m)">
      <input data-plan="cbm" type="number" value="${escapeHtml(plan.cbm||"")}" placeholder="体积m³"><input data-plan="weight" type="number" value="${escapeHtml(plan.weight||"")}" placeholder="重量t">
      <select data-plan="containerType"><option value="">柜型</option>${["20GP","40GP","40HQ","20FR","40FR"].map(v=>`<option ${plan.containerType===v?"selected":""}>${v}</option>`).join("")}</select>
      <input data-plan="containerCount" type="number" value="${escapeHtml(plan.containerCount||"")}" placeholder="整批柜数"><input data-plan="handlingFee" type="number" value="${escapeHtml(plan.handlingFee||"")}" placeholder="拆装费">
      <select data-plan="dataStatus"><option value="reference" ${plan.dataStatus!=="confirmed"?"selected":""}>参考值</option><option value="confirmed" ${plan.dataStatus==="confirmed"?"selected":""}>已确认</option></select><input data-plan="remark" value="${escapeHtml(plan.remark||"")}" placeholder="备注"><button type="button" data-remove-plan>删除</button>
    </div>`).join("");
  }

  function collectProductTransportPlans() { return [...document.querySelectorAll(".transport-plan-row")].map(row=>Object.fromEntries([...row.querySelectorAll("[data-plan]")].map(input=>[input.dataset.plan,input.value]))).filter(plan=>plan.name||plan.cbm||plan.containerType); }

  function collectProductForm() {
    const values = {};
    document.querySelectorAll("[data-product-field]").forEach((input) => values[input.dataset.productField] = input.multiple?[...input.selectedOptions].map(option=>option.value).join(','):input.type==='checkbox'?input.checked:input.value);
    return {
      id: editingProductId || uid("product"),
      category: $("product-template")?.value || "",
      templateName: $("product-template")?.value || settings.templates[0]?.name || "",
      values,
      brand: values.brand || "",
      model: values.model || "",
      tonnage: values.tonnage || "",
      year: values.year || "",
      hours: values.hours || "",
      referencePrice: values.unitPrice || values.referencePrice || "",
      recordType: $("product-record-type")?.value || "model",
      modelProductId: $("product-model-reference")?.value || "",
      inventoryCode: $("product-inventory-code")?.value || "",
      condition: $("product-condition")?.value || values.condition || "",
      year: $("product-year")?.value || values.year || "",
      workingHours: $("product-working-hours")?.value || values.hours || "",
      specificPrice: $("product-specific-price")?.value || "",
      currency: $("product-currency")?.value || values.currency || "USD",
      transportDataStatus: $("product-transport-status")?.value || "reference",
      transportPlans: collectProductTransportPlans(),
      rawImportText: $("product-smart-paste")?.value || "",
      params: values.params || "",
      remark: values.remark || "",
      imageDataUrl: $("product-image-preview").dataset.image || ""
      ,transportLength: $("product-transport-length")?.value || ""
      ,transportWidth: $("product-transport-width")?.value || ""
      ,transportHeight: $("product-transport-height")?.value || ""
      ,transportCbm: $("product-transport-cbm")?.value || ""
      ,dimensionUnit: $("product-dimension-unit")?.value || "meter"
      ,weight: $("product-weight")?.value || values.tonnage || ""
      ,transportMethod: $("product-transport-method")?.value || "Bulk Cargo"
    };
  }

  async function saveProduct() {
    const product = collectProductForm();
    if (!Object.values(product.values || {}).some(Boolean)) return toast("请至少填写一个产品字段。");
    const payload = serverProductFromLegacy(product);
    Object.assign(payload, { transportLength:product.transportLength, transportWidth:product.transportWidth, transportHeight:product.transportHeight, transportCbm:product.transportCbm, dimensionUnit:product.dimensionUnit, weight:product.weight, transportMethod:product.transportMethod, imagePath:product.imageDataUrl });
    try {
      const existsOnServer = serverProducts.some(p => p.id === product.id);
      await api(existsOnServer ? `/api/products/${encodeURIComponent(product.id)}` : "/api/products", { method: existsOnServer ? "PUT" : "POST", body: JSON.stringify(payload) });
      products = products.filter(p => p.id !== product.id);
      save(keys.products, products);
      await loadServerData();
      clearProductForm();
      toast("产品已保存到主机数据库，报价和运费中心已同步。");
    } catch (error) { toast(error.message); }
  }

  function editProduct(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    normalizeCategories();
    editingProductId = p.id;
    if($('product-edit-panel'))$('product-edit-panel').hidden=false;
    if($("product-category")) $("product-category").value = p.category || categoryLabel(settings.categories[0]);
    if ($("product-template")) $("product-template").value = p.templateName || settings.templates[0]?.name || "";
    renderProductDynamicFields(p);
    $("product-image-preview").src = p.imageDataUrl || "";
    $("product-image-preview").dataset.image = p.imageDataUrl || "";
    if ($("product-transport-length")) $("product-transport-length").value = p.transportLength || "";
    if ($("product-transport-width")) $("product-transport-width").value = p.transportWidth || "";
    if ($("product-transport-height")) $("product-transport-height").value = p.transportHeight || "";
    if ($("product-transport-cbm")) $("product-transport-cbm").value = p.transportCbm || "";
    if ($("product-dimension-unit")) $("product-dimension-unit").value = p.dimensionUnit || "meter";
    if ($("product-weight")) $("product-weight").value = p.weight || p.tonnage || "";
    if ($("product-transport-method")) $("product-transport-method").value = p.transportMethod || "Bulk Cargo";
    if($("product-record-type"))$("product-record-type").value=p.recordType||"model";
    if($("product-model-reference"))$("product-model-reference").value=p.modelProductId||"";
    if($("product-inventory-code"))$("product-inventory-code").value=p.inventoryCode||"";
    if($("product-condition"))$("product-condition").value=p.condition||"";
    if($("product-year"))$("product-year").value=p.year||"";
    if($("product-working-hours"))$("product-working-hours").value=p.workingHours??"";
    if($("product-specific-price"))$("product-specific-price").value=p.specificPrice??"";
    if($("product-currency"))$("product-currency").value=p.currency||"USD";
    if($("product-transport-status"))$("product-transport-status").value=p.transportDataStatus||"reference";
    if($("product-smart-paste"))$("product-smart-paste").value=p.rawImportText||"";
    renderProductTransportPlans(p.transportPlans||[]);
    if ($("save-product-btn")) $("save-product-btn").textContent = "保存修改";
    $("product-edit-panel")?.scrollIntoView({behavior:"smooth",block:"start"});
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

  let libraryPage=1,libraryFilterKey='';
  const libraryPageSize=20;
  function renderProducts() {
    if ($("product-transport-plan-list") && !$("product-transport-plan-list").children.length) renderProductTransportPlans([]);
    const kw = normalize($("product-search").value);
    const category = $("product-category-filter")?.value || "";
    const condition = $("product-condition-filter")?.value || "";
    const categories = [...new Set(products.map(productCategoryGroup).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"zh-Hans-CN"));
    if($("product-model-reference")){const prior=$("product-model-reference").value;$("product-model-reference").innerHTML=`<option value="">不引用</option>`+products.filter(p=>(p.recordType||"model")==="model").map(p=>`<option value="${escapeHtml(p.id)}">${escapeHtml(productDisplayName(p))}</option>`).join("");$("product-model-reference").value=prior;}
    if ($("product-category-filter")) { const prior=$("product-category-filter").value; $("product-category-filter").innerHTML=`<option value="">全部分类（${products.length}）</option>`+categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join(""); $("product-category-filter").value=categories.includes(prior)?prior:""; }
    const list = products.filter((p) => {
      const state=productConditionGroup(p);
      const conditionMatches=!condition || state===condition || (state==="both" && ["new","used"].includes(condition));
      return (!category || productCategoryGroup(p)===category) && conditionMatches && (!kw || normalize(`${p.category}${p.brand}${p.model}${p.aliases||""}${p.params||""}${Object.values(p.values || {}).join(" ")}`).includes(kw));
    });
    if ($("product-filter-summary")) $("product-filter-summary").textContent = `当前显示 ${list.length} 条，共 ${products.length} 条产品；价格可在列表中直接填写并保存。`;
    const selectedTemplate=$('library-template-filter')?.value||'';
    const matched=list.filter(p=>!selectedTemplate||p.templateName===selectedTemplate);
    const filterKey=JSON.stringify([kw,category,condition,selectedTemplate]);
    if(filterKey!==libraryFilterKey){libraryPage=1;libraryFilterKey=filterKey;}
    const pageCount=Math.max(1,Math.ceil(matched.length/libraryPageSize));
    libraryPage=Math.max(1,Math.min(libraryPage,pageCount));
    const shown=matched.slice((libraryPage-1)*libraryPageSize,libraryPage*libraryPageSize);
    const templates=settings.templates||[];
    const filter=$('library-template-filter');if(filter){filter.innerHTML='<option value="">全部分类</option>'+templates.map(t=>`<option value="${escapeHtml(t.name)}">${escapeHtml(t.name)}</option>`).join('');filter.value=selectedTemplate;}
    const columns=new Map();
    const excluded=new Set(['productImage','image','totalAmount','amount','qty','itemType','condition']);
    for(const tpl of templates.filter(t=>!selectedTemplate||t.name===selectedTemplate))for(const field of [...(tpl.fields||[])].sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0)))if(field.visible!==false&&field.active!==false&&!excluded.has(field.fieldKey)&&!columns.has(field.fieldKey))columns.set(field.fieldKey,field);
    if(!columns.size)for(const [fieldKey,zh] of [['brand','品牌'],['model','型号'],['params','规格参数'],['unitPrice','价格']])columns.set(fieldKey,{fieldKey,zh});
    const fields=[...columns.values()];
    $('product-library-summary').innerHTML=[['产品总数',products.length+' 条'],['产品类型',new Set(products.map(p=>p.templateName||'未分类')).size+' 种'],['已有图片',products.filter(p=>p.imageDataUrl).length+' 条']].map(([label,value])=>`<article class="overview-metric"><span>${label}</span><strong>${value}</strong></article>`).join('');
    if($('product-filter-summary'))$('product-filter-summary').textContent=`当前显示 ${shown.length} 条，共 ${products.length} 条产品。点击名称查看详情；字段按所选模板展示。`;
    $('product-list').innerHTML='<div class="library-table-scroll"><table class="library-table"><thead><tr><th><input type="checkbox" id="library-select-all" aria-label="全选当前列表"></th><th>图片</th><th>商品名称／型号</th>'+fields.map(f=>`<th>${escapeHtml(f.zh||f.en||f.fieldKey)}</th>`).join('')+'<th>分类</th><th>操作</th></tr></thead><tbody>'+shown.map(p=>`<tr data-library-row="${escapeHtml(p.id)}"><td><input type="checkbox" data-library-select="${escapeHtml(p.id)}" aria-label="选择 ${escapeHtml(productDisplayName(p))}"></td><td>${p.imageDataUrl?`<img class="library-thumb" src="${escapeHtml(p.imageDataUrl)}" alt="${escapeHtml(productDisplayName(p))}" loading="lazy">`:'<div class="library-thumb library-no-image">暂无图片</div>'}</td><td><button type="button" class="library-product-name" data-library-detail="${escapeHtml(p.id)}">${escapeHtml(productDisplayName(p))}</button><small>${escapeHtml(p.inventoryCode||'')}</small></td>${fields.map(f=>`<td><div class="library-cell-value">${escapeHtml(productLibraryValue(p,f))}</div></td>`).join('')}<td><span class="library-type-badge">${escapeHtml(p.templateName||p.category||'未分类')}</span></td><td><div class="library-row-actions"><button type="button" data-library-detail="${escapeHtml(p.id)}">详情</button><button type="button" data-library-use="${escapeHtml(p.id)}">引用</button><button type="button" data-library-edit="${escapeHtml(p.id)}">编辑</button></div></td></tr>`).join('')+`</tbody></table>${shown.length?'':'<p class="empty">暂无匹配产品，可新增产品或调整筛选条件。</p>'}</div>`;
    const pagination=document.createElement('div');pagination.className='actions library-pagination';
    pagination.innerHTML=`<button type="button" data-library-page="${libraryPage-1}" ${libraryPage===1?'disabled':''}>上一页</button><span>第 ${libraryPage} / ${pageCount} 页 · 匹配 ${matched.length} 条 · 每页 ${libraryPageSize} 条</span><button type="button" data-library-page="${libraryPage+1}" ${libraryPage===pageCount?'disabled':''}>下一页</button><small>全选和批量删除仅作用于当前页；翻页或筛选后清除选择。</small>`;
    $('product-list').append(pagination);
    updateLibrarySelection();

  }

  function updateLibrarySelection(){
    const checks=[...document.querySelectorAll('[data-library-select]')],count=checks.filter(input=>input.checked).length;
    const button=$('library-delete-selected');button.disabled=count===0;button.textContent='删除选中（'+count+'）';
    const all=$('library-select-all');if(all){all.checked=checks.length>0&&count===checks.length;all.indeterminate=count>0&&count<checks.length;}
  }
  async function deleteSelectedLibraryProducts(){
    const ids=[...document.querySelectorAll('[data-library-select]:checked')].map(input=>input.dataset.librarySelect);
    if(!ids.length||!confirm('确认删除选中的 '+ids.length+' 个产品？已被单证引用的产品将停用，历史单证内容保持不变。'))return;
    const button=$('library-delete-selected');button.disabled=true;let deleted=0,inactive=0,failed=0;const removed=new Set();
    for(const id of ids){try{const result=await api('/api/products/'+encodeURIComponent(id),{method:'DELETE'});result.mode==='inactive'?inactive++:deleted++;removed.add(id);}catch(_){failed++;}}
    products=products.filter(p=>!removed.has(p.id));save(keys.products,products);
    await loadServerData();renderProducts();renderAllSelectors();toast('已删除 '+deleted+' 个，停用 '+inactive+' 个'+(failed?'，失败 '+failed+' 个，请重试':''));
  }
  function productLibraryValue(product,field){
    const values=productValues(product),key=field.fieldKey;
    const value=key==='unitPrice'?(product.specificPrice??values.unitPrice):values[key]??product[key];
    if(value===undefined||value===null||value==='')return '—';
    if(key==='unitPrice'||field.fieldType==='money')return (product.currency||values.currency||settings.currency||'USD')+' '+String(value);
    if(typeof value==='boolean')return value?'是':'否';
    return typeof value==='object'?JSON.stringify(value):String(value);
  }
  function showProductDetails(id){
    const p=products.find(item=>item.id===id);if(!p)return;
    let modal=$('library-detail-modal');
    if(!modal){modal=document.createElement('div');modal.id='library-detail-modal';modal.className='modal no-print';modal.innerHTML='<div class="modal-card library-detail-card" role="dialog" aria-modal="true" aria-labelledby="library-detail-title"></div>';document.body.append(modal);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-library-close]')){modal.hidden=true;document.querySelector('[data-library-detail="'+CSS.escape(id)+'"]')?.focus();}});modal.addEventListener('keydown',e=>{if(e.key==='Escape')modal.hidden=true;});}
    const fields=(productTemplateByName(p.templateName)?.fields||[]).filter(f=>f.visible!==false&&f.active!==false&&!['image','productImage'].includes(f.fieldKey)).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
    modal.firstElementChild.innerHTML=`<header><div><small>${escapeHtml(p.templateName||'产品详情')}</small><h3 id="library-detail-title">${escapeHtml(productDisplayName(p))}</h3></div><button type="button" data-library-close>关闭</button></header><div class="library-detail-content">${p.imageDataUrl?`<img src="${escapeHtml(p.imageDataUrl)}" alt="商品图片">`:'<div class="library-detail-no-image">暂无产品图片</div>'}<dl>${fields.map(f=>`<div><dt>${escapeHtml(f.zh||f.en||f.fieldKey)}</dt><dd>${escapeHtml(productLibraryValue(p,f))}</dd></div>`).join('')}</dl></div><footer><button type="button" id="library-detail-edit">编辑资料</button><button type="button" class="primary" id="library-detail-use">引用到单证</button></footer>`;
    $('library-detail-edit').onclick=()=>{modal.hidden=true;editProduct(id);};$('library-detail-use').onclick=()=>{if(useLibraryProduct(id))modal.hidden=true;};
    modal.hidden=false;modal.querySelector('[data-library-close]').focus();
  }
  function useLibraryProduct(id){
    if(!currentQuote||!['quotation','invoice','contract','commercial','packing'].includes(currentQuote.documentType||'quotation')){toast('请先新建或打开一份报价、PI、合同、商业发票或装箱单，再引用产品。');return false;}
    if(!confirm(`将此产品添加到当前${BusinessOverview.labels[currentQuote.documentType||'quotation']||'单证'}「${currentQuote.quoteNumber||'未编号'}」？不会自动保存。`))return false;
    addProductFromLibrary(id);switchView('quote');scheduleDraftRecovery();return true;
  }
  function productConditionGroup(product) {
    const values = productValues(product);
    const text = normalize(`${values.condition || ""} ${values.productType || ""} ${product.category || ""} ${product.templateName || ""}`);
    if (product.source === "machinery-price-reference-v7" || (/二手|used|翻新|refurbished/.test(text) && /全新|新机|brandnew|newmachine|newunused/.test(text))) return "both";
    if (/二手|used|originalused|翻新|refurbished/.test(text)) return "used";
    if (/全新|新机|brandnew|newmachine|newunused/.test(text)) return "new";
    return "unspecified";
  }

  function productConditionLabel(product) {
    return ({both:"新机/二手机均有",new:"全新设备",used:"二手设备",unspecified:"状态未标注"})[productConditionGroup(product)];
  }

  function productCategoryGroup(product) {
    const values = productValues(product);
    const raw = String(values.productType || product.category || "未分类").trim();
    const parts = raw.split("/").map(part=>part.replace(/二手|全新|新机|翻新|普通|used|brand\s*new|new\s*machine|refurbished/ig,"").trim()).filter(Boolean);
    return parts.join(" / ") || "未分类";
  }

  async function saveQuickProductPrice(id) {
    const product = products.find(item=>item.id===id);
    const input = document.querySelector(`[data-quick-product-price="${CSS.escape(id)}"]`);
    if (!product || !input) return;
    const value = input.value.trim();
    if (value && (!Number.isFinite(Number(value)) || Number(value) < 0)) return toast("请输入正确的非负价格。");
    product.values = {...(product.values || {}), unitPrice:value, currency:product.values?.currency || "USD"};
    product.referencePrice = value;
    const payload = serverProductFromLegacy(product);
    try {
      const existsOnServer = serverProducts.some(item=>item.id===product.id);
      await api(existsOnServer ? `/api/products/${encodeURIComponent(product.id)}` : "/api/products", {method:existsOnServer?"PUT":"POST",body:JSON.stringify(payload)});
      save(keys.products,products);
      await loadServerData();
      toast(`${productDisplayName(product)} 的价格已保存。`);
    } catch(error) { toast(error.message); }
  }

  function productDisplayName(product) {
    const values = productValues(product);
    return [values.brand, values.model].filter(Boolean).join(" ") || values.productType || values.name || "未命名产品";
  }

  function productSummary(product) {
    const values = productValues(product);
    return [values.year, values.hours ? `${values.hours}h` : "", values.tonnage, values.params].filter(Boolean).join(" | ");
  }

  function machineryReferenceProducts() {
    return Array.isArray(window.machineryPriceReferenceProducts) ? window.machineryPriceReferenceProducts : [];
  }

  function machineryReferenceKey(product) {
    const values = productValues(product);
    return normalize(`${values.productType || product.category}|${values.brand || product.brand}|${values.model || product.model}`);
  }

  function productFromMachineryReference(row) {
    const specParts = [row.spec1, row.spec2, row.spec3, row.spec4].filter(Boolean);
    const priceParts = [
      row.refurbishedYearRange || row.refurbishedPriceRange ? `翻新机：${row.refurbishedYearRange || "-"} / ${row.refurbishedPriceRange || "待填写"}` : "",
      row.originalUsedYearRange || row.originalPriceRange ? `原版二手机：${row.originalUsedYearRange || "-"} / ${row.originalPriceRange || "待填写"}` : "",
      row.newMachineAvailability || row.newPriceRange ? `全新机：${row.newMachineAvailability || "-"} / ${row.newPriceRange || "待填写"}` : "",
    ].filter(Boolean);
    return {
      id: uid("product"),
      category: row.category || "机械价格参考表",
      templateName: "二手工程机械",
      values: {
        productType: row.categoryBilingual || row.category || "",
        brand: row.brand || "",
        model: row.model || "",
        tonnage: row.spec2 || "",
        year: row.originalUsedYearRange || "",
        hours: row.usageRange || "",
        unitPrice: "",
        currency: "USD",
        params: specParts.join(" | "),
        remark: [row.remarks, priceParts.join("；"), row.newMachineAvailability === "停产无新机 / Discontinued" ? "停产型号无全新机报价" : ""].filter(Boolean).join("；"),
      },
      brand: row.brand || "",
      model: row.model || "",
      tonnage: row.spec2 || "",
      year: row.originalUsedYearRange || "",
      hours: row.usageRange || "",
      referencePrice: "",
      params: specParts.join(" | "),
      remark: [row.remarks, priceParts.join("；")].filter(Boolean).join("；"),
      imageDataUrl: "",
      source: "machinery-price-reference-v7",
      updatedAt: new Date().toISOString(),
    };
  }

  function mergeProductsIntoLocal(nextProducts) {
    let added = 0;
    let updated = 0;
    const existing = new Map(products.map((product, index) => [machineryReferenceKey(product), index]));
    nextProducts.forEach((product) => {
      const key = machineryReferenceKey(product);
      if (existing.has(key)) {
        const index = existing.get(key);
        products[index] = {
          ...products[index],
          ...product,
          id: products[index].id,
          referencePrice: products[index].referencePrice || product.referencePrice || "",
          imageDataUrl: products[index].imageDataUrl || product.imageDataUrl || ""
        };
        updated += 1;
      } else {
        products.push(product);
        existing.set(key, products.length - 1);
        added += 1;
      }
    });
    products.sort((a, b) => String(a.category || "").localeCompare(String(b.category || ""), "zh-Hans-CN") || String(a.brand || "").localeCompare(String(b.brand || ""), "zh-Hans-CN") || String(a.model || "").localeCompare(String(b.model || ""), "zh-Hans-CN"));
    save(keys.products, products);
    return { added, updated };
  }

  async function importMachineryReferenceProducts(targetId = "machinery-reference-result") {
    const source = machineryReferenceProducts();
    if (!source.length) return toast("未找到机械价格参考表数据，请确认 assets/price-lists/machinery-price-products.js 已加载。");
    const importedProducts = source.map(productFromMachineryReference);
    let result = mergeProductsIntoLocal(importedProducts);
    let storageMode = "本机产品库";
    if (currentUser) {
      try {
        const payload = importedProducts.map(serverProductFromLegacy);
        const data = await api("/api/products/bulk-upsert", { method: "POST", body: JSON.stringify({ products: payload }) });
        const serverRows = (data.products || []).map(toLegacyProduct);
        result = { added: data.added || 0, updated: data.updated || 0 };
        mergeProductsIntoLocal(serverRows);
        storageMode = "服务器产品库";
      } catch (error) {
        storageMode = `本机产品库（服务器导入失败：${error.message}）`;
      }
    }
    renderProducts();
    renderAllSelectors();
    const message = `机械价格参考表已导入${storageMode}：新增 ${result.added} 条，更新 ${result.updated} 条。`;
    if ($(targetId)) $(targetId).textContent = message;
    toast(message);
  }

  function exportProductCatalogPdf() {
    const list = products.slice().sort((a, b) => String(a.category || "").localeCompare(String(b.category || ""), "zh-Hans-CN") || String(a.brand || "").localeCompare(String(b.brand || ""), "zh-Hans-CN") || String(a.model || "").localeCompare(String(b.model || ""), "zh-Hans-CN"));
    if (!list.length) return toast("产品库为空，无法导出产品目录。");
    const rows = list.map((product, index) => {
      const values = productValues(product);
      return `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(values.productType || product.category || "")}</td>
        <td>${escapeHtml(values.brand || product.brand || "")}</td>
        <td>${escapeHtml(values.model || product.model || "")}</td>
        <td>${escapeHtml(values.tonnage || product.tonnage || "")}</td>
        <td>${escapeHtml(values.year || product.year || "")}</td>
        <td>${escapeHtml(values.hours || product.hours || "")}</td>
        <td>${escapeHtml(values.unitPrice || values.referencePrice || product.referencePrice || "Please ask")}</td>
        <td>${escapeHtml(values.remark || product.remark || "")}</td>
      </tr>`;
    }).join("");
    const win = window.open("", "_blank");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Product Catalog</title><style>
      body{font-family:Arial,'Microsoft YaHei',sans-serif;color:#172033;padding:28px}
      h1{margin:0 0 6px;color:#0f4c81} .meta{color:#64748b;margin-bottom:18px}
      table{width:100%;border-collapse:collapse;font-size:10px} th,td{border:1px solid #d7e0ea;padding:6px;vertical-align:top}
      th{background:#17365D;color:white} tr:nth-child(even){background:#f6f9fc}
      @media print{body{padding:12mm} table{font-size:8px} th,td{padding:4px}}
    </style></head><body>
      <h1>Product Catalog / 产品目录</h1>
      <div class="meta">${escapeHtml(settings.companyNameEn || "")} / ${escapeHtml(settings.companyNameZh || "")} · ${new Date().toISOString().slice(0, 10)}</div>
      <table><thead><tr><th>#</th><th>Category</th><th>Brand</th><th>Model</th><th>Spec</th><th>Year Range</th><th>Hours/Mileage</th><th>Price Range</th><th>Remark</th></tr></thead><tbody>${rows}</tbody></table>
      <script>window.onload=()=>setTimeout(()=>window.print(),200)<\/script>
    </body></html>`);
    win.document.close();
  }

  function renderQuoteEditor() {
    if (!currentQuote) {
      newQuote();
      return;
    }
    bindQuoteToForm();
    applyCustomerQuoteFieldLabels();
    if ($("quote-show-product-images")) $("quote-show-product-images").checked = currentQuote.showProductPhotos !== false;
    renderQuoteItems();
    renderPreview();
  }

  function newQuote(advanceNumber = false, documentType = "quotation") {
    const d = today();
    const docType = documentTypeOf(documentType).key;
    currentQuote = {
      id: uid("quote"),
      status: "草稿",
      seriesId: "",
      version: 0,
      isFormal: false,
      sourceQuoteId: "",
      documentType: docType,
      quoteStyle: settings.quoteStyle || "classic",
      quoteNumber: nextQuoteNumber(d, advanceNumber),
      quoteDate: d,
      validUntil: addDays(7),
      validityRangeText: "",
      showProductPhotos: true,
      pdfLanguage: "bilingual",
      currency: settings.currency || "USD",
      currencyDisplay: "single",
      secondaryCurrency: (settings.currency || "USD") === "CNY" ? "USD" : "CNY",
      exchangeRate: { sourceCurrency:settings.currency || "USD", targetCurrency:(settings.currency || "USD") === "CNY" ? "USD" : "CNY", rate:0, capturedAt:"" },
      buyer: {},
      customerId: null,
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

  async function applyQuoteFromUrl() {
    const params=new URLSearchParams(window.location.search);
    const quoteId=params.get("quote");
    if (!currentUser) return;
    if (quoteId) {
      currentQuote=serverQuotationToLocal(await api(`/api/quotations/${quoteId}`));
      switchView("quote");bindQuoteToForm();renderQuoteItems();renderPreview();
      history.replaceState({},"","/");toast(`已打开报价：${currentQuote.quoteNumber}`);return;
    }
  }

  function newInvitation() {
    const party = invitationPartyInfo();
    currentInvitation = {
      id: uid("invitation"),
      language: "bilingual",
      style: "classic",
      date: today(),
      embassy: "",
      visitorName: "",
      visitorCompany: "",
      country: "",
      gender: "",
      birthDate: "",
      passportNo: "",
      arrivalDate: "",
      departureDate: "",
      visitPlace: settings.companyAddressEn || "Hefei, Anhui, China / 中国安徽合肥",
      visaType: "M Business Visa / M字商务签证",
      relationship: "Business partner / 商务合作客户",
      expenseSource: "Visitor/customer bears all expenses / 客户自理",
      inviter: party.signerName,
      signerTitle: party.signerTitle,
      reason: settings.invitationDefaultReason || "The visitor is invited to China for business inspection, machinery inspection, order discussion and purchasing cooperation.",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    bindInvitationToForm();
    renderInvitationPreview();
  }

  function renderInvitationEditor() {
    if (!currentInvitation) {
      newInvitation();
      return;
    }
    bindInvitationToForm();
    renderInvitationPreview();
  }

  function bindInvitationToForm() {
    $("invitation-language").value = currentInvitation.language || "bilingual";
    $("invitation-style").value = currentInvitation.style || "classic";
    $("invitation-date").value = currentInvitation.date || today();
    $("invitation-embassy").value = currentInvitation.embassy || settings.invitationEmbassy || defaultEmbassyForCountry(currentInvitation.country);
    $("invitation-name").value = currentInvitation.visitorName || "";
    $("invitation-company").value = currentInvitation.visitorCompany || "";
    $("invitation-country").value = currentInvitation.country || "";
    $("invitation-gender").value = currentInvitation.gender || "";
    $("invitation-birth-date").value = currentInvitation.birthDate || "";
    $("invitation-passport").value = currentInvitation.passportNo || "";
    $("invitation-arrival").value = currentInvitation.arrivalDate || "";
    $("invitation-departure").value = currentInvitation.departureDate || "";
    $("invitation-visit-place").value = currentInvitation.visitPlace || settings.companyAddressEn || "";
    $("invitation-visa-type").value = currentInvitation.visaType || "M Business Visa / M字商务签证";
    $("invitation-relationship").value = currentInvitation.relationship || "Business partner / 商务合作客户";
    $("invitation-expense-source").value = currentInvitation.expenseSource || "Visitor/customer bears all expenses / 客户自理";
    const party = invitationPartyInfo();
    $("invitation-inviter").value = currentInvitation.inviter || party.signerName;
    $("invitation-signer-title").value = currentInvitation.signerTitle || party.signerTitle;
    $("invitation-reason").value = currentInvitation.reason || settings.invitationDefaultReason || "";
    $("invitation-notes").value = currentInvitation.notes || "";
  }

  function collectInvitationFromForm() {
    if (!currentInvitation) newInvitation();
    currentInvitation.language = $("invitation-language")?.value || "bilingual";
    currentInvitation.style = $("invitation-style")?.value || "classic";
    currentInvitation.date = $("invitation-date")?.value || today();
    currentInvitation.embassy = $("invitation-embassy")?.value.trim() || defaultEmbassyForCountry(currentInvitation.country);
    currentInvitation.visitorName = $("invitation-name")?.value.trim() || "";
    currentInvitation.visitorCompany = $("invitation-company")?.value.trim() || "";
    currentInvitation.country = $("invitation-country")?.value.trim() || "";
    currentInvitation.gender = $("invitation-gender")?.value.trim() || "";
    currentInvitation.birthDate = $("invitation-birth-date")?.value || "";
    currentInvitation.passportNo = $("invitation-passport")?.value.trim() || "";
    currentInvitation.arrivalDate = $("invitation-arrival")?.value || "";
    currentInvitation.departureDate = $("invitation-departure")?.value || "";
    currentInvitation.visitPlace = $("invitation-visit-place")?.value.trim() || "";
    currentInvitation.visaType = $("invitation-visa-type")?.value.trim() || "";
    currentInvitation.relationship = $("invitation-relationship")?.value.trim() || "";
    currentInvitation.expenseSource = $("invitation-expense-source")?.value.trim() || "";
    currentInvitation.inviter = $("invitation-inviter")?.value.trim() || invitationPartyInfo().signerName;
    currentInvitation.signerTitle = $("invitation-signer-title")?.value.trim() || invitationPartyInfo().signerTitle;
    currentInvitation.reason = $("invitation-reason")?.value.trim() || settings.invitationDefaultReason || "";
    currentInvitation.notes = $("invitation-notes")?.value.trim() || "";
    currentInvitation.updatedAt = new Date().toISOString();
  }

  function syncInvitationEmbassyFromCountry() {
    const embassyInput = $("invitation-embassy");
    if (!embassyInput) return;
    const country = $("invitation-country")?.value || "";
    const suggested = defaultEmbassyForCountry(country);
    const current = embassyInput.value.trim();
    const previous = currentInvitation?.embassy || settings.invitationEmbassy || "";
    if (!current || current === previous || current.includes("中华人民共和国驻外大使馆") || current.includes("Embassy of the People's Republic")) {
      embassyInput.value = suggested;
    }
  }

  function invitationTitle(mode) {
    const custom = {
      en: settings.invitationTitleEn || invitationLangPack.en.titleFallback,
      zh: settings.invitationTitleZh || invitationLangPack.zh.titleFallback
    };
    return invitationLanguages(mode).map((lang) => custom[lang] || invitationLangPack[lang]?.titleFallback).filter(Boolean).join(" / ");
  }

  function invitationField(labelKey, value, mode) {
    return `<p><b>${escapeHtml(invitationText(labelKey, mode))}:</b> ${escapeHtml(value || "-")}</p>`;
  }

  function localizedSlashValue(value, mode) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (!raw.includes("/")) return raw;
    const parts = raw.split("/").map((part) => part.trim()).filter(Boolean);
    const hasZh = (text) => /[\u4e00-\u9fa5]/.test(text);
    const zh = parts.find(hasZh) || "";
    const nonZh = parts.find((part) => !hasZh(part)) || parts[0] || "";
    if (mode === "zh") return zh || nonZh;
    if (mode === "en" || mode === "es" || mode === "fr") return raw.split(/\s+\/\s+/).filter(part=>!hasZh(part)).join(' / ') || raw;
    if (mode === "zh-es") return [nonZh, zh].filter(Boolean).join(" / ");
    if (mode === "zh-fr") return [nonZh, zh].filter(Boolean).join(" / ");
    return [nonZh, zh].filter(Boolean).join(" / ");
  }

  function invitationIntroParagraph(mode) {
    const country = currentInvitation.country || "the visitor's country";
    const countryZh = countryZhName(country) || "该国家";
    const name = currentInvitation.visitorName || "the visitor";
    const company = currentInvitation.visitorCompany || "the customer's company";
    const arrival = formatInvitationDate(currentInvitation.arrivalDate, mode) || "-";
    const departure = formatInvitationDate(currentInvitation.departureDate, mode) || "-";
    const visitPlace = currentInvitation.visitPlace || settings.companyAddressEn || "our factory in China";
    const text = {
      en: `Due to our business cooperation and order discussion, we hereby invite ${name} from ${country}, representing ${company}, to visit ${visitPlace} for business inspection, factory visit, machinery inspection and purchase discussion. The planned entry date is ${arrival}, and the planned departure date is ${departure}.`,
      zh: `我司现邀请来自${countryZh}的客户${name}${currentInvitation.visitorCompany?`（${company}）`:''}来华访问${visitPlace}，进行商务考察、设备验机及采购合作洽谈。计划入境日期为${currentInvitation.arrivalDate}，计划离境日期为${currentInvitation.departureDate}。`,
      fr: `Nous invitons ${name}, venant de ${String(country).split('/')[0].trim()}, à visiter ${String(visitPlace).split('/')[0].trim()} pour examiner des machines et discuter de leur achat. Son arrivée est prévue le ${currentInvitation.arrivalDate} et son départ le ${currentInvitation.departureDate}.`,
      es: `Debido a nuestra cooperación comercial y negociación de pedidos, invitamos a ${name} de ${country}, representante de ${company}, a visitar ${visitPlace} para inspección comercial, visita a la fábrica, revisión de maquinaria y conversación de compra. La fecha prevista de entrada es ${arrival}, y la fecha prevista de salida es ${departure}.`
    };
    return invitationLanguages(mode).map((lang) => text[lang]).filter(Boolean).join("\n");
  }

  function invitationResponsibilityParagraph(mode) {
    if(mode==='fr'||mode==='zh-fr')return currentInvitation.expenseSource||'';
    const text = {
      en: "During the visit in China, all expenses including but not limited to international and domestic transportation, accommodation, meals, insurance, medical costs and personal expenses shall be borne by the visitor/customer. Any fines, losses, penalties or legal responsibilities caused by overstaying, delayed departure, violation of local laws or personal conduct shall be borne solely by the visitor/customer. Our company does not bear any such costs or liabilities.",
      zh: "来访人在华考察期间产生的所有费用，包括但不限于国际及境内交通、住宿、餐饮、保险、医疗及个人消费等，均由来访人/客户自行承担。如因逾期离境、延迟离境、违反当地法律法规或个人行为产生任何罚款、损失、处罚或法律责任，均由来访人/客户自行承担，我司不承担任何相关费用及责任。",
      es: "Durante la visita en China, todos los gastos, incluidos entre otros transporte internacional y nacional, alojamiento, comidas, seguro, gastos médicos y gastos personales, serán asumidos por el visitante/cliente. Cualquier multa, pérdida, sanción o responsabilidad legal causada por permanencia vencida, salida retrasada, violación de leyes locales o conducta personal será asumida únicamente por el visitante/cliente. Nuestra empresa no asumirá dichos costos ni responsabilidades."
    };
    return invitationLanguages(mode).map((lang) => text[lang]).filter(Boolean).join("\n");
  }

  function renderInvitationPreview() {
    collectInvitationFromForm();
    const mode = currentInvitation.language || "bilingual";
    const party = invitationPartyInfo();
    const companyName = displayMode() === "zh" ? party.nameZh : party.nameEn;
    $("invitation-preview").innerHTML = `
      <section class="invitation-sheet invitation-style-${escapeHtml(currentInvitation.style || "classic")}">
        <div class="invitation-corner invitation-corner-tl"></div>
        <div class="invitation-corner invitation-corner-br"></div>
        <header class="invitation-header">
          ${settings.logoDataUrl ? `<img src="${settings.logoDataUrl}" alt="">` : ""}
          <div>
            <h2>${escapeHtml(party.nameEn || party.nameZh || "")}</h2>
            ${party.nameZh ? `<p>${escapeHtml(party.nameZh)}</p>` : ""}
          </div>
        </header>
        <div class="invitation-watermark">${escapeHtml(party.nameEn || party.nameZh || "")}</div>
        <h1>${escapeHtml(invitationTitle(mode))}</h1>
        <div class="invitation-date">${escapeHtml(invitationText("date", mode))}: ${escapeHtml(formatInvitationDate(currentInvitation.date, mode))}</div>
        <div class="invitation-to">${escapeHtml(invitationText("toPrefix", mode))}: ${escapeHtml(currentInvitation.embassy || settings.invitationEmbassy || "")}</div>
        <p class="invitation-paragraph">${escapeHtml(invitationIntroParagraph(mode)).replace(/\n/g, "<br>")}</p>
        <div class="invitation-info">
          <h3>${escapeHtml(invitationText("details", mode))}</h3>
          <div class="invitation-info-grid">
            ${invitationField("name", currentInvitation.visitorName, mode)}
            ${invitationField("company", currentInvitation.visitorCompany, mode)}
            ${invitationField("country", currentInvitation.country, mode)}
            ${invitationField("gender", currentInvitation.gender, mode)}
            ${invitationField("birthDate", formatInvitationDate(currentInvitation.birthDate, mode), mode)}
            ${invitationField("passport", currentInvitation.passportNo, mode)}
            ${invitationField("arrivalDate", formatInvitationDate(currentInvitation.arrivalDate, mode), mode)}
            ${invitationField("departureDate", formatInvitationDate(currentInvitation.departureDate, mode), mode)}
            ${invitationField("visitPlace", localizedSlashValue(currentInvitation.visitPlace, mode), mode)}
            ${invitationField("visaType", localizedSlashValue(currentInvitation.visaType, mode), mode)}
            ${invitationField("relationship", localizedSlashValue(currentInvitation.relationship, mode), mode)}
            ${invitationField("expenseSource", localizedSlashValue(currentInvitation.expenseSource, mode), mode)}
            ${invitationField("reason", currentInvitation.reason, mode)}
            ${currentInvitation.notes ? invitationField("notes", currentInvitation.notes, mode) : ""}
          </div>
        </div>
        <p class="invitation-paragraph">${escapeHtml(invitationText("closing", mode))}</p>
        <div class="invitation-responsibility">
          <h3>${escapeHtml(invitationText("responsibility", mode))}</h3>
          <p>${escapeHtml(invitationResponsibilityParagraph(mode)).replace(/\n/g, "<br>")}</p>
        </div>
        <footer class="invitation-footer">
          <div class="invitation-company-block">
            <p>${escapeHtml(party.nameEn || "")}</p>
            ${party.nameZh ? `<p>${escapeHtml(party.nameZh)}</p>` : ""}
            <p>${escapeHtml(party.addressEn || "")}</p>
            <p>${escapeHtml(party.addressZh || "")}</p>
            <p>${escapeHtml(party.phone || "")} ${party.email ? ` | ${escapeHtml(party.email)}` : ""}</p>
          </div>
          <div class="invitation-sign">
            <div class="invitation-sign-assets">
            ${settings.stampDataUrl ? `<img class="invitation-stamp" src="${settings.stampDataUrl}" alt="">` : ""}
            ${(settings.invitationSignatureDataUrl || settings.agencySignatureDataUrl)?`<div class="invitation-electronic-signature"><img src="${escapeHtml(settings.invitationSignatureDataUrl || settings.agencySignatureDataUrl)}" alt="Signature" style="transform:rotate(${Number(settings.invitationSignatureDataUrl ? settings.invitationSignatureRotation : settings.agencySignatureRotation)||0}deg)"></div>`:''}
            </div>
            <div class="signature-line"></div>
            <p><b>${escapeHtml(invitationText("signature", mode))}</b></p>
            <p>${escapeHtml(invitationText("inviter", mode))}: ${escapeHtml(currentInvitation.inviter || party.signerName || "")}</p>
            ${currentInvitation.signerTitle ? `<p>${escapeHtml(currentInvitation.signerTitle)}</p>` : ""}
            <p>${escapeHtml(companyName || "")}</p>
          </div>
        </footer>
      </section>
    `;
  }

  function saveInvitation() {
    renderInvitationPreview();
    const nowIso = new Date().toISOString();
    if (!currentInvitation.createdAt) currentInvitation.createdAt = nowIso;
    currentInvitation.updatedAt = nowIso;
    const idx = invitations.findIndex((item) => item.id === currentInvitation.id);
    if (idx >= 0) invitations[idx] = structuredClone(currentInvitation);
    else invitations.unshift(structuredClone(currentInvitation));
    save(keys.invitations, invitations);
    toast("邀请函已保存。");
  }

  async function exportInvitationPdf() {
    renderInvitationPreview();
    await waitForPrintableImages($("invitation-preview"));
    const fileName = currentInvitationPdfFileName();
    document.body.classList.add("printing-invitation");
    try {
      if (window.quotationDesktop?.exportCurrentPdf) {
        const filePath = await window.quotationDesktop.exportCurrentPdf(fileName);
        if (filePath) toast(`PDF 已导出：${filePath}`);
        return;
      }
      applyPrintTitle();
      window.print();
    } finally {
      setTimeout(() => document.body.classList.remove("printing-invitation"), 500);
    }
  }

  const agencyProductGroups = [
    {name:"工程机械", items:[["全新工程机械","New construction machinery"],["二手工程机械","Used construction machinery"],["挖掘机","Excavators"],["迷你挖掘机","Mini excavators"],["装载机","Wheel loaders"],["滑移装载机","Skid steer loaders"],["压路机","Road rollers"],["平地机","Motor graders"],["推土机","Bulldozers"],["叉车","Forklifts"],["水井钻机","Water well drilling rigs"]]},
    {name:"起重设备", items:[["随车吊","Truck-mounted cranes"],["折臂吊","Knuckle boom cranes"],["汽车起重机","Truck cranes"],["履带式起重机","Crawler cranes"],["轮式起重机","Mobile cranes"],["高空作业车","Aerial work platforms"]]},
    {name:"卡车及专用车辆", items:[["自卸卡车","Dump trucks"],["矿山卡车","Mining trucks"],["铰接式卡车","Articulated dump trucks"],["牵引车","Tractor trucks"],["半挂车","Semi-trailers"],["油罐车","Fuel tank trucks"],["洒水车/运水车","Water tank trucks"],["航空加油车","Aircraft refuelling trucks"],["冷藏车","Refrigerated trucks"],["垃圾压缩车","Garbage compactor trucks"],["清洗吸污车","Sewer cleaning trucks"]]},
    {name:"混凝土及矿山设备", items:[["混凝土搅拌车","Concrete mixer trucks"],["自上料搅拌车","Self-loading concrete mixers"],["混凝土泵车","Concrete pump trucks"],["破碎机","Crushers"],["筛分机","Screening machines"],["移动筛分机","Mobile screening plants"],["破碎锤及属具","Hydraulic breakers and attachments"],["配件及售后服务","Spare parts and after-sales services"]]}
  ];

  function agencyDefaultCopy(mode="bilingual") {
    const copy={
      zh:{payment:"美元银行账户或 USDT",settlement:"3个工作日内",commission:"佣金仅以授权方实际收到且不可撤销的客户货款为计算基础；运费、保险费、税费、退款、银行手续费及另行约定项目不计入佣金基数。每笔订单的最终佣金比例须在成交前书面确认。客户全部到期款项到账、交易不存在争议且代理人已提供合规收款资料后，授权方在约定期限内支付。",extra:"本授权为非独家、不可转授权的销售代理授权。授权方可书面调整授权范围或提前终止授权；被授权人不得使用授权方名义开设账户、借款、担保或作出超出本授权书的承诺。"},
      en:{payment:"USD bank account or USDT",settlement:"Within 3 business days",commission:"Commission is calculated only on customer payments actually and irrevocably received by the authorizing party. Freight, insurance, taxes, refunds, bank charges and separately agreed items are excluded. The final commission rate for each order must be confirmed in writing before closing. Payment will be made within the agreed period after all due customer funds are received, no dispute exists and compliant payment information has been supplied.",extra:"This is a non-exclusive and non-transferable sales agency authorization. The authorizing party may adjust its scope or terminate it early by written notice. The representative may not open accounts, borrow, provide guarantees or make commitments beyond this authorization in the authorizing party's name."},
      es:{payment:"Cuenta bancaria en USD o USDT",settlement:"Dentro de 3 días hábiles",commission:"La comisión se calcula únicamente sobre los pagos del cliente efectivamente recibidos y no revocables por la parte autorizante. Se excluyen flete, seguro, impuestos, reembolsos, gastos bancarios y partidas acordadas por separado. La comisión final de cada pedido deberá confirmarse por escrito antes del cierre. El pago se realizará dentro del plazo acordado una vez recibidos todos los importes vencidos, sin controversias y con datos de cobro conformes.",extra:"Esta autorización de agencia comercial es no exclusiva e intransferible. La parte autorizante podrá modificar su alcance o terminarla anticipadamente mediante notificación escrita. El representante no podrá abrir cuentas, contraer préstamos, otorgar garantías ni asumir compromisos fuera de esta autorización en nombre de la parte autorizante."},
      fr:{payment:"Compte bancaire en USD ou USDT",settlement:"Dans un délai de 3 jours ouvrables",commission:"La commission est calculée uniquement sur les paiements clients effectivement et irrévocablement reçus par le mandant. Le fret, l’assurance, les taxes, remboursements, frais bancaires et éléments convenus séparément sont exclus. Le taux final de chaque commande doit être confirmé par écrit avant sa conclusion. Le paiement intervient dans le délai convenu après réception de toutes les sommes exigibles, en l’absence de litige et après fourniture de coordonnées de paiement conformes.",extra:"Cette autorisation d’agence commerciale est non exclusive et incessible. Le mandant peut en modifier la portée ou y mettre fin par notification écrite. Le représentant ne peut ouvrir de compte, emprunter, fournir de garantie ni prendre d’engagement dépassant la présente autorisation au nom du mandant."}
    };
    const pair=(foreign)=>({payment:`${copy[foreign].payment} / ${copy.zh.payment}`,settlement:`${copy[foreign].settlement} / ${copy.zh.settlement}`,commission:`${copy[foreign].commission}\n\n${copy.zh.commission}`,extra:`${copy[foreign].extra}\n\n${copy.zh.extra}`});
    return mode==="bilingual"?pair("en"):mode==="zh-es"?pair("es"):mode==="zh-fr"?pair("fr"):(copy[mode]||copy.zh);
  }

  function defaultAgencyTerms(mode="bilingual") {
    return agencyDefaultCopy(mode).commission;
  }

  function newAgentAuthorization() {
    const date = today(), party = invitationPartyInfo();
    currentAgentAuthorization = {
      id: "", documentType:"authorization", isTemplate:false, authorizationNumber: AgencyDocuments.number('authorization',date,agentAuthorizations),
      date, validUntil: "", language: "bilingual", company: [party.nameEn || settings.companyNameEn, party.nameZh || settings.companyNameZh].filter(Boolean).join(" / "),
      authorizer: settings.agencyAuthorizer || party.signerName || settings.contactPerson || "Ethan", authorizerTitle: settings.agencyAuthorizerTitle || party.signerTitle || "General Manager / 总经理",
      signatureDataUrl: settings.agencySignatureDataUrl || "", signatureRotation: settings.agencySignatureRotation || 0,
      country: "", agentName: "", idNumber: "", phone: "", email: "", address:"", officeAddress:"",
      selectedProducts: agencyProductGroups.flatMap(group => group.items.map(item => item[0])), showCommission:true,
      commissionMin: 5, commissionMax: 10, markupAllowed: true,
      paymentMethods: agencyDefaultCopy("bilingual").payment, settlementDays: agencyDefaultCopy("bilingual").settlement,
      commissionTerms: defaultAgencyTerms("bilingual"), extraTerms: agencyDefaultCopy("bilingual").extra
    };
    bindAgentAuthorizationForm();
    renderAgentAuthorizationPreview();
  }

  async function loadAgentAuthorizations() {
    try { const data = await api("/api/agent-authorizations"); agentAuthorizations = data.authorizations || []; }
    catch (error) { toast(error.message); agentAuthorizations = []; }
    renderAgentAuthorizationHistory();
  }

  async function renderAgentAuthorizationEditor() {
    await loadAgentAuthorizations();
    const options = [settings.companyNameEn, settings.companyNameZh, "Wangwa Machinery / 万挖机械", "Yicheng Machinery / 一程机械"].filter(Boolean);
    if ($("agency-company-options")) $("agency-company-options").innerHTML = [...new Set(options)].map((name) => `<option value="${escapeHtml(name)}"></option>`).join("");
    if ($("agency-country-options")) $("agency-country-options").innerHTML = countryOptions.map(([en,zh]) => `<option value="${escapeHtml(`${en} / ${zh}`)}"></option>`).join("");
    if (!currentAgentAuthorization) newAgentAuthorization();
    else { bindAgentAuthorizationForm(); renderAgentAuthorizationPreview(); }
  }

  function bindAgentAuthorizationForm() {
    const a = currentAgentAuthorization || {};
    const values = { "agency-number":a.authorizationNumber, "agency-date":a.date, "agency-valid-until":a.validUntil, "agency-language":a.language,
      "agency-company":a.company, "agency-authorizer":a.authorizer, "agency-authorizer-title":a.authorizerTitle, "agency-country":a.country,
      "agency-agent-name":a.agentName, "agency-id-number":a.idNumber, "agency-phone":a.phone, "agency-email":a.email, "agency-address":a.address, "agency-office-address":a.officeAddress || (a.hasStore && !["yes","no","unknown"].includes(a.hasStore) ? a.hasStore : ""),
      "agency-commission-min":a.commissionMin, "agency-commission-max":a.commissionMax, "agency-markup":a.markupAllowed === false ? "no" : "yes",
      "agency-payment-methods":a.paymentMethods, "agency-settlement-days":a.settlementDays, "agency-commission-terms":a.commissionTerms, "agency-extra-terms":a.extraTerms };
    Object.entries(values).forEach(([id,value]) => { if ($(id)) $(id).value = value ?? ""; });
    $("agency-document-type").value = AgencyDocuments.type(a);
    Object.entries(agencyDocumentFields).forEach(([id,key])=>{ $(id).value=a[key]??(key==='orderRate'?'':key==='currency'?'USD':key==='commissionBasis'?'rate':key==='paymentChannel'?'bank':''); });
    $('agency-manual-completion').checked=a.allowManualCompletion!==false;
    updateAgencyDocumentControls();
    if ($("agency-show-commission")) $("agency-show-commission").checked = a.showCommission !== false;
    renderAgencyProductOptions();
  }

  function renderAgencyProductOptions() {
    const host=$("agency-product-options"); if(!host)return;
    const selected=new Set(currentAgentAuthorization?.selectedProducts || []);
    host.innerHTML=agencyProductGroups.map(group=>`<fieldset><legend>${escapeHtml(group.name)}</legend><div>${group.items.map(([zh,en])=>`<label><input type="checkbox" value="${escapeHtml(zh)}" ${selected.has(zh)?"checked":""}><span>${escapeHtml(zh)}<small>${escapeHtml(en)}</small></span></label>`).join("")}</div></fieldset>`).join("");
  }

  function collectAgentAuthorizationForm() {
    if (!currentAgentAuthorization) newAgentAuthorization();
    const val = (id) => $(id)?.value.trim() || "";
    Object.assign(currentAgentAuthorization, {
      authorizationNumber:val("agency-number"), date:val("agency-date"), validUntil:val("agency-valid-until"), language:val("agency-language") || "bilingual",
      company:val("agency-company"), authorizer:val("agency-authorizer"), authorizerTitle:val("agency-authorizer-title"), country:val("agency-country"),
      agentName:val("agency-agent-name"), idNumber:val("agency-id-number"), phone:val("agency-phone"), email:val("agency-email"), address:val("agency-address"), officeAddress:val("agency-office-address"),
      selectedProducts:[...document.querySelectorAll("#agency-product-options input:checked")].map(input=>input.value), showCommission:$("agency-show-commission")?.checked !== false,
      commissionMin:Number(val("agency-commission-min") || 0), commissionMax:Number(val("agency-commission-max") || 0), markupAllowed:val("agency-markup") !== "no",
      paymentMethods:val("agency-payment-methods"), settlementDays:val("agency-settlement-days"), commissionTerms:val("agency-commission-terms"), extraTerms:val("agency-extra-terms")
    });
    currentAgentAuthorization.documentType=val('agency-document-type')||'authorization';
    Object.entries(agencyDocumentFields).forEach(([id,key])=>{currentAgentAuthorization[key]=val(id);});
    currentAgentAuthorization.allowManualCompletion=$('agency-manual-completion').checked;
    updateAgencyDocumentControls();
  }

  const agencyDocumentFields={
    'procurement-legal-name':'personalLegalName','procurement-id':'personalId','procurement-phone':'personalPhone','procurement-wechat':'personalWechat','procurement-whatsapp':'personalWhatsapp','procurement-machine':'purchaseMachine','procurement-year':'purchaseYear','procurement-amount':'purchaseAmount','procurement-fee':'purchaseFee','procurement-cancellation':'purchaseCancellation',
    'agency-related-authorization':'relatedAuthorization','agency-related-agreement':'relatedAgreement',
    'agency-customer-name':'customerName','agency-sales-contract-number':'salesContractNumber',
    'agency-currency':'currency','agency-contract-amount':'contractAmount','agency-commission-basis':'commissionBasis',
    'agency-order-rate':'orderRate','agency-fixed-commission':'fixedCommission','agency-markup-amount':'markupAmount','agency-bank-details':'bankDetails','agency-document-notes':'documentNotes',
    'agency-payment-channel':'paymentChannel','agency-recipient-company':'recipientCompany',
    'agency-beneficiary-name':'beneficiaryFullName','agency-bank-name':'bankName','agency-bank-account':'bankAccount','agency-bank-swift':'bankSwift','agency-bank-routing':'bankRouting','agency-bank-iban':'bankIban','agency-bank-country':'bankCountry','agency-bank-address':'bankAddress','agency-beneficiary-address':'beneficiaryAddress','agency-crypto-network':'cryptoNetwork','agency-wallet-address':'walletAddress'
  };

  function updateAgencyDocumentControls(){
    const a=currentAgentAuthorization||{},kind=AgencyDocuments.type(a),commercial=kind!=='authorization';
    const procurement=kind==='procurement';
    $('agency-procurement-panel').hidden=!procurement;
    $('agency-commercial-panel').hidden=!commercial;
    $('agency-legacy-commission').hidden=commercial;
    document.querySelector('.agency-scope-panel').hidden=commercial;
    document.querySelectorAll('.agency-order-field').forEach(el=>el.hidden=kind!=='statement');
    const statement=kind==='statement';
    $('agency-basic-title').textContent=statement?'甲方与乙方佣金结算人':'授权及协议基本信息';
    for(const [id,title] of Object.entries({'agency-company':statement?'甲方公司抬头':'授权方公司','agency-authorizer':statement?'甲方负责人':'授权方签署人','agency-country':statement?'乙方国家':'授权国家/地区','agency-agent-name':statement?'乙方姓名或全名':'联系人姓名'}))$(id).closest('label').querySelector('span').textContent=title;
    for(const id of ['agency-related-authorization','agency-office-address','agency-valid-until'])$(id).closest('label').hidden=statement;
    document.querySelector('input[value="非独家授权 / Non-exclusive"]').closest('label').hidden=statement;
    $('agency-related-agreement').closest('label').hidden=true;
    $('agency-bank-details').closest('label').hidden=true;
    const basis=$('agency-commission-basis').value;
    $('agency-order-rate').closest('label').hidden=!statement||basis==='fixed';
    $('agency-fixed-commission').closest('label').hidden=!statement||basis!=='fixed';
    $('agency-markup-amount').closest('label').hidden=!statement||basis!=='markup';
    $('agency-bank-fields').hidden=!statement||$('agency-payment-channel').value!=='bank';
    $('agency-crypto-fields').hidden=!statement||$('agency-payment-channel').value!=='crypto';
    $('agency-public-pdf-btn').hidden=commercial; $('agency-private-pdf-btn').hidden=commercial;
    $('agency-save-btn').textContent=a.isTemplate?'保存模板':'保存文件';
    $('agency-new-btn').textContent='新建空白文件';
    const value=AgencyDocuments.calculate(a);
    $('agency-payable').value=value===null?'待填写':`${a.currency||'USD'} ${value.toFixed(2)}`;
    const selected=$('agency-template').value;
    $('agency-template').innerHTML='<option value="">选择模板…</option>'+agentAuthorizations.filter(r=>r.isTemplate&&AgencyDocuments.type(r)===kind).map(r=>`<option value="${escapeHtml(r.id)}">${escapeHtml(r.templateName||r.agentName)} · ${escapeHtml(AgencyDocuments.types[kind])}</option>`).join('');
    $('agency-template').value=selected;
    for(const id of ['agency-company','agency-authorizer-title'])$(id).closest('label').hidden=procurement;
    if(procurement){
      $('agency-commercial-panel').hidden=true;
      $('agency-basic-title').textContent='个人委托采购 · 乙方信息';
      for(const id of ['agency-related-authorization','agency-office-address','agency-valid-until'])$(id).closest('label').hidden=true;
      document.querySelector('input[value="非独家授权 / Non-exclusive"]').closest('label').hidden=true;
      for(const [id,title] of Object.entries({'agency-authorizer':'甲方常用名','agency-agent-name':'乙方护照英文全名','agency-country':'乙方国籍','agency-id-number':'乙方护照或当地证件号码（如适用）','agency-phone':'乙方电话或WhatsApp','agency-email':'乙方邮箱'}))$(id).closest('label').querySelector('span').textContent=title;
    }else{for(const [id,title] of Object.entries({'agency-id-number':'身份证/护照号','agency-phone':'联系电话','agency-email':'电子邮箱'}))$(id).closest('label').querySelector('span').textContent=title;}
  }

  function changeAgencyDocumentType(){
    const previous=AgencyDocuments.type(currentAgentAuthorization),kind=$('agency-document-type').value;
    collectAgentAuthorizationForm();
    const a=currentAgentAuthorization;
    if(previous!==kind){
      if(previous==='authorization')a.relatedAuthorization=a.authorizationNumber;
      if(previous==='agreement')a.relatedAgreement=a.authorizationNumber;
      a.id=''; a.isTemplate=false; a.templateName=''; a.date=today();
      a.authorizationNumber=AgencyDocuments.number(kind,a.date,agentAuthorizations);
      a.documentNotes='';
      if(kind==='statement'){
        a.company=[settings.companyNameEn,settings.companyNameZh].filter(Boolean).join(' / ');
        a.authorizer='Ethan';a.authorizerTitle='General Manager for Africa / 非洲区总经理';
        a.signatureDataUrl=settings.agencySignatureDataUrl||'';a.signatureRotation=settings.agencySignatureRotation||0;
        a.paymentChannel='bank';a.commissionBasis='rate';a.orderRate='';a.fixedCommission='';a.allowManualCompletion=true;
        a.companySnapshot={companyNameEn:settings.companyNameEn,companyNameZh:settings.companyNameZh,companyAddressEn:settings.companyAddressEn,companyAddressZh:settings.companyAddressZh,stampDataUrl:settings.stampDataUrl||'',agencySignatureDataUrl:settings.agencySignatureDataUrl||'',agencySignatureRotation:settings.agencySignatureRotation||0};
      }
    }
    bindAgentAuthorizationForm(); renderAgentAuthorizationPreview();
  }

  function useAgencyDocumentTemplate(){
    const source=agentAuthorizations.find(r=>r.id===$('agency-template').value&&r.isTemplate);
    if(!source)return toast('请先选择模板。');
    currentAgentAuthorization=structuredClone(source);
    Object.assign(currentAgentAuthorization,{id:'',isTemplate:false,templateName:'',date:today(),status:'Active'});
    currentAgentAuthorization.authorizationNumber=AgencyDocuments.number(AgencyDocuments.type(source),today(),agentAuthorizations);
    bindAgentAuthorizationForm(); renderAgentAuthorizationPreview();
  }

  async function saveAgencyDocumentTemplate(){
    collectAgentAuthorizationForm();
    const previous=structuredClone(currentAgentAuthorization);
    currentAgentAuthorization={...previous,id:'',isTemplate:true,templateName:`${previous.agentName} · ${AgencyDocuments.types[AgencyDocuments.type(previous)]}`};
    currentAgentAuthorization.authorizationNumber=AgencyDocuments.number(AgencyDocuments.type(previous),today(),agentAuthorizations);
    bindAgentAuthorizationForm();
    try{await saveAgentAuthorization();}catch(error){currentAgentAuthorization=previous;bindAgentAuthorizationForm();throw error;}
  }

  function agencyText(en, zh, es=en, fr=en) {
    const mode = currentAgentAuthorization?.language || "bilingual";
    return mode === "en" ? en : mode === "es" ? es : mode === "fr" ? fr : mode === "zh" ? zh : mode === "zh-es" ? `${es} / ${zh}` : mode === "zh-fr" ? `${fr} / ${zh}` : `${en} / ${zh}`;
  }

  function applyAgencyLanguageDefaults(){
    const mode=$("agency-language")?.value||"bilingual",next=agencyDefaultCopy(mode);
    const all=["bilingual","zh-es","zh-fr","zh","en","es","fr"].map(agencyDefaultCopy);
    [["agency-payment-methods","payment"],["agency-settlement-days","settlement"],["agency-commission-terms","commission"],["agency-extra-terms","extra"]].forEach(([id,key])=>{const input=$(id);if(!input)return;const current=input.value.trim();if(!current||all.some(item=>item[key]===current))input.value=next[key];});
    renderAgentAuthorizationPreview();
  }

  function agencySelectedProductText(a) {
    const selected=new Set(a.selectedProducts || []), names=[];
    agencyProductGroups.forEach(group=>group.items.forEach(([zh,en])=>{if(selected.has(zh))names.push(agencyText(en,zh,en,en));}));
    return names.join("、") || agencyText("No products selected","未选择产品","Ningún producto seleccionado","Aucun produit sélectionné");
  }

  function renderAgentAuthorizationPreview() {
    if (!$("agency-preview")) return;
    collectAgentAuthorizationForm();
    if(AgencyDocuments.type(currentAgentAuthorization)!=='authorization'){
      $('agency-preview').dataset.language=currentAgentAuthorization.language||'bilingual';
      $('agency-preview').innerHTML=AgencyDocuments.render(currentAgentAuthorization,settings);
      return;
    }
    const a = currentAgentAuthorization, stamp = a.companySnapshot?.stampDataUrl || settings.stampDataUrl || "", showCommission=a.showCommission !== false;
    $("agency-preview").dataset.language=a.language||"bilingual";
    $("agency-preview").innerHTML = `<section class="agency-sheet">
      <div class="agency-crest"><span class="agency-wheat left">❧</span><div class="agency-emblem">★</div><span class="agency-wheat right">❧</span></div>
      <header class="agency-letterhead">${settings.logoDataUrl ? `<img src="${settings.logoDataUrl}" alt="Logo">` : ""}<div><b>${escapeHtml(a.company || settings.companyNameEn || "Authorizing Company")}</b><span>${escapeHtml(settings.companyAddressEn || settings.companyAddressZh || "")}</span></div></header>
      <h1>${agencyText("LETTER OF AUTHORIZATION", "代理授权书", "CARTA DE AUTORIZACIÓN", "LETTRE D’AUTORISATION")}</h1>
      <div class="agency-meta"><span>${agencyText("No.", "编号")}：${escapeHtml(a.authorizationNumber)}</span>${a.validUntil ? `<span>${agencyText("Valid Until", "有效期至")}：${escapeHtml(a.validUntil)}</span>` : ""}</div>
      <p class="agency-lead">${escapeHtml(agencyText(`We hereby appoint ${a.agentName || "-"} as our non-exclusive sales representative in ${a.country || "-"}.`, `兹授权${a.agentName || "-"}作为我方在${a.country || "-"}的非独家销售代理。`, `Por la presente nombramos a ${a.agentName || "-"} como nuestro representante comercial no exclusivo en ${a.country || "-"}.`, `Nous nommons par la présente ${a.agentName || "-"} en qualité de représentant commercial non exclusif en ${a.country || "-"}.`))}</p>
      <section class="agency-info-grid"><p><b>${agencyText("Territory","授权国家/地区","Territorio","Territoire")}</b><span>${escapeHtml(a.country||"-")}</span></p><p><b>${agencyText("Representative","联系人姓名","Representante","Représentant")}</b><span>${escapeHtml(a.agentName||"-")}</span></p><p><b>${agencyText("ID / Passport No.","身份证/护照号","Documento de identidad / Pasaporte","N° d’identité / passeport")}</b><span>${escapeHtml(a.idNumber||"-")}</span></p><p><b>${agencyText("Telephone","联系电话","Teléfono","Téléphone")}</b><span>${escapeHtml(a.phone||"-")}</span></p><p><b>${agencyText("Email","电子邮箱","Correo electrónico","E-mail")}</b><span>${escapeHtml(a.email||"-")}</span></p><p class="wide"><b>${agencyText("Contact Address","联系人地址","Dirección de contacto","Adresse du contact")}</b><span>${escapeHtml(a.address||"-")}</span></p>${a.officeAddress?`<p class="wide"><b>${agencyText("Store / Office Address","门店或办公室地址","Dirección de tienda / oficina","Adresse du magasin / bureau")}</b><span>${escapeHtml(a.officeAddress)}</span></p>`:""}</section>
      <h2>${agencyText("Terms of Authorization","授权条款","Condiciones de autorización","Conditions de l’autorisation")}</h2>
      <ol class="agency-terms"><li>${escapeHtml(agencyText("The representative may promote and sell only the products listed in the Authorized Product Scope below within the territory.","被授权人可在授权区域内推广和销售下方“授权产品范围”中列明的产品。","El representante podrá promocionar y vender en el territorio únicamente los productos indicados en la sección Productos autorizados.","Le représentant peut promouvoir et vendre sur le territoire uniquement les produits indiqués dans la section Produits autorisés."))}</li><li>${escapeHtml(agencyText("The representative may conduct business discussions and submit customer requirements, but may not sign contracts, collect payments or make binding commitments in our name. All contracts and final quotations must be issued or confirmed by the authorizing party.","被授权人可代表我方开展业务洽谈并传递客户需求，但无权以我方名义签署合同、收取款项或作出具有法律约束力的承诺；合同及最终报价必须由授权方出具或确认。","El representante podrá negociar y transmitir las necesidades del cliente, pero no podrá firmar contratos, cobrar pagos ni asumir compromisos vinculantes en nuestro nombre. Todo contrato y oferta final deberá ser emitido o confirmado por la parte autorizante.","Le représentant peut négocier et transmettre les besoins du client, mais ne peut signer de contrat, encaisser de paiement ni prendre d’engagement contraignant en notre nom. Tout contrat et toute offre finale doivent être émis ou confirmés par la partie mandante."))}</li><li>${escapeHtml(agencyText("The representative shall comply with all applicable laws, licensing, tax, advertising, sanctions and anti-corruption requirements in the territory and shall bear responsibility for violations arising from its own conduct.","被授权人必须遵守授权地区适用的法律法规以及许可、税务、广告、制裁和反腐败要求，并对因自身行为造成的违法违规责任承担责任。","El representante cumplirá todas las leyes y requisitos aplicables en materia de licencias, impuestos, publicidad, sanciones y anticorrupción, y será responsable de las infracciones derivadas de su propia conducta.","Le représentant respecte toutes les lois et exigences applicables en matière de licences, fiscalité, publicité, sanctions et lutte contre la corruption, et répond des violations résultant de ses propres actes."))}</li><li>${escapeHtml(agencyText("The representative shall act honestly, accurately describe products, protect confidential and customer information, and shall not make false promises, misuse our trademarks or damage our reputation.","被授权人应诚信经营、如实介绍产品、保护商业秘密和客户信息，不得虚假承诺、滥用授权方商标或实施损害授权方声誉及利益的行为。","El representante actuará con honestidad, describirá los productos con exactitud, protegerá la información confidencial y del cliente, y no hará promesas falsas ni utilizará indebidamente nuestras marcas.","Le représentant agit avec intégrité, décrit fidèlement les produits, protège les informations confidentielles et clients, et s’interdit toute fausse promesse ou utilisation abusive de nos marques."))}</li></ol>
      <section class="agency-scope-summary"><b>${agencyText("Authorized Product Scope","授权产品范围","Productos autorizados","Produits autorisés")}</b><p>${escapeHtml(agencySelectedProductText(a))}</p></section>
      ${showCommission?`<section class="agency-commission-section"><h2>${agencyText("Commission and Settlement","佣金及结算","Comisión y liquidación","Commission et règlement")}</h2><ol class="agency-terms"><li>${escapeHtml(agencyText(`The indicative commission range is ${a.commissionMin}%-${a.commissionMax}%. The final rate must be confirmed in writing for each order.`,`参考佣金比例为${a.commissionMin}%-${a.commissionMax}%，每笔订单的最终比例须另行书面确认。`,`La comisión orientativa es del ${a.commissionMin}%-${a.commissionMax}%; la tasa final se confirmará por escrito para cada pedido.`,`La commission indicative est de ${a.commissionMin}%-${a.commissionMax}%; le taux final est confirmé par écrit pour chaque commande.`))}</li><li>${escapeHtml(a.commissionTerms||"-")}</li><li>${escapeHtml(agencyText(`Payment: ${a.paymentMethods||"-"}; settlement: ${a.settlementDays||"-"} after all conditions are met.`,`支付方式：${a.paymentMethods||"-"}；全部结算条件满足后${a.settlementDays||"-"}支付。`,`Pago: ${a.paymentMethods||"-"}; liquidación: ${a.settlementDays||"-"} después de cumplirse todas las condiciones.`,`Paiement : ${a.paymentMethods||"-"}; règlement : ${a.settlementDays||"-"} après satisfaction de toutes les conditions.`))}</li><li>${escapeHtml(agencyText(a.markupAllowed?"A reasonable markup is permitted, subject to customer acceptance and our final written confirmation.":"No markup is permitted without prior written approval.",a.markupAllowed?"允许在我方基础报价上合理加价，但须经客户接受并由我方最终书面确认。":"未经我方事先书面同意不得加价。",a.markupAllowed?"Se permite un margen razonable, sujeto a la aceptación del cliente y nuestra confirmación final por escrito.":"No se permite margen sin autorización previa por escrito.",a.markupAllowed?"Une marge raisonnable est autorisée, sous réserve de l’acceptation du client et de notre confirmation écrite finale.":"Aucune marge n’est autorisée sans accord écrit préalable."))}</li></ol></section>`:""}
      ${a.extraTerms?`<section class="agency-additional"><h2>${agencyText("Additional Terms","补充条款","Condiciones adicionales","Conditions supplémentaires")}</h2><p>${escapeHtml(a.extraTerms)}</p></section>`:""}
      <p class="agency-validity">${agencyText("This authorization becomes effective on the date of signature and seal.", "本授权书自签字盖章之日起生效。")}</p>
      <footer class="agency-signature"><div class="agency-seal-side">${stamp ? `<img src="${stamp}" alt="Company Stamp">` : `<div class="agency-stamp-placeholder">${agencyText("Company Stamp", "公司公章")}</div>`}<p>${agencyText("Authorizing Party", "授权方")}：${escapeHtml(a.company || "-")}</p></div><div class="agency-signer-side"><p>${agencyText("Authorized Signatory", "授权签署人")}：<b>${escapeHtml(a.authorizer || "Ethan")}</b></p><p>${agencyText("Title", "职务")}：${escapeHtml(a.authorizerTitle || "-")}</p><p>${agencyText("Signature", "签字")}：____________________</p><p class="agency-issue-date">${agencyText("Date of Issue", "签发日期","Fecha de emisión","Date d’émission")}：${escapeHtml(a.date||"-")}</p></div></footer>
    </section>`;
  }

  const renderAgentAuthorizationWithoutSignature = renderAgentAuthorizationPreview;
  renderAgentAuthorizationPreview = function () {
    renderAgentAuthorizationWithoutSignature();
    applyAgencySignature();
  };

  function applyAgencySignature() {
    const a = currentAgentAuthorization, host = $("agency-preview");
    if(['statement','procurement'].includes(AgencyDocuments.type(a||{})))return;
    if (!host || !/^data:image\/(png|jpeg);base64,/.test(a?.signatureDataUrl || "")) return;
    const rotation = [-90, 0, 90, 180].includes(a.signatureRotation) ? a.signatureRotation : 0;
    host.innerHTML = host.innerHTML.replace('____________________', `<span style="display:inline-block;position:relative;width:150px;height:85px;vertical-align:middle"><img alt="Signature" src="${escapeHtml(a.signatureDataUrl)}" style="position:absolute;left:50%;top:50%;width:${Math.abs(rotation) === 90 ? 80 : 145}px;height:${Math.abs(rotation) === 90 ? 145 : 80}px;object-fit:contain;transform:translate(-50%,-50%) rotate(${rotation}deg);mix-blend-mode:multiply"></span>`);
  }

  async function saveAgentAuthorization() {
    collectAgentAuthorizationForm();
    if (!['statement','procurement'].includes(AgencyDocuments.type(currentAgentAuthorization))&&(!currentAgentAuthorization.agentName || !currentAgentAuthorization.country || !currentAgentAuthorization.idNumber || !currentAgentAuthorization.phone || !currentAgentAuthorization.email)) return toast("请填写授权国家、联系人姓名、身份证/护照号、联系电话和电子邮箱。");
    if (currentAgentAuthorization.email&&!/^\S+@\S+\.\S+$/.test(currentAgentAuthorization.email)) return toast("电子邮箱格式不正确。");
    if (AgencyDocuments.type(currentAgentAuthorization)==='authorization'&&!currentAgentAuthorization.selectedProducts.length) return toast("请至少勾选一个授权产品。");
    const validation=AgencyDocuments.validate(currentAgentAuthorization);
    if(validation)return toast(validation);
    if(!currentAgentAuthorization.companySnapshot)currentAgentAuthorization.companySnapshot={companyNameEn:settings.companyNameEn,companyNameZh:settings.companyNameZh,companyAddressEn:settings.companyAddressEn,companyAddressZh:settings.companyAddressZh,stampDataUrl:settings.stampDataUrl||''};
    const data = await api("/api/agent-authorizations", { method:"POST", body:JSON.stringify(currentAgentAuthorization) });
    currentAgentAuthorization.id = data.id;
    await loadAgentAuthorizations();
    toast(currentAgentAuthorization.isTemplate?'模板已保存。':'代理文件已保存。');
    updateAgencyDocumentControls();
  }

  function renderAgentAuthorizationHistory() {
    const host = $("agency-history-list"); if (!host) return;
    host.innerHTML = agentAuthorizations.map((a) => `<article class="list-item"><div><b>${escapeHtml(a.authorizationNumber || "代理文件")} · ${escapeHtml(AgencyDocuments.types[AgencyDocuments.type(a)])}${a.isTemplate?' · 模板':''}</b><p>${escapeHtml(a.agentName || "-")} · ${escapeHtml(a.country || "-")} · ${escapeHtml(a.company || "-")}</p></div><div class="actions"><button type="button" data-agency-action="open" data-id="${a.id}">查看/编辑</button><button type="button" data-agency-action="delete" data-id="${a.id}">删除</button></div></article>`).join("") || `<p class="empty">暂无历史代理文件。</p>`;
  }

  function renderInvitationHistory() {
    const host=$("invitation-history-list"); if(!host)return;
    host.innerHTML=invitations.map(item=>`<article class="list-item"><div><b>${escapeHtml(item.visitorName||"未填写姓名")}</b><p>${escapeHtml(item.visitorCompany||"-")} · ${escapeHtml(item.country||"-")} · ${escapeHtml(item.date||item.updatedAt?.slice(0,10)||"")}</p></div><div class="actions"><button type="button" data-invitation-history="open" data-id="${item.id}">查看/编辑</button><button class="danger" type="button" data-invitation-history="delete" data-id="${item.id}">删除</button></div></article>`).join("")||`<p class="empty">暂无历史邀请函。</p>`;
  }

  function handleInvitationHistory(event) {
    const button=event.target.closest("[data-invitation-history]"); if(!button)return;
    const item=invitations.find(record=>record.id===button.dataset.id); if(!item)return;
    if(button.dataset.invitationHistory==="open") { currentInvitation=structuredClone(item); switchView("invitation"); bindInvitationToForm(); renderInvitationPreview(); return; }
    if(!confirm("确认删除这份邀请函吗？"))return;
    invitations=invitations.filter(record=>record.id!==button.dataset.id); save(keys.invitations,invitations); renderInvitationHistory();
  }

  async function handleAgentAuthorizationHistory(event) {
    const button = event.target.closest("[data-agency-action]"); if (!button) return;
    if (button.dataset.agencyAction === "open") { currentAgentAuthorization = structuredClone(agentAuthorizations.find((a) => a.id === button.dataset.id)); switchView('agency'); bindAgentAuthorizationForm(); renderAgentAuthorizationPreview(); return; }
    if (!confirm("确认删除这份代理授权书吗？")) return;
    await api(`/api/agent-authorizations/${button.dataset.id}`, { method:"DELETE" });
    if (currentAgentAuthorization?.id === button.dataset.id) currentAgentAuthorization = null;
    await loadAgentAuthorizations();
  }

  async function exportAgentAuthorizationPdf(includeCommission=true) {
    collectAgentAuthorizationForm();
    const validation=AgencyDocuments.validate(currentAgentAuthorization,true);if(validation)return toast(validation);
    const previous=currentAgentAuthorization.showCommission;
    currentAgentAuthorization.showCommission=includeCommission;
    if($('agency-show-commission'))$('agency-show-commission').checked=includeCommission;
    renderAgentAuthorizationPreview();
    document.body.classList.add("printing-agency");
    try {
      await waitForPrintableImages($("agency-preview"));
      const fileName = `${currentAgentAuthorization.date || today()} ${currentAgentAuthorization.agentName || "代理文件"} ${currentAgentAuthorization.authorizationNumber} ${AgencyDocuments.types[AgencyDocuments.type(currentAgentAuthorization)]}${currentAgentAuthorization.isTemplate?' 模板':''}.pdf`;
      if (window.quotationDesktop?.exportCurrentPdf) { const path = await window.quotationDesktop.exportCurrentPdf(fileName); if (path) toast(`PDF 已导出：${path}`); }
      else { applyPrintTitle(); window.print(); }
    } finally { currentAgentAuthorization.showCommission=previous; if($("agency-show-commission"))$("agency-show-commission").checked=previous!==false; setTimeout(() => { document.body.classList.remove("printing-agency"); renderAgentAuthorizationPreview(); }, 500); }
  }

  function template() {
    normalizeTemplates();
    return settings.templates.find((t) => t.name === $("quote-template").value) || settings.templates[0];
  }

  function activeDocumentConfig(type = currentQuote?.documentType || "quotation") {
    if(type === "quotation") {
      normalizeTemplates();
      const selected = settings.templates.find((item) => item.name === (currentQuote?.templateName || $("quote-template")?.value));
      const key = selected?.id || selected?.name;
      if(key && settings.quoteTemplateConfigs?.[key]) {DocumentItemTypes.migrate(settings.quoteTemplateConfigs[key]);return settings.quoteTemplateConfigs[key];}
    }
    const config=settings.documentConfigs?.[type] || settings.documentConfigs?.quotation || null;
    if(config&&['quotation','invoice','contract','commercial','packing'].includes(type))DocumentItemTypes.migrate(config);
    return config;
  }

  function configuredBlockFields(block, fallback = []) {
    const snapshotKey={customer:"customerFields",items:"itemFields",terms:"termFields"}[block];
    const snapshotted=currentQuote?.isFormal && snapshotKey ? currentQuote.templateSnapshot?.[snapshotKey] : null;
    const configured = snapshotted || activeDocumentConfig()?.blocks?.[block];
    return (Array.isArray(configured) ? configured : fallback)
      .map(normalizeField)
      .filter((field) => !field.deletedAt && field.visible !== false && field.active !== false)
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  }

  function standaloneDocumentFields(type) {
    const config=settings.documentConfigs?.[type];
    return ['basic','customer','items','terms'].flatMap(block=>(config?.blocks?.[block]||[])
      .map(normalizeField)
      .filter(field=>!field.deletedAt&&field.visible!==false&&field.active!==false)
      .sort((a,b)=>Number(a.sortOrder||0)-Number(b.sortOrder||0)));
  }

  function applyStandaloneDocumentForm(type, mapping, record, grid) {
    if(!grid)return;
    grid.querySelectorAll('[data-standalone-custom]').forEach(label=>label.remove());
    Object.values(mapping).forEach(id=>{const label=$(id)?.closest('label');if(label)label.hidden=true;});
    standaloneDocumentFields(type).forEach(field=>{
      const id=mapping[field.fieldKey];
      if(id&&$(id)){
        const label=$(id).closest('label'),caption=label?.querySelector('span');
        if(label){label.hidden=false;if(caption)caption.textContent=`${field.zh} / ${field.en}${field.required?' *':''}`;grid.appendChild(label);}
        return;
      }
      const label=document.createElement('label');label.dataset.standaloneCustom=field.fieldKey;
      if(field.fieldType==='textarea')label.classList.add('wide');
      const caption=document.createElement('span');caption.textContent=`${field.zh} / ${field.en}${field.required?' *':''}`;
      let input;
      if(['select','dictionary','hierarchy'].includes(field.fieldType)){
        input=document.createElement('select');input.append(new Option('请选择',''));
        (field.options||[]).filter(option=>option.active!==false).forEach(option=>input.append(new Option(option.labelZh||option.labelEn||option.value||'',option.value??option.labelZh??'')));
      }else if(field.fieldType==='textarea')input=document.createElement('textarea');
      else{input=document.createElement('input');input.type=field.fieldType==='date'?'date':field.fieldType==='number'||field.fieldType==='money'?'number':field.fieldType==='checkbox'?'checkbox':'text';}
      input.dataset.standaloneField=field.fieldKey;const value=record?.customFields?.[field.fieldKey]??field.defaultValue??'';
      if(input.type==='checkbox')input.checked=value===true||value==='true';else input.value=value;
      label.append(caption,input);grid.appendChild(label);
    });
  }

  function collectStandaloneCustomFields(record,root){
    record.customFields={...(record.customFields||{})};
    root?.querySelectorAll('[data-standalone-field]').forEach(input=>{record.customFields[input.dataset.standaloneField]=input.type==='checkbox'?input.checked:input.value;});
  }

  function standaloneCustomPreview(type,record){
    const rows=standaloneDocumentFields(type).filter(field=>!({invitation:['date','embassy','language','style','visitorName','visitorCompany','country','gender','passportNo','birthDate','arrivalDate','departureDate','visitPlace','visaType','reason','relationship','expenseSource','notes','inviter','signerTitle'],agency:['authorizationNumber','date','validUntil','language','company','authorizer','authorizerTitle','agentName','idNumber','phone','email','address','country','selectedProducts','authorizationType','extraTerms']}[type]||[]).includes(field.fieldKey)).map(field=>{
      const value=record?.customFields?.[field.fieldKey];return value!==''&&value!=null&&value!==false?`<p><b>${escapeHtml(labelText(field.en,field.zh))}:</b> ${escapeHtml(value===true?'Yes':value)}</p>`:'';
    }).filter(Boolean);
    return rows.length?`<section class="preview-panel standalone-custom-fields"><h3>${escapeHtml(labelText('Additional Information','补充信息'))}</h3>${rows.join('')}</section>`:'';
  }

  function quoteProductTemplate(type = currentQuote?.documentType || "quotation") {
    normalizeTemplates();
    if(currentQuote?.isFormal && currentQuote.templateSnapshot?.productTemplate)return currentQuote.templateSnapshot.productTemplate;
    if(type !== "quotation") return null;
    const config = activeDocumentConfig(type);
    if (!config || config.productMode !== "linked") return template();
    return settings.templates.find((item) => (item.id || item.name) === config.productTemplateId) || template();
  }

  function bindQuoteToForm() {
    $("quote-template").value = currentQuote.templateName || settings.templates[0]?.name || "";
    renderDocumentTypes();
    $("quote-style-select").value = currentQuote.quoteStyle || settings.quoteStyle || "classic";
    if ($("quote-status")) $("quote-status").value = currentQuote.status || "普通报价";
    $("quote-number").value = currentQuote.quoteNumber || "";
    $("quote-date").value = currentQuote.quoteDate || today();
    $("valid-until").value = currentQuote.validUntil || addDays(7);
    $("pdf-language").value = currentQuote.pdfLanguage || "bilingual";
    const quoteCurrencies=[...new Set([...(settings.currencies||[]),currentQuote.currency,currentQuote.secondaryCurrency].filter(Boolean).map(value=>String(value).toUpperCase()))];
    ["quote-currency","quote-secondary-currency"].forEach(id=>{if($(id))$(id).innerHTML=quoteCurrencies.map(currency=>`<option value="${escapeHtml(currency)}">${escapeHtml(currency)}</option>`).join("");});
    if ($("quote-currency")) $("quote-currency").value = currentQuote.currency || settings.currency || "USD";
    if($("quote-currency-display"))$("quote-currency-display").value=currentQuote.currencyDisplay||"single";
    if($("quote-secondary-currency"))$("quote-secondary-currency").value=currentQuote.secondaryCurrency||quoteCurrencies.find(currency=>currency!==currentQuote.currency)||"USD";
    if($("quote-fx-rate"))$("quote-fx-rate").value=currentQuote.exchangeRate?.rate||"";
    syncDualCurrencyControls();
    $("buyer-country").value = currentQuote.buyer.country || "";
    $("buyer-company").value = currentQuote.buyer.company || "";
    $("buyer-contact").value = currentQuote.buyer.contact || "";
    $("buyer-phone").value = currentQuote.buyer.phone || "";
    $("buyer-email").value = currentQuote.buyer.email || "";
    $("buyer-address").value = currentQuote.buyer.address || "";
    renderQuoteTerms();
    applyCustomerQuoteFieldLabels();
    applyDocumentBasicFields();
  }

  function renderQuoteTerms() {
    const tpl = template();
    const values = currentQuote.terms || {};
    const fields = configuredBlockFields("terms", tpl.termFields || defaultTermFields)
      .filter((field) => field.fieldType !== "calculated" && field.fieldType !== "image");
    // Older packing configurations did not expose the shared Incoterm control.
    if(currentQuote.documentType==='packing' && !fields.some(f=>['shipping','tradeTerm'].includes(f.fieldKey)))
      fields.unshift({fieldKey:'shipping',en:'Trade Term',zh:'贸易方式',fieldType:'combobox'});
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
    currentQuote.quoteStyle = $("quote-style-select")?.value || settings.quoteStyle || "classic";
    currentQuote.quoteNumber = $("quote-number").value;
    currentQuote.quoteDate = $("quote-date").value;
    currentQuote.validUntil = $("valid-until").value;
    currentQuote.showProductPhotos = $("quote-show-product-images")?.checked !== false;
    currentQuote.pdfLanguage = $("pdf-language").value || "bilingual";
    currentQuote.currency = $("quote-currency")?.value || settings.currency || "USD";
    currentQuote.currencyDisplay=$("quote-currency-display")?.value||"single";
    currentQuote.secondaryCurrency=$("quote-secondary-currency")?.value||"USD";
    currentQuote.exchangeRate={sourceCurrency:currentQuote.currency,targetCurrency:currentQuote.secondaryCurrency,rate:Number($("quote-fx-rate")?.value||0),capturedAt:new Date().toISOString()};
    currentQuote.customerId = null;
    currentQuote.buyer = {
      country: $("buyer-country").value,
      company: $("buyer-company").value,
      contact: $("buyer-contact").value,
      phone: $("buyer-phone").value,
      email: $("buyer-email").value,
      address: $("buyer-address").value
    };
    currentQuote.basicFields = {...(currentQuote.basicFields || {})};
    document.querySelectorAll('[data-basic-custom]').forEach((input) => {
      currentQuote.basicFields[input.dataset.basicCustom] = input.type === 'checkbox' ? input.checked : input.value;
    });
    document.querySelectorAll('[data-buyer-custom]').forEach(input=>currentQuote.buyer[input.dataset.buyerCustom]=input.value);
    currentQuote.terms = {...currentQuote.terms};
    document.querySelectorAll("[data-termfield]").forEach((input) => currentQuote.terms[input.dataset.termfield] = input.value);
    const lineRows = Array.from(document.querySelectorAll(".quote-line"));
    currentQuote.items = lineRows.length ? lineRows.map((row) => {
      const values = {...currentQuote.items.find(item=>item.id===row.dataset.id)?.values};
      row.querySelectorAll("[data-qfield]").forEach((input) => {
        values[input.dataset.qfield] = input.multiple
          ? [...input.selectedOptions].map((option) => option.value).join(",")
          : input.type === "checkbox" ? input.checked : input.value;
      });
      let freightSnapshot = null;
      try { freightSnapshot = row.dataset.freightSnapshot ? JSON.parse(decodeURIComponent(row.dataset.freightSnapshot)) : null; } catch { freightSnapshot = null; }
      return {
        id: row.dataset.id,
        kind: row.dataset.kind || "product",
        additionalImages: currentQuote.items.find(item => item.id === row.dataset.id)?.additionalImages || [],
        values,
        imageDataUrl: row.dataset.image || "",
        freightSnapshot
      };
    }) : Array.from(document.querySelectorAll(".quote-item")).map((card) => {
      const values = {};
      card.querySelectorAll("[data-qfield]").forEach((input) => {
        values[input.dataset.qfield] = input.multiple
          ? [...input.selectedOptions].map((option) => option.value).join(",")
          : input.type === "checkbox" ? input.checked : input.value;
      });
      let freightSnapshot = null;
      try { freightSnapshot = card.dataset.freightSnapshot ? JSON.parse(decodeURIComponent(card.dataset.freightSnapshot)) : null; } catch { freightSnapshot = null; }
      return { id: card.dataset.id, kind: card.dataset.kind || "product", additionalImages: currentQuote.items.find(item => item.id === card.dataset.id)?.additionalImages || [], values, imageDataUrl: card.querySelector("[data-image]")?.dataset.image || "", freightSnapshot };
    });
    if(currentQuote.documentType==='packing'){
      currentQuote.packing||={};
      currentQuote.items.forEach(item=>{const saved=currentQuote.packing[item.id]||{};const merged={...saved};for(const key of ['packages','netWeight','grossWeight','cbm','marks'])merged[key]=item.values[key]!==undefined?item.values[key]:(saved[key]??'');currentQuote.packing[item.id]=merged;Object.assign(item.values,merged);});
    }
    currentQuote.updatedAt = new Date().toISOString();
  }

  function syncDualCurrencyControls() {
    const main=$("quote-currency")?.value||settings.currency||"USD",display=$("quote-currency-display")?.value||"single",secondary=$("quote-secondary-currency"),rate=$("quote-fx-rate"),hint=$("quote-fx-hint");
    const dual=display==="dual";
    if(dual&&secondary&&secondary.value===main){const alternative=[...(settings.currencies||[]),"USD","CNY","EUR","GBP"].map(value=>String(value).toUpperCase()).find(value=>value!==main);if(alternative){if(![...secondary.options].some(option=>option.value===alternative))secondary.add(new Option(alternative,alternative));secondary.value=alternative;}}
    if(secondary)secondary.disabled=!dual;
    if(rate)rate.disabled=!dual;
    if(hint)hint.textContent=dual?`请输入明确汇率：1 ${main} = ? ${secondary?.value||"第二币种"}。单价、金额和总计会同时显示两种货币；该汇率随单据保存。`:'当前仅显示主报价币种。选择“同时显示第二币种”后填写汇率。';
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
        itemType: "设备",
        description: "",
        route:"",
        qty: "1",
        billingUnit:"台",
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

  function isNewCondition(value) {
    const text=String(value||"").toLowerCase();
    return text!=="used" && (text.startsWith("new-") || text.includes("new") || text.includes("全新") || text.includes("未使用") || text.includes("新机"));
  }

  function conditionDisplayText(value) {
    const condition=String(value||"used").trim();
    const labels={used:labelText("Used","二手"),"new-unused":labelText("Brand New & Unused","全新未使用"),"new-machine":labelText("New Machinery","全新机械"),"new-truck":labelText("New Truck","全新卡车")};
    return labels[condition] || condition;
  }

  function suggestedHsCode(...parts) {
    const text=normalize(parts.filter(Boolean).join(" "));
    return allHsCodes().find(item=>(item.keywords || []).some(keyword=>text.includes(normalize(keyword))))?.code || "";
  }

  function lineDescription(item) {
    const values = item.values || {};
    if((item.kind||'product')!=='product')return values.description||values.itemType||'';
    const condition = values.condition || "used";
    const prefix = conditionDisplayText(condition);
    const details = condition === "new-truck"
      ? [values.productionDate ? `Production: ${values.productionDate}` : "", values.engine ? `Engine: ${values.engine}` : ""].filter(Boolean).join(" | ")
      : isNewCondition(condition) && values.productionDate ? `Production: ${values.productionDate}` : "";
    return values.description
      || [prefix, values.productType, values.brand, values.model, details].filter(Boolean).join(" ")
      || values.remark
      || "";
  }

  function quoteLineColumns() {
    normalizeQuoteLineColumns();
    const documentType=currentQuote?.documentType||"quotation";
    const linked = quoteProductTemplate(documentType);
    const config = activeDocumentConfig();
    const aliases={productType:"description",totalAmount:"amount",productImage:"image"};
    const source = documentType === "quotation" && config?.productMode === "linked" && linked?.fields?.length
      ? linked.fields.map((field) => {
          const key=aliases[field.fieldKey]||field.fieldKey;
          return { key, labelZh:key==="description"?"商品信息 / 产品描述":field.zh, labelEn:key==="description"?"Product Description":field.en, type:field.fieldType, ...field, fieldKey:key };
        }).filter((field,index,array)=>array.findIndex(item=>item.fieldKey===field.fieldKey)===index)
      : configuredBlockFields("items", settings.quoteLineColumns).map((field) => ({ key:field.fieldKey, labelZh:field.zh, labelEn:field.en, type:field.fieldType, ...field }));
    const configuredType=configuredBlockFields('items',settings.quoteLineColumns).find(field=>field.fieldKey==='itemType');
    const typeIndex=source.findIndex(field=>(field.key||field.fieldKey)==='itemType');
    if(typeIndex>=0)source.splice(typeIndex,1);
    if(configuredType)source.unshift({...configuredType,key:'itemType'});
    return source
      .slice()
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      .filter((column) => column.visible !== false && column.active !== false && (column.key || column.fieldKey) !== "condition")
      .map((column) => ({...column,key:column.key || column.fieldKey,labelZh:column.labelZh || column.zh,labelEn:column.labelEn || column.en,type:column.type || column.fieldType}));
  }

  function renderItemTypeInput(field,item) {
    const raw=item.values?.itemType||'',selected=DocumentItemTypes.match(field,raw),options=DocumentItemTypes.options(field);
    const legacy=raw&&!selected?`<option value="${escapeHtml(raw)}" data-kind="${escapeHtml(item.kind||'custom')}" selected disabled>${escapeHtml(item.values?.itemTypeLabelZh||raw)}（已停用／历史值）</option>`:'';
    return `<select data-qfield="itemType" class="quote-item-type"><option value="" ${!raw?'selected':''}>请选择条目类型</option>${legacy}${options.map(option=>`<option value="${escapeHtml(option.value)}" data-kind="${escapeHtml(DocumentItemTypes.kind(option))}" data-label-zh="${escapeHtml(option.labelZh||option.value)}" data-label-en="${escapeHtml(option.labelEn||option.value)}" ${option===selected?'selected':''}>${escapeHtml(option.labelZh||option.labelEn||option.value)}</option>`).join('')}</select>`;
  }

  function renderQuoteLineInput(column, item) {
    const values = item.values || {};
    const key = escapeHtml(column.key);
    const required = column.required ? " required" : "";
    const isEquipment=(item.kind||"product")==="product";
    if(column.key==='route'){
      const modes=['散杂船 / Breakbulk','滚装船 / Ro-Ro','集装箱运输 / Container'];
      const selected=values.route||'';
      if(selected&&!modes.includes(selected))modes.push(selected);
      return `<select data-qfield="route" aria-label="运输方式"><option value="">请选择运输方式</option>${modes.map(v=>`<option value="${escapeHtml(v)}" ${v===selected?'selected':''}>${escapeHtml(v)}</option>`).join('')}</select>`;
    }
    if (column.key === 'itemType') return renderItemTypeInput(column,item);
    if (column.key === "condition") return isEquipment?`<input data-qfield="condition" class="quote-condition-select" list="quote-condition-options" value="${escapeHtml(values.condition||"used")}" placeholder="选择或直接输入设备状态">`:`<span class="not-applicable">—</span>`;
    if (column.key === "description") return `<div class="description-editor"><textarea data-qfield="description"${required} placeholder="填写品牌、型号和产品描述">${escapeHtml(lineDescription(item))}</textarea><div class="new-detail-fields" ${isNewCondition(values.condition)?"":"hidden"}><input data-qfield="productionDate" type="text" value="${escapeHtml(values.productionDate||"")}" placeholder="生产年份/日期（可选）"><input data-qfield="engine" type="text" value="${escapeHtml(values.engine||"")}" placeholder="发动机（新卡车填写）" ${values.condition==="new-truck"?"":"hidden"}></div></div>`;
    if (column.key === "billingUnit") return `<select data-qfield="billingUnit"><option ${values.billingUnit==="台"?"selected":""}>台</option><option ${values.billingUnit==="m³"?"selected":""}>m³</option><option ${values.billingUnit==="吨"?"selected":""}>吨</option><option ${values.billingUnit==="柜"?"selected":""}>柜</option><option ${values.billingUnit==="项"?"selected":""}>项</option></select>`;
    if (column.key === "hsCode") return isEquipment?`<div class="hs-code-input"><input data-qfield="hsCode" list="hs-code-options" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" value="${escapeHtml(values.hsCode || suggestedHsCode(values.productType,values.description,values.brand,values.model))}" placeholder="8位 HS CODE"><button class="add-hs-code-btn no-print" type="button">＋ 新建编码</button><small>请输入8位编码，申报前请由目的国清关代理确认</small></div>`:`<span class="not-applicable">—</span>`;
    if (column.key === "qty") return `<input data-qfield="qty" type="number" min="0" step="1" value="${escapeHtml(values.qty || "1")}"${required} />`;
    if (column.key === "unitPrice") return `<input data-qfield="unitPrice" type="number" min="0" step="0.01" value="${escapeHtml(values.unitPrice ?? "")}"${required} />`;
    if (column.key === "currency") return renderCurrencySelect("currency", values.currency || settings.currency);
    if (column.key === "amount") return `<span class="line-amount">${values.unitPrice===""||values.unitPrice==null?"待询价":escapeHtml(dualMoneyText(itemSubtotal(item), values.currency || currentQuote.currency || settings.currency))}</span>`;
    if (column.key === "image") return `<div class="line-image-box"><img src="${item.imageDataUrl || ""}" alt=""${item.imageDataUrl ? "" : " hidden"} /><span${item.imageDataUrl ? " hidden" : ""}>尚未上传</span></div>`;
    if (column.key === "remark") return `<input data-qfield="remark" value="${escapeHtml(values.remark || "")}"${required} />`;
    if (["select","dictionary","hierarchy"].includes(column.fieldType || column.type) && Array.isArray(column.options)) {
      const options=column.options.filter(option=>option.active!==false);
      const optionDepth=(option)=>{let depth=0,parent=option.parentId,guard=0;while(parent&&guard++<20){depth+=1;parent=options.find(item=>item.id===parent)?.parentId||'';}return depth;};
      return `<select data-qfield="${key}"${required}><option value="">请选择</option>${options.map(option=>{const value=String(option.value??option.labelZh??option.zh??"");const label=labelText(option.labelEn||option.en||value,option.labelZh||option.zh||value);return `<option value="${escapeHtml(value)}"${String(values[column.key]??"")===value?" selected":""}>${'　'.repeat(optionDepth(option))}${escapeHtml(label)}</option>`;}).join("")}</select>`;
    }
    if ((column.fieldType || column.type) === "combobox") { const listId=`quote-options-${escapeHtml(item.id)}-${key}`; return `<input data-qfield="${key}" list="${listId}" value="${escapeHtml(values[column.key]||"")}"${required}><datalist id="${listId}">${(column.options||[]).filter(option=>option.active!==false).map(option=>`<option value="${escapeHtml(option.value??option.labelZh??"")}">${escapeHtml(option.labelZh||option.value||"")}</option>`).join("")}</datalist>`; }
    if ((column.fieldType || column.type) === "multiselect") { const selected=Array.isArray(values[column.key])?values[column.key]:String(values[column.key]||"").split(',').filter(Boolean); return `<select data-qfield="${key}" multiple${required}>${(column.options||[]).filter(option=>option.active!==false).map(option=>{const value=String(option.value??option.labelZh??"");return `<option value="${escapeHtml(value)}"${selected.includes(value)?" selected":""}>${escapeHtml(labelText(option.labelEn||value,option.labelZh||value))}</option>`;}).join("")}</select>`; }
    if ((column.fieldType || column.type) === "checkbox") return `<input data-qfield="${key}" type="checkbox" ${values[column.key]===true||values[column.key]==='true'?'checked':''}${required}>`;
    if ((column.fieldType || column.type) === "date") return `<input data-qfield="${key}" type="date" value="${escapeHtml(values[column.key]||"")}"${required}>`;
    if ((column.fieldType || column.type) === "textarea") return `<textarea data-qfield="${key}"${required}>${escapeHtml(values[column.key] || "")}</textarea>`;
    if (["number","money"].includes(column.fieldType || column.type)) return `<input data-qfield="${key}" type="number" step="any" value="${escapeHtml(values[column.key] ?? "")}"${required} />`;
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
    if(currentQuote.documentType==='packing') currentQuote.items.forEach(item=>{
      item.values={...(currentQuote.packing?.[item.id]||{}),...(item.values||{})};
    });
    const columns = quoteLineColumns();
    $("quote-items").innerHTML = `
      <div class="quote-line-table-wrap">
        <table class="quote-line-table">
          <thead>
            <tr>
              ${columns.map((column) => `<th class="quote-input-col-${escapeHtml(column.key)}">${escapeHtml(column.labelZh)}${column.required ? " *" : ""}</th>`).join("")}
              <th class="quote-input-col-actions">操作</th>
            </tr>
          </thead>
          <tbody>
            ${(currentQuote.items || []).map((item) => {
              const values = item.values || {};
              const currency = values.currency || settings.currency;
              return `
                <tr class="quote-line ${item.imageDataUrl?"has-product-image":""}" data-id="${escapeHtml(item.id || uid("item"))}" data-kind="${escapeHtml(item.kind || "product")}" data-image="${escapeHtml(item.imageDataUrl || "")}" data-freight-snapshot="${item.freightSnapshot ? encodeURIComponent(JSON.stringify(item.freightSnapshot)) : ""}">
                  ${columns.map((column) => `<td class="quote-input-col-${escapeHtml(column.key)}" data-label="${escapeHtml(column.labelZh)}${column.required ? " *" : ""}">${renderQuoteLineInput(column, item)}</td>`).join("")}
                  <td class="quote-input-col-actions" data-label="操作"><div class="quote-row-actions"><div class="quote-action-image-preview"${item.imageDataUrl ? "" : " hidden"}><img src="${item.imageDataUrl || ""}" alt="已上传的产品图片"><span>已加入预览和PDF</span></div><label class="file-btn">从本地上传图片<input class="quote-line-image-input" type="file" accept="image/*" /></label><button class="clear-line-image" type="button"${item.imageDataUrl ? "" : " hidden"}>移除图片</button><button class="remove-quote-item" type="button">删除产品</button></div></td>
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
      if (target) target.textContent = row.querySelector("[data-qfield='unitPrice']")?.value === "" ? "待询价" : dualMoneyText(qty * unitPrice, currency);
    });
  }

  function renderFieldInput(field, value) {
    const key = escapeHtml(field.fieldKey);
    const val = escapeHtml(value);
    if (field.fieldType === "textarea") return `<textarea data-qfield="${key}">${val}</textarea>`;
    if (field.fieldType === "date") return `<input data-qfield="${key}" type="date" value="${val}" />`;
    if (field.fieldType === "number" || field.fieldType === "money") return `<input data-qfield="${key}" type="number" value="${val}" />`;
    if (["select","dictionary","hierarchy"].includes(field.fieldType)) { const options=field.fieldKey==='currency'?(settings.currencies||[]).map(item=>({value:item,labelZh:item,labelEn:item})):(field.options||[]).filter(option=>option.active!==false); const optionDepth=(option)=>{let depth=0,parent=option.parentId,guard=0;while(parent&&guard++<20){depth+=1;parent=options.find(item=>item.id===parent)?.parentId||'';}return depth;}; return `<select data-qfield="${key}"><option value="">请选择</option>${options.map(option=>{const optionValue=String(option.value??option);return `<option value="${escapeHtml(optionValue)}"${optionValue===String(value)?' selected':''}>${'　'.repeat(optionDepth(option))}${escapeHtml(option.labelZh||optionValue)}</option>`;}).join('')}</select>`; }
    if (field.fieldType === "combobox") { const listId=`field-options-${key}`; return `<input data-qfield="${key}" list="${listId}" value="${val}"><datalist id="${listId}">${(field.options||[]).filter(option=>option.active!==false).map(option=>`<option value="${escapeHtml(option.value)}">${escapeHtml(option.labelZh||option.value)}</option>`).join('')}</datalist>`; }
    if (field.fieldType === "multiselect") { const selected=String(value||'').split(',').filter(Boolean); return `<select data-qfield="${key}" multiple>${(field.options||[]).filter(option=>option.active!==false).map(option=>`<option value="${escapeHtml(option.value)}"${selected.includes(String(option.value))?' selected':''}>${escapeHtml(option.labelZh||option.value)}</option>`).join('')}</select>`; }
    if (field.fieldType === "checkbox") return `<input data-qfield="${key}" type="checkbox" ${value===true||value==='true'?'checked':''}>`;
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
          <p>${product.specificPrice!=null&&product.specificPrice!==""?`具体价格：${money(product.specificPrice,product.currency||"USD")}`:"具体价格：待询价"}${product.referencePrice?` · 参考价：${money(product.referencePrice,settings.currency)}`:""}</p>
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
      .filter((cat) => cat.visible !== false && isProductCategory(cat))
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
      const popularOrigins=["Shanghai Port / 上海港, China / 中国","Tianjin Port / 天津港, China / 中国","Lianyungang Port / 连云港港, China / 中国","Ningbo-Zhoushan Port / 宁波舟山港, China / 中国","Qingdao Port / 青岛港, China / 中国"];
      const optionValues=[...(originOnly?popularOrigins:[]),...sourcePorts.map(portOptionLabel)].filter((item,index,array)=>item&&array.indexOf(item)===index);
      const datalistOptions = optionValues.map((port) => `<option value="${escapeHtml(port)}"></option>`).join("");
      const placeholder = originOnly ? "Shanghai Port / 上海港" : "Dar es Salaam Port / 达累斯萨拉姆港";
      return `
        <input class="combo-input" data-termfield="${key}" list="${listId}" value="${val}" placeholder="${placeholder}" />
        <datalist id="${listId}">${datalistOptions}</datalist>
        <p class="term-desc">${originOnly ? "可直接输入，也可点击下拉选择中国起运港。" : "可直接输入港口，也可点击下拉选择全球目的港。"}</p>
      `;
    }
    if (field.fieldKey === "payment") {
      const selected = value || "30/70";
      const options = paymentOptions.some(option => option.value === selected)
        ? paymentOptions : [...paymentOptions, {value: selected, label: selected}];
      return `<select data-termfield="${key}">${options.map((option) => `<option value="${escapeHtml(option.value)}"${option.value === selected ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>`;
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
        itemType:"设备",
        description: [values.productType || p.category, values.brand || p.brand, values.model || p.model, values.year || p.year].filter(Boolean).join(" "),
        productType: values.productType || p.category || "",
        brand: values.brand || p.brand || "",
        model: values.model || p.model || "",
        year: values.year || p.year || "",
        hours: p.workingHours ?? values.hours ?? p.hours ?? "",
        unitPrice: p.specificPrice ?? "",
        priceStatus:p.specificPrice==null||p.specificPrice===""?"pending":"quoted",
        currency: p.currency || values.currency || settings.currency,
        qty: "1",
        billingUnit:"台",
        productId:p.id,recordType:p.recordType||"model",inventoryCode:p.inventoryCode||"",transportCbm:p.transportCbm||"",transportWeight:p.weight||"",transportDataStatus:p.transportDataStatus||"reference",transportPlans:structuredClone(p.transportPlans||[]),productUpdatedAt:p.updatedAt||"",
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
    const target=quote?.currency||settings.currency,fx=quote?.exchangeRate||{};
    return (quote?.items || []).reduce((sum, item) => {const amount=itemSubtotal(item,tpl),source=item.values?.currency||target;if(source===target)return sum+amount;if(fx.sourceCurrency===source&&fx.targetCurrency===target&&Number(fx.rate)>0)return sum+amount*Number(fx.rate);if(fx.sourceCurrency===target&&fx.targetCurrency===source&&Number(fx.rate)>0)return sum+amount/Number(fx.rate);return sum;}, 0);
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
    const translation=documentTranslatedValue('item:'+item.id+':description');
    if(translation) return translation;
    if (values.description) return localizedSlashValue(values.description,displayMode());
    if (["freight", "trucking", "custom"].includes(item.kind || "")) {
      const skip = new Set(["qty", "unitPrice", "currency", "remark"]);
      const fields = (costTemplate(item.kind).fields || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const parts = fields
        .filter((field) => field.visible && !skip.has(field.fieldKey))
        .map((field) => values[field.fieldKey] ? `${labelText(field.en,field.zh)}: ${values[field.fieldKey]}` : "")
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
      .map((field) => values[field.fieldKey] ? `${labelText(field.en,field.zh)}: ${values[field.fieldKey]}` : "")
      .filter(Boolean);
    return parts.length ? parts.join(" | ") : [values.productType, values.brand, values.model, values.year].filter(Boolean).join(" ");
  }

  function previewRemark(item) {
    return documentTranslatedValue('item:'+item.id+':remark') || item.values?.remark || "";
  }

  function visibleQuoteField(key) {
    const tpl = quoteTemplate(currentQuote);
    const field = (tpl.fields || []).find((item) => item.fieldKey === key);
    return field ? field.visible !== false : true;
  }

  function quotePreviewColumns() {
    // September quotation layout: honor the configured columns, including custom fields.
    if((currentQuote.documentType||'quotation')==='quotation')return quoteLineColumns()
      .filter(column=>column.key!=='image'||currentQuote.showProductPhotos!==false)
      .map(column=>({key:column.key,en:column.labelEn||column.key,zh:column.labelZh||column.key,type:column.type}));
    const columns = quoteLineColumns().filter(column => column.key !== 'image'||currentQuote.showProductPhotos!==false).map((column) => ({
      key: column.key,
      en: column.labelEn || column.key,
      zh: column.labelZh || column.key,
      type: column.type,
      visible: column.visible !== false
    }));
    const leading = [{key:'sequence',en:'No.',zh:'序号'}];
    return [...leading,...columns.filter(column=>column.key!=='image'||currentQuote.showProductPhotos!==false)];
  }

  function renderQuotePreviewHead() {
    const printCore = new Set(["sequence","description","hsCode","qty","billingUnit","unitPrice","amount","image"]);
    return quotePreviewColumns().map((column) => `<th class="preview-col-${escapeHtml(column.key)}${printCore.has(column.key)?"":" preview-col-extra"}">${labelHtml(column.en, column.zh)}</th>`).join("");
  }

  // Keep canonical values in storage; translate only document output.
  function quoteItemTypeText(item, mode = displayMode()) {
    const field=configuredBlockFields('items',settings.quoteLineColumns).find(f=>f.fieldKey==='itemType');
    const option=DocumentItemTypes.match(field,item.values?.itemType);
    if(option)return labelText(option.labelEn||option.value,option.labelZh||option.value);
    if(item.values?.itemTypeLabelEn||item.values?.itemTypeLabelZh)return labelText(item.values.itemTypeLabelEn||item.values.itemType,item.values.itemTypeLabelZh||item.values.itemType);
    const types = {
      product: ["设备", "Equipment", "Équipement", "Equipo"],
      freight: ["海运费", "Sea freight", "Fret maritime", "Flete marítimo"],
      trucking: ["国内运输费", "Inland transport", "Transport intérieur", "Transporte interior"],
      port: ["港杂及报关费", "Port and customs clearance charges", "Frais portuaires et de dédouanement", "Gastos portuarios y de despacho aduanero"],
      insurance: ["保险费", "Insurance", "Assurance", "Seguro"],
      handling: ["拆装费", "Disassembly and assembly charges", "Frais de démontage et de remontage", "Gastos de desmontaje y montaje"],
      custom: ["其他费用", "Other charges", "Autres frais", "Otros gastos"]
    };
    const raw = item.values?.itemType;
    const entry = Object.values(types).find(labels => labels.includes(raw)) || types[item.kind || "product"];
    if (!entry) return raw || "";
    const [zh, en, fr, es] = entry;
    return ({zh, en, fr, es, bilingual: `${en} / ${zh}`, "zh-en": `${en} / ${zh}`, "zh-fr": `${fr} / ${zh}`, "zh-es": `${es} / ${zh}`})[mode] || `${en} / ${zh}`;
  }

  function quotePreviewCell(item, column) {
    const values = item.values || {};
    const currency = values.currency || settings.currency;
    if(column.key==='hsCode' && (item.kind||'product')!=='product')return '—';
    if (column.key === "itemType") return quoteItemTypeText(item);
    if (column.key === "tradeTerm") return Object.prototype.hasOwnProperty.call(values, "tradeTerm") ? values.tradeTerm : (currentQuote?.terms?.shipping || "EXW");
    if (column.key === "condition") return (item.kind||"product")==="product" ? conditionDisplayText(values.condition || "used") : "—";
    if (column.key === "type") return values.productType || itemKindLabel(item.kind || "product");
    if (column.key === "description") return previewDescription(item);
    if (column.key === "qty") return values.qty || "1";
    if (column.key === 'billingUnit') {const unit={台:['Unit','台'],吨:['Ton','吨'],柜:['Container','柜'],项:['Item','项']}[values.billingUnit];return unit?labelText(...unit):values.billingUnit||'';}
    if(column.key==='origin')return (item.kind||'product')==='product'?(currentQuote.packing?.[item.id]?.origin||'—'):'—';
    if (column.key === "unitPrice") return values.unitPrice === "" || values.unitPrice == null ? labelText('Pending quotation','待询价') : dualMoneyText(values.unitPrice, currency);
    if (column.key === "amount") return values.unitPrice === "" || values.unitPrice == null ? labelText('Pending quotation','待询价') : dualMoneyText(itemSubtotal(item), currency);
    if (column.key === "currency") return currency;
    if (column.key === "image") return "";
    if (column.key === "remark") return previewRemark(item);
    if (values[column.key]) return values[column.key];
    return "";
  }

  function dualCurrencyEnabled() {
    return currentQuote?.currencyDisplay === "dual"
      && currentQuote.secondaryCurrency
      && currentQuote.secondaryCurrency !== currentQuote.currency
      && Number(currentQuote.exchangeRate?.rate) > 0;
  }

  function convertToQuoteCurrency(amount, sourceCurrency) {
    const value=Number(amount||0),main=currentQuote?.currency||settings.currency||"USD",rate=Number(currentQuote?.exchangeRate?.rate||0);
    if(!sourceCurrency||sourceCurrency===main)return value;
    if(currentQuote?.exchangeRate?.sourceCurrency===sourceCurrency&&currentQuote.exchangeRate?.targetCurrency===main&&rate>0)return value*rate;
    if(currentQuote?.exchangeRate?.sourceCurrency===main&&currentQuote.exchangeRate?.targetCurrency===sourceCurrency&&rate>0)return value/rate;
    return value;
  }

  function dualMoneyText(amount, sourceCurrency) {
    const main=currentQuote?.currency||settings.currency||"USD";
    const mainAmount=convertToQuoteCurrency(amount,sourceCurrency||main);
    if(!dualCurrencyEnabled())return money(mainAmount,main);
    return `${money(mainAmount,main)} / ${money(mainAmount*Number(currentQuote.exchangeRate.rate),currentQuote.secondaryCurrency)}`;
  }

  function renderQuotePreviewRows() {
    const columns = quotePreviewColumns();
    const printCore = new Set(["sequence","description","hsCode","qty","billingUnit","unitPrice","amount","image"]);
    return (currentQuote.items || []).filter(item=>currentQuote.documentType !== 'packing' || (item.kind||'product')==='product').map((item, index) => {
      return `<tr class="${item.imageDataUrl?"preview-row-with-image":""}">${columns.map((column) => {
        const label = `${column.en || column.key} / ${column.zh || column.key}`;
        if(column.key === 'sequence') return `<td class="preview-col-sequence" data-label="${escapeHtml(label)}">${index+1}</td>`;
        if(['packages','netWeight','grossWeight','cbm','marks'].includes(column.key)) return `<td>${escapeHtml(item.values?.[column.key] ?? currentQuote.packing?.[item.id]?.[column.key] ?? '—')}</td>`;
        if (column.key === "image") return `<td class="preview-col-image preview-product-image" data-label="${escapeHtml(label)}">${(item.kind||'product')==='product'&&(item.imageDataUrl||item.additionalImages?.[0])?`<img src="${escapeHtml(item.imageDataUrl||item.additionalImages[0])}" alt="${escapeHtml(labelText('Image','图片'))}">`:'—'}</td>`;
        const value = quotePreviewCell(item, column);
        const printMeta = column.key === "description" && !['commercial','packing'].includes(currentQuote.documentType)
          ? `<span class="print-product-meta">${escapeHtml(quoteLineColumns().filter(c=>!['image','description','hsCode','qty','billingUnit','unitPrice','amount','currency','remark','itemType'].includes(c.key)).map(c=>{const value=quotePreviewCell(item,c);return value&&value!=='—'?labelText(c.labelEn||c.key,c.labelZh||c.key)+': '+value:'';}).filter(Boolean).join(' · '))}</span>`
          : "";
        return `<td class="preview-col-${escapeHtml(column.key)}${printCore.has(column.key)?"":" preview-col-extra"}" data-label="${escapeHtml(label)}"><span class="preview-cell-value">${escapeHtml(value)}</span>${printMeta}</td>`;
      }).join("")}</tr>`;
    }).join("");
  }

  function displayTermValue(field) {
    const translation=documentTranslatedValue('term:'+field.fieldKey);
    if(translation) return translation;
    const value = currentQuote.terms[field.fieldKey] || "";
    if (["notes", "warranty", "afterSales"].includes(field.fieldKey) && ["bilingual", "zh-fr", "zh-es"].includes(displayMode())) return value;
    if (field.fieldKey === "payment") {
      if (["bilingual", "zh-fr", "zh-es"].includes(displayMode()) && String(value).includes(' / ')) return value;
      return paymentLabel(value);
    }
    if (field.fieldKey === "shipping" || field.fieldKey === "tradeTerm") {
      return value || "EXW";
    }
    return localizedSlashValue(value, displayMode());
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

  function quoteSectionTitle(key) {
    if(currentQuote.documentType==='invoice') {
      const titles={items:['Proforma Invoice Items','形式发票商品明细'],terms:['Payment and Delivery Terms','付款及交付条款']};
      if(titles[key])return labelText(...titles[key]);
    }
    if(currentQuote.documentType==='contract' && key==='items')return labelText('Contract Items','合同明细');
    normalizeCustomerQuoteFields();
    const title=settings.quoteSectionTitles[key] || defaultSettings.quoteSectionTitles[key];
    return labelText(title.labelEn,title.labelZh);
  }

  function customerPreviewFields(buyer = {}) {
    normalizeCustomerQuoteFields();
    return configuredBlockFields("customer",settings.customerQuoteFields).map((field)=>`<p class="document-customer-field" data-field-key="${escapeHtml(field.fieldKey)}"><b>${escapeHtml(labelText(field.en,field.zh))}:</b> <span>${escapeHtml(buyer[field.fieldKey] ?? "")}</span></p>`).join("");
  }

  function applyCustomerQuoteFieldLabels() {
    normalizeCustomerQuoteFields();
    const ids={company:"buyer-company",country:"buyer-country",contact:"buyer-contact",phone:"buyer-phone",email:"buyer-email",address:"buyer-address"};
    const grid=$("buyer-company")?.closest(".form-grid");
    grid?.querySelectorAll('[data-custom-buyer-label]').forEach(label=>label.remove());
    Object.values(ids).forEach((id)=>{const label=$(id)?.closest('label');if(label)label.hidden=true;});
    configuredBlockFields("customer",settings.customerQuoteFields).forEach((field)=>{
      if(!ids[field.fieldKey] && grid){
        const label=document.createElement('label');label.dataset.customBuyerLabel='true';label.hidden=!field.visible;
        const caption=document.createElement('span');caption.textContent=`${field.zh} / ${field.en}`;
        const input=document.createElement(field.fieldType==='textarea'?'textarea':'input');input.dataset.buyerCustom=field.fieldKey;input.value=currentQuote.buyer?.[field.fieldKey]??'';
        label.append(caption,input);grid.append(label);return;
      }
      const input=$(ids[field.fieldKey]); const label=input?.closest("label"); if(!label)return;
      label.hidden=!field.visible;
      const caption=label.querySelector("span"); if(caption)caption.textContent=`${field.zh} / ${field.en}${field.required?" *":""}`;
      if(grid)grid.appendChild(label);
    });
  }

  function applyDocumentBasicFields() {
    const grid=$("quote-number")?.closest(".form-grid");
    if(!grid)return;
    grid.querySelectorAll('[data-custom-basic-label]').forEach(label=>label.remove());
    const ids={quoteNumber:"quote-number",quoteDate:"quote-date",validUntil:"valid-until",pdfLanguage:"pdf-language"};
    Object.values(ids).forEach((id)=>{const label=$(id)?.closest('label');if(label)label.hidden=true;});
    configuredBlockFields("basic",[]).forEach(field=>{
      if(ids[field.fieldKey]){
        const input=$(ids[field.fieldKey]),label=input?.closest('label');
        if(label){label.hidden=false;const caption=label.querySelector('span');if(caption)caption.textContent=`${field.zh} / ${field.en}${field.required?' *':''}`;grid.appendChild(label);}
        return;
      }
      const label=document.createElement('label');label.dataset.customBasicLabel='true';
      const caption=document.createElement('span');caption.textContent=`${field.zh} / ${field.en}${field.required?' *':''}`;
      let input;
      if(['select','dictionary'].includes(field.fieldType)){
        input=document.createElement('select');(field.options||[]).filter(o=>o.visible!==false).sort((a,b)=>Number(a.sortOrder||0)-Number(b.sortOrder||0)).forEach(option=>{const el=document.createElement('option');el.value=option.value??'';el.textContent=option.labelZh||option.labelEn||option.value||'';input.appendChild(el);});
      }else if(field.fieldType==='textarea') input=document.createElement('textarea');
      else {input=document.createElement('input');input.type=field.fieldType==='date'?'date':field.fieldType==='checkbox'?'checkbox':field.fieldType==='number'||field.fieldType==='money'?'number':'text';}
      input.dataset.basicCustom=field.fieldKey;const value=currentQuote.basicFields?.[field.fieldKey];if(input.type==='checkbox')input.checked=!!value;else input.value=value??'';label.append(caption,input);grid.append(label);
    });
  }

  function bankValueText(field, mode = displayMode()) {
    if(field.labelEn==='Payment Terms' && currentQuote?.terms?.payment) return paymentLabel(currentQuote.terms.payment);
    const raw = String(field.value || "");
    // Translate known boilerplate only. Never rewrite bank identifiers or custom terms.
    const copy = {
      "Please make payment via SWIFT (T/T) to the following account.": ["Veuillez effectuer le paiement par SWIFT (T/T) sur le compte suivant.", "请通过 SWIFT（T/T）汇款至以下账户。"],
      "Business Account": ["Compte professionnel", "企业账户"],
      "For the payment of goods, please make a SWIFT(T/T) or CHATS(HK Local Payment) payment.": ["Pour le paiement des marchandises, veuillez effectuer un virement SWIFT (T/T) ou CHATS (paiement local à Hong Kong).", "支付货款时，请使用 SWIFT（T/T）或 CHATS（香港本地付款）汇款。"],
      "Please include [Buyer's Name, Invoice/Contract Number, and Product Name] in the memo or note section when making the payment. The deposit is non-refundable.": ["Veuillez indiquer [le nom de l’acheteur, le numéro de facture/contrat et le nom du produit] dans le motif du paiement. L’acompte n’est pas remboursable.", "汇款时请在附言中注明【买方名称、发票/合同编号及产品名称】。定金不予退还。"]
    };
    const en = raw.split(" / ")[0].trim();
    if (!Object.prototype.hasOwnProperty.call(copy, en)) return raw;
    const [fr, zh] = copy[en];
    if (mode === "zh-fr") return `${fr} / ${zh}`;
    if (mode === "fr") return fr;
    if (mode === "en") return en;
    if (mode === "zh") return zh;
    if (mode === "bilingual") return `${en} / ${zh}`;
    return raw;
  }

  function renderBankPreview() {
    normalizeBankFields();
    normalizePaymentQrFields();
    const fields = settings.bankFields.filter((field) => field.visible && field.value);
    const qrFields = settings.paymentQrFields.filter((field) => field.visible && field.value);
    if (!fields.length && !qrFields.length) return "";
    return `<section class="preview-panel bank-panel">
      <h3>${quoteSectionTitle("bank")}</h3>
      ${fields.length ? `<div class="bank-grid">
        ${fields.map((field) => `<p><b>${escapeHtml(labelText(field.labelEn, field.labelZh))}:</b> ${escapeHtml(bankValueText(field))}</p>`).join("")}
      </div>` : ""}
      ${qrFields.length ? `<div class="payment-qr-grid">${qrFields.map((field) => `<figure><img src="${field.value}" alt=""><figcaption>${labelText(field.labelEn, field.labelZh)}</figcaption></figure>`).join("")}</div>` : ""}
    </section>`;
  }

  function renderQuoteMetaPreview() {
    const rows = [];
    const values={quoteNumber:currentQuote.quoteNumber,quoteDate:currentQuote.quoteDate,validUntil:currentQuote.validUntil,...(currentQuote.basicFields||{})};
    configuredBlockFields("basic",[]).filter(field=>field.fieldKey!=='pdfLanguage').forEach(field=>{
      const value=values[field.fieldKey];
      if(value!==''&&value!=null&&value!==false)rows.push(`<p>${labelText(field.en,field.zh)}：${escapeHtml(value===true?'Yes':value)}</p>`);
    });
    return rows.length ? `<div class="preview-meta">${rows.join("")}</div>` : "";
  }

  function renderValidityRangePreview() {
    return "";
  }

  function validateQuoteLines() {
    if(currentQuote.currencyDisplay==="dual"&&(!currentQuote.secondaryCurrency||currentQuote.secondaryCurrency===currentQuote.currency||!(Number(currentQuote.exchangeRate?.rate)>0))){toast("双币种单据必须选择不同的第二币种，并填写大于0的明确汇率。");return false;}
    if(currentQuote.documentType==='packing') {
      const items=currentQuote.items.filter(i=>(i.kind||'product')==='product');
      if(!items.length){toast('装箱单至少需要一行商品');return false;}
      for(const item of items){const p={...(currentQuote.packing?.[item.id]||{}),...(item.values||{})};
        if(!['packages','netWeight','grossWeight','cbm'].every(k=>p[k]!=='' && p[k]!=null && Number.isFinite(Number(p[k])) && Number(p[k])>0) || !Number.isInteger(Number(p.packages)) || Number(p.grossWeight)<Number(p.netWeight)) {toast('请填写装箱件数、净重、毛重、体积；毛重不得小于净重，件数须为正整数。');return false;}
      }
      return true;
    }
    const requiredColumns = quoteLineColumns().filter((column) => column.required);
    for (let rowIndex = 0; rowIndex < (currentQuote.items || []).length; rowIndex += 1) {
      const item = currentQuote.items[rowIndex];
      item.values.itemType ||= ({product:"设备",freight:"海运费",trucking:"国内运输费",port:"港杂及报关费",insurance:"保险费",handling:"拆装费",custom:"其他费用"})[item.kind||"product"];
      const hsCode=String(item.values?.hsCode || "").trim();
      if (hsCode && !/^\d{8}$/.test(hsCode)) {
        toast(`第 ${rowIndex + 1} 行的海关编码必须是8位数字。`);
        return false;
      }
      const itemCurrency=item.values?.currency||currentQuote.currency;
      if(itemCurrency!==currentQuote.currency && !(Number(currentQuote.exchangeRate?.rate)>0 && [currentQuote.exchangeRate?.sourceCurrency,currentQuote.exchangeRate?.targetCurrency].includes(itemCurrency) && [currentQuote.exchangeRate?.sourceCurrency,currentQuote.exchangeRate?.targetCurrency].includes(currentQuote.currency))) { toast(`第 ${rowIndex+1} 行币种为 ${itemCurrency}，请填写与 ${currentQuote.currency} 之间的明确汇率。`); return false; }
      for (const column of requiredColumns) {
        if ((item.kind || "product") !== "product" && ["condition","hsCode"].includes(column.key)) continue;
        if (column.key === "amount") continue;
        if (column.key === "image") {
          if (!item.imageDataUrl) {
            toast(`第 ${rowIndex + 1} 行请上传图片。`);
            return false;
          }
          continue;
        }
        if (!String(item.values?.[column.key] ?? "").trim()) {
          toast(`第 ${rowIndex + 1} 行请填写：${column.labelZh || column.key}`);
          return false;
        }
      }
    }
    return true;
  }

  function refreshDocumentSigning() {
    const snapshot=currentQuote.companySnapshot ||= companyProfileData(settings);
    const sameCompany=data=>data&&((snapshot.companyNameEn&&data.companyNameEn===snapshot.companyNameEn)||(snapshot.companyNameZh&&data.companyNameZh===snapshot.companyNameZh));
    const source=sameCompany(settings)?settings:(settings.companyProfiles||[]).map(profile=>profile.data).find(sameCompany);
    if(!source)return;
    for(const key of ['agencySignatureDataUrl','agencySignatureRotation','agencyAuthorizer','agencyAuthorizerTitle','stampDataUrl'])snapshot[key]=source[key]??'';
  }

  function renderPreview() {
    // A saved document owns its company identity. Never substitute the company
    // currently selected in settings when reopening or exporting its history.
    currentQuote.companySnapshot ||= companyProfileData(settings);
    const liveSettings = settings;
    settings = {...settings, ...structuredClone(currentQuote.companySnapshot)};
    try { renderPreviewWithCompany(); }
    finally { settings = liveSettings; }
  }

  function renderPreviewWithCompany() {
    updateDocumentSwitchState();
    collectQuoteFromForm();
    const tpl = template();
    const visibleFields = tpl.fields.slice().sort((a, b) => a.sortOrder - b.sortOrder).filter((field) => field.visible);
    const visibleTermFields = configuredBlockFields('terms',tpl.termFields || defaultTermFields);
    const showProductPhotos = $("quote-show-product-images")?.checked !== false;
    currentQuote.showProductPhotos = showProductPhotos;
    const imageStatus = $("quote-image-output-status");
    if (imageStatus) imageStatus.textContent = showProductPhotos
      ? "已开启：图片会显示在页面预览和PDF中"
      : "已关闭：已上传图片仍会保留，但不会输出到预览和PDF";
    $("quote-preview-image-control")?.classList.toggle("is-off", !showProductPhotos);
    const bg = settings.backgroundDataUrl || defaultBg;
    const title = documentTypeTitle(currentQuote);
    const mode = displayMode();
    const companySub = localizedText("", settings.companyNameZh);
    const businessLine = localizedText(settings.businessLineEn, settings.businessLineZh, "<br>");
    $("quote-preview").className = `quote-preview quote-style-${currentQuote.quoteStyle || settings.quoteStyle || "classic"}${currentQuote.documentType==='contract'?' sales-contract-preview':''}`;
    $("quote-preview").innerHTML = `
      <section class="preview-banner">
        <img class="preview-banner-bg" src="${bg}" alt="">
        <div class="preview-company">${settings.logoDataUrl ? `<img src="${settings.logoDataUrl}">` : ""}<div><h2>${escapeHtml(mode === "zh" ? settings.companyNameZh : settings.companyNameEn)}</h2>${companySub && ["zh", "bilingual", "zh-es", "zh-fr"].includes(mode) ? `<p>${escapeHtml(companySub)}</p>` : ""}</div></div>
        ${renderCompanyContactPreview()}
      </section>
      <section class="preview-top">
        <div class="preview-title"><h2>${escapeHtml(title)}</h2><p>${businessLine.split("<br>").map(escapeHtml).join("<br>")}</p></div>
        ${renderQuoteMetaPreview()}
      </section>
      <section class="preview-panel"><h3>${quoteSectionTitle("customer")}</h3><div class="preview-fields">${customerPreviewFields(currentQuote.buyer)}</div></section>
      <section class="preview-panel"><h3>${quoteSectionTitle("items")}</h3><table><thead><tr>${renderQuotePreviewHead()}</tr></thead><tbody>${renderQuotePreviewRows()}</tbody></table>${currentQuote.items.some(item=>item.values?.unitPrice===""||item.values?.unitPrice==null)?`<div class="quote-incomplete-warning">报价未完整：存在待询价项目，可保存草稿，但不能生成正式单据。</div>`:""}${visibleQuoteField("totalAmount") ? `<div class="preview-total">${labelText("Total", "总金额")}：${escapeHtml(dualMoneyText(total(), currentQuote.currency))}</div>` : ""}</section>
      ${showProductPhotos && currentQuote.photoAppendix ? `<section class="preview-panel"><h3>${labelText("Product Photos", "产品图片")}</h3><div class="photo-grid">${currentQuote.items.filter(i => (i.kind || "product") === "product").flatMap(i => [i.imageDataUrl, ...(i.additionalImages || [])].filter(Boolean).map(src => `<article class="photo-card"><img src="${escapeHtml(src)}"><div>${escapeHtml(i.values.description || i.values.model || '')}</div></article>`)).join("")}</div></section>` : ""}
      ${visibleTermFields.length || settings.stampDataUrl || renderValidityRangePreview() ? `<section class="preview-panel terms-panel"><div class="terms-content"><h3>${quoteSectionTitle("terms")}</h3>${visibleTermFields.map((field) => `<p>${labelText(field.en, field.zh)}：${escapeHtml(displayTermValue(field))}</p>`).join("")}${renderValidityRangePreview()}</div>${settings.stampDataUrl ? `<div class="stamp-box"><img src="${settings.stampDataUrl}" alt="Company Stamp"><span>${labelText("Company Stamp", "公司公章")}</span></div>` : ""}</section>` : ""}
      ${renderBankPreview()}
      ${['contract','invoice'].includes(currentQuote.documentType)?renderSalesContractSignatures():''}
    `;
    if(currentQuote.documentType==='contract'){
      const contact=$('quote-preview').querySelector('.preview-contact-list');
      if(contact)contact.innerHTML=contact.innerHTML.replaceAll('Quotation Contact','Contract Contact').replaceAll('报价负责人','合同负责人');
    }
    renderDocumentLayout(visibleTermFields);
    applyDocumentWorkspacePreview();
    const designer=activeDocumentConfig()?.designer||(settings.documentDesignerTemplates||[]).find(item=>item.documentType===currentQuote.documentType&&item.active!==false);
    if(designer) window.DocumentDesigner?.apply?.($("quote-preview"),designer);
    const design=(currentQuote?.isFormal?currentQuote.templateSnapshot?.documentConfig:null)?.design||activeDocumentConfig()?.design||{};
    const preview=$("quote-preview");
    const tableColor=/^#[0-9a-f]{6}$/i.test(currentQuote.tableHeaderColor||'')?currentQuote.tableHeaderColor:'';
    preview.classList.toggle('custom-table-header',!!tableColor);preview.style.setProperty('--document-table-color',tableColor||'inherit');
    if($('document-table-color'))$('document-table-color').value=tableColor;
    preview.dataset.pageOrientation=design.orientation||'portrait';
    preview.classList.toggle('document-landscape',design.orientation==='landscape');
    if(design.backgroundDataUrl){
      const opacity=Math.max(0,Math.min(1,Number(design.backgroundOpacity??.12))),overlay=Math.max(0,Math.min(1,Number(design.overlay??.82)));
      preview.style.backgroundImage=`linear-gradient(rgba(255,255,255,${overlay}),rgba(255,255,255,${overlay})),url("${String(design.backgroundDataUrl).replaceAll('"','%22')}")`;
      preview.style.backgroundSize=design.backgroundMode==='stretch'?'100% 100%':design.backgroundMode||'cover';
      preview.style.backgroundRepeat='repeat-y';preview.style.backgroundPosition='top center';preview.style.setProperty('--document-background-opacity',String(opacity));
    }else{preview.style.backgroundImage='';preview.style.backgroundSize='';preview.style.backgroundRepeat='';preview.style.backgroundPosition='';}
  }

  function activeFreightTarget() {
    if (activeViewName !== "quote" || !currentQuote || !["quotation","invoice","contract"].includes(currentQuote.documentType)) return null;
    const item=(currentQuote.items||[]).find(row=>row.kind==="freight");
    return {documentLabel:documentTypeTitle(currentQuote),fieldLabel:"海运费 / Sea Freight",currentAmount:item?Number(item.values?.unitPrice||0):0,itemId:item?.id||""};
  }
  function applyFreightResult(amount,_result,target) {
    if (!currentQuote || activeViewName !== "quote") return;
    let item=(currentQuote.items||[]).find(row=>row.id===target?.itemId)||(currentQuote.items||[]).find(row=>row.kind==="freight");
    if(!item){item={id:uid("item"),kind:"freight",values:{itemType:"海运费",productType:"海运费",description:"Sea Freight / 海运费",qty:1,billingUnit:"项",currency:currentQuote.currency||settings.currency,remark:""},imageDataUrl:""};currentQuote.items.push(item);}
    item.values.unitPrice=Number(amount);item.values.qty=1;item.values.currency=currentQuote.currency||settings.currency;
    renderQuoteItems();renderPreview();scheduleDraftRecovery();
  }

  function renderCompanySignatureSettings() {
    const img=$('company-signature-preview');if(!img)return;
    img.src=settings.agencySignatureDataUrl||'';img.hidden=!settings.agencySignatureDataUrl;
    const rotation=Number(settings.agencySignatureRotation)||0;
    img.style.transform=`rotate(${rotation}deg)`;
    img.classList.toggle('is-quarter-turn',Math.abs(rotation)===90);
    $('company-signature-status').textContent=settings.agencySignatureDataUrl?'已载入当前公司的电子签名':'当前公司未上传电子签名';
  }
  async function changeCompanySignature(input,remove=false) {
    const original=structuredClone(settings);
    try {
      let data='';
      if(remove){if(!confirm('删除当前公司的电子签名？已导出的PDF不会改变，历史文件快照可能仍保留旧签名。'))return;}
      else {
        const file=input.files?.[0];if(!file)return;
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('请上传5MB以内的PNG、JPG或WebP签名图片');
        data=await fileToDataUrl(file);const image=new Image();image.src=data;await image.decode();
      }
      collectSettingsDraft();settings.agencySignatureDataUrl=data;storeActiveCompany();
      if(isAdmin())await api('/api/settings',{method:'PUT',body:JSON.stringify(settings)});
      save(keys.settings,settings);refreshDocumentSigning();renderSettings();renderPreview();toast(remove?'当前公司签名已删除':'当前公司签名已上传并保存');
    }catch(error){settings=original;renderSettings();toast('签名保存失败：'+error.message);}
    finally{if(input)input.value='';}
  }
  async function saveDrawnCompanySignature(data) {
    const original=structuredClone(settings);
    try {
      collectSettingsDraft();settings.agencySignatureDataUrl=data;settings.agencySignatureRotation=0;storeActiveCompany();
      if(isAdmin())await api('/api/settings',{method:'PUT',body:JSON.stringify(settings)});
      save(keys.settings,settings);refreshDocumentSigning();renderSettings();renderPreview();toast('手写电子签名已保存');
    } catch(error) {settings=original;renderSettings();toast('签名保存失败：'+error.message);}
  }
  function initSignaturePad() {
    const modal=$('signature-pad-modal'),canvas=$('signature-pad-canvas');if(!modal||!canvas)return;
    const context=canvas.getContext('2d');let drawing=false,last=null,hasInk=false;
    const clear=()=>{context.clearRect(0,0,canvas.width,canvas.height);context.lineWidth=7;context.lineCap='round';context.lineJoin='round';context.strokeStyle='#101820';hasInk=false;};
    const point=event=>{const rect=canvas.getBoundingClientRect();return {x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};};
    canvas.addEventListener('pointerdown',event=>{drawing=true;last=point(event);canvas.setPointerCapture(event.pointerId);});
    canvas.addEventListener('pointermove',event=>{if(!drawing)return;const next=point(event);context.beginPath();context.moveTo(last.x,last.y);context.lineTo(next.x,next.y);context.stroke();last=next;hasInk=true;});
    const stop=()=>{drawing=false;last=null;};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
    const close=()=>{modal.hidden=true;};
    $('draw-company-signature')?.addEventListener('click',()=>{clear();modal.hidden=false;});
    $('signature-pad-clear')?.addEventListener('click',clear);$('signature-pad-cancel')?.addEventListener('click',close);$('signature-pad-close')?.addEventListener('click',close);
    $('signature-pad-save')?.addEventListener('click',async()=>{if(!hasInk){toast('请先在画布上书写签名');return;}await saveDrawnCompanySignature(canvas.toDataURL('image/png'));close();});
    clear();
  }
  function renderDocumentSignature(type) {
    const e=escapeHtml,l=(en,zh)=>e(labelText(en,zh));
    const angle=[-90,0,90,180].includes(Number(settings.agencySignatureRotation))?Number(settings.agencySignatureRotation):0;
    const image=settings.agencySignatureDataUrl?`<img class="document-signature-image" src="${e(settings.agencySignatureDataUrl)}" style="transform:rotate(${angle}deg);width:${Math.abs(angle)===90?60:145}px;height:${Math.abs(angle)===90?145:60}px" alt="${l('Electronic Signature','电子签名')}">`:`<span class="document-signature-missing">${l('No electronic signature configured','本公司尚未设置电子签名')}</span>`;
    const seller=`<div class="document-seller-signature"><h3>${l('For and on behalf of the Seller','卖方公司授权签署')}</h3><p><b>${l('Company','公司全称')}:</b> ${e(localizedText(settings.companyNameEn,settings.companyNameZh))}</p><p><b>${l('Authorized Signatory','授权签字人')}:</b> ${e(settings.agencyAuthorizer||settings.contactPerson||'')}</p><p><b>${l('Title','职务')}:</b> ${e(localizedSlashValue(settings.agencyAuthorizerTitle||'',displayMode()))}</p><div class="document-sign-assets"><div>${image}</div>${settings.stampDataUrl?`<img class="document-company-seal" src="${e(settings.stampDataUrl)}" alt="${l('Company Seal','公司公章')}">`:''}</div><p>${l('Date','日期')}: ${e(currentQuote.quoteDate)}</p></div>`;
    const buyer=type==='contract'?`<div class="document-buyer-signature"><h3>${l('Buyer signature','买方签署')}</h3><p>${e(currentQuote.buyer.company||currentQuote.buyer.contact||'')}</p><p>${l('Authorized Signatory','授权签字人')}: ____________________</p><p>${l('Title','职务')}: ____________________</p><p>${l('Signature','签字')}: ____________________</p><p>${l('Date','日期')}: ____________________</p></div>`:'';
    return `<section class="document-signature-block ${type==='contract'?'document-dual-signatures':''}">${seller}${buyer}</section>`;
  }
  function renderDocumentLayout(termFields) {
    const host=$('quote-preview'),type=currentQuote.documentType||'quotation',e=escapeHtml,l=(en,zh)=>e(labelText(en,zh));
    const options=TradeDocumentLayouts.options(type,currentQuote.outputOptions?.[type]);
    const bankControl=activeDocumentConfig(type)?.blocks?.layout?.find(field=>field.fieldKey==='showBankControl');
    const bankToggle=$('document-show-bank')?.closest('label');if(bankToggle)bankToggle.hidden=bankControl?.visible===false||bankControl?.active===false;
    // Keep the original quotation banner, terms, seal and bank section intact.
    // Other document types retain their dedicated layouts.
    if(type==='quotation'){
      host.classList.add('september-quotation');
      $('document-show-bank').disabled=false;
      $('document-show-bank').checked=options.bank;
      $('document-show-signature').checked=options.signature;
      host.querySelectorAll('.bank-panel,.bank-info,.bank-preview').forEach(node=>node.hidden=!options.bank);
      // Quotation uses the same shared company signing module as the other
      // documents. Remove the legacy stamp-only placement to avoid duplicate
      // seals, then append the complete signature/seal block only when chosen.
      host.querySelectorAll('.stamp-box,.signature-section,.pi-company-signature,.sales-contract-signatures,.document-signature-block').forEach(node=>node.remove());
      if(options.signature)host.insertAdjacentHTML('beforeend',renderDocumentSignature(type));
      return;
    }
    $('document-show-bank').disabled=false;
    host.querySelectorAll('.stamp-box,.pi-company-signature,.sales-contract-signatures').forEach(node=>node.remove());
    const html=selector=>host.querySelector(selector)?.outerHTML||'';
    const block=(heading,content,cls='')=>`<section class="document-section ${cls}"><h3>${heading}</h3>${content}</section>`;
    const detail=(en,zh,value)=>`<p><b>${l(en,zh)}</b><span>${e(value||'—')}</span></p>`;
    const company=localizedText(settings.companyNameEn,settings.companyNameZh);
    const seller=`<strong>${e(company)}</strong><p>${e(localizedText(settings.companyAddressEn,settings.companyAddressZh))}</p><p>${e(settings.companyPhone||'')} ${e(settings.companyEmail||'')}</p>`;
    const buyer=customerPreviewFields(currentQuote.buyer);
    const d=currentQuote.shipmentDetails||{};
    const partyHeading=['commercial','packing'].includes(type)?l('Consignee','收货人'):l('Buyer','买方');
    const consignee=['commercial','packing'].includes(type)&&d.consignee?`<p class="preserve-lines">${e(d.consignee)}</p>`:buyer;
    const parties=`<div class="document-parties">${block(l(type==='packing'?'Shipper':'Seller',type==='packing'?'发货人':'卖方'),seller)}${block(partyHeading,consignee)}</div>${type==='commercial'&&d.consignee?block(l('Buyer','买方'),buyer):''}`;
    const shipment=block(l('Shipment details','货运资料'),`<div class="document-shipment-grid">${detail('Invoice reference','关联发票编号',d.invoiceReference)}${detail('Shipment date','出货日期',d.shipmentDate)}${detail('Origin Port','起运港',displayTermValue({fieldKey:'originPort'}))}${detail('Destination Port','目的港',displayTermValue({fieldKey:'port'}))}${detail('Trade Term','贸易条件',currentQuote.terms.shipping)}${detail('Named place','指定地点',d.namedPlace)}${detail('Transport mode','运输方式',d.transportMode)}${detail('Vessel / voyage','船名／航次',d.vessel)}${detail('B/L / AWB No.','提运单号',d.billNumber)}${detail('Container / seal No.','箱号／封号',d.containerNumber)}</div>`,'document-shipment');
    const termBlock=(fields,title,cls='')=>block(title,fields.filter(f=>displayTermValue(f)).map(f=>detail(f.en,f.zh,displayTermValue(f))).join(''),cls);
    const visibleTerms=termFields.filter(f=>displayTermValue(f));
    const items=html('table')?host.querySelector('table').closest('.preview-panel').outerHTML:'';
    const letterhead=`<header class="document-letterhead">${settings.logoDataUrl?`<img src="${e(settings.logoDataUrl)}" alt="Logo">`:''}<div><strong>${e(company)}</strong><p>${e(localizedText(settings.companyAddressEn,settings.companyAddressZh))}</p><p>${e(settings.companyPhone||'')} ${e(settings.companyEmail||'')}</p></div></header>`;
    const heading=`<section class="preview-top document-heading"><h1>${e(documentTypeTitle())}</h1>${renderQuoteMetaPreview()}</section>`;
    const parts={brandHeader:html('.preview-banner'),heading,letterhead,customer:html('.preview-panel'),parties,items,photos:html('.photo-grid')?host.querySelector('.photo-grid').closest('.preview-panel').outerHTML:'',
      offerTerms:html('.terms-panel'),bank:options.bank?renderBankPreview():'',signature:options.signature?renderDocumentSignature(type):'',shipment,
      proformaNotice:`<p class="proforma-notice">${l('Pro forma invoice — not a final commercial invoice.','形式发票——非最终商业发票。')}</p>`,
      paymentTerms:termBlock(visibleTerms.filter(f=>f.fieldKey==='payment'),l('Payment instructions','付款安排'),'document-payment'),
      deliveryTerms:termBlock(visibleTerms.filter(f=>f.fieldKey!=='payment'),l('Delivery and conditions','交付与交易条件')),
      contractItems:block('1. '+l('Goods and contract value','货物与合同金额'),items,'contract-goods'),
      contractClauses:visibleTerms.map((f,i)=>block(`${i+2}. ${l(f.en,f.zh)}`,`<p class="preserve-lines">${e(displayTermValue(f))}</p>`,'contract-clause')).join(''),
      packingTotals:'',shippingNotes:d.notes?block(l('Shipment remarks','出货备注'),`<p class="preserve-lines">${e(d.notes)}</p>`):''};
    host.classList.add('trade-layout','trade-layout-'+type);host.dataset.layout=type;
    host.innerHTML=TradeDocumentLayouts.render(type,parts);
    $('document-show-bank').disabled=type==='packing';$('document-show-bank').checked=options.bank;
    $('document-show-signature').checked=options.signature;
  }

  function renderSalesContractSignatures() {
    const signature=settings.agencySignatureDataUrl||'';
    const angle=[-90,0,90,180].includes(Number(settings.agencySignatureRotation))?Number(settings.agencySignatureRotation):0;
    const sign=signature?`<span class="commission-electronic-signature"><img src="${escapeHtml(signature)}" alt="Seller electronic signature" style="transform:translate(-50%,-50%) rotate(${angle}deg);width:${Math.abs(angle)===90?55:130}px;height:${Math.abs(angle)===90?130:55}px"></span>`:'____________________';
    const stamp=settings.stampDataUrl?`<span class="commission-stamp-overlay"><img class="commission-signature-stamp" src="${escapeHtml(settings.stampDataUrl)}" alt="Seller electronic company stamp"></span>`:'';
    if(currentQuote.documentType==='invoice')return `<section class="preview-panel pi-company-signature"><h3>${labelText('For and on behalf of the Seller','卖方公司授权签署')}</h3><p><b>${labelText('Company','公司全称')}:</b> ${localizedText(settings.companyNameEn,settings.companyNameZh)}</p><p><b>${labelText('Title','职务')}:</b> ${escapeHtml(settings.agencyAuthorizerTitle||labelText('General Manager, Africa','非洲区总经理'))}</p><p><b>${labelText('Authorized Signatory','授权签字人')}:</b> ${escapeHtml(settings.agencyAuthorizer||settings.contactPerson||'')}</p><div class="pi-signature-assets"><div><b>${labelText('Electronic Signature','电子签名')}</b>${sign}</div><div><b>${labelText('Company Seal','公司公章')}</b>${stamp}</div></div><p><b>${labelText('Date','签署日期')}:</b> ${escapeHtml(currentQuote.quoteDate)}</p></section>`;
    return `<section class="preview-panel sales-contract-signatures"><div class="commission-party-a"><h3>${labelText('Seller signature','卖方签署')}</h3><p>${escapeHtml(settings.companyNameEn)} / ${escapeHtml(settings.companyNameZh)}</p><p>${labelText('Responsible person','负责人')}: Ethan</p><p>${labelText('Title','职务')}: ${labelText('General Manager for Africa','非洲区总经理')}</p><p>${labelText('Signature','签字')}:</p>${sign}${stamp}<p>${labelText('Date','日期')}: ${escapeHtml(currentQuote.quoteDate)}</p></div><div><h3>${labelText('Buyer signature','买方签署')}</h3><p>${escapeHtml(currentQuote.buyer.company||'')}</p><p>${labelText('Responsible person','负责人')}: ${escapeHtml(currentQuote.buyer.contact||'')}</p><p>${labelText('Signature','签字')}: ____________________</p><p>${labelText('Date','日期')}: ____________________</p></div></section>`;
  }

  async function saveQuote(formal = false) {
    renderPreview();
    // Drafts are interruption-safe snapshots: incomplete fields and missing prices are allowed.
    // Only formal documents must pass the configured required-field validation.
    if (formal && !validateQuoteLines()) return;
    syncQuoteSequenceFromNumber(currentQuote.quoteNumber);
    const nowIso = new Date().toISOString();
    if (!currentQuote.createdAt) currentQuote.createdAt = nowIso;
    currentQuote.updatedAt = nowIso;
    currentQuote.savedAt = nowIso;
    currentQuote.templateSnapshot = structuredClone({
      productTemplate: quoteProductTemplate(),
      documentConfig: activeDocumentConfig(),
      customerFields: configuredBlockFields("customer", settings.customerQuoteFields),
      itemFields: quoteLineColumns(),
      termFields: configuredBlockFields("terms", template().termFields || defaultTermFields),
      currency: currentQuote.currency,
      secondaryCurrency: currentQuote.secondaryCurrency,
      currencyDisplay: currentQuote.currencyDisplay,
      exchangeRate: currentQuote.exchangeRate
    });
    if (!(formal && currentQuote.isFormal)) {
      const idx = quotes.findIndex((q) => q.id === currentQuote.id);
      if (idx >= 0) quotes[idx] = structuredClone(currentQuote);
      else quotes.unshift(structuredClone(currentQuote));
      save(keys.quotes, quotes);
    }
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
            transportCbm: freightSnapshot?.transportCbm || item.values.transportCbm || "",
            imageDataUrl: item.imageDataUrl || "",
            additionalImages: item.additionalImages || [],
            imagePath: item.imageDataUrl || ""
          },
          priceSnapshot: {
            quantity: qty,
            unitPrice,
            currency: item.values.currency || settings.currency,
            values: {...item.values,itemKind:item.kind||'product'}
          },
          machineAmount: qty * unitPrice,
          freightSnapshot,
          includeFreightInTotal: true
        };
      });
      const priorId=currentQuote.id;
      const saved=await api("/api/quotations", {
        method: "POST",
        body: JSON.stringify({
          id: currentQuote.id,
          seriesId: currentQuote.seriesId || currentQuote.id,
          version: currentQuote.version || 0,
          isFormal: !!currentQuote.isFormal,
          sourceQuoteId: formal ? priorId : (currentQuote.sourceQuoteId || ""),
          formal,
          customerId: currentQuote.customerId || null,
          quoteNumber: currentQuote.quoteNumber,
          status: currentQuote.status,
          documentType: currentQuote.documentType,
          pdfLanguage: currentQuote.pdfLanguage,
          currency: currentQuote.currency || settings.currency,
          currencyDisplay: currentQuote.currencyDisplay || "single",
          secondaryCurrency: currentQuote.secondaryCurrency || "",
          exchangeRate: currentQuote.exchangeRate || null,
          buyer: currentQuote.buyer,
          terms: currentQuote.terms,
          quoteDate: currentQuote.quoteDate,
          validUntil: currentQuote.validUntil,
          validityRangeText: currentQuote.validityRangeText,
          showProductPhotos: currentQuote.showProductPhotos !== false,
          documentExtras: Object.fromEntries(documentExtraFields.map(key=>[key,currentQuote[key]])),
          quoteStyle: currentQuote.quoteStyle,
          settingsSnapshot: {...settings, ...structuredClone(currentQuote.companySnapshot || companyProfileData(settings))},
          showFreightDetailInPdf: !!currentQuote.showFreightDetailInPdf,
          items: apiItems
        })
      });
      if (formal) {
        currentQuote.id=saved.id;currentQuote.seriesId=saved.seriesId;currentQuote.version=saved.version;currentQuote.isFormal=true;currentQuote.sourceQuoteId=priorId;currentQuote.status="Formal";currentQuote.formalizedAt=new Date().toISOString();
        quotes.unshift(structuredClone(currentQuote));save(keys.quotes,quotes);bindQuoteToForm();renderPreview();
      } else if (saved.id !== currentQuote.id) {
        currentQuote.id=saved.id;currentQuote.isFormal=false;currentQuote.version=0;currentQuote.status="草稿";currentQuote.sourceQuoteId=priorId;
        quotes.unshift(structuredClone(currentQuote));save(keys.quotes,quotes);
      }
    }
    toast(formal?`正式报价 V${currentQuote.version} 已生成，旧版本保持不变。`:"报价已保存到历史报价。");
    renderHistory();
  }

  function serverQuotationToLocal(data) {
    const q=data.quotation || {}, meta=q.settingsSnapshot?._quoteMeta || {};
    return {
      id:q.id, customerId:q.customer_id || null, quoteNumber:q.quote_number || "", status:q.status || "草稿",seriesId:q.series_id||q.id,version:Number(q.version||0),isFormal:!!q.is_formal,sourceQuoteId:q.source_quote_id||"",formalizedAt:q.formalized_at||null,
      ...meta.documentExtras,
      documentType:meta.documentType || "quotation", quoteStyle:meta.quoteStyle || q.settingsSnapshot?.quoteStyle || settings.quoteStyle || "classic",
      companySnapshot: Object.keys(companyProfileData(q.settingsSnapshot || {})).length ? companyProfileData(q.settingsSnapshot) : companyProfileData(settings),
      quoteDate:q.quote_date || today(), validUntil:q.valid_until || addDays(7), validityRangeText:meta.validityRangeText || "", showProductPhotos:meta.showProductPhotos !== false,
      pdfLanguage:meta.pdfLanguage || "bilingual", currency:meta.currency || "USD",
      currencyDisplay:meta.currencyDisplay || "single", secondaryCurrency:meta.secondaryCurrency || ((meta.currency || "USD") === "CNY" ? "USD" : "CNY"),
      exchangeRate:meta.exchangeRate || {sourceCurrency:meta.currency || "USD",targetCurrency:meta.secondaryCurrency || ((meta.currency || "USD") === "CNY" ? "USD" : "CNY"),rate:0,capturedAt:""},
      buyer:q.buyer || {}, terms:q.terms || {},
      templateName:q.settingsSnapshot?.templates?.[0]?.name || settings.templates[0]?.name || "",
      items:(data.items || []).map(item=>{
        const additionalImages=Array.isArray(item.productSnapshot?.additionalImages)?item.productSnapshot.additionalImages:[];
        const values=item.priceSnapshot?.values||{};
        const kind=values.itemKind||({"设备":"product","海运费":"freight","国内运输费":"trucking","港杂及报关费":"port","保险费":"insurance","拆装费":"handling","其他费用":"custom"})[values.itemType]||(item.freightSnapshot&&Object.keys(item.freightSnapshot).length?"freight":"product");
        return {id:item.id,kind,additionalImages,imageDataUrl:item.productSnapshot?.imagePath || item.productSnapshot?.imageDataUrl || "",values:{...values,productId:item.product_id || item.productSnapshot?.productId || "",description:values.description || item.productSnapshot?.productName || "",productType:values.productType || item.productSnapshot?.machineCategory || "",brand:values.brand || item.productSnapshot?.brand || "",model:values.model || item.productSnapshot?.model || "",qty:values.qty ?? item.priceSnapshot?.quantity ?? 1,unitPrice:values.unitPrice ?? item.priceSnapshot?.unitPrice ?? "",currency:values.currency || item.priceSnapshot?.currency || meta.currency || "USD"},freightSnapshot:item.freightSnapshot || null};
      }),
      createdAt:q.created_at, updatedAt:q.updated_at, savedAt:q.updated_at
    };
  }

  async function editQuote(id) {
    currentQuote = serverQuotationToLocal(await api(`/api/quotations/${id}`));
    switchView("quote");
    bindQuoteToForm();
    renderQuoteItems();
    closeProductPicker();
    renderPreview();
  }

  async function copyQuote(id) {
    const q = serverQuotationToLocal(await api(`/api/quotations/${id}`));
    const existing = await api('/api/quotations?includeInactive=1');
    (existing.quotations || []).forEach(row => syncQuoteSequenceFromNumber(row.quote_number));
    const nowIso = new Date().toISOString();
    q.id = uid("quote");
    q.quoteDate = today();
    q.quoteNumber = nextQuoteNumber(q.quoteDate, true);
    q.validUntil = addDays(7);
    q.validityRangeText = `${q.quoteDate} - ${q.validUntil}`;
    q.sourceQuoteId = id;
    q.seriesId = q.id;
    q.isFormal = false;
    q.version = 0;
    q.formalizedAt = null;
    q.status = "草稿";
    q.createdAt = nowIso;
    q.updatedAt = nowIso;
    q.savedAt = "";
    currentQuote = q;
    switchView("quote");
    bindQuoteToForm();
    renderQuoteItems();
    renderPreview();
  }

  async function deleteQuote(id, type = "standard", isFormal = false) {
    return historyAction([{id,type}], 'delete');
  }

  async function historyAction(entries, action) {
    const label = {delete:'删除并移入回收站',void:'作废',restore:'恢复'}[action];
    if (!entries.length || !confirm(`确定要${label}选中的 ${entries.length} 份报价吗？${action==='delete'?'可在回收站恢复。':''}`)) return;
    try {
      await api('/api/history/actions', {method:'POST',body:JSON.stringify({entries,action})});
      const ids=new Set(entries.filter(e=>e.type==='standard').map(e=>e.id));
      quotes=quotes.filter(q=>!ids.has(q.id));
      save(keys.quotes,quotes);
      if (currentQuote && ids.has(currentQuote.id)) {
        currentQuote=null;
      }
      toast(`${entries.length}份报价已${label}。`);
      await renderHistory();
    } catch (error) { toast(error.message); }
  }

  async function renderHistory() {
    const keyword = $("history-keyword").value.trim();
    const date = $("history-date").value;
    try {
      const normalParams=new URLSearchParams(); if(keyword)normalParams.set("q",keyword);if(date)normalParams.set("date",date);
      normalParams.set('includeInactive','1');
      const normalResult=await api(`/api/quotations?${normalParams}`);
      const normalRows=(normalResult.quotations||[]).map(q=>({type:"standard",sort:q.updated_at||q.quote_date,q}));
      const filter=$('history-status')?.value || 'active';
      const rows=normalRows.filter(({q})=>filter==='all'||(filter==='void'?q.status==='Void':filter==='deleted'?q.status==='Deleted':!['Void','Deleted'].includes(q.status))).sort((a,b)=>String(b.sort||"").localeCompare(String(a.sort||"")));
      $("unified-history-list").innerHTML=rows.map(({type,q})=>{
        const meta=q.settingsSnapshot?._quoteMeta||{}, machine=(q.items||[]).map(item=>`${item.productSnapshot?.machineCategory||""} ${item.productSnapshot?.brand||""} ${item.productSnapshot?.model||""} ${item.productSnapshot?.productName||""}`.trim()).filter(Boolean).join("；"),port=q.terms?.port||q.terms?.destinationPort||"",qty=(q.items||[]).reduce((sum,item)=>sum+Number(item.priceSnapshot?.quantity||item.priceSnapshot?.values?.qty||0),0);
        return `<tr><td><b>${escapeHtml(q.quote_number||"")}${q.version?` V${q.version}`:""}</b><small>${meta.documentType==="invoice"?"形式发票":"二手/常规设备报价"}</small></td><td>${escapeHtml(q.quote_date||"")}<small>${q.is_formal?"正式报价":escapeHtml(q.status||"草稿")}</small></td><td>${escapeHtml(q.buyer?.company||q.buyer?.contact||"-")}</td><td>${escapeHtml(q.buyer?.country||"-")}<small>${escapeHtml(port)}</small></td><td class="history-machine">${escapeHtml(machine||"未填写机器")}</td><td>${qty||q.items?.length||0} 台/项</td><td>${escapeHtml(meta.currency||q.items?.[0]?.priceSnapshot?.currency||"USD")} ${Number(q.total_amount||0).toLocaleString()}</td><td><div class="history-actions"><button onclick="window.quoteApp.editQuote('${q.id}')">查看</button><button onclick="window.quoteApp.copyQuote('${q.id}')">复制</button>${q.is_formal?`<button onclick="window.quoteApp.printStandardHistory('${q.id}')">PDF</button>`:""}<button class="danger" onclick="window.quoteApp.deleteQuote('${q.id}','standard',${q.is_formal?"true":"false"})">${q.is_formal?"作废":"删除"}</button></div></td></tr>`;
      }).join("")||`<tr><td colspan="8" class="empty">没有找到历史报价。</td></tr>`;
      $('history-select-all').checked=false;
      const selected=()=>Array.from(document.querySelectorAll('.history-row-select:checked')).map(el=>({id:el.dataset.id,type:el.dataset.type}));
      const updateSelection=()=>{const count=selected().length;$('history-selected-count').textContent=`已选${count}份`;$('history-bulk-delete').disabled=!count;$('history-select-all').checked=count>0&&count===rows.length;$('history-select-all').indeterminate=count>0&&count<rows.length;};
      Array.from($('unified-history-list').rows).forEach((tr,index)=>{
        const entry=rows[index];if(!entry)return;const {q,type}=entry;
        const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.className='history-row-select';checkbox.dataset.id=q.id;checkbox.dataset.type=type;checkbox.setAttribute('aria-label',`选择报价 ${q.quote_number||q.quoteNumber}`);checkbox.onchange=updateSelection;tr.cells[0].prepend(checkbox);
        tr.cells[1].querySelector('small').textContent=q.status==='Deleted'?'已删除（回收站）':q.status==='Void'?'已作废':(q.is_formal||q.isFormal)?'正式报价':'草稿';
        const actions=tr.querySelector('.history-actions');actions.replaceChildren();
        const add=(label,handler)=>{const b=document.createElement('button');b.textContent=label;b.onclick=handler;actions.append(b);};
        const copy=()=>copyQuote(q.id);
        add('查看',()=>editQuote(q.id));
        if(q.status==='Deleted'){add('恢复',()=>historyAction([{id:q.id,type}],'restore'));return;}
        if(q.status!=='Void')add('编辑',(q.is_formal||q.isFormal)?copy:()=>editQuote(q.id));
        add('复制',copy);
        if(q.status!=='Void')add('PDF',()=>printStandardHistory(q.id));
        if(q.status!=='Void')add('作废',()=>historyAction([{id:q.id,type}],'void'));
        add('删除',()=>historyAction([{id:q.id,type}],'delete'));
      });
      updateSelection();
      $('history-select-all').onchange=()=>{document.querySelectorAll('.history-row-select').forEach(el=>{el.checked=$('history-select-all').checked;});updateSelection();};
      $('history-bulk-delete').onclick=()=>historyAction(selected(),'delete');
    } catch (error) { $("unified-history-list").innerHTML = `<tr><td colspan="8" class="empty">${escapeHtml(error.message)}</td></tr>`; }
  }

  async function printStandardHistory(id) {
    await editQuote(id);
    exportPdf();
  }

  function renderVehiclePreview(data = {}) {
    window.__lastVehicleQuotePreview = data;
    const host = $("vq-preview"); if (!host) return;
    const buyer = data.buyer || {}, currency = data.currency || "USD";
    const title = data.documentType === "proforma" ? "PROFORMA INVOICE / 形式发票" : "QUOTATION / 报价单";
    const safeMoney = (value) => { const number = typeof value === "object" ? Number(value?.calculatedAmount ?? value?.amount ?? 0) : Number(value); return Number.isFinite(number) ? number : 0; };
    const rows = (data.items || []).map((item, index) => {
      const pictures=[item.vehicleType?.image_path,item.chassis?.image_path,item.superstructure?.image_path,...(item.attachments||[]).map(x=>x.image_path)].filter(Boolean);
      const extras=[...(item.options||[]).map(x=>x.name_en||x.name_zh),...(item.attachments||[]).map(x=>`${x.name_en||x.name_zh} ${x.brand||""} ${x.model||""}`)].filter(Boolean).join("; ");
      const vehicle=item.vehicleType?.name_en || item.vehicleType?.name_zh || "";
      const chassis=`${item.chassis?.brand || ""} ${item.chassis?.model || ""} ${item.chassis?.drive_type || ""}`.trim();
      const body=`${item.superstructure?.brand || ""} ${item.superstructure?.model || ""}`.trim();
      const specs=Object.values(item.specs || {}).filter(Boolean).join(" / ");
      return `<tr class="${pictures.length?"preview-row-with-image":""}"><td>${index + 1}</td><td class="vehicle-preview-images">${pictures.slice(0,2).map(path=>`<img src="${path}" alt="">`).join("")}</td><td class="vehicle-configuration"><p><b>Vehicle / 车型：</b>${escapeHtml(vehicle)}</p><p><b>Chassis / 底盘：</b>${escapeHtml(chassis)}</p><p><b>Body / 上装：</b>${escapeHtml(body)}</p>${extras?`<p><b>Options / 选装：</b>${escapeHtml(extras)}</p>`:""}${specs?`<p><b>Specifications / 规格：</b>${escapeHtml(specs)}</p>`:""}</td><td>${Number(item.quantity || 0)}</td><td>${escapeHtml(currency)} ${safeMoney(item.unitPrice).toLocaleString()}</td><td>${escapeHtml(currency)} ${safeMoney(item.lineTotal).toLocaleString()}</td></tr>`;
    }).join("");
    const bg = settings.backgroundDataUrl || defaultBg;
    host.className = `quote-preview quote-style-${settings.quoteStyle || "classic"} vehicle-document-preview`;
    host.innerHTML = `<section class="preview-banner"><img class="preview-banner-bg" src="${bg}" alt=""><div class="preview-company">${settings.logoDataUrl?`<img src="${settings.logoDataUrl}">`:""}<div><h2>${escapeHtml(settings.companyNameEn)}</h2><p>${escapeHtml(settings.companyNameZh)}</p></div></div>${renderCompanyContactPreview()}</section><section class="preview-top"><div class="preview-title"><h2>${title}</h2><p>${escapeHtml(settings.businessLineEn || "")}</p></div><div class="preview-meta"><p>Date / 日期：${escapeHtml(data.quoteDate || "")}</p><p>Valid Until / 有效期：${escapeHtml(data.validUntil || "")}</p></div></section><section class="preview-panel customer-panel"><h3>${quoteSectionTitle("customer")}</h3><div class="preview-fields">${customerPreviewFields(buyer)}<p>Destination Port / 目的港：${escapeHtml(buyer.destinationPort || "")}</p></div></section><section class="preview-panel vehicle-details-panel"><h3>${quoteSectionTitle("items")}</h3><table><thead><tr><th>#</th><th>Picture / 图片</th><th>Configuration / 车辆配置</th><th>Qty / 数量</th><th>Unit Price / 单价</th><th>Amount / 金额</th></tr></thead><tbody>${rows||'<tr><td colspan="6">请添加车辆配置</td></tr>'}</tbody></table><div class="preview-total">TOTAL / 总金额：${escapeHtml(currency)} ${safeMoney(data.finalTotal).toLocaleString()}</div></section><section class="preview-panel terms-panel"><div class="terms-content"><h3>${quoteSectionTitle("terms")}</h3><p>${escapeHtml(data.terms?.text || "")}</p><p>Freight / 运费：${escapeHtml(currency)} ${safeMoney(data.fees?.freight).toLocaleString()}</p><p>Tax / 税费：${escapeHtml(currency)} ${safeMoney(data.fees?.tax).toLocaleString()}</p></div>${settings.stampDataUrl?`<div class="stamp-box"><img src="${settings.stampDataUrl}"><span>Company Stamp / 公司公章</span></div>`:""}</section>${renderBankPreview()}`;
  }

  async function printVehicleQuote() {
    renderVehiclePreview(window.__lastVehicleQuotePreview || {});
    document.body.classList.add("printing-vehicle-quote");
    try {
      await waitForPrintableImages($("vq-preview"));
      if (window.quotationDesktop?.exportCurrentPdf) {
        const data = window.__lastVehicleQuotePreview || {};
        const fileName = `${data.quoteDate || new Date().toISOString().slice(0,10)} ${data.quoteNumber || "新车报价"}.pdf`;
        const filePath = await window.quotationDesktop.exportCurrentPdf(fileName);
        if (filePath) toast(`PDF 已导出：${filePath}`);
      } else window.print();
    } finally {
      setTimeout(() => document.body.classList.remove("printing-vehicle-quote"), 500);
    }
  }

  function recognizeCustomerText() {
    const raw=$("customer-paste-text")?.value.trim();
    if(!raw)return toast("请先粘贴客户信息。");
    const result=window.CustomerTextParser.parse(raw);
    const fields={"buyer-company":result.company,"buyer-contact":result.contact,"buyer-phone":result.phone,"buyer-email":result.email,"buyer-country":result.country,"buyer-address":result.address};
    let count=0;Object.entries(fields).forEach(([id,value])=>{if(value&&$(id)){ $(id).value=value;count+=1; }});
    if($("customer-recognize-result"))$("customer-recognize-result").textContent=count?`已识别并填入 ${count} 项，请检查后保存。`:`没有识别到明确字段，建议按“Company: ...”格式粘贴。`;
    collectQuoteFromForm();renderPreview();
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));
    document.querySelectorAll("[data-view-target]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.viewTarget)));
    $("recognize-customer-text-btn")?.addEventListener("click",recognizeCustomerText);
    $("quote-customer")?.addEventListener("change", async () => {
      const id = $("quote-customer").value;
      currentQuote.customerId = id || null;
      if (!id) return;
      try {
        const customer = await api(`/api/customers/${id}`);
        const values = {
          "buyer-country": customer.country,
          "buyer-company": customer.company || customer.company_name,
          "buyer-contact": customer.name || customer.contact,
          "buyer-phone": customer.phone,
          "buyer-email": customer.email,
          "buyer-address": customer.address
        };
        Object.entries(values).forEach(([field, value]) => { if ($(field)) $(field).value = value || ""; });
        collectQuoteFromForm();
        renderPreview();
      } catch (error) { toast(error.message); }
    });
    $("global-back-btn").addEventListener("click", goBackInsideApp);

    $("home-contact-btn")?.addEventListener("click", showContactInformation);
    $("sidebar-contact-btn")?.addEventListener("click", showContactInformation);
    document.querySelectorAll("[data-home-settings]").forEach(button=>button.addEventListener("click",()=>openSettingsSection(button.dataset.homeSettings)));
    $("home-recent-documents")?.addEventListener("click",event=>{const button=event.target.closest("[data-home-quote]");if(button)editQuote(button.dataset.homeQuote);});
    $('overview-records-body')?.addEventListener('click',event=>{const button=event.target.closest('[data-home-quote]');if(button)editQuote(button.dataset.homeQuote);});
    ['overview-search','overview-type','overview-from','overview-to'].forEach(id=>$(id)?.addEventListener(id==='overview-search'?'input':'change',renderOverviewRecords));
    $('overview-progress-counts')?.addEventListener('click',event=>{const button=event.target.closest('[data-overview-type]');if(button){$('overview-type').value=button.dataset.overviewType;renderOverviewRecords();$('overview-records-body').scrollIntoView({behavior:'smooth',block:'center'});}});
    document.querySelectorAll('[data-overview-create]').forEach(button=>button.addEventListener('click',()=>{switchView('create');document.querySelector('[data-create-document="'+button.dataset.overviewCreate+'"]')?.click();}));
    $("sidebar-lock-btn")?.addEventListener("click", () => {
      if (settings.applicationLock?.enabled) return window.AppLock?.lock();
      openSettingsSection("data");
      toast("请先在管理后台开启应用锁并设置 PIN。");
    });
    if ($("sidebar-lock-btn")) {
      const shortcut=settings.applicationLock?.shortcut||"Ctrl+Shift+L";
      $("sidebar-lock-btn").title=`快捷锁定 ${shortcut}`;
      $("sidebar-lock-btn").querySelector("span").textContent="应用锁";
    }
    document.addEventListener("keydown", (event) => {
      const shortcut=settings.applicationLock?.shortcut||"Ctrl+Shift+L";
      const parts=shortcut.toLowerCase().split("+").map(part=>part.trim()).filter(Boolean);
      const key=parts.find(part=>!["ctrl","alt","shift","meta"].includes(part));
      const pressed=!!key
        && event.ctrlKey===parts.includes("ctrl")
        && event.altKey===parts.includes("alt")
        && event.shiftKey===parts.includes("shift")
        && event.metaKey===parts.includes("meta")
        && event.key.toLowerCase()===key;
      if(!pressed)return;
      event.preventDefault();
      if(settings.applicationLock?.enabled)window.AppLock?.lock();else{openSettingsSection("data");toast("请先开启应用锁。")}
    });
    $("close-contact-modal-btn")?.addEventListener("click", () => { $("contact-modal").hidden = true; });
    $("contact-modal")?.addEventListener("click", (event) => { if (event.target === $("contact-modal")) $("contact-modal").hidden = true; });

    document.querySelectorAll(".settings-tab").forEach((button) => {
      button.addEventListener("click", () => showSettingsSection(button.dataset.settingsSection));
    });
    $("template-select")?.addEventListener("change", () => fillTemplateForm());
    $("category-config-select")?.addEventListener("change", () => fillTemplateForm());
    $("category-condition-select")?.addEventListener("change", () => fillTemplateForm());
    $("category-field-library")?.addEventListener("click", (event) => {
      const button=event.target.closest("[data-category-field]"); if(!button)return;
      const fields=categoryFieldConfig(), index=fields.findIndex(f=>f.fieldKey===button.dataset.categoryField);
      if(index>=0) fields.splice(index,1);
      else {
        const source=[...defaultTemplates.flatMap(t=>t.fields||[]),...settings.templates.flatMap(t=>t.fields||[])].find(f=>f.fieldKey===button.dataset.categoryField);
        if(source) fields.push({...normalizeField(source),sortOrder:(fields.length+1)*10});
      }
      resequenceFields(fields); renderFieldList(); renderCategoryFieldLibrary();
    });
    $("save-template-btn")?.addEventListener("click", saveTemplate);
    $("delete-template-btn")?.addEventListener("click", deleteTemplate);
    $("add-category-btn")?.addEventListener("click", () => openCategoryModal(-1));
    $("quick-add-product-category")?.addEventListener("click",()=>{quickCategoryForProduct=true;openCategoryModal(-1);});
    $("close-category-modal-btn")?.addEventListener("click", closeCategoryModal);
    $("save-category-btn")?.addEventListener("click", saveCategoryFromModal);
    $("category-list")?.addEventListener("click", handleCategoryListClick);
    $("category-list")?.addEventListener("dragstart", handleCategoryDragStart);
    $("category-list")?.addEventListener("dragover", (e) => e.preventDefault());
    $("category-list")?.addEventListener("drop", handleCategoryDrop);
    $("add-field-btn")?.addEventListener("click", () => openFieldModal(-1));
    $("add-term-field-btn")?.addEventListener("click", () => openFieldModal(-1, "terms"));
    $("close-field-modal-btn")?.addEventListener("click", closeFieldModal);
    $("save-field-btn")?.addEventListener("click", saveFieldFromModal);
    $("template-field-list")?.addEventListener("click", handleFieldListClick);
    $("template-field-list")?.addEventListener("dragstart", handleFieldDragStart);
    $("template-field-list")?.addEventListener("dragover", (e) => e.preventDefault());
    $("template-field-list")?.addEventListener("drop", handleFieldDrop);
    $("template-term-field-list")?.addEventListener("click", handleFieldListClick);
    $("template-term-field-list")?.addEventListener("dragstart", handleFieldDragStart);
    $("template-term-field-list")?.addEventListener("dragover", (e) => e.preventDefault());
    $("template-term-field-list")?.addEventListener("drop", handleFieldDrop);
    $("save-settings-btn")?.addEventListener("click", saveSettings);
    $("backup-db-btn").addEventListener("click", backupDatabase);
    $("restore-db-btn").addEventListener("click", restoreDatabase);
    $("export-data-btn")?.addEventListener("click", exportAllData);
    $("import-data-btn")?.addEventListener("click", importData);
    $("open-data-dir-btn").addEventListener("click", openDataFolder);
    $("refresh-admin-overview-btn")?.addEventListener("click", renderAdminOverview);
    $("logo-input").addEventListener("change", e => updateSettingsAsset(e.target, "logoDataUrl", "Logo uploaded. / Logo 已上传。"));
    $("background-input").addEventListener("change", e => updateSettingsAsset(e.target, "backgroundDataUrl", "Background uploaded. / 背景图已上传。"));
    $("stamp-input").addEventListener("change", e => updateSettingsAsset(e.target, "stampDataUrl", "Electronic seal uploaded. / 电子公章已上传。"));
    $('company-signature-input').addEventListener('change',event=>changeCompanySignature(event.target));
    $('remove-company-signature').addEventListener('click',()=>changeCompanySignature(null,true));
    $('company-signature-rotation').addEventListener('change',()=>{settings.agencySignatureRotation=Number($('company-signature-rotation').value)||0;renderCompanySignatureSettings();});
    $("remove-logo-btn").addEventListener("click", () => clearSettingsAsset("logoDataUrl", "Logo removed. / Logo 已删除。"));
    $("reset-background-btn").addEventListener("click", () => clearSettingsAsset("backgroundDataUrl", "Default background restored. / 已恢复默认背景。"));
    $("remove-stamp-btn").addEventListener("click", () => clearSettingsAsset("stampDataUrl", "Electronic seal removed. / 电子公章已删除。"));
    $("product-image").addEventListener("change", async e => { const data = await normalizeImage(e.target.files[0]); $("product-image-preview").src = data; $("product-image-preview").dataset.image = data; });
    $("product-template").addEventListener("change", () => renderProductDynamicFields());
    $("product-category")?.addEventListener("change", () => renderProductDynamicFields());
    $("product-smart-analyze")?.addEventListener("click",analyzeSmartProductText);
    $("product-smart-apply")?.addEventListener("click",applySmartProductCandidate);
    $("add-product-transport-plan")?.addEventListener("click",()=>{const plans=collectProductTransportPlans();plans.push({name:"",mode:"Bulk Cargo",dataStatus:"reference"});renderProductTransportPlans(plans);});
    $("product-transport-plan-list")?.addEventListener("click",event=>{const button=event.target.closest("[data-remove-plan]");if(!button)return;const row=button.closest(".transport-plan-row"),plans=collectProductTransportPlans().filter((_,index)=>index!==Number(row.dataset.planIndex));renderProductTransportPlans(plans);});
    $("product-model-reference")?.addEventListener("change",()=>{const source=products.find(p=>p.id===$("product-model-reference").value);if(!source)return;[["product-transport-length",source.transportLength],["product-transport-width",source.transportWidth],["product-transport-height",source.transportHeight],["product-transport-cbm",source.transportCbm],["product-weight",source.weight],["product-transport-method",source.transportMethod],["product-transport-status",source.transportDataStatus]].forEach(([id,value])=>{if($(id)&&value!==undefined&&value!==null)$(id).value=value;});renderProductTransportPlans(source.transportPlans||[]);toast("已引用通用车型运输数据，可按实际库存设备修改。");});
    $("save-product-btn").addEventListener("click", saveProduct);
    $("clear-product-btn").addEventListener("click", clearProductForm);
    $("price-import-file").addEventListener("change", async e => loadPriceImportFile(e.target.files[0]));
    $("import-price-btn").addEventListener("click", importPriceList);
    $("clear-import-text-btn").addEventListener("click", () => { $("price-import-text").value = ""; $("price-import-result").textContent = ""; });
    $("import-machinery-reference-btn")?.addEventListener("click", () => importMachineryReferenceProducts("machinery-reference-result"));
    $("export-product-catalog-pdf-btn")?.addEventListener("click", exportProductCatalogPdf);
    $("import-machinery-reference-tab-btn")?.addEventListener("click", () => importMachineryReferenceProducts("machinery-reference-tab-result"));
    $("export-product-catalog-pdf-tab-btn")?.addEventListener("click", exportProductCatalogPdf);
    $("product-search").addEventListener("input", renderProducts);
    $('library-template-filter')?.addEventListener('change',renderProducts);
    $('library-delete-selected')?.addEventListener('click',deleteSelectedLibraryProducts);
    $('product-list')?.addEventListener('change',event=>{if(event.target.id==='library-select-all')document.querySelectorAll('[data-library-select]').forEach(input=>input.checked=event.target.checked);updateLibrarySelection();});
    $('library-new-product')?.addEventListener('click',()=>{clearProductForm();$('product-edit-panel').hidden=false;$('product-edit-panel').scrollIntoView({behavior:'smooth',block:'start'});});
    $('library-close-editor')?.addEventListener('click',()=>{$('product-edit-panel').hidden=true;});
    $('library-configure')?.addEventListener('click',()=>openSettingsSection('product-config'));
    $('library-import')?.addEventListener('click',()=>{$('price-import-text').closest('.panel').scrollIntoView({behavior:'smooth',block:'start'});$('price-import-text').focus();});
    $('library-catalog')?.addEventListener('click',exportProductCatalogPdf);
    $("product-category-filter")?.addEventListener("change", renderProducts);
    $("product-condition-filter")?.addEventListener("change", renderProducts);
    $("product-list")?.addEventListener("click", event=>{
      const page=event.target.closest('[data-library-page]');if(page&&!page.disabled){libraryPage=Number(page.dataset.libraryPage);renderProducts();return;}
      const detail=event.target.closest('[data-library-detail]'),edit=event.target.closest('[data-library-edit]'),use=event.target.closest('[data-library-use]');
      if(detail)return showProductDetails(detail.dataset.libraryDetail);
      if(edit)return editProduct(edit.dataset.libraryEdit);
      if(use)return useLibraryProduct(use.dataset.libraryUse);
      const button=event.target.closest("[data-save-product-price]");
      if(button) saveQuickProductPrice(button.dataset.saveProductPrice);
    });
    $("open-product-picker-btn").addEventListener("click", openProductPicker);
    $("close-product-picker-btn").addEventListener("click", closeProductPicker);
    $("product-picker-search").addEventListener("input", renderProductPicker);
    $("product-picker-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-pick-product]");
      if (button) addProductFromLibrary(button.dataset.pickProduct);
    });
    $("add-quote-item-btn").addEventListener("click", addQuoteItemByType);
    $("quote-style-select").addEventListener("change", renderPreview);
    $("pdf-language").addEventListener("change", renderPreview);
    $("buyer-country").addEventListener("change", applyBuyerCountryDialCode);
    $("buyer-country").addEventListener("blur", applyBuyerCountryDialCode);
    $("buyer-phone").addEventListener("paste", pastePlainTextIntoInput);
    $("quote-template").addEventListener("change", () => { collectQuoteFromForm(); applyDocumentBasicFields(); applyCustomerQuoteFieldLabels(); renderQuoteTerms(); renderQuoteItems(); renderPreview(); });
    ["quote-currency","quote-currency-display","quote-secondary-currency"].forEach(id=>$(id)?.addEventListener("change",()=>{syncDualCurrencyControls();collectQuoteFromForm();renderQuoteItems();renderPreview();}));
    $("quote-fx-rate")?.addEventListener("input",()=>{collectQuoteFromForm();renderQuoteItems();renderPreview();});
    $("quote-show-product-images")?.addEventListener("change", renderPreview);
    $("quote-items").addEventListener("input", (event) => {
      const row=event.target.closest(".quote-line");
      if(row && event.target.dataset.qfield && event.target.dataset.qfield!=="hsCode"){
        const hsInput=row.querySelector('[data-qfield="hsCode"]');
        if(hsInput && !hsInput.value.trim())hsInput.value=suggestedHsCode(...[...row.querySelectorAll('[data-qfield="productType"],[data-qfield="description"],[data-qfield="brand"],[data-qfield="model"]')].map(input=>input.value));
      }
      updateQuoteLineAmounts(); renderPreview();
    });
    $("quote-items").addEventListener("change", async e => {
      if(e.target.matches(".quote-item-type")){
        const row=e.target.closest(".quote-line"),kind=e.target.selectedOptions[0]?.dataset.kind||"product";
        if(row){collectQuoteFromForm();const item=currentQuote.items.find(record=>record.id===row.dataset.id);if(item){const oldType=item.values.itemType;item.kind=kind;item.values.itemType=e.target.value;item.values.itemKind=kind;item.values.itemTypeLabelZh=e.target.selectedOptions[0]?.dataset.labelZh||e.target.value;item.values.itemTypeLabelEn=e.target.selectedOptions[0]?.dataset.labelEn||e.target.value;if(kind!=='product'){if(!item.values.description||/^(used|二手|Used \/ 二手|设备|海运费|国内运输费|港杂及报关费|保险费|拆装费|其他费用)$/i.test(item.values.description.trim()))item.values.description=e.target.value;item.values.condition='';item.values.hsCode='';item.values.brand='';item.values.model='';item.values.year='';item.values.hours='';}}renderQuoteItems();renderPreview();return;}
      }
      if (e.target.matches(".quote-line-image-input")) {
        if (!e.target.files?.[0]) return;
        const img = await normalizeImage(e.target.files[0]);
        const row = e.target.closest(".quote-line");
        if (row) {
          row.dataset.image = img;
          scheduleDraftRecovery();
          const preview = row.querySelector(".line-image-box img");
          if (preview) {
            preview.src = img;
            preview.hidden = false;
          }
          const actionPreview = row.querySelector(".quote-action-image-preview");
          if (actionPreview) {
            const actionImage = actionPreview.querySelector("img");
            if (actionImage) actionImage.src = img;
            actionPreview.hidden = false;
          }
          const outputSwitch = $("quote-show-product-images");
          if (outputSwitch) outputSwitch.checked = true;
          row.classList.add("has-product-image");
        }
      }
      if (e.target.matches(".quote-image-input")) {
        const img = await normalizeImage(e.target.files[0]);
        const prev = e.target.closest(".quote-item").querySelector("[data-image]");
        if (prev) { prev.src = img; prev.dataset.image = img; }
      }
      updateQuoteLineAmounts();
      if (e.target.matches(".quote-condition-select")) {
        const row=e.target.closest(".quote-line"),details=row?.querySelector(".new-detail-fields"),engine=row?.querySelector('[data-qfield="engine"]');
        if(details)details.hidden=!isNewCondition(e.target.value);
        if(engine)engine.hidden=e.target.value!=="new-truck";
      }
      renderPreview();
    });
    $("quote-items").addEventListener("click", e => {
      if (e.target.matches(".add-hs-code-btn")) {
        openHsCodeModal(e.target.closest(".hs-code-input")?.querySelector('[data-qfield="hsCode"]'));
        return;
      }
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
          const actionPreview = row.querySelector(".quote-action-image-preview");
          if (actionPreview) {
            const actionImage = actionPreview.querySelector("img");
            if (actionImage) actionImage.src = "";
            actionPreview.hidden = true;
          }
          row.classList.remove("has-product-image");
        }
        renderPreview();
      }
    });
    $("preview-quote-btn").addEventListener("click", renderPreview);
    let splitPreviewFrame = 0;
    document.querySelector('.quote-input-pane')?.addEventListener('input', event => {
      if (!event.target.closest('#quote-common-panel, #quote-standard-terms-panel')) return;
      cancelAnimationFrame(splitPreviewFrame);
      splitPreviewFrame = requestAnimationFrame(() => { if (currentQuote) renderPreview(); });
    });
    $("close-hs-code-modal-btn")?.addEventListener("click", closeHsCodeModal);
    $("cancel-hs-code-btn")?.addEventListener("click", closeHsCodeModal);
    $("save-hs-code-btn")?.addEventListener("click", saveCustomHsCode);
    $("quote-terms").addEventListener("change", (event) => {
      if (event.target.matches("[data-port-picker]")) {
        const target = event.target.closest("label")?.querySelector(`[data-termfield="${event.target.dataset.portPicker}"]`);
        if (target && event.target.value) target.value = event.target.value;
      }
      renderPreview();
    });
    $("save-quote-btn").addEventListener("click",()=>saveQuote(false));
    $("formalize-standard-quote-btn")?.addEventListener("click",()=>saveQuote(true));
    $("export-pdf-btn").addEventListener("click", exportPdf);
    $("new-quote-btn").addEventListener("click", () => {
      if (currentQuote?.quoteNumber) syncQuoteSequenceFromNumber(currentQuote.quoteNumber);
      newQuote(true, "quotation");
    });
    $("preview-invitation-btn").addEventListener("click", renderInvitationPreview);
    $("save-invitation-btn").addEventListener("click", saveInvitation);
    $("export-invitation-pdf-btn").addEventListener("click", exportInvitationPdf);
    $("new-invitation-btn").addEventListener("click", newInvitation);
    $("agency-preview-btn")?.addEventListener("click", renderAgentAuthorizationPreview);
    $("agency-save-btn")?.addEventListener("click", () => saveAgentAuthorization().catch((error) => toast(error.message)));
    $("agency-public-pdf-btn")?.addEventListener("click", () => exportAgentAuthorizationPdf(false).catch((error) => toast(error.message)));
    $("agency-private-pdf-btn")?.addEventListener("click", () => exportAgentAuthorizationPdf(true).catch((error) => toast(error.message)));
    $("agency-new-btn")?.addEventListener("click", newAgentAuthorization);
    $('agency-document-type')?.addEventListener('change',changeAgencyDocumentType);
    $('agency-use-template')?.addEventListener('click',useAgencyDocumentTemplate);
    $('agency-save-template')?.addEventListener('click',()=>saveAgencyDocumentTemplate().catch(e=>toast(e.message)));
    $('agency-export-document')?.addEventListener('click',()=>exportAgentAuthorizationPdf(true).catch(e=>toast(e.message)));
    Object.keys(agencyDocumentFields).forEach(id=>$(id)?.addEventListener('input',renderAgentAuthorizationPreview));
    $('agency-manual-completion')?.addEventListener('change',renderAgentAuthorizationPreview);
    $("agency-history-list")?.addEventListener("click", (event) => handleAgentAuthorizationHistory(event).catch((error) => toast(error.message)));
    $("agency-product-options")?.addEventListener("change", renderAgentAuthorizationPreview);
    $("agency-select-all-products")?.addEventListener("click",()=>{document.querySelectorAll("#agency-product-options input").forEach(input=>input.checked=true);renderAgentAuthorizationPreview();});
    $("agency-clear-products")?.addEventListener("click",()=>{document.querySelectorAll("#agency-product-options input").forEach(input=>input.checked=false);renderAgentAuthorizationPreview();});
    ["agency-number","agency-date","agency-valid-until","agency-company","agency-authorizer","agency-authorizer-title","agency-country","agency-agent-name","agency-id-number","agency-phone","agency-email","agency-address","agency-office-address","agency-show-commission","agency-commission-min","agency-commission-max","agency-markup","agency-settlement-days","agency-payment-methods","agency-commission-terms","agency-extra-terms"].forEach((id) => {
      $(id)?.addEventListener("input", renderAgentAuthorizationPreview);
      $(id)?.addEventListener("change", renderAgentAuthorizationPreview);
    });
    $("agency-language")?.addEventListener("change",applyAgencyLanguageDefaults);
    $("invitation-country").addEventListener("change", () => {
      syncInvitationEmbassyFromCountry();
      renderInvitationPreview();
    });
    $("invitation-country").addEventListener("blur", () => {
      syncInvitationEmbassyFromCountry();
      renderInvitationPreview();
    });
    ["invitation-language", "invitation-style", "invitation-date", "invitation-embassy", "invitation-name", "invitation-company", "invitation-country", "invitation-gender", "invitation-birth-date", "invitation-passport", "invitation-arrival", "invitation-departure", "invitation-visit-place", "invitation-visa-type", "invitation-relationship", "invitation-expense-source", "invitation-inviter", "invitation-signer-title", "invitation-reason", "invitation-notes"].forEach((id) => {
      $(id)?.addEventListener("input", renderInvitationPreview);
      $(id)?.addEventListener("change", renderInvitationPreview);
    });
    $("history-search-btn").addEventListener("click", renderHistory);
    $("history-status").addEventListener("change", renderHistory);
    $("invitation-history-list")?.addEventListener("click",handleInvitationHistory);
    document.querySelectorAll("[data-history-kind]").forEach(button=>button.addEventListener("click",()=>{
      document.querySelectorAll("[data-history-kind]").forEach(item=>item.classList.toggle("active",item===button));
      const map={quotes:"history-quotes-panel",agency:"history-agency-panel",invitations:"history-invitations-panel"};
      Object.entries(map).forEach(([key,id])=>{if($(id))$(id).hidden=key!==button.dataset.historyKind;});
    }));
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
      if (event.target.id === "save-quote-line-columns-btn") saveSettings();
      if (event.target.id === "save-customer-quote-fields-btn") saveSettings();
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

  // Document workspace: recovery snapshots never overwrite formal quotation history.
  let draftDatabase, draftTimer, workspaceReady = false;
  const documentExtraFields = ['packing','photoAppendix','relatedOrderNumber','relatedOrderId','packingSource','translations','outputOptions','shipmentDetails','tableHeaderColor'];
  let packingSourceBusy = false;
  async function refreshPackingSources() {
    const select=$('packing-source-select');
    const targetId=currentQuote.id;
    try {
      const data=await api('/api/quotations');
      if(currentQuote.id!==targetId || currentQuote.documentType!=='packing')return;
      const rows=(data.quotations||[]).filter(q=>q.id!==currentQuote.id && ['invoice','commercial'].includes(q.settingsSnapshot?._quoteMeta?.documentType));
      select.innerHTML='<option value="">'+(rows.length?'请选择 PI／商业发票':'暂无可关联的 PI 或商业发票')+'</option>'+rows.map(q=>`<option value="${escapeHtml(q.id)}">${escapeHtml(q.quote_number)} · ${q.settingsSnapshot._quoteMeta.documentType==='invoice'?'PI':'商业发票'} · ${escapeHtml(q.buyer?.company||q.buyer?.contact||'未填客户')}${q.version?' V'+Number(q.version):''}</option>`).join('');
      select.value=currentQuote.packingSource?.id||'';
      $('packing-source-status').textContent=currentQuote.packingSource?'已关联：'+currentQuote.packingSource.number+'（复制快照，原单不受修改影响）':rows.length?'选择后点击“读取并关联”，替换前需要确认。':'暂无可关联单据，请先保存 PI 或商业发票。';
    }catch(error){$('packing-source-status').textContent='读取失败：'+error.message;}
  }
  async function applyPackingSource() {
    if(packingSourceBusy || currentQuote.documentType!=='packing')return;
    const id=$('packing-source-select').value;
    if(!id)return toast('请先选择 PI 或商业发票。');
    if(currentQuote.packingSource?.id===id)return toast('已关联该单据，不重复导入。需要重新读取时请先取消关联。');
    const targetId=currentQuote.id;
    packingSourceBusy=true;
    try {
      const source=serverQuotationToLocal(await api('/api/quotations/'+encodeURIComponent(id)));
      if(currentQuote.id!==targetId || currentQuote.documentType!=='packing')return;
      if(!['invoice','commercial'].includes(source.documentType)||['Void','Deleted'].includes(source.status))throw Error('该单据已不可关联，请刷新列表。');
      if(!source.items.some(i=>(i.kind||'product')==='product'))throw Error('原单没有可复制的商品。');
      collectQuoteFromForm();
      if(!confirm('将用所选单据替换当前装箱单的客户、贸易及运输资料、商品和装箱明细。当前商品的装箱数据将被替换，原始 PI／商业发票不会改变。是否继续？'))return;
      const items=[],packing={};
      for(const original of source.items.filter(i=>(i.kind||'product')==='product')){
        const item=structuredClone(original);item.id=uid('item');
        const values={...(source.packing?.[original.id]||{}),...(item.values||{})};
        packing[item.id]=Object.fromEntries(['packages','netWeight','grossWeight','cbm','marks'].map(key=>[key,values[key]??'']));
        item.values=values;items.push(item);
      }
      const terms=structuredClone(source.terms||{});
      if(terms.shipping===undefined && terms.tradeTerm!==undefined)terms.shipping=terms.tradeTerm;
      if(terms.port===undefined && terms.destinationPort!==undefined)terms.port=terms.destinationPort;
      Object.assign(currentQuote,{buyer:structuredClone(source.buyer||{}),terms,currency:source.currency,items,packing,
        companySnapshot:structuredClone(source.companySnapshot||companyProfileData(settings)),
        shipmentDetails:{...structuredClone(source.shipmentDetails||{}),invoiceReference:source.quoteNumber},
        relatedOrderId:source.id,relatedOrderNumber:source.quoteNumber,
        packingSource:{id:source.id,number:source.quoteNumber,type:source.documentType,version:source.version||0}});
      $('document-specific-editor').dataset.renderSignature='';
      bindQuoteToForm();renderQuoteItems();renderPreview();scheduleDraftRecovery();
      $('packing-source-status').textContent='已关联：'+source.quoteNumber+'；请核对商品及装箱数据后保存草稿。';
    }catch(error){toast('关联失败：'+error.message);}finally{packingSourceBusy=false;}
  }
  function documentTranslatedValue(key) {
    const mode=displayMode(),lang=mode==='bilingual'?'en':mode.replace('zh-','');
    const value=currentQuote?.translations?.[lang]?.[key];
    if(!value)return '';
    const zh=currentQuote?.translations?.zh?.[key];
    return ['bilingual','zh-fr','zh-es'].includes(mode)&&zh ? value+' / '+zh : value;
  }
  function renderDocumentLanguageEditor() {
    if(!$('document-language-rows'))return;
    const mode=displayMode(),lang=mode==='bilingual'?'en':mode.replace('zh-','');
    const fields=[...(currentQuote.items||[]).filter(i=>(i.kind||'product')==='product').flatMap(i=>[['item:'+i.id+':description',(i.values.model||'商品')+' · 商品说明'],['item:'+i.id+':remark',(i.values.model||'商品')+' · 备注']]),...Object.keys(currentQuote.terms||{}).map(k=>['term:'+k,k])];
    $('document-language-rows').innerHTML=`<p>当前文案语言：${escapeHtml(lang)}，留空使用原有内容；双语模式可分别切换纯中文和外语填写。</p>`+fields.map(([key,label])=>`<label>${escapeHtml(label)}<textarea data-document-language="${escapeHtml(lang)}" data-document-text="${escapeHtml(key)}">${escapeHtml(currentQuote.translations?.[lang]?.[key]||'')}</textarea></label>`).join('');
  }
  function draftKey() { return `quote:${currentUser?.id || 'local'}`; }
  async function draftStorage(mode, value) {
    if(!draftDatabase) draftDatabase = new Promise((resolve,reject)=>{
      const request=indexedDB.open('fta-document-recovery',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('drafts');
      request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    });
    const db=await draftDatabase;
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('drafts',mode==='get'?'readonly':'readwrite');
      const request=mode==='get'?tx.objectStore('drafts').get(draftKey()):tx.objectStore('drafts').put(value,draftKey());
      tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
    });
  }
  function scheduleDraftRecovery() {
    if(!workspaceReady || !currentQuote) return;
    clearTimeout(draftTimer);
    const id=currentQuote.id;
    $('quote-autosave-status').textContent='正在保存恢复草稿…';
    draftTimer=setTimeout(async()=>{
      if(currentQuote.id!==id) return;
      try {
        collectQuoteFromForm();
        await draftStorage('put',{quote:structuredClone(currentQuote),company:settings.companyNameEn,savedAt:new Date().toISOString()});
        $('quote-autosave-status').textContent='恢复草稿已保存 · '+new Date().toLocaleTimeString();
      } catch(error) { $('quote-autosave-status').textContent='自动保存失败，请点击保存草稿：'+error.message; }
    },400);
  }
  function renderPackingEditor() {
    $('packing-editor-rows').innerHTML=(currentQuote.items||[]).filter(i=>(i.kind||'product')==='product').map(item=>`<fieldset><legend>${escapeHtml(item.values.description||item.values.model||'商品')}</legend><div class="form-grid">${[['packages','件数'],['netWeight','净重 kg'],['grossWeight','毛重 kg'],['cbm','体积 m³'],['marks','唛头']].map(([key,label])=>`<label>${label}<input data-packing-item="${escapeHtml(item.id)}" data-packing-key="${key}" ${key==='marks'?'type="text"':'type="number" min="0" step="any"'} value="${escapeHtml(currentQuote.packing?.[item.id]?.[key]??'')}"></label>`).join('')}</div></fieldset>`).join('');
  }
  function applyDocumentWorkspacePreview() {
    syncDocumentEditor();
    const shipment=['commercial','packing'].includes(currentQuote.documentType);
    $('packing-editor').hidden=currentQuote.documentType!=='packing';
    $('shipment-document-editor').hidden=!shipment;
    if($('quote-preview-image-control'))$('quote-preview-image-control').hidden=true;
    const host=$('quote-preview');
    host.querySelectorAll('.packing-summary,.packing-route,.document-related-order').forEach(el=>el.remove());
    const pendingPrices=currentQuote.items.some(item=>item.values?.unitPrice===''||item.values?.unitPrice==null);
    const totalBox=host.querySelector('.preview-total');if(totalBox)totalBox.textContent=(pendingPrices?labelText('Priced items subtotal','已报价项目小计'):labelText('Total','总金额'))+': '+dualMoneyText(total(),currentQuote.currency||settings.currency);
    const incompleteNotice=host.querySelector('.quote-incomplete-warning');
    if(incompleteNotice)incompleteNotice.textContent=labelText('Draft quotation: some items are pending pricing and excluded from the subtotal.','报价草稿：部分项目价格待补，不计入小计。');
    const warning=host.querySelector('.quote-incomplete-warning');if(warning)warning.textContent=labelText('Incomplete quotation: prices are required before formal issue.','报价未完整：正式出具前请补齐价格。');
    const packing=currentQuote.documentType==='packing';
    if(packing){
      host.querySelectorAll('.preview-total,.quote-incomplete-warning,.terms-panel,.bank-panel,.pi-company-signature,.sales-contract-signatures').forEach(el=>el.remove());
      // Bank blocks have configurable titles, so identify the final bank block structurally too.
      const panels=[...host.querySelectorAll(':scope > .preview-panel')];
      panels.filter(el=>el.querySelector('.bank-info,.bank-fields,.bank-preview')).forEach(el=>el.remove());
      const summary=document.createElement('p');summary.className='packing-summary';
      summary.textContent=[['packages','Packages','件数'],['netWeight','Net weight (kg)','净重（kg）'],['grossWeight','Gross weight (kg)','毛重（kg）'],['cbm','Volume (m³)','体积（m³）']].map(([key,en,zh])=>{
        const rows=currentQuote.items.filter(i=>(i.kind||'product')==='product').map(i=>currentQuote.packing?.[i.id]?.[key]);
        return labelText(en,zh)+': '+(rows.length&&rows.every(v=>v!==''&&v!=null&&Number.isFinite(Number(v)))?Number(rows.reduce((sum,v)=>sum+Number(v),0).toFixed(3)):'—');
      }).join(' · ');host.querySelector('table')?.after(summary);
      const route=document.createElement('p');route.className='packing-route';route.textContent=labelText('Origin Port','起运港')+': '+localizedSlashValue(currentQuote.terms.originPort||'—',displayMode())+' / '+labelText('Destination Port','目的港')+': '+localizedSlashValue(currentQuote.terms.port||'—',displayMode());host.append(route);
    }
    const heading=host.querySelector('table')?.closest('.preview-panel')?.querySelector('h3');
    if(heading && ['packing','commercial'].includes(currentQuote.documentType)) heading.textContent=documentTypeTitle();
    if(currentQuote.relatedOrderNumber){const p=document.createElement('p');p.className='document-related-order';p.textContent=labelText('Related order','关联订单')+': '+currentQuote.relatedOrderNumber;host.querySelector('.preview-meta')?.append(p);}
    $('quote-photo-appendix').checked=!!currentQuote.photoAppendix;
    const available = Math.max(1, host.parentElement.clientWidth - 20);
    host.style.zoom=String(Math.min(1,available/794));
    host.classList.add('document-actual-size');
    const pure=['en','fr','es'].includes(displayMode());
    if($('document-language-warning'))$('document-language-warning').textContent=pure&&/[\u3400-\u9fff]/.test(host.innerText)?'检查提示：纯外语单据中仍有中文原始资料，请在对应单证设置或正文中补齐翻译后发送。':'';
  }
  function syncDocumentEditor() {
    const type=currentQuote.documentType||'quotation';
    const packing=type==='packing', shipping=packing||type==='commercial';
    $('packing-source-controls').hidden=!packing;
    const panel=$('document-specific-editor');
    panel.hidden=!shipping;
    $('document-specific-title').textContent=packing?'装箱单填写':'商业发票出货资料';
    $('packing-editor').hidden=true;
    $('shipment-document-editor').hidden=!shipping;
    const names={quotation:['报价基础信息','报价明细','贸易条款'],invoice:['形式发票基础信息','形式发票商品明细','付款及交付条款'],contract:['销售合同基础信息','合同商品明细','合同条款'],commercial:['商业发票基础信息','商业发票商品明细','贸易条款'],packing:['装箱单基础信息','装箱商品明细','运输条款']};
    const titles=names[type]||names.quotation;
    ['quote-common-panel','quote-standard-detail-panel','quote-standard-terms-panel'].forEach((id,i)=>{const h=$(id)?.querySelector('h3');if(h)h.textContent=titles[i];});
    ['valid-until','validity-range-text'].forEach(id=>{if($(id))$(id).closest('label').hidden=type!=='quotation';});
    $('quote-standard-terms-panel').hidden=false;
    // Build dedicated forms only on entering that document or changing its items.
    const signature=JSON.stringify([type,currentQuote.id,currentQuote.items.map(i=>[i.id,i.values.description])]);
    if(panel.dataset.renderSignature!==signature){
      panel.dataset.renderSignature=signature;
      if(packing){renderPackingEditor();refreshPackingSources();}
      if(shipping)renderShipmentFields();
    }
  }
  function shipmentFields(){return [['invoiceReference','关联商业发票编号'],['shipmentDate','实际／计划出货日期'],['namedPlace','Incoterm指定港口／地点'],['transportMode','运输方式'],['vessel','船名／航次'],['billNumber','提运单号'],['containerNumber','箱号／封号'],['consignee','收货人及地址（留空沿用客户）'],['notes','仅用于出货单证的备注（不引用报价质保条款）']];}
  function renderShipmentFields(){
    $('shipment-document-fields').innerHTML=shipmentFields().map(([key,name])=>`<label>${escapeHtml(name)}<${['consignee','notes'].includes(key)?'textarea':'input'} data-shipment-field="${key}" ${key==='shipmentDate'?'type="date"':''} ${!['consignee','notes'].includes(key)?`value="${escapeHtml(currentQuote.shipmentDetails?.[key]||'')}">`:`>${escapeHtml(currentQuote.shipmentDetails?.[key]||'')}</textarea>`}</label>`).join('');
  }
  function initTradeDocumentControls(){
    $('packing-source-refresh').addEventListener('click',refreshPackingSources);
    $('packing-source-apply').addEventListener('click',applyPackingSource);
    $('packing-source-clear').addEventListener('click',()=>{
      if(!currentQuote.packingSource && !currentQuote.relatedOrderId)return;
      if(!confirm('取消关联但保留当前客户、商品及装箱资料？原始单据不会改变。'))return;
      delete currentQuote.packingSource;delete currentQuote.relatedOrderId;delete currentQuote.relatedOrderNumber;
      if(currentQuote.shipmentDetails)currentQuote.shipmentDetails.invoiceReference='';
      $('packing-source-select').value='';$('document-specific-editor').dataset.renderSignature='';renderPreview();scheduleDraftRecovery();
      $('packing-source-status').textContent='已取消关联，当前资料保留。';
    });
    const words={
      'Seller':['卖方','Vendeur','Vendedor'],'Buyer':['买方','Acheteur','Comprador'],'Shipper':['发货人','Expéditeur','Expedidor'],'Consignee':['收货人','Destinataire','Consignatario'],
      'Shipment details':['货运资料','Détails de l’expédition','Datos del envío'],'Invoice reference':['关联发票编号','Référence de facture','Referencia de factura'],'Shipment date':['出货日期','Date d’expédition','Fecha de envío'],'Named place':['指定地点','Lieu convenu','Lugar convenido'],'Transport mode':['运输方式','Mode de transport','Modo de transporte'],'Vessel / voyage':['船名／航次','Navire / voyage','Buque / viaje'],'B/L / AWB No.':['提运单号','N° de connaissement / LTA','N.º de conocimiento / guía aérea'],'Container / seal No.':['箱号／封号','N° conteneur / scellé','N.º de contenedor / precinto'],
      'Country of origin':['原产国','Pays d’origine','País de origen'],'Shipment remarks':['出货备注','Remarques d’expédition','Notas del envío'],'Pro forma invoice — not a final commercial invoice.':['形式发票——非最终商业发票。','Facture pro forma — non définitive.','Factura proforma — no es una factura comercial definitiva.'],'Payment instructions':['付款安排','Modalités de paiement','Instrucciones de pago'],'Delivery and conditions':['交付与交易条件','Livraison et conditions','Entrega y condiciones'],'Goods and contract value':['货物与合同金额','Marchandises et montant du contrat','Mercancías e importe del contrato'],
      'For and on behalf of the Seller':['卖方公司授权签署','Pour le compte du vendeur','En nombre del vendedor'],'Authorized Signatory':['授权签字人','Signataire autorisé','Firmante autorizado'],'Electronic Signature':['电子签名','Signature électronique','Firma electrónica'],'Company Seal':['公司公章','Cachet de la société','Sello de la empresa'],'Buyer signature':['买方签署','Signature de l’acheteur','Firma del comprador'],'Signature':['签字','Signature','Firma'],'Title':['职务','Fonction','Cargo'],'Company':['公司全称','Société','Empresa']
    };
    Object.entries(words).forEach(([en,[zh,fr,es]])=>{quoteFrLabels[en]=fr;quoteEsLabels[en]=es;});
    ['bank','signature'].forEach(key=>$('document-show-'+key).addEventListener('change',()=>{
      currentQuote.outputOptions||={};currentQuote.outputOptions[currentQuote.documentType]||={};currentQuote.outputOptions[currentQuote.documentType][key]=$('document-show-'+key).checked;if(key==='signature'&&$('document-show-'+key).checked)refreshDocumentSigning();renderPreview();scheduleDraftRecovery();
    }));
    $('shipment-document-editor').addEventListener('toggle',()=>{if($('shipment-document-editor').open)renderShipmentFields();});
    $('shipment-document-fields').addEventListener('input',event=>{const key=event.target.dataset.shipmentField;if(!key)return;currentQuote.shipmentDetails||={};currentQuote.shipmentDetails[key]=event.target.value;renderPreview();scheduleDraftRecovery();});
  }
  function initPreviewControls(){
    const viewport=$('quote-preview')?.closest('.quote-preview-viewport'),preview=$('quote-preview'),mode=$('quote-preview-mode'),scaleOutput=$('quote-preview-scale'),reset=$('quote-preview-reset');
    if(!viewport||!preview||!mode||!scaleOutput||!reset)return;
    let scale=1;
    const apply=()=>{viewport.dataset.previewMode=mode.value;if(mode.value==='fit'){preview.style.zoom='1';preview.style.width='100%';scaleOutput.value='适应宽度';}else{preview.style.width='210mm';preview.style.zoom=String(scale);scaleOutput.value=`${Math.round(scale*100)}%`;}};
    mode.addEventListener('change',()=>{scale=1;apply();});
    reset.addEventListener('click',()=>{mode.value='center';scale=1;apply();});
    viewport.addEventListener('wheel',event=>{if(!event.ctrlKey)return;event.preventDefault();mode.value='center';scale=Math.min(2,Math.max(.4,Math.round((scale+(event.deltaY<0?.1:-.1))*10)/10));apply();},{passive:false});
    apply();
  }
  function initDocumentWorkspace() {
    initTradeDocumentControls();
    initPreviewControls();
    Object.assign(quoteFrLabels,{'Used construction machinery and vehicles.':'Machines de construction et véhicules d’occasion.','Incomplete quotation: prices are required before formal issue.':'Devis incomplet : veuillez renseigner les prix avant émission définitive.'});
    Object.assign(quoteEsLabels,{'Used construction machinery and vehicles.':'Maquinaria de construcción y vehículos usados.','Incomplete quotation: prices are required before formal issue.':'Cotización incompleta: indique los precios antes de la emisión definitiva.'});
    Object.assign(quoteFrLabels,{'Invoice No.':'N° de facture','Packing List No.':'N° de colisage','Pending quotation':'Prix à confirmer','Used':'Occasion','Brand New & Unused':'Neuf et inutilisé','New Machinery':'Machine neuve','New Truck':'Camion neuf','Unit':'Unité','Ton':'Tonne','Container':'Conteneur','Item':'Poste'});
    Object.assign(quoteEsLabels,{'Invoice No.':'N.º de factura','Packing List No.':'N.º de empaque','Pending quotation':'Precio pendiente','Used':'Usado','Brand New & Unused':'Nuevo sin uso','New Machinery':'Maquinaria nueva','New Truck':'Camión nuevo','Unit':'Unidad','Ton':'Tonelada','Container':'Contenedor','Item':'Partida'});
    const styles=[['burgundy','酒红商务'],['forest','森林绿'],['navy','深海蓝'],['slate','石墨灰'],['teal','青绿色'],['violet','紫罗兰']];
    styles.forEach(([value,label])=>$('quote-style-select').add(new Option(label,value)));
    $('pdf-language').add(new Option('Français Only / 纯法语','fr'));
    Object.assign(quoteFrLabels,{'Commercial Invoice':'Facture commerciale','Packing List':'Liste de colisage','Sales Contract':'Contrat de vente','No.':'N°','Description':'Description','Packages':'Colis','Net weight (kg)':'Poids net (kg)','Gross weight (kg)':'Poids brut (kg)','Volume (m³)':'Volume (m³)','Shipping marks':'Marques','Related order':'Commande liée'});
    Object.assign(quoteEsLabels,{'Commercial Invoice':'Factura comercial','Packing List':'Lista de empaque','Sales Contract':'Contrato de venta','No.':'N.º','Description':'Descripción','Packages':'Bultos','Net weight (kg)':'Peso neto (kg)','Gross weight (kg)':'Peso bruto (kg)','Volume (m³)':'Volumen (m³)','Shipping marks':'Marcas','Related order':'Pedido relacionado'});
    $('view-quote').addEventListener('input',scheduleDraftRecovery);
    $('view-quote').addEventListener('change',scheduleDraftRecovery);
    $('quote-items').addEventListener('click',()=>setTimeout(scheduleDraftRecovery,0));
    $('document-language-editor')?.addEventListener('toggle',()=>{if($('document-language-editor').open)renderDocumentLanguageEditor();});
    $('pdf-language').addEventListener('change',()=>{if($('document-language-editor')?.open)renderDocumentLanguageEditor();});
    $('document-language-rows')?.addEventListener('input',event=>{const input=event.target;if(!input.dataset.documentText)return;currentQuote.translations||={};currentQuote.translations[input.dataset.documentLanguage]||={};currentQuote.translations[input.dataset.documentLanguage][input.dataset.documentText]=input.value;renderPreview();});
    $('quote-photo-appendix').addEventListener('change',()=>{currentQuote.photoAppendix=$('quote-photo-appendix').checked;renderPreview();});
    $('document-table-color')?.addEventListener('change',event=>{currentQuote.tableHeaderColor=event.target.value;renderPreview();scheduleDraftRecovery();});
    new ResizeObserver(()=>{ if(currentQuote && $('quote-preview').offsetParent) applyDocumentWorkspacePreview(); }).observe($('quote-preview').parentElement);
    $('packing-editor').addEventListener('toggle',()=>{if($('packing-editor').open)renderPackingEditor();});
    $('packing-editor-rows').addEventListener('input',event=>{const input=event.target;if(!input.dataset.packingKey)return;currentQuote.packing||={};currentQuote.packing[input.dataset.packingItem]||={};currentQuote.packing[input.dataset.packingItem][input.dataset.packingKey]=input.value;
      const item=currentQuote.items.find(i=>i.id===input.dataset.packingItem);if(item){item.values||={};item.values[input.dataset.packingKey]=input.value;const row=[...document.querySelectorAll('.quote-line')].find(r=>r.dataset.id===item.id);const field=row?.querySelector(`[data-qfield="${input.dataset.packingKey}"]`);if(field)field.value=input.value;}
      renderPreview();scheduleDraftRecovery();});
    $('restore-quote-draft').addEventListener('click',async()=>{
      try { const saved=await draftStorage('get');if(!saved)return toast('暂无恢复草稿');
        if(!confirm(`恢复 ${saved.quote.quoteNumber}（${saved.company||''}，${saved.savedAt}）？当前未保存内容将被替换。`))return;
        clearTimeout(draftTimer);currentQuote=saved.quote;bindQuoteToForm();renderQuoteItems();renderPreview();renderPackingEditor();toast('已恢复上次编辑，请确认当前开票公司。');
      }catch(error){toast('恢复失败：'+error.message);}
    });
    workspaceReady=true;
    draftStorage('get').then(saved=>{if(saved)$('quote-autosave-status').textContent='发现上次编辑的恢复草稿，点击“恢复上次编辑”继续';}).catch(()=>{$('quote-autosave-status').textContent='恢复存储不可用，请手动保存草稿';});
    renderPreview();
  }

  function updateDocumentSwitchState() {
    const type=activeViewName==='invitation'?'invitation':activeViewName==='agency'?'authorization':currentQuote?.documentType||'quotation';
    document.querySelectorAll('[data-switch-document]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.switchDocument===type)));
  }
  function initDocumentNavigation() {
    const types={quotation:'报价单',invoice:'形式发票（PI）',contract:'销售合同',commercial:'商业发票',packing:'装箱单',authorization:'代理授权书',invitation:'商务邀请函'};
    const drafts=new Map();let sharedBuyer={};
    function capture(){
      if(activeViewName==='quote'){collectQuoteFromForm();sharedBuyer={...currentQuote.buyer};drafts.set(currentQuote.documentType,structuredClone(currentQuote));}
      if(activeViewName==='invitation'){collectInvitationFromForm();sharedBuyer={...sharedBuyer,contact:currentInvitation.visitorName,company:currentInvitation.visitorCompany,country:currentInvitation.country};drafts.set('invitation',structuredClone(currentInvitation));}
      if(activeViewName==='agency'){collectAgentAuthorizationForm();sharedBuyer={...sharedBuyer,contact:currentAgentAuthorization.agentName,country:currentAgentAuthorization.country,phone:currentAgentAuthorization.phone,email:currentAgentAuthorization.email,address:currentAgentAuthorization.address};drafts.set('authorization',structuredClone(currentAgentAuthorization));}
    }
    function open(type){
      capture();
      if(type==='invitation'){
        if(drafts.has(type))currentInvitation=structuredClone(drafts.get(type));else{newInvitation();Object.assign(currentInvitation,{visitorName:sharedBuyer.contact||'',visitorCompany:sharedBuyer.company||'',country:sharedBuyer.country||''});}
        bindInvitationToForm();switchView('invitation');updateDocumentSwitchState();return;
      }
      if(type==='authorization'){
        if(drafts.has(type))currentAgentAuthorization=structuredClone(drafts.get(type));else{newAgentAuthorization();Object.assign(currentAgentAuthorization,{agentName:sharedBuyer.contact||'',country:sharedBuyer.country||'',phone:sharedBuyer.phone||'',email:sharedBuyer.email||'',address:sharedBuyer.address||''});}
        bindAgentAuthorizationForm();switchView('agency');updateDocumentSwitchState();return;
      }
      if(drafts.has(type))currentQuote=structuredClone(drafts.get(type));else{
        const source=drafts.get('quotation');newQuote();currentQuote.documentType=type;currentQuote.buyer={...currentQuote.buyer,...sharedBuyer};
        if(source){currentQuote.items=structuredClone(source.items).map(item=>({...item,id:uid('item')}));currentQuote.terms=structuredClone(source.terms);currentQuote.relatedOrderId=source.id;currentQuote.relatedOrderNumber=source.quoteNumber;}
      }
      bindQuoteToForm();renderQuoteItems();switchView('quote');renderPreview();
    }
    const section=document.createElement('section');section.id='view-create';section.className='view no-print';
    section.innerHTML='<header class="page-head"><h2>新建单证</h2><p>每种单证独立填写和保存，可携带同一客户资料继续制作其他单证。</p></header><div class="entry-grid">'+Object.entries(types).map(([key,label])=>`<button class="entry-card" data-create-document="${key}"><b>${label}</b><span>进入独立填写界面</span></button>`).join('')+'</div>';
    document.querySelector('main').append(section);
    for(const view of ['quote','invitation','agency']){
      const bar=document.createElement('div');bar.className='document-jump-bar no-print';bar.innerHTML='<b>单证工作台</b><nav class="document-switch-buttons" aria-label="切换单证">'+Object.entries(types).map(([k,v])=>`<button type="button" data-switch-document="${k}">${v}</button>`).join('')+'</nav><small>点击切换；客户资料可共用，每份单证独立填写和保存。</small>';
      bar.querySelector('nav').onclick=e=>{const type=e.target.closest('[data-switch-document]')?.dataset.switchDocument;if(type)open(type);};
      const batch=document.createElement('details');
      batch.innerHTML='<summary>同时准备多份单证</summary><div class="actions">'+Object.entries(types).map(([key,label])=>`<label><input type="checkbox" value="${key}"> ${label}</label>`).join('')+'</div><button type="button">准备所选草稿</button><small>只准备独立草稿；请逐份补充资料、核对后保存，不自动签发。</small>';
      batch.querySelector('button').onclick=()=>{const selected=[...batch.querySelectorAll('input:checked')].map(el=>el.value);if(!selected.length)return toast('请先选择单证');selected.forEach(open);open(selected[0]);toast('已准备 '+selected.length+' 份独立草稿，可用上方选择框切换核对和保存。');};
      bar.append(batch);
      const host=$('view-'+view);host.prepend(bar);
    }
    section.addEventListener('click',e=>{const type=e.target.closest('[data-create-document]')?.dataset.createDocument;if(type)open(type);});
    document.addEventListener('click',e=>{if(e.target.closest('[data-view-target]'))capture();},true);
    const status=$('quote-autosave-status').parentElement;
    status.classList.add('quote-draft-toolbar');
    document.querySelector('#view-quote .page-head').after(status);
    // Output controls stay with the editor; preview uses all available width.
  }

  async function init() {
    const greeting=$('home-time-greeting');if(greeting){const hour=new Date().getHours();greeting.textContent=hour<6?'深夜好，注意休息':hour<11?'早上好，元气满满地开始今天的工作':hour<14?'中午好，轻松整理今天的工作':hour<18?'下午好，继续推进今天的工作':'晚上好，轻松整理今天的工作';}
    bindEvents();
    initSignaturePad();
    initDocumentNavigation();
    organizeManagementModules();
    window.freightWorkspace?.init();
    window.quotationDesktop?.onMenuAction?.(handleDesktopMenuAction);
    applySidebarState();
    removeLegacyCostFields();
    renderAllSelectors();
    renderSettings();
    renderProducts();
    newQuote();
    newInvitation();
    await checkLogin();
    if(activeViewName==='home'){updateDesktopTopbar('home');await renderHomeDashboard();}
    initDocumentWorkspace();
    await loadCustomHsCodes();
    applyAuthLock();
    window.AppLock?.configure(settings.applicationLock || defaultSettings.applicationLock);
    window.GlobalFreightCalculator?.mount?.({getTarget:activeFreightTarget,apply:applyFreightResult});
  }

  window.quoteApp = { editProduct, deleteProduct, editQuote, copyQuote, deleteQuote, printStandardHistory, importMachineryReferenceProducts, exportProductCatalogPdf, renderVehiclePreview, printVehicleQuote, getActiveFreightTarget:activeFreightTarget, applyFreightResult };
  window.quoteSettingsContext={
    get settings(){return settings;},
    save:async(next)=>{settings={...settings,...next};save(keys.settings,settings);await api('/api/settings',{method:'PUT',body:JSON.stringify(settings)});renderSettings();renderProducts();renderPreview();},
    toast,renderPreview
  };
  ["crm-module-btn", "crm-entry-btn"].forEach((id) => {
    const button = $(id);
    if (button) button.addEventListener("click", () => {
      if (!currentUser) return switchView("login");
      window.location.href = "/crm";
    });
  });

  window.freightContext = { get settings(){return settings;}, get ports(){return ports;}, get rates(){return freightRates;}, get routes(){return countryRoutes;}, get products(){return products;}, get quotes(){return quotes;}, api, isAdmin, toast, portRegion, portOptionLabel, setPortInputValue, openSettingsSection, loadServerData, renderPreview, collectQuoteFromForm,
    async saveConfig(config) { if(!isAdmin()) throw new Error("需要管理员权限"); const next={...settings,freightWorkspace:config}; await api("/api/settings",{method:"PUT",body:JSON.stringify(next)}); settings.freightWorkspace=config; save(keys.settings,settings); }
  };
  init();
})();

