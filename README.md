# 报价助手 V0.1

这是一个本机/局域网使用的报价系统。当前版本已增加 Node.js + Express + SQLite 后端，并预留 Electron Windows 桌面端封装。

## 入口

浏览器版：双击 `启动报价系统.cmd`，会启动本地后端并打开 `http://127.0.0.1:8765/index.html`。

桌面版：双击 `启动桌面版.cmd`，或运行：

```powershell
npm run electron
```

开发环境运行后端：

```powershell
npm run server
```

Windows 打包 exe：

```powershell
npm run rebuild:electron
npm run build:win
```

如果 Electron 下载较慢，可先使用国内镜像安装 Electron 二进制：

```powershell
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
node node_modules/electron/install.js
```

如果打包时提示 `better-sqlite3` 被占用，请先关闭正在运行的报价系统窗口和本地 Node 服务，再重新执行 `npm run rebuild:electron` 和 `npm run build:win`。

注意：启动脚本会先检查 SQLite 原生模块是否可用，只有不可用时才自动修复，避免后台服务占用文件导致打不开。

- `启动报价系统.cmd` 会执行 `npm run ensure:sqlite`
- `启动桌面版.cmd` 会执行 `npm run ensure:sqlite`

首页包含主要功能：
- 新建报价
- 历史报价
- 产品库
- 运费中心
- 设置中心

## 主要功能

- 设置中心：维护公司信息、联系人信息、Logo、报价单背景图、报价单样式、产品分类和报价字段模板。
- 电子公章：可在设置中心上传或删除电子章，导出报价单时自动显示在条款右侧。
- 产品分类：每个分类独立管理，可新增、编辑、删除、上移、下移和拖拽排序，不需要输入多行文本配置。
- 报价字段模板：每个字段独立管理，可新增、编辑、删除、上移、下移、拖拽排序，并设置必填和是否显示在报价单。
- 报价费用字段：运费、拖车到港费、保险费等可作为 `money` 金额字段自由新增、删除和排序；总金额会自动计算 `数量 × 单价 + 其他金额字段`。
- 报价条款字段：每个报价类型可单独维护付款、交货、运输、售后、质保等条款字段，并控制是否显示。
- 产品库：保存常用产品资料和常用图片，支持挖掘机、装载机、推土机、压路机、平地机、自卸车、叉车、TLB 等分类。
- 文本导入价格表：可把 Excel、微信、备忘录里的底价表复制到产品库批量导入，也可上传 TXT/CSV；重复产品会自动更新底价。
- 运费中心：维护港口库、运费库，支持运费查询、自动计算、复制和导入报价单。
- 后端 API：产品、港口、运费、报价快照、登录、备份导出均提供本地 API。
- 新建报价：选择报价类型，填写客户信息，添加产品，从产品库选择或手动新增，上传产品图片，自动计算总金额。
- 历史报价：保存报价记录，支持搜索、查看编辑、复制为新报价、删除、重新导出 PDF。
- 导出 PDF：浏览器版通过打印窗口另存为 PDF；桌面版会弹出 PDF 保存位置。

## 数据说明

浏览器版后端数据默认保存在：

```text
%APPDATA%\Quotation System
```

Electron 桌面版数据默认保存在 Electron 的用户数据目录：

```text
%APPDATA%\Quotation System 报价系统
```

其中包括：

- `quotation-system.sqlite`：SQLite 数据库
- `uploads/`：Logo、背景图、电子章、产品图片等上传文件
- `backups/`：数据库备份
- `exports/`：导出文件预留目录

默认账号：

```text
admin / admin123
staff / staff123
```

首次正式使用后请修改默认密码。
