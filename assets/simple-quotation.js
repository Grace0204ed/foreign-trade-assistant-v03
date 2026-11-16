(function(){
 'use strict';
 function version(record){if(record.documentType!=='quotation')return 1;return Number(record.quotationPaperVersion??record.templateSnapshot?.quotationPaperVersion??(record.savedAt||record.isFormal||record.recordClass==='history'?1:2));}
 function apply(host,record,content){
  let paper=version(record);if(paper<2){delete host.dataset.quotationPaperVersion;return;}if(paper===2&&!record.savedAt&&!record.isFormal)paper=3;record.quotationPaperVersion=paper;host.classList.add('simple-quotation');host.dataset.quotationPaperVersion=String(paper);
  const header=document.createElement('header');header.className='simple-quotation-header document-letterhead';
  const title=document.createElement('div');title.className='simple-quotation-title document-heading';const heading=document.createElement('h1');for(const text of String(content.title).split(/\s*\/\s*/)){const line=document.createElement('span');line.textContent=text;heading.append(line);}title.append(heading);header.append(title);
  const company=document.createElement('div');company.className='simple-quotation-company';for(const text of String(content.companyName||'').split(/\s+\|\s+/)){const name=document.createElement('strong');name.textContent=text;company.append(name);}if(content.companyAddress){const address=document.createElement('p');address.textContent=content.companyAddress;company.append(address);}header.append(company);
  if(content.logo){const logo=document.createElement('img');logo.src=content.logo;logo.alt='Logo';header.append(logo);}
  if(paper>=3){const brand=document.createElement('div');brand.className='simple-quotation-brand';const frame=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(frame.namespaceURI,'path');frame.classList.add('simple-quotation-brand-frame');frame.setAttribute('viewBox','0 0 500 120');frame.setAttribute('preserveAspectRatio','none');path.setAttribute('d','M3 3 H490 Q497 3 497 10 V95 Q497 117 476 117 H70 Q60 117 55 107 Z');frame.append(path);brand.append(frame,company);const logo=header.querySelector(':scope>img');if(logo)brand.append(logo);header.append(brand);}
  const meta=host.querySelector('.compact-document-meta .preview-meta'),customer=host.querySelector(':scope>.preview-panel');const info=document.createElement('section');info.className='simple-quotation-info';
  if(customer){customer.classList.add('simple-quotation-customer','buyer-panel');info.append(customer);}if(meta)info.append(meta);
  host.querySelector('.compact-letterhead')?.remove();host.querySelector('.compact-document-meta')?.remove();host.prepend(header,info);
  const items=host.querySelector('table')?.closest('.preview-panel');items?.classList.add('simple-quotation-items','document-items');if(items?.querySelector(':scope>h3'))items.querySelector(':scope>h3').hidden=true;
  const terms=host.querySelector(':scope>.terms-panel');if(terms&&!terms.querySelector('.terms-content p,.configured-rich-output,img'))terms.remove();
  const contact=document.createElement('footer');contact.className='simple-quotation-contact document-footer';contact.innerHTML=content.contact;for(const p of contact.querySelectorAll('.preview-contact-list>p'))if(p.textContent.trim()===content.companyAddress)p.remove();host.append(contact);
  const color=/^#[\da-f]{6}$/i.test(record.tableHeaderColor||'')?record.tableHeaderColor:'#285fc1',rgb=color.slice(1).match(/../g).map(v=>parseInt(v,16)),tint='rgb('+rgb.map(v=>Math.round(v*.045+255*.955)).join(',')+')';host.style.setProperty('--simple-quotation-tint',tint);
  let ink=color;for(let factor=1;factor>=0&&DocumentPresentation.contrastRatio(ink,tint)<4.5;factor-=.04)ink='#'+rgb.map(v=>Math.round(v*Math.max(0,factor)).toString(16).padStart(2,'0')).join('');host.style.setProperty('--simple-quotation-heading',ink);
 }
 window.DocumentSimpleQuotation={apply,version};
})();
