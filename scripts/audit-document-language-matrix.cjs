const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
process.env.QUOTE_DATA_DIR=fs.mkdtempSync(path.join(os.tmpdir(),'fta-locale-matrix-'));
app.setPath('userData',path.join(process.env.QUOTE_DATA_DIR,'profile'));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),win=new BrowserWindow({show:false,webPreferences:{backgroundThrottling:false}});
 const run=s=>win.webContents.executeJavaScript(s),results=[];
 try{
  await win.loadURL('http://127.0.0.1:'+server.address().port);
  for(let i=0;i<200&&!await run('!!window.quoteApp');i++)await new Promise(r=>setTimeout(r,40));
  for(const type of ['quotation','invoice','contract','commercial','packing','authorization','statement','procurement','invitation']){
   await run(`document.querySelector('[data-create-document=${type}]').click()`);
   const selection=await run(`(()=>{const input=document.querySelector('#view-${['authorization','statement','procurement'].includes(type)?'agency':type==='invitation'?'invitation':'quote'} .document-batch-choices input');input.checked=false;const off=getComputedStyle(input).backgroundColor;input.checked=true;const on=getComputedStyle(input).backgroundColor,mark=getComputedStyle(input,'::before').content,border=getComputedStyle(input.closest('label')).borderTopColor;input.checked=false;return {off,on,mark,border}})()`);
   assert.equal(selection.off,'rgb(148, 163, 184)',type+' unchecked grey');assert.equal(selection.on,'rgb(22, 163, 74)',type+' checked green');assert(selection.mark.includes('✓'),type+' check marker');assert.equal(selection.border,'rgb(22, 163, 74)',type+' checked border');
   const kind=['authorization','statement','procurement'].includes(type)?'agency':type==='invitation'?'invitation':'quote';
   const id=kind==='quote'?'pdf-language':kind+'-language',states={};
   for(const lang of ['bilingual','en','fr','ja','es','ru','ar','it','de','ko']){
    states[lang]=await run(`(()=>{const s=document.getElementById('${id}');s.value='${lang}';s.dispatchEvent(new Event('change',{bubbles:true}));const h=document.getElementById('${kind}-preview');return {selected:s.value,title:h.querySelector('h1')?.textContent||h.querySelector('.preview-title h2')?.textContent,headings:[...h.querySelectorAll('h2,h3')].map(n=>n.textContent.trim()),clauses:[...h.querySelectorAll('.agency-clause,.document-contract-clause')].map(n=>n.textContent.trim()),paragraphs:[...h.querySelectorAll('p,li')].map(n=>n.textContent.trim()),text:h.innerText,lang:h.lang,dir:h.dir}})()`);
   }
   for(const lang of ['en','fr','ja','es','ru','ar','it','de','ko']){
    const s=states[lang];
    assert.equal(s.selected,lang,`${type}/${lang} selection`);assert.equal(s.lang,lang,`${type}/${lang} host language`);assert.equal(s.dir,lang==='ar'?'rtl':'ltr');
    assert(!/\[(?:fr|es|ja|ru|ar|it|de|ko):/.test(s.text),`${type}/${lang} unresolved translations`);
    if(lang!=='en'){
     assert.notEqual(s.text,states.en.text,`${type}/${lang} unchanged from English`);
     const untranslated=s.paragraphs.filter(p=>p.length>100&&/[a-z]{15}/i.test(p)&&states.en.paragraphs.includes(p));
     assert.deepEqual(untranslated,[],`${type}/${lang} English fixed paragraphs`);
    }
    results.push({type,language:lang,...s,identicalToBilingual:s.text===states.bilingual.text,identicalToEnglish:lang!=='en'&&s.text===states.en.text,englishHeadings:s.headings.filter(h=>states.en.headings.includes(h)&&/[a-z]{3}/i.test(h)),englishClauses:s.clauses.filter(c=>states.en.clauses.includes(c)&&/[a-z]{3}/i.test(c))});
   }
  }
  const out=path.resolve('output/language-matrix');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify(results,null,2));
  for(const type of [...new Set(results.map(r=>r.type))])console.log(JSON.stringify({type,cases:results.filter(r=>r.type===type).map(r=>({language:r.language,title:r.title,identicalToBilingual:r.identicalToBilingual,identicalToEnglish:r.identicalToEnglish,englishHeadings:r.englishHeadings,englishClauses:r.englishClauses.length,dir:r.dir}))}));
  console.log('AUDIT '+results.length+' previews; '+out);
 }finally{win.destroy();server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1)});
