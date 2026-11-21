(function(){
 'use strict';
 const $=id=>document.getElementById(id),C=()=>window.quoteSettingsContext;
 const display=record=>(record.editingDetails||={}).display||= {version:1};
 let opened=null;
 function place(output){const trigger=$('display-settings-trigger-'+output.dataset.displayKind),r=trigger?.getBoundingClientRect();if(!r||innerWidth<=760){output.style.removeProperty('top');output.style.removeProperty('right');output.style.removeProperty('max-height');return;}const top=Math.max(12,Math.min(r.bottom+10,innerHeight-300));output.style.top=top+'px';output.style.right=Math.max(16,innerWidth-r.right)+'px';output.style.maxHeight=(innerHeight-top-16)+'px';}
 function close(focus=true){if(!opened)return;const output=opened;opened=null;output.hidden=true;$(output.id+'-backdrop').hidden=true;const trigger=$('display-settings-trigger-'+output.dataset.displayKind);trigger?.setAttribute('aria-expanded','false');if(focus)trigger?.focus({preventScroll:true});}
 function open(kind){const output=$('document-output-options-'+kind);if(!output?.dataset.compactDisplay)return;close(false);opened=output;output.hidden=false;$(output.id+'-backdrop').hidden=false;place(output);$('display-settings-trigger-'+kind)?.setAttribute('aria-expanded','true');output.querySelector('[data-display-close]')?.focus({preventScroll:true});}
 function mode(record){return record.editingDetails?.display?.signingMode||((record.signatureChoice||record.signingSnapshot?.choice)==='none'&&!(record.signingOptions?.seal??record.signingSnapshot?.showSeal??true)?'manual':'electronic');}
 function changeMode(kind,host,value){const record=C().editingRecords[kind],state=display(record),choice=host.querySelector('[data-signature-choice]'),signature=host.querySelector('[data-signature-visible]'),seal=host.querySelector('[data-seal-visible]');
  if(value==='manual'){state.electronic={choice:choice.value==='none'?(record.signingOptions?.nameLanguage||'en'):choice.value,signature:signature.checked,seal:seal.checked};choice.value='none';signature.checked=false;seal.checked=false;}
  else{const saved=state.electronic||{choice:record.signingOptions?.nameLanguage||'en',signature:true,seal:true};choice.value=saved.choice;signature.checked=saved.signature;seal.checked=saved.seal;}
  state.signingMode=value;choice.dispatchEvent(new Event('change',{bubbles:true}));
 }
 function mount(kind,output,root,host){
  output.dataset.compactDisplay='1';output.dataset.displayKind=kind;output.classList.remove('composer-fold','composer-collapsed');output.classList.add('display-settings-popover');output.setAttribute('role','dialog');output.setAttribute('aria-modal','false');output.setAttribute('aria-labelledby','display-settings-title-'+kind);
  output.querySelector(':scope>h3')?.remove();
  const header=document.createElement('header');header.className='display-settings-head';header.innerHTML='<h2 id="display-settings-title-'+kind+'">单据显示设置</h2><button type="button" data-display-close aria-label="关闭显示设置">×</button>';
  const body=document.createElement('div');body.className='display-settings-body';
  const footer=document.createElement('footer');footer.className='display-settings-foot';footer.innerHTML='<span data-display-save role="status"></span><button type="button" data-display-close>完成</button>';
  output.prepend(header);output.append(body,footer);body.append(host);
  const content=document.createElement('section');content.className='display-option-group';content.dataset.displayContent='';content.innerHTML='<h3>抬头与内容</h3><label class="display-option"><input type="checkbox" data-display-logo><span>显示公司 Logo</span></label>';
  const parties=host.querySelector('[data-editing-parties]');if(parties){parties.classList.add('display-option-group');parties.prepend(Object.assign(document.createElement('h3'),{textContent:'双方落款'}));}
  const signing=document.createElement('section');signing.className='display-option-group';signing.innerHTML='<h3>签署版本</h3><label class="display-mode"><select data-display-signing-mode aria-label="签署版本"><option value="manual">手动签名／盖章（自动落款）</option><option value="electronic">电子签名／公章</option></select></label><div data-display-electronic></div>';
  const electronic=signing.querySelector('[data-display-electronic]');for(const selector of ['[data-signature-visible]','[data-seal-visible]','[data-signature-choice]']){const input=host.querySelector(selector);if(input)electronic.append(input.closest('label'));}
  host.prepend(content);host.append(signing);if(parties)host.insertBefore(parties,signing);
  const common=output.querySelector('.document-simple-options');if(common){content.append(common);common.style.removeProperty('display');common.querySelector('#document-show-bank')?.addEventListener('change',e=>e.stopPropagation());}
  const bank=host.querySelector('[data-receiving-visible]');if(bank)content.append(bank.closest('label'));
  const warning=host.querySelector('small');if(warning){warning.dataset.displayWarning='';signing.append(warning);}
  host.querySelector('[data-display-signing-mode]').onchange=e=>{e.stopPropagation();changeMode(kind,host,e.target.value);};
  host.querySelector('[data-display-logo]').onchange=e=>{e.stopPropagation();const record=C().editingRecords[kind];display(record).logo=e.target.checked;if(kind==='agency'&&record.authorizationSchema===2){record.customFields||={};record.customFields.showLogo=e.target.checked;const original=root.querySelector('[data-standalone-field=showLogo]');if(original)original.checked=e.target.checked;}C().editingChanged(kind);};
  const backdrop=document.createElement('div');backdrop.className='display-settings-backdrop no-print';backdrop.id=output.id+'-backdrop';backdrop.hidden=true;backdrop.onclick=()=>close();
  const trigger=document.createElement('button');trigger.type='button';trigger.id='display-settings-trigger-'+kind;trigger.dataset.displaySettingsTrigger='';trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',output.id);trigger.innerHTML=(window.DocumentComposer?.icon('settings')||'')+'显示设置';trigger.onclick=()=>opened===output?close():open(kind);
  const actions=root.querySelector(':scope>.page-head .actions');if(actions)actions.prepend(trigger);else root.prepend(trigger);
  root.append(backdrop,output);output.hidden=true;output.querySelectorAll('[data-display-close]').forEach(button=>button.onclick=()=>close());
 }
 function refresh(kind,record){const output=$('document-output-options-'+kind),root=$('view-'+kind),host=$('signing-controls-'+kind);if(!output||!root||!host||!record)return;
  if(!output.dataset.compactDisplay)mount(kind,output,root,host);
  if(output.parentElement!==root)root.append(output);for(const n of output.children)n.style.removeProperty('display');
  const content=host.querySelector('[data-display-content]'),receiving=$('editing-receiving-panel');if(kind==='quote'&&receiving){content.append(receiving);receiving.style.removeProperty('display');}
  const logo=record.editingDetails?.display?.logo??(kind==='agency'&&record.authorizationSchema===2?record.customFields?.showLogo!==false:record.documentType!=='statement');host.querySelector('[data-display-logo]').checked=logo;
  if(kind==='agency'&&record.authorizationSchema===2){const original=root.querySelector('[data-form-field=showLogo]');if(original)original.hidden=true;const section=root.querySelector('[data-authorization-group=display]');if(section)section.hidden=![...section.querySelectorAll('label')].some(n=>!n.hidden);}
  const currentMode=mode(record);host.querySelector('[data-display-signing-mode]').value=currentMode;host.querySelector('[data-display-electronic]').hidden=currentMode==='manual';
  const version=host.querySelector('[data-signature-choice]').closest('label');version.hidden=currentMode==='manual'||!host.querySelector('[data-signature-visible]').checked;
  const signed=DocumentWorkflow.signing(record,record.companySnapshot||C().settings,kind),warning=host.querySelector('[data-display-warning]');warning.hidden=currentMode==='manual'||!signed.showSignature||!!signed.signature;
  host.querySelector('[data-display-signing-mode]').closest('section').hidden=kind==='quote'&&!DocumentEditingModel.parties(record).seller;
  for(const input of host.querySelectorAll('input[type=checkbox]'))input.closest('label')?.classList.add('display-option');
  output.querySelector('[data-display-save]').textContent='修改自动保存';
  if(opened===output){if(!root.classList.contains('active'))close(false);else{output.hidden=false;place(output);}}else output.hidden=true;
  apply(kind,record);
 }
 function apply(kind,record){const preview=$(kind+'-preview');if(!preview)return;const visible=record.editingDetails?.display?.logo;if(visible===true&&record.documentType==='statement'){const head=preview.querySelector('.agency-letterhead'),logo=DocumentWorkflow.safeImage((record.companySnapshot||C().settings).logoDataUrl);if(head&&logo&&!head.querySelector('img')){const image=document.createElement('img');image.src=logo;image.alt='Logo';head.prepend(image);}}if(visible!==false)return;preview.querySelectorAll('.preview-company>img,.document-letterhead>img,.agency-letterhead>img,.invitation-header>img,.authorization-logo,.simple-quotation-brand img,.simple-quotation-header>img,.reference-letterhead img').forEach(n=>n.remove());}
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){e.preventDefault();close();}});window.addEventListener('resize',()=>opened&&place(opened));
 window.DocumentDisplayControls={refresh,open,close,apply};
})();
