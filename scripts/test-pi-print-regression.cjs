const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const extract=name=>{
  const start=source.indexOf(`  function ${name}(`);
  assert(start>=0,name+' missing');
  return source.slice(start,source.indexOf('\n  }',start)+4);
};
const columns=[{key:'sequence',en:'No.',zh:'序号'},...['description','hsCode','qty','billingUnit','unitPrice','amount'].map(key=>({key,en:key,zh:key}))];
const live={companyNameEn:'Current company',bankFields:[{value:'CURRENT'}]};
const saved={companyNameEn:'Saved company',bankFields:[{value:'SAVED'}],agencySignatureDataUrl:'saved-signature',stampDataUrl:'saved-seal'};
const context=vm.createContext({settings:live,currentQuote:{companySnapshot:saved,documentType:'invoice',items:[{kind:'product',values:{description:'Bobcat S550',hsCode:'84295100',qty:1,billingUnit:'Unit',unitPrice:19300,amount:19300}}]},structuredClone,
  quotePreviewColumns:()=>columns,quoteLineColumns:()=>[],escapeHtml:String,labelHtml:String,labelText:String,
  quotePreviewCell:(item,col)=>String(item.values[col.key]??''),
  renderPreviewWithCompany:()=>{assert.equal(context.settings.companyNameEn,'Saved company');assert.equal(context.settings.bankFields[0].value,'SAVED');assert.equal(context.settings.agencySignatureDataUrl,'saved-signature');}
});
vm.runInContext(['companyProfileData','renderPreview','renderQuotePreviewHead','renderQuotePreviewRows'].map(extract).join('\n'),context);
context.renderPreview();assert.equal(context.settings,live,'Global settings must be restored');
const head=context.renderQuotePreviewHead(),row=context.renderQuotePreviewRows();
assert.equal((head.match(/<th\b/g)||[]).length,(row.match(/<td\b/g)||[]).length);
assert(!/<th class="preview-col-sequence preview-col-extra"/.test(head),'Sequence header must remain visible in print');
assert(row.includes('class="preview-col-sequence"'),'Sequence cells need matching print class');
assert(row.includes('84295100'));
context.renderPreviewWithCompany=()=>{throw Error('render failed');};
assert.throws(()=>context.renderPreview());assert.equal(context.settings,live,'Restore global company even after render failure');
console.log('PI print regression passed: aligned headers/cells and isolated company/payment/signature snapshot.');
