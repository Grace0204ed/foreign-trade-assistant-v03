(() => {
  'use strict';
  let config={enabled:false,autoLockMinutes:15,pinHash:''},timer=null,locked=false;
  const hash=async value=>{const data=new TextEncoder().encode(String(value)),digest=await crypto.subtle.digest('SHA-256',data);return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');};
  const reset=()=>{clearTimeout(timer);if(config.enabled&&!locked)timer=setTimeout(lock,Math.max(1,Number(config.autoLockMinutes)||15)*60000);};
  function lock(){if(!config.enabled||locked)return;locked=true;const overlay=document.createElement('div');overlay.id='application-lock-screen';overlay.innerHTML=`<div class="app-lock-card"><h2>外贸助手已锁定</h2><p>请输入本机PIN解锁。未保存的编辑内容仍保留。</p><input type="password" inputmode="numeric" maxlength="12" autocomplete="off" placeholder="PIN"><button type="button">解锁</button><p class="app-lock-error" role="alert"></p></div>`;document.body.appendChild(overlay);const input=overlay.querySelector('input'),error=overlay.querySelector('.app-lock-error');const unlock=async()=>{if(await hash(input.value)!==config.pinHash){error.textContent='PIN不正确，请重试。';input.select();return;}locked=false;overlay.remove();reset();};overlay.querySelector('button').onclick=unlock;input.onkeydown=e=>{if(e.key==='Enter')unlock();};setTimeout(()=>input.focus());}
  function configure(next={}){config={...config,...next};reset();}
  ['pointerdown','keydown','wheel','touchstart'].forEach(name=>document.addEventListener(name,reset,{passive:true}));
  window.AppLock={hash,lock,configure,isLocked:()=>locked};
})();
