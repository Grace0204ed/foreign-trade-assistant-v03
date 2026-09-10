(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const api = async (url, options = {}) => {
    const response = await fetch(url, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
    const data = await response.json();
    if (!response.ok) throw new Error(data.zh || data.message || "操作失败");
    return data;
  };
  const definitions = {
    "vehicle-types": { title: "新车车型", fields: [["code","车型编号","text",true],["name_zh","中文名称","text",true],["name_en","英文名称","text"],["description_zh","中文说明","textarea"],["description_en","英文说明","textarea"],["image_path","车型图片","image"]] },
    chassis: { title: "底盘", fields: [["code","底盘编号","text",true],["brand","品牌","text",true],["series","系列","text"],["model","具体型号","text",true],["drive_type","驱动形式","text"],["engine","发动机","text"],["horsepower","马力","text"],["emission","排放标准","text"],["wheelbase","轴距","text"],["cab","驾驶室","text"],["capacity","承载参数","text"],["length","运输长","number"],["width","运输宽","number"],["height","运输高","number"],["dimension_unit","尺寸单位","unit"],["factory_price","出厂价","number"],["cost_price","成本价","number"],["sale_price","销售价","number"],["currency","币种","currency"],["params_zh","中文参数","textarea"],["params_en","英文参数","textarea"],["image_path","底盘图片","image"]] },
    superstructures: { title: "上装", fields: [["code","上装编号","text",true],["type","上装类型","text"],["brand","品牌","text",true],["model","型号","text",true],["rated_capacity","额定吨位/容量","text"],["boom_sections","臂节","text"],["boom_length","臂长","text"],["crane_form","吊机形式","text"],["tank_capacity","罐体容量","text"],["length","运输长","number"],["width","运输宽","number"],["height","运输高","number"],["dimension_unit","尺寸单位","unit"],["factory_price","出厂价","number"],["cost_price","成本价","number"],["sale_price","销售价","number"],["currency","币种","currency"],["params_zh","中文参数","textarea"],["params_en","英文参数","textarea"],["image_path","上装图片","image"]] },
    options: { title: "选装件", fields: [["code","选装件编号","text",true],["name_zh","中文名称","text",true],["name_en","英文名称","text"],["cost_price","成本价","number"],["sale_price","销售价","number"],["currency","币种","currency"],["params_zh","中文参数","textarea"],["params_en","英文参数","textarea"]] },
    attachments: { title: "属具/工具头", fields: [["code","属具编号","text",true],["name_zh","中文名称","text",true],["name_en","英文名称","text"],["attachment_type","属具类型","text"],["brand","品牌","text"],["model","型号","text"],["transport_length","运输长","number"],["transport_width","运输宽","number"],["transport_height","运输高","number"],["transport_cbm","运输方数 CBM","number"],["dimension_unit","尺寸单位","unit"],["weight","重量（吨）","number"],["cost_price","成本价","number"],["sale_price","销售价","number"],["currency","币种","currency"],["params_zh","中文参数","textarea"],["params_en","英文参数","textarea"],["image_path","属具图片","image"]] }
  };
  let activeTab = "vehicle-types";
  let editingId = "";
  let records = {};
  let compatibility = [];
  let initialized = false;

  function input(field, value = "") {
    const [key, label, type, required] = field;
    if (type === "textarea") return `<label class="wide"><span>${label}${required ? " *" : ""}</span><textarea data-va-field="${key}" ${required ? "required" : ""}>${esc(value)}</textarea></label>`;
    if (type === "unit") return `<label><span>${label}</span><select data-va-field="${key}"><option value="meter" ${value === "meter" ? "selected" : ""}>米 m</option><option value="mm" ${value === "mm" ? "selected" : ""}>毫米 mm</option><option value="cm" ${value === "cm" ? "selected" : ""}>厘米 cm</option></select></label>`;
    if (type === "currency") return `<label><span>${label}</span><select data-va-field="${key}">${["USD","CNY","EUR","GBP"].map(x => `<option ${x === (value || "USD") ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
    if (type === "image") return `<label class="wide"><span>${label}</span><div class="catalog-image-field"><input data-va-field="${key}" value="${esc(value)}" placeholder="上传后自动填写图片地址"><label class="file-btn">上传图片<input data-va-image="${key}" type="file" accept="image/jpeg,image/png,image/webp"></label>${value ? `<img src="${esc(value)}" alt="">` : ""}</div></label>`;
    return `<label><span>${label}${required ? " *" : ""}</span><input data-va-field="${key}" type="${type}" value="${esc(value)}" ${required ? "required" : ""}></label>`;
  }
  const nameOf = (tab, item) => tab === "vehicle-types" ? `${item.name_zh} / ${item.name_en || ""}` : tab === "chassis" ? `${item.brand} ${item.model} ${item.drive_type || ""}` : tab === "superstructures" ? `${item.brand} ${item.model} ${item.rated_capacity || ""}` : `${item.name_zh} / ${item.name_en || ""} ${item.brand || ""} ${item.model || ""}`;
  async function loadAll() {
    const tabs = Object.keys(definitions);
    const results = await Promise.all([...tabs.map(tab => api(`/api/catalog/${tab}?all=1`)), api("/api/compatibility")]);
    tabs.forEach((tab, index) => records[tab] = results[index].items || []);
    compatibility = results.at(-1).items || [];
  }
  function compatibilityForm(value = {}) {
    const options = records.options || [], tools = records.attachments || [];
    const select = (key, label, rows, text, selected) => `<label><span>${label} *</span><select data-va-field="${key}" required><option value="">请选择</option>${rows.map(row => `<option value="${row.id}" ${row.id === selected ? "selected" : ""}>${esc(text(row))}</option>`).join("")}</select></label>`;
    return `${select("vehicleTypeId","车辆类型",records["vehicle-types"] || [],x=>`${x.name_zh} / ${x.name_en || ""}`,value.vehicle_type_id)}${select("chassisId","底盘",records.chassis || [],x=>`${x.brand} ${x.model} ${x.drive_type || ""}`,value.chassis_id)}${select("superstructureId","上装",records.superstructures || [],x=>`${x.brand} ${x.model} ${x.rated_capacity || ""}`,value.superstructure_id)}<label><span>价格模式</span><select data-va-field="priceMode"><option value="standard" ${value.price_mode === "standard" ? "selected" : ""}>标准相加</option><option value="adjustment" ${value.price_mode === "adjustment" ? "selected" : ""}>组合加减价</option><option value="fixed" ${value.price_mode === "fixed" ? "selected" : ""}>组合固定价</option></select></label><label><span>组合价格/调整金额</span><input data-va-field="priceValue" type="number" value="${esc(value.price_value || 0)}"></label><label><span>币种</span><select data-va-field="currency">${["USD","CNY","EUR","GBP"].map(x=>`<option ${x === (value.currency || "USD") ? "selected" : ""}>${x}</option>`).join("")}</select></label><fieldset class="wide compatibility-transport"><legend>整车运输参数（管理员确认，不由系统猜测）</legend><label><span>运输长</span><input data-va-field="transportLength" type="number" value="${esc(value.transport_length || 0)}"></label><label><span>运输宽</span><input data-va-field="transportWidth" type="number" value="${esc(value.transport_width || 0)}"></label><label><span>运输高</span><input data-va-field="transportHeight" type="number" value="${esc(value.transport_height || 0)}"></label><label><span>整车方数 CBM</span><input data-va-field="transportCbm" type="number" value="${esc(value.transport_cbm || 0)}"></label><label><span>尺寸单位</span><select data-va-field="dimensionUnit"><option value="meter" ${value.dimension_unit === "meter" ? "selected" : ""}>米 m</option><option value="mm" ${value.dimension_unit === "mm" ? "selected" : ""}>毫米 mm</option></select></label><label><span>默认运输方式</span><select data-va-field="transportMethod">${["Bulk Cargo","RORO","Container","Flat Rack","Other"].map(x=>`<option ${x === (value.transport_method || "Bulk Cargo") ? "selected" : ""}>${x}</option>`).join("")}</select></label></fieldset><fieldset class="wide"><legend>允许的选装件</legend><div class="option-checks">${options.map(x=>`<label><input data-va-option="${x.id}" type="checkbox" ${(value.option_ids || []).includes(x.id) ? "checked" : ""}>${esc(nameOf("options",x))}</label>`).join("") || "请先新建选装件"}</div></fieldset><fieldset class="wide"><legend>允许的属具/工具头</legend><div class="option-checks">${tools.map(x=>`<label><input data-va-attachment="${x.id}" type="checkbox" ${(value.attachment_ids || []).includes(x.id) ? "checked" : ""}>${esc(nameOf("attachments",x))}</label>`).join("") || "请先新建属具"}</div></fieldset>`;
  }
  function renderForm(value = {}) {
    const form = $("va-form-unified");
    if (!form) return;
    form.innerHTML = activeTab === "compatibility" ? compatibilityForm(value) : definitions[activeTab].fields.map(field => input(field, value[field[0]])).join("");
  }
  function renderList() {
    const host = $("va-list-unified"); if (!host) return;
    const list = activeTab === "compatibility" ? compatibility : (records[activeTab] || []);
    host.innerHTML = list.map(item => {
      const title = activeTab === "compatibility" ? `${item.vehicle_type_name} · ${item.chassis_brand} ${item.chassis_model} · ${item.superstructure_brand} ${item.superstructure_model}` : nameOf(activeTab,item);
      const detail = activeTab === "compatibility" ? `${item.price_mode} ${item.currency} ${item.price_value || 0} · 选装件 ${(item.option_ids || []).length} · 属具 ${(item.attachment_ids || []).length}` : `${item.code || ""} · ${item.currency || ""} ${item.sale_price || ""}`;
      return `<article class="list-item catalog-list-item">${item.image_path ? `<img src="${esc(item.image_path)}" alt="">` : `<div class="thumb-empty">无图片</div>`}<div><b>${esc(title)}</b><p>${esc(detail)}</p><small>${item.status === "Inactive" ? "已停用" : "启用"}</small></div><div class="actions"><button data-va-edit="${item.id}">编辑</button><button data-va-stop="${item.id}">停用</button></div></article>`;
    }).join("") || `<p class="empty">暂无${definitions[activeTab]?.title || "兼容组合"}，请在上方新建。</p>`;
  }
  function render() {
    document.querySelectorAll("[data-product-library]").forEach(button => button.classList.toggle("active", button.dataset.productLibrary === activeTab));
    renderForm(); renderList();
    const save = $("va-save-unified"); if (save) save.textContent = editingId ? "保存修改" : "保存到产品库";
  }
  function collect() {
    const body = {};
    document.querySelectorAll("#va-form-unified [data-va-field]").forEach(el => body[el.dataset.vaField] = el.type === "number" ? Number(el.value || 0) : el.value.trim());
    if (activeTab === "compatibility") {
      body.optionIds = [...document.querySelectorAll("#va-form-unified [data-va-option]:checked")].map(x=>x.dataset.vaOption);
      body.attachmentIds = [...document.querySelectorAll("#va-form-unified [data-va-attachment]:checked")].map(x=>x.dataset.vaAttachment);
    } else body.status = "Active";
    return body;
  }
  async function saveRecord() {
    const body = collect();
    const route = activeTab === "compatibility" ? "/api/compatibility" : `/api/catalog/${activeTab}`;
    await api(editingId ? `${route}/${editingId}` : route, { method: editingId ? "PUT" : "POST", body: JSON.stringify(body) });
    editingId = ""; await loadAll(); render(); window.vehicleQuoteApp?.reloadCatalog?.();
  }
  async function upload(input) {
    const file = input.files?.[0]; if (!file) return;
    const response = await fetch("/api/uploads/image", { method:"POST", headers:{"Content-Type":file.type}, body:file });
    const data = await response.json(); if (!response.ok) throw new Error(data.zh || data.message);
    const field = document.querySelector(`[data-va-field="${input.dataset.vaImage}"]`); if (field) field.value = data.path;
    const old = input.closest(".catalog-image-field").querySelector("img"); if (old) old.remove(); input.closest(".catalog-image-field").insertAdjacentHTML("beforeend",`<img src="${esc(data.path)}" alt="">`);
  }
  async function edit(id) {
    editingId = id;
    const item = (activeTab === "compatibility" ? compatibility : records[activeTab]).find(x=>x.id===id);
    renderForm(item || {}); $("va-save-unified").textContent="保存修改"; $("unified-vehicle-product-editor").scrollIntoView({behavior:"smooth"});
  }
  async function deactivate(id) {
    if (!confirm("确认停用这条资料吗？历史报价不会受影响。")) return;
    if (activeTab === "compatibility") await api(`/api/compatibility/${id}`,{method:"PUT",body:JSON.stringify({status:"Inactive",reason:"管理员停用"})});
    else await api(`/api/catalog/${activeTab}/${id}`,{method:"PUT",body:JSON.stringify({status:"Inactive",reason:"管理员停用"})});
    await loadAll(); render(); window.vehicleQuoteApp?.reloadCatalog?.();
  }
  function showTab(tab) {
    activeTab = tab; editingId = "";
    $("unified-vehicle-product-editor").hidden = false;
    render();
    document.querySelectorAll("[data-product-library]").forEach(button=>button.classList.toggle("active",button.dataset.productLibrary===tab));
  }
  async function init() {
    if (initialized || !$("unified-vehicle-product-editor")) return;
    await loadAll();
    $("unified-vehicle-product-editor").hidden = false;
    document.querySelectorAll("[data-product-library]").forEach(button=>button.addEventListener("click",()=>showTab(button.dataset.productLibrary)));
    $("va-save-unified").addEventListener("click",()=>saveRecord().catch(e=>alert(e.message)));
    $("va-clear-unified").addEventListener("click",()=>{editingId="";render()});
    $("va-form-unified").addEventListener("change",e=>{if(e.target.matches("[data-va-image]"))upload(e.target).catch(err=>alert(err.message))});
    $("va-list-unified").addEventListener("click",e=>{const editButton=e.target.closest("[data-va-edit]"),stopButton=e.target.closest("[data-va-stop]");if(editButton)edit(editButton.dataset.vaEdit);if(stopButton)deactivate(stopButton.dataset.vaStop).catch(err=>alert(err.message))});
    initialized = true;
  }
  window.vehicleCatalogAdmin = { init, refresh: async()=>{await loadAll();render()} };
  window.addEventListener("foreign-trade-auth-ready",()=>init().catch(console.error));
})();
