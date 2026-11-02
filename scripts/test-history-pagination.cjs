const assert=require('node:assert/strict');
const Database=require('better-sqlite3');
const history=require('../server/quotation-history');
const db=new Database(':memory:');
try{
  db.exec(`CREATE TABLE quotations(id TEXT PRIMARY KEY,quote_number TEXT,quote_date TEXT,version INTEGER,status TEXT,is_formal INTEGER,total_amount REAL,updated_at TEXT,buyer_json TEXT,terms_json TEXT,settings_snapshot_json TEXT);
  CREATE TABLE quotation_items(id TEXT,quotation_id TEXT,product_id TEXT,sort_order INTEGER,product_snapshot_json TEXT,price_snapshot_json TEXT);
  CREATE INDEX items_history ON quotation_items(quotation_id,sort_order);`);
  const q=db.prepare('INSERT INTO quotations VALUES (?,?,?,?,?,?,?,?,?,?,?)'),item=db.prepare('INSERT INTO quotation_items VALUES (?,?,?,?,?,?)');
  const image='data:image/png;base64,'+'A'.repeat(200000);
  db.transaction(()=>{for(let i=0;i<101;i++){
    q.run('q'+i,'PI-'+i,'2026-11-01',1,i===100?'Deleted':'Draft',0,i*100,new Date(2026,10,1,0,i).toISOString(),JSON.stringify({company:'Buyer '+i,country:'Kenya'}),JSON.stringify({port:'Mombasa'}),JSON.stringify({_quoteMeta:{documentType:i%2?'invoice':'quotation',currency:'USD'},stampDataUrl:image}));
    item.run('i'+i,'q'+i,'',0,JSON.stringify({productName:'Excavator '+i,model:'CA402',imageDataUrl:image}),JSON.stringify({quantity:1,currency:'USD',values:{qty:1}}));
  }})();
  const start=performance.now(),first=history(db,{}),elapsed=performance.now()-start;
  assert.equal(first.total,100);assert.equal(first.quotations.length,30);assert.equal(first.quotations[0].id,'q99');assert.equal(first.pages,4);
  const second=history(db,{page:2});assert(!second.quotations.some(q=>first.quotations.some(p=>p.id===q.id)));
  assert.equal(history(db,{status:'deleted'}).total,1);
  assert.equal(history(db,{type:'invoice'}).total,50);
  assert.equal(history(db,{q:'Buyer 99'}).total,1);
  assert.equal(history(db,{q:'CA402'}).total,100);
  assert.equal(history(db,{q:"' OR 1=1 --"}).total,0);
  assert.equal(history(db,{q:'%'}).total,0);
  assert.equal(history(db,{date:'2026-11-02'}).total,0);
  assert.equal(history(db,{page:999}).page,4);
  assert.equal(history(db,{pageSize:1000}).pageSize,100);
  assert.equal(first.quotations[0].items[0].priceSnapshot.quantity,1);
  const payload=JSON.stringify(first);assert(!payload.includes('base64'));assert(payload.length<50000);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM quotations').get().n,101);
  assert.equal(JSON.parse(db.prepare('SELECT settings_snapshot_json s FROM quotations LIMIT 1').get().s).stampDataUrl,image);
  db.exec('CREATE TABLE agent_authorizations(id TEXT,authorization_number TEXT,agent_name TEXT,country TEXT,status TEXT,data_json TEXT,updated_at TEXT)');
  const agency=db.prepare('INSERT INTO agent_authorizations VALUES (?,?,?,?,?,?,?)');
  agency.run('old-agency-draft','OLD-DRAFT','QA','QA','Draft','{}','2026-11-02');
  agency.run('saved-agency','SAVED','QA','QA','Active','{}','2026-11-02');
  const docs=require('../server/document-history'),summaries=[{id:'old-invite-draft',status:'Draft'},{id:'saved-invite'},{id:'explicit-draft',recordClass:'draft'}];
  const exported=docs(db,{exportable:'1'},summaries).quotations;
  assert.deepEqual(new Set(exported.map(r=>r.id)),new Set(['saved-agency','saved-invite']),'batch export excludes old draft statuses across all document families');
  console.log(`PASS history pagination/filter/search/snapshot retention: 101 large snapshots; first page ${elapsed.toFixed(1)} ms, ${payload.length} characters (test database only).`);
}finally{db.close();if(process.versions.electron)require('electron').app.quit();}
