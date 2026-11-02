// Runs inside Chromium for both the screen and print media geometry.
module.exports=function auditDocumentLayout(hostId){
  const host=document.getElementById(hostId),bounds=host.getBoundingClientRect(),issues=[];
  const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
    if(!node.textContent.trim()||['SCRIPT','STYLE'].includes(node.parentElement.tagName))continue;
    const range=document.createRange();range.selectNodeContents(node);
    for(const rect of range.getClientRects()){
      if(rect.width<1||rect.height<1)continue;
      if(rect.left<bounds.left-2||rect.right>bounds.right+2)issues.push({kind:'text-outside-page',text:node.textContent.slice(0,120),left:rect.left-bounds.left,right:rect.right-bounds.left,pageWidth:bounds.width});
    }
  }
  for(const table of host.querySelectorAll('table')){
    const rect=table.getBoundingClientRect();if(!rect.width)continue;
    if(rect.left<bounds.left-2||rect.right>bounds.right+2||table.scrollWidth>table.clientWidth+2)issues.push({kind:'table-overflow',width:table.clientWidth,scroll:table.scrollWidth,text:table.textContent.slice(0,80)});
    for(const cell of table.querySelectorAll('th')){
      const cellBounds=cell.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(cell);
      for(const text of range.getClientRects())if(text.width>0&&(text.left<cellBounds.left-2||text.right>cellBounds.right+2))issues.push({kind:'header-outside-cell',text:cell.textContent,width:cellBounds.width});
    }
  }
  return issues;
};
