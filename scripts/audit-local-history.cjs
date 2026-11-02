// Run with Electron to use its existing SQLite ABI. Default is read-only planning.
const {app}=require('electron'),fs=require('fs'),path=require('path'),crypto=require('crypto'),Database=require('better-sqlite3');
const root=process.env.FTA_AUDIT_DATA_DIR||path.join(process.env.APPDATA,'foreign-trade-assistant'),file=path.join(root,'foreign-trade-assistant.sqlite');
if(!path.isAbsolute(root)||!fs.existsSync(file))throw Error('Existing data directory required');
app.whenReady().then(async()=>{
 let db=new Database(file,{readonly:true,fileMustExist:true});
 try{
  const stamp=new Date().toISOString().replace(/[:.]/g,'-'),backup=path.join(root,'backups','before-0.11.21-cleanup-'+stamp);fs.mkdirSync(backup,{recursive:true});
  const target=path.join(backup,'foreign-trade-assistant.sqlite');await db.backup(target);db.close();db=new Database(target,{readonly:true,fileMustExist:true});if(db.pragma('quick_check',{simple:true})!=='ok')throw Error('Backup integrity check failed');
  const stateFile=path.join(root,'browser-state.json');let state={};if(fs.existsSync(stateFile)){const bytes=fs.readFileSync(stateFile);state=JSON.parse(bytes);fs.writeFileSync(path.join(backup,'browser-state.json'),bytes);}
  const quotes=db.prepare(`SELECT id,quote_number,status,is_formal,buyer_json,terms_json,
   COALESCE(json_extract(settings_snapshot_json,'$._quoteMeta.documentType'),'quotation') type,
   json_extract(settings_snapshot_json,'$._quoteMeta.documentExtras.recordClass') recordClass FROM quotations`).all();
  const itemCounts=db.prepare(`SELECT quotation_id,count(*) total,sum(CASE WHEN trim(COALESCE(json_extract(product_snapshot_json,'$.productName'),'')||COALESCE(json_extract(product_snapshot_json,'$.brand'),'')||COALESCE(json_extract(product_snapshot_json,'$.model'),'')||COALESCE(json_extract(price_snapshot_json,'$.values.description'),'')||COALESCE(json_extract(price_snapshot_json,'$.values.remark'),''))<>'' THEN 1 ELSE 0 END) meaningful FROM quotation_items GROUP BY quotation_id`).all();
  const items=new Map(itemCounts.map(r=>[r.quotation_id,r]));const blank=[],review=[],keep=[];
  const nonempty=value=>Object.values(value||{}).some(v=>typeof v==='string'?v.trim():v!=null&&v!==false&&v!==0);
  for(const q of quotes){const buyer=JSON.parse(q.buyer_json||'{}'),terms=JSON.parse(q.terms_json||'{}'),hasBuyer=nonempty(buyer),hasItems=Number(items.get(q.id)?.meaningful)>0;
   const notes=String(terms.notes||'').trim(),defaultNotes=!notes||notes.startsWith('Freight and/or inland trucking charges')||notes.startsWith('Payment and Shipping Terms: Upon receipt of the 30% deposit');
   const meaningfulTerms=Object.entries(terms).some(([key,value])=>!['notes','payment','paymentCondition','shipping','originPort','validity','validDays'].includes(key)&&String(value||'').trim());
   const summary={id:q.id,number:q.quote_number,type:q.type,status:q.status,formal:!!q.is_formal,hasBuyer,meaningfulItems:Number(items.get(q.id)?.meaningful||0)};
   if(!hasBuyer&&!hasItems&&defaultNotes&&!meaningfulTerms&&!q.is_formal&&['quotation','invoice','contract','commercial','packing'].includes(q.type)&&!['Void','Deleted'].includes(q.status))blank.push({...summary,reason:'无客户资料、无实际商品、无自定义条款、非正式记录'});
   else if(!q.is_formal&&['Draft','草稿'].includes(q.status))review.push({...summary,reason:'有内容但旧版草稿状态无法证明业务是否完成，保留待确认'});else keep.push(summary);
  }
  const invitationRows=state.invitations||state.state?.invitations||[];
  const standaloneReview=[];
  for(const d of invitationRows){const hasPeople=[d,...(d.people||[])].some(p=>p.visitorName||p.passportNo||p.birthDate||p.country),hasTrip=!!(d.notes||d.visitorCompany||d.arrivalDate||d.departureDate||d.visitPlaces?.length);if(!hasPeople&&!hasTrip)standaloneReview.push({id:d.id,type:'invitation',reason:'未发现明确来访资料，保留待人工核对，不按商品字段判断'});}
  const agencyRows=db.prepare('SELECT id,data_json FROM agent_authorizations').all();for(const row of agencyRows){const d=JSON.parse(row.data_json||'{}');if(![d.agentName,d.idNumber,d.phone,d.email,d.purchaseMachine,d.purchaseAmount,d.salesContractNumber,d.customerName,d.recipientCompany,d.documentNotes].some(Boolean))standaloneReview.push({id:row.id,type:d.documentType||'authorization',reason:'未发现明确受邀方或交易资料，保留待人工核对'});}
  const result={createdAt:new Date().toISOString(),source:file,backupDirectory:backup,backupSha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),counts:{quotations:quotes.length,blankCandidates:blank.length,ambiguous:review.length,keep:keep.length,invitations:invitationRows.length,customers:db.prepare('SELECT count(*) n FROM customers').get().n,products:db.prepare('SELECT count(*) n FROM products').get().n,agencyDocuments:agencyRows.length,standaloneAmbiguous:standaloneReview.length},blankCandidates:blank,ambiguous:review,standaloneAmbiguous:standaloneReview,retained:keep,applied:false};
  fs.writeFileSync(path.join(backup,'cleanup-plan.json'),JSON.stringify(result,null,2));fs.mkdirSync('output/local-history-audit',{recursive:true});fs.writeFileSync('output/local-history-audit/latest-plan.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify({counts:result.counts,backupDirectory:backup,applied:false}));
 }finally{db.close();app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
