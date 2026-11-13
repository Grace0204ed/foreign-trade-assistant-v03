'use strict';
const {PDFDocument,PDFName,PDFNumber}=require('pdf-lib');
// Render one continuous electronic sheet. Native Chromium fragments are only
// an internal size-limit workaround; the exported PDF retains one vector page.
async function renderElectronic(win){
 const wc=win.webContents,attached=wc.debugger.isAttached();let style,restorePaper;
 if(!attached)wc.debugger.attach('1.3');
 try{
  await wc.debugger.sendCommand('Emulation.setEmulatedMedia',{media:'print'});
  restorePaper=await require('./paper-backgrounds.cjs').preparePaperBackgrounds(wc);
  style=await wc.insertCSS(`html,body,.app-shell,.main,.view,.quote-output-pane,.quote-preview-viewport,.quote-preview,#agency-preview,#invitation-preview{min-height:0!important;height:auto!important;max-height:none!important;overflow:visible!important}body *{page:auto!important;break-before:auto!important;break-after:auto!important;break-inside:auto!important;orphans:1!important;widows:1!important}thead{display:table-row-group!important}`);
  const size=await wc.executeJavaScript(`(()=>{const root=document.querySelector('body.printing-standard #quote-preview,body.printing-invitation #invitation-preview,body.printing-agency #agency-preview')||document.body;const r=root.getBoundingClientRect();return {width:Math.max(120,Math.ceil(r.width)),height:Math.max(60,Math.ceil(Math.max(r.height,root===document.body?0:root.scrollHeight)+(root===document.body?Math.max(0,r.top):0))+3)}})()`);
  const height=Math.min(size.height,18000),width=size.width;
  const pageStyle=await wc.insertCSS(`@page{size:${width}px ${height}px!important;margin:0!important}html,body{width:${width}px!important;max-width:${width}px!important;margin:0!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}`);
  let native;try{native=await wc.printToPDF({printBackground:true,preferCSSPageSize:false,pageSize:{width:width/96,height:height/96},margins:{top:0,bottom:0,left:0,right:0}});}finally{await wc.removeInsertedCSS(pageStyle);}
  const input=await PDFDocument.load(native),output=await PDFDocument.create(),segments=await PDFDocument.create();
  const pages=input.getPages(),w=pages[0].getWidth(),total=size.height*.75,unit=Math.max(1,total/14000),sheet=output.addPage([w/unit,total/unit]);
  if(unit>1)sheet.node.set(PDFName.of('UserUnit'),PDFNumber.of(unit));
  let offset=0;
  for(const page of pages){const h=Math.min(page.getHeight(),Math.max(0,total-offset));if(h<.1)break;const box={left:0,bottom:page.getHeight()-h,right:w,top:page.getHeight()};const embedded=await output.embedPage(page,box),part=await segments.embedPage(page,box);sheet.drawPage(embedded,{x:0,y:(total-offset-h)/unit,width:w/unit,height:h/unit});segments.addPage([w,h]).drawPage(part,{x:0,y:0,width:w,height:h});offset+=h;}
  if(offset+2<total)throw Error('电子文档内容未完整生成，请重试');
  return {pdf:Buffer.from(await output.save()),previewPdf:Buffer.from(await segments.save()),width:w,height:total};
 }finally{if(restorePaper)await restorePaper();if(style)await wc.removeInsertedCSS(style);await wc.debugger.sendCommand('Emulation.setEmulatedMedia',{media:''});if(!attached)wc.debugger.detach();}
}
module.exports={renderElectronic};
