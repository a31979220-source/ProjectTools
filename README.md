# ProjectTools - 本地项目管理与敏捷看板工具

[![Electron](https://img.shields.io/badge/Electron-v33.4-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English Version](./README_EN.md) | **中文文档**

**ProjectTools** 是一款极具现代感、高颜值、流畅且功能强大的**单机版项目管理与敏捷看板桌面应用**。基于 **Electron + React + TypeScript + Tailwind CSS** 打造，专为开发者、项目经理及个人高效工作者设计，无需依赖任何云端服务，本地数据安全无忧。

---

## 核心特色与功能亮点

### 1. 极致现代视觉设计 & 左右优雅滑动动画
* **暗黑 / 浅色模式原生切换**：支持跟随系统或一键平滑切换主题，Windows 标题栏完美融入主题颜色。
* **高颜值 UI & 视图模式优雅滑动动画**：基于精心设计的 Glassmorphic 色彩系统与平滑过度微动画。【大图标】、【详细信息】、【平铺列表】模式切换具备智能正反双向左右平滑滑入 (0.55s cubic-bezier 缓动与微模糊) 效果，呈现顶尖桌面软件的操作体验。

### 2. 多维度项目视图与经典看板排版
* **敏捷看板视图 (Kanban Board)**：
  * **4 列经典垂直看板布局**：包含【待办事项】、【进行中】、【审核/测试】、【已完成】4 个状态列，清晰聚焦当前任务流。
  * **卡片直接下拉选择优先级**：卡片与弹窗支持实时点击下拉框快速切换优先级（紧急/高/中/低），即时更新并持久化保存。
  * **各列独立控制显示方式**：每个状态列标题栏均自带【大图标】、【详细信息】、【平铺列表】独立切换按钮，各列风格互不干扰；顶栏提供全局一键同步控制。
  * **全量丰富卡片信息**：卡片完整呈现标题（无截断）、关联物理路径、快捷“打开方式”分拆按钮、优先级、标签、子任务完成进度与截止日期/逾期智能警示。
  * **自适应流畅垂直滚动**：基于 Flexbox 架构，确保多任务卡片时每列独立流畅滚动，不截断不遮挡。
* **甘特图时间线 (Gantt View)**：
  * 可视化项目计划与任务排期，支持按日、按周时间跨度缩放，任务时间一目了然。
* **数据统计仪表盘 (Stats Dashboard)**：
  * 直观呈现项目任务完成率、优先级分布、标签热度与工时进度图表。

### 3. 进度卡片悬浮明细面板 (Popover)
* **悬浮即览项目明细**：鼠标悬浮移入侧边栏底部【总完成进度】区域时，自动平滑弹出项目数据明细面板：
  * **4 列状态分布**（待办/进行中/测试/已完成具体项数）
  * **优先级分布概览**（紧急/高/中/低项数）
  * **全项目子任务完成比例**
  * **逾期未完成任务智能红字提醒**

### 4. 本地目录关联与唯一性防重扫描 (Win11 风格)
* **本地工作区关联**：支持一键关联本地代码项目或任意文件目录，优化紧凑垂直间距。
* **三种 Win11 格式视图模式**：
  1. **网格大图标模式 (Grid View)**
  2. **详细信息列表模式 (Details Table View)**
  3. **平铺卡片模式 (Tiles View)**
* **唯一性校验与智能移动**：支持将扫描到的文件或目录一键/拖拽导入看板，自动校验防重复创建；若文件已在其它列中，再次拖拽时会自动将其直接移动至释放的目标状态列。

### 5. 智能多程序“打开方式”系统 (OpenWithMenu)
* **一键快捷唤起**：
  * **系统默认程序**：一键在资源管理器中定位或用默认应用打开。
  * **VS Code**：直接在 VS Code 中打开代码项目或文件。
  * **CMD 命令行终端**：在当前目录下快速唤起终端。
  * **Office 文档软件**：智能感知 `.docx`, `.xlsx`, `.pptx`, `.pdf` 并唤起 Word, Excel, PowerPoint 或 WPS。
  * **系统记事本 (Notepad)**。
* **系统原生与外部程序浏览**：
  * **Windows 系统“打开方式”弹窗**：自动唤起 Windows 原生 `OpenWith.exe` 应用选择弹窗。
  * **浏览选择本地 .exe 程序**：可自由定位电脑上的任意第三方软件。

### 6. 自动提取 Icon & 同类型记录共享
* **Windows 原生 Icon 提取**：自动读取所选 `.exe` 程序的内置高清 Icon 标志（如 IntelliJ IDEA、PyCharm、Sublime Text 官方 Logo）。
* **官方产品名称解析**：自动解析程序版本信息（将 `idea64` 自动解析为 `IntelliJ IDEA`）。
* **同类型文件共享记忆**：为某个 `.py` 文件或文件夹选择关联程序后，全项目所有 `.py` 文件或文件夹自动共享该常用程序记录。
* **永久磁盘存储**：使用 Windows `AppData` 磁盘持久化存储（`custom-apps.json`），软件关闭或重启记录永不丢失。

### 7. 智能多源自动更新系统 (Auto Update System)
* **GitHub / Gitee Release 优先感知**：直接对接 GitHub 与 Gitee Latest Release 接口，精准获取最新 Release Tag 与 `.exe` 安装包资产，避免被 CDN 静态缓存影响。
* **应用内极速下载与自动覆盖安装**：支持在应用内直接下载最新安装包，实时展示下载 MB 与进度百分比，完成后自动启动安装向导并替换升级。
* **重构左右对齐布局与无白边视觉**：【应用设置】中的“软件更新”重构为左右端对齐布局；升级弹窗精致去白边，界面与主题浑然一体。

### 8. 数据备份与安全
* **JSON 一键备份与还原**：支持导出全量项目数据为 JSON 文件，随时导入恢复，数据完全掌控在自己手中。

---

## 技术栈

* **桌面容器**：Electron 33
* **前端框架**：React 18 + TypeScript
* **构建工具**：Vite 6 + Tailwind CSS
* **图标库**：Lucide React
* **打包工具**：Electron Packager (配以 `--ignore` 极速过滤规则)

---

## 快速启动与构建

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式运行 (React + Electron)
```bash
npm run electron:dev
```

### 3. 构建前端网页资源
```bash
npm run build
```

### 4. 极速打包为 Windows Desktop .exe 可执行文件 (3 秒完成)
```bash
npm run pack:exe
```
打包成功后，可在 `release/ProjectTools-win32-x64/` 目录下找到可独立运行的 `ProjectTools.exe` 文件。

---

## 开源许可

本项目基于 [MIT License](LICENSE) 开源许可。
