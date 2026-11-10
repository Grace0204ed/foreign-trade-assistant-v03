'use strict';
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const {PDFDocument,PDFName}=require('pdf-lib');
const {renderElectronic}=require('../electron/electronic-pdf.cjs');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'fta-continuous-pdf-')));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,width:900,height:700});
 try{
  for(const rows of [3,100,600]){
   await win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<!doctype html><style>@page{size:A4;margin:14mm}body{margin:0;width:760px;font:16px sans-serif}p{margin:0;height:40px;background:#e8f4fa;color:#174b70}</style>'+Array.from({length:rows},(_,i)=>'<p>ROW-'+i+' unique text</p>').join('')));
   const result=await renderElectronic(win),pdf=await PDFDocument.load(result.pdf),pages=pdf.getPages();
   assert.equal(pages.length,1,'electronic PDF is one continuous page');
   const unit=pages[0].node.get(PDFName.of('UserUnit'))?.asNumber()||1;
   assert(Math.abs(pages[0].getHeight()*unit-rows*30)<5,'normal text size with growing paper height');
   const {PDFParse}=require('pdf-parse'),parser=new PDFParse({data:result.pdf});
   try{const text=(await parser.getText()).text;for(let i=0;i<rows;i++)assert(text.includes('ROW-'+i+' unique text'),'missing row '+i);}finally{await parser.destroy();}
   const printed=await PDFDocument.load(await win.webContents.printToPDF({printBackground:true,pageSize:'A4',preferCSSPageSize:true}));
   if(rows===3)assert.equal(printed.getPageCount(),1);else assert(printed.getPageCount()>1,'printing naturally paginates A4');
   fs.mkdirSync('output/electronic-pdf-qa',{recursive:true});fs.writeFileSync('output/electronic-pdf-qa/rows-'+rows+'.pdf',result.pdf);
   console.log('PASS',rows,'rows: electronic one page; A4 print',printed.getPageCount(),'pages; all text retained');
  }
 }finally{win.destroy();app.quit();}
}).catch(error=>{console.error(error);app.exit(1)});
