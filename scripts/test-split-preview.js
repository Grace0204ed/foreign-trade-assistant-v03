const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{
 process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-split-'));
 if(process.env.TEST_SOURCE_DB){const D=require('better-sqlite3'),db=new D(process.env.TEST_SOURCE_DB,{readonly:true});await db.backup(path.join(process.env.QUOTE_DATA_DIR,'foreign-trade-assistant.sqlite'));db.close();}
 const server=await require('../server/index').startServer(0);
 const browser=await chromium.launch({executablePath:process.env.TEST_BROWSER,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForTimeout(1200);
  await page.click('[data-view-target="create"]');await page.click('[data-create-document="quotation"]');
  await page.fill('#buyer-company','SPLIT PREVIEW TEST');
  await page.waitForFunction(()=>document.querySelector('#quote-preview').textContent.includes('SPLIT PREVIEW TEST'));
  const left=await page.locator('.quote-input-pane').boundingBox(),right=await page.locator('.quote-output-pane').boundingBox();
  assert(right.y>=left.y+left.height,'preview must be below editor');
  await page.locator('.quote-input-pane').evaluate(e=>e.scrollTop=500);
  assert.equal(await page.locator('.quote-output-pane').evaluate(e=>e.scrollTop),0,'independent scrolling');
  await page.screenshot({path:path.join(process.env.QUOTE_DATA_DIR,'desktop.png')});
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.quote-input-pane').evaluate(e=>getComputedStyle(e).display),'none');
  assert.equal(await page.locator('.quote-split-workspace').evaluate(e=>getComputedStyle(e).display),'block');
  await page.emulateMedia({media:'screen'});await page.setViewportSize({width:768,height:900});
  assert.equal(await page.locator('.quote-split-workspace').evaluate(e=>getComputedStyle(e).display),'block');
  console.log('PASS stacked editor, live update, narrow layout and print isolation. '+path.join(process.env.QUOTE_DATA_DIR,'desktop.png'));
 }finally{await browser.close();await new Promise(r=>server.close(r));require('../server/db').db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
