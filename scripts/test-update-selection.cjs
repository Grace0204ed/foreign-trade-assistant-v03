const assert=require('assert');
const policy=require('../assets/update-policy');
assert.equal(policy.compare('0.6.0','0.5.0'),1);
assert.equal(policy.compare('0.6.0','0.6.0'),0);
assert.equal(policy.eligible('0.5.0',{version:'0.6.0',platforms:['win32'],architectures:['x64']}),true);
assert.equal(policy.eligible('0.6.0',{version:'0.7.0-beta.1',platforms:['win32'],architectures:['x64']}),false);
assert.equal(policy.eligible('0.5.0',{version:'0.6.0',platforms:['darwin'],architectures:['x64']}),false);
console.log('update selection tests passed');
