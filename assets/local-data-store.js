/* Large business records belong in IndexedDB, not the small localStorage quota. */
(() => {
 'use strict';
 const keys=['settings','products','quotes','invitations'].map(k=>'quote_assistant_v01_'+k),cache=new Map();
 let db,queue=Promise.resolve();const failures=new Map();
 const ready=new Promise((resolve,reject)=>{
  const request=indexedDB.open('foreign-trade-business-cache',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('records');
  request.onerror=()=>reject(request.error);
  request.onsuccess=()=>{db=request.result;const tx=db.transaction('records','readonly'),store=tx.objectStore('records');
   keys.forEach(key=>{const r=store.get(key);r.onsuccess=()=>{if(r.result!==undefined)cache.set(key,r.result);else{const old=localStorage.getItem(key);if(old!==null)cache.set(key,old);}};});
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  };
 });
 function set(key,raw){
  cache.set(key,raw);
  queue=queue.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{
   const tx=db.transaction('records','readwrite');tx.objectStore('records').put(raw,key);
   tx.oncomplete=()=>{localStorage.removeItem(key);failures.delete(key);resolve();};
   tx.onerror=tx.onabort=()=>{const failure=tx.error||Error('本地资料保存失败');failures.set(key,failure);window.dispatchEvent(new CustomEvent('fta-storage-error',{detail:failure.message}));reject(failure);};
  }));
  // Keep rejection observable through flush(), without an unhandled rejection.
  queue.catch(()=>{});
 }
 window.BusinessDataStore={ready,has:key=>keys.includes(key),get:key=>cache.get(key)||null,set,flush:async()=>{await queue;if(failures.size)throw failures.values().next().value;}};
})();
