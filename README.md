# 外贸助手 V0.4

外贸助手是一套在本机运行、支持电脑和 iPhone 双端使用的外贸业务系统。

## 下载安装教程

### 方法一：下载完整源码（推荐）

1. 打开本仓库首页。
2. 点击右上方绿色 **Code** 按钮。
3. 点击 **Download ZIP**。
4. 下载完成后解压到电脑中的固定文件夹，不要直接在压缩包内运行。
5. 首次使用请安装 [Node.js LTS](https://nodejs.org/)。
6. 在解压后的文件夹中双击 `启动外贸助手.cmd`。
7. 浏览器打开 `http://localhost:8765` 即可使用。

### 方法二：使用 Git 下载和更新

首次下载：

```powershell
git clone https://github.com/Grace0204ed/foreign-trade-assistant-v03.git
cd foreign-trade-assistant-v03
npm install
npm run server
```

以后获取最新版：

```powershell
git pull origin master
npm install
```

然后双击 `启动外贸助手.cmd`。程序更新不会主动清空 `%APPDATA%\外贸助手` 中的客户、产品和历史报价数据库。更新前仍建议在“管理后台”点击“备份数据库”。

### 手机端使用

1. 电脑先运行外贸助手。
2. iPhone 和电脑连接同一个 Wi-Fi。
3. 在电脑运行 `ipconfig`，找到无线网卡的 IPv4 地址，例如 `192.168.1.20`。
4. iPhone Safari 打开 `http://电脑IPv4地址:8765`，例如 `http://192.168.1.20:8765`。
5. 如无法访问，请允许 Windows 防火墙放行 Node.js 或端口 `8765`。

## V0.4 功能

- 客户跟进：客户等级、业务阶段、项目与设备标签。
- 跟进提醒：逾期、今日待跟进、漏填下次跟进和重点客户提醒。
- 今日进度：自动统计当天跟进完成率。
- 客户与报价关联：从客户详情直接新建报价并自动带入客户资料。
- 报价管理：新建、保存、复制、查询和导出中英双语报价单。
- 统一产品库、新车组合报价、邀请函和运费查询。
- 报价单、形式发票和新车报价支持产品图片、Logo 与电子公章输出。
- 常用港口、历史运价、型号运输体积复用和自动运费计算。
- 统一登录、SQLite 数据库与自动备份。
- 电脑和 iPhone 在同一 Wi-Fi 下共用数据。

## 日常启动

双击：

```text
启动外贸助手.cmd
```

电脑访问：

```text
http://localhost:8765
```

iPhone 与电脑连接同一个 Wi-Fi 后，通过电脑的局域网 IP 和端口 `8765` 访问。

## 数据位置

```text
%APPDATA%\外贸助手
```

数据库和本机上传资料已通过 `.gitignore` 排除，不会上传到 GitHub。

## 开发检查

```powershell
npm install
npm run check
npm run server
```
