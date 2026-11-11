(function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function open({title,options=[],save}){
  const original=structuredClone(options),rows=original.map((option,i)=>typeof option==='object'?{...option,id:option.id||'existing-'+i,value:String(option.value??option.zh??option.label??option.en??''),labelZh:option.labelZh||option.zh||option.label||String(option.value||''),labelEn:option.labelEn||option.en||'',saved:true}:{id:'existing-'+i,value:String(option),labelZh:String(option),labelEn:'',saved:true});
  const modal=document.createElement('div');modal.className='modal compact-field-options';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');const previous=document.activeElement;
  modal.innerHTML='<div class="modal-card dictionary-modal"><header><h3>'+esc(title)+' · 下拉选项</h3><button type="button" data-close>关闭</button></header><div class="history-table-wrap"><table class="config-table"><thead><tr><th></th><th>中文名称</th><th>英文名称</th><th>操作</th></tr></thead><tbody></tbody></table></div><div class="actions"><button type="button" data-add>＋新增选项</button><button type="button" class="primary" data-save>保存选项</button></div><p data-error role="alert"></p></div>';document.body.append(modal);
  const list=modal.querySelector('tbody'),close=()=>{modal.remove();previous?.focus();};
  function draw(){list.innerHTML=rows.map((row,i)=>row.deletedAt?'':'<tr draggable="true" data-option-index="'+i+'"><td><span class="option-grip" title="拖拽排序">⠿</span></td><td><input data-label="labelZh" aria-label="中文名称" value="'+esc(row.labelZh)+'"></td><td><input data-label="labelEn" aria-label="英文名称" value="'+esc(row.labelEn)+'"></td><td><button type="button" data-edit="'+i+'">编辑</button><button type="button" class="option-remove" data-remove="'+i+'" aria-label="删除选项">×</button></td></tr>').join('');}
  modal.oninput=event=>{const row=event.target.closest('[data-option-index]');if(row&&event.target.dataset.label)rows[Number(row.dataset.optionIndex)][event.target.dataset.label]=event.target.value;};
  let drag=-1;modal.ondragstart=event=>{const row=event.target.closest('[data-option-index]');drag=row?Number(row.dataset.optionIndex):-1;if(drag>=0)event.dataTransfer.setData('text/plain',String(drag));};modal.ondragover=event=>{if(event.target.closest('[data-option-index]'))event.preventDefault();};modal.ondrop=event=>{const row=event.target.closest('[data-option-index]');if(drag<0||!row)return;event.preventDefault();rows.splice(Number(row.dataset.optionIndex),0,rows.splice(drag,1)[0]);drag=-1;draw();};
  modal.onclick=async event=>{const button=event.target.closest('button');if(!button)return;try{
   if(button.hasAttribute('data-close'))return close();
   if(button.hasAttribute('data-add')){rows.push({id:crypto.randomUUID(),labelZh:'新选项',labelEn:'',value:'',active:true});draw();list.lastElementChild?.querySelector('input').focus();list.lastElementChild?.scrollIntoView({block:'nearest'});return;}
   if(button.dataset.edit!=null){const input=list.querySelector('[data-option-index="'+button.dataset.edit+'"] input');input?.focus();input?.select();return;}
   if(button.dataset.remove!=null){const index=Number(button.dataset.remove),row=rows[index];if(row.saved){row.active=false;row.deletedAt=new Date().toISOString();}else rows.splice(index,1);draw();return;}
   if(button.hasAttribute('data-save')){const active=rows.filter(row=>!row.deletedAt&&row.active!==false);if(active.some(row=>!row.labelZh.trim()&&!row.labelEn.trim()))throw Error('请填写选项名称');const values=new Set();for(const row of active){const value=row.saved?row.value:(row.labelZh||row.labelEn).trim();if(values.has(value))throw Error('选项名称不能重复');values.add(value);}
    const result=rows.map((row,i)=>{const {saved,...option}=row;option.value=saved?row.value:(row.labelZh||row.labelEn).trim();option.sortOrder=(i+1)*10;return option;});button.disabled=true;try{await save(result);close();}finally{if(button.isConnected)button.disabled=false;}
   }
  }catch(error){modal.querySelector('[data-error]').textContent=error.message;}};
  modal.onkeydown=event=>{if(event.key==='Escape')close();};draw();modal.querySelector('[data-close]').focus();return modal;
 }
 root.CompactOptionEditor={open};
})(window);
