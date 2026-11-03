# 0.11.22 正式代码与构建验收

验证日期：2026-11-03。实际项目根目录为 `C:\Users\zhang\Documents\外贸助手备份\源码存档-0.5.0-20261022`，包名 foreign-trade-assistant。起始版本 0.11.21、提交 8159ddf，分支 master，远程 Grace0204ed/foreign-trade-assistant-v03。未操作企业官网，没有重置用户成果。

## 实施结果

- `assets/app-lock.js`、`assets/configurable-workspaces.js`：关闭仅校验当前 PIN；修改 PIN 原子校验；静谧蓝居中界面、眼睛切换、提示与自动锁定保留，数据库备份恢复入口保留。
- `assets/product-hierarchy.js`、`assets/product-hierarchy-workspace.js`、`assets/product-hierarchy.css`、`app.js`、`server/index.js`：类型／小类／品牌归属、联动、同级真实鼠标拖拽、启停、安全删除及稳定 ID；品牌内新增产品自动填分类。实际搜索字段、自然排序与单证选择器状态隔离。
- `assets/product-workflow.js`、`assets/configured-fields.js`、`assets/business-settings.js`：正式录入弹窗、可选图片价格、自由与结构规格、产品预览及 PDF；自定义图片和安全富文本接入实际字段；显式运输映射保留旧运输数据，不按名称猜测单位。文件／文字导入仍先核对映射。
- `assets/top-settings.js`：十种内置语言与双语、排序启停、全体／独立默认值及覆盖确认；按标题、表头、商品、正文、备注、页脚保存字体设置；历史与当前编辑内容不被新默认设置覆盖。
- `assets/commission-statement.js`、`assets/agency-documents.js`：独立佣金结算业务与十种输出语言，关联销售合同或手填，比例／固定金额不重复计算，银行模块可完整隐藏；保留旧委托采购历史兼容，移除新建入口。
- `assets/document-presentation.js`、`assets/document-workflow.css`、`index.html`：实际背景参数、对比度、分页、绿色开启／深色关闭、签章层级和宽幅邀请函；删除自由拖拽画布、重复保存／生成正式入口、固定行业模板库入口。新备注为空，贸易说明就近展示，公司职务留在公司设置；默认算术计算器及声明帮助。

## 实际测试

以下最终重跑通过，失败过程中发现的问题修复后复测，未跳过失败测试：

- `npm test`：14 项 Node 业务／发布／数据保护测试；修正旧 VM 测试缺少新增字段模块依赖。完成后恢复 Electron SQLite 二进制，Electron 测试期间未切换 ABI。
- `npm run check`、`git diff --check`：静态语法与差异检查。
- `npm run test:iteration`：五组实际 Electron 功能测试，包含原 PIN／错误 PIN／关闭持久化、搜索隔离与联合筛选、真实鼠标按住移动让位松手并保存重开、分类保护、后台字段／参数映射、不同文字区域保存、十种佣金 PDF、合同来源不变、银行隐藏与背景参数保存。
- `npm run test:ui`、`test:customers`、`test:approved`、`test:next`、`test:fields`、`test:product-modal`、`test:demo-workflow`、`test:refinement`：装箱关联、产品增改删和持久化、真实重启恢复、客户与历史分页、七类配置字段到历史与 PDF、产品导入和预览。
- `npm run test:document-workflow`：日期边界、五人邀请函、国籍中文搜索、城市与有效期、草稿三选项与多任务、实际 PDF 预览及相同字节导出、取消／故障／重复输出、批量范围、签章素材和历史版本、独立颜色。
- `npm run test:pdf`、`test:language-matrix`：真实输出字段／列对应、维护文案与 RTL、72 个当前单证语言预览。
- 90 份实际语言 PDF（含退役采购历史兼容）；视觉检查发现佣金落款孤页，修复后重生成该类型十种语言，再执行 `node scripts/audit-language-pdfs.cjs` 全部通过。逐一查看九张实际 PDF 联系表和续页；密集表另外查看德语、日语、阿拉伯语实际页图和续页，不仅检查字符串。
- `npm run test:readability`：300 组屏幕／打印布局、50 份配色 PDF、10 份十四列三十六行多页 PDF，无空白页／乱码，续表保留表头和完整行。
- `npm run build:win`：Windows x64 NSIS 构建成功，Electron 39.8.10。安装包 140412598 字节；SHA256 `f957a872b34b1e5c6b9c057fd4c8ca6fe16dfe49bed0dafdd95338473e4c6cc3`。
- `node scripts/audit-release-package.cjs`：77 个实际源码／资源文件与 asar 一致，1858 项归档内无本地数据库／上传／备份／授权文件和私钥，安装包大小与 latest.yml SHA512、blockmap、更新目标检查通过。
- `npm run test:packaged`：真实打包 EXE 在 PATH 无 Node 环境启动，离线字体／页面、Ctrl＋F5、实际 PDF 页面预览和导出、系统关闭取消／写失败保留窗口／关闭重开、产品和未完成导入恢复、CRM 通过。隔离测试数据未进入发布包。

## 数据兼容、备份和限制

实际本地只读审核：70 份报价历史、1 份邀请函、9 份其他单证、878 个产品、3 个客户。空白可可靠清理候选为零；16 项归属不确定内容全部保留。本轮删除零、迁入草稿零，未根据缺少产品或客户误删邀请函和佣金文件。

数据备份位于用户数据目录 `backups/before-0.11.21-cleanup-2026-11-02T19-13-11-800Z`（备份时尚未升版本，保留原目录名），数据库 quick_check 与哈希已核对；含数据库、浏览器状态和核对清单。需恢复时先关闭应用并另存当前数据，再用后台恢复数据库及对应浏览器状态；禁止运行中覆盖数据库。私人清单和备份不提交仓库。

打印测试覆盖系统取消／成功提交回调，没有真实打印机出纸验证；银行真实收款资料未改写。机械未知分类保留待核对，不依据型号猜测。自由内容不会自动翻译。未实际执行安装升级时不得宣称真实安装升级成功。

本文件记录本地正式代码、测试、PDF 和构建验收。源码推送、Release 发布、资源下载校验、旧包在线检测／下载及真实安装升级是不同阶段；线上结果以发布后独立核验记录和最终报告为准。
