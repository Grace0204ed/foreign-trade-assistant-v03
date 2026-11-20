'use strict';
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path'),os=require('os');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-quote-product-')),env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
for(const phase of ['write','restore']){
 const result=spawnSync(require('electron'),[path.join(__dirname,'test-quote-library-factory.cjs')],{env:{...env,QUOTE_DATA_DIR:dir,FTA_QUOTE_PRODUCT_PHASE:phase},encoding:'utf8',timeout:90000});
 process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.status!==0)process.exit(result.status||1);
}
console.log('PASS quotation products, real restart recovery, EXW factory, FOB delivery port and CIF compatibility');
