'use strict';
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os'),electron=require('electron');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-side-restart-'));
for(const phase of ['write','restore']){const result=spawnSync(electron,[path.join(__dirname,'test-side-editor-recovery.cjs')],{env:{...process.env,QUOTE_DATA_DIR:dir,FTA_SIDE_PHASE:phase},encoding:'utf8',timeout:90000});process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);}
console.log('PASS side editor real process restart; isolated data '+dir);
