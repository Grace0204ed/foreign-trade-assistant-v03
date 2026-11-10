'use strict';
// Preserve downloaded SVG sources and bundle raster equivalents, avoiding
// Chromium/PDF viewer differences when SVG is used as a repeating print tile.
const {app,BrowserWindow}=require('electron'),fs=require('fs');
app.whenReady().then(async()=>{const win=new BrowserWindow({show:false});try{
 await win.loadURL('about:blank');
 const names=['简洁细纹','商务微点','工程细格'],presets=[];
 for(const [i,file]of ['18-ruled-fine-blue','06-dots-gray','04-graph-gray'].entries()){
  const svg='data:image/svg+xml;base64,'+fs.readFileSync('assets/document-backgrounds/'+file+'.svg').toString('base64');
  const png=await win.webContents.executeJavaScript(`(async()=>{const image=new Image();image.src=${JSON.stringify(svg)};await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width*2;canvas.height=image.height*2;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/png');})()`);
  fs.writeFileSync('assets/document-backgrounds/'+file+'.png',Buffer.from(png.split(',')[1],'base64'));presets.push({id:'paper-'+i,name:names[i],src:png});
 }
 fs.writeFileSync('assets/document-backgrounds.js',`(function(root){'use strict';const presets=${JSON.stringify(presets)};root.DocumentBackgrounds={presets,source:design=>design?.backgroundDataUrl||presets.find(p=>p.id===design?.backgroundPreset)?.src||'',options:selected=>'<option value="">无背景</option>'+presets.map(p=>'<option value="'+p.id+'" '+(selected===p.id?'selected':'')+'>'+p.name+'</option>').join('')};})(window);\n`);
}finally{win.destroy();app.quit();}}).catch(e=>{console.error(e);app.exit(1)});
