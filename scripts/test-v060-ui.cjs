const assert=require('assert');
const fs=require('fs');const os=require('os');const path=require('path');const {spawn}=require('child_process');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..'),data=fs.mkdtempSync(path.join(os.tmpdir(),'fta-v060-ui-')),port=19876;
const server=spawn(process.execPath,['server/index.js'],{cwd:root,env:{...process.env,PORT:String(port),QUOTE_DATA_DIR:data},stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{let browser;try{for(let i=0;i<40;i++){try{const r=await fetch(`http://127.0.0.1:${port}/api/auth/me`);if(r.ok)break;}catch{}await wait(200);}
 browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle'});
 assert.equal(await page.locator('[data-view-target="freight"]').count(),0);assert.equal(await page.locator('#quote-business-vehicle').count(),0);assert.equal(await page.locator('#global-freight-calculator').count(),1);
 await page.locator('.freight-fab').click();await page.locator('[data-mode="arithmetic"]').click();await page.locator('[data-expression]').fill('5500+200+300');await page.locator('[data-expression]').press('Enter');assert.match(await page.locator('[data-arithmetic-result]').innerText(),/6000/);
 await page.locator('[data-view-target="settings"]').click();for(const section of ['product-config','customer-config','document-designer','software-update'])assert.equal(await page.locator(`[data-settings-section="${section}"]`).count(),1);
 await page.locator('[data-settings-section="document-designer"]').click();assert.equal(await page.locator('#document-designer-canvas').count(),1);
 assert.deepEqual(errors,[]);await page.screenshot({path:path.join(data,'v060-ui.png'),fullPage:true});console.log(JSON.stringify({ok:true,data,screenshot:path.join(data,'v060-ui.png')}));
}finally{if(browser)await browser.close();server.kill();}})().catch(error=>{console.error(error);server.kill();process.exitCode=1;});
