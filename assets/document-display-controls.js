(function(){
 'use strict';const $=id=>document.getElementById(id);
 function refresh(kind,record){const output=$('document-output-options-'+kind);if(!output)return;
  if(kind==='agency'&&record?.documentType!=='statement')return;
  let row=output.querySelector(':scope>[data-output-controls-row]');if(!row){row=document.createElement('div');row.dataset.outputControlsRow='';output.append(row);}
  const heading=output.querySelector(':scope>h3');if(heading?.nextElementSibling!==row)output.insertBefore(row,heading?.nextElementSibling||output.firstChild);
  const common=output.querySelector('.document-simple-options'),signing=$('signing-controls-'+kind);
  for(const node of [common,signing])if(node&&node.parentElement!==row){node.style.removeProperty('display');row.append(node);}
 }
 window.DocumentDisplayControls={refresh};
})();
