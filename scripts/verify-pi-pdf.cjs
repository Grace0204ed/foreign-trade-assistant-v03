// Render real saved PIs with the application frontend and Chromium print engine.
// Uses a temporary local static server; all business API reads go to the running app.
const {app, BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const express=require('express');
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
  const site=express(),root=path.resolve(__dirname,'..');
  site.use('/api',(req,res)=>{
    const proxy=http.request({hostname:'127.0.0.1',port:18765,path:'/api'+req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:18765'}},upstream=>{res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);});
    proxy.on('error',e=>res.status(502).end(e.message));req.pipe(proxy);
  });
  site.use(express.static(root));
  const server=await new Promise(resolve=>{const s=site.listen(0,'127.0.0.1',()=>resolve(s));});
  const port=server.address().port;
  try{
    const all=await (await fetch('http://127.0.0.1:18765/api/quotations')).json();
    for(const number of process.argv.slice(2)){
      const record=all.quotations.filter(q=>q.quote_number===number).sort((a,b)=>b.version-a.version)[0];
      assert(record,number+' not found');
      const win=new BrowserWindow({show:false,width:1440,height:1050,webPreferences:{contextIsolation:true}});
      win.webContents.on('console-message',(_e,_level,msg)=>{if(/error|failed/i.test(msg))console.error(msg);});
      await win.loadURL(`http://127.0.0.1:${port}/?quote=${encodeURIComponent(record.id)}`);
      let ready=false;
      for(let n=0;n<100;n++){
        ready=await win.webContents.executeJavaScript(`document.querySelector('#quote-preview')?.innerText.includes(${JSON.stringify(number)})||false`);
        if(ready)break;await new Promise(r=>setTimeout(r,150));
      }
      assert(ready,'PI did not open: '+number);
      await win.webContents.executeJavaScript(`document.body.classList.add('printing-standard');document.fonts.ready`);
      win.webContents.debugger.attach('1.3');
      await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{media:'print'});
      const data=await win.webContents.executeJavaScript(`(()=>{
        const p=document.querySelector('#quote-preview'),table=p.querySelector('table');
        const visible=el=>getComputedStyle(el).display!=='none';
        return {text:p.innerText,headers:[...table.querySelectorAll('thead th')].filter(visible).map(el=>el.textContent.trim()),rows:[...table.querySelectorAll('tbody tr')].map(row=>[...row.cells].filter(visible).map(el=>el.textContent.trim())),signature:!!p.querySelector('.document-signature-image'),seal:!!p.querySelector('.document-company-seal')};
      })()`);
      assert(data.text.includes('Jinwanwa International Trading Co., Ltd.'),'Wrong company');
      assert(!data.text.includes('Hefei Xinwanwa'),'Wrong company leaked');
      assert(data.signature&&data.seal,'Signature/seal missing');
      assert.equal(data.headers[0],'No.');
      for(const row of data.rows)assert.equal(row.length,data.headers.length,'Column mismatch');
      const hsIndex=data.headers.indexOf('HS CODE');
      assert(hsIndex>=0,'HS column missing');
      for(const row of data.rows)assert(/^\d{8}$|^—$|^$/.test(row[hsIndex]),'HS cell is misaligned: '+row[hsIndex]);
      const desktop=process.env.USERPROFILE?path.join(process.env.USERPROFILE,'Desktop'):app.getPath('desktop');
      const file=path.join(desktop,`2026-10-29 ${record.buyer.company} ${number}-修正版.pdf`);
      const pdf=await win.webContents.printToPDF({printBackground:true,pageSize:'A4'});
      fs.writeFileSync(file,pdf);
      console.log(JSON.stringify({number,file,headers:data.headers,rows:data.rows,signature:data.signature,seal:data.seal}));
      win.destroy();
    }
  }finally{server.close();app.quit();}
}).catch(e=>{console.error(e);app.exit(1);});
