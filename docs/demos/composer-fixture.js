(async function(){
 while(!window.foreignTradeStartupReady)await new Promise(resolve=>setTimeout(resolve,20));
 await window.foreignTradeStartupReady;
 const C=window.quoteSettingsContext,config=structuredClone(C.settings.documentConfigs),keys=['itemType','image','description','brand','model','qty','unitPrice','currency','billingUnit','amount'];
 for(const type of ['quotation','invoice','contract','commercial'])for(const field of config[type].blocks.items){field.visible=keys.includes(field.fieldKey);field.sortOrder=keys.indexOf(field.fieldKey)*10;}
 await C.save({documentConfigs:config,companyNameZh:'示例贸易有限公司',companyNameEn:'Example Trading Co., Ltd.',receivingAccounts:[{id:'demo-forex',name:'示例贸易有限公司 · 外汇账户',type:'forex',holder:'Example Trading Co., Ltd.',bank:'Example Bank',number:'DEMO-ACCOUNT-001',currency:'USD',swift:'DEMOCNBJ',active:true}]});
 DocumentDraftWorkspace.activate('invoice');
 const q=C.editingRecords.quote,first=q.items[0];q.items=Array.from({length:3},(_,i)=>({...structuredClone(first),id:'demo-item-'+i,values:{...first.values,description:'',qty:1,unitPrice:'',currency:'USD'}}));q.tableHeaderColor='#008900';q.quoteDate='2026-11-15';q.terms={...q.terms,shipping:'FOB',payment:'30/70',deliveryTime:'30天',warranty:'3个月（主要部件）'};
 q.receivingAccountSnapshot=DocumentEditingModel.snapshotAccount({...C.settings.receivingAccounts[0],companyId:C.settings.activeCompanyId});
 C.editingRefresh();
 const trade=document.querySelector('[data-flow-term]');trade.value='FOB';trade.dispatchEvent(new Event('change',{bubbles:true}));
 const bar=document.querySelector('#view-quote .composer-selection-bar');for(const type of ['quotation','contract']){const input=bar.querySelector('[data-composer-select][value="'+type+'"]');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
 document.querySelector('#view-quote [data-composer-prepare]').click();
 window.scrollTo(0,0);
 window.composerDemoReady=true;
})();
