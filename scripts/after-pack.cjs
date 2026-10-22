const fs=require('fs/promises'),path=require('path');
module.exports=async context=>{
  // The development Electron distribution includes its welcome app; never ship it.
  const root=path.resolve(context.appOutDir),target=path.resolve(root,'resources','default_app.asar');
  if(!target.startsWith(root+path.sep))throw Error('Invalid output path');
  await fs.rm(target,{force:true});
  // Optional official prebuilt binary for packaging while a development server has
  // its Node-ABI DLL locked. Never replace the DLL used by the running old app.
  if(process.env.SQLITE_ELECTRON_BINARY){
    const binary=path.resolve(process.env.SQLITE_ELECTRON_BINARY);
    await fs.copyFile(binary,path.join(root,'resources','app.asar.unpacked','node_modules','better-sqlite3','build','Release','better_sqlite3.node'));
  }
};
