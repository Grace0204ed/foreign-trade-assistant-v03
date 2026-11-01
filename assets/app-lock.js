(() => {
  'use strict';
  const RETRY_KEY='fta-app-lock-retries-v1',LOCKED_KEY='fta-app-lock-locked-v1';
  let config={enabled:false,autoLockMinutes:15,pinHash:'',hint:''},timer=null,locked=false,ticker=null,busy=false;
  function retry(){try{const r=JSON.parse(localStorage.getItem(RETRY_KEY)||'{}');return {failures:Math.max(0,Number(r.failures)||0),stage:Math.max(0,Number(r.stage)||0),until:Math.max(0,Number(r.until)||0)};}catch{return {failures:0,stage:0,until:0};}}
  const saveRetry=r=>localStorage.setItem(RETRY_KEY,JSON.stringify(r));
  const hash=async value=>{const data=new TextEncoder().encode(String(value)),digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');};
  const reset=()=>{clearTimeout(timer);if(config.enabled&&!locked)timer=setTimeout(lock,Math.max(1,Number(config.autoLockMinutes)||15)*60000);};
  function lock(){
    if(!config.enabled||locked)return;
    locked=true;localStorage.setItem(LOCKED_KEY,'true');clearTimeout(timer);
    const overlay=document.createElement('div');overlay.id='application-lock-screen';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','app-lock-heading');
    const previousFocus=document.activeElement;
    const siblings=[...document.body.children].filter(n=>n instanceof HTMLElement&&!['SCRIPT','STYLE'].includes(n.tagName)).map(n=>[n,n.inert]);siblings.forEach(([n])=>n.inert=true);
    overlay.innerHTML=`<div class="lock-center-brand"><img src="/assets/app-icon.png" alt=""><strong>外贸助手</strong><small>FOREIGN TRADE ASSISTANT</small></div><div class="app-lock-card"><span class="lock-status">● 已锁定</span><h2 id="app-lock-heading">欢迎回来</h2><label class="lock-pin-label">应用锁 PIN<span class="password-with-eye"><input type="password" inputmode="numeric" maxlength="12" autocomplete="off" placeholder="请输入 PIN" aria-label="本机PIN"><button type="button" data-lock-eye aria-label="显示PIN" aria-pressed="false">◉</button></span></label><p class="app-lock-error" role="status" aria-live="polite"></p><button type="button" data-unlock>解锁并继续 →</button><div class="lock-safe-note">工作内容已隐藏</div><button type="button" class="app-lock-hint-button" data-hint>忘记PIN？查看提示</button><p data-pin-hint hidden></p></div>`;
    document.body.appendChild(overlay);
    const input=overlay.querySelector('input'),error=overlay.querySelector('.app-lock-error'),button=overlay.querySelector('[data-unlock]');
    const update=()=>{const r=retry(),seconds=Math.ceil((r.until-Date.now())/1000);input.disabled=button.disabled=seconds>0||busy;if(seconds>0)error.textContent=`输入错误次数较多，请等待 ${Math.floor(seconds/60)}分${seconds%60}秒后重试。`;else if(error.dataset.waiting){error.textContent='可以重新尝试。';delete error.dataset.waiting;}if(seconds>0)error.dataset.waiting='true';};
    const unlock=async()=>{
      if(busy||retry().until>Date.now())return;busy=true;update();
      try{
        if(await hash(input.value)!==config.pinHash){const r=retry();r.failures++;if(r.failures>=5){r.stage++;r.failures=0;r.until=Date.now()+[1,5,15][Math.min(r.stage-1,2)]*60000;}saveRetry(r);error.textContent=`PIN不正确，本轮还可尝试${5-r.failures}次。`;input.value='';update();return;}
        saveRetry({failures:0,stage:0,until:0});locked=false;localStorage.removeItem(LOCKED_KEY);clearInterval(ticker);overlay.remove();siblings.forEach(([n,value])=>{n.inert=value;});previousFocus?.focus();reset();
      }catch{error.textContent='未能验证PIN，请稍后重试。';}finally{busy=false;if(locked){update();input.focus();}}
    };
    overlay.querySelector('[data-lock-eye]').onclick=e=>{input.type=input.type==='password'?'text':'password';e.currentTarget.setAttribute('aria-pressed',String(input.type==='text'));e.currentTarget.setAttribute('aria-label',input.type==='text'?'隐藏PIN':'显示PIN');input.focus();};
    overlay.querySelector('[data-hint]').onclick=()=>{const hint=overlay.querySelector('[data-pin-hint]');hint.hidden=!hint.hidden;hint.textContent=config.hint||'尚未设置密码提示。';};
    button.onclick=unlock;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();unlock();}};
    overlay.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...overlay.querySelectorAll('input,button')].filter(n=>!n.disabled);if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus();}});
    ticker=setInterval(update,1000);update();setTimeout(()=>input.disabled?overlay.querySelector('[data-hint]').focus():input.focus());
  }
  function configure(next={}){config={...config,...next};reset();if(config.enabled&&(retry().until>Date.now()||localStorage.getItem(LOCKED_KEY)==='true')&&!locked)lock();}
  ['pointerdown','keydown','wheel','touchstart'].forEach(name=>document.addEventListener(name,reset,{passive:true}));
  window.AppLock={hash,lock,configure,activity:reset,isLocked:()=>locked};
})();
