(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.OptionCatalog=factory();})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const definitions={
    categories:['商品分类',[]],
    currencies:['币种',['USD','EUR','GBP','CNY','RUB','AED','SAR','JPY','AUD','CAD']],
    tradeTerms:['贸易方式',['EXW','FOB','CFR','CIF','DAP','DDP']],
    payment:['付款比例',['30/70','40/60','50/50','100%']],
    paymentConditions:['付款条件',['T/T','L/C','Cash']],
    billingUnits:['计量／计费单位',['台','m³','吨','柜','项','Unit','Set','Piece','Package']],
    shippingMethods:['运输方式',['Bulk Cargo','RORO','Container','Flat Rack','Other','散杂船 / Breakbulk','滚装船 / Ro-Ro','集装箱运输 / Container']],
    containerTypes:['柜型',['20GP','40GP','40HQ','20FR','40FR']],
    dimensionUnits:['尺寸单位',['meter','mm','cm']],
    equipmentConditions:['设备状况',['used','new-unused','new-machine','new-truck','水井钻机全新机']],
    cryptoNetworks:['收款网络',['TRC20','ERC20','BEP20']],
    rateUnits:['运费单位',['CBM','Ton','Container','Shipment']],
    freightFeeNames:['物流费用名称',['报关费','港杂费','文件费','拖车费','保险费']],
    buyerTypes:['客户身份',['个人买家','公司买家','在华中介','海外中介','暂未确认']],
    contactTypes:['沟通方式',['WhatsApp','电话','见面','邮件','其他']],
    contactOutcomes:['未联系原因',['未回复','未接通','客户忙，稍后联系','联系方式有误']],
    equipmentTags:['客户设备需求',['挖掘机','装载机','推土机','压路机','平地机','起重机','叉车','伸缩臂叉装车','滑移装载机','环卫设备']]
  };
  const labels={used:['二手机械','Used'], 'new-unused':['全新未使用','Brand New & Unused'], 'new-machine':['全新机械','New Machinery'], 'new-truck':['全新卡车','New Truck'], '水井钻机全新机':['水井钻机全新机','Brand New Water Well Drilling Rig'], '30/70':['30%订金，70%装船前付清','30% deposit, 70% before loading'], '40/60':['40%订金，60%发货前付清','40% deposit, 60% before shipment'],'50/50':['50%订金，50%发货前付清','50% deposit, 50% before shipment'],'100%':['发货前全款','100% before shipment'],meter:['米 m','Metre'],mm:['毫米 mm','Millimetre'],cm:['厘米 cm','Centimetre']};
  function row(group,value,i){const text=labels[value]||[value,value];return {id:group+':'+value,value,labelZh:text[0],labelEn:text[1],parentId:'',active:true,sortOrder:(i+1)*10};}
  function ensure(settings){
    settings.optionCatalog||={};
    if(!settings.optionCatalog.categories)settings.optionCatalog.categories=(settings.categories||[]).map((c,i)=>({...c,value:c.id,active:c.visible!==false,sortOrder:c.sortOrder??(i+1)*10}));
    for(const c of settings.categories||[])if(!settings.optionCatalog.categories.some(r=>r.id===c.id))settings.optionCatalog.categories.push({...c,value:c.id,active:c.visible!==false,sortOrder:c.sortOrder||0});
    for(const [key,[,defaults]] of Object.entries(definitions))if(!Array.isArray(settings.optionCatalog[key]))settings.optionCatalog[key]=(Array.isArray(settings[key])&&settings[key].length?settings[key]:defaults).map((v,i)=>row(key,String(v),i));
    return settings.optionCatalog;
  }
  function validate(rows,group=''){
    if(!Array.isArray(rows)||rows.length>1000)throw Error('选项列表无效');
    const ids=new Set(),values=new Set();
    for(const r of rows){if(!r.id||!String(r.value??'').trim()||ids.has(r.id)||values.has(r.value))throw Error('选项代码不能为空或重复');ids.add(r.id);values.add(r.value);if(!Number.isFinite(Number(r.sortOrder)))throw Error('排序必须为数字');if(group==='currencies'&&!/^[A-Z]{3}$/.test(r.value))throw Error('币种必须为三位大写代码');if(group==='dimensionUnits'&&!['meter','mm','cm'].includes(r.value))throw Error('尺寸单位受换算规则保护，仅支持米、毫米、厘米');}
    for(const r of rows){let parent=r.parentId,depth=1;const seen=new Set([r.id]);while(parent){if(seen.has(parent)||!ids.has(parent))throw Error('父子关系存在循环或缺失');seen.add(parent);depth++;if(depth>3)throw Error('最多支持三级选项');parent=rows.find(x=>x.id===parent).parentId;} }
    return true;
  }
  function active(settings,key){const all=ensure(settings)[key]||[];return all.filter(r=>r.active!==false&&!r.deletedAt&&parentsActive(r,all)).slice().sort((a,b)=>Number(a.sortOrder)-Number(b.sortOrder));}
  function parentsActive(row,all){let p=row.parentId,guard=0;while(p&&guard++<3){const parent=all.find(r=>r.id===p);if(!parent||parent.active===false||parent.deletedAt)return false;p=parent.parentId;}return !p;}
  function values(settings,key,selected){const list=active(settings,key).map(r=>r.value);if(selected&&!list.includes(selected))list.push(selected);return list;}
  function sync(settings){ensure(settings);for(const key of ['currencies','tradeTerms'])settings[key]=active(settings,key).map(r=>r.value);if(settings.currencies.length&&!settings.currencies.includes(settings.currency))settings.currency=settings.currencies[0];if(settings.optionCatalog.categories.length)settings.categories=settings.optionCatalog.categories.map(r=>({...r,visible:r.active!==false&&!r.deletedAt&&parentsActive(r,settings.optionCatalog.categories)}));return settings;}
  // Existing codes are immutable; removal of a persisted entry becomes archival.
  function reconcile(next,previous={}){
    // The legacy category editor still writes categories; merge those edits by ID.
    for(const category of next.categories||[]){
      const old=(previous.categories||[]).find(c=>c.id===category.id),row=next.optionCatalog?.categories?.find(c=>c.id===category.id);
      if(old&&row&&['labelEn','labelZh','parentId','sortOrder','visible'].some(key=>category[key]!==old[key]))Object.assign(row,{labelEn:category.labelEn,labelZh:category.labelZh,parentId:category.parentId||'',sortOrder:category.sortOrder??row.sortOrder,active:category.visible!==false});
    }
    ensure(next);ensure(previous);
    for(const key of Object.keys(definitions)){
      const rows=next.optionCatalog[key],old=previous.optionCatalog[key];
      for(const r of rows){const prior=old.find(o=>o.id===r.id);if(prior&&prior.value!==r.value)throw Error('已有选项的内部代码不可更改，请新建选项并停用旧项');}
      for(const r of old)if(!rows.some(o=>o.id===r.id))rows.push({...r,active:false,deletedAt:new Date().toISOString()});
      validate(rows,key);
      if(['currencies','tradeTerms','payment','billingUnits'].includes(key)&&!active(next,key).length)throw Error('核心业务选项至少保留一个启用值');
    }
    return sync(next);
  }
  function fieldOptions(field,selected){const all=(field.options||[]).map((o,i)=>({...o,id:o.id||'field:'+i})),rows=active({optionCatalog:{fields:all}},'fields');const selectedValues=Array.isArray(selected)?selected:String(selected??'').split(',').filter(Boolean);for(const value of selectedValues)if(!rows.some(o=>String(o.value)===String(value))){const old=all.find(o=>String(o.value)===String(value));rows.push({...old,id:old?.id||'legacy:'+value,value,labelZh:(old?.labelZh||value)+'（历史值）',labelEn:old?.labelEn||value,historical:true});}return rows;}
  return {definitions,ensure,validate,active,values,sync,reconcile,fieldOptions};
});
