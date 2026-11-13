'use strict';
const {app,BrowserWindow,nativeImage}=require('electron');
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const {PDFParse}=require('pdf-parse'),{renderElectronic}=require('../electron/electronic-pdf.cjs');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'fta-paper-qa-')));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,width:1000,height:900});
 const out='output/paper-backgrounds-qa';fs.mkdirSync(out,{recursive:true});
 try{
  await win.loadURL('data:text/html,<!doctype html><html><head></head><body></body></html>');await win.webContents.insertCSS(fs.readFileSync('styles.css','utf8')+fs.readFileSync('assets/document-workflow.css','utf8'));await win.webContents.executeJavaScript(fs.readFileSync('assets/document-backgrounds.js','utf8')+';void 0');await win.webContents.executeJavaScript(fs.readFileSync('assets/document-presentation.js','utf8')+';void 0');
  // These fixture windows have no server/business data; only the pure shared
  // presentation helper and actual application print styles are exercised.
  await win.webContents.executeJavaScript(`document.body.innerHTML='<article id="agency-preview"><header style="height:80px;background:#1f7047;color:white">CURRENT EDITED DOCUMENT</header><p>背景及颜色 / Français</p></article>';document.body.className='printing-agency';document.querySelector('#agency-preview').style.cssText='width:760px;min-height:700px;padding:0';`);
  const pixelCount=(data,target)=>{const b=nativeImage.createFromBuffer(data).toBitmap();let count=0;for(let i=0;i<b.length;i+=4)if(Math.abs(b[i]-target[2])<3&&Math.abs(b[i+1]-target[1])<3&&Math.abs(b[i+2]-target[0])<3)count++;return count;};
  for(const preset of ['paper-0','paper-1','paper-2'])for(const masked of [false,true]){
   await win.webContents.executeJavaScript(`DocumentPresentation.background(document.querySelector('#agency-preview'),{backgroundPreset:'${preset}',backgroundOpacity:${masked?.12:1},overlay:${masked?.82:0}})`);
   const source=await win.webContents.executeJavaScript(`getComputedStyle(document.querySelector('#agency-preview')).backgroundImage`);assert(source.includes('data:image/png;base64,'));
   if(preset==='paper-0')fs.writeFileSync(out+'/screen.png',(await win.webContents.capturePage()).toPNG());const electronic=await renderElectronic(win),restorePaper=await require('../electron/paper-backgrounds.cjs').preparePaperBackgrounds(win.webContents);let print;try{print=await win.webContents.printToPDF({printBackground:true,pageSize:'A4',preferCSSPageSize:true});}finally{await restorePaper();}
   for(const [mode,data]of [['electronic',electronic.previewPdf],['print',print]]){
    const parser=new PDFParse({data});try{const shot=(await parser.getScreenshot({desiredWidth:760,imageBuffer:true,imageDataUrl:false})).pages[0].data;assert(pixelCount(shot,[31,112,71])>2000,'document header color preserved in '+mode);assert.equal(pixelCount(shot,[255,102,179]),0,'transparent background must not produce a pink PDF shader');fs.writeFileSync(out+'/'+preset+'-'+(masked?'masked-':'')+mode+'.png',shot);}finally{await parser.destroy();}
   }
   assert.equal(await win.webContents.executeJavaScript(`getComputedStyle(document.querySelector('#agency-preview')).backgroundImage`),source,'temporary PDF layout leaves paper background unchanged');
  }
  const catalogSource=await win.webContents.executeJavaScript('DocumentBackgrounds.presets[1].src');
  const catalog=await require('../electron/catalog-output.cjs')(BrowserWindow,'<style>@page{size:A4}body{margin:0;width:760px;background-image:linear-gradient(#ffffffeb,#ffffffeb),url("'+catalogSource+'")}</style><h1>CATALOG 当前内容</h1>'+Array.from({length:100},(_,i)=>'<p>Product '+i+'</p>').join(''));
  try{assert(catalog.webContents.getURL().startsWith('file:'));const result=await renderElectronic(catalog),parser=new PDFParse({data:result.pdf});try{const text=(await parser.getText()).text;assert(text.includes('Product 99'));const shot=(await parser.getScreenshot({desiredWidth:760,imageBuffer:true,imageDataUrl:false})).pages[0].data;assert.equal(pixelCount(shot,[255,102,179]),0,'catalog white mask never turns pink');}finally{await parser.destroy();}}finally{catalog.destroy();}
  console.log('PASS three paper-only presets with full/default masked opacity, green header in electronic/print renderings, unchanged background after output, catalog local-file rendering and last product');
 }finally{win.destroy();app.quit();}
}).catch(error=>{console.error(error);app.exit(1)});
