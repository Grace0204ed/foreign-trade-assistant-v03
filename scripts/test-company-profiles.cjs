const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict'),D=require('better-sqlite3');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-company-test-'));
if(process.env.TEST_SOURCE_DB){const d=new D(process.env.TEST_SOURCE_DB,{readonly:true});await d.backup(path.join(process.env.QUOTE_DATA_DIR,'foreign-trade-assistant.sqlite'));d.close();}
const s=await require('../server/index').startServer(0),base='http://127.0.0.1:'+s.address().port;
const b=await chromium.launch({executablePath:process.env.TEST_BROWSER,headless:true});
try{
const page=await b.newPage();page.on('dialog',d=>d.accept());await page.goto(base);await page.waitForFunction(()=>document.querySelector('#pdf-language option[value="fr"]'));await page.evaluate(()=>document.querySelector('[data-view="settings"]').click());await page.waitForFunction(()=>document.querySelector('#add-company-profile')?.disabled===false);
const click=id=>page.evaluate(id=>document.getElementById(id).click(),id);
const read=()=>{const d=new D(path.join(process.env.QUOTE_DATA_DIR,'foreign-trade-assistant.sqlite'),{readonly:true});const data=JSON.parse(d.prepare('SELECT data_json FROM company_settings WHERE id=1').get().data_json);d.close();return data;};
const old=await page.evaluate(()=>structuredClone(window.quoteSettingsContext.settings));const count=await page.locator('#company-profile-select option').count();
await click('add-company-profile');await page.waitForTimeout(800);console.log(await page.locator('#toast').textContent());await page.waitForFunction(n=>document.querySelectorAll('#company-profile-select option').length===n,count+1);
let fresh=read();const id=fresh.activeCompanyId;
assert.equal(fresh.stampDataUrl,'');assert.ok(!fresh.agencySignatureDataUrl);assert.ok(fresh.bankFields.every(f=>!f.value));assert.ok(fresh.contactFields.every(f=>!f.value));
await page.evaluate(()=>{document.querySelector('[data-setting="companyNameZh"]').value='测试出口公司';document.querySelector('[data-setting="companyNameEn"]').value='Test Export Ltd';});
await click('save-company-profile');await page.waitForFunction(()=>document.querySelector('#company-profile-select option:checked').textContent==='测试出口公司');
assert.equal(read().companyNameEn,'Test Export Ltd');
await page.reload();await page.waitForFunction(()=>document.querySelector('#pdf-language option[value="fr"]'));await page.evaluate(()=>document.querySelector('[data-view="settings"]').click());await page.waitForFunction(()=>document.querySelector('#company-profile-select option:checked')?.textContent==='测试出口公司');
await page.selectOption('#company-profile-select',old.activeCompanyId);await page.waitForFunction(id=>document.querySelector('#company-profile-select').value===id&&document.querySelector('[data-setting="companyNameEn"]').value!=='Test Export Ltd',old.activeCompanyId);
assert.equal(read().stampDataUrl,old.stampDataUrl);assert.equal(read().agencySignatureDataUrl,old.agencySignatureDataUrl);
await page.selectOption('#company-profile-select',id);await page.waitForFunction(()=>document.querySelector('[data-setting="companyNameEn"]').value==='Test Export Ltd');
await click('delete-company-profile');await page.waitForFunction(n=>document.querySelectorAll('#company-profile-select option').length===n,count);
assert.ok(!read().companyProfiles.some(p=>p.id===id));
console.log('PASS: create blank company, names editable, persist/reload, switch assets isolated, delete company.');
}finally{await b.close();await new Promise(r=>s.close(r));require('../server/db').db.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
