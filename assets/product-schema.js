/* One editable schema for product entry, settings and product previews.
   Legacy document templates and record values remain untouched. */
(function(root){
  'use strict';
  const field=(fieldKey,zh,fieldType,sortOrder)=>({id:'product:'+fieldKey,fieldKey,zh,en:zh,fieldType,sortOrder,active:true,visible:true,required:false,parentId:''});
  function ensure(settings){
    if(!settings.productSchema){
      const fields=[field('name','产品名称','text',10),field('model','型号','text',20),field('year','年份','text',30),field('unitPrice','价格（支持范围）','money',40),field('currency','货币','currency',50),field('remark','产品说明','textarea',60),field('productImage','产品图片','image',70)];
      // Preserve user-defined legacy fields without reviving the old template tabs.
      const seen=new Set(fields.map(f=>f.fieldKey));
      for(const t of settings.templates||[])for(const f of t.fields||[])if(!seen.has(f.fieldKey)&&/^custom[_:]/.test(f.fieldKey||'')){fields.push({...f});seen.add(f.fieldKey);}
      settings.productSchema={version:1,fields,specificationsByType:{}};
    }
    settings.productSchema.specificationsByType||={};return settings.productSchema;
  }
  const active=fields=>(fields||[]).filter(f=>!f.deletedAt&&f.active!==false&&f.visible!==false).slice().sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
  function fields(settings){return active(ensure(settings).fields);}
  function specifications(settings,typeId){
    const schema=ensure(settings),key=typeId||'unclassified';
    if(!schema.specificationsByType[key])schema.specificationsByType[key]=[['power','额定功率'],['weight','整机重量'],['length','长'],['width','宽'],['height','高']].map(([id,label],i)=>field('spec_'+id,label,'text',(i+1)*10));
    return schema.specificationsByType[key];
  }
  function value(product,key){
    const values=product.values||{},direct=values[key];if(direct!==undefined&&direct!==null&&direct!=='')return direct;
    if(key==='name')return product.name||[product.brand,product.model].filter(Boolean).join(' ')||product.category||'';
    if(key==='unitPrice')return product.specificPrice!==''&&product.specificPrice!=null?product.specificPrice:product.referencePrice??product.unitPrice??'';
    if(key==='productImage')return product.imageDataUrl||'';
    return product[key]??'';
  }
  const api={ensure,fields,active,specifications,value};root.ProductSchema=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
