const fs=require('fs'),{chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.TEST_BROWSER,headless:true});try{
const p=await b.newPage({viewport:{width:256,height:256}});await p.setContent('<style>body{margin:0;background:transparent}</style>'+fs.readFileSync('assets/app-icon.svg','utf8'));
const png=await p.screenshot({omitBackground:true});fs.writeFileSync('assets/app-icon.png',png);
const h=Buffer.alloc(22);h.writeUInt16LE(1,2);h.writeUInt16LE(1,4);h.writeUInt16LE(1,10);h.writeUInt16LE(32,12);h.writeUInt32LE(png.length,14);h.writeUInt32LE(22,18);fs.writeFileSync('assets/app-icon.ico',Buffer.concat([h,png]));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
