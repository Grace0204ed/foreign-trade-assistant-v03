(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ProductHierarchy=factory();})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const machinery='挖掘机、装载机、汽车吊、履带吊、叉车、自卸卡车、平地机、压路机、混凝土泵车、混凝土搅拌车、非公路自卸车、拖式泵、水井钻机、油罐车、运水车、铣刨机、高空作业车、叉装车、伸缩臂叉车、TLB、发电机、沥青撒布设备、堆高机、正面吊、牵引车、凿岩钻机、碾金机、金矿生产线、配件、垃圾车、航空加油车、铲运机、凿岩台车、混凝土湿喷机、清洁车、吸污车、随车吊'.split('、');
 // Only explicit category names are reconciled. Model numbers are never used to infer a type.
 const aliases={'汽车起重机':'汽车吊','履带起重机':'履带吊','道路压路机':'压路机','单钢轮压路机':'压路机','双钢轮压路机':'压路机','轮胎压路机':'压路机','胶轮压路机':'压路机','小型压路机':'压路机','压缩式垃圾车':'垃圾车','挂桶垃圾车':'垃圾车','勾臂垃圾车':'垃圾车','摆臂垃圾车':'垃圾车','洒水车':'运水车'};
 const key=v=>String(v||'').trim(),code=(...parts)=>'ph:'+parts.map(v=>encodeURIComponent(key(v))).join('/');
 const sorted=rows=>rows.slice().sort((a,b)=>(Number(a.sortOrder)||0)-(Number(b.sortOrder)||0)||a.label.localeCompare(b.label,'zh-CN',{numeric:true}));
 const children=(config,parentId='',includeInactive=false)=>sorted((config.nodes||[]).filter(n=>n.parentId===parentId&&!n.deletedAt&&(includeInactive||n.active!==false)));
 function path(config,id){const out=[],seen=new Set();while(id){if(seen.has(id))throw Error('分类存在循环归属');seen.add(id);const n=config.nodes.find(n=>n.id===id);if(!n)break;out.unshift(n);id=n.parentId;}return out;}
 const categoryAliases={Excavator:'挖掘机','Motor Grader':'平地机','Wheel Loader':'装载机','起重机':'汽车吊','水罐车':'运水车','矿山自卸卡车':'非公路自卸车','伸缩臂叉装车':'伸缩臂叉车','滑移装载机':'滑移装载机','旋挖钻机':'旋挖钻机','破碎机':'破碎机','沥青搅拌站':'沥青搅拌站','水泥混凝土搅拌站':'混凝土搅拌站','推土机':'推土机'};
 function legacyLabels(product){
  const v=product.values||{},raw=key(v.productType||product.category)||'待核对小类',plain=raw.split(/\s*\/\s*/)[0];
  let minor=aliases[plain]||categoryAliases[plain]||plain;
  // Special-purpose vehicles were one legacy bucket. Their explicit model names
  // identify the subtype; no tonnage or model-number guessing is involved.
  if(plain==='特种车辆')minor=key(v.model||product.model).split(/\s*\/\s*/)[0]||'其他特种车辆';
  minor=aliases[minor]||categoryAliases[minor]||minor;
  if(['勾臂式垃圾车','吊臂式垃圾车','餐厨垃圾车'].includes(minor))minor='垃圾车';
  const mechanical=machinery.includes(minor)||Object.values(categoryAliases).includes(minor)||plain==='特种车辆';
  return [key(v.productFamily||v.productMajor)||(mechanical?'机械设备':'待核对类型'),minor,key(v.brand||product.brand)||'未填写品牌'];
 }
 function reconcile(previous,products=[]){
  const config=previous?JSON.parse(JSON.stringify(previous)):seed([]);
  config.legacyBindings||={};config.nodes||=[];
  for(const product of products){
   if(config.deletedProductIds?.includes(product.id))continue;
   const explicit=product.values?._classification;
   if(explicit?.brandId&&resolve(config,{...product,id:'',values:{_classification:explicit}}).length===3)continue;
   if(config.catalogMigrationVersion>=2&&resolve(config,product).length===3)continue;
   let parent='',ids=[];
   for(const label of legacyLabels(product)){
    // An explicit deletion must not be undone by the legacy reconciliation pass.
    if(config.nodes.some(n=>n.deletedAt&&n.parentId===parent&&n.label===label)){ids=[];break;}
    let node=config.nodes.find(n=>!n.deletedAt&&n.parentId===parent&&n.label===label);
    if(!node){node={id:code(parent,label),parentId:parent,label,active:true,sortOrder:children(config,parent,true).length*10+10};config.nodes.push(node);}
    ids.push(node.id);parent=node.id;
   }
   if(product.id&&ids.length===3)config.legacyBindings[product.id]=ids;
  }
  config.catalogMigrationVersion=2;return config;
 }
 function seed(products=[]){
  const config={version:1,levelNames:['类型','小类','品牌'],nodes:[],legacyBindings:{}};
  const add=(label,parentId='')=>{const id=code(parentId,label);if(!config.nodes.some(n=>n.id===id))config.nodes.push({id,parentId,label,active:true,sortOrder:children(config,parentId,true).length*10+10});return id;};
  const major=add('机械设备');machinery.forEach(n=>add(n,major));
  for(const p of products){let parent='',ids=[];for(const label of legacyLabels(p)){parent=add(label,parent);ids.push(parent);}if(p.id)config.legacyBindings[p.id]=ids;}
  return config;
 }
 function resolve(config,product){
  const saved=product.values?._classification,binding=config.legacyBindings?.[product.id];
  if(saved?.brandId){const nodes=path(config,saved.brandId);if(nodes.length===3&&nodes.every(n=>!n.deletedAt)&&nodes[0].id===saved.typeId&&nodes[1].id===saved.subtypeId)return nodes.map(n=>n.id);}
  if(Array.isArray(binding)&&binding.length===3&&path(config,binding[2]).length===3&&path(config,binding[2]).every((n,i)=>!n.deletedAt&&n.id===binding[i]))return binding;
  let parent='',ids=[];for(const label of legacyLabels(product)){const n=config.nodes.find(n=>!n.deletedAt&&n.parentId===parent&&n.label===label);if(!n)return [];ids.push(n.id);parent=n.id;}return ids;
 }
 function enabled(config,id){return path(config,id).every(n=>n.active!==false&&!n.deletedAt);}
 function deletionPlan(config,products,nodeId){
  const node=config?.nodes?.find(n=>n.id===nodeId&&!n.deletedAt);
  if(!node)throw Error('分类不存在或已删除，请刷新后重试');
  const nodeIds=new Set([nodeId]);let changed=true;
  while(changed){changed=false;for(const n of config.nodes)if(!n.deletedAt&&nodeIds.has(n.parentId)&&!nodeIds.has(n.id)){nodeIds.add(n.id);changed=true;}}
  const productIds=products.filter(p=>resolve(config,p).some(id=>nodeIds.has(id))).map(p=>p.id);
  return {nodeId,label:node.label,nodeIds:[...nodeIds],productIds};
 }
 function applyDeletion(config,plan,timestamp=new Date().toISOString()){
  const next=JSON.parse(JSON.stringify(config)),ids=new Set(plan.nodeIds);
  for(const n of next.nodes)if(ids.has(n.id)){n.deletedAt=timestamp;n.active=false;}
  for(const id of plan.productIds)delete next.legacyBindings?.[id];
  next.deletedProductIds=[...new Set([...(next.deletedProductIds||[]),...plan.productIds])];
  return next;
 }
 function validate(config,previous,products=[]){
  if(!config||!Array.isArray(config.nodes)||config.levelNames?.length!==3||config.levelNames.some(n=>!key(n)))throw Error('请填写三个分类层级名称');
  const ids=new Set();for(const n of config.nodes){if(!key(n.id)||ids.has(n.id))throw Error('分类标识重复');ids.add(n.id);if(!key(n.label))throw Error('请填写分类名称');if(!Number.isFinite(n.sortOrder))throw Error('分类排序无效');}
  for(const n of config.nodes){if(n.parentId&&!ids.has(n.parentId))throw Error('分类缺少上级');if(path(config,n.id).length>3)throw Error('产品分类最多三级');if(!n.deletedAt&&config.nodes.some(x=>x.id!==n.id&&!x.deletedAt&&x.parentId===n.parentId&&x.label.trim()===n.label.trim()))throw Error('同一上级下名称重复');}
  for(const old of previous?.nodes||[]){const next=config.nodes.find(n=>n.id===old.id);if(next&&next.parentId!==old.parentId)throw Error('已有分类不能改变归属，请新增分类后逐项核对产品');if(!next||(!old.deletedAt&&next.deletedAt)){if((previous.nodes||[]).some(n=>n.parentId===old.id&&!n.deletedAt)||products.some(p=>resolve(previous,p).includes(old.id)))throw Error('分类含有下级或产品，请先处理归属，或关闭分类');if(!next)throw Error('请保留已删除分类的稳定标识');}}
  return config;
 }
 function selection(config,ids){if(ids.length!==3||ids.some(id=>!id))return null;const nodes=path(config,ids[2]);if(nodes.length!==3||nodes.some((n,i)=>n.deletedAt||n.id!==ids[i]))throw Error('类型、小类与品牌的归属不一致');return {typeId:ids[0],subtypeId:ids[1],brandId:ids[2],labels:nodes.map(n=>n.label)};}
 return {seed,reconcile,resolve,children,path,enabled,validate,selection,machinery,legacyLabels,deletionPlan,applyDeletion};
});
