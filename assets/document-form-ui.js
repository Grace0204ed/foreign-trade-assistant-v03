(function(){
 'use strict';const $=id=>document.getElementById(id),S=()=>window.DocumentFormSchema;
 function preview(type){window.quoteSettingsContext?.previewDocument(type);}
 function previewAccess(type){const kind=['agency','statement'].includes(type)?'agency':type==='invitation'?'invitation':'quote',view=$('view-'+kind);if(!view)return;
  let button=view.querySelector('[data-form-preview]');if(!button){button=document.createElement('button');button.type='button';button.dataset.formPreview='';button.textContent='单独预览';view.querySelector(':scope>.page-head .actions')?.prepend(button);}button.onclick=()=>preview(type);
 }
 function bridge(input,field,value){
  if(!input||['language','pdfLanguage','style','recipientType','validityMonths','validFrom','validUntil'].includes(field.fieldKey))return;
  const label=input.closest('label');if(!label)return;
  label.querySelectorAll('[data-form-bridge]').forEach(n=>n.remove());
  if(['country','nationality'].includes(field.fieldKey)){input.setAttribute('list','document-country-options');input.placeholder='输入中文或英文搜索国家';return;}
  const wanted=field.fieldType||'text';
  if(['date','text','textarea','number','money','calculated','image','richtext'].includes(wanted))return;
  const options=field.options||[];if(!options.length)return;
  const control=document.createElement('select');control.dataset.formBridge=field.fieldKey;control.setAttribute('aria-label',field.zh);control.append(new Option('请选择',''));for(const row of options.filter(o=>o.active!==false&&!o.deletedAt))control.append(new Option(row.labelZh||row.zh||row.value,row.value));control.value=value??input.value;input.hidden=true;label.append(control);
  control.onchange=()=>{input.value=control.value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
 }
 function arrange(kind,mapping,config,record){
  if(!config)return;const type=kind==='agency'&&record.documentType==='statement'?'statement':kind,root=$('view-'+kind),editor=root?.querySelector('.quote-editor');if(!editor)return;
  const names=S().labels[type];const groups={};
  for(const key of ['basic','customer','items','terms']){
   let panel=editor.querySelector('[data-form-section="'+key+'"]');if(!panel){panel=document.createElement('section');panel.dataset.formSection=key;panel.className='panel schema-form-panel';panel.innerHTML='<h3></h3><div class="form-grid"></div>';editor.append(panel);}panel.querySelector('h3').textContent=names[key];groups[key]=panel.querySelector('.form-grid');
   for(const field of S().ordered(config.blocks[key]||[])){
    const native=$(mapping[field.fieldKey]),label=native?.closest('label')||root.querySelector('[data-standalone-custom="'+CSS.escape(field.fieldKey)+'"]');
    if(label){groups[key].append(label);label.dataset.formField=field.fieldKey;label.dataset.fieldWidth=field.formWidth||'auto';label.hidden=false;let caption=label.querySelector(':scope>span:not(.date-input-control)');if(!caption){caption=document.createElement('span');for(const n of [...label.childNodes])if(n.nodeType===3)n.textContent='';label.prepend(caption);}caption.textContent=field.zh+(field.required?' *':'');bridge(native,field,record[field.fieldKey]??record.customFields?.[field.fieldKey]);}
   }
  }
  for(const key of ['basic','customer','items','terms'])editor.append(groups[key].parentElement);
  const output=$('document-output-options-'+kind);if(output)editor.append(output);
  for(const key of ['invitation-inviter','invitation-signer-title','invitation-style','agency-company','agency-authorizer','agency-authorizer-title'])$(key)?.closest('label')?.setAttribute('hidden','');
  if(type==='invitation'){
   for(const id of ['invitation-recipient-type','invitation-company']){const n=$(id)?.closest('label');if(n)groups.customer.prepend(n);}
   const selector=$('invitation-recipient-type')?.closest('label');if(selector)groups.customer.prepend(selector);
   if($('invitation-company'))$('invitation-company').closest('label').hidden=record.recipientType!=='company';
   let first=$('invitation-person-one');if(!first){first=document.createElement('fieldset');first.id='invitation-person-one';first.className='invitation-person';first.innerHTML='<legend>受邀人 1</legend><div class="form-grid"></div>';}
   for(const f of S().ordered(config.blocks.customer||[])){if(['recipientType','visitorCompany'].includes(f.fieldKey))continue;const n=$(mapping[f.fieldKey])?.closest('label')||root.querySelector('[data-standalone-custom="'+CSS.escape(f.fieldKey)+'"]');if(n)first.querySelector('.form-grid').append(n);}
   groups.customer.append(first);const extra=$('invitation-extra-people');if(extra)groups.customer.append(extra);if($('invitation-add-person'))groups.customer.append($('invitation-add-person'));
   const remove=$('invitation-remove-first');if(remove){remove.textContent='删除受邀人 1';first.append(remove);}
   const places=root.querySelector('.invitation-places');if(places)groups.items.append(places);
   const validation=$('invitation-validation');if(validation)groups.items.append(validation);
   const controls=$('invitation-party-controls');if(controls)controls.hidden=true;
  }
  if(type==='agency'){const scope=$('agency-product-options')?.closest('.agency-scope-panel');if(scope)groups.items.append(scope);}
  for(const panel of editor.querySelectorAll(':scope>.panel:not(.schema-form-panel)')){
   if(panel.id==='invitation-party-controls')continue;
   const shown=[...panel.querySelectorAll('input,textarea,select,button')].some(n=>!n.closest('[hidden]')&&n.type!=='hidden');panel.hidden=!shown;
  }
  S().companyKeys.forEach(key=>{const n=$(mapping[key]);if(n&&key!=='company')n.closest('label')?.setAttribute('hidden','');});
  previewAccess(type);
 }
 function invitation(record){const config=window.quoteSettingsContext?.settings.documentConfigs?.invitation;const mapping={date:'invitation-date',embassy:'invitation-embassy',visitorName:'invitation-name',visitorCompany:'invitation-company',country:'invitation-country',gender:'invitation-gender',birthDate:'invitation-birth-date',passportNo:'invitation-passport',arrivalDate:'invitation-arrival',departureDate:'invitation-departure',visitPlace:'invitation-visit-place',visaType:'invitation-visa-type',relationship:'invitation-relationship',expenseSource:'invitation-expense-source',reason:'invitation-reason',notes:'invitation-notes',recipientType:'invitation-recipient-type',validityMonths:'invitation-validity-months',validFrom:'invitation-valid-from',validUntil:'invitation-valid-until'};arrange('invitation',mapping,config,record);}
 function quote(type){const country=$('buyer-country');if(country){country.setAttribute('list','document-country-options');country.placeholder='输入中文或英文搜索国家';}const names=S().labels[type];if(!names)return;const detail=$('quote-standard-detail-panel')?.querySelector('h3'),terms=$('quote-standard-terms-panel')?.querySelector('h3');if(detail)detail.textContent=names.items;if(terms)terms.textContent=names.terms;
  if(type==='packing'){if($('packing-editor'))$('packing-editor').hidden=true;if($('shipment-document-editor'))$('shipment-document-editor').hidden=true;}
  previewAccess(type);
 }
 function agencyConditions(record){
  const statement=record.documentType==='statement',basis=$('agency-commission-basis')?.value||record.commissionBasis,channel=$('agency-payment-channel')?.value||record.paymentChannel;
  const toggle=(id,hide)=>{const n=$(id);if(n)n.closest('label').hidden=hide;};
  for(const id of ['agency-company','agency-authorizer','agency-authorizer-title','agency-document-type'])toggle(id,true);
  if($('agency-legacy-commission'))$('agency-legacy-commission').hidden=true;
  for(const id of ['agency-bank-name','agency-bank-account','agency-bank-swift','agency-bank-routing','agency-bank-iban','agency-bank-country','agency-bank-address','agency-beneficiary-name','agency-beneficiary-address'])toggle(id,!statement||channel!=='bank');
  for(const id of ['agency-crypto-network','agency-wallet-address'])toggle(id,!statement||channel!=='crypto');
  toggle('agency-order-rate',!statement||basis==='fixed');toggle('agency-fixed-commission',!statement||basis!=='fixed');toggle('agency-markup-amount',!statement||basis!=='markup');
  const config=window.quoteSettingsContext?.settings.documentConfigs?.[statement?'statement':'agency'];if(config){const keys=new Set(Object.values(config.blocks).filter(Array.isArray).flatMap(S().ordered).map(f=>f.fieldKey));for(const label of $('view-agency').querySelectorAll('[data-form-field]'))if(!keys.has(label.dataset.formField))label.hidden=true;const scope=$('agency-product-options')?.closest('.agency-scope-panel');if(scope)scope.hidden=statement||!keys.has('selectedProducts');}
 }
 function countryList(){
  if(!window.DocumentWorkflow)return;const countries=DocumentWorkflow.searchCountries('');
  if(!$('document-country-options')){const list=document.createElement('datalist');list.id='document-country-options';for(const c of countries)list.append(new Option(c.zh,c.en+' / '+c.zh));document.body.append(list);}
  if(!$('document-embassy-options')){const list=document.createElement('datalist');list.id='document-embassy-options';for(const c of countries)list.append(new Option(c.en+' / '+c.zh,'中华人民共和国驻'+c.zh+'大使馆'));document.body.append(list);}
  const embassy=$('invitation-embassy');if(embassy){embassy.setAttribute('list','document-embassy-options');embassy.placeholder='输入中文国家名称选择大使馆';embassy.addEventListener('change',()=>{const hit=countries.find(c=>[c.zh,c.en,c.code].includes(embassy.value.trim()));if(hit){embassy.value='中华人民共和国驻'+hit.zh+'大使馆';embassy.dispatchEvent(new Event('input',{bubbles:true}));}});}
 }
 window.DocumentFormUI={arrange,invitation,quote,bridge,agencyConditions};document.addEventListener('DOMContentLoaded',countryList);
})();
