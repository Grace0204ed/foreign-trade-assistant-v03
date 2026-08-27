(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
  const api = async (url, options = {}) => {
    const response = await fetch(url, { headers:{ "Content-Type":"application/json", ...(options.headers || {}) }, ...options });
    const data = await response.json();
    if (!response.ok) throw new Error(data.zh || data.message || "操作失败");
    return data;
  };
  let catalog = { vehicleTypes:[], chassis:[], superstructures:[], options:[], attachments:[], compatibility:[] };
  let items = [];
  let current = { seriesId:"", sourceQuoteId:"", logistics:null };
  let initialized = false;
  let calculateTimer;

  const option = (value, label, selected) => `<option value="${esc(value)}" ${value === selected ? "selected" : ""}>${esc(label)}</option>`;
  const blank = () => ({ id:`local-${Date.now()}-${Math.random().toString(36).slice(2)}`, vehicleTypeId:"", chassisId:"", compatibilityId:"", optionIds:[], attachmentIds:[], quantity:1, manualUnitPrice:"", overrideReason:"", specs:{} });
  async function reloadCatalog() {
    const [types,chassis,uppers,options,attachments,rules] = await Promise.all([
      api("/api/catalog/vehicle-types"), api("/api/catalog/chassis"), api("/api/catalog/superstructures"),
      api("/api/catalog/options"), api("/api/catalog/attachments"), api("/api/compatibility")
    ]);
    catalog = { vehicleTypes:types.items || [], chassis:chassis.items || [], superstructures:uppers.items || [], options:options.items || [], attachments:attachments.items || [], compatibility:rules.items || [] };
    if (initialized) renderItems();
  }
  function quoteFields(item) {
    try {
      const type = catalog.vehicleTypes.find(x=>x.id===item.vehicleTypeId);
      const fields = JSON.parse(type?.quote_fields_json || "[]");
      return Array.isArray(fields) ? fields : [];
    } catch { return []; }
  }
  function imageCard(path, label) { return path ? `<figure class="vehicle-component-image"><img src="${esc(path)}" alt=""><figcaption>${esc(label)}</figcaption></figure>` : ""; }
  function renderItems() {
    const host = $("vq-items"); if (!host) return;
    host.innerHTML = items.map((item,index) => {
      const typeRules = catalog.compatibility.filter(rule => !item.vehicleTypeId || rule.vehicle_type_id === item.vehicleTypeId);
      const chassisIds = new Set(typeRules.map(rule=>rule.chassis_id));
      const chassisRules = typeRules.filter(rule => !item.chassisId || rule.chassis_id === item.chassisId);
      const rule = catalog.compatibility.find(rule=>rule.id===item.compatibilityId);
      const chassis = catalog.chassis.find(x=>x.id===item.chassisId);
      const upper = catalog.superstructures.find(x=>x.id===rule?.superstructure_id);
      const allowedOptions = new Set(rule?.option_ids || []);
      const allowedTools = new Set(rule?.attachment_ids || []);
      return `<article class="vehicle-item" data-vq-index="${index}">
        <div class="vehicle-item-head"><b>车辆配置 ${index + 1}</b><button type="button" data-vq-remove>删除</button></div>
        <div class="form-grid">
          <label><span>车辆类型 *</span><select data-vq-field="vehicleTypeId"><option value="">请选择车型</option>${catalog.vehicleTypes.map(x=>option(x.id,`${x.name_zh} / ${x.name_en || ""}`,item.vehicleTypeId)).join("")}</select></label>
          <label><span>兼容底盘 *</span><select data-vq-field="chassisId"><option value="">请选择底盘</option>${catalog.chassis.filter(x=>chassisIds.has(x.id)).map(x=>option(x.id,`${x.brand} ${x.model} · ${x.drive_type || ""}`,item.chassisId)).join("")}</select></label>
          <label><span>兼容上装 *</span><select data-vq-field="compatibilityId"><option value="">请选择上装</option>${chassisRules.map(x=>option(x.id,`${x.superstructure_brand} ${x.superstructure_model}`,item.compatibilityId)).join("")}</select></label>
          <label><span>数量 *</span><input data-vq-field="quantity" type="number" min="1" value="${esc(item.quantity || 1)}"></label>
          <label><span>手工调整单价</span><input data-vq-field="manualUnitPrice" type="number" min="0" value="${esc(item.manualUnitPrice)}" placeholder="留空使用系统价格"></label>
          <label><span>改价原因</span><input data-vq-field="overrideReason" value="${esc(item.overrideReason)}" placeholder="手工改价时必填"></label>
          ${quoteFields(item).map(field=>`<label class="${field.type === "textarea" ? "wide" : ""}"><span>${esc(field.zh || field.labelZh || field.key)} / ${esc(field.en || field.labelEn || "")}</span>${field.type === "textarea" ? `<textarea data-vq-spec="${esc(field.key)}">${esc(item.specs?.[field.key] || "")}</textarea>` : `<input data-vq-spec="${esc(field.key)}" value="${esc(item.specs?.[field.key] || "")}">`}</label>`).join("")}
        </div>
        <div class="vehicle-component-images">${imageCard(chassis?.image_path,`底盘：${chassis?.brand || ""} ${chassis?.model || ""}`)}${imageCard(upper?.image_path,`上装：${upper?.brand || ""} ${upper?.model || ""}`)}</div>
        <fieldset><legend>选装件</legend><div class="option-checks">${catalog.options.filter(x=>allowedOptions.has(x.id)).map(x=>`<label><input data-vq-option="${x.id}" type="checkbox" ${(item.optionIds || []).includes(x.id) ? "checked" : ""}>${esc(x.name_zh)} / ${esc(x.name_en || "")} · ${esc(x.currency)} ${Number(x.sale_price || 0).toLocaleString()}</label>`).join("") || "选择兼容上装后显示"}</div></fieldset>
        <fieldset><legend>属具 / 工具头</legend><div class="option-checks">${catalog.attachments.filter(x=>allowedTools.has(x.id)).map(x=>`<label class="tool-choice"><input data-vq-attachment="${x.id}" type="checkbox" ${(item.attachmentIds || []).includes(x.id) ? "checked" : ""}>${x.image_path ? `<img src="${esc(x.image_path)}" alt="">` : ""}<span>${esc(x.name_zh)} / ${esc(x.name_en || "")} ${esc(x.brand || "")} ${esc(x.model || "")}<small>${esc(x.currency)} ${Number(x.sale_price || 0).toLocaleString()} · ${Number(x.transport_cbm || 0)} CBM</small></span></label>`).join("") || "该组合暂未配置属具，请联系管理员维护"}</div></fieldset>
      </article>`;
    }).join("");
    bindItemEvents();
  }
  function bindItemEvents() {
    document.querySelectorAll("[data-vq-index]").forEach(card => {
      const item = items[Number(card.dataset.vqIndex)];
      card.querySelector("[data-vq-remove]").onclick = () => { items.splice(Number(card.dataset.vqIndex),1); if (!items.length) items.push(blank()); renderItems(); calculate(); };
      card.querySelectorAll("[data-vq-field]").forEach(input => input.onchange = () => {
        item[input.dataset.vqField] = input.dataset.vqField === "quantity" ? Number(input.value || 1) : input.value;
        if (input.dataset.vqField === "vehicleTypeId") { item.chassisId=""; item.compatibilityId=""; item.optionIds=[]; item.attachmentIds=[]; }
        if (input.dataset.vqField === "chassisId") { item.compatibilityId=""; item.optionIds=[]; item.attachmentIds=[]; }
        if (["vehicleTypeId","chassisId","compatibilityId"].includes(input.dataset.vqField)) renderItems();
        calculate();
      });
      card.querySelectorAll("[data-vq-option]").forEach(input => input.onchange = () => { item.optionIds=[...card.querySelectorAll("[data-vq-option]:checked")].map(x=>x.dataset.vqOption); calculate(); });
      card.querySelectorAll("[data-vq-attachment]").forEach(input => input.onchange = () => { item.attachmentIds=[...card.querySelectorAll("[data-vq-attachment]:checked")].map(x=>x.dataset.vqAttachment); calculate(); });
      card.querySelectorAll("[data-vq-spec]").forEach(input => input.oninput = () => { item.specs[input.dataset.vqSpec]=input.value; calculate(); });
    });
  }
  const value = (id) => $(id)?.value || "";
  const embedded = () => $("view-vehicle-quote")?.classList.contains("embedded-vehicle-quote");
  const sharedValue = (sharedId, vehicleId) => embedded() ? value(sharedId) : value(vehicleId);
  function sharedTerms() {
    if (!embedded()) return null;
    const values = {};
    document.querySelectorAll("#quote-terms [data-termfield]").forEach(input => { values[input.dataset.termfield] = input.value; });
    const first = (...keys) => keys.map(key => values[key]).find(Boolean) || "";
    return { payment:first("payment","paymentMethod"), delivery:first("delivery","deliveryTime"), originPort:first("originPort","loadingPort"), destinationPort:first("port","destinationPort"), afterSales:first("afterSales","afterSale"), warranty:first("warranty"), text:first("notes","terms","remark"), shipping:first("shipping","tradeTerm") };
  }
  const fee = (key) => ({ mode:value(`vq-${key}-mode`) || "amount", value:Number(value(`vq-${key}`) || 0) });
  function payload() {
    const rawDocumentType=sharedValue("document-type","vq-document-type") || "quotation";
    const commonTerms=sharedTerms();
    return { seriesId:current.seriesId || undefined, sourceQuoteId:current.sourceQuoteId || undefined, logistics:current.logistics,
      documentType:rawDocumentType === "invoice" ? "proforma" : rawDocumentType, language:sharedValue("pdf-language","vq-language") || "bilingual", customerId:sharedValue("quote-customer","vq-customer") || null,
      buyer:{ company:sharedValue("buyer-company","vq-company"),contact:sharedValue("buyer-contact","vq-contact"),phone:sharedValue("buyer-phone","vq-phone"),email:sharedValue("buyer-email","vq-email"),address:sharedValue("buyer-address","vq-address"),country:sharedValue("buyer-country","vq-country"),destinationPort:commonTerms?.destinationPort || value("vq-destination-port") },
      currency:sharedValue("quote-currency","vq-currency") || "USD", quoteDate:sharedValue("quote-date","vq-date"), validUntil:sharedValue("valid-until","vq-valid"), items:items.map(x=>({...x,quantity:Number(x.quantity || 1)})),
      fees:{freight:fee("freight"),tax:fee("tax"),service:fee("service"),discount:fee("discount")},
      terms:commonTerms || {payment:value("vq-payment"),delivery:value("vq-delivery"),originPort:value("vq-origin-port"),destinationPort:value("vq-term-destination-port") || value("vq-destination-port"),afterSales:value("vq-after-sales"),warranty:value("vq-warranty"),text:value("vq-terms")} };
  }
  function showTotals(result = {}) {
    const currency=sharedValue("quote-currency","vq-currency") || "USD";
    $("vq-subtotal").textContent=`${currency} ${Number(result.subtotal || 0).toLocaleString()}`;
    ["freight","tax","service","discount"].forEach(key=>$( `vq-${key}-total`).textContent=Number(result.fees?.[key] || 0).toLocaleString());
    $("vq-total").textContent=`${currency} ${Number(result.finalTotal || 0).toLocaleString()}`;
    window.quoteApp?.renderVehiclePreview?.({...payload(),...result});
  }
  function calculate() {
    clearTimeout(calculateTimer);
    calculateTimer=setTimeout(async()=>{try{showTotals(await api("/api/vehicle-quotes/calculate",{method:"POST",body:JSON.stringify(payload())}));$("vq-notice").textContent="";}catch(error){$("vq-notice").innerHTML=`<div class="import-result error">${esc(error.message)}</div>`;showTotals({});}},150);
  }
  async function loadCustomers() {
    try {
      const rows=await api("/api/customers");
      const html=`<option value="">自动匹配/暂不关联</option>`+(rows || []).map(x=>option(String(x.id),`${x.company || x.name || "未命名"} · ${x.country || ""}`,"")).join("");
      if ($("vq-customer")) $("vq-customer").innerHTML=html;
      if ($("quote-customer")) $("quote-customer").innerHTML=html;
    } catch {}
  }
  function reset() {
    current={seriesId:"",sourceQuoteId:"",logistics:null}; items=[blank()];
    ["vq-number","vq-company","vq-contact","vq-phone","vq-email","vq-address","vq-country","vq-destination-port","vq-payment","vq-delivery","vq-origin-port","vq-term-destination-port","vq-after-sales","vq-warranty","vq-terms"].forEach(id=>{if($(id))$(id).value=""});
    $("vq-date").value=new Date().toISOString().slice(0,10); renderItems(); calculate();
  }
  async function save(formal) {
    const data=await api(`/api/vehicle-quotes/${formal ? "formalize" : "draft"}`,{method:"POST",body:JSON.stringify(payload())});
    current.seriesId=data.seriesId; $("vq-number").value=`${data.quoteNumber} V${data.version}`;
    if (embedded() && $("quote-number")) $("quote-number").value=`${data.quoteNumber} V${data.version}`;
    alert(`${formal ? "正式单据已生成" : "草稿已保存"}：${data.quoteNumber} V${data.version}`);
  }
  async function edit(versionId) {
    const data=await api(`/api/vehicle-quotes/${versionId}`), quote=data.quotation, snap=quote.snapshot || {};
    current={seriesId:quote.series_id,sourceQuoteId:quote.source_quote_id || "",logistics:snap.logistics || null};
    items=(snap.items || []).map(x=>({id:`edit-${Math.random()}`,vehicleTypeId:x.vehicleType?.id || "",chassisId:x.chassis?.id || "",compatibilityId:x.compatibilityId || "",optionIds:(x.options || []).map(o=>o.id),attachmentIds:(x.attachments || []).map(o=>o.id),quantity:x.quantity || 1,manualUnitPrice:x.pricing?.manualUnitPrice ?? "",overrideReason:x.pricing?.overrideReason || "",specs:x.specs || {}}));
    const ids={"vq-company":snap.buyer?.company,"vq-contact":snap.buyer?.contact,"vq-phone":snap.buyer?.phone,"vq-email":snap.buyer?.email,"vq-address":snap.buyer?.address,"vq-country":snap.buyer?.country,"vq-destination-port":snap.buyer?.destinationPort,"vq-currency":snap.currency,"vq-date":snap.quoteDate,"vq-valid":snap.validUntil,"vq-document-type":snap.documentType,"vq-language":snap.language,"vq-payment":snap.terms?.payment,"vq-delivery":snap.terms?.delivery,"vq-origin-port":snap.terms?.originPort,"vq-term-destination-port":snap.terms?.destinationPort,"vq-after-sales":snap.terms?.afterSales,"vq-warranty":snap.terms?.warranty,"vq-terms":snap.terms?.text};
    Object.entries(ids).forEach(([id,val])=>{if($(id))$(id).value=val || ""}); $("vq-number").value=`${quote.quote_number} V${quote.version}`;
    for(const key of ["freight","tax","service","discount"]){if($(`vq-${key}`))$(`vq-${key}`).value=snap.feesInput?.[key]?.value || 0;if($(`vq-${key}-mode`))$(`vq-${key}-mode`).value=snap.feesInput?.[key]?.mode || "amount";}
    if ($("quote-customer")) $("quote-customer").value=quote.customer_id ? String(quote.customer_id) : "";
    const sharedIds={"buyer-company":snap.buyer?.company,"buyer-contact":snap.buyer?.contact,"buyer-phone":snap.buyer?.phone,"buyer-email":snap.buyer?.email,"buyer-address":snap.buyer?.address,"buyer-country":snap.buyer?.country,"quote-currency":snap.currency,"quote-date":snap.quoteDate,"valid-until":snap.validUntil,"document-type":snap.documentType === "proforma" ? "invoice" : snap.documentType,"pdf-language":snap.language,"quote-number":`${quote.quote_number} V${quote.version}`};
    Object.entries(sharedIds).forEach(([id,val])=>{if($(id))$(id).value=val || ""});
    window.quoteBusiness?.open?.("vehicle"); renderItems(); calculate();
    const termMap={payment:snap.terms?.payment,deliveryTime:snap.terms?.delivery,originPort:snap.terms?.originPort,port:snap.terms?.destinationPort,afterSales:snap.terms?.afterSales,warranty:snap.terms?.warranty,notes:snap.terms?.text};
    Object.entries(termMap).forEach(([key,val])=>{const input=document.querySelector(`#quote-terms [data-termfield="${key}"]`);if(input)input.value=val || "";});
    calculate();
  }
  async function copy(versionId) {
    await edit(versionId);
    current.seriesId="";
    current.sourceQuoteId=versionId;
    if ($("quote-number")) $("quote-number").value="";
    if ($("vq-number")) $("vq-number").value="";
    alert("已复制为新的新车报价草稿，修改客户、价格或运费后再保存。原报价不会被覆盖。");
  }
  async function printHistory(versionId) {
    await edit(versionId);
    await new Promise(resolve=>setTimeout(resolve,300));
    window.quoteApp?.printVehicleQuote?.();
  }
  function importLogistics(logistics) { current.logistics=logistics;if($("vq-freight"))$("vq-freight").value=Number(logistics?.freightAmount || 0);if($("vq-origin-port"))$("vq-origin-port").value=logistics?.originDisplayName || "";if($("vq-term-destination-port"))$("vq-term-destination-port").value=logistics?.destinationDisplayName || "";calculate(); }
  async function init() {
    if (initialized || !$("view-vehicle-quote")) return;
    await reloadCatalog(); await loadCustomers(); initialized=true;
    $("vq-fees").innerHTML=[["freight","运费"],["tax","税费"],["service","服务费"],["discount","折扣"]].map(([key,label])=>`<label><span>${label}</span><span class="fee-input"><select id="vq-${key}-mode"><option value="amount">固定金额</option><option value="percent">百分比 %</option></select><input id="vq-${key}" type="number" value="0"></span></label>`).join("");
    $("vq-add-item").onclick=()=>{items.push(blank());renderItems()}; $("vq-new-btn").onclick=()=>{reset();if(embedded())window.quoteBusiness?.newShared?.();}; $("vq-save-btn").onclick=()=>save(false).catch(e=>alert(e.message)); $("vq-formal-btn").onclick=()=>save(true).catch(e=>alert(e.message)); $("vq-preview-btn").onclick=calculate; $("vq-pdf-btn").onclick=()=>window.quoteApp?.printVehicleQuote?.();
    document.querySelectorAll("#view-vehicle-quote input,#view-vehicle-quote select,#view-vehicle-quote textarea").forEach(input=>input.addEventListener("input",calculate)); reset();
    document.querySelectorAll("#quote-common-panel input,#quote-common-panel select,#quote-standard-terms-panel input,#quote-standard-terms-panel select,#quote-standard-terms-panel textarea").forEach(input=>input.addEventListener("input",()=>{if(window.quoteBusiness?.active==="vehicle")calculate();}));
    const linkedVersion=new URLSearchParams(window.location.search).get("vehicleQuote");
    if(linkedVersion){await edit(linkedVersion);history.replaceState({},"","/");}
  }
  function importShared() { calculate(); }
  window.vehicleQuoteApp={init,reloadCatalog,importLogistics,importShared,edit,copy,printHistory};
  window.addEventListener("foreign-trade-auth-ready",()=>init().catch(console.error));
})();
