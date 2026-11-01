'use strict';
// Merge only list projections, then hydrate the requested page. Never load PDFs,
// signatures, product images or full saved template snapshots for a history list.
module.exports=function documentHistory(db,query={},invitationSummaries=[]){
  const type=String(query.type||''),status=String(query.status||'active'),keyword=String(query.q||'').trim().toLowerCase(),date=String(query.date||'');
  const ordinary=['quotation','invoice','contract','commercial','packing'];
  let index=[];
  if(!type||ordinary.includes(type))index.push(...db.prepare(`SELECT id,quote_number number,quote_date date,status,updated_at sort,
    COALESCE(json_extract(settings_snapshot_json,'$._quoteMeta.documentType'),'quotation') documentType,
    buyer_json search,'standard' source FROM quotations`).all());
  if(!type||['authorization','agreement','statement','commission','procurement'].includes(type))index.push(...db.prepare(`SELECT id,authorization_number number,
    COALESCE(json_extract(data_json,'$.date'),substr(updated_at,1,10)) date,status,updated_at sort,
    COALESCE(json_extract(data_json,'$.documentType'),'authorization') documentType,
    agent_name||' '||country||' '||COALESCE(json_extract(data_json,'$.company'),'') search,
    'agency' source FROM agent_authorizations WHERE COALESCE(json_extract(data_json,'$.isTemplate'),0)=0`).all());
  if(!type||type==='invitation'){
    if(!Array.isArray(invitationSummaries)||invitationSummaries.length>10000)throw Error('邀请函摘要列表无效');
    index.push(...invitationSummaries.map(r=>({id:String(r.id||''),number:String(r.number||''),date:String(r.date||''),status:'Active',sort:String(r.sort||r.date||''),documentType:'invitation',search:[r.company,r.contact,r.country].map(s=>String(s||'').slice(0,500)).join(' '),source:'invitation',buyer:{company:r.company,contact:r.contact,country:r.country}})).filter(r=>r.id));
  }
  index=index.filter(r=>(!type||r.documentType===type||(type==='commission'&&['agreement','statement'].includes(r.documentType)))&&(!date||r.date===date)&&(status==='all'||(status==='deleted'?r.status==='Deleted':status==='void'?r.status==='Void':!['Void','Deleted'].includes(r.status))));
  if(keyword){
    // Product keywords are evaluated with SQLite's indexed list projection logic.
    const matchingQuotes=new Set();let page=1,pages=1;
    if(!type||ordinary.includes(type))do{const found=require('./quotation-history')(db,{...query,q:keyword,page,pageSize:100});found.quotations.forEach(r=>matchingQuotes.add(r.id));pages=found.pages;page++;}while(page<=pages);
    index=index.filter(r=>r.source==='standard'?matchingQuotes.has(r.id):[r.number,r.search].join(' ').toLowerCase().includes(keyword));
  }
  index.sort((a,b)=>String(b.sort).localeCompare(String(a.sort))||String(b.id).localeCompare(String(a.id)));
  const total=index.length,pageSize=Math.max(1,Math.min(100,parseInt(query.pageSize,10)||30)),pages=Math.max(1,Math.ceil(total/pageSize)),page=Math.min(pages,Math.max(1,parseInt(query.page,10)||1));
  const selected=index.slice((page-1)*pageSize,page*pageSize),ids=selected.filter(r=>r.source==='standard').map(r=>r.id);
  const quotes=require('./quotation-history')(db,{status:'all',ids,pageSize:100}).quotations;
  const quotations=selected.map(r=>{
    if(r.source==='standard')return quotes.find(q=>q.id===r.id);
    let buyer=r.buyer||{};
    if(r.source==='agency'){const a=db.prepare(`SELECT agent_name,country,json_extract(data_json,'$.company') company FROM agent_authorizations WHERE id=?`).get(r.id);buyer={company:a.company||a.agent_name,contact:a.agent_name,country:a.country};}
    return {id:r.id,_source:r.source,quote_number:r.number,quote_date:r.date,status:r.status,updated_at:r.sort,buyer,terms:{},items:[],total_amount:null,settingsSnapshot:{_quoteMeta:{documentType:r.documentType}}};
  }).filter(Boolean);
  return {quotations,total,page,pages,pageSize};
};
