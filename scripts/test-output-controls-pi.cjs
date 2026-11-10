const {app,BrowserWindow}=require('electron');
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fta-output-controls-pi-'));
process.env.QUOTE_DATA_DIR=path.join(dir,'data');
app.setPath('userData',path.join(dir,'profile'));
app.on('window-all-closed',()=>{});

app.whenReady().then(async()=>{
 const server=await require('../server').startServer(0),base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({show:false,width:1550,height:1150,webPreferences:{offscreen:true,backgroundThrottling:false}});
 const errors=[],results=[];
 win.webContents.on('render-process-gone',(_event,details)=>errors.push(details.reason));
 const run=async source=>{try{return await win.webContents.executeJavaScript(source);}catch(error){throw Error(error.message+'\n'+source);}};
 const wait=async source=>{for(let i=0;i<250;i++){if(await run(source))return;await new Promise(resolve=>setTimeout(resolve,35));}throw Error('Timeout '+source);};
 const set=async(selector,value,event='change')=>run(`(()=>{const input=document.querySelector(${JSON.stringify(selector)});if(!input)throw Error('Missing input '+${JSON.stringify(selector)});if(input.type==='checkbox')input.checked=${JSON.stringify(value)};else input.value=${JSON.stringify(value)};input.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));})()`);
 const create=async type=>{
  await run("(async()=>{if(window.hasUnsavedWork?.())await window.decideCloseWork('discard')})()");
  await run(`document.querySelector('[data-create-document=${type}]').click()`);
  const kind=type==='invitation'?'invitation':['authorization','statement'].includes(type)?'agency':'quote';
  await wait(`quoteSettingsContext.documentType('${kind}')==='${type}'&&!!document.querySelector('#signing-controls-${kind}')`);
  return kind;
 };
 try{
  await win.loadURL(base);
  await wait("!!window.quoteSettingsContext&&document.querySelectorAll('#overview-metrics article').length===4");
  const images=await run(`(()=>{const make=(word,color)=>{const canvas=document.createElement('canvas');canvas.width=320;canvas.height=120;const context=canvas.getContext('2d');context.fillStyle=color;context.font='bold 34px Arial';context.fillText(word,15,70);return canvas.toDataURL('image/png')};return{zh:make('QA ZH','#203654'),en:make('QA EN','#203654'),seal:make('QA SEAL','#b93044')}})()`);
  await run(`quoteSettingsContext.save({companySignatures:{zh:{name:'测试签署人',title:'负责人',transparent:${JSON.stringify(images.zh)},original:${JSON.stringify(images.zh)},version:'qa-zh'},en:{name:'QA English Signer',title:'Manager',transparent:${JSON.stringify(images.en)},original:${JSON.stringify(images.en)},version:'qa-en'}},stampTransparentDataUrl:${JSON.stringify(images.seal)},stampDataUrl:${JSON.stringify(images.seal)},bankFields:[{id:'qa-bank',labelEn:'QA Bank Account',labelZh:'测试银行账户',value:'QA-BANK-ACCOUNT-ONLY',visible:true,sortOrder:10}]})`);

  for(const type of ['quotation','invoice','contract','commercial','packing','invitation','authorization','statement']){
   const kind=await create(type),output='#document-output-options-'+kind,host='#signing-controls-'+kind,preview='#'+kind+'-preview';
   const location=await run(`(()=>{const host=document.querySelector('${host}'),output=document.querySelector('${output}'),view=document.querySelector('#view-${kind}');return{oneHost:view.querySelectorAll('#signing-controls-${kind}').length,atBottom:!!output&&host.closest('.document-output-options')===output,topDuplicates:view.querySelectorAll('.document-appearance-toolbar [data-signature-choice],[data-tools-view] [data-signature-choice]').length,choices:host.querySelectorAll('[data-signature-choice]').length,signature:host.querySelectorAll('[data-signature-visible]').length,seal:host.querySelectorAll('[data-seal-visible]').length,visible:output?.getBoundingClientRect().height>0}})()`);
   assert.equal(location.oneHost,1,type+' has one signing editor');
   assert(location.atBottom&&location.visible,type+' signing controls are in visible bottom output options');
   assert.equal(location.topDuplicates,0,type+' has no repeated signing controls in the top toolbar');
   assert.equal(location.choices,1);assert.equal(location.signature,1);assert.equal(location.seal,1);
   if(kind==='quote'){
    assert(await run(`!!document.querySelector('${output} #quote-photo-appendix')&&!!document.querySelector('${output} #document-show-bank')`),type+' retains existing photo and bank controls in the same bottom section');
    assert(await run("document.querySelector('#document-show-signature').closest('label').hidden"),'legacy combined signing checkbox stays hidden');
   }
   const inputStyle=await run(`(()=>{const input=document.querySelector('${host} [data-signature-visible]'),seal=document.querySelector('${host} [data-seal-visible]'),label=input.closest('label'),a=getComputedStyle(input),b=getComputedStyle(seal);return{width:parseFloat(a.width),height:parseFloat(a.height),same:a.width===b.width&&a.height===b.height,radius:parseFloat(getComputedStyle(label).borderRadius)}})()`);
   assert(inputStyle.same&&inputStyle.width>=24&&inputStyle.height<=18&&inputStyle.radius>=6,type+' independent switches share the bottom pill style');

   await set(host+' [data-signature-choice]','en');
   for(const [signature,seal] of [[false,false],[true,false],[false,true],[true,true]]){
    await run(`(()=>{const host=document.querySelector('${host}');host.querySelector('[data-signature-visible]').checked=${signature};host.querySelector('[data-seal-visible]').checked=${seal};host.querySelector('[data-seal-visible]').dispatchEvent(new Event('change',{bubbles:true}));})()`);
    assert.equal(await run(`document.querySelectorAll('${preview} .signing-ink img').length`),signature?1:0,type+' signature visibility updates preview independently');
    assert.equal(await run(`document.querySelectorAll('${preview} .signing-seal').length`),seal?1:0,type+' seal visibility updates preview independently');
   }
   assert.equal(await run(`document.querySelector('${preview} .signing-ink img')?.getAttribute('src')`),images.en,type+' selected English signature reaches preview');
   await set(host+' [data-signature-choice]','zh');
   assert.equal(await run(`document.querySelector('${preview} .signing-ink img')?.getAttribute('src')`),images.zh,type+' signature version changes the actual preview image');
   const language=kind==='quote'?'#pdf-language':kind==='invitation'?'#invitation-language':'#agency-language';
   await set(language,'en');
   assert.equal(await run(`document.querySelector('${preview} .signing-ink img')?.getAttribute('src')`),images.zh,type+' PDF language does not replace chosen signature');

   if(kind==='quote'&&type!=='packing'){
    await set('#document-show-bank',false);
    assert(!await run(`(()=>{const blocks=[...document.querySelectorAll('${preview} .bank-panel')];return blocks.some(node=>!node.hidden&&getComputedStyle(node).display!=='none'&&node.getBoundingClientRect().height>0)})()`),type+' bank switch hides bank preview');
    await set('#document-show-bank',true);
    assert(await run(`(()=>{const blocks=[...document.querySelectorAll('${preview} .bank-panel')];return blocks.some(node=>!node.hidden&&getComputedStyle(node).display!=='none'&&node.textContent.includes('QA-BANK-ACCOUNT-ONLY'))})()`),type+' bank switch restores current bank details');
   }else if(type==='packing'){
    assert(await run("document.querySelector('#document-show-bank').disabled"),'packing keeps its original nonfinancial bank rule');
   }else if(type==='statement'){
    await set('#agency-bank-account','QA-STATEMENT-ACCOUNT','input');
    await set(host+' [data-receiving-visible]',false);
    assert(!await run(`document.querySelector('${preview}').textContent.includes('QA-STATEMENT-ACCOUNT')`),'statement bank switch hides recipient payment data');
    await set(host+' [data-receiving-visible]',true);
    assert(await run(`document.querySelector('${preview}').textContent.includes('QA-STATEMENT-ACCOUNT')`),'statement bank switch restores recipient payment data');
   }
   results.push(type);
  }

  await create('quotation');
  await run(`(async()=>{const data=${JSON.stringify(images.en)},file=new File([await(await fetch(data)).arrayBuffer()],'qa-product.png',{type:'image/png'}),transfer=new DataTransfer();transfer.items.add(file);const input=document.querySelector('.quote-line-image-input');input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await wait("!!document.querySelector('#quote-items .quote-action-image-preview:not([hidden]) img')");
  await set('#quote-photo-appendix',false);assert.equal(await run("document.querySelectorAll('#quote-preview .photo-grid').length"),0);
  await set('#quote-photo-appendix',true);assert(await run("document.querySelectorAll('#quote-preview .photo-grid img').length>0"),'photo appendix pill changes actual detailed photo preview');

  await create('invoice');
  const buttonLabel=await run("document.querySelector('#apply-pi-payment-shipping').textContent");
  assert(buttonLabel.includes('标准')&&buttonLabel.includes('备注'),'PI action names the exact standard-notes operation');
  assert(!/更新付款|同步付款|修改付款比例/.test(buttonLabel),'PI label does not imply changing payment-ratio or price fields');
  await run("window.qaPiPrompts=[];window.confirm=message=>{qaPiPrompts.push(message);return false};const payment=document.querySelector('[data-termfield=payment]');if(payment.tagName==='SELECT'){const row=[...payment.options].find(option=>option.value==='40/60')||[...payment.options].find(option=>option.value);payment.value=row.value}else payment.value='40/60';payment.dispatchEvent(new Event('change',{bubbles:true}))");
  await set('#buyer-company','QA PI BUYER','input');await set('#buyer-contact','QA PI CONTACT','input');
  await set('.quote-line [data-qfield=qty]','2','input');await set('.quote-line [data-qfield=unitPrice]','1234.5','input');
  await set('[data-termfield=notes]','客户原有备注 QA','input');
  const businessValues=()=>run("({payment:document.querySelector('[data-termfield=payment]').value,price:document.querySelector('.quote-line [data-qfield=unitPrice]').value,qty:document.querySelector('.quote-line [data-qfield=qty]').value,company:document.querySelector('#buyer-company').value,contact:document.querySelector('#buyer-contact').value})");
  const before=await businessValues();
  await run("document.querySelector('#apply-pi-payment-shipping').click()");
  assert.equal(await run("document.querySelector('[data-termfield=notes]').value"),'客户原有备注 QA','cancel preserves nonempty notes');
  assert.deepEqual(await businessValues(),before,'cancel leaves payment, price, quantity and buyer untouched');
  assert.equal(await run('qaPiPrompts.length'),1,'nonempty notes require confirmation');
  assert(await run("qaPiPrompts[0].includes('只替换备注')&&qaPiPrompts[0].includes('PDI')&&qaPiPrompts[0].includes('SWIFT')"),'confirmation explains full contents and limited edit scope');

  await run("window.confirm=message=>{qaPiPrompts.push(message);return true};document.querySelector('#apply-pi-payment-shipping').click()");
  const expected=await run("DocumentPresentation.terms('bilingual')"),actual=await run("document.querySelector('[data-termfield=notes]').value");
  assert.equal(actual,expected,'PI action replaces notes with the complete canonical bilingual text');
  assert(actual.includes('PDI')&&actual.includes('BIC/SWIFT')&&actual.includes('Hong Kong, China')&&actual.includes('中国香港')&&actual.includes('30%')&&actual.includes('70%'),'canonical bilingual notes include PDI, bank/SWIFT reminders and payment/shipping sequence');
  assert(!actual.includes('客户原有备注 QA'),'accepted replacement removes the previous notes');
  assert.deepEqual(await businessValues(),before,'accepted replacement changes no payment ratio, item value or buyer field');
  assert(await run("document.querySelector('#quote-preview').textContent.includes('PDI')&&document.querySelector('#quote-preview').textContent.includes('BIC/SWIFT')&&document.querySelector('#quote-preview').textContent.includes('QA PI BUYER')"),'complete notes and original buyer reach live preview');
  await set('[data-termfield=notes]','','input');
  await run("window.qaBlankPiPrompts=0;window.confirm=()=>{qaBlankPiPrompts++;return false};document.querySelector('#apply-pi-payment-shipping').click()");
  assert.equal(await run('qaBlankPiPrompts'),0,'blank notes can be filled directly');
  assert.equal(await run("document.querySelector('[data-termfield=notes]').value"),expected);
  assert.deepEqual(await businessValues(),before);
  assert.deepEqual(errors,[]);
  console.log('PASS eight document types: single bottom signing controls, consistent pill switches, independent signature/seal/version preview, PDF-language independence, applicable bank/photo preview; PI complete bilingual notes, bank/PDI content, cancel/confirm boundaries and unchanged payment/item/buyer fields. Isolated data: '+dir+'; types: '+results.join(','));
 }finally{win.destroy();await new Promise(resolve=>server.close(resolve));app.quit();}
}).catch(error=>{console.error(error);app.exit(1);});
