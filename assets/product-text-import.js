(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ProductTextImport=factory();})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  const fields={name:'商品名称',productType:'分类',brand:'品牌',model:'型号',year:'年份',hours:'工时',unitPrice:'价格',currency:'币种',params:'规格参数',remark:'备注'};
  const aliases={name:['名称','商品名称','产品名称','name','productname'],productType:['分类','类别','产品类型','category','type'],brand:['品牌','brand'],model:['型号','model','itemno'],year:['年份','年','year'],hours:['工时','小时','hours','workinghours'],unitPrice:['价格','单价','底价','售价','price','unitprice','referenceprice'],currency:['币种','货币','currency'],params:['参数','规格','规格参数','spec','specification','parameters'],remark:['备注','说明','remark','notes']};
  const normalize=value=>String(value||'').trim().toLowerCase().replace(/[\s_\-/]/g,'');
  function header(value){return Object.keys(aliases).find(key=>aliases[key].includes(normalize(value)))||'';}
  // Preserve empty columns and quoted separators, including spreadsheet multiline cells.
  function parse(text){
    const source=String(text||'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
    const first=source.split('\n').find(line=>line.trim())||'';
    const separator=first.includes('\t')?'\t':first.includes(',')?',':first.includes('，')?'，':null;
    if(!separator)return source.split('\n').filter(line=>line.trim()).map(line=>line.trim().split(/\s+/));
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<source.length;i++){
      const c=source[i];
      if(c==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else if(quoted||!cell.trim())quoted=!quoted;else cell+=c;}
      else if(c===separator&&!quoted){row.push(cell.trim());cell='';}
      else if(c==='\n'&&!quoted){row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(quoted)throw new Error('引号未闭合，请检查粘贴文本。');
    row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;
  }
  function inspect(text){const rows=parse(text);if(!rows.length)throw new Error('请先粘贴产品文本。');const mapped=rows[0].map(header);const hasHeader=mapped.filter(Boolean).length>=2;return {rows:hasHeader?rows.slice(1):rows,headings:hasHeader?rows[0]:rows[0].map((_,i)=>'第 '+(i+1)+' 列'),mapping:hasHeader?mapped:rows[0].map(()=>''),hasHeader};}
  function records(analysis,mapping){
    const selected=mapping.filter(Boolean);if(!selected.length)throw new Error('请先选择列对应的字段。');
    if(new Set(selected).size!==selected.length)throw new Error('同一个字段不能对应多列。');
    return analysis.rows.map((cells,index)=>{if(cells.length!==mapping.length)throw new Error('第 '+(index+1)+' 行列数不一致，请修正后重新识别。');const values={};mapping.forEach((key,i)=>{if(key)values[key]=cells[i];});if(!values.name&&!values.model)throw new Error('第 '+(index+1)+' 行需要商品名称或型号。');return values;});
  }
  return {fields,parse,inspect,records};
});
