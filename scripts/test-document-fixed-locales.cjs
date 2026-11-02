const assert=require('node:assert/strict');
const fixed=require('../assets/document-fixed-locales.js');
const locales=require('../assets/document-locales.js');
const A=require('../assets/agency-documents.js');
for(const [source,translations] of Object.entries(fixed.labels)){
 for(const lang of fixed.languages){
  assert(translations[lang]?.trim(),`${lang}: ${source}`);
  assert(!translations[lang].includes('undefined'),`${lang}: ${source}`);
 }
}
const titles=['Quotation','Proforma Invoice','Sales Contract','Commercial Invoice','Packing List','Invitation Letter','Letter of Authorization','Order Commission Statement','Personal Procurement Service Agreement'];
for(const lang of fixed.languages)for(const title of titles)assert(locales.label(title,lang),`${title}/${lang}`);
const fixture={authorizationNumber:'QA-001',agentName:'CUSTOM-NAME',company:'CUSTOM-COMPANY',country:'CUSTOM-COUNTRY',salesContractNumber:'CONTRACT-$&-001',contractAmount:30000,currency:'USD',fixedCommission:2000,orderRate:5,purchaseMachine:'CUSTOM-MODEL',purchaseAmount:23000,purchaseFee:3500};
for(const language of fixed.languages){
 assert(!A.text(['有效期至','Valid Until'],language).includes('['),`authorization validity/${language}`);
 for(const documentType of ['statement','procurement'])for(const paymentChannel of ['bank','crypto'])for(const commissionBasis of ['rate','fixed']){
  A.missingTranslations.clear();
  const html=A.render({...fixture,documentType,language,paymentChannel,commissionBasis},{});
  assert.deepEqual([...A.missingTranslations],[],`${documentType}/${language}/${paymentChannel}/${commissionBasis}`);
  assert(!/\[(?:fr|es|ja|ru|ar|it|de|ko):/.test(html));
  assert(html.includes('CUSTOM-NAME'));
  if(documentType==='statement'){
   assert(html.includes('CONTRACT-$&amp;-001'),'Contract value retained and escaped');
   assert(!html.includes('Party A shall arrange the bank remittance'));
   assert(!html.includes('Party A shall initiate the USDT transfer'));
   assert(html.includes(commissionBasis==='fixed'?'2,000.00':'1,500.00'));
  }else{
   assert(html.includes('CUSTOM-MODEL'));assert(html.includes('26,500'));
   assert(!html.includes('No instalments. Party B may pay'));
  }
 }
}
// Identifiers and arbitrary user copy must not be silently machine-translated.
assert.equal(locales.label('Port of Discharge','fr'),'Port de déchargement');
assert.equal(locales.label('Port of Discharge','es'),'Puerto de descarga');
assert.equal(fixed.lookup('Custom bank clause and MODEL-123','ja'),'');
console.log(`PASS ${Object.keys(fixed.labels).length} fixed copy entries x eight non-English languages; nine document titles; 64 commission/procurement branch cases; amounts, identifiers and escaping retained.`);
