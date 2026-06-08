@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies / 正在安装依赖...
  npm install
)

echo Preparing SQLite for browser/server mode / 正在准备浏览器版 SQLite...
npm run rebuild:node

start "Quotation System Server" /min cmd /c "npm run server"
timeout /t 2 >nul
start http://127.0.0.1:8765/index.html

endlocal
