const app = document.getElementById("app");
const STAGES=["需求确认中","待报价","报价评估中","计划来华","采购确认中","已采购","长期培育","沉默客户","无效客户"];
const GRADES=["S","A","B","C"];
const BUYERS=["个人买家","公司买家","在华中介","海外中介","暂未确认"];
const PROJECTS=["建筑项目","路桥项目","采矿项目","环卫项目","特殊需求"];
const EQUIPMENT=["挖掘机","装载机","推土机","压路机","平地机","起重机","叉车","伸缩臂叉装车","滑移装载机","环卫设备"];
let customers=[],selected=null,filter="全部客户",query="",mobileView="home",dashboard={completed:0,pending:0,total:0,progress:100};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const due=d=>!d?"none":d<today()?"overdue":d===today()?"today":"future";
const fmt=v=>v?new Date(v.length===10?v+"T00:00:00":v).toLocaleString("zh-CN",{month:"numeric",day:"numeric",hour:v.length>10?"2-digit":undefined,minute:v.length>10?"2-digit":undefined}):"暂无";
const tags=a=>(a||[]).map(x=>`<span>${esc(x)}</span>`).join("")||"<small>待补充</small>";
function arrival(c){if(!c.arrival_value||c.arrival_precision==="none")return"暂无来华计划";let[y,m,d]=c.arrival_value.split("-"),x={month:"",month_start:"月初",month_mid:"月中",month_end:"月底",date:d?`${+d}日`:""};return`${y}年${+m}月${x[c.arrival_precision]||""}`}
function qdate(n){let d=new Date();if(n==="monday")d.setDate(d.getDate()+(((8-d.getDay())%7)||7));else d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
async function api(url,opt){let r=await fetch(url,opt),j=await r.json();if(!r.ok)throw Error(j.error||"操作失败");return j}
async function load(){[customers,dashboard]=await Promise.all([api("/api/customers"),api("/api/dashboard")]);if(selected){let hit=customers.find(x=>x.id===selected.id);if(hit)selected=await api(`/api/customers/${selected.id}`)}render()}
async function choose(id){selected=await api(`/api/customers/${id}`);render()}
function visible(c){let text=[c.name,c.phone,c.country,c.buyer_type,c.stage,...c.project_tags,...c.equipment_tags].join(" ").toLowerCase();if(!text.includes(query.toLowerCase()))return false;if(filter==="逾期未跟进")return due(c.next_follow_up)==="overdue";if(filter==="今日待跟进")return due(c.next_follow_up)==="today";if(filter==="重点客户")return["S","A"].includes(c.grade);if(["计划来华","待报价","报价评估中","长期培育","沉默客户"].includes(filter))return c.stage===filter;return true}
function suggest(c){return c.stage==="计划来华"?"确认来华日期、需要查看的设备和行程安排。":c.stage==="报价评估中"?"询问客户或终端买家对报价的反馈和当前顾虑。":c.stage==="待报价"?"尽快准备车辆资料与正式报价，避免客户等待。":c.stage==="长期培育"?"保持低频联系，确认项目时间是否变化。":c.stage==="沉默客户"?"低频尝试唤醒；仍无回复时延长跟进间隔。":"继续确认设备、数量、预算和采购时间。"}
function render(){
 let counts={overdue:customers.filter(c=>due(c.next_follow_up)==="overdue").length,today:customers.filter(c=>due(c.next_follow_up)==="today").length,focus:customers.filter(c=>["S","A"].includes(c.grade)).length,missing:customers.filter(c=>!c.next_follow_up&&!["无效客户","已采购"].includes(c.stage)).length};
 let list=customers.filter(visible);
 app.innerHTML=`<main class="app-shell">
 <aside class="sidebar"><div class="brand"><span class="brand-mark">贸</span><div><strong>外贸助手</strong><small>报价系统 · 客户跟进</small></div></div><nav>
 ${["全部客户","逾期未跟进","今日待跟进","重点客户","计划来华","待报价","报价评估中","长期培育","沉默客户"].map(x=>`<button data-filter="${x}" class="${filter===x?"active":""}"><span>${x}</span>${x==="逾期未跟进"&&counts.overdue?`<b>${counts.overdue}</b>`:""}</button>`).join("")}
 </nav><div class="sidebar-bottom"><button id="quote-home">返回报价系统</button><button id="backup">备份数据</button><small>外贸助手共用同一份数据</small></div></aside>
 <section class="workspace"><header class="topbar"><div><h1>今天先跟谁</h1><p>${new Date().toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"long"})}</p></div><div class="top-actions"><label class="search"><span>⌕</span><input id="search" value="${esc(query)}" placeholder="搜索客户、国家、设备"></label><button class="primary add">＋ 新增客户</button></div></header>
 <div id="notice"></div><div class="summary-grid">
 <button data-filter="逾期未跟进" class="summary danger"><span>逾期未跟进</span><strong>${counts.overdue}</strong><small>需要优先处理</small></button>
 <button data-filter="今日待跟进" class="summary blue"><span>今日待跟进</span><strong>${counts.today}</strong><small>按计划完成</small></button>
 <button data-filter="重点客户" class="summary amber"><span>S/A级客户</span><strong>${counts.focus}</strong><small>高价值客户</small></button>
 <button class="summary neutral"><span>漏设下次跟进</span><strong>${counts.missing}</strong><small>建议补充计划</small></button></div>
 <div class="content-grid"><section class="customer-panel"><div class="panel-head"><div><h2>${filter}</h2><span>共 ${list.length} 位</span></div><button class="mobile-add add">＋</button></div><div class="customer-list">
 ${list.map(c=>`<button class="customer-row ${selected?.id===c.id?"selected":""}" data-id="${c.id}"><span class="avatar grade-${c.grade.toLowerCase()}">${esc(c.name[0])}</span><span class="customer-main"><span class="name-line"><strong>${esc(c.name)}</strong><i class="grade grade-${c.grade.toLowerCase()}">${c.grade}</i><em>${esc(c.buyer_type)}</em></span><small>${esc(c.country||"国家未填")} · ${esc(c.stage)}</small><small class="need">${esc(c.equipment_tags.join("、")||"设备需求待确认")}</small></span><span class="due ${due(c.next_follow_up)}">${due(c.next_follow_up)==="overdue"?"已逾期":due(c.next_follow_up)==="today"?"今天":c.next_follow_up?fmt(c.next_follow_up):"未设置"}<small>${esc(c.next_follow_purpose||"下次跟进")}</small></span></button>`).join("")||'<div class="empty">暂时没有符合条件的客户</div>'}
 </div></section>${selected?detail(selected):""}</div>${mobilePages(counts)}</section>
 <nav class="mobile-nav"><button data-view="home" class="${mobileView==="home"?"active":""}"><b>⌂</b>首页</button><button data-view="customers" class="${mobileView==="customers"?"active":""}"><b>人</b>客户</button><button data-view="reminders" class="${mobileView==="reminders"?"active":""}"><b>!</b>提醒${counts.overdue?`<i>${counts.overdue}</i>`:""}</button><button data-view="mine" class="${mobileView==="mine"?"active":""}"><b>我</b>我的</button></nav></main>`;
 bind();
}
function mobileRow(c,reason=""){
 return `<button class="customer-row mobile-customer-row" data-id="${c.id}"><span class="avatar grade-${c.grade.toLowerCase()}">${esc(c.name[0])}</span><span class="customer-main"><span class="name-line"><strong>${esc(c.name)}</strong><i class="grade grade-${c.grade.toLowerCase()}">${c.grade}</i><em>${esc(c.stage)}</em></span><small>${esc(c.buyer_type)} · ${esc(c.country||"国家未填")}</small><small class="need">${esc(reason||c.next_follow_purpose||c.equipment_tags.join("、")||"需求待确认")}</small></span><span class="due ${due(c.next_follow_up)}">${due(c.next_follow_up)==="overdue"?"已逾期":due(c.next_follow_up)==="today"?"今天":c.next_follow_up?fmt(c.next_follow_up):"未设置"}</span></button>`;
}
function reminderGroup(title,items,tone,reason){
 return `<section class="reminder-group ${tone}"><div class="mobile-section-title"><h3>${title}</h3><span>${items.length}</span></div>${items.length?items.map(c=>mobileRow(c,reason?reason(c):"")).join(""):'<div class="mobile-empty">目前没有需要处理的客户</div>'}</section>`;
}
function mobilePages(counts){
 const overdue=customers.filter(c=>due(c.next_follow_up)==="overdue");
 const todayList=customers.filter(c=>due(c.next_follow_up)==="today");
 const missing=customers.filter(c=>!c.next_follow_up&&!["无效客户","已采购"].includes(c.stage));
 const focus=customers.filter(c=>["S","A"].includes(c.grade)&&!overdue.includes(c)&&!todayList.includes(c));
 const urgent=[...overdue,...todayList,...focus].filter((c,i,a)=>a.findIndex(x=>x.id===c.id)===i).slice(0,5);
 const all=customers.filter(visible);
 return `<div class="mobile-pages">
  <section class="mobile-page ${mobileView==="home"?"active":""}" data-page="home">
   <div class="mobile-page-head"><div><small>外贸助手 · 客户跟进</small><h1>今天先跟谁</h1><p>${new Date().toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"long"})}</p></div><button class="round-add add">＋</button></div>
   <section class="progress-card"><div class="progress-copy"><span>今日跟进完成度</span><strong>${dashboard.progress}%</strong><small>已完成 ${dashboard.completed} 位 · 待处理 ${dashboard.pending} 位</small></div><div class="progress-ring" style="--progress:${dashboard.progress*3.6}deg"><b>${dashboard.progress}%</b></div><div class="progress-track"><i style="width:${dashboard.progress}%"></i></div></section>
   <div class="mobile-stat-grid"><button data-view="reminders" data-reminder-filter="overdue" class="mobile-stat danger"><strong>${counts.overdue}</strong><span>逾期未跟进</span></button><button data-view="reminders" data-reminder-filter="today" class="mobile-stat blue"><strong>${counts.today}</strong><span>今日待跟进</span></button><button data-view="reminders" data-reminder-filter="focus" class="mobile-stat amber"><strong>${counts.focus}</strong><span>重点客户</span></button><button data-view="reminders" data-reminder-filter="missing" class="mobile-stat neutral"><strong>${counts.missing}</strong><span>漏填跟进</span></button></div>
   <div class="mobile-section-title"><h3>优先处理</h3><button data-view="reminders">查看全部 →</button></div><div class="mobile-list">${urgent.length?urgent.map(c=>mobileRow(c)).join(""):'<div class="mobile-empty">今天没有待处理事项</div>'}</div>
  </section>
  <section class="mobile-page ${mobileView==="customers"?"active":""}" data-page="customers">
   <div class="mobile-page-head compact"><div><small>客户中心</small><h1>全部客户</h1><p>按等级、阶段和标签管理</p></div><button class="round-add add">＋</button></div>
   <label class="mobile-search"><span>⌕</span><input id="mobile-search" value="${esc(query)}" placeholder="搜索客户、国家、设备"></label>
   <div class="mobile-filter-row">${["全部客户","重点客户","计划来华","待报价","长期培育"].map(x=>`<button data-filter="${x}" class="${filter===x?"active":""}">${x}</button>`).join("")}</div>
   <div class="mobile-list">${all.length?all.map(c=>mobileRow(c)).join(""):'<div class="mobile-empty">没有符合条件的客户</div>'}</div>
  </section>
  <section class="mobile-page ${mobileView==="reminders"?"active":""}" data-page="reminders">
   <div class="mobile-page-head compact"><div><small>提醒中心</small><h1>需要你处理</h1><p>按紧急程度和客户价值排列</p></div></div>
   ${reminderGroup("逾期未更新",overdue,"danger",c=>c.next_follow_purpose||"已超过约定跟进时间")}
   ${reminderGroup("今日待跟进",todayList,"blue",c=>c.next_follow_purpose||"今天需要联系")}
   ${reminderGroup("漏填下次跟进",missing,"neutral",()=>"跟进后尚未设置下一次日期")}
   ${reminderGroup("重点客户提醒",focus,"amber",c=>`${c.grade}级 · ${c.stage} · 建议持续关注`)}
  </section>
  <section class="mobile-page ${mobileView==="mine"?"active":""}" data-page="mine">
   <div class="mobile-page-head compact"><div><small>外贸助手 · 本机数据中心</small><h1>我的系统</h1><p>电脑与iPhone共用同一份数据</p></div></div>
   <section class="mine-card"><span class="mine-icon">数</span><div><strong>数据中心运行中</strong><small>当前共 ${customers.length} 位客户</small></div><i>正常</i></section>
   <section class="mine-actions"><button id="mobile-backup"><b>备</b><span>立即备份数据<small>保存到D盘客户系统备份</small></span><em>›</em></button><button data-view="customers"><b>客</b><span>客户资料<small>查看全部客户与跟进记录</small></span><em>›</em></button><button data-view="reminders"><b>醒</b><span>提醒中心<small>${counts.overdue+counts.today+counts.missing}项需要检查</small></span><em>›</em></button></section>
   <div class="mine-note">电脑需要保持开机，iPhone与电脑连接同一个Wi-Fi。后续更新系统后，重新打开手机桌面图标即可同步新版本。</div>
  </section>
 </div>`;
}
function detail(c){let wa=c.whatsapp_number||c.phone.replace(/\D/g,"");return`<aside class="detail-panel"><button class="detail-close">×</button><div class="detail-title"><span class="avatar big grade-${c.grade.toLowerCase()}">${esc(c.name[0])}</span><div><h2>${esc(c.name)}<i class="grade grade-${c.grade.toLowerCase()}">${c.grade}级</i></h2><p>${esc(c.buyer_type)} · ${esc(c.country||"国家未填")}</p></div></div>
<div class="stage-strip">${STAGES.slice(0,6).map((s,i)=>`<span class="${c.stage===s?"current":""}"><b>${i+1}</b>${s}</span>`).join("")}</div><div class="detail-actions"><button class="primary follow">填写跟进</button><a href="/?crmCustomer=${c.id}">为客户新建报价</a>${wa?`<a href="https://wa.me/${wa}" target="_blank">打开 WhatsApp</a>`:""}</div>
<section class="info-block arrival"><label>计划来华</label><strong>${arrival(c)}</strong><small>${c.next_follow_up?`下次跟进：${fmt(c.next_follow_up)} · ${esc(c.next_follow_purpose)}`:"尚未设置下次跟进"}</small></section>
<div class="tag-sections"><section><label>应用项目</label><div>${tags(c.project_tags)}</div></section><section><label>设备需求</label><div>${tags(c.equipment_tags)}</div></section></div>
<section class="info-block"><label>当前需求</label><p>${esc(c.requirement||"尚未填写详细需求")}</p></section><section class="advice"><label>系统跟进建议</label><strong>${suggest(c)}</strong><small>建议依据：当前阶段、客户等级和计划时间</small></section>
<section class="timeline"><div class="timeline-head"><h3>跟进记录</h3><span>${c.follow_ups?.length||0} 条</span></div>${c.follow_ups?.length?c.follow_ups.map(f=>`<article><time>${fmt(f.created_at)} · ${esc(f.contact_type)}</time><p>${esc(f.content)}</p>${f.old_stage!==f.new_stage||f.old_grade!==f.new_grade?`<small>阶段：${esc(f.old_stage)} → ${esc(f.new_stage)}　等级：${f.old_grade} → ${f.new_grade}</small>`:""}${f.next_follow_up?`<small>下次：${fmt(f.next_follow_up)} · ${esc(f.next_follow_purpose)}</small>`:""}</article>`).join(""):'<div class="empty mini">还没有跟进记录</div>'}</section></aside>`}
function bind(){
 let quoteHome=document.getElementById("quote-home");if(quoteHome)quoteHome.onclick=()=>location.href="/";
 document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{filter=b.dataset.filter;if(b.closest(".mobile-pages")||b.closest(".mobile-nav"))mobileView="customers";render()});
 document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{mobileView=b.dataset.view;render()});
 document.querySelectorAll(".add").forEach(b=>b.onclick=addModal);
 document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>choose(+b.dataset.id));
 let s=document.getElementById("search");if(s)s.oninput=e=>{query=e.target.value;render()};
 let ms=document.getElementById("mobile-search");if(ms)ms.oninput=e=>{query=e.target.value;render()};
 let x=document.querySelector(".detail-close");if(x)x.onclick=()=>{selected=null;render()};
 let f=document.querySelector(".follow");if(f)f.onclick=followModal;
 for(let id of["backup","mobile-backup"]){let b=document.getElementById(id);if(b)b.onclick=backup}
}
function modal(html){let d=document.createElement("div");d.className="modal-backdrop";d.innerHTML=html;document.body.appendChild(d);d.querySelectorAll(".close").forEach(x=>x.onclick=()=>d.remove());return d}
function chips(values,name){return`<div class="chips">${values.map(v=>`<button type="button" data-chip="${name}" data-value="${v}">${v}</button>`).join("")}</div>`}
function addModal(){
 let d=modal(`<form class="modal"><div class="modal-head"><div><h2>新增客户</h2><p>需求不清楚的内容可以稍后补充</p></div><button type="button" class="close">×</button></div><div class="form-grid">
 <label>客户名称<input required name="name" placeholder="例如 Ahmed"></label><label>WhatsApp号码<input name="phone" placeholder="+20..."></label><label>国家/地区<input name="country" placeholder="例如 埃及"></label>
 <label>买家身份<select name="buyer_type">${BUYERS.map(x=>`<option>${x}</option>`)}</select></label><label>客户等级<select name="grade">${GRADES.map(x=>`<option ${x==="B"?"selected":""}>${x}</option>`)}</select></label><label>当前阶段<select name="stage">${STAGES.map(x=>`<option>${x}</option>`)}</select></label></div>
 <fieldset><legend>应用项目（可多选）</legend>${chips(PROJECTS,"project_tags")}</fieldset><fieldset><legend>设备需求（可多选）</legend>${chips(EQUIPMENT,"equipment_tags")}</fieldset>
 <label class="wide">需求说明<textarea name="requirement" placeholder="数量、规格、预算、最终买家等"></textarea></label><div class="form-grid"><label>来华时间精度<select name="arrival_precision"><option value="none">暂无计划</option><option value="month">只有月份</option><option value="month_start">月初</option><option value="month_mid">月中</option><option value="month_end">月底</option><option value="date">具体日期</option></select></label><label>来华月份<input type="month" name="arrival_value"></label></div><p class="form-error" hidden></p><div class="modal-actions"><button type="button" class="close">取消</button><button class="primary">创建客户</button></div></form>`);
 let chosen={project_tags:[],equipment_tags:[]};d.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>{let k=b.dataset.chip,v=b.dataset.value;b.classList.toggle("selected");chosen[k]=b.classList.contains("selected")?[...chosen[k],v]:chosen[k].filter(x=>x!==v)});
 d.querySelector("form").onsubmit=async e=>{e.preventDefault();let o=Object.fromEntries(new FormData(e.target));Object.assign(o,chosen);try{await api("/api/customers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});d.remove();await load();toast("客户已创建")}catch(err){let p=d.querySelector(".form-error");p.hidden=false;p.textContent=err.message}};
}
function followModal(){
 let c=selected,d=modal(`<form class="modal follow-modal"><div class="modal-head"><div><h2>完成本次跟进</h2><p>${esc(c.name)} · 保存时自动生成更新时间</p></div><button type="button" class="close">×</button></div><div class="form-grid">
 <label>沟通方式<select name="contact_type"><option>WhatsApp</option><option>电话</option><option>见面</option><option>邮件</option><option>其他</option></select></label><label>未联系成功原因<select name="outcome"><option value="">已正常沟通</option><option>未回复</option><option>未接通</option><option>客户忙，稍后联系</option><option>联系方式有误</option></select></label></div>
 <label class="wide">本次跟进内容<textarea class="large" name="content" placeholder="记录客户最新反馈、需求变化、计划时间等"></textarea></label><div class="change-box"><h3>本次更新结果</h3><div class="form-grid">
 <label>客户阶段 <small>原：${c.stage}</small><select name="stage">${STAGES.map(x=>`<option ${x===c.stage?"selected":""}>${x}</option>`)}</select></label><label>客户等级 <small>原：${c.grade}级</small><select name="grade">${GRADES.map(x=>`<option ${x===c.grade?"selected":""}>${x}</option>`)}</select></label>
 <label>来华时间<select name="arrival_precision"><option value="none">暂无计划</option><option value="month">只有月份</option><option value="month_start">月初</option><option value="month_mid">月中</option><option value="month_end">月底</option><option value="date">具体日期</option></select></label><label>月份/日期<input type="month" name="arrival_value" value="${esc(c.arrival_value)}"></label></div></div>
 <div class="next-box"><h3>下次跟进</h3><div class="quick-dates">${[["明天",1],["3天后",3],["5天后",5],["7天后",7],["下周一","monday"]].map(x=>`<button type="button" data-days="${x[1]}">${x[0]}</button>`).join("")}</div><div class="form-grid"><label>自定义日期<input type="date" name="next_follow_up"></label><label>跟进目的<input name="next_follow_purpose" placeholder="例如：确认来华行程"></label></div></div><p class="form-error" hidden></p><div class="modal-actions"><button type="button" class="close">取消</button><button class="primary">保存并完成跟进</button></div></form>`);
 d.querySelector('[name="arrival_precision"]').value=c.arrival_precision;d.querySelectorAll("[data-days]").forEach(b=>b.onclick=()=>d.querySelector('[name="next_follow_up"]').value=qdate(b.dataset.days==="monday"?"monday":+b.dataset.days));
 d.querySelector("form").onsubmit=async e=>{e.preventDefault();let o=Object.fromEntries(new FormData(e.target));try{await api(`/api/customers/${c.id}/followups`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)});d.remove();selected=await api(`/api/customers/${c.id}`);await load();toast("跟进已完成，更新时间已自动记录")}catch(err){let p=d.querySelector(".form-error");p.hidden=false;p.textContent=err.message}};
}
async function backup(){try{let r=await api("/api/backup",{method:"POST"});toast("备份已保存："+r.path)}catch(e){toast(e.message,true)}}
function toast(text,bad=false){let n=document.getElementById("notice");if(!n)return;n.className=bad?"notice bad":"notice";n.textContent=text;setTimeout(()=>{if(n)n.textContent=""},5000)}
load().catch(e=>{app.innerHTML=`<div class="empty">系统启动失败：${esc(e.message)}</div>`});
