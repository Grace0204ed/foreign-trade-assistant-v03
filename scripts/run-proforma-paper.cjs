'use strict';
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os'),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'fta-proforma-paper-'));
for(const phase of ['write','restore']){const r=spawnSync(require('electron'),[path.join(__dirname,'test-proforma-paper.cjs')],{env:{...env,QUOTE_DATA_DIR:folder,PROFORMA_PHASE:phase},encoding:'utf8',timeout:180000});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');if(r.status!==0)process.exit(r.status||1);}
console.log('PASS compact PI header, shared item table, configured details, preview/export/print and real restart; evidence '+folder);
