'use strict';
const machine=document.getElementById('machine'),status=document.getElementById('status'),contactDialog=document.getElementById('contact-dialog');
const desktop=window.quotationDesktop;
let publisher;
function message(text,error=false){status.className='status '+(error?'error':'ok');status.textContent=text;}
async function copy(value){try{await navigator.clipboard.writeText(value);message('已复制。');}catch{message('复制失败，请选中文字后按Ctrl+C复制。',true);}}
async function init(){
  try{const data=await desktop.getLicenseStatus();machine.textContent=data.machineId||'读取失败';if(!data.machineId)document.getElementById('activate').disabled=true;}catch(error){message('读取本机信息失败：'+error.message,true);document.getElementById('activate').disabled=true;}
  try{publisher=await desktop.getPublisherContact();}catch{publisher=null;}
}
document.getElementById('copy').onclick=()=>copy(machine.textContent);
document.getElementById('contact').onclick=()=>{
  if(!publisher)return message('未能读取发布者联系资料，请重新启动软件。',true);
  for(const key of ['name','wechat','phone','email'])document.getElementById('contact-'+key).textContent=publisher[key];
  const qr=document.getElementById('wechat-qr');qr.hidden=!publisher.wechatQr;if(publisher.wechatQr)qr.src=publisher.wechatQr;
  document.getElementById('qr-missing').hidden=!!publisher.wechatQr;
  const pay=document.getElementById('payment-section');pay.hidden=!publisher.showPaymentQr||!publisher.paymentQr;if(!pay.hidden)document.getElementById('payment-qr').src=publisher.paymentQr;
  contactDialog.showModal();
};
document.getElementById('contact-close').onclick=()=>contactDialog.close();
document.getElementById('wechat-copy').onclick=()=>copy(publisher.wechat);
document.getElementById('activate').onclick=async()=>{
  const button=document.getElementById('activate'),code=document.getElementById('activation').value.trim();
  if(!code)return message('请粘贴完整授权码。',true);
  button.disabled=true;message('正在验证…');
  try{const result=await desktop.activateLicense(code);if(!result.ok)throw Error(result.message||'授权验证失败');message('激活成功，正在进入外贸助手…');await desktop.completeActivation();}
  catch(error){message(error.message,true);button.disabled=false;}
};
init();
