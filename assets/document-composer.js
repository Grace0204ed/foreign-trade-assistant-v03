(function(){
 'use strict';
 const C=()=>window.quoteSettingsContext,$=id=>document.getElementById(id);
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths={arrow:'m14 5-7 7 7 7',down:'m6 9 6 6 6-6',file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5',cart:'m2 3 3 0 3 12h11l3-9H6M9 21h.01M19 21h.01',layers:'m12 2 10 5-10 5L2 7ZM2 12l10 5 10-5M2 17l10 5 10-5',shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6ZM8 12l3 3 5-6',bank:'M3 5h18v14H3ZM3 10h18M7 15h4',settings:'M9 3h6l1 4 4 1v7l-4 1-1 4H9l-1-4-4-1V8l4-1ZM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',batch:'M8 7V3h11v14h-4M4 7h11v14H4ZM7 11h5M7 15h5',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+paths[name]+'"/></svg>';
 const selected=new Set();let types={},actions,chosen=false;
 const selection=()=>[...selected];
 function sync(){
  document.querySelectorAll('[data-composer-select]').forEach(input=>{input.checked=selected.has(input.value);input.closest('.composer-doc-chip').classList.toggle('is-selected',input.checked);});
  document.querySelectorAll('[data-composer-count]').forEach(n=>n.textContent='已选 '+selected.size+' 项');
  document.querySelectorAll('[data-composer-list]').forEach(n=>n.innerHTML=selection().map(type=>'<button type="button" data-composer-open="'+type+'">'+escape(types[type])+'</button>').join('')||'<span>尚未选择单证</span>');
  document.querySelectorAll('[data-composer-prepare],[data-composer-export]').forEach(n=>n.disabled=!selected.size);
 }
 function activate(type){if(!chosen){selected.add(type);chosen=true;}sync();}
 function bar(labels,callbacks){
  types=labels;actions=callbacks;
  const element=document.createElement('div');element.className='document-jump-bar composer-selection-bar no-print';
  element.innerHTML='<b>选择单证 <em>（可多选）</em></b><nav class="document-switch-buttons" aria-label="选择和切换单证">'+Object.entries(types).map(([type,label])=>'<div class="composer-doc-chip"><input aria-label="选择'+escape(label)+'" type="checkbox" data-composer-select value="'+type+'"><button type="button" data-switch-document="'+type+'">'+escape(label)+'</button></div>').join('')+'</nav><div class="composer-batch-actions"><details class="composer-selected"><summary><span data-composer-count></span>'+icon('down')+'</summary><div data-composer-list></div></details><button type="button" data-composer-prepare>'+icon('batch')+'批量制作</button><button type="button" data-composer-export>'+icon('download')+'批量导出PDF</button></div>';
  element.onchange=e=>{if(!e.target.matches('[data-composer-select]'))return;e.target.checked?selected.add(e.target.value):selected.delete(e.target.value);chosen=true;sync();};
  element.onclick=async e=>{const button=e.target.closest('button');if(!button)return;const type=button.dataset.switchDocument||button.dataset.composerOpen;if(type){e.preventDefault();element.querySelector('details')?.removeAttribute('open');actions.open(type);return;}
   try{if(button.hasAttribute('data-composer-prepare')){actions.prepare(selection());C().toast('已准备 '+selected.size+' 份独立单证，已有内容保留。');}
    if(button.hasAttribute('data-composer-export')){actions.prepare(selection());await C().previewSelectedDocuments(selection());}
   }catch(error){C().toast(error.message);}sync();};
  sync();return element;
 }
 let folds={};try{folds=JSON.parse(localStorage.getItem('fta-composer-folds-v1')||'{}');}catch(_){}
 const displays=new WeakMap();
 function visibility(panel,open){for(const child of panel.children){if(child.classList.contains('composer-fold-head'))continue;if(!displays.has(child))displays.set(child,{value:child.style.getPropertyValue('display'),priority:child.style.getPropertyPriority('display')});const prior=displays.get(child);if(!open)child.style.setProperty('display','none','important');else if(prior.value)child.style.setProperty('display',prior.value,prior.priority);else child.style.removeProperty('display');}}
 const persist=()=>{try{localStorage.setItem('fta-composer-folds-v1',JSON.stringify(folds));}catch(_){}};
 function setOpen(panel,open){panel.classList.toggle('composer-collapsed',!open);visibility(panel,open);panel.querySelector('.composer-fold-head')?.setAttribute('aria-expanded',String(open));folds[panel.dataset.composerKey]=open;persist();if(open)window.DocumentEditing?.layout();}
 function fold(panel,key,symbol,open=true,summary=''){
  if(!panel)return;
  const head=panel.querySelector(':scope>.row-head')||panel.querySelector(':scope>h3');if(!head)return;
  panel.classList.add('composer-fold');panel.dataset.composerKey=key;head.classList.add('composer-fold-head');head.setAttribute('role','button');head.tabIndex=0;
  const title=head.matches('h3')?head:head.querySelector('h3');
  if(title&&!title.querySelector('[data-composer-icon]')){const span=document.createElement('span');span.dataset.composerIcon='';span.innerHTML=icon('down')+icon(symbol);title.prepend(span);}
  let text=head.querySelector('[data-composer-summary]');if(!text){text=document.createElement('span');text.dataset.composerSummary='';head.append(text);}text.textContent=summary;text.title=summary;
  const expanded=Object.hasOwn(folds,key)?folds[key]:open;panel.classList.toggle('composer-collapsed',!expanded);head.setAttribute('aria-expanded',String(expanded));visibility(panel,expanded);
  head.onclick=e=>{if(e.target.closest('button,input,select,label,a'))return;setOpen(panel,panel.classList.contains('composer-collapsed'));};
  head.onkeydown=e=>{if(e.target!==head||!['Enter',' '].includes(e.key))return;e.preventDefault();setOpen(panel,panel.classList.contains('composer-collapsed'));};
 }
 function titleRow(root){
  const header=root.querySelector(':scope>.page-head');if(!header)return;
  let middle=header.querySelector('.composer-title');if(!middle){middle=document.createElement('div');middle.className='composer-title';const heading=header.querySelector('h2');if(heading){const wrapper=heading.parentElement;middle.append(heading);if(wrapper!==header&&[...wrapper.children].every(n=>n.tagName==='P'))wrapper.remove();}header.insertBefore(middle,header.querySelector('.actions'));}
  if(root.id==='view-quote'){const state=$('quote-autosave-status')?.parentElement;if(state&&!middle.contains(state)){state.classList.remove('actions');state.classList.add('composer-save-state');middle.append(state);}}
  const preview=header.querySelector('[data-form-preview]');if(preview&&!preview.dataset.composerStyled){preview.innerHTML=icon('eye')+'单据预览';preview.dataset.composerStyled='true';}
 }
 const term=key=>document.querySelector('[data-termfield="'+key+'"]')?.value||'';
 function refresh(kind,record){
  const root=$('view-'+kind);if(!root||!record)return;root.classList.add('composer-editor');titleRow(root);
  const type=kind==='quote'?record.documentType:kind==='invitation'?'invitation':record.documentType;
  if(kind==='quote'){
   fold($('quote-common-panel'),type+':basic','file');
   fold($('quote-standard-detail-panel'),type+':items','cart');
   let after=$('quote-aftersales-panel');if(!after){after=document.createElement('section');after.id='quote-aftersales-panel';after.className='panel';after.innerHTML='<h3>售后与质保</h3><div id="quote-aftersales" class="form-grid"></div>';$('quote-standard-terms-panel').after(after);}
   const fields=$('quote-terms').querySelectorAll(':scope>[data-form-field="afterSales"],:scope>[data-form-field="warranty"]');
   if(fields.length){$('quote-aftersales').replaceChildren(...fields);}const config=record.isFormal?record.templateSnapshot?.documentConfig:C().settings.documentConfigs?.[type];
   for(const label of [...$('quote-aftersales').children]){if(!config?.blocks.terms?.some(f=>f.fieldKey===label.dataset.formField&&!f.deletedAt&&f.visible!==false&&f.active!==false))label.remove();}
   after.hidden=!after.querySelector('[data-termfield]');
   fold(after,type+':aftersales','shield',false,term('warranty')?'质保：'+term('warranty'):'');
   const p=record.editingDetails?.payment,ratio=p?.custom?p.deposit+'% + '+(100-Number(p.deposit))+'%':term('payment').replace('/','% + ')+'%';
   fold($('quote-standard-terms-panel'),type+':terms','layers',false,[term('shipping')?'贸易方式：'+term('shipping'):'',term('payment')?'付款：'+ratio:'',term('deliveryTime')?'交货时间：'+term('deliveryTime'):''].filter(Boolean).join('  |  '));
   const account=record.receivingAccountSnapshot?.name||record.companySnapshot?.companyNameZh||C().settings.companyNameZh||'';
   fold($('editing-receiving-panel'),type+':bank','bank',false,account?'收款账户：'+account:'');
  }
  const output=$('document-output-options-'+kind);
  const enabled=n=>n?.checked?'开启':'关闭';
  fold(output,type+':output','settings',false,[kind==='quote'?'图片：'+enabled($('quote-photo-appendix')):'',kind==='quote'?'收款信息：'+enabled($('document-show-bank')):'',root.querySelector('[data-signature-visible]')?'签名：'+enabled(root.querySelector('[data-signature-visible]')):'',root.querySelector('[data-seal-visible]')?'公章：'+enabled(root.querySelector('[data-seal-visible]')):''].filter(Boolean).join('  |  '));
  if(kind==='invitation')output.hidden=Number(record.editorStep||0)!==3;
 }
 document.addEventListener('invalid',event=>{const panel=event.target.closest('.composer-fold');if(panel)setOpen(panel,true);},true);
 document.addEventListener('click',event=>{if(event.target.closest('#add-quote-item-btn'))setOpen($('quote-standard-detail-panel'),true);},true);
 window.DocumentComposer={bar,activate,refresh,selection,icon,setOpen};
})();
