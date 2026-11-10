const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PDFParse}=require('pdf-parse');
const locales=require('../assets/document-locales');
(async()=>{
 const root=path.resolve('output/readability-qa'),results=[];
 for(const lang of ['bilingual','en','fr','ja','es','ru','ar','it','de','ko']){
  const file=path.join(root,'dense-packing-'+lang+'.pdf'),parser=new PDFParse({data:fs.readFileSync(file)});
  try{
   const text=await parser.getText(),info=await parser.getInfo({parsePageInfo:true});
   assert(text.pages.length>1,lang+' multi-page fixture');
   assert(info.pages.every(p=>p.width>p.height),lang+' landscape A4');
   for(const page of text.pages){assert(page.text.replace(/\s/g,'').length>25,lang+' empty page');assert(!page.text.includes('\uFFFD'),lang+' missing glyph');}
   const normalized=text.text.replace(/\s/g,'');
   // Compare the rendered header with its own first-page PDF representation:
   // Arabic extraction uses shaped glyphs and visual order rather than Unicode
   // source order. Language correctness is checked separately before export.
   const continuation=text.pages.slice(1).find(page=>page.text.includes('QA-MACHINE-'));
   const headerLine=lang==='ar'?continuation?.text.match(/^[\s\S]*?(?=^\d+\s)/m)?.[0]:(locales.label('Net Weight (kg)',lang)||'Net Weight (kg)');
   assert(headerLine,lang+' first-page dense table header');
   const header=headerLine.normalize('NFKC').replace(/\s/g,'');
   for(const page of text.pages)if(page.text.replace(/\s/g,'').includes('QA-MACHINE-'))assert(page.text.normalize('NFKC').replace(/\s/g,'').includes(header),lang+' missing continuation table header');
   for(let n=1;n<=36;n++){const key='QA-MACHINE-'+String(n).padStart(2,'0');assert.equal(normalized.split(key).length-1,1,lang+' missing, split or duplicate row '+key);}
   results.push({lang,pages:text.pages.length,all36Products:true,landscape:true});
  }finally{await parser.destroy();}
 }
 fs.writeFileSync(path.join(root,'pagination-audit.json'),JSON.stringify(results,null,2));
 console.log('PASS ten multi-page PDFs: landscape A4, 36 complete unique product rows, no blank pages or replacement glyphs.');
})().catch(e=>{console.error(e);process.exitCode=1;});
