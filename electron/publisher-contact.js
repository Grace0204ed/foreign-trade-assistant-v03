'use strict';
const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'../assets/publisher-contact.json');
function validate(input){
  const result={};
  for(const k of ['name','wechat','phone','email'])result[k]=String(input[k]||'').trim().slice(0,160);
  if(!result.wechat)throw Error('请填写微信号');
  for(const k of ['wechatQr','paymentQr']){
    const value=String(input[k]||'');
    if(value&&(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)||value.length>4*1024*1024))throw Error('二维码必须是3MB以内的PNG、JPG或WebP图片');
    result[k]=value;
  }
  result.showPaymentQr=!!input.showPaymentQr;
  return result;
}
function read(){return validate(JSON.parse(fs.readFileSync(file,'utf8')));}
function write(input){const value=validate(input);fs.writeFileSync(file+'.tmp',JSON.stringify(value,null,2),'utf8');fs.renameSync(file+'.tmp',file);return value;}
module.exports={read,write,validate};
