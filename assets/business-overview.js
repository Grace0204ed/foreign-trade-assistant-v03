(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.BusinessOverview=factory();})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const labels={quotation:'报价单',invoice:'形式发票',contract:'销售合同',commercial:'商业发票',packing:'装箱单'};
  function dateOf(q){return String(q.quoteDate||q.createdAt||'').slice(0,10);}
  function latest(records){
    const map=new Map();
    for(const q of records){const key=(q.documentType||'quotation')+':'+(q.quoteNumber||q.id);const prior=map.get(key);if(!prior||Number(q.version||0)>Number(prior.version||0)||(Number(q.version||0)===Number(prior.version||0)&&String(q.updatedAt||q.createdAt||'')>String(prior.updatedAt||prior.createdAt||'')))map.set(key,q);}
    return [...map.values()];
  }
  function month(records,now=new Date()){const prefix=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');return latest(records).filter(q=>dateOf(q).startsWith(prefix));}
  function amounts(records,total){const result={};for(const q of records){const currency=q.currency||'USD',value=Number(total(q));if(Number.isFinite(value))result[currency]=(result[currency]||0)+value;}return result;}
  function filter(records,{keyword='',type='',from='',to=''}={}){const key=keyword.trim().toLowerCase();return latest(records).filter(q=>(!type||(q.documentType||'quotation')===type)&&(!from||dateOf(q)>=from)&&(!to||dateOf(q)<=to)&&(!key||[q.quoteNumber,q.buyer?.company,q.buyer?.contact].join(' ').toLowerCase().includes(key))).sort((a,b)=>String(b.updatedAt||dateOf(b)).localeCompare(String(a.updatedAt||dateOf(a))));}
  return {labels,dateOf,latest,month,amounts,filter};
});
