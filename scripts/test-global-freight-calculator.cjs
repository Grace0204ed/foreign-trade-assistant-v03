const assert=require('assert');
const calc=require('../assets/global-freight-calculator');
assert.equal(calc.arithmetic('5500+200+300'),6000);
assert.equal(calc.arithmetic('(10+5)*2'),30);
assert.throws(()=>calc.arithmetic('process.exit()'));
assert.deepEqual(calc.volume({mode:'dimensions',length:12000,width:2500,height:3500,lengthUnit:'mm',quantity:2}),{unitVolume:105,totalVolume:210,quantity:2});
assert.deepEqual(calc.volume({mode:'direct',directVolume:210,directKind:'total',quantity:2}),{unitVolume:105,totalVolume:210,quantity:2});
assert.equal(calc.freight({mode:'direct',directVolume:10,directKind:'unit',quantity:2,rate:95}).amount,1900);
console.log('global freight calculator tests passed');
