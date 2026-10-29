(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.TradeDocumentLayouts=factory();})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  // Each document has a different information hierarchy, not merely a new title.
  const layouts={
    quotation:p=>`${p.letterhead}${p.heading}${p.customer}${p.items}${p.photos}${p.offerTerms}${p.bank}${p.signature}`,
    invoice:p=>`${p.letterhead}${p.heading}${p.proformaNotice}${p.parties}${p.items}<div class="pi-payment-layout">${p.paymentTerms}${p.bank}</div>${p.deliveryTerms}${p.photos}${p.signature}`,
    contract:p=>`${p.letterhead}${p.heading}${p.parties}${p.contractItems}${p.contractClauses}${p.bank}${p.photos}${p.signature}`,
    commercial:p=>`${p.letterhead}${p.heading}${p.parties}${p.shipment}${p.items}${p.shippingNotes}${p.bank}${p.signature}`,
    packing:p=>`${p.letterhead}${p.heading}${p.parties}${p.shipment}${p.items}${p.packingTotals}${p.shippingNotes}${p.signature}`
  };
  function render(type,parts){return (layouts[type]||layouts.quotation)(parts);}
  function options(type,overrides={}){const defaults={quotation:{bank:true,signature:true},invoice:{bank:true,signature:true},contract:{bank:true,signature:true},commercial:{bank:true,signature:true},packing:{bank:false,signature:false}}[type]||{bank:false,signature:false};return {bank:type!=='packing'&&(overrides.bank??defaults.bank),signature:overrides.signature??defaults.signature};}
  return {render,options,types:Object.keys(layouts)};
});
