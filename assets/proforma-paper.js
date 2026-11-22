(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProformaPaper=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const core=new Set(['sequence','description','qty','billingUnit','unitPrice','amount']);
 const weight={sequence:5,description:45,qty:7,billingUnit:8,unitPrice:17,amount:18};
 function version(record){if(record?.documentType!=='invoice')return 1;return Number(record.proformaPaperVersion??record.templateSnapshot?.proformaPaperVersion??(record.savedAt||record.isFormal||record.recordClass==='history'?1:2));}
 const columnKey=node=>[...node.classList].find(c=>c.startsWith('preview-col-')&&c!=='preview-col-extra')?.slice(12)||'';
 const meaningful=node=>!!node&&(!!node.querySelector('img')||!['','—','–','-'].includes(node.textContent.trim()));
 function apply(host,record,{contactLabel}={}){
  if(!host)return;
  const active=version(record)>=2;host.classList.toggle('proforma-paper',active);
  if(!active){delete host.dataset.proformaPaperVersion;return;}
  record.proformaPaperVersion=2;host.dataset.proformaPaperVersion='2';
  const doc=host.ownerDocument,tables=[...host.querySelectorAll('table.document-item-group')],headers=new Map(),order=[],rows=[];
  for(const table of tables){
   const columns=[...table.querySelectorAll('thead tr:first-child th')].map(header=>{const key=columnKey(header);if(key&&!headers.has(key)){headers.set(key,header);order.push(key);}return{key,header};});
   for(const tr of table.tBodies[0]?.rows||[]){const cells=new Map();columns.forEach(({key,header},i)=>{if(key&&tr.cells[i])cells.set(key,{cell:tr.cells[i],header});});rows.push({tr,cells});}
  }
  // Read the already-rendered cells: configured visibility, ordering, translated
  // values, rich text, photos, pending prices and currency conversion stay intact.
  const keys=order.filter(key=>core.has(key));
  if(tables.length&&keys.length){
   const table=doc.createElement('table');table.className='proforma-lines document-data-table';
   const cols=doc.createElement('colgroup'),sum=keys.reduce((n,key)=>n+weight[key],0),head=doc.createElement('thead'),headRow=doc.createElement('tr'),body=doc.createElement('tbody');
   for(const key of keys){const col=doc.createElement('col');col.style.width=(weight[key]*100/sum)+'%';cols.append(col);const th=doc.createElement('th');th.className='preview-col-'+key;th.dataset.proformaColumn=key;th.innerHTML=headers.get(key).innerHTML;headRow.append(th);}
   head.append(headRow);
   rows.forEach(({tr:source,cells},index)=>{
    const tr=doc.createElement('tr');tr.dataset.proformaRow=String(index);tr.dataset.itemKind=source.closest('table')?.dataset.itemGroup||'product';
    for(const key of keys){const td=doc.createElement('td');td.dataset.proformaColumn=key;td.className='preview-col-'+key;const original=cells.get(key)?.cell;if(original)td.innerHTML=original.innerHTML;
     if(key==='description'){
      const details=doc.createElement('div');details.className='proforma-line-details';
      for(const [extra,{cell,header}]of cells){if(core.has(extra)||!meaningful(cell))continue;
       if(extra==='currency'&&[cells.get('unitPrice')?.cell,cells.get('amount')?.cell].some(n=>n?.textContent.includes(cell.textContent.trim())))continue;
       if(extra==='itemType'&&td.textContent.trim().toLowerCase().includes(cell.textContent.trim().toLowerCase()))continue;
       const field=doc.createElement('div');field.dataset.proformaDetail=extra;
       if(extra!=='image'){const label=doc.createElement('span');label.className='proforma-detail-label';label.innerHTML=header.innerHTML;field.append(label,doc.createTextNode(': '));}
       const value=doc.createElement('span');value.className='proforma-detail-value';value.innerHTML=cell.innerHTML;field.append(value);details.append(field);
      }
      if(details.childElementCount)td.append(details);
     }
     tr.append(td);
    }
    // A document may hide its description column. Keep any other visible
    // configured fields in their own columns instead of discarding the data.
    body.append(tr);
   });
   if(!keys.includes('description')){
    for(const key of order.filter(key=>!core.has(key)&&rows.some(row=>meaningful(row.cells.get(key)?.cell)))){
     const col=doc.createElement('col');cols.append(col);const th=doc.createElement('th');th.className='preview-col-'+key;th.dataset.proformaColumn=key;th.innerHTML=headers.get(key).innerHTML;headRow.append(th);
     rows.forEach((row,i)=>{const td=doc.createElement('td');td.className='preview-col-'+key;td.innerHTML=row.cells.get(key)?.cell.innerHTML||'';body.rows[i].append(td);});
    }
    const all=[...headRow.children].map(th=>th.dataset.proformaColumn),total=all.reduce((n,key)=>n+(weight[key]||12),0);
    [...cols.children].forEach((col,i)=>col.style.width=((weight[all[i]]||12)*100/total)+'%');
   }
   table.append(cols,head,body);tables[0].before(table);tables.forEach(node=>node.remove());
  }
  for(const p of host.querySelectorAll('.document-parties p')){const label=p.querySelector('b');if(label&&p.textContent.trim()===label.textContent.trim())p.remove();}
  for(const field of host.querySelectorAll('.document-parties .document-customer-field[data-field-key=email]'))if(!meaningful(field.querySelector('bdi')))field.remove();
  if(contactLabel)for(const label of host.querySelectorAll('.compact-company-contact b'))if(['Quotation Contact:','报价负责人:','报价负责人：'].includes(label.textContent.trim()))label.textContent=contactLabel+':';
 }
 function fit(host){
  if(!host?.classList.contains('proforma-paper'))return;
  for(const table of host.querySelectorAll('table.proforma-lines')){
   const headers=[...table.tHead.rows[0].cells],available=table.clientWidth||host.clientWidth-24,context=host.ownerDocument.createElement('canvas').getContext('2d');
   const keys=headers.map(h=>h.dataset.proformaColumn),minimums=headers.map(header=>{const style=getComputedStyle(header);context.font=`${style.fontWeight} ${Math.max(10.5,parseFloat(style.fontSize)||0)}px ${style.fontFamily}`;const word=Math.max(0,...header.textContent.split(/[\s/]+/).filter(Boolean).map(w=>context.measureText(w).width));return Math.max(header.dataset.proformaColumn==='description'?available*.43:24,Math.min(160,word+14));});
   const widths=globalThis.DocumentPresentation.columnWidths(keys,minimums,available);[...table.querySelector('colgroup').children].forEach((col,i)=>col.style.width=widths[i]+'%');
  }
 }
 return{version,apply,fit};
});
