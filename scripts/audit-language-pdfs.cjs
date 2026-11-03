const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {PDFParse}=require('pdf-parse'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const root=path.resolve('output/language-qa'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')),results=[],continuations=[];
 assert.equal(manifest.length,90);
 // Contact sheets must preserve the PDF aspect ratio, including landscape.
 async function drawPage(ctx,file,x,y){const img=await loadImage(file),scale=Math.min(438/img.width,620/img.height);ctx.fillStyle='#fff';ctx.fillRect(x,y,438,620);ctx.drawImage(img,x+(438-img.width*scale)/2,y,img.width*scale,img.height*scale);}
 for(const row of manifest){const parser=new PDFParse({data:fs.readFileSync(row.file)});try{
  const text=await parser.getText();assert(text.pages.length>0);for(const p of text.pages){assert(p.text.replace(/\s/g,'').length>25,`Blank page ${row.file}`);assert(!p.text.includes('\uFFFD'),`Missing glyph ${row.file}`);}
  if(!['invitation','authorization','statement'].includes(row.type))assert(text.text.includes('Dynapac CA402'),'Missing product text '+row.file);
  if(row.type==='statement')assert(text.text.includes('SC-QA-456'),'Missing contract reference '+row.file);
  if(row.type==='invitation')assert(text.text.includes('QA-PASS-789'),'Missing passport reference '+row.file);
  if(['quotation','invoice','contract','commercial','packing','invitation'].includes(row.type))assert.equal(text.pages.length,1,'Short language fixture should fit one sheet: '+row.file);
  if(row.type==='statement')assert(text.pages.length<=2,'Commission signature orphaned on a third page: '+row.file);
  if(row.type==='authorization'&&text.pages.length>1){const last=text.pages.at(-1).text;assert(/5%|%5/.test(last)&&/10%|%10/.test(last)&&last.includes('QA Signer'),'Certificate terms must accompany the signature: '+row.file);}
  results.push({...row,pages:text.pages.length});
  const rendered=await parser.getScreenshot({desiredWidth:1000,imageBuffer:true,imageDataUrl:false});assert.equal(rendered.pages.length,text.pages.length,'Every actual PDF page must render');
  for(const page of rendered.pages){const number=page.pageNumber,stem=row.file.slice(0,-4)+(number===1?'':'-page-'+number);fs.writeFileSync(stem+'.png',page.data);if(number>1)continuations.push({...row,page:number,image:stem+'.png'});}
 }finally{await parser.destroy();}
 }
 if(continuations.length){const canvas=createCanvas(1350,Math.ceil(continuations.length/3)*650),ctx=canvas.getContext('2d');ctx.fillStyle='#e8edf5';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<continuations.length;i++){const row=continuations[i],x=i%3*450,y=Math.floor(i/3)*650;ctx.fillStyle='#172033';ctx.font='18px sans-serif';ctx.fillText(row.type+' / '+row.lang+' / page '+row.page,x+12,y+24);await drawPage(ctx,row.image,x+6,y+30);}
  fs.writeFileSync(path.join(root,'continuation-contact.png'),canvas.toBuffer('image/png'));
 }
 for(const type of new Set(results.map(r=>r.type))){const group=results.filter(r=>r.type===type),height=Math.ceil(group.length/3)*650,canvas=createCanvas(1350,height),ctx=canvas.getContext('2d');ctx.fillStyle='#e8edf5';ctx.fillRect(0,0,1350,height);
  for(let i=0;i<group.length;i++){const x=(i%3)*450,y=Math.floor(i/3)*650;ctx.fillStyle='#172033';ctx.font='18px sans-serif';ctx.fillText(type+' / '+group[i].lang+' / '+group[i].pages+'p',x+12,y+24);await drawPage(ctx,group[i].file.slice(0,-4)+'.png',x+6,y+30);}
  fs.writeFileSync(path.join(root,type+'-contact.png'),canvas.toBuffer('image/png'));
 }
 fs.writeFileSync(path.join(root,'audit.json'),JSON.stringify(results,null,2));console.log('PASS 90 PDFs: readable extracted text, no empty pages or replacement glyphs, product content retained. Nine rendered contact sheets: '+root);
})().catch(e=>{console.error(e);process.exitCode=1;});
