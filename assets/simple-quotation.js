(function(){
 'use strict';
 function version(record){if(record.documentType!=='quotation')return 1;return Number(record.quotationPaperVersion??record.templateSnapshot?.quotationPaperVersion??(record.savedAt||record.isFormal||record.recordClass==='history'?1:2));}
 function apply(host,record,content){
  if(version(record)!==2){delete host.dataset.quotationPaperVersion;return;}record.quotationPaperVersion=2;host.classList.add('simple-quotation');host.dataset.quotationPaperVersion='2';
  const header=document.createElement('header');header.className='simple-quotation-header document-letterhead';
  const title=document.createElement('div');title.className='simple-quotation-title document-heading';const heading=document.createElement('h1');for(const text of String(content.title).split(/\s*\/\s*/)){const line=document.createElement('span');line.textContent=text;heading.append(line);}title.append(heading);header.append(title);
  const company=document.createElement('div');company.className='simple-quotation-company';for(const text of String(content.companyName||'').split(/\s+\|\s+/)){const name=document.createElement('strong');name.textContent=text;company.append(name);}if(content.companyAddress){const address=document.createElement('p');address.textContent=content.companyAddress;company.append(address);}header.append(company);
  if(content.logo){const logo=document.createElement('img');logo.src=content.logo;logo.alt='Logo';header.append(logo);}
  const meta=host.querySelector('.compact-document-meta .preview-meta'),customer=host.querySelector(':scope>.preview-panel');const info=document.createElement('section');info.className='simple-quotation-info';
  if(customer){customer.classList.add('simple-quotation-customer','buyer-panel');for(const field of customer.querySelectorAll('.document-customer-field'))if(!field.querySelector('bdi')?.textContent.trim()&&!field.querySelector('img'))field.remove();info.append(customer);}if(meta)info.append(meta);
  host.querySelector('.compact-letterhead')?.remove();host.querySelector('.compact-document-meta')?.remove();host.prepend(header,info);
  const items=host.querySelector('table')?.closest('.preview-panel');items?.classList.add('simple-quotation-items','document-items');if(items?.querySelector(':scope>h3'))items.querySelector(':scope>h3').hidden=true;
  const terms=host.querySelector(':scope>.terms-panel');if(terms&&!terms.querySelector('.terms-content p,.configured-rich-output,img'))terms.remove();
  const contact=document.createElement('footer');contact.className='simple-quotation-contact document-footer';contact.innerHTML=content.contact;for(const p of contact.querySelectorAll('.preview-contact-list>p'))if(p.textContent.trim()===content.companyAddress)p.remove();host.append(contact);
  const color=/^#[\da-f]{6}$/i.test(record.tableHeaderColor||'')?record.tableHeaderColor:'#285fc1',rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16)),tint='rgb('+rgb.map(v=>Math.round(v*.045+255*.955)).join(',')+')';host.style.setProperty('--simple-quotation-tint',tint);
  let ink=color;for(let factor=1;factor>=0&&DocumentPresentation.contrastRatio(ink,tint)<4.5;factor-=.04)ink='#'+rgb.map(v=>Math.round(v*Math.max(0,factor)).toString(16).padStart(2,'0')).join('');host.style.setProperty('--simple-quotation-heading',ink);
 }
 window.DocumentSimpleQuotation={apply,version};
})();
