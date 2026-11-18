'use strict';
module.exports=({ipcMain,BrowserWindow})=>{
  const editors=new WeakSet();
  ipcMain.on('editor-input-focus',event=>{
    const contents=event.sender,win=BrowserWindow.fromWebContents(contents);
    if(process.platform!=='win32'||!editors.has(contents)||contents.isDestroyed()||event.senderFrame!==contents.mainFrame||!win||win.isDestroyed()||!win.isVisible()||win.isMinimized()||!win.isFocused())return;
    // A native dialog can leave Aura focused while Blink is blurred. Replay
    // native activation only in response to a click in the active editor.
    win.blur();win.focus();contents.focus();
  });
  return win=>editors.add(win.webContents);
};
