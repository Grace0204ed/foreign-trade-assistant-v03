(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.DocumentItemTypes=factory();})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const kinds=[['product','设备','Equipment'],['freight','海运费','Sea freight'],['trucking','国内运输费','Inland transport'],['port','港杂及报关费','Port and customs clearance charges'],['insurance','保险费','Insurance'],['handling','拆装费','Disassembly and assembly charges'],['custom','其他费用','Other charges']];
  const defaults=()=>kinds.map(([kind,labelZh,labelEn],i)=>({id:'item-type-'+kind,value:kind,kind,labelZh,labelEn,active:true,sortOrder:(i+1)*10}));
  function kind(option){return kinds.some(k=>k[0]===option?.kind)?option.kind:(kinds.find(k=>k.includes(option?.value)||k.includes(option?.labelZh)||k.includes(option?.labelEn))?.[0]||'custom');}
  function options(field){return (Array.isArray(field?.options)?field.options:defaults()).filter(o=>o.active!==false&&!o.deletedAt).slice().sort((a,b)=>Number(a.sortOrder||0)-Number(b.sortOrder||0));}
  function match(field,value){return options(field).find(o=>[o.value,o.labelZh,o.labelEn].includes(value));}
  function migrate(config){
    config.blocks||={};config.blocks.items||=[];
    let field=config.blocks.items.find(f=>(f.fieldKey||f.key)==='itemType');
    if(!field){field={id:'field-itemType',fieldKey:'itemType',zh:'条目类型',en:'Item Type',visible:true,active:true,required:true,sortOrder:0};config.blocks.items.unshift(field);}
    field.fieldType='select';field.type='select';
    if(!field.itemTypesVersion){if(!Array.isArray(field.options)||!field.options.length)field.options=defaults();field.itemTypesVersion=1;}
    return field;
  }
  return {kinds,defaults,kind,options,match,migrate};
});
