const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{PDFParse}=require('pdf-parse');
const P=require('../assets/document-presentation'),compact=s=>s.normalize('NFKC').replaceAll('⻋','车').replace(/\s/g,'');
(async()=>{
 const results=[];
 const files=['quotation','invoice','contract','commercial','packing','invitation','authorization','agreement','statement','procurement'].map(name=>path.resolve('output/release-qa/pdfs',name+'.pdf'));
 files.push(...['en','zh','bilingual'].map(lang=>path.resolve('output/iteration-qa','pi-'+lang+'.pdf')));
 for(const file of files){
   const parser=new PDFParse({data:fs.readFileSync(file)});
   try{const text=await parser.getText();assert(text.pages.length>0);for(const page of text.pages)assert(compact(page.text).length>20,'Blank page: '+file);
     const name=path.basename(file);let all=compact(text.pages.map(p=>p.text).join(''));
     if(name==='invitation.pdf')assert.equal(text.pages.length,1,'Ordinary invitation signature should fit on its first page');
     if(name.startsWith('pi-')){
       // Chromium emits CJK compatibility glyphs and PDF text extraction can
       // place a page's letterhead after its body. Remove only measured headers.
       const headers=JSON.parse(fs.readFileSync('output/iteration-qa/expected-pi-headers.json','utf8'));
       for(const header of headers[name.slice(3,-4)]||[])all=all.replaceAll(compact(header),'');
       if(name!=='pi-zh.pdf')assert(all.includes(compact(P.paymentShipping.en)),'English PI terms clipped or changed');
       if(name!=='pi-en.pdf')assert(all.includes(compact(P.paymentShipping.zh)),'Chinese PI terms clipped or changed');
       if(name==='pi-en.pdf')assert(!all.includes('付款及运输条款：收到30%'),'Chinese terms leaked into English');
       if(name==='pi-zh.pdf')assert(!all.includes('Uponreceiptofthe30%deposit'),'English terms leaked into Chinese');
     }
     results.push({file,pages:text.pages.length,pageCharacters:text.pages.map(p=>compact(p.text).length)});
   }finally{await parser.destroy();}
 }
 fs.writeFileSync(path.resolve('output/iteration-qa/pdf-audit.json'),JSON.stringify(results,null,2));
 console.log('PASS 13 exported PDFs: readable text on every page; complete exact English/Chinese PI terms and language isolation. Total pages: '+results.reduce((s,r)=>s+r.pages,0));
})().catch(e=>{console.error(e);process.exitCode=1});
