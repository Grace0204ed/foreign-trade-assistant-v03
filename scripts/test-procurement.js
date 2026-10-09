const assert=require('node:assert/strict'),A=require('../assets/agency-documents');
const a={documentType:'procurement',language:'bilingual',authorizationNumber:'20261009-001',isTemplate:true,purchaseAmount:64000,purchaseFee:3500,authorizer:'Test',company:'DO_NOT_SHOW_COMPANY',companySnapshot:{stampDataUrl:'DO_NOT_SHOW_SEAL'}};
assert.equal(A.number('procurement','2026-10-09'), '20261009-001');
assert.equal(A.number('procurement','2026-10-09',[a]), '20261009-002');
assert.equal(A.validate(a,true),'');assert.match(A.render(a,{}),/67,500/);assert.ok(!A.render(a,{}).includes('DO_NOT_SHOW'));
assert.ok(A.validate({...a,isTemplate:false},true));assert.ok(A.validate({...a,purchaseFee:-1}));
assert.ok(!A.render({...a,authorizer:'<script>bad</script>'},{}).includes('<script>'));
assert.ok(A.render({...a,language:'en'},{}).includes('Personal Procurement'));assert.ok(!A.render({...a,language:'en'},{}).includes('个人委托'));
console.log('PASS personal procurement calculation, numbering, privacy, validation, escaping, language');
