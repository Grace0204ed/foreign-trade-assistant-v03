'use strict';
const{app,BrowserWindow,ipcMain}=require('electron'),assert=require('node:assert/strict');
const register=require('../electron/editor-input-focus.cjs')({ipcMain,BrowserWindow}),sleep=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:620,height:320,show:false,webPreferences:{preload:require('node:path').resolve('electron/preload.js')}}),other=new BrowserWindow({width:300,height:200,show:false});register(win);
 try{
  await win.loadURL('data:text/html,<input id="entry" style="margin:30px;width:400px;height:40px" autofocus><script>onbeforeunload=()=>false</script>');
  win.show();win.focus();win.webContents.focus();other.show();win.focus();
  win.webContents.once('will-prevent-unload',()=>{other.focus();win.focus();});const blocked=new Promise(r=>win.webContents.once('will-prevent-unload',r));win.close();await blocked;await sleep(150);
  assert(win.isFocused(),'test window is active after the blocking dialog');
  assert.equal(await win.webContents.executeJavaScript('document.hasFocus()'),false,'reproduces native/Blink focus desynchronization in this Electron runtime');
  let repairs=0;ipcMain.on('editor-input-focus',()=>repairs++);
  const click=()=>{for(const type of ['mouseDown','mouseUp'])win.webContents.sendInputEvent({type,x:100,y:60,button:'left',clickCount:1});};click();
  for(let i=0;i<80&&!await win.webContents.executeJavaScript('document.hasFocus()');i++)await sleep(25);
  assert.equal(await win.webContents.executeJavaScript('document.hasFocus()'),true,'a real input click repairs the page focus');assert.equal(repairs,1);
  for(const keyCode of 'After dialog')win.webContents.sendInputEvent({type:'char',keyCode});await sleep(50);
  assert.equal(await win.webContents.executeJavaScript('document.querySelector("input").value'),'After dialog');
  win.webContents.debugger.attach('1.3');try{await win.webContents.debugger.sendCommand('Input.imeSetComposition',{text:'中文',selectionStart:2,selectionEnd:2});await win.webContents.debugger.sendCommand('Input.insertText',{text:'中文'});}finally{win.webContents.debugger.detach();}
  assert.equal(await win.webContents.executeJavaScript('document.querySelector("input").value'),'After dialog中文');click();await sleep(30);assert.equal(repairs,1,'normal input clicks never replay native activation');
  other.focus();await sleep(30);win.webContents.send('unrelated-event');assert(other.isFocused(),'recovery never steals focus from another window');
  console.log('PASS Windows blocking-dialog focus reproduced; trusted field click restores page focus, English/Chinese input and normal clicks');
 }finally{win.destroy();other.destroy();app.quit();}
}).catch(error=>{console.error(error.stack);app.exit(1)});
