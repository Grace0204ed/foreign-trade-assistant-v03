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

echo Starting Quotation System / 正在启动报价系统...
npm run electron
endlocal
