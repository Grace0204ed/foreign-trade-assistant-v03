const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {PDFParse}=require('pdf-parse'),{createCanvas,loadImage}=require('@napi-rs/canvas');
(async()=>{
 const root=path.resolve('output/language-qa'),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')),results=[],continuations=[];
 assert.equal(manifest.length,63);
 for(const row of manifest){const parser=new PDFParse({data:fs.readFileSync(row.file)});try{
  const text=await parser.getText();assert(text.pages.length>0);for(const p of text.pages){assert(p.text.replace(/\s/g,'').length>25,`Blank page ${row.file}`);assert(!p.text.includes('\uFFFD'),`Missing glyph ${row.file}`);}
  if(!['invitation','authorization'].includes(row.type))assert(text.text.includes('Dynapac CA402'),'Missing product text '+row.file);
  results.push({...row,pages:text.pages.length});
 }finally{await parser.destroy();}
 execFileSync('pdftoppm',['-f','1','-singlefile','-scale-to','620','-png',row.file,row.file.slice(0,-4)],{stdio:'pipe'});
 for(let page=2;page<=results.at(-1).pages;page++){
  const stem=row.file.slice(0,-4)+'-page-'+page;execFileSync('pdftoppm',['-f',String(page),'-singlefile','-scale-to','620','-png',row.file,stem],{stdio:'pipe'});
  continuations.push({...row,page,image:stem+'.png'});
 }
 }
 if(continuations.length){const canvas=createCanvas(1350,Math.ceil(continuations.length/3)*650),ctx=canvas.getContext('2d');ctx.fillStyle='#e8edf5';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<continuations.length;i++){const row=continuations[i],x=i%3*450,y=Math.floor(i/3)*650;ctx.fillStyle='#172033';ctx.font='18px sans-serif';ctx.fillText(row.type+' / '+row.lang+' / page '+row.page,x+12,y+24);ctx.drawImage(await loadImage(row.image),x+6,y+30,438,620);}
  fs.writeFileSync(path.join(root,'continuation-contact.png'),canvas.toBuffer('image/png'));
 }
 for(const type of new Set(results.map(r=>r.type))){const group=results.filter(r=>r.type===type),canvas=createCanvas(1350,1950),ctx=canvas.getContext('2d');ctx.fillStyle='#e8edf5';ctx.fillRect(0,0,1350,1950);
  for(let i=0;i<group.length;i++){const x=(i%3)*450,y=Math.floor(i/3)*650;ctx.fillStyle='#172033';ctx.font='18px sans-serif';ctx.fillText(type+' / '+group[i].lang+' / '+group[i].pages+'p',x+12,y+24);ctx.drawImage(await loadImage(group[i].file.slice(0,-4)+'.png'),x+6,y+30,438,620);}
  fs.writeFileSync(path.join(root,type+'-contact.png'),canvas.toBuffer('image/png'));
 }
 fs.writeFileSync(path.join(root,'audit.json'),JSON.stringify(results,null,2));console.log('PASS 63 PDFs: readable extracted text, no empty pages or replacement glyphs, product content retained. Seven rendered contact sheets: '+root);
})().catch(e=>{console.error(e);process.exitCode=1;});
