# ProjectTools - Local Project Management & Agile Kanban Application 🚀

[![Electron](https://img.shields.io/badge/Electron-v33.4-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**中文文档** | [English Version](./README_EN.md)

**ProjectTools** is a modern, high-aesthetic, fluid, and powerful **standalone desktop project management & agile Kanban application**. Built with **Electron + React + TypeScript + Tailwind CSS**, it is designed specifically for developers, project managers, and productivity enthusiasts. Operates 100% locally with zero cloud dependencies—your data stays completely private and secure.

---

## ✨ Features & Highlights

### 🎨 1. Modern Visual Design & Aesthetics
* **Native Dark / Light Theme Switching**: Supports system-following theme modes with a seamless transition and unified Windows Title Bar tinting.
* **Glassmorphic UI & Micro-animations**: Tailored HSL colors, polished typography, smooth hover effects, and crisp micro-interactions for a premium desktop feel.

### 📊 2. Multi-Dimensional Project Views
* **Agile Kanban Board**:
  * Customizable workflow columns (To Do, In Progress, Done, etc.) with drag-and-drop task card ordering and status transitions.
  * Rich task metadata: Priority levels (Urgent, High, Medium, Low), tags, subtask checklists, date ranges, and overdue alerts.
* **Gantt Chart Timeline**:
  * Visual timeline tracking with daily and weekly zoom modes for effortless project scheduling.
* **Statistical Dashboard**:
  * Real-time metrics on completion rates, priority distributions, tag analytics, and workload progress charts.

### 📂 3. Local Workspace Integration & Smart File Explorer (Win11 Style)
* **Local Folder Linking**: Associate local codebases or project directories directly with any project card.
* **Three Win11 View Modes**:
  1. **Grid View** (Large icons)
  2. **Details View** (Comprehensive file attribute table)
  3. **Tiles View** (Compact tile cards)
* **One-Click Task Conversion**: Easily convert scanned local files or directories into actionable Kanban tasks via drag-and-drop or single click.

### ⚡ 4. Intelligent "Open With" Menu System (`OpenWithMenu`)
* **Instant Launcher Menu**:
  * 📁 **System Default Application**: Open files or locate folders in File Explorer.
  * 💙 **VS Code**: Launch code repositories or single files directly in VS Code.
  * 💻 **CMD Terminal**: Open Windows Command Prompt directly in the project working directory.
  * 📄 **Office Applications**: Contextually detects `.docx`, `.xlsx`, `.pptx`, `.pdf` files to launch Word, Excel, PowerPoint, or WPS.
  * 📝 **Notepad**.
* **System Native & Custom EXE Picker**:
  * ⚙️ **Windows System "Open With" Modal**: Triggers native Windows `OpenWith.exe` selection dialog.
  * 📁 **Browse Custom Executables**: Select any third-party `.exe` software on your PC.

### 🧠 5. Native EXE Icon Extraction & Type-Based Memory Sync
* **Windows Native Icon Extraction**: Extracts high-definition native 3D icons embedded inside `.exe` executables (e.g. IntelliJ IDEA, PyCharm, Sublime Text logos).
* **Official Product Name Resolution**: Automatically resolves executable metadata (e.g., maps `idea64` to `IntelliJ IDEA`).
* **Shared Type Memory**: Associating a custom application with a `.py` file or folder automatically shares that application entry across ALL `.py` files or folders in your workspace!
* **Permanent Disk Persistence**: Stores user-configured applications permanently in Windows `AppData` (`custom-apps.json`). Custom app records persist across software restarts and reboots.

### 📥 6. Data Backup & Security
* **JSON Export & Import**: One-click backup and restore of all projects, tasks, and column configurations.

---

## 🛠️ Tech Stack

* **Desktop Framework**: Electron 33
* **Frontend Framework**: React 18 + TypeScript
* **Build System**: Vite 6 + Tailwind CSS
* **Icons**: Lucide React
* **Packager**: Electron Packager

---

## 🚀 Getting Started & Build Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server (React + Electron)
```bash
npm run electron:dev
```

### 3. Build Web Production Assets
```bash
npm run build
```

### 4. Package as Windows Desktop `.exe` Application
```bash
npm run pack:exe
```
Upon successful packaging, the standalone executable binary `ProjectTools.exe` will be generated in `release/ProjectTools-win32-x64/`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
