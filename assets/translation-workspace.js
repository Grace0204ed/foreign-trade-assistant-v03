(() => {
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function mount(){
    const host=document.getElementById('settings-translation-host');if(!host)return;
    host.innerHTML=`<section class="panel translation-panel"><h3>语言模板</h3><p>九种语言模板已随软件安装，无需联网或下载模型。字段标题及固定模板文案按所选语言输出；商品描述、自定义字段名称和手写条款保留原文，不会自动翻译。</p><div class="language-template-cards">${Object.entries(DocumentLocales.languages).map(([key,name])=>`<button type="button" data-locale="${key}"><strong>${name}</strong><small>${esc(key.toUpperCase())}</small></button>`).join('')}</div><section data-locale-preview aria-live="polite"></section></section>`;
    function preview(lang){host.querySelectorAll('[data-locale]').forEach(b=>b.classList.toggle('active',b.dataset.locale===lang));const target=host.querySelector('[data-locale-preview]');target.lang=lang;target.dir=lang==='ar'?'rtl':'ltr';target.innerHTML=`<h4>${esc(DocumentLocales.languages[lang])}</h4><p>${['Quotation','Proforma Invoice','Sales Contract','Commercial Invoice','Packing List','Letter of Authorization','Invitation Letter'].map(en=>esc(DocumentLocales.label(en,lang)||({fr:{Quotation:'Devis','Proforma Invoice':'Facture pro forma','Sales Contract':'Contrat de vente','Commercial Invoice':'Facture commerciale','Packing List':'Liste de colisage','Letter of Authorization':'Lettre d’autorisation','Invitation Letter':'Lettre d’invitation'},es:{Quotation:'Cotización','Proforma Invoice':'Factura proforma','Sales Contract':'Contrato de compraventa','Commercial Invoice':'Factura comercial','Packing List':'Lista de empaque','Letter of Authorization':'Carta de autorización','Invitation Letter':'Carta de invitación'}}[lang]?.[en])||en)).join(' · ')}</p>`;}
    host.onclick=e=>{const b=e.target.closest('[data-locale]');if(b)preview(b.dataset.locale);};preview('en');
  }
  window.TranslationWorkspace={mount};
  window.addEventListener('foreign-trade-auth-ready',mount);
})();
