(() => {
 'use strict';
 const esc=DocumentWorkflow.escape,names={zh:'中文',...DocumentLocales.languages},types={quotation:'报价单',invoice:'形式发票',contract:'销售合同',commercial:'商业发票',packing:'装箱单',invitation:'邀请函',authorization:'授权书',statement:'佣金结算单'};
 const rows=s=>Object.keys(names).map((code,i)=>({code,enabled:true,sortOrder:i*10,...s.languageSettings?.languages?.find(n=>n.code===code)})).sort((a,b)=>a.sortOrder-b.sortOrder);
 function choices(s,current){const out=rows(s).filter(n=>n.enabled!==false).map(n=>({value:n.code,label:names[n.code]})),enabled=new Set(out.map(r=>r.value));if(enabled.has('zh'))for(const [value,label,foreign] of [['bilingual','中英双语','en'],['zh-fr','中法双语','fr'],['zh-es','中西双语','es']])if(enabled.has(foreign))out.push({value,label});if(current&&!out.some(r=>r.value===current)&&DocumentLocales.supported.has(current))out.push({value:current,label:(names[current]||current)+'（本单证已选，当前关闭）'});return out;}
 const preference=(s,type)=>({...s.documentPreferences?.defaults,...s.documentPreferences?.overrides?.[type]});
 function defaultLanguage(s,type){const values=choices(s).map(r=>r.value),candidate=preference(s,type).language||s.languageSettings?.defaultLanguage||(type==='invitation'?'zh':'bilingual');return values.includes(candidate)?candidate:values[0]||'zh';}
 function sync(){const c=window.quoteSettingsContext;if(!c)return;for(const id of ['pdf-language','invitation-language','agency-language']){const input=document.getElementById(id);if(!input)continue;const value=input.value;input.innerHTML=choices(c.settings,value).map(r=>`<option value="${esc(r.value)}">${esc(r.label)}</option>`).join('');input.value=value||c.settings.languageSettings?.defaultLanguage||'zh';}}
 let languageOrderSaveQueue=Promise.resolve();
 function mount(){
  const c=window.quoteSettingsContext,host=document.getElementById('settings-translation-host');if(!c||!host)return;document.querySelector('[data-settings-section=translation]').textContent='顶部设置';
  let scope='all',type='quotation',region='product',tab='language',languages=rows(c.settings),drafts={};
  const regions={title:'标题',tableHeader:'表头',product:'商品信息',body:'正文',notes:'条款与备注',footer:'页脚与落款'};
  const regionDefaults={title:{fontSize:24,fontWeight:700},tableHeader:{fontSize:12,fontWeight:700},product:{fontSize:12,fontWeight:700},body:{fontSize:12,fontWeight:400},notes:{fontSize:12,fontWeight:400},footer:{fontSize:11,fontWeight:400}};
  const selected=()=>drafts[scope==='all'?'all':type]||=structuredClone(scope==='all'?c.settings.documentPreferences?.defaults||{}:preference(c.settings,type));
  let orderRevision=0,orderStatus='',orderFailed=false,lastOrder=languages.map(row=>row.code),cancelDrag=()=>{};
  host.__cancelLanguageOrderDrag?.();
  host.__cancelLanguageOrderDrag=()=>cancelDrag();
  function showOrderStatus(){
   const status=host.querySelector('[data-language-order-status]'),retry=host.querySelector('[data-language-order-retry]');
   if(status)status.textContent=orderStatus;
   if(retry)retry.hidden=!orderFailed;
  }
  function persistLanguageOrder(order){
   const revision=++orderRevision;lastOrder=order.slice();orderStatus='正在自动保存语言顺序…';orderFailed=false;showOrderStatus();
   languageOrderSaveQueue=languageOrderSaveQueue.catch(()=>{}).then(async()=>{
    // Only reorder records from the latest saved settings. Local enable/style
    // drafts stay in the editor until its existing Save button is used.
    const savedSettings=c.settings.languageSettings||{},savedRows=rows(c.settings),byCode=new Map(savedRows.map(row=>[row.code,row]));
    const codes=[...new Set(order.filter(code=>byCode.has(code)))];for(const row of savedRows)if(!codes.includes(row.code))codes.push(row.code);
    const reordered=codes.map((code,index)=>({...byCode.get(code),sortOrder:index*10}));
    await c.save({languageSettings:{...savedSettings,languages:reordered}});
    sync();
    if(revision===orderRevision){orderStatus='语言顺序已自动保存，重新打开和重启后保持。';orderFailed=false;showOrderStatus();}
   }).catch(error=>{if(revision===orderRevision){orderStatus='语言顺序保存失败：'+error.message;orderFailed=true;showOrderStatus();}});
   return languageOrderSaveQueue;
  }
  function bindLanguageOrder(){
   cancelDrag();
   const list=host.querySelector('.top-language-list');if(!list)return;
   const entries=()=>[...list.querySelectorAll('[data-language-code]')];
   const animatePositions=(before,source)=>{for(const row of entries()){if(row===source)continue;const old=before.get(row),next=row.getBoundingClientRect();if(old&&(old.x!==next.x||old.y!==next.y)&&row.animate)row.animate([{transform:'translate('+(old.x-next.x)+'px,'+(old.y-next.y)+'px)'},{transform:'translate(0,0)'}],{duration:160,easing:'ease-out'});}};
   list.onpointerdown=event=>{
    const source=event.target.closest('[data-language-code]');
    if(!source||event.button!==0||event.target.closest('button,input,select'))return;
    event.preventDefault();
    const original=entries().map(row=>row.dataset.languageCode),startX=event.clientX,startY=event.clientY,pointerId=event.pointerId;
    let active=false,ghost=null;
    function cleanup(){document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',up,true);document.removeEventListener('pointercancel',abort,true);document.removeEventListener('keydown',escape,true);ghost?.remove();source.classList.remove('is-language-dragging');source.removeAttribute('aria-grabbed');document.body.classList.remove('language-order-dragging');}
    function restore(){const before=new Map(entries().map(row=>[row,row.getBoundingClientRect()]));for(const code of original){const row=entries().find(item=>item.dataset.languageCode===code);if(row)list.append(row);}animatePositions(before,source);}
    function finish(commit){
     cleanup();cancelDrag=()=>{};
     if(!active)return;
     if(!commit){restore();return;}
     const next=entries().map(row=>row.dataset.languageCode);languages.sort((a,b)=>next.indexOf(a.code)-next.indexOf(b.code));languages.forEach((row,index)=>row.sortOrder=index*10);
     if(next.some((code,index)=>code!==original[index]))persistLanguageOrder(next);
    }
    function move(e){
     if(e.pointerId!==pointerId)return;
     if(!active&&Math.hypot(e.clientX-startX,e.clientY-startY)<5)return;
     e.preventDefault();
     if(!active){active=true;const rect=source.getBoundingClientRect();ghost=source.cloneNode(true);ghost.removeAttribute('data-language-code');ghost.classList.add('language-order-ghost');ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';document.body.append(ghost);source.classList.add('is-language-dragging');source.setAttribute('aria-grabbed','true');document.body.classList.add('language-order-dragging');}
     ghost.style.left=(e.clientX+12)+'px';ghost.style.top=(e.clientY+12)+'px';
     const bounds=list.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)return;
     const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-language-code]');if(!target||target===source||!list.contains(target))return;
     const current=entries(),before=new Map(current.map(row=>[row,row.getBoundingClientRect()]));list.insertBefore(source,current.indexOf(source)<current.indexOf(target)?target.nextSibling:target);animatePositions(before,source);
    }
    function up(e){if(e.pointerId===pointerId)finish(true);}
    function abort(e){if(e.pointerId===pointerId)finish(false);}
    function escape(e){if(e.key==='Escape'){e.preventDefault();finish(false);}}
    document.addEventListener('pointermove',move,true);document.addEventListener('pointerup',up,true);document.addEventListener('pointercancel',abort,true);document.addEventListener('keydown',escape,true);
    cancelDrag=()=>{cleanup();if(active)restore();cancelDrag=()=>{};};
   };
  }
  function draw(){const p=selected(),typ={color:'#172033',lineHeight:1.5,...regionDefaults[region],...DocumentPresentation.typography(p.typography)[region]};
   host.innerHTML=`<section class="panel top-settings"><h3>顶部设置</h3><p>默认与独立设置用于新建单证，已保存历史保留自己的内容。内置语言用于标签和固定文案，自由输入内容不自动翻译。</p><div class="form-grid"><label>应用范围<select data-top-scope><option value="all" ${scope==='all'?'selected':''}>应用全部单证</option><option value="one" ${scope==='one'?'selected':''}>指定单证独立设置</option></select></label><label ${scope==='all'?'hidden':''}>指定单证<select data-top-type>${Object.entries(types).map(([k,v])=>`<option value="${k}" ${type===k?'selected':''}>${v}</option>`).join('')}</select></label></div><h4>语言设置</h4><label>默认输出语言<select data-top-language>${choices({...c.settings,languageSettings:{languages}}).map(r=>`<option value="${r.value}" ${(p.language||defaultLanguage(c.settings,type))===r.value?'selected':''}>${esc(r.label)}</option>`).join('')}</select></label><p class="language-order-hint">按住语言行拖动排序，放下后自动保存。</p><div class="top-language-list" role="list" aria-label="语言显示顺序">${languages.map(r=>`<div class="top-language-row" data-language-code="${r.code}" role="listitem"><span class="top-language-handle" aria-hidden="true">⠿</span><span>${esc(names[r.code])}</span><button type="button" data-language-toggle="${r.code}" class="business-toggle ${r.enabled!==false?'is-on':'is-off'}" aria-pressed="${r.enabled!==false}">${r.enabled!==false?'✓ 开启':'− 关闭'}</button></div>`).join('')}</div><div class="language-order-feedback"><span data-language-order-status role="status"></span><button type="button" data-language-order-retry hidden>重新保存顺序</button></div><h4>颜色与文字样式</h4><div class="form-grid"><label>单证颜色<input data-top-color type="color" value="${esc(p.color||c.settings.documentColorPreferences?.[type]||'#285fc1')}"></label><label>文字区域<select data-top-region>${Object.entries(regions).map(([key,name])=>`<option value="${key}" ${region===key?'selected':''}>${name}</option>`).join('')}</select></label><label>文字样式<select data-top-weight><option value="400" ${typ.fontWeight===400?'selected':''}>常规</option><option value="700" ${typ.fontWeight>=700?'selected':''}>加粗</option></select></label><label>文字颜色<input data-top-text-color type="color" value="${typ.color}"></label><label>字号<input data-top-size type="number" min="8" max="32" value="${typ.fontSize}"></label><label>行高<input data-top-line type="number" min="1" max="2.5" step=".1" value="${typ.lineHeight}"></label></div><footer class="actions"><button type="button" class="primary" data-top-save>保存设置</button></footer><p data-top-status role="status"></p></section>`;
  }
  function collect(){const p=selected();p.language=host.querySelector('[data-top-language]').value;p.color=host.querySelector('[data-top-color]').value;p.typography=DocumentPresentation.typography(p.typography);Object.assign(p.typography[region],{fontWeight:Number(host.querySelector('[data-top-weight]').value),color:host.querySelector('[data-top-text-color]').value,fontSize:Number(host.querySelector('[data-top-size]').value),lineHeight:Number(host.querySelector('[data-top-line]').value)});}
  const originalDraw=draw;
  draw=function(){originalDraw();const panel=host.querySelector('.top-settings'),form=panel.querySelector('.form-grid'),headings=[...panel.querySelectorAll(':scope>h4')],language=panel.querySelector('[data-top-language]').closest('label'),languageList=panel.querySelector('.top-language-list'),styles=panel.querySelectorAll(':scope>.form-grid')[1];panel.querySelector(':scope>p').remove();const nav=document.createElement('nav');nav.className='top-settings-tabs';nav.innerHTML=[['language','语言设置'],['color','颜色'],['text','文字样式']].map(([key,label])=>`<button type="button" data-top-tab="${key}" aria-selected="${tab===key}">${label}</button>`).join('');panel.querySelector('h3').after(nav);headings.forEach(n=>n.remove());form.classList.add('top-settings-scope');const workspace=document.createElement('div');workspace.className='top-preference-workspace';form.after(workspace);const controls=document.createElement('div');controls.className='top-preference-controls';workspace.append(controls);const langPanel=document.createElement('section');langPanel.hidden=tab!=='language';langPanel.append(language,languageList);controls.append(langPanel);const colorPanel=document.createElement('section');colorPanel.hidden=tab!=='color';const color=styles.querySelector('[data-top-color]').closest('label');colorPanel.append(color);controls.append(colorPanel);const textPanel=document.createElement('section');textPanel.hidden=tab!=='text';textPanel.className='top-text-grid';while(styles.firstChild)textPanel.append(styles.firstChild);styles.remove();controls.append(textPanel);const preview=document.createElement('aside');preview.className='top-preview';preview.setAttribute('data-top-preview','');workspace.append(preview);refreshPreview();bindLanguageOrder();showOrderStatus();};
  function refreshPreview(){
   const preview=host.querySelector('[data-top-preview]');if(!preview)return;
   const p=selected(),language=p.language||defaultLanguage(c.settings,type),typ=DocumentPresentation.typography(p.typography),color=p.color||c.settings.documentColorPreferences?.[type]||'#285fc1';
   const label=(en,zh)=>language==='zh'?zh:language==='bilingual'||language==='zh-en'?`${en} / ${zh}`:language.startsWith('zh-')?`${DocumentLocales.label(en,language.slice(3))||en} / ${zh}`:DocumentLocales.label(en,language)||en;
   const titles={quotation:['Quotation','报价单'],invoice:['Proforma Invoice','形式发票'],contract:['Sales Contract','销售合同'],commercial:['Commercial Invoice','商业发票'],packing:['Packing List','装箱单'],invitation:['Invitation Letter','邀请函'],authorization:['Letter of Authorization','授权书'],statement:['Commission Settlement','佣金结算单']};
   const style=(key,fallback)=>{const t={...regionDefaults[key],color:fallback,lineHeight:1.5,...typ[key]};return `font-size:${Number(t.fontSize)}px;font-weight:${Number(t.fontWeight)};line-height:${Number(t.lineHeight)};color:${esc(t.color)}`;};
   preview.dir=language==='ar'?'rtl':'ltr';preview.lang=language;
   preview.style.setProperty('--sample-color',color);
   preview.innerHTML=`<div class="top-sample-header"><strong>Example Trading Co., Ltd.</strong><span data-sample-region="title" style="${style('title','#ffffff')}">${esc(label(...titles[type]))}</span></div><div class="top-sample-body"><p data-sample-region="body" style="${style('body','#172033')}">${esc(label('Company','公司名称'))}: Example Buyer</p><div class="top-sample-columns" data-sample-region="tableHeader" style="${style('tableHeader',color)}"><span>${esc(label('Product Description','产品信息'))}</span><span>${esc(label('Qty','数量'))}</span><span>${esc(label('Amount','金额'))}</span></div><div class="top-sample-columns" data-sample-region="product" style="${style('product','#172033')}"><span>Model A-100</span><span>1</span><span>USD 1,000</span></div><p class="top-sample-total" style="${style('body',color)}">${esc(label('Total','合计'))}　USD 1,000</p><p data-sample-region="notes" style="${style('notes','#172033')}">${esc(label('Payment Terms','付款条件'))}: T/T</p></div><small data-sample-region="footer" style="${style('footer','#64748b')}">${esc(label('Authorized Signature','授权签字'))}</small>`;
  }
  host.oninput=e=>{if(e.target.matches('input')){collect();refreshPreview();}};
  host.onchange=e=>{collect();refreshPreview();if(e.target.matches('[data-top-region]')){region=e.target.value;draw();return;}if(e.target.matches('[data-top-scope]')){scope=e.target.value;draw();}if(e.target.matches('[data-top-type]')){type=e.target.value;draw();}};
  host.onclick=async e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-language-order-retry'))return persistLanguageOrder(lastOrder);collect();
   if(b.dataset.topTab){tab=b.dataset.topTab;return draw();}
   if(b.dataset.languageToggle){const r=languages.find(n=>n.code===b.dataset.languageToggle);if(r.enabled!==false&&languages.filter(n=>n.enabled!==false).length===1)return c.toast('至少保留一种启用语言。');r.enabled=r.enabled===false;return draw();}
   if(b.hasAttribute('data-top-save')){await languageOrderSaveQueue;const p=selected(),old=c.settings.documentPreferences||{defaults:{},overrides:{}},overridden=Object.keys(old.overrides||{});if(scope==='all'&&!confirm('应用全部将修改以下单证的新建默认设置：'+Object.values(types).join('、')+'。'+(overridden.length?'将覆盖已有独立设置：'+overridden.map(k=>types[k]||k).join('、')+'。':'')+'已保存历史内容保持不变。确认保存？'))return;
    const available=choices({...c.settings,languageSettings:{languages}}).map(n=>n.value);if(!available.includes(p.language))p.language=available[0];const prefs=scope==='all'?{defaults:p,overrides:{}}:{...old,overrides:{...old.overrides,[type]:p}},colors={...c.settings.documentColorPreferences};for(const key of scope==='all'?Object.keys(types):[type])colors[key]=p.color;
    b.disabled=true;try{await c.save({documentPreferences:prefs,documentColorPreferences:colors,languageSettings:{...c.settings.languageSettings,languages,defaultLanguage:scope==='all'?p.language:c.settings.languageSettings?.defaultLanguage||'zh'}});sync();host.querySelector('[data-top-status]').textContent='设置已保存，新建单证时生效；当前编辑内容和历史未被覆盖。';}catch(error){host.querySelector('[data-top-status]').textContent='保存失败：'+error.message;}finally{b.disabled=false;}
   }
  };draw();sync();
 }
 window.TranslationWorkspace={mount,sync,choices,preference,defaultLanguage};window.addEventListener('foreign-trade-auth-ready',mount);
 document.addEventListener('click',e=>document.querySelectorAll('.document-text-options[open]').forEach(p=>{if(!p.contains(e.target))p.open=false;}));document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.document-text-options[open]').forEach(p=>p.open=false);});
})();
