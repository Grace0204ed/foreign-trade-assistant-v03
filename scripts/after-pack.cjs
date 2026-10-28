const fs=require('fs/promises'),path=require('path'),os=require('os');
const {spawn}=require('child_process');

function verifyPackagedRuntime(executable,root){
  return new Promise((resolve,reject)=>{
    const probeDir=path.join(os.tmpdir(),`fta-package-check-${process.pid}-${Date.now()}`);
    const output=[];
    const child=spawn(executable,[],{
      cwd:root,
      windowsHide:true,
      env:{...process.env,FTA_PACKAGED_SELF_TEST:'1',QUOTE_DATA_DIR:probeDir},
      stdio:['ignore','pipe','pipe']
    });
    child.stdout.on('data',chunk=>output.push(String(chunk)));
    child.stderr.on('data',chunk=>output.push(String(chunk)));
    const timer=setTimeout(()=>{
      child.kill();
      reject(new Error(`Packaged runtime self-test timed out.\n${output.join('')}`));
    },30000);
    child.on('error',error=>{clearTimeout(timer);reject(error);});
    child.on('exit',async code=>{
      clearTimeout(timer);
      await fs.rm(probeDir,{recursive:true,force:true}).catch(()=>{});
      const text=output.join('');
      if(code===0&&text.includes('FTA_PACKAGED_SELF_TEST_OK'))return resolve();
      reject(new Error(`Packaged runtime self-test failed with exit code ${code}.\n${text}`));
    });
  });
}

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
  const nativeBinary=path.join(root,'resources','app.asar.unpacked','node_modules','better-sqlite3','build','Release','better_sqlite3.node');
  await fs.access(nativeBinary);
  const executable=path.join(root,`${context.packager.appInfo.productFilename}.exe`);
  await verifyPackagedRuntime(executable,root);
};
