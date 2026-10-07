const assert=require('node:assert/strict');
const A=require('../assets/agency-documents');
const sample={documentType:'statement',agentName:'Example Agent',country:'Example',authorizationNumber:'OCS-20261007-001',customerName:'Buyer',salesContractNumber:'S-1',relatedAgreement:'COM-1',currency:'USD',contractAmount:'100000',orderRate:'5',commissionBasis:'rate',bankDetails:'Example account'};
assert.equal(A.calculate(sample),5000);
assert.equal(A.calculate({...sample,commissionBasis:'markup',markupAmount:'8000'}),8000);
assert.equal(A.calculate({...sample,commissionBasis:'markup',markupAmount:'1000'}),5000);
assert.equal(A.calculate({...sample,orderRate:'10',commissionBasis:'markup',markupAmount:'8000'}),10000);
assert.equal(A.calculate({...sample,contractAmount:''}),null);
assert.equal(A.calculate({...sample,orderRate:'4'}),null);
assert.equal(A.calculate({...sample,contractAmount:'Infinity'}),null);
assert.equal(A.calculate({...sample,commissionBasis:'markup',markupAmount:''}),null);
assert.equal(A.validate(sample,true),'');
assert.notEqual(A.validate({...sample,bankDetails:''},true),'');
assert.equal(A.validate({...sample,isTemplate:true,contractAmount:'',bankDetails:''},true),'');
assert.equal(A.number('agreement','2026-10-07',[{authorizationNumber:'COM-20261007-001'}]),'COM-20261007-002');
assert.equal(A.type({}),'authorization');
for(const documentType of ['agreement','statement'])for(const language of ['bilingual','zh','en','fr','es','zh-fr','zh-es']){
 const html=A.render({...sample,documentType,language,company:'Example Co',authorizerTitle:'Manager'},{});
 assert.ok(/100\s*%/.test(html));assert.ok(!html.includes('undefined'));
 if(['en','fr','es'].includes(language))assert.ok(!/[\u4e00-\u9fff]/.test(html),language);
}
assert.ok(A.render({...sample,customerName:'<script>alert(1)</script>'},{}).includes('&lt;script&gt;'));
console.log('Agency templates: calculations, 5% floor, blanks, validation, numbering, 7 language modes and escaping passed.');
