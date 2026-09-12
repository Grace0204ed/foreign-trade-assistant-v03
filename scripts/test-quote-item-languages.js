const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../app.js'), 'utf8');
const start = source.indexOf('  function quoteItemTypeText(');
// Execute the actual shared cell renderer, not a duplicate translation implementation.
const blockEnd = source.indexOf('\n  function ', source.indexOf('  function quotePreviewCell(', start) + 12);
const context = { mode:'en', displayMode:()=>context.mode, settings:{currency:'USD'} };
vm.createContext(context);
vm.runInContext(source.slice(start, blockEnd), context);
const types = ['设备','海运费','国内运输费','港杂及报关费','保险费','拆装费','其他费用'];
for (const mode of ['en','zh','es','fr','bilingual','zh-es','zh-fr']) {
  context.mode=mode;
  for (const type of types) {
    const item={values:{itemType:type}};
    const before=JSON.stringify(item);
    const result=context.quotePreviewCell(item,{key:'itemType'});
    assert(result && result!=='undefined');
    if (['en','fr','es'].includes(mode)) assert(!/[\u4e00-\u9fff]/.test(result));
    else assert(result.includes(type));
    if (mode.startsWith('zh-') || mode==='bilingual') assert(result.includes(' / '));
    assert.equal(JSON.stringify(item),before,'Rendering must not mutate saved item types');
  }
}
assert.equal(context.quoteItemTypeText({kind:'freight',values:{}},'zh-fr'),'Fret maritime / 海运费');
assert.equal(context.quoteItemTypeText({values:{itemType:'设备'}},'en'),'Equipment');
assert(source.includes('if (column.key === "itemType") return quoteItemTypeText(item);'));
console.log('Passed: all 7 item types in 7 languages, shared preview cell, legacy fallback and immutable storage.');
