(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.DocumentPresentation=factory();})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const paymentShipping={
    en:"Payment and Shipping Terms: Upon receipt of the 30% deposit, we will arrange the export customs declaration and required export documents, clean the equipment, and complete the pre-delivery inspection (PDI). We will then book shipping space and coordinate low-bed truck transportation to the port. The remaining 70% balance must be paid in full before the equipment is loaded onto the vessel. When making payment, please ensure that the beneficiary company's full legal name is entered correctly and completely. The bank address must be entered as Hong Kong, China. Please carefully verify the BIC/SWIFT code against our official bank details before making the transfer. Incorrect or incomplete payment details may result in the transfer being rejected or delayed.",
    zh:'付款及运输条款：收到30%订金后，我方将办理出口报关及所需出口文件，完成设备清洁和完整的发货前检查（PDI）。随后安排订舱，并协调板车将设备运输至港口。设备装船前，买方必须付清剩余70%的尾款。付款时，请务必准确、完整地填写收款公司的法定全称，银行地址填写为中国香港，并在汇款前仔细核对我方正式收款资料中的BIC/SWIFT代码。付款信息填写错误或不完整可能导致汇款被拒收或延迟到账。'
  };
  const regions=['title','tableHeader','product','body','notes','footer'];
  function typography(value={}){const result={};for(const region of regions){const source=value[region]||{};result[region]={};if(region==='product')Object.assign(result[region],{fontWeight:700,color:'#172033',fontSize:12,lineHeight:1.5});for(const key of ['fontFamily','fontSize','fontWeight','color','lineHeight','letterSpacing']){const v=source[key];if(key==='color'&&/^#[0-9a-f]{6}$/i.test(v))result[region][key]=v;else if(key==='fontFamily'&&typeof v==='string'&&/^[\w\s,'"\u3400-\u9fff-]{1,100}$/.test(v))result[region][key]=v;else if(['fontSize','fontWeight','lineHeight','letterSpacing'].includes(key)&&Number.isFinite(Number(v))){const limits={fontSize:[8,32],fontWeight:[100,900],lineHeight:[1,2.5],letterSpacing:[0,5]}[key];result[region][key]=Math.max(limits[0],Math.min(limits[1],Number(v)));}}}return result;}
  function contrast(hex){const n=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return n[0]*.2126+n[1]*.7152+n[2]*.0722>.179?'#111111':'#ffffff';}
  function luminance(color){const channels=/^#[0-9a-f]{6}$/i.test(color)?color.slice(1).match(/../g).map(v=>parseInt(v,16)):(String(color).match(/[\d.]+/g)||[]).map(Number);if(channels.length<3)return 1;const alpha=channels[3]??1,c=channels.slice(0,3).map(v=>{v=(v*alpha+255*(1-alpha))/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
  function contrastRatio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  // Allocate every visible column, not only description and monetary columns.
  // Each document retains its own configured columns/order and layout.
  function columnWidths(keys,minimums=[],available=0){
    const weights={sequence:24,itemType:52,description:132,packages:50,netWeight:61,grossWeight:61,hsCode:65,qty:50,cbm:52,billingUnit:46,marks:65,unitPrice:76,currency:52,amount:80,image:76,remark:76,brand:64,model:66,year:44,hours:54};
    const values=keys.map(k=>weights[k]||64),total=values.reduce((a,b)=>a+b,0);
    if(!available||minimums.length!==keys.length)return values.map(v=>100*v/total);
    const sum=minimums.reduce((a,b)=>a+b,0),scale=Math.min(1,available*.98/sum),floor=minimums.map(v=>v*scale),result=Array(keys.length).fill(0),open=new Set(keys.map((_,i)=>i));let remaining=available;
    while(open.size){const weight=[...open].reduce((n,i)=>n+values[i],0),locked=[...open].filter(i=>remaining*values[i]/weight<floor[i]);if(!locked.length){for(const i of open)result[i]=remaining*values[i]/weight;break;}for(const i of locked){result[i]=floor[i];remaining-=floor[i];open.delete(i);}}
    return result.map(v=>100*v/available);
  }
  function readableTables(host){
    host.classList.toggle('document-wide',host.dataset.pageOrientation==='landscape');
    host.querySelectorAll('table').forEach(table=>{
      const headers=[...table.querySelectorAll('thead tr:first-child th')];
      if(!headers.length||!headers.every(h=>/preview-col-/.test(h.className)))return;
      const keys=headers.map(h=>[...h.classList].find(c=>c.startsWith('preview-col-')&&c!=='preview-col-extra').slice(12));
      table.classList.add('document-data-table');
      // Measure translated header words so a short label is not broken into
      // single letters just because its English column used a small weight.
      const context=document.createElement('canvas').getContext('2d');
      const minimums=headers.map(header=>{const style=getComputedStyle(header);context.font=`${style.fontWeight} ${Math.max(10.5,parseFloat(style.fontSize)||0)}px ${style.fontFamily}`;const words=header.textContent.split(/[\s/]+/).filter(Boolean);return Math.max(22,Math.min(160,Math.max(0,...words.map(word=>context.measureText(word).width))+8));});
      // Paper orientation follows the saved document setting. Column count
      // must not silently turn a portrait document into short landscape pages.
      if(host.classList.contains('document-wide'))minimums[keys.indexOf('description')]=Math.max(150,minimums[keys.indexOf('description')]||0);
      const widths=columnWidths(keys,minimums,table.clientWidth);
      table.querySelectorAll('tr').forEach(row=>[...row.children].forEach((cell,i)=>{
        if(row.children.length!==headers.length)return;
        cell.style.setProperty('width',widths[i].toFixed(5)+'%','important');
        cell.style.setProperty('font-size',Math.max(10.5,parseFloat(cell.style.fontSize)||0)+'px','important');
      }));
      headers.forEach(header=>{
        const style=getComputedStyle(header),background=style.backgroundColor;
        const foreground=contrastRatio(style.color,background)>=4.5?style.color:(contrastRatio('#ffffff',background)>contrastRatio('#111111',background)?'#ffffff':'#111111');
        header.style.setProperty('color',foreground,'important');
        header.querySelectorAll('*').forEach(node=>{node.style.setProperty('color','inherit','important');node.style.setProperty('opacity','1','important');});
      });
      table.querySelectorAll('tbody td,tbody td span').forEach(cell=>{
        if(contrastRatio(getComputedStyle(cell).color,'#ffffff')<4.5)cell.style.setProperty('color','#172033','important');
      });
    });
    const viewport=host.closest('.quote-preview-viewport');
    if(viewport?.dataset.previewMode==='fit'){
      host.style.zoom=host.classList.contains('document-wide')?String(Math.min(1,(viewport.clientWidth-48)/host.offsetWidth)):'1';
    }
  }
  function background(host,design={}){
    if(!host)return;host.dataset.pageOrientation=design.orientation||'portrait';host.classList.toggle('document-landscape',design.orientation==='landscape');
    const source=window.DocumentBackgrounds?.source(design)||design.backgroundDataUrl;if(!source){host.style.backgroundImage='';host.style.backgroundSize='';host.style.backgroundPosition='';host.style.backgroundRepeat='';return;}
    const bounded=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
    const opacity=bounded(design.backgroundOpacity,0,1,.12),mask=bounded(design.overlay,0,1,.82),scale=bounded(design.backgroundScale,10,300,100),x=bounded(design.backgroundX,0,100,50),y=bounded(design.backgroundY,0,100,0);
    host.style.backgroundColor='#ffffff';const image=`url("${String(source).replaceAll('"','%22')}")`,alpha=1-opacity*(1-mask);host.style.backgroundImage=alpha<=0?image:`linear-gradient(rgba(255,255,255,${alpha}),rgba(255,255,255,${alpha})),${image}`;
    host.style.backgroundSize=design.backgroundPreset&&!design.backgroundDataUrl?'auto':scale!==100?`${scale}% auto`:design.backgroundMode==='stretch'?'100% 100%':design.backgroundMode||'cover';host.style.backgroundPosition=`${x}% ${y}%`;host.style.backgroundRepeat=design.backgroundPreset&&!design.backgroundDataUrl?'repeat':'repeat-y';
  }
  function apply(host,doc,design){if(!host)return;if(design)background(host,design);const color=/^#[0-9a-f]{6}$/i.test(doc.tableHeaderColor||'')?doc.tableHeaderColor:'';host.classList.toggle('custom-table-header',!!color);host.style.setProperty('--document-table-color',color||'inherit');host.style.setProperty('--document-header-text',color?contrast(color):'#ffffff');host.style.setProperty('--document-heading-color',color&&contrast(color)==='#ffffff'?color:'#172033');host.style.setProperty('--trade-ink',color?(contrast(color)==='#ffffff'?color:'#172033'):'var(--doc-accent,var(--primary))');
    // A designer's white module background must not hide white header text.
    host.querySelectorAll('.compact-letterhead').forEach(header=>{
      const accent=color||getComputedStyle(host).getPropertyValue('--doc-accent').trim()||'#285fc1';
      header.style.setProperty('background',accent,'important');header.style.setProperty('color',/^#[0-9a-f]{6}$/i.test(accent)?contrast(accent):'#ffffff','important');
      header.querySelectorAll('strong,h1').forEach(node=>node.style.setProperty('color','inherit','important'));
    });
    globalThis.DocumentLocales?.apply(host,doc.pdfLanguage||doc.language||'bilingual');
    const selectors={title:'.document-heading h1,.preview-title h2,.invitation-title,.agency-sheet h1',tableHeader:'thead th',product:'tbody .preview-col-description,tbody .preview-col-productType,tbody .preview-col-brand,tbody .preview-col-model',body:'.preview-fields,.document-parties,.document-shipment',notes:'.terms-content,.shipping-notes,.contract-clause',footer:'.document-footer'};
    selectors.body+=',.invitation-content,.invitation-body,.agency-sheet p,.agency-sheet td,.commission-field';
    const config=typography(doc.documentTypography);for(const [region,selector] of Object.entries(selectors))host.querySelectorAll(selector).forEach(node=>{for(const key of ['fontFamily','fontSize','fontWeight','color','lineHeight','letterSpacing']){const v=config[region][key];if(v!=null)node.style.setProperty(key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),typeof v==='number'&&['fontSize','letterSpacing'].includes(key)?v+'px':String(v),'important');}});
    readableTables(host);
  }
  const copy=typeof module==='object'&&module.exports?require('./document-template-copy.js'):globalThis.DocumentTemplateCopy;
  function terms(language){if(copy?.get(language,'payment'))return copy.get(language,'payment');return language==='en'?paymentShipping.en:language==='zh'?paymentShipping.zh:language==='zh-fr'||language==='zh-es'?copy.get(language.slice(3),'payment')+'\n'+paymentShipping.zh:paymentShipping.en+'\n'+paymentShipping.zh;}
  function localizeTerms(value,language){
    let source=String(value||''),replaced=false;const marker='\uE000FTA_PAYMENT_TEMPLATE\uE001';
    const known=[...Object.values(paymentShipping),...Object.values(copy?.packs||{}).map(p=>p.payment).filter(Boolean)];
    for(const text of known)if(source.includes(text)){source=source.replace(text,replaced?'':marker);replaced=true;}
    return source.replace(marker,terms(language)).trim();
  }
  return {paymentShipping,typography,contrast,contrastRatio,columnWidths,background,apply,terms,localizeTerms};
});
