const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const D=require('better-sqlite3');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
  process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-doc-test-'));
  if(process.env.TEST_SOURCE_DB){const source=new D(process.env.TEST_SOURCE_DB,{readonly:true});await source.backup(path.join(process.env.QUOTE_DATA_DIR,'foreign-trade-assistant.sqlite'));source.close();}
  const server=await require('../server/index').startServer(0);
  const browser=await chromium.launch({executablePath:process.env.TEST_BROWSER,headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.waitForFunction(()=>document.querySelector('#pdf-language option[value="fr"]'));
    await page.evaluate(()=>document.querySelector('[data-create-document="quotation"]').click());
    assert.equal(await page.locator('#quote-style-select option').count(),9);
    for(const type of ['quotation','invoice','contract','commercial','packing']) assert.equal(await page.locator(`#view-quote [data-switch-document="${type}"]`).count(),1);
    await page.fill('#buyer-company','DOCUMENT WORKSPACE TEST');
    await page.locator('[data-qfield="description"]').first().fill('HOWO 8x4 dump truck');
    await page.locator('[data-qfield="unitPrice"]').first().fill('30300');
    await page.locator('.quote-line-image-input').first().setInputFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
    await page.waitForFunction(()=>document.querySelector('#quote-preview .preview-product-image img'));
    assert.equal(await page.locator('#quote-preview .photo-grid').count(),0);
    await page.waitForFunction(()=>document.querySelector('#quote-autosave-status').textContent.includes('已保存'));
    await page.reload();await page.waitForFunction(()=>document.querySelector('#pdf-language option[value="fr"]'));
    await page.evaluate(()=>document.querySelector('[data-create-document="quotation"]').click());
    await page.click('#restore-quote-draft');
    await page.waitForFunction(()=>document.querySelector('#buyer-company').value==='DOCUMENT WORKSPACE TEST');
    assert.equal(await page.locator('#quote-preview .preview-product-image img').count(),1,'image survives recovery');
    await page.selectOption('#pdf-language','fr');await page.locator('#view-quote [data-switch-document=packing]').click();await page.selectOption('#pdf-language','fr');
    assert.equal(await page.locator('#quote-preview .preview-total').count(),0);
    assert.equal(await page.locator('#quote-preview .bank-panel').count(),0);
    assert.ok((await page.locator('#quote-preview').innerText()).includes('Liste de colisage'));
    assert.equal(await page.locator('#quote-preview .preview-col-unitPrice').count(),0);
    if(!await page.locator('#packing-editor').evaluate(el=>el.open))await page.locator('#packing-editor summary').click();
    for(const [key,value] of Object.entries({packages:'1',netWeight:'20000',grossWeight:'21000',cbm:'80',marks:'TEST-001'}))await page.locator(`[data-packing-key="${key}"]`).first().fill(value);
    assert.ok((await page.locator('#quote-preview').innerText()).includes('21000'));
    await page.click('#save-quote-btn');await page.waitForTimeout(700);
    const result=await(await page.request.get(`http://127.0.0.1:${server.address().port}/api/quotations?includeInactive=1`)).json();
    const saved=result.quotations.find(q=>JSON.stringify(q).includes('DOCUMENT WORKSPACE TEST'));assert.ok(saved,'saved draft exists');
    await page.evaluate(id=>window.quoteApp.editQuote(id),saved.id);
    assert.ok((await page.locator('#quote-preview').innerText()).includes('21000'),'packing persists server roundtrip');
    // Source linking and source isolation have their own current UI regression:
    // test-packing-link.cjs. This test retains recovery, images and languages.
    await page.selectOption('#quote-style-select','teal');
    await page.selectOption('#quote-preview-mode','center');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('#quote-preview').evaluate(el=>getComputedStyle(el).zoom),'1');
    await page.emulateMedia({media:'screen'});
    await page.selectOption('#quote-preview-mode','fit');
    assert.equal(await page.locator('#pdf-language').inputValue(),'fr','language survives server reopen');
    assert.ok((await page.locator('#quote-preview').innerText()).includes('Liste de colisage'));
    const out=path.join(process.env.QUOTE_DATA_DIR,'preview.png');await page.locator('#quote-preview').screenshot({path:out});
    assert.deepEqual(errors,[]);console.log('PASS workspace, recovery, packing persistence, languages, nine colors and print zoom. Screenshot: '+out);
  }finally{await browser.close();await new Promise(r=>server.close(r));require('../server/db').db.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
