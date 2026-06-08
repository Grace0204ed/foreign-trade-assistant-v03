@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules\electron" (
  echo Installing dependencies / 正在安装依赖...
  npm install
)

echo Preparing SQLite for Electron desktop mode / 正在准备桌面版 SQLite...
npm run rebuild:electron

npm run electron
endlocal
