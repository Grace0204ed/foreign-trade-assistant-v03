(function(){
 'use strict';const $=id=>document.getElementById(id),observers=new WeakMap();
 function refresh(kind,record){
  if(!['agency','invitation'].includes(kind))return;
  const root=$('view-'+kind),id='document-side-workspace-'+kind;let workspace=$(id);
  const enabled=kind==='invitation'||record?.documentType==='statement';
  if(!enabled){if(workspace){observers.get(workspace)?.disconnect();for(const node of [...workspace.querySelectorAll('.quote-editor,#'+kind+'-preview')])if(workspace.contains(node)){node.style.removeProperty('zoom');root.append(node);}workspace.remove();}const row=$('document-output-options-'+kind)?.querySelector('[data-output-controls-row]');if(row){row.replaceWith(...row.children);}root?.classList.remove('document-side-editor');return;}
  const editor=root.querySelector('.quote-editor'),preview=$(kind+'-preview');if(!editor||!preview)return;
  root.classList.add('document-side-editor');
  if(!workspace){workspace=document.createElement('div');workspace.id=id;workspace.className='document-side-workspace';workspace.innerHTML='<section class="document-side-paper"></section><section class="document-side-form"></section>';root.append(workspace);}
  const paper=workspace.firstElementChild,form=workspace.lastElementChild;
  if(preview.parentElement!==paper)paper.append(preview);if(editor.parentElement!==form)form.append(editor);
  if(kind==='agency'){const picker=$('agency-template');if(picker)picker.closest('label').hidden=true;for(const name of ['agency-use-template','agency-save-template'])if($(name))$(name).hidden=true;}
  if(kind==='agency'){const basic=editor.querySelector('[data-form-section=basic]'),labels=basic?.querySelectorAll(':scope>.form-grid>label');if(labels?.length)basic.hidden=[...labels].every(label=>label.hidden);}
  const scale=()=>{if(preview.parentElement===paper){const zoom=String(Math.min(1,Math.max(.25,(paper.clientWidth-24)/794)));if(preview.style.zoom!==zoom)preview.style.zoom=zoom;}};if(!observers.has(workspace)){const observer=new ResizeObserver(()=>requestAnimationFrame(scale));observer.observe(paper);observers.set(workspace,observer);}requestAnimationFrame(scale);
 }
 window.DocumentSideEditor={refresh};
})();
