'use strict';
const fs=require('fs');
module.exports=function installDocumentIdentities(app,db,browserStatePath){
 const prefixes={quotation:'QA',invoice:'PI',contract:'SC',commercial:'CI',packing:'PL',authorization:'AUTH',statement:'CS',invitation:'INV'};
 db.exec(`CREATE TABLE IF NOT EXISTS document_identities (identity_key TEXT PRIMARY KEY, document_type TEXT NOT NULL, sequence INTEGER NOT NULL UNIQUE, number TEXT NOT NULL UNIQUE, issue_date TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS document_identity_counter (id INTEGER PRIMARY KEY CHECK(id=1), value INTEGER NOT NULL);`);
 const allocate=db.transaction((key,type,date)=>{
  const existing=db.prepare('SELECT * FROM document_identities WHERE identity_key=?').get(key);if(existing){if(existing.document_type!==type)throw Error('编号所属单证类型不一致');return existing;}
  if(!db.prepare('SELECT value FROM document_identity_counter WHERE id=1').get()){
   const numbers=new Set();let maximum=0;
   const add=(number,id)=>{if(!number&&!id)return;numbers.add(String(number||id));const m=String(number||'').match(/-\d{8}-(\d+)$/);if(m)maximum=Math.max(maximum,Number(m[1]));};
   for(const row of db.prepare('SELECT id,quote_number FROM quotations').all())add(row.quote_number,row.id);
   for(const row of db.prepare('SELECT id,authorization_number FROM agent_authorizations').all())add(row.authorization_number,row.id);
   for(const row of db.prepare('SELECT payload FROM work_drafts').all()){const d=JSON.parse(row.payload);if(d.kind!=='products')add(d.data?.quoteNumber||d.data?.authorizationNumber||d.data?.invitationNumber,d.data?.id);}
   if(fs.existsSync(browserStatePath)){const state=JSON.parse(fs.readFileSync(browserStatePath,'utf8'));for(const d of [...(state.quotes||[]),...(state.invitations||[])])add(d.quoteNumber||d.invitationNumber,d.id);}
   db.prepare('INSERT INTO document_identity_counter(id,value) VALUES(1,?)').run(Math.max(numbers.size,maximum));
  }
  const sequence=db.prepare('UPDATE document_identity_counter SET value=value+1 WHERE id=1 RETURNING value').get().value,number=prefixes[type]+'-'+date.replaceAll('-','')+'-'+String(sequence).padStart(3,'0');
  db.prepare('INSERT INTO document_identities VALUES(?,?,?,?,?)').run(key,type,sequence,number,date);return {identity_key:key,document_type:type,sequence,number,issue_date:date};
 });
 app.post('/api/document-identities',(req,res)=>{try{const {key,type,date}=req.body||{};if(typeof key!=='string'||key.length<5||key.length>180||!prefixes[type]||!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('单证编号请求无效');res.json({ok:true,identity:allocate(key,type,date)});}catch(error){res.status(400).json({ok:false,message:error.message});}});
};
