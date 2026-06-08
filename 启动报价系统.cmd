@echo off
setlocal

set "HTML=%~dp0index.html"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$html = (Resolve-Path '%HTML%').Path; " ^
  "$url = (New-Object System.Uri($html)).AbsoluteUri; " ^
  "$browsers = @(" ^
  "  \"$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe\", " ^
  "  \"$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe\", " ^
  "  \"$env:ProgramFiles\Google\Chrome\Application\chrome.exe\", " ^
  "  \"$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe\"" ^
  "); " ^
  "$browser = $browsers | Where-Object { Test-Path $_ } | Select-Object -First 1; " ^
  "if ($browser) { Start-Process -FilePath $browser -ArgumentList @('--app=' + $url) } else { Start-Process $url }"

endlocal
