/* Customer management is independent of the document editor. Stable field keys
 * bind settings, input and details; names and ordering never identify data. */
const CW=CustomerWorkspace;
const crmEmbedded=new URLSearchParams(location.search).get('embedded')==='1'&&parent!==window;
if(crmEmbedded){
  document.body.classList.add('crm-embedded');
  let lastActivity=0;
  ['pointerdown','keydown','wheel'].forEach(type=>document.addEventListener(type,()=>{if(Date.now()-lastActivity>1000){lastActivity=Date.now();parent.postMessage({type:'fta-crm-activity'},location.origin);}},{passive:true}));
  window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='fta-crm-refresh')load().catch(e=>toast(e.message,true));});
}
let crmGroup='',crmState='',crmOverview='all';
const crmOverviewMatch=(c,key)=>{
  if(key==='today')return due(c.next_follow_up)==='today';
  if(key==='overdue')return due(c.next_follow_up)==='overdue';
  if(key==='week'){
    const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7));
    const at=new Date(c.last_follow_up_at||'');return Number.isFinite(+at)&&at>=start&&at<=new Date();
  }
  return true;
};
const crmOptions=(values,value)=>[...new Set([value,...values].filter(Boolean))].map(v=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(v)}</option>`).join('');
const crmVisible=key=>CW.fields(customerConfig).some(f=>f.fieldKey===key);
const crmLabel=c=>(crmVisible('company')&&c.company)||(crmVisible('name')&&c.name)||'客户 #'+c.id;
const crmOldLoad=load;
load=async function(){await crmOldLoad();customerConfig=CW.normalize(customerConfig);contactTypes=customerConfig.followup.contactTypes;render();};
render=function(){
  customerConfig=CW.normalize(customerConfig);
  contactTypes=customerConfig.followup.contactTypes;
  const rows=customers.filter(c=>crmOverviewMatch(c,crmOverview)&&(!query||[c.company,c.name,c.country,c.phone,...Object.values(c.custom_fields||{})].join(' ').toLowerCase().includes(query.toLowerCase()))&&(!crmGroup||c.group_name===crmGroup)&&(!crmState||c.stage===crmState));
  app.innerHTML=`<main class="crm-shell"><aside class="crm-nav"><strong>外贸助手</strong><button class="active" type="button">客户管理</button><button type="button" id="crm-settings">客户管理设置</button><button type="button" id="crm-home">返回首页</button></aside><section class="crm-main"><header class="crm-header"><h1>客户管理</h1><p>客户资料与跟进保持独立，不自动创建或关联单证。</p></header><div class="crm-body"><div id="notice" role="status"></div><div class="crm-stats"><article><span>客户总数</span><strong>${customers.length}</strong></article><article><span>今日及逾期跟进</span><strong>${customers.filter(c=>['today','overdue'].includes(due(c.next_follow_up))).length}</strong></article><article><span>S / A 级客户</span><strong>${customers.filter(c=>['S','A'].includes(c.grade)).length}</strong></article></div><div class="crm-toolbar"><div><input id="crm-search" aria-label="搜索客户" placeholder="搜索公司、联系人、国家" value="${esc(query)}"><select id="crm-group" aria-label="客户分组"><option value="">全部分组</option>${crmOptions([...customerConfig.groups,...customers.map(c=>c.group_name)],crmGroup)}</select><select id="crm-state" aria-label="客户状态"><option value="">全部状态</option>${crmOptions([...customerConfig.statuses,...customers.map(c=>c.stage)],crmState)}</select></div><button type="button" class="primary" id="crm-new">＋ 新增客户</button></div><div class="crm-split"><section class="crm-panel"><div class="crm-panel-head"><h2>客户列表</h2><small>${rows.length} 位客户</small></div><div class="crm-table-wrap"><table><thead><tr><th>客户 / 联系人</th><th>${esc(customerFieldTitle('country','国家'))}</th><th>状态</th><th>下次跟进</th></tr></thead><tbody>${rows.map(c=>`<tr class="${selected?.id===c.id?'selected':''}"><td><button type="button" class="crm-customer-name" data-crm-select="${c.id}">${esc(crmLabel(c))}</button><small>${esc(c.name)}</small></td><td>${esc(c.country||'—')}</td><td><span class="crm-badge">${esc(c.stage)}</span></td><td>${esc(c.next_follow_up||'未安排')}</td></tr>`).join('')||'<tr><td colspan="4">暂无符合条件的客户</td></tr>'}</tbody></table></div></section><section class="crm-panel crm-detail">${selected?crmDetail(selected):'<div class="crm-empty">选择左侧客户，查看资料及跟进记录。</div>'}</section></div></div></section></main>`;
  document.getElementById('crm-new').onclick=()=>crmEdit();
  // A hidden country field must not survive as a hard-coded list column.
  if(!crmVisible('country'))document.querySelectorAll('.crm-table-wrap tr').forEach(row=>row.children[1]?.remove());
  if(!crmVisible('name'))document.querySelectorAll('.crm-table-wrap td:first-child small').forEach(el=>el.remove());
  document.getElementById('crm-home').onclick=()=>location.assign(mainAppUrl());
  // There is one configuration owner: main Settings > Customer management.
  document.getElementById('crm-settings').remove();
  document.querySelector('.crm-header p')?.remove();
  const overview=[['all','全部客户'],['today','今日待跟进'],['overdue','逾期待跟进'],['week','本周已跟进']];
  document.querySelector('.crm-stats').innerHTML=overview.map(([key,label])=>`<button type="button" class="crm-stat ${crmOverview===key?'active':''}" data-crm-overview="${key}" aria-pressed="${crmOverview===key}"><span>${label}</span><strong>${customers.filter(c=>crmOverviewMatch(c,key)).length}</strong></button>`).join('');
  document.querySelectorAll('[data-crm-overview]').forEach(b=>b.onclick=()=>{crmOverview=b.dataset.crmOverview;render();});
  document.querySelector('.crm-nav button.active').onclick=render;
  document.getElementById('crm-search').oninput=e=>{const pos=e.target.selectionStart;query=e.target.value;render();const input=document.getElementById('crm-search');input.focus();input.setSelectionRange(pos,pos);};
  document.getElementById('crm-group').onchange=e=>{crmGroup=e.target.value;render();};document.getElementById('crm-state').onchange=e=>{crmState=e.target.value;render();};
  document.querySelectorAll('[data-crm-select]').forEach(b=>b.onclick=()=>choose(+b.dataset.crmSelect).catch(e=>toast(e.message,true)));
  document.getElementById('crm-edit')?.addEventListener('click',()=>crmEdit(selected));
  document.getElementById('crm-follow')?.addEventListener('click',()=>{followModal();const form=document.querySelector('.follow-modal');form.querySelector('[name=stage]').innerHTML=crmOptions(customerConfig.statuses,selected.stage);form.querySelector('[name=content]').required=true;form.querySelector('[name=next_follow_up]').required=customerConfig.followup.requireNextDate;});
};
function crmDetail(c){return `<div class="crm-detail-body"><div class="crm-avatar">${esc(crmLabel(c)[0])}</div><h2>${esc(crmLabel(c))}</h2><p>${esc(c.name)}</p><dl><dt>客户分组</dt><dd>${esc(c.group_name||'未分组')}</dd><dt>状态 / 等级</dt><dd>${esc(c.stage)} / ${esc(c.grade)}</dd><dt>客户标签</dt><dd>${(c.labels||[]).map(t=>`<span class="crm-badge">${esc(t)}</span>`).join(' ')||'—'}</dd>${CW.fields(customerConfig).map(f=>`<dt>${esc(f.zh)}</dt><dd>${esc(CW.value(c,f)??'—')}</dd>`).join('')}<dt>来华计划</dt><dd>${esc(arrival(c))}</dd><dt>设备需求</dt><dd>${esc((c.equipment_tags||[]).join('、')||'—')}</dd></dl><div class="crm-toolbar"><button type="button" id="crm-edit">编辑资料</button><button type="button" class="primary" id="crm-follow">记录跟进</button></div><h3>跟进记录</h3>${(c.follow_ups||[]).map(f=>`<article class="crm-record"><small>${esc(fmt(f.created_at))} · ${esc(f.contact_type)}</small><p>${esc(f.content||f.outcome)}</p><small>下次跟进：${esc(f.next_follow_up||'未安排')}</small></article>`).join('')||'<p>暂无跟进记录</p>'}</div>`;}
function crmEdit(customer){const c=customer||{},config=customerConfig;
  const d=modal(`<form class="modal"><div class="modal-head"><h2>${customer?'编辑客户资料':'新增客户'}</h2><button class="close" type="button">×</button></div><div class="form-grid">${CW.fields(config).map(f=>`<label>${esc(f.zh)}${f.required?' *':''}${CW.input(f,CW.value(c,f))}</label>`).join('')}<label>客户分组<select name="group_name"><option value="">未分组</option>${crmOptions(config.groups,c.group_name)}</select></label><label>客户状态<select name="stage">${crmOptions(config.statuses,c.stage)}</select></label><label>客户等级<select name="grade">${crmOptions(GRADES,c.grade||'B')}</select></label><label>买家身份<select name="buyer_type">${crmOptions(BUYERS,c.buyer_type||'公司买家')}</select></label></div><fieldset><legend>客户标签</legend>${[...new Set([...(c.labels||[]),...config.labels])].map(t=>`<label class="crm-check"><input type="checkbox" data-crm-tag="${esc(t)}" ${(c.labels||[]).includes(t)?'checked':''}>${esc(t)}</label>`).join('')}</fieldset><p class="form-error" hidden></p><div class="modal-actions"><button type="button" class="close">取消</button><button class="primary">保存客户</button></div></form>`);
  d.querySelector('form').onsubmit=async e=>{e.preventDefault();const button=e.submitter||e.target.querySelector('.primary');button.disabled=true;const body={...Object.fromEntries(new FormData(e.target)),custom_fields:{...(c.custom_fields||{})},labels:[...d.querySelectorAll('[data-crm-tag]:checked')].map(el=>el.dataset.crmTag)};
    d.querySelectorAll('[data-customer-key]').forEach(el=>{const key=el.dataset.customerKey,v=el.type==='checkbox'?el.checked:el.value;if(Object.hasOwn(CW.builtins,key))body[key]=v;else body.custom_fields[key]=v;});
    if(!customer&&!body.name)body.name=body.company||'未命名客户';
    try{const result=await api('/api/customers'+(customer?'/'+c.id:''),{method:customer?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});d.remove();selected={id:customer?c.id:result.id};await load();toast('客户资料已保存');}catch(error){const p=d.querySelector('.form-error');p.hidden=false;p.textContent=error.message;button.disabled=false;}
  };
}
addModal=()=>crmEdit();
load().catch(e=>{app.innerHTML=`<div class="empty">系统启动失败：${esc(e.message)}</div>`;});
