module.exports=async function openLegacyProcurement(win,base,extra={}){
 const assert=require('node:assert/strict'),id=extra.id||'qa-legacy-procurement',number=extra.authorizationNumber||'QA-LEGACY-PROCUREMENT',type=extra.documentType||'procurement';
 const response=await fetch(base+'/api/agent-authorizations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,authorizationNumber:number,documentType:'procurement',recordClass:'history',language:'en',date:'2026-11-03',personalLegalName:'QA Legacy Customer',purchaseMachine:'QA Legacy Machine',purchaseAmount:23000,purchaseFee:3500,...extra,isTemplate:false})});assert(response.ok,await response.text());
 const run=s=>win.webContents.executeJavaScript(s),wait=async predicate=>{for(let i=0;i<200;i++){if(await run(predicate))return;await new Promise(r=>setTimeout(r,30));}throw Error('Legacy history timeout '+predicate);};
 await run(`window.decideCloseWork?.('discard')`);
 await run(`document.querySelector('[data-view=history]').click();document.querySelector('#history-document-type').value=${JSON.stringify(type)};document.querySelector('#history-keyword').value=${JSON.stringify(number)};document.querySelector('#history-document-type').dispatchEvent(new Event('change',{bubbles:true}))`);
 await wait(`document.querySelector('#unified-history-list')?.textContent.includes(${JSON.stringify(number)})&&!!document.querySelector('#unified-history-list .history-actions button')`);
 await run(`document.querySelector('#unified-history-list .history-actions button').click()`);
 await wait(`document.querySelector('#view-agency.active #agency-number')?.value===${JSON.stringify(number)}`);
 await run(`document.querySelector('#history-keyword').value='';document.querySelector('#history-document-type').value=''`);
};
