'use strict';
const {randomUUID}=require('node:crypto');

// Flatten only the white paper mask onto its image. Chromium/PDF readers can
// misrender the otherwise valid translucent gradient as a magenta PDF shader.
// This touches the temporary output DOM, never the stored background asset.
async function preparePaperBackgrounds(webContents){
 const key='paper-backgrounds-'+randomUUID();
 try{
  await webContents.executeJavaScript(`(async()=>{
   const originals=[];window[${JSON.stringify(key)}]=originals;
   for(const element of new Set([document.body,...document.querySelectorAll('#quote-preview,#invitation-preview,#agency-preview')])){
    const style=getComputedStyle(element),background=style.backgroundImage;
    if(!background.startsWith('linear-gradient('))continue;
    const whites=[...background.matchAll(/rgba\\(255,\\s*255,\\s*255,\\s*([\\d.]+)\\)/g)];
    const source=background.match(/url\\(["']?(data:image\\/[^"')]+)["']?\\)/);
    if(whites.length!==2||whites[0][1]!==whites[1][1]||!source)continue;
    const image=new Image();image.src=source[1];await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const context=canvas.getContext('2d');if(!context)throw Error('纸面背景无法生成');
    context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0);context.fillStyle='rgba(255,255,255,'+Number(whites[0][1])+')';context.fillRect(0,0,canvas.width,canvas.height);
    originals.push({element,image:element.style.getPropertyValue('background-image'),priority:element.style.getPropertyPriority('background-image')});
    element.style.setProperty('background-image','url("'+canvas.toDataURL('image/png')+'")','important');
   }
  })()`);
 }catch(error){await restore().catch(()=>{});throw error;}
 async function restore(){if(webContents.isDestroyed())return;await webContents.executeJavaScript(`(()=>{for(const item of window[${JSON.stringify(key)}]||[]){if(item.image)item.element.style.setProperty('background-image',item.image,item.priority);else item.element.style.removeProperty('background-image');}delete window[${JSON.stringify(key)}];})()`);}
 return restore;
}
module.exports={preparePaperBackgrounds};
