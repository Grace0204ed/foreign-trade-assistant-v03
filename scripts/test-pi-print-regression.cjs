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
const customerContext=vm.createContext({
  normalizeCustomerQuoteFields:()=>{},settings:{customerQuoteFields:[]},
  configuredBlockFields:()=>[{fieldKey:'country',en:'Buyer Country',zh:'买方国家'},{fieldKey:'company',en:'Buyer Company',zh:'买方公司'},{fieldKey:'reference',en:'Reference',zh:'内部编号'}],
  labelText:en=>en,escapeHtml:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;')
});
vm.runInContext(extract('customerPreviewFields'),customerContext);
const customer=customerContext.customerPreviewFields({company:'Arby',country:'Kenya',reference:'REF-01',phone:'HIDDEN'});
assert(customer.includes('Buyer Country:</b> <span>Kenya'));
assert(customer.indexOf('Kenya')<customer.indexOf('Arby'));
assert(customer.includes('Reference:</b> <span>REF-01'));
assert(!customer.includes('HIDDEN'));
assert(source.includes('const buyer=customerPreviewFields(currentQuote.buyer)'),'Dedicated document layouts must use configured customer fields');
const layouts=require('../assets/trade-document-layouts.js');
for(const type of ['invoice','contract','commercial','packing'])assert(layouts.render(type,{parties:customer}).includes(customer));
assert(layouts.render('invoice',{offerTerms:'TERMS',paymentTerms:'LEGACY-PAYMENT',deliveryTerms:'LEGACY-DELIVERY'}).includes('TERMS'));
assert(!layouts.render('invoice',{offerTerms:'TERMS',paymentTerms:'LEGACY-PAYMENT'}).includes('LEGACY-PAYMENT'));
const css=fs.readFileSync(require('node:path').join(__dirname,'../styles.css'),'utf8');
assert(!/\.preview-col-extra\s*\{\s*display:none/.test(css),'PDF must not hide configured columns');
console.log('Configured customer labels, custom fields, order, shared PI terms and print column visibility passed.');
