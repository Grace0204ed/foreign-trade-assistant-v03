'use strict';
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-library-batch-')),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
for(const phase of ['write','restore']){const r=spawnSync(require('electron'),[path.join(__dirname,'test-quote-library-batch.cjs')],{env:{...env,QUOTE_DATA_DIR:dir,FTA_LIBRARY_BATCH_PHASE:phase},encoding:'utf8',timeout:90000});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)process.exit(r.status||1)}
console.log('PASS one-click quote products, lost response/partial failure, real restart/retry, no duplicates or history/company changes; evidence '+dir);
