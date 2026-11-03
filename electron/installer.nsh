; Inspect live processes at this installation path, not stale tasklist entries.
; Never skip running applications or ignore file replacement errors.
!macro customCheckAppRunning
  System::Call 'kernel32::SetEnvironmentVariable(t "FTA_INSTALL_EXE", t "$INSTDIR\${APP_EXECUTABLE_FILENAME}")'
  nsExec::ExecToStack '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -Command "try { $$running=@(Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object { $$_.ThreadCount -gt 0 -and $$_.ExecutablePath -eq $$env:FTA_INSTALL_EXE }); if($$running.Count -gt 0){exit 10}; exit 0 } catch {exit 11}"'
  Pop $0
  Pop $1
  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "请先关闭此外贸助手安装目录下的程序后重试。安装尚未执行，业务数据保持不变。" /SD IDOK
    SetErrorLevel 10
    Quit
  ${EndIf}
!macroend
