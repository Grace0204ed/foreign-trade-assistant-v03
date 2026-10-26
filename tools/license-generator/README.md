# 外贸助手离线授权码生成器

该工具仅供软件销售方本机使用。授权码使用 Ed25519 私钥签发，外贸助手使用仓库中的公钥离线验证。

## 私钥位置

生成器依次检查以下位置，仓库和发布文件均不得包含私钥：

1. `%APPDATA%\foreign-trade-license-generator\keys\private-key.pem`
2. 便携程序同级的 `keys\private-key.pem`
3. `%USERPROFILE%\Documents\外贸助手授权工具\私钥备份-请勿上传\private-key.pem`

## 构建

```powershell
npm install
npm run build
```

构建结果位于 `dist`。对外发布外贸助手时，只发布外贸助手安装包，不发布授权码生成器和私钥。
