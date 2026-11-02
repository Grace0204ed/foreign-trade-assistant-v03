# 0.11.20 发布前验证记录

验证日期：2026-11-02。目标仓库：Grace0204ed/foreign-trade-assistant-v03，分支 master。开始时 HEAD 为 d882109，最新正式版本为 0.11.19；已保留并核验工作区原有修改。正式发布状态以 GitHub 实际 Release 为准，本文件记录本机验证结果。

## 实现与修改文件

- `assets/document-presentation.js`：按翻译表头测量列宽、表头及正文对比度、密集表横版、预览缩放。
- `styles.css`：表格字号、换行、页边距、宽表分页；报价条款与银行资料布局；授权书、佣金结算单签署分页；移除编辑区打印占位。
- `app.js`、`server/index.js`、`index.html`：删除“沿用模板颜色”，九种单证分别保存颜色偏好，关闭时等待写入；历史单证继续使用自己的颜色快照。
- `electron/main.js`：PDF 使用 CSS 指定纸张方向。
- `scripts/document-layout-audit.cjs`、`scripts/test-document-readability.cjs`、`scripts/audit-readable-pdfs.cjs`：布局、对比度、颜色持久化、密集宽表及续页表头检查。
- `scripts/verify-language-pdfs.cjs`、`scripts/audit-language-pdfs.cjs`：81 份实际 PDF，保持比例的联系表、签署分页和短单证页数检查。
- `scripts/audit-exported-pdfs.cjs`、`scripts/verify-release-pdfs.cjs`：生产 PDF 纸张参数及长商品表内容核验。
- `scripts/test-work-recovery.cjs`、`scripts/test-refinement-workspace.cjs`、`scripts/verify-option-presentation.cjs`、`scripts/test-option-presentation.cjs`：跨行文字、切换渲染等待、现有 PIN 控件尺寸及颜色回归断言。
- `package.json`、`package-lock.json`、`.github/workflows/release.yml`、`CHANGELOG.md`、`README.md`、本文件：版本、回归入口及发布说明。

## 已通过的检查

以下命令实际执行成功，非代码推测：

| 命令 | 结果 |
| --- | --- |
| `npm test` | 13 组 Node 测试通过；完成后恢复 Electron SQLite ABI |
| `npm run check`、`npm run check:electron-sqlite` | 静态语法及原生模块加载通过 |
| `npm run test:ui` | 装箱关联、产品管理、持久化、三次进程恢复、PDF 单选/批量及失败恢复通过 |
| `npm run test:customers`、`npm run test:approved`、`npm run test:next` | 客户、历史分页、工作区及 PIN 回归通过 |
| `npm run test:refinement`、`npm run test:product-modal`、`npm run test:demo-workflow` | 产品导入编辑、演示流程、单证编辑通过 |
| `npm run test:fields`、`npm run test:language-matrix` | 字段保存及语言/业务分支检查通过 |
| `npm run test:pdf` | 实际 PDF、签署人/公司切换、完整条款、15 份 PDF 共 37 页内容核验通过 |
| `electron scripts/test-document-readability.cjs` | 300 组屏幕/打印布局、50 份配色 PDF、10 份密集宽表 PDF、九类颜色恢复及历史不变通过 |
| `node scripts/audit-readable-pdfs.cjs` | 10 份 14 列、36 条商品的多页 PDF：商品完整、重复表头、横版、无空白页通过 |
| `electron scripts/verify-language-pdfs.cjs` | 九种单证 × 九种语言，81 份实际 PDF 生成通过 |
| `node scripts/audit-language-pdfs.cjs` | 81 份 PDF 文字、字段、空白页、缺字及签署分页检查通过 |
| `npm run build:win` | Windows NSIS 安装包构建通过，afterPack SQLite 自检通过 |
| `npm run test:packaged` | 实际打包 EXE 启动、无 Node PATH/离线资源、保存、关闭重开、产品/导入草稿及真实 PDF IPC 通过 |
| `node scripts/check-no-private-key.cjs`、`git diff --check` | 通过 |

`test:languages` 与 `test:readability` 的 Electron 阶段成功后，新加的审计断言曾失败；修复阿拉伯语 PDF 视觉字符顺序和中日韩字符计数假设后，分别重跑两个 Node 审计脚本通过。没有把此前组合命令的失败记为成功。草稿 PDF 的跨行文字比较、单证切换动画等待以及 PIN 尺寸过时断言也已修正并重跑对应完整测试通过。

首次安装包构建因并行 Electron 测试占用 SQLite DLL 而 EPERM 失败，未替换原生模块。等待项目测试退出后重新构建成功，未关闭无关程序。最终回归均在正确的 SQLite ABI 下执行。

## PDF 视觉验收

实际打开并查看 `output/language-qa/` 下九份 `*-contact.png` 和 `continuation-contact.png`，修复后重新生成并再次查看。另查看德语、阿拉伯语密集表第二页和带商品图片、签名、公章的短报价单放大图。

已确认：表头/正文清晰、宽度与换行合理；普通短单证一页；宽表使用横版并重复续页表头；授权书保留证书结构，佣金条款和签署保持关联；佣金结算单避免签署孤立在第三页。签名、公章及商品图片比例正常。实际导出与预览使用同一布局规则。

## 安装包与隐私检查

- 生成 `Foreign-Trade-Assistant-Setup-0.11.20-x64.exe`（140366914 字节）、对应 blockmap、`latest.yml`。
- Electron 39.8.10；better-sqlite3 12.11.1；应用版本 0.11.20。
- ASAR 1847 个文件，主程序/样式/前端/服务端与构建时源码逐字节一致。
- 未包含本机数据库、uploads、backup、output、Git 目录、许可证文件、私钥、PFX/P12 或环境凭据；必要公钥保留。
- Git 跟踪文件扫描未发现私钥及常见 GitHub/AWS 凭据；构建包不含真实客户数据。
- `app-update.yml` 指向目标 GitHub 仓库；`latest.yml` 版本、安装包名称、大小及 SHA512 与构建文件一致。

## 验证边界

- 打包软件运行及 PDF 已真实验证；没有执行 NSIS 覆盖安装，没有将本机正式业务安装升级，不能称为真实升级完成。
- 安装包沿用项目现有未签名配置；Windows 数字签名未验证。
- 固定语言文案与测试字段通过，不等于人工审核全部自由输入译文或任意用户自定义模板。
- GitHub 推送、Release 和在线下载需要发布后另行验证；本地构建不能作为已经发布的证据。

本机证据保存在被 Git 忽略的 `output/release-0.11.20/`、`output/language-qa/`、`output/readability-qa/`、`output/release-qa/`，不随源码或安装包上传。
