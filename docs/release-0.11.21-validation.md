# 0.11.21 验证记录

验证日期：2026-11-02。仓库 Grace0204ed/foreign-trade-assistant-v03，分支 master；起始提交 3932e47、正式版本 0.11.20。当前源码目录为“外贸助手备份/源码存档-0.5.0-20261022”，目录名称不代表源码版本。未操作企业官网，未重置已有成果。

## 本轮功能

- `assets/document-workflow.js`、`assets/document-workflow-ui.js`、`assets/document-workflow.css`：日期、国家、多城市、多人邀请函、签章透明副本及共享叠放、蓝色／深色开关、真实分页预览界面。
- `app.js`、`index.html`、`assets/agency-documents.js`、`assets/workflow-redesign.css`：实际业务接线，签名设置与版本快照、单证编辑/保存/重开、历史公司快照、独立草稿及恢复、当前和批量输出，保存失败不伪造本地历史。
- `electron/document-output.cjs`、`electron/main.js`、`electron/preload.js`：实际 PDF 分页、图片预览、同一 PDF 字节导出、打印机/页码、取消/失败、窗口关闭三选项。批量逐份输出 PDF，重名另存，不混合不同单证。
- `server/db.js`、`server/document-history.js`、`server/quotation-history.js`、`server/index.js`：取消演示业务注入，草稿及有效历史筛选，允许缺少非技术业务字段的明确历史保存。
- 新增及更新 `scripts/test-document-*.cjs`、`scripts/test-signing-workflow.cjs` 等实际 Electron 回归；保留装箱关联与产品现有流程。

## 验证方法与证据

全部功能测试使用隔离临时数据库；没有用测试覆盖真实客户、证件或业务记录。完整命令结果写入本机忽略目录 `output/document-regression/results.json`。

- `npm run check`、`npm test`：语法、业务逻辑、日期边界、历史快照、选项、发布安全、私钥检查。Node 测试完成后恢复 Electron SQLite ABI；Electron 测试期间不切换原生模块。
- `node scripts/run-desktop-regression.cjs`：串行执行 `test:ui`、`test:customers`、`test:approved`、`test:next`、`test:refinement`、`test:product-modal`、`test:demo-workflow`、`test:fields`、`test:pdf`、`test:language-matrix`、`test:languages`、`test:readability`、`test:document-workflow`，逐项报告结果，不因失败跳过后续检查。
- 新工作流覆盖个人／团体／公司、1／2／5人边界、添加删除和类型切换、国家中文搜索、多个及自定义城市、1973年日期直接输入/日历、30日与自然月联动、语言切换及混合备注原文、保存与重新打开。
- 签名覆盖 JPG/PNG、原图与透明副本保存、鼠标实际手写、新版本与历史不变、中文英文选择独立于语言、九类单证签名/公章四种开关组合及真实 PDF。
- 草稿覆盖多个单证/产品任务、保存草稿/不保存/取消、真实关闭和三次进程重开、较大图片、版本冲突、旧缓存迁移一次、正式源记录不变。
- 输出覆盖当前未保存内容、真实 PDF 页面预览、预览/取消/失败不写历史、导出与预览字节相同、数据库保存失败与重试、重复输出无重复历史；批量单选/全选/取消、独立语言、旧草稿/删除/作废排除及逐份失败报告。
- 完整桌面回归13组全部通过。后续视觉验收发现双语长单证的末页只有签署区，已将最后业务段落与签署区联动分页；新增检查要求 PI/合同末页保留完整银行信息，采购协议保留末段业务条款，九类签章 PDF 复测通过。
- 打包界面实测发现侧栏层级遮挡预览导出按钮，已修复弹窗层级，并增加实际点击位置检查；最终安装包必须重新构建并以真实鼠标点击复测。批量导出进一步排除各类单证的旧 Draft 状态，历史分页与批量导出回归通过，旧记录不作删除或覆盖。
- PDF 证据位于 `output/language-qa/`（81份）、`output/readability-qa/`（300组布局、50份配色及10份密集宽表）、`output/document-workflow-qa/`（多人/中文/九种语言/双语）、`output/signing-workflow-qa/`（九类签章）和 `output/release-qa/`。不能把文字或边界检查代替视觉验收。

## 本机数据核对

实际已创建一致性 SQLite 备份、复制 browser-state，并执行 quick_check 和 SHA256。备份位于用户数据目录 `backups/before-0.11.21-cleanup-2026-11-02T12-38-19-805Z`，其中 `cleanup-plan.json` 保存完整核对清单；私人清单不进入 Git。

检查了70条报价类记录、1条邀请函、9条代理类单证、3个客户、878个产品。没有确定可删除的空白测试记录。14条有内容的旧草稿状态单证、2条代理类待判断记录全部保留，不能凭旧状态或缺少产品就认定为测试。实际删除0条、归入草稿箱0条；其余数据全部保留。待判断项需要用户核对清单后决定。恢复时先退出软件并备份当时状态，再由备份库和 browser-state 恢复；不要在软件运行时直接覆盖 SQLite。

## 尚需区分的验证范围

打印自动测试使用受控的系统取消／提交回调，不能证明打印机实际出纸。实际安装升级和更新后用户数据库验证必须另外执行，不能由安装包生成、Git 推送、Release 或下载成功推断。Windows 安装包沿用现有未签名配置，未取得代码签名证书。

## 最终构建与打包验收

- `npm test`、`npm run check` 再次通过；完整桌面回归13组通过。分页修复后重新执行 `test:pdf`、`test:languages`、`test:readability`，15份常规输出、81份九语言 PDF、300组屏幕／打印布局、50份配色 PDF 及10份密集多页宽表均通过。新增历史状态、签署区分页、按钮点击检查及批量失败回归通过。
- 实际查看九种单证的语言联系图、续页联系图、多人的中文／外语邀请函、德语与阿拉伯语密集宽表续页及签章末页。修复打印阴影、空占位、表格分隔及签署区孤页；长双语协议按内容自然分页，没有通过删减条款或缩小正文掩盖问题。
- `npm run build:win` 通过，Electron 39.8.10；`npm run test:packaged` 通过，使用隔离数据目录和打包 EXE，在 PATH 不含外部 Node 的环境验证启动、离线字体、保存、真实 PDF 预览及鼠标点击导出、关闭失败保留、取消关闭、实际关闭／重开、产品编辑和导入恢复、CRM。
- `node scripts/audit-release-package.cjs` 通过：70个应用源码／资源逐字节对应，ASAR共1851条目，无本机数据库、上传目录、恢复缓存、许可文件或私钥；所需字体、原生依赖及新模块实际存在。检查脚本兼容 Windows ASAR 路径及名称含“.js”的依赖目录。
- 安装包 `Foreign-Trade-Assistant-Setup-0.11.21-x64.exe` 为140393213字节，SHA256为 `28a6a9bcb7d593e7617aa4020f92c5f93edfb6c51d45d3909607554dad6a942b`。`latest.yml`版本、文件名、大小、SHA512与安装包一致；blockmap分块数量、大小及覆盖范围一致；`app-update.yml`指向指定仓库。实际 Windows 签名状态为 NotSigned，沿用原有配置。

本报告记录发布前可复核的验收证据。代码推送、GitHub Release、在线检测／下载与真实安装升级分别验证；发布后的线上检查结果保存在本机忽略目录 `output/release-0.11.21/`，不把下载成功当成实际安装升级通过。
