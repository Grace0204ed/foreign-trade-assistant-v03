const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const elements = new Map();
const element = id => { if(!elements.has(id)) elements.set(id,{value:'',innerHTML:'',textContent:'',hidden:true});return elements.get(id); };
const context = {settings:{},ports:[],rates:[],portRegion:p=>p.region};
const sandbox = {window:{freightContext:context},document:{getElementById:element},crypto:{randomUUID},structuredClone};
let source = fs.readFileSync(path.join(__dirname,'../assets/freight-workspace.js'),'utf8');
source = source.replace('window.freightWorkspace={init,render,renderSettings,renderCountries};','window.testFreight={config,previewText,getPreview:()=>preview};');
vm.runInNewContext(source,sandbox);
const api=sandbox.window.testFreight;
assert.equal(api.config().groups[0].name,'非洲');
context.ports=[
  {id:'port-shanghai',countryName:'China',countryChineseName:'中国',portName:'Shanghai Port',portChineseName:'上海港',region:'中国'},
  {id:'port-beira',countryName:'Mozambique',countryChineseName:'莫桑比克',portName:'Beira Port',portChineseName:'贝拉港',region:'Africa / 非洲'}
];
assert(api.config().groups[0].countries.some(c=>c.match==='Mozambique'),'defaults refresh after async ports load');
context.settings.freightWorkspace={labels:{},groups:[],routes:[]};
assert.equal(api.config().groups.length,0,'deleted groups must not reappear');
const input='测试货代|2026-09-01|2026-09-30|津巴布韦|上海港|莫桑比克|贝拉港|散杂||USD|85|m³|海运费|保险';
const parse=text=>{element('freight-text-import-input').value=text;api.previewText();return api.getPreview();};
let rows=parse(input);assert.equal(rows[0].errors.length,0);assert.equal(rows[0].data.rate,85);assert.equal(rows[0].data.billingMode,'cbm');
context.rates=[{...rows[0].data,id:'existing'}];
assert.equal(parse(input)[0].old.id,'existing','same month/forwarder route previews update');
assert(parse(input+'\n'+input)[1].errors.length>0,'duplicates blocked');
assert(parse(input.replace('|莫桑比克|','|南非|'))[0].errors.some(e=>e.includes('卸货国家')));
assert(parse(input.replace('2026-09-30','2026-09-31'))[0].errors.length>0);
rows=parse(input.replace('|85|','|待询价|'));assert.equal(rows[0].data.rate,null);assert.equal(rows[0].data.rateStatus,'pending');
rows=parse(input.replace('|散杂||','|集装箱|40HQ|').replace('|m³|','|柜|'));assert.equal(rows[0].errors.length,0);assert.equal(rows[0].data.billingMode,'container');
assert(parse(input.replace('|散杂||','|集装箱|40HQ|'))[0].errors.length>0);
console.log('Freight workspace: defaults, persistence, import matching, duplicate/date/country validation and billing tests passed.');
