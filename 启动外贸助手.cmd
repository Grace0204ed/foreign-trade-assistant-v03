@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies / 正在安装依赖...
  npm install
)

echo Checking SQLite / 正在检查 SQLite...
npm run ensure:sqlite

echo Starting Foreign Trade Assistant / 正在启动外贸助手...
start "Foreign Trade Assistant Server" /min cmd /c "npm run server"
timeout /t 2 >nul
start http://127.0.0.1:8765/

endlocal
