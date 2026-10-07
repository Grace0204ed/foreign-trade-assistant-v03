(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AgencyDocuments = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const types = {authorization:'代理授权书', agreement:'销售代理佣金协议', statement:'订单佣金结算单'};
  const titles = {
    authorization:['代理授权书','Letter of Authorization','Lettre d’autorisation','Carta de autorización'],
    agreement:['销售代理佣金协议','Sales Agency Commission Agreement','Accord de commission d’agence commerciale','Acuerdo de comisión de agencia comercial'],
    statement:['订单佣金结算单','Order Commission Statement','Décompte de commission par commande','Liquidación de comisión por pedido']
  };
  const clauses = {
    scope:['本协议适用于原非独家授权范围内，由乙方介绍且经双方书面确认归属的订单。原授权的非独家、不可转授权约定继续适用。','This agreement covers orders introduced by Party B and attributed to Party B in writing within the original authorization. The non-exclusive and non-transferable authorization remains applicable.','Cet accord couvre les commandes apportées par la partie B et attribuées par écrit dans le cadre de l’autorisation initiale, qui reste non exclusive et incessible.','Este acuerdo cubre los pedidos presentados por la parte B y atribuidos por escrito dentro de la autorización original, que sigue siendo no exclusiva e intransferible.'],
    minimum:['每笔订单佣金不得低于销售合同金额的5%，按合同金额而非甲方利润计算。','Commission for each order shall be at least 5% of the sales contract amount, not Party A’s profit.','La commission de chaque commande est au minimum de 5 % du montant du contrat de vente, et non du bénéfice de la partie A.','La comisión de cada pedido será como mínimo el 5% del importe del contrato de venta, no del beneficio de la parte A.'],
    markup:['乙方可在甲方基础报价上加价，最终报价须经甲方书面确认。加价收益计入佣金、不重复叠加；佣金低于合同金额5%的补足至5%。','Party B may add a markup to Party A’s base quotation, subject to Party A’s written confirmation of the final price. Markup earnings count towards commission, are not cumulative with it, and are topped up to 5% of the contract amount if lower.','La partie B peut majorer le prix de base sous réserve de confirmation écrite du prix final par A. La marge est incluse dans la commission, sans cumul ; le minimum de 5 % du contrat reste garanti.','B puede añadir un margen al precio base, sujeto a confirmación escrita del precio final por A. El margen se incluye en la comisión sin sumarse a ella; se garantiza el mínimo del 5% del contrato.'],
    enhanced:['利润空间较高的订单，可逐单书面确认将佣金由5%提高至10%或其他比例。应付佣金取“合同金额×确认比例”与“确认加价收益”较高者，两者不相加。','For higher-margin orders, the parties may agree in writing to increase the rate from 5% to 10% or another rate. Payable commission is the higher of contract amount × confirmed rate and agreed markup earnings; the two are not added together.','Pour les commandes à marge élevée, le taux peut passer de 5 % à 10 % ou à un autre taux convenu par écrit. La commission est le plus élevé du montant du contrat multiplié par ce taux et de la marge convenue, sans cumul.','Para pedidos de mayor margen, puede acordarse por escrito elevar la tasa del 5% al 10% u otra tasa. La comisión es el mayor entre el importe contractual por la tasa y el margen acordado, sin sumarlos.'],
    protection:['对于乙方介绍且双方书面确认的客户，未经乙方事先书面同意，甲方不得私下报价、绕过乙方直接交易或以低于已确认代理报价的价格争取订单。乙方应得佣金不受绕单行为影响。','For customers introduced by Party B and confirmed in writing, Party A shall not privately quote, bypass Party B to transact directly, or undercut the agreed agent quotation without Party B’s prior written consent. Circumvention shall not prejudice commission entitlement.','Pour les clients apportés par B et confirmés par écrit, A ne peut, sans accord écrit préalable de B, proposer un prix en privé, contourner B ou sous-coter le devis convenu. Le contournement ne supprime pas le droit à commission.','Para clientes presentados por B y confirmados por escrito, A no podrá cotizar en privado, eludir a B ni rebajar la oferta acordada sin consentimiento escrito previo de B. La elusión no elimina el derecho a comisión.'],
    trigger:['甲方收到客户支付的销售合同金额100%后才开始结算佣金，并应在收到全款后的3至7个工作日内支付佣金、提供付款凭证。','Settlement begins only after Party A receives 100% of the sales contract amount from the customer. Commission shall be paid within 3–7 business days after receipt, with payment evidence provided.','Le règlement commence uniquement après réception par A de 100 % du montant du contrat. La commission doit être payée dans les 3 à 7 jours ouvrables suivant cette réception, avec justificatif.','La liquidación comienza solo tras recibir A el 100% del importe contractual del cliente. La comisión se pagará dentro de 3 a 7 días hábiles desde la recepción, con comprobante.'],
    statement:['每笔订单双方签署《订单佣金结算单》，列明客户姓名或公司、合同编号及金额、5%佣金或约定加价佣金、乙方银行信息以及上述结算条件和付款期限；最低5%及不重复叠加原则仍适用。','Both parties shall sign an Order Commission Statement for every order, listing customer or company name, contract number and amount, 5% commission or agreed markup commission, Party B’s bank details, and the settlement trigger and deadline above. The minimum 5% and non-cumulative rules remain applicable.','Les parties signent un décompte par commande indiquant le client, le numéro et le montant du contrat, la commission de 5 % ou la marge convenue, les coordonnées bancaires de B et les conditions et délais ci-dessus. Le minimum de 5 % et le non-cumul restent applicables.','Ambas partes firmarán una liquidación por pedido con cliente, número e importe contractual, comisión del 5% o margen acordado, datos bancarios de B y condiciones y plazos anteriores. Se mantiene el mínimo del 5% sin acumulación.'],
    bank:['按乙方书面提供并确认的收款账户支付，账户变更须经双方书面确认。具体币种、银行费用及依法需要处理的税费逐单确认，不得单方变更佣金计算方式。','Payment shall be made to Party B’s account confirmed in writing. Account changes require written confirmation by both parties. Currency, bank charges and legally required tax treatment are agreed per order; no unilateral change to the commission calculation is permitted.','Le paiement est effectué au compte confirmé par écrit de B. Toute modification requiert l’accord écrit des parties. Devise, frais bancaires et fiscalité sont convenus par commande, sans modification unilatérale du calcul.','El pago se realizará a la cuenta confirmada por escrito de B. Los cambios requieren confirmación escrita de ambas partes. Moneda, gastos bancarios e impuestos se acuerdan por pedido, sin cambios unilaterales del cálculo.'],
    usdt:['银行转账为约定结算渠道。USDT及预计约3天到账仅在适用法律允许、完成合规审查并另行书面确认后方可采用，此前不构成可提供USDT结算的承诺。','Bank transfer is the agreed channel. USDT with an estimated arrival of about 3 days may be used only if legally permitted, following compliance review and separate written agreement; until then no USDT settlement is promised.','Le virement bancaire est le moyen convenu. L’USDT, avec délai indicatif de 3 jours, exige autorisation légale, contrôle de conformité et accord écrit séparé ; il n’est pas promis avant cela.','La transferencia bancaria es el medio acordado. USDT, con plazo estimado de 3 días, exige legalidad, revisión de cumplimiento y acuerdo escrito separado; no se promete antes de ello.'],
    effect:['双方签署后生效，适用于原授权有效期内确认的订单；已产生的佣金义务不因授权到期而消灭。变更须书面确认，争议先友好协商，适用法律及争议解决机构由双方另行书面约定。','Effective upon signature by both parties for orders confirmed during the original authorization term. Accrued commission obligations survive expiry. Changes require written agreement. Disputes are first addressed amicably; governing law and forum are separately agreed in writing.','L’accord prend effet à la signature des parties pour les commandes confirmées durant l’autorisation. Les commissions acquises survivent à son expiration. Modifications par écrit ; règlement amiable d’abord, droit et juridiction convenus séparément par écrit.','Vigente al firmar ambas partes para pedidos confirmados durante la autorización. Las comisiones devengadas subsisten al vencimiento. Cambios por escrito; negociación amistosa y ley y foro acordados por escrito.']
  };
  function text(v, mode='bilingual') {
    const [zh,en,fr=en,es=en]=v;
    return ({zh,en,fr,es,'zh-fr':`${fr} / ${zh}`,'zh-es':`${es} / ${zh}`,bilingual:`${en} / ${zh}`})[mode] || `${en} / ${zh}`;
  }
  function type(a) { return Object.hasOwn(types,a.documentType) ? a.documentType : 'authorization'; }
  function number(kind,date,records=[]) {
    const prefix=({authorization:'AUTH',agreement:'COM',statement:'OCS'})[kind]||'AUTH';
    const base=`${prefix}-${date.replaceAll('-','')}-`;
    let n=1;while(records.some(a=>a.authorizationNumber===base+String(n).padStart(3,'0')))n++;
    return base+String(n).padStart(3,'0');
  }
  function calculate(a) {
    if(a.contractAmount===''||a.contractAmount==null)return null;
    const amount=Number(a.contractAmount),rate=Number(a.orderRate??5),markup=Number(a.markupAmount||0);
    if(!Number.isFinite(amount)||amount<=0||!Number.isFinite(rate)||rate<5||rate>100||!Number.isFinite(markup)||markup<0)return null;
    if(a.commissionBasis==='markup'&&(a.markupAmount===''||a.markupAmount==null))return null;
    const cents=Math.round(amount*100),percent=Math.round(cents*rate/100);
    return Math.max(percent,a.commissionBasis==='markup'?Math.round(markup*100):0)/100;
  }
  function validate(a,final=false) {
    if(!a.agentName?.trim()||!a.country?.trim())return '请填写代理人姓名和国家。';
    if(!a.authorizationNumber?.trim())return '请填写文件编号。';
    if(type(a)==='statement') {
      if(a.contractAmount!==''&&a.contractAmount!=null&&calculate(a)===null)return '合同金额应大于0，佣金比例须为5%至100%；加价方式请填写非负加价金额。';
      if(final&&!a.isTemplate&&(!a.customerName?.trim()||!a.salesContractNumber?.trim()||!a.relatedAgreement?.trim()||!a.currency?.trim()||calculate(a)===null||!a.bankDetails?.trim()))return '请补齐客户、销售合同编号、关联佣金协议、币种、金额、佣金及收款银行信息后导出。';
    }
    return '';
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(a,settings) {
    const mode=a.language||'bilingual',t=v=>esc(text(v,mode)),kind=type(a),s=a.companySnapshot||settings;
    const row=(label,value)=>`<p><b>${t(label)}</b><span>${esc(value||'________________')}</span></p>`;
    const item=k=>`<p class="agency-clause">${t(clauses[k])}</p>`;
    const amount=calculate(a),money=n=>n==null?'________________':`${a.currency||'USD'} ${Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
    const stamp=s.stampDataUrl||'';
    const bankLabel=['乙方银行收款信息','Agent bank details','Coordonnées bancaires de l’agent','Datos bancarios del agente'];
    return `<section class="agency-sheet agency-commercial"><header class="agency-letterhead"><div><b>${esc(a.company||s.companyNameEn||'')}</b><span>${esc(s.companyAddressEn||s.companyAddressZh||'')}</span></div></header>
      <h1>${t(titles[kind])}</h1><div class="agency-meta">${t(['编号','No.','N°','N.º'])}: ${esc(a.authorizationNumber)} · ${esc(a.date)} ${a.isTemplate?' · '+t(['模板','Template','Modèle','Plantilla']):''}</div>
      <section class="agency-info-grid">${row(['代理人','Agent','Agent','Agente'],a.agentName)}${row(['国家','Country','Pays','País'],a.country)}${row(['证件号码','ID / Passport','Pièce d’identité','Documento'],a.idNumber)}${row(['联系电话','Telephone','Téléphone','Teléfono'],a.phone)}${row(['电子邮箱','Email','E-mail','Correo'],a.email)}${row(['地址','Address','Adresse','Dirección'],a.address)}${row(['关联授权','Related authorization','Autorisation liée','Autorización relacionada'],a.relatedAuthorization)}</section>
      ${kind==='agreement'?['scope','minimum','markup','enhanced','protection','trigger','statement','bank','usdt','effect'].map(item).join(''):
      `<section class="agency-info-grid">${row(['客户姓名或公司','Customer / company','Client / société','Cliente / empresa'],a.customerName)}${row(['销售合同编号','Sales contract number','N° du contrat de vente','N.º del contrato de venta'],a.salesContractNumber)}${row(['关联佣金协议','Commission agreement','Accord de commission','Acuerdo de comisión'],a.relatedAgreement)}${row(['合同金额','Contract amount','Montant du contrat','Importe contractual'],a.contractAmount?money(a.contractAmount):'')}${row(['佣金比例','Commission rate','Taux de commission','Tasa de comisión'],`${a.orderRate??5}%`)}${row(['约定加价收益','Agreed markup','Marge convenue','Margen acordado'],a.commissionBasis==='markup'&&a.markupAmount!==''?money(a.markupAmount):'—')}${row(['应付佣金','Commission payable','Commission due','Comisión a pagar'],amount===null?'':money(amount))}${row(bankLabel,a.bankDetails)}</section>${item('minimum')}${item('enhanced')}${item('trigger')}${item('bank')}`}
      ${a.documentNotes?`<p class="agency-clause">${esc(a.documentNotes)}</p>`:''}
      <footer class="agency-signature"><div class="agency-signer-side"><p>${t(['甲方签署','For Party A','Pour la partie A','Por la parte A'])}: <b>${esc(a.authorizer||'Ethan')}</b></p><p>${esc(a.authorizerTitle||'')}</p><p>____________________</p>${stamp?`<img class="agency-commercial-stamp" src="${esc(stamp)}" alt="Company stamp">`:''}<p>${esc(a.date)}</p></div><div><p>${t(['乙方签署','Party B','Partie B','Parte B'])}: ${esc(a.agentName)}</p><p>${t(['签名','Signature','Signature','Firma'])}: ____________________</p><p>${t(['日期','Date','Date','Fecha'])}: ____________________</p></div></footer></section>`;
  }
  return {types,titles,clauses,text,type,number,calculate,validate,render};
});
