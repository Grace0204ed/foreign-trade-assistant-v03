(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ConfiguredFields=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Only these attribute-free formatting tags can reach an output document.
 function rich(value){return escape(value).replace(/&lt;(\/?)(b|strong|i|em|u|p|div|br|ul|ol|li)(?:\s[^<>]*?)?\s*\/?&gt;/gi,(_all,end,tag)=>'<'+end+tag.toLowerCase()+'>').replace(/\n/g,'<br>');}
 const imageSource=value=>/^(data:image\/(?:png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+|\/?uploads\/[a-z0-9_./%-]+)$/i.test(String(value||''))?String(value):'';
 function html(field,value){if(field?.fieldType==='richtext')return '<div class="configured-rich-output">'+rich(value).replace(/<(b|strong)>/g,'<$1 style="font-weight:700!important">').replace(/<(i|em)>/g,'<$1 style="font-style:italic!important">').replace(/<u>/g,'<u style="text-decoration:underline!important">')+'</div>';if(field?.fieldType==='image'){const src=imageSource(value);return src?'<img class="configured-image-output" src="'+escape(src)+'" alt="'+escape(field.zh||field.en||'图片')+'" style="max-width:100%;max-height:180px;object-fit:contain">':'';}return escape(value).replace(/\n/g,'<br>');}
 function enhance(input,field){
  if(!['richtext','image'].includes(field.fieldType))return;
  input.hidden=true;const panel=document.createElement('div');panel.className='configured-field-editor';input._choiceList=panel;
  const emit=()=>input.dispatchEvent(new Event('input',{bubbles:true}));
  if(field.fieldType==='image'){
   const file=document.createElement('input');file.type='file';file.accept='image/png,image/jpeg,image/webp,image/gif,image/avif';file.setAttribute('aria-label','上传'+(field.zh||'图片'));
   const preview=document.createElement('div'),clear=document.createElement('button');clear.type='button';clear.textContent='移除图片';
   const draw=()=>{preview.innerHTML=html(field,input.value);clear.hidden=!input.value;};
   file.onchange=()=>{const selected=file.files?.[0];if(!selected)return;if(!/^image\/(png|jpeg|webp|gif|avif)$/.test(selected.type)||selected.size>8*1024*1024){alert('请选择不超过 8 MB 的 JPG、PNG、WebP、GIF 或 AVIF 图片。');file.value='';return;}const reader=new FileReader();reader.onload=()=>{input.value=reader.result;draw();emit();};reader.readAsDataURL(selected);};
   clear.onclick=()=>{input.value='';file.value='';draw();emit();};panel.append(file,clear,preview);draw();
  }else{
   const tools=document.createElement('div'),editor=document.createElement('div');tools.className='actions';editor.contentEditable='true';editor.className='configured-rich-editor';editor.style.fontWeight='400';editor.setAttribute('role','textbox');editor.setAttribute('aria-multiline','true');editor.setAttribute('aria-label',field.zh||field.en||field.fieldKey);editor.innerHTML=rich(input.value);
   const save=()=>{input.value=editor.innerHTML;emit();};
   let savedRange;const remember=()=>{const selection=getSelection();if(selection.rangeCount&&editor.contains(selection.anchorNode))savedRange=selection.getRangeAt(0).cloneRange();};editor.addEventListener('keyup',remember);editor.addEventListener('mouseup',remember);editor.addEventListener('blur',remember);
   for(const [tag,title] of [['b','加粗'],['i','斜体'],['u','下划线'],['ul','项目列表']]){const button=document.createElement('button');button.type='button';button.textContent=title;button.onmousedown=e=>{remember();e.preventDefault();};button.onclick=()=>{remember();const selection=getSelection(),range=savedRange||document.createRange();if(!savedRange)range.selectNodeContents(editor);if(!editor.contains(range.commonAncestorContainer))return;const wrapper=document.createElement(tag);if(tag==='ul'){const text=range.toString();range.deleteContents();for(const line of text.split('\n')){const item=document.createElement('li');item.textContent=line;wrapper.append(item);}}else wrapper.append(range.extractContents());range.insertNode(wrapper);range.selectNodeContents(wrapper);selection.removeAllRanges();selection.addRange(range);savedRange=range.cloneRange();save();};tools.append(button);}
   editor.oninput=save;editor.onpaste=e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));save();};panel.append(tools,editor);
  }
 }
 return {html,rich,imageSource,enhance};
});
