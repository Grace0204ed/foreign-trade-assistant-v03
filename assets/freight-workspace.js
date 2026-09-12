/* Freight presentation settings are stored with shared company settings. */
(() => {
  const $ = id => document.getElementById(id);
  const ctx = () => window.freightContext;
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g,'');
  const uid = () => crypto.randomUUID();
  const labels = {common:'常用港口',calculator:'计算运费',fees:'附加费用明细',volumes:'常用货物体积',country:'客户目的国',model:'货物型号',origin:'起运港 / 起运地',destination:'目的港 / 口岸 / 站点',method:'运输方式',billing:'计费方式',container:'柜型',containers:'集装箱数量（柜）',quantity:'货物数量（台）',volume:'运输体积（m³）',weight:'运输重量（吨）',rate:'运费单价',currency:'币种',amount:'海运费总额'};
  const fields={country:'calc-country',model:'calc-product-search',origin:'calc-origin',destination:'calc-destination',method:'calc-method',billing:'calc-billing-mode',container:'calc-container-type',containers:'calc-container-count',quantity:'calc-qty',volume:'calc-cbm',weight:'calc-weight',rate:'calc-rate',currency:'calc-currency',amount:'calc-amount'};
  let draft, preview=[], selectedGroup='', selectedCountry='', activeDescription=null;
  function defaults() {
    const groups = ['非洲','南美洲'].map(name=>({id:uid(),name,countries:[]}));
    for(const p of ctx().ports) {
      const region=ctx().portRegion(p), group=groups.find(g=>region.includes(g.name));
      if(!group) continue;
      let country=group.countries.find(c=>c.match===p.countryName);
      if(!country) {country={id:uid(),name:p.countryChineseName||p.countryName,match:p.countryName,ports:[]};group.countries.push(country);}
      country.ports.push(p.id);
    }
    const africa=groups[0];
    if(!africa.countries.some(c=>c.match==='Zimbabwe')) africa.countries.push({id:uid(),name:'津巴布韦',match:'Zimbabwe',ports:['port-beira','port-durban','port-dar']});
    if(!africa.countries.some(c=>c.match==='Ethiopia')) africa.countries.push({id:uid(),name:'埃塞俄比亚',match:'Ethiopia',ports:['port-djibouti']});
    if(!groups[1].countries.some(c=>c.match==='Bolivia')) groups[1].countries.push({id:uid(),name:'玻利维亚',match:'Bolivia',ports:[]});
    return {labels:{...labels},groups,routes:['port-durban','port-lagos-apapa','port-beira'].map(destination=>({id:uid(),origin:'port-shanghai',destination,visible:true,title:''}))};
  }
  let initial, initialPortCount = -1;
  function config(){
    if(ctx().settings.freightWorkspace) return ctx().settings.freightWorkspace;
    if(!initial || initialPortCount !== ctx().ports.length){initial=defaults();initialPortCount=ctx().ports.length;}
    return initial;
  }
  function portLabel(id){const p=ctx().ports.find(p=>p.id===id);return p?`${p.countryChineseName||p.countryName} · ${p.portChineseName||p.portName}`:'港口已停用或不存在';}
  function options(value){return '<option value="">请选择</option>'+ctx().ports.map(p=>`<option value="${esc(p.id)}" ${p.id===value?'selected':''}>${esc(portLabel(p.id))}</option>`).join('');}
  function render() {
    const c=config(), names={...labels,...c.labels};
    for(const [k,selector] of Object.entries({common:'.freight-common-panel h3',calculator:'.freight-calculator-panel h3',fees:'.freight-calculator-panel h4',volumes:'.freight-volume-panel h3'})) {const h=document.querySelector(selector);if(h)h.textContent=names[k];}
    for(const [k,id] of Object.entries(fields)){const label=$(id)?.closest('label')?.querySelector('span');if(label)label.textContent=names[k];}
    if($('common-freight-routes')) $('common-freight-routes').innerHTML=c.routes.filter(r=>r.visible).map(r=>`<button type="button" class="freight-route-card" data-work-route="${esc(r.id)}"><b>${esc(r.title||`${portLabel(r.origin)} → ${portLabel(r.destination)}`)}</b><span>${esc(rateSummary(r))}</span></button>`).join('') || '<p class="hint">可在运费设置中添加常用航线。</p>';
    renderCountries();
  }
  function rateSummary(route){
    const rows=ctx().rates.filter(r=>r.originPortId===route.origin&&r.destinationPortId===route.destination).sort((a,b)=>String(b.quoteDate||b.effectiveMonth).localeCompare(String(a.quoteDate||a.effectiveMonth)));
    const seen=new Set();return rows.filter(r=>{const k=[r.shippingMethod,r.containerType,r.billingMode,r.freightForwarder].join('|');if(seen.has(k))return false;seen.add(k);return true;}).slice(0,3).map(r=>`${r.containerType||({'Bulk Cargo':'散杂',RORO:'滚装','Flat Rack':'框架'}[r.shippingMethod]||r.shippingMethod)} ${r.rateStatus==='pending'?'待询价':`${r.currency} ${r.rate}/${{cbm:'m³',ton:'吨',unit:'台',container:'柜',fixed:'批'}[r.billingMode]||'项'}`}${r.validUntil&&r.validUntil<new Date().toISOString().slice(0,10)?'（已过期）':''}`).join('；')||'待询价';
  }
  function renderCountries(){
    const c=config(), host=$('calc-country-routes');if(!host)return;
    const q=key($('calc-country')?.value);
    const countries=c.groups.flatMap(g=>g.countries);
    const matched=countries.filter(n=>q&&(key(n.name)===q||key(n.match)===q||key(`${n.match}/${n.name}`)===q));
    host.innerHTML=`<div class="market-groups">${c.groups.map(g=>`<button type="button" data-market-group="${esc(g.id)}" class="${g.id===selectedGroup?'primary':''}">${esc(g.name)}</button>`).join('')}</div>`;
    const group=c.groups.find(g=>g.id===selectedGroup);
    if(group)host.insertAdjacentHTML('beforeend',`<div class="market-countries">${group.countries.map(n=>`<button type="button" data-market-country="${esc(n.id)}">${esc(n.name)}</button>`).join('')||'<span>该分组尚未添加国家。</span>'}</div>`);
    const selected=matched[0] || countries.find(n=>n.id===selectedCountry&&q===key(n.name));
    if(!selected){if(q)host.insertAdjacentHTML('beforeend','<p class="hint">请从分组选择已维护的国家，或继续手动输入目的港。</p>');return;}
    const ids=[...new Set(selected.ports)];
    host.insertAdjacentHTML('beforeend',`<div class="market-port-options">${ids.map(id=>`<button type="button" data-market-port="${esc(id)}">${esc(portLabel(id))}</button>`).join('')||'<p>暂无关联港口，请在运费设置中添加。</p>'}</div><small>选择港口后显示该路线运价；内陆国家可使用邻国港口。</small>`);
  }
  function usePort(destination,origin){
    if(origin)ctx().setPortInputValue('calc-origin',origin);
    if(!$('calc-origin').value)ctx().setPortInputValue('calc-origin','port-shanghai');
    ctx().setPortInputValue('calc-destination',destination);
    $('calc-rate').value='';$('calc-amount').value='';
    const originId=ctx().ports.find(p=>ctx().portOptionLabel(p)===$('calc-origin').value)?.id;
    const rows=ctx().rates.filter(r=>r.destinationPortId===destination&&r.originPortId===originId).sort((a,b)=>String(b.quoteDate||b.effectiveMonth).localeCompare(String(a.quoteDate||a.effectiveMonth)));
    let host=$('calc-rate-choices');if(!host){host=document.createElement('div');host.id='calc-rate-choices';host.className='wide market-port-options';$('calc-country-routes').after(host);}
    host.innerHTML=rows.map(r=>`<button type="button" data-market-rate="${esc(r.id)}">${esc(r.freightForwarder||'未填写货代')} · ${esc(r.containerType||r.shippingMethod)} · ${esc(r.currency)} ${r.rateStatus==='pending'?'待询价':esc(r.rate)} / ${esc(r.billingMode)} ${r.validUntil&&r.validUntil<new Date().toISOString().slice(0,10)?'已过期':''}</button>`).join('')||'<p>此路线暂无运价，可手动输入本次报价。</p>';
  }
  function renderSettings(){
    if(!$('settings-freight-host'))return;
    draft=structuredClone(config());
    let host=$('freight-config-editor');if(!host){host=document.createElement('div');host.id='freight-config-editor';host.className='panel';$('settings-freight-host').prepend(host);}
    host.innerHTML=`<h3>运费页面设置</h3><p>修改标题、常用航线和地区国家。完成后点击“保存运费设置”。移除地区或国家不会删除历史报价。</p><details><summary>板块标题与字段名称</summary><div class="form-grid">${Object.entries(labels).map(([k,v])=>`<label><span>${esc(v)}</span><input data-freight-label="${k}" value="${esc(draft.labels[k]??v)}"></label>`).join('')}</div></details><h4>常用航线</h4><div id="freight-config-routes"></div><button type="button" data-config-action="route-add">＋ 添加常用航线</button><h4>地区与国家（一级 / 二级分类）</h4><div id="freight-config-groups"></div><button type="button" data-config-action="group-add">＋ 新增一级分组</button><div class="actions"><button type="button" class="primary" data-config-action="save">保存运费设置</button><button type="button" data-config-action="cancel">取消修改</button></div><p id="freight-config-status" role="status"></p>`;
    renderDraft();
  }
  function renderDraft(){
    $('freight-config-routes').innerHTML=draft.routes.map((r,i)=>`<div class="config-route" data-route-index="${i}"><label>显示名称（留空自动生成）<input data-route-prop="title" value="${esc(r.title)}"></label><label>起运港<select data-route-prop="origin">${options(r.origin)}</select></label><label>目的港<select data-route-prop="destination">${options(r.destination)}</select></label><label><input type="checkbox" data-route-prop="visible" ${r.visible?'checked':''}>显示</label><button type="button" data-config-action="route-remove" data-index="${i}">删除</button></div>`).join('');
    $('freight-config-groups').innerHTML=draft.groups.map((g,i)=>`<details data-group-index="${i}"><summary>${esc(g.name)}（${g.countries.length} 个国家）</summary><div class="actions"><label>一级分组名称<input data-group-name value="${esc(g.name)}"></label><button type="button" data-config-action="country-add" data-index="${i}">添加国家</button><button type="button" data-config-action="group-remove" data-index="${i}">删除整个分组</button></div>${g.countries.map((n,j)=>`<details data-country-index="${j}"><summary>${esc(n.name)}</summary><div class="form-grid"><label>国家显示名称<input data-country-prop="name" value="${esc(n.name)}"></label><label>英文名称 / 搜索别名<input data-country-prop="match" value="${esc(n.match)}"></label></div><p>关联本国或邻国港口：</p>${n.ports.map((id,k)=>`<div class="actions"><select data-country-port="${k}">${options(id)}</select><button type="button" data-config-action="port-remove" data-index="${k}">移除港口</button></div>`).join('')}<button type="button" data-config-action="port-add">＋ 添加关联港口</button><button type="button" data-config-action="country-remove">删除国家</button></details>`).join('')}</details>`).join('');
  }
  async function configAction(e){
    const b=e.target.closest('[data-config-action]');if(!b)return;
    const action=b.dataset.configAction,i=Number(b.dataset.index),g=draft.groups[Number(b.closest('[data-group-index]')?.dataset.groupIndex)], n=g?.countries[Number(b.closest('[data-country-index]')?.dataset.countryIndex)];
    if(action==='save'){
      if(draft.groups.some(g=>!g.name.trim()||g.countries.some(n=>!n.name.trim()||n.ports.some(p=>!p)))||draft.routes.some(r=>!r.origin||!r.destination))return ctx().toast('请填写分组、国家名称和关联港口。');
      b.disabled=true;try{await ctx().saveConfig(structuredClone(draft));render();$('freight-config-status').textContent='已保存，运费查询页面已更新。';}catch(err){$('freight-config-status').textContent=`保存失败：${err.message}`;}finally{b.disabled=false;}return;
    }
    if(action==='cancel')return renderSettings();
    if(action==='route-add')draft.routes.push({id:uid(),title:'',origin:'port-shanghai',destination:'',visible:true});
    if(action==='route-remove')draft.routes.splice(i,1);
    if(action==='group-add')draft.groups.push({id:uid(),name:'新分组',countries:[]});
    if(action==='group-remove'){if(!confirm('删除此分组及其国家入口？保存后生效，历史报价和运价仍保留。'))return;draft.groups.splice(i,1);}
    if(action==='country-add')draft.groups[i].countries.push({id:uid(),name:'新国家',match:'',ports:[]});
    if(action==='country-remove'){if(!confirm('移除此国家入口？'))return;g.countries.splice(g.countries.indexOf(n),1);}
    if(action==='port-add')n.ports.push('');
    if(action==='port-remove')n.ports.splice(i,1);
    const opened=[...$('freight-config-groups').querySelectorAll('details[open]')].map(d=>d.hasAttribute('data-country-index')?`[data-group-index="${d.closest('[data-group-index]').dataset.groupIndex}"] [data-country-index="${d.dataset.countryIndex}"]`:`[data-group-index="${d.dataset.groupIndex}"]`);
    renderDraft();opened.forEach(s=>{const el=$('freight-config-groups').querySelector(s);if(el)el.open=true;});
  }
  function configInput(e){
    const el=e.target,g=draft?.groups[Number(el.closest('[data-group-index]')?.dataset.groupIndex)],n=g?.countries[Number(el.closest('[data-country-index]')?.dataset.countryIndex)];
    if(el.dataset.freightLabel)draft.labels[el.dataset.freightLabel]=el.value;
    if(el.hasAttribute('data-group-name'))g.name=el.value;
    if(el.dataset.countryProp)n[el.dataset.countryProp]=el.value;
    if(el.hasAttribute('data-country-port'))n.ports[Number(el.dataset.countryPort)]=el.value;
    if(el.dataset.routeProp)draft.routes[Number(el.closest('[data-route-index]').dataset.routeIndex)][el.dataset.routeProp]=el.type==='checkbox'?el.checked:el.value;
  }
  const template='货代|报价日期|有效期|客户目的国|起运港|卸货国家|目的港|运输方式|柜型|币种|单价|计费单位|包含费用|不含费用\n示例货代|2026-09-01|2026-09-30|津巴布韦|上海港|莫桑比克|贝拉港|散杂||USD|85|m³|海运费、港杂|保险、内陆转运\n示例货代|2026-09-01|2026-09-30|南非|上海港|南非|德班港|集装箱|40HQ|USD|5600|柜|海运费|保险';
  function findPort(text){const q=key(text);const exact=ctx().ports.filter(p=>[p.portName,p.portChineseName,p.unLocode].some(s=>key(s)===q));if(exact.length===1)return exact[0];const matches=ctx().ports.filter(p=>q&&[p.portName,p.portChineseName,...String(p.aliases||'').split(/[,，]/)].some(s=>key(s)===q));return matches.length===1?matches[0]:null;}
  function previewText(){
    const text=$('freight-text-import-input').value.trim();preview=[];
    for(const [index,line] of text.split(/\r?\n/).entries()){
      if(!line.trim()||/^货代[|\t]/.test(line))continue;
      const [agent,date,until,country,origin,discharge,destination,method,container,currency,price,unit,included,excluded]=line.split(/\||\t/).map(s=>s.trim());
      const o=findPort(origin),d=findPort(destination),mode=({'m³':'cbm','m3':'cbm','方':'cbm','立方':'cbm','吨':'ton','台':'unit','柜':'container'})[unit],ship=({'散杂':'Bulk Cargo','滚装':'RORO','框架':'Flat Rack','集装箱':'Container'})[method];
      const errors=[];if(!agent||!country||!discharge)errors.push('货代/客户国/卸货国不能为空');if(!o||!d)errors.push('港口无法唯一匹配，请先在设置维护');if(!ship||!mode)errors.push('运输方式或计费单位无效');if(ship==='Container'&&(!['20GP','40GP','40HQ','20FR','40FR'].includes(container)||mode!=='container'))errors.push('集装箱需要柜型并按柜计费');if(!/^\d{4}-\d{2}-\d{2}$/.test(date||'')||!/^\d{4}-\d{2}-\d{2}$/.test(until||'')||until<date)errors.push('日期或有效期错误');if(!['USD','CNY','EUR','GBP'].includes(currency))errors.push('币种错误');if(price!==''&&price!=='待询价'&&(!Number.isFinite(Number(price))||Number(price)<=0))errors.push('单价应为正数或待询价');
      const data={originPortId:o?.id,destinationPortId:d?.id,shippingMethod:ship,billingMode:mode,containerType:container||'',currency,rate:price===''||price==='待询价'?null:Number(price),rateStatus:price===''||price==='待询价'?'pending':'quoted',effectiveMonth:date?.slice(0,7),quoteDate:date,validUntil:until,freightForwarder:agent,includedFees:(included||'').split(/[、,，]/).filter(Boolean),excludedFees:(excluded||'').split(/[、,，]/).filter(Boolean),rateUnit:`${currency}/${unit}`};
      if(d && ![d.countryName,d.countryChineseName].some(name=>key(name)===key(discharge)))errors.push('卸货国家与目的港不一致');
      if([date,until].some(value=>{const parsed=new Date(value);return !Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==value;}))errors.push('日期不是有效日历日期');
      if(ship!=='Container' && container)errors.push('非集装箱运价请留空柜型');
      const same=r=>r.originPortId===data.originPortId&&r.destinationPortId===data.destinationPortId&&r.shippingMethod===ship&&r.containerType===data.containerType&&r.billingMode===mode&&r.freightForwarder===agent&&r.effectiveMonth===data.effectiveMonth&&r.currency===currency;
      const old=ctx().rates.filter(same);if(old.length>1)errors.push('库中存在多条重复记录，请先整理');if(preview.some(p=>same(p.data)))errors.push('本次文本重复路线/月份/货代');
      preview.push({line:index+1,data,old:old[0],country,errors,done:false});
    }
    $('freight-text-preview').innerHTML='<table class="history-table"><thead><tr><th>行</th><th>路线 / 客户国</th><th>运价</th><th>操作 / 问题</th></tr></thead><tbody>'+preview.map(r=>`<tr><td>${r.line}</td><td>${esc(portLabel(r.data.originPortId))} → ${esc(portLabel(r.data.destinationPortId))}<br>${esc(r.country)}</td><td>${esc(r.data.currency)} ${r.data.rate??'待询价'} / ${esc(r.data.billingMode)}</td><td>${esc(r.errors.join('；')||(r.old?`更新：原价 ${r.old.rate} → ${r.data.rate??'待询价'}`:'新增'))}</td></tr>`).join('')+'</tbody></table>';
    $('confirm-freight-text-btn').hidden=!preview.length||preview.some(r=>r.errors.length);$('freight-text-import-status').textContent=preview.some(r=>r.errors.length)?'请修正问题后重新识别。':'请核对匹配结果，再确认保存。';
  }
  async function commitText(){const button=$('confirm-freight-text-btn');button.disabled=true;try{for(const row of preview.filter(r=>!r.done)){if(row.errors.length)throw new Error('请先修正识别问题');await ctx().api(row.old?`/api/freight-rates/${row.old.id}`:'/api/freight-rates',{method:row.old?'PUT':'POST',body:JSON.stringify(row.data)});row.done=true;}await ctx().loadServerData();button.hidden=true;$('freight-text-import-status').textContent=`已保存 ${preview.length} 条运价。不同客户国家共用同一港口运价。`;}catch(e){$('freight-text-import-status').textContent=`${preview.filter(r=>r.done).length} 条已保存，其余未完成：${e.message}`;}finally{button.disabled=false;}}
  function historySuggestions(input){
    activeDescription=input;let box=$('quote-description-suggestions');if(!box){box=document.createElement('div');box.id='quote-description-suggestions';box.className='quote-history-suggestions';document.body.appendChild(box);}
    const words=input.value.toLowerCase().replace(/[\/，,]/g,' ').split(/\s+/).filter(Boolean), map=new Map();
    ctx().quotes.forEach(q=>(q.items||[]).filter(i=>(i.kind||'product')==='product').forEach(i=>{const v=i.values||{},text=v.description||[v.brand,v.model].filter(Boolean).join(' ');if(text&&!map.has(text))map.set(text,{text,condition:v.condition});}));
    ctx().products.forEach(p=>{const text=[p.condition,p.brand,p.model].filter(Boolean).join(' ');if(text&&!map.has(text))map.set(text,{text,condition:p.condition});});
    const matches=[...map.values()].filter(r=>words.length&&words.every(w=>key(r.text).includes(key(w)))).slice(0,10);
    box.innerHTML=matches.map(r=>`<button type="button" data-history-description="${esc(r.text)}" data-condition="${esc(r.condition||'')}">${esc(r.text)}</button>`).join('');box.hidden=!matches.length;
    const rect=input.getBoundingClientRect();Object.assign(box.style,{left:`${rect.left}px`,top:`${rect.bottom+3}px`,width:`${Math.max(rect.width,300)}px`});
  }
  function init(){
    const h=$('settings-freight-host');if(!h)return;
    for(const [selector,title] of [['.country-route-panel','其他国家路线资料（兼容旧版）'],['.freight-port-admin','港口资料库：新增或修改港口'],['.freight-rate-admin','运价资料库：维护货代报价']]){
      const panel=h.querySelector(selector);if(!panel)continue;
      const section=document.createElement('details'),summary=document.createElement('summary');
      section.className='freight-maintenance-section';summary.textContent=title;
      panel.before(section);section.append(summary,panel);
    }
    h.addEventListener('input',configInput);h.addEventListener('change',configInput);h.addEventListener('click',configAction);
    const shortcut=document.createElement('button');shortcut.type='button';shortcut.className='admin-only';shortcut.textContent='国家、港口与运费设置';shortcut.onclick=()=>ctx().openSettingsSection('freight-settings');document.querySelector('#view-freight .page-head').appendChild(shortcut);
    const commonHint=document.querySelector('.freight-common-panel .hint');if(commonHint)commonHint.textContent='点击常用航线带入起运港和目的港，可在设置中维护显示内容。';
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.marketGroup){selectedGroup=selectedGroup===b.dataset.marketGroup?'':b.dataset.marketGroup;renderCountries();}
      if(b.dataset.marketCountry){const c=config().groups.flatMap(g=>g.countries).find(n=>n.id===b.dataset.marketCountry);selectedCountry=c.id;$('calc-country').value=c.name;renderCountries();}
      if(b.dataset.marketPort)usePort(b.dataset.marketPort);
      if(b.dataset.workRoute){const r=config().routes.find(r=>r.id===b.dataset.workRoute);usePort(r.destination,r.origin);}
      if(b.dataset.marketRate){const r=ctx().rates.find(r=>r.id===b.dataset.marketRate);$('calc-method').value=r.shippingMethod;$('calc-container-type').value=r.containerType||'';$('calc-billing-mode').value=r.billingMode;$('calc-rate').value=r.rateStatus==='pending'?'':r.rate;$('calc-currency').value=r.currency;}
    });
    $('calc-country').addEventListener('input',renderCountries);
    $('copy-freight-text-template-btn').onclick=async()=>{try{await navigator.clipboard.writeText(template);ctx().toast('填写模板已复制，可发送给货代。');}catch{$('freight-text-import-input').value=template;ctx().toast('模板已放入文本框，请选中复制。');}};
    const note=document.createElement('details');note.innerHTML=`<summary>查看货代填写格式</summary><pre class="freight-template">${esc(template)}</pre><p>每行一种运输方式，字段用 | 分隔，日期格式为 YYYY-MM-DD。示例金额仅作格式说明。新月份新增记录，同月份同货代同路线更新；无法匹配的港口须先维护。</p>`;document.querySelector('.freight-text-import h3').closest('.row-head').after(note);
    $('preview-freight-text-btn').onclick=previewText;$('confirm-freight-text-btn').onclick=commitText;
    $('freight-text-import-input').addEventListener('input',()=>{$('confirm-freight-text-btn').hidden=true;preview=[];});
    $('quote-items').addEventListener('input',e=>{if(e.target.matches('[data-qfield="description"]')&&!e.isComposing)historySuggestions(e.target);});
    document.addEventListener('mousedown',e=>{const b=e.target.closest('[data-history-description]');if(b&&activeDescription){e.preventDefault();activeDescription.value=b.dataset.historyDescription;activeDescription.dispatchEvent(new Event('input',{bubbles:true}));$('quote-description-suggestions').hidden=true;}else if(!e.target.matches('[data-qfield="description"]')){if($('quote-description-suggestions'))$('quote-description-suggestions').hidden=true;}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('quote-description-suggestions'))$('quote-description-suggestions').hidden=true;});
    window.addEventListener('scroll',()=>{if($('quote-description-suggestions'))$('quote-description-suggestions').hidden=true;},true);
    render();
  }
  window.freightWorkspace={init,render,renderSettings,renderCountries};
})();
