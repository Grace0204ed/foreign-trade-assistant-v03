(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    const context=window.quoteSettingsContext,host=document.getElementById('settings-data-host');if(!context||!host)return;
    // Option records remain shared and stable; maintenance belongs to the consuming setting.
    document.getElementById('option-catalog-manager')?.remove();
    // Superseded editors could bypass the stable-code and archival rules.
    ['currency-list','trade-term-list'].forEach(id=>{const old=document.getElementById(id)?.closest('.currency-manager');if(old)old.hidden=true;});
  }
  function mountSection(host,type,block){
    host.querySelector('[data-scoped-options]')?.remove();
    const sales=['quotation','invoice','contract','commercial'],keys=[];
    if(sales.includes(type)){
      if(block==='basic')keys.push('currencies');
      if(block==='items')keys.push('currencies','billingUnits','freightFeeNames');
      if(block==='terms')keys.push('tradeTerms','payment','paymentConditions','shippingMethods','containerTypes');
    }
    if(type==='packing'){
      if(block==='items')keys.push('billingUnits','dimensionUnits');
      if(block==='terms')keys.push('tradeTerms','shippingMethods','containerTypes');
    }
    if(type==='statement'){
      if(block==='items')keys.push('currencies');
      if(block==='terms')keys.push('cryptoNetworks');
    }
    const ports=block==='terms'&&[...sales,'packing'].includes(type);
    if(!keys.length&&!ports)return;
    const panel=document.createElement('section');panel.dataset.scopedOptions=type;panel.className='scoped-option-settings';
    panel.innerHTML='<h4>本板块选项设置</h4><div class="actions">'+keys.map(key=>`<button type="button" data-scoped-catalog="${key}">${esc(OptionCatalog.definitions[key][0])}</button>`).join('')+(ports?'<button type="button" data-scoped-ports>港口管理</button>':'')+'</div>';
    panel.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;e.stopPropagation();const context=window.quoteSettingsContext;if(button.dataset.scopedCatalog)edit(button.dataset.scopedCatalog,context);if(button.hasAttribute('data-scoped-ports'))editPorts(context).catch(error=>context.toast(error.message));});
    host.querySelector('[data-document-fields]')?.before(panel);
  }
  function edit(key,context){
    const original=OptionCatalog.ensure(context.settings)[key],persisted=new Set(original.map(r=>r.id));
    let rows=structuredClone(original).filter(r=>!r.deletedAt);
    const modal=document.createElement('div');modal.className='modal';modal.innerHTML=`<div class="modal-card dictionary-modal"><header><h3>${esc(OptionCatalog.definitions[key][0])}</h3><button type="button" data-close>关闭</button></header><p>一级→二级→三级；父项停用时下级不出现在新业务选择中。已保存代码不能改名，中文／英文名称可编辑。</p><div class="history-table-wrap"><table><thead><tr><th>排序</th><th>上级</th><th>中文名称</th><th>英文名称</th><th>内部代码</th><th>状态及操作</th></tr></thead><tbody></tbody></table></div><div class="actions"><button data-add>新增</button><button data-save class="primary">保存</button></div><p data-error role="alert"></p></div>`;document.body.append(modal);
    const draw=()=>{modal.querySelector('tbody').innerHTML=rows.map((r,i)=>r.deletedAt?'':`<tr data-row="${i}"><td><input type="number" data-key="sortOrder" value="${r.sortOrder}"><button data-up="${i}">↑</button><button data-down="${i}">↓</button></td><td><select data-key="parentId"><option value="">一级／无上级</option>${rows.filter(p=>p.id!==r.id&&!p.deletedAt).map(p=>`<option value="${esc(p.id)}" ${p.id===r.parentId?'selected':''}>${esc(p.labelZh||p.value)}</option>`).join('')}</select></td><td><input data-key="labelZh" value="${esc(r.labelZh)}"></td><td><input data-key="labelEn" value="${esc(r.labelEn)}"></td><td><input data-key="value" value="${esc(r.value)}" ${persisted.has(r.id)?'readonly':''}></td><td><button data-toggle="${i}">${r.active===false?'启用':'停用'}</button><button data-edit="${i}">编辑</button><button class="option-remove" data-delete="${i}" aria-label="删除选项" title="删除">⊗</button></td></tr>`).join('');};
    modal.oninput=e=>{const tr=e.target.closest('[data-row]'),prop=e.target.dataset.key;if(tr&&prop)rows[Number(tr.dataset.row)][prop]=prop==='sortOrder'?Number(e.target.value):e.target.value;};
    modal.onclick=async e=>{
      const b=e.target;try{
        if(b.matches('[data-close]'))return modal.remove();
        if(b.dataset.edit!=null){const input=modal.querySelector(`[data-row="${b.dataset.edit}"] [data-key="labelZh"]`);input?.focus();input?.select();return;}
        if(b.matches('[data-add]')){rows.push({id:crypto.randomUUID(),value:'',labelZh:'新选项',labelEn:'New option',active:true,parentId:'',sortOrder:(rows.length+1)*10});return draw();}
        if(b.dataset.toggle!=null){const r=rows[Number(b.dataset.toggle)];r.active=r.active===false;return draw();}
        if(b.dataset.delete!=null){const r=rows[Number(b.dataset.delete)];if(rows.some(p=>p.parentId===r.id&&!p.deletedAt))throw Error('请先移动或处理下级选项');if(!confirm('安全删除此选项？已保存的代码将归档停用，历史数据保持原值。'))return;if(persisted.has(r.id)){r.active=false;r.deletedAt=new Date().toISOString();}else rows=rows.filter(p=>p!==r);draw();return;}
        if(b.dataset.up!=null||b.dataset.down!=null){const i=Number(b.dataset.up??b.dataset.down),j=i+(b.dataset.up!=null?-1:1);if(j>=0&&j<rows.length)[rows[i],rows[j]]=[rows[j],rows[i]];rows.forEach((r,n)=>r.sortOrder=(n+1)*10);return draw();}
        if(b.matches('[data-save]')){OptionCatalog.validate(rows,key);const catalog=structuredClone(OptionCatalog.ensure(context.settings));catalog[key]=rows;const next=OptionCatalog.reconcile({...context.settings,optionCatalog:catalog},structuredClone(context.settings));await context.save({optionCatalog:next.optionCatalog,currencies:next.currencies,tradeTerms:next.tradeTerms,categories:next.categories,currency:next.currency});modal.remove();context.toast('选项已保存并同步到业务下拉框');mount();}
      }catch(error){modal.querySelector('[data-error]').textContent=error.message;}
    };draw();
  }
  async function editPorts(context){
    const api=async(url,options)=>{const response=await fetch(url,options),data=await response.json();if(!response.ok)throw Error(data.zh||data.message);return data;};
    const rows=(await api('/api/ports?includeInactive=true')).ports;
    const modal=document.createElement('div');modal.className='modal';modal.innerHTML='<div class="modal-card dictionary-modal"><header><h3>港口管理</h3><button data-close>关闭</button></header><p>复用现有港口数据；安全删除会停用，保留历史引用。</p><div class="history-table-wrap"><table><thead><tr><th>排序</th><th>国家英文</th><th>国家中文</th><th>港口英文</th><th>港口中文</th><th>起运港</th><th>目的港</th><th>状态</th><th>操作</th></tr></thead><tbody></tbody></table></div><button data-add>新增港口</button><p data-error role="alert"></p></div>';document.body.append(modal);
    const draw=()=>{modal.querySelector('tbody').innerHTML=rows.map((r,i)=>r.deletedAt?'':`<tr data-row="${i}">${['sortOrder','countryName','countryChineseName','portName','portChineseName'].map(key=>`<td><input data-key="${key}" ${key==='sortOrder'?'type="number"':''} value="${esc(r[key]??'')}"></td>`).join('')}<td><input type="checkbox" data-key="isOriginPort" ${r.isOriginPort?'checked':''}></td><td><input type="checkbox" data-key="isDestinationPort" ${r.isDestinationPort?'checked':''}></td><td><select data-key="status"><option value="Active">启用</option><option value="Inactive" ${r.status==='Inactive'?'selected':''}>停用</option></select></td><td><button data-save-port="${i}">保存</button><button data-delete-port="${i}">安全删除</button></td></tr>`).join('');};
    modal.oninput=e=>{const tr=e.target.closest('[data-row]'),key=e.target.dataset.key;if(tr&&key)rows[tr.dataset.row][key]=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?Number(e.target.value):e.target.value;};
    modal.onclick=async e=>{try{if(e.target.matches('[data-close]'))return modal.remove();if(e.target.matches('[data-add]')){rows.unshift({countryName:'',portName:'',isOriginPort:false,isDestinationPort:true,status:'Active',sortOrder:0});return draw();}const index=e.target.dataset.savePort??e.target.dataset.deletePort;if(index==null)return;const row=rows[index];if(e.target.dataset.deletePort!=null){if(!confirm('停用此港口并保留历史引用？'))return;row.status='Inactive';}if(!row.countryName.trim()||!row.portName.trim())throw Error('请填写国家和港口英文名称');const result=await api('/api/ports'+(row.id?'/'+encodeURIComponent(row.id):''),{method:row.id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)});Object.assign(row,result.port);await window.freightContext.loadServerData();context.refreshOptions();draw();context.toast('港口已保存并同步');}catch(error){modal.querySelector('[data-error]').textContent=error.message;}};draw();
  }
  window.OptionManager={mount,mountSection,edit};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount));else setTimeout(mount);
})();
