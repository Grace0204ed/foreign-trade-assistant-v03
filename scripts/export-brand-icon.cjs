// Export the approved original artwork as application icon formats, without altering its design.
const {app,nativeImage}=require('electron'),fs=require('node:fs'),path=require('node:path');
app.whenReady().then(()=>{
 const dir=path.join(__dirname,'../assets'),source=path.join(dir,'brand-logo04.png');
 const png=nativeImage.createFromPath(source).resize({width:256,height:256,quality:'best'}).toPNG();
 if(!png.length)throw Error('Approved logo could not be read');
 fs.writeFileSync(path.join(dir,'app-icon.png'),png);
 const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);
 fs.writeFileSync(path.join(dir,'app-icon.ico'),Buffer.concat([header,png]));app.quit();
}).catch(error=>{console.error(error);app.exit(1)});
