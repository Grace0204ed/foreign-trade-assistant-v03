(() => {
 'use strict';
 let mounting=false;
 async function mount(){
  const host=document.getElementById('settings-data-host'),desktop=window.quotationDesktop;
  if(!host||!desktop?.getPublisherContact||mounting||document.getElementById('publisher-contact-settings'))return;
  mounting=true;
  try{
   const version=await desktop.getAppVersion();if(version.packaged)return;
   let data=await desktop.getPublisherContact();
   const panel=document.createElement('section');panel.id='publisher-contact-settings';panel.className='panel';
   panel.innerHTML='<h3>发布者联系资料</h3><p>仅开发端可编辑。资料将随下一次安装包发布，用于待授权界面的“联系我们”。</p><div class="form-grid"></div><div class="actions"><button type="button" class="primary" data-save>保存发布资料</button></div><p role="status"></p>';
   const grid=panel.querySelector('.form-grid');
   for(const [key,name] of [['name','称呼'],['wechat','微信号'],['phone','电话'],['email','邮箱']]){
    const label=document.createElement('label');label.textContent=name;const input=document.createElement('input');input.dataset.publisher=key;input.value=data[key]||'';input.maxLength=160;label.append(input);grid.append(label);
   }
   for(const [key,name] of [['wechatQr','微信二维码'],['paymentQr','收款二维码（可选）']]){
    const label=document.createElement('label');label.textContent=name;
    const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';
    const image=document.createElement('img');image.style.cssText='width:120px;height:120px;object-fit:contain';image.hidden=!data[key];if(data[key])image.src=data[key];
    input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>3*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){panel.querySelector('[role=status]').textContent='请上传3MB以内的PNG、JPG或WebP图片。';return;}data[key]=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});image.src=data[key];image.hidden=false;};
    const remove=document.createElement('button');remove.type='button';remove.textContent='删除图片';remove.onclick=()=>{data[key]='';image.removeAttribute('src');image.hidden=true;input.value='';};label.append(input,image,remove);grid.append(label);
   }
   const show=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=data.showPaymentQr;show.append(check,document.createTextNode('在授权联系窗口显示收款二维码'));grid.append(show);
   panel.querySelector('[data-save]').onclick=async e=>{e.target.disabled=true;try{panel.querySelectorAll('[data-publisher]').forEach(i=>data[i.dataset.publisher]=i.value.trim());data.showPaymentQr=check.checked;data=await desktop.savePublisherContact(data);panel.querySelector('[role=status]').textContent='已保存，重新打包后随安装包生效。';}catch(error){panel.querySelector('[role=status]').textContent=error.message;}finally{e.target.disabled=false;}};
   host.append(panel);
  }catch(error){console.warn('发布资料设置未载入：',error.message);}finally{mounting=false;}
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-settings-section="data"],[data-settings-section="data-management"],[data-settings-section="admin"]'))setTimeout(mount);});
 document.addEventListener('foreign-trade-auth-ready',()=>setTimeout(mount));
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount));else setTimeout(mount);
})();
