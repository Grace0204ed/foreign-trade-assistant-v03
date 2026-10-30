const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'fta-recovery-'));
for(const phase of ['write','restore','verify']){
 const result=spawnSync(require('electron'),[path.join(__dirname,'test-work-recovery.cjs')],{env:{...process.env,QUOTE_DATA_DIR:folder,FTA_RECOVERY_PHASE:phase},stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
console.log('PASS real process restart recovery and independent PDF exports; isolated data: '+folder);
