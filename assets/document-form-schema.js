(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.DocumentFormSchema=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const copy=v=>JSON.parse(JSON.stringify(v));
 const labels={quotation:{basic:'单据信息',customer:'客户信息',items:'报价明细',terms:'贸易条款'},invoice:{basic:'单据信息',customer:'客户信息',items:'形式发票明细',terms:'付款与交付条款'},contract:{basic:'合同信息',customer:'买卖双方',items:'商品明细',terms:'贸易条款'},commercial:{basic:'发票信息',customer:'交易双方',items:'发票货物明细',terms:'运输与贸易信息'},packing:{basic:'单据信息',customer:'收发货信息',items:'货物与包装',terms:'运输信息'},invitation:{basic:'邀请函信息',customer:'受邀人信息',items:'来访安排',terms:'邀请说明'},agency:{basic:'授权书信息',customer:'被授权方信息',territory:'授权区域',items:'授权产品范围',terms:'授权条款',display:'显示设置'},statement:{basic:'结算信息',customer:'合同与交易信息',items:'佣金明细',terms:'收付款安排'}};
 const field=(key,zh,en,type='text',extra={})=>({id:'form-'+key,fieldKey:key,zh,en,fieldType:type,active:true,visible:true,required:false,sortOrder:10,defaultValue:'',options:[],...extra});
 const clean=f=>f&&!f.deletedAt;
 const companyKeys=new Set(['bank','bankAccountId','selectedBankAccount','signer','title','inviter','signerTitle','company','authorizer','authorizerTitle']);
 const noField=f=>['pdfLanguage','language','style','bank','bankAccountId','selectedBankAccount','signer','title','inviter','signerTitle','authorizer','authorizerTitle'].includes(f.fieldKey);
 const alive=f=>clean(f)&&f.visible!==false&&f.active!==false;
 function merge(existing,defaults){const fields=(existing||[]).filter(clean);for(const item of defaults)if(!fields.some(f=>f.fieldKey===item.fieldKey))fields.push(copy(item));return fields;}
 const compare=(a,b)=>(['itemType','recipientType'].includes(a.fieldKey)?-1:0)-(['itemType','recipientType'].includes(b.fieldKey)?-1:0)||Number(a.sortOrder||0)-Number(b.sortOrder||0);
 function ordered(fields){return fields.filter(alive).slice().sort(compare);}
 const freight=[field('route','运输方式','Transport Mode','select'),field('originPort','起运港','Port of Loading','combobox'),field('port','目的港','Port of Discharge','combobox'),field('containerType','柜型','Container Type','select')];
 const common=[field('description','费用名称／费用说明','Charge Description','textarea',{required:true}),field('qty','计费数量','Billing Quantity','number',{required:true,defaultValue:'1'}),field('billingUnit','计费单位','Billing Unit','select'),field('unitPrice','单价','Unit Price','money'),field('currency','币种','Currency','currency'),field('amount','金额','Amount','calculated'),field('remark','备注','Remark','textarea')];
 function ensure(config,settings,type,itemTypes){
  if(!config)return config;config.blocks||={};for(const key of ['basic','customer','items','terms'])config.blocks[key]||=[];
  if(Array.isArray(config.blocks.basic))config.blocks.basic=config.blocks.basic.filter(f=>!['quoteNumber','authorizationNumber','invitationNumber','date','quoteDate','invoiceDate'].includes(f.fieldKey));
  const first=Number(config.formSchemaVersion||0)<1;
  if(first){
   if(type==='quotation'&&Array.isArray(settings.optionCatalog?.paymentConditions)&&!settings.optionCatalog.paymentConditions.some(o=>String(o.value).toUpperCase()==='USDT'))settings.optionCatalog.paymentConditions.push({id:'paymentConditions:USDT',value:'USDT',labelZh:'USDT',labelEn:'USDT',active:true,sortOrder:90});
   for(const key of ['basic','customer','items','terms'])config.blocks[key]=config.blocks[key].filter(f=>!noField(f)&&!(key==='basic'&&['agency','statement'].includes(type)&&f.fieldKey==='company'));
   if(type==='agency')config.blocks.customer=merge(config.blocks.customer,[field('officeAddress','门店或办公室地址','Office Address','text',{sortOrder:70})]);
   if(type==='invitation'){
    config.blocks.basic=merge(config.blocks.basic,[field('validityMonths','邀请函有效期','Validity Period','select',{options:[{value:'1',labelZh:'一个月',labelEn:'One month'},{value:'3',labelZh:'三个月',labelEn:'Three months'}]}),field('validFrom','有效期自','Valid From','date'),field('validUntil','有效期至','Valid Until','date')]);
    config.blocks.customer=merge(config.blocks.customer,[field('recipientType','受邀方类型','Recipient Type','select',{required:true,options:[{value:'individual',labelZh:'个人',labelEn:'Individual'},{value:'group',labelZh:'团体',labelEn:'Group'},{value:'company',labelZh:'公司',labelEn:'Company'}]})]);
    const t=config.blocks.customer.find(f=>f.fieldKey==='recipientType');t.sortOrder=-100;
   }
   if(type==='packing'){
    config.blocks.basic=merge(config.blocks.basic,[field('contractNumber','合同编号','Contract No.'),field('invoiceNumber','发票编号','Invoice No.')]);
    config.blocks.items=merge(config.blocks.items,[field('length','每件包装长','Package Length','number'),field('width','每件包装宽','Package Width','number'),field('height','每件包装高','Package Height','number'),field('dimensionUnit','尺寸单位','Dimension Unit','select')]);
    config.blocks.items=config.blocks.items.filter(f=>!['itemType','unitPrice','currency','amount','payment','paymentCondition'].includes(f.fieldKey));
    config.blocks.terms=merge(config.blocks.terms,[field('shipping','贸易方式','Trade Term','select'),field('vesselName','船名','Vessel Name'),field('voyageNo','航次','Voyage No.'),field('containerNo','箱号','Container No.'),field('sealNo','封号','Seal No.'),field('shipmentDate','装运日期','Shipment Date','date'),field('estimatedArrival','预计到港日期','Estimated Arrival','date')]);
   }
   if(['packing','commercial'].includes(type))config.blocks.terms=merge(config.blocks.terms,[field('vesselName','船名','Vessel Name'),field('voyageNo','航次','Voyage No.'),field('containerNo','箱号','Container No.'),field('sealNo','封号','Seal No.'),field('shipmentDate','装运日期','Shipment Date','date'),field('estimatedArrival','预计到港日期','Estimated Arrival','date'),field('billOfLadingNo','提运单号','B/L / AWB No.'),field('namedPlace','贸易方式指定地点','Named Place'),field('shippingNotes','出货备注','Shipment Remarks','textarea')]);
   for(const f of config.blocks.terms){if(f.fieldKey==='payment'){f.zh='付款比例';f.en='Payment Ratio';f.fieldType='select';}if(f.fieldKey==='paymentCondition'){f.zh='付款方式';f.en='Payment Method';f.fieldType='select';}}
   if(['quotation','invoice','contract'].includes(type))config.blocks.terms=merge(config.blocks.terms,[field('paymentCondition','付款方式','Payment Method','select'),field('shipping','贸易方式','Trade Term','select'),...freight.filter(f=>f.fieldKey!=='route')]);
   config.formSchemaVersion=1;
  }
  if(Number(config.formSchemaVersion||0)<2&&['quotation','invoice','contract','commercial','packing'].includes(type)){
   const defaults=[['transportPickup','装车地点','Pickup Place'],['transportDeliveryPlace','工厂交货地点','Factory Delivery Place'],['transportCustomerPlace','最终交货地点','Final Delivery Place'],['transportAdvanceFee','代付运费','Transport Advance','money'],['transportAdvanceCurrency','代付运费币种','Advance Currency','currency'],['transportAdvanceNote','代付说明','Advance Notes','textarea']].map(([key,zh,en,t],i)=>field(key,zh,en,t||'text',{sortOrder:1000+i*10}));
   if(!config.blocks.terms.some(f=>['route','transportMethod'].includes(f.fieldKey)))defaults.push(field('route','运输方式','Transport Mode','select',{sortOrder:1090}));defaults.push(field('containerType','柜型','Container Type','select',{sortOrder:1100}));config.blocks.terms=merge(config.blocks.terms,defaults);config.formSchemaVersion=2;
  }
  if(Number(config.formSchemaVersion||0)<3&&type==='invoice'){
   for(const [key,zh,en]of [['afterSales','售后说明','After-sales'],['warranty','质保说明','Warranty']])if(!config.blocks.terms.some(f=>f.fieldKey===key))config.blocks.terms.push(field(key,zh,en,'textarea',{sortOrder:key==='afterSales'?1200:1210}));
   config.formSchemaVersion=3;
  }
  if(type==='agency'&&!config.authorizationSchemaVersion){
   config.blocks.territory||=[];config.blocks.display||=[];
   const option=(value,labelZh,labelEn)=>({id:'auth-'+value,value,labelZh,labelEn,active:true});
   const add=(block,key,zh,en,t,extra={})=>{if(!Object.values(config.blocks).flat().some(f=>f.fieldKey===key))config.blocks[block].push(field(key,zh,en,t,extra));};
   const nature=config.blocks.terms.find(f=>f.fieldKey==='authorizationType');if(nature){config.blocks.terms=config.blocks.terms.filter(f=>f!==nature);config.blocks.basic.push(nature);nature.options||=[];if(!nature.options.length)nature.options.push(option('non-exclusive','非独家授权','Non-exclusive'));if(!nature.options.some(o=>o.value==='exclusive'))nature.options.push(option('exclusive','独家授权','Exclusive'));nature.nativeChoicesMigrated=true;}
   const country=config.blocks.customer.find(f=>f.fieldKey==='country');if(country){config.blocks.customer=config.blocks.customer.filter(f=>f!==country);country.sortOrder=10;config.blocks.territory.push(country);}
   add('basic','validityMonths','有效期限','Validity Period','select',{sortOrder:20,defaultValue:'12',options:[option('6','6个月','6 months'),option('12','12个月','12 months'),option('24','24个月','24 months'),option('custom','自定义截止日期','Custom expiry date')]});
   add('customer','authorizedPartyType','被授权方类型','Authorized Party Type','select',{sortOrder:-100,defaultValue:'company',required:true,options:[option('individual','个人','Individual'),option('company','公司','Company')]});
   add('customer','recipientCompany','公司名称','Company Name','text',{sortOrder:-90});add('customer','authorizedPhoto','被授权人照片','Authorized Person Photo','image',{sortOrder:100});
   add('territory','territoryMode','授权区域模式','Territory Mode','select',{sortOrder:-100,defaultValue:'country',options:[option('country','国家（全国范围）','Country / Nationwide'),option('city','国家＋城市','Country + City')]});add('territory','authorizedCity','城市','City','text',{sortOrder:20});
   for(const [key,zh,en,order]of [['allowBrandUse','允许区域内品牌推广','Allow brand use',10],['noSubAuthorization','不得转授权','No sub-authorization',20],['finalPriceConfirmation','价格需最终确认','Final price confirmation',30]])add('terms',key,zh,en,'checkbox',{sortOrder:order,defaultValue:true});
   const terms=config.blocks.terms.find(f=>f.fieldKey==='extraTerms');if(terms)terms.sortOrder=100;
   add('display','showLogo','显示Logo','Show Logo','checkbox',{defaultValue:true});add('display','showCompanyHeader','显示公司抬头','Show Company Header','checkbox',{sortOrder:20,defaultValue:true});config.authorizationSchemaVersion=2;
  }
  const catalog={currency:'currencies',billingUnit:'billingUnits',dimensionUnit:'dimensionUnits',route:'shippingMethods',transportMethod:'shippingMethods',containerType:'containerTypes',shipping:'tradeTerms',payment:'payment',paymentCondition:'paymentConditions',cryptoNetwork:'cryptoNetworks',transportAdvanceCurrency:'currencies'};
  function dictionaries(fields){for(const f of fields){const key=catalog[f.fieldKey];if(key){f.catalogKey=key;f.options=copy(settings.optionCatalog?.[key]||[]);if(!['textarea','calculated'].includes(f.fieldType))f.fieldType=f.fieldKey==='currency'?'currency':'select';}}}
  Object.values(config.blocks).filter(Array.isArray).forEach(dictionaries);
  if(['quotation','invoice','contract','commercial'].includes(type)){
   itemTypes.migrate(config);const route=config.blocks.items.find(f=>f.fieldKey==='itemType');
   if(route){route.sortOrder=-100;route.required=true;route.visible=true;route.active=true;
    config.itemSchemas||={};config.itemSchemas.product=config.blocks.items;
    for(const option of itemTypes.options(route)){const kind=itemTypes.kind(option);if(kind==='product')continue;if(!config.itemSchemas[kind]){
      const legacy=copy(settings.costTemplates?.[kind]?.fields||[]).filter(f=>!['brand','model','year','hours','condition','productType','itemType','hsCode'].includes(f.fieldKey));
      const specific=kind==='freight'?freight:kind==='trucking'?[field('from','起运地','From'),field('to','目的地','To')]:[];
      config.itemSchemas[kind]=merge(legacy,[route,...specific,...common]);
      config.itemSchemas[kind].forEach((f,i)=>f.sortOrder=f.fieldKey==='itemType'?-100:(i+1)*10);
     }const fields=config.itemSchemas[kind];if(kind==='custom'&&!fields.some(f=>f.fieldKey==='image'))fields.push(field('image','图片','Image','image',{sortOrder:15}));const i=fields.findIndex(f=>f.fieldKey==='itemType');if(i>=0)fields[i]=route;else fields.unshift(route);dictionaries(fields);
    }
   }
  }
  for(const fields of [...Object.values(config.blocks),...Object.values(config.itemSchemas||{})])if(Array.isArray(fields))fields.sort(compare);
  return config;
 }
 function fields(config,kind='product'){return ordered(config?.itemSchemas?.[kind]||config?.blocks?.items||[]);}
 return {labels,field,ensure,fields,ordered,companyKeys};
});
