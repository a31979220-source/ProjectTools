# ProjectTools - Local Project Management & Agile Kanban Application

[![Electron](https://img.shields.io/badge/Electron-v33.4-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[中文文档](./README.md) | **English Version**

**ProjectTools** is a modern, high-aesthetic, fluid, and powerful **standalone desktop project management & agile Kanban application**. Built with **Electron + React + TypeScript + Tailwind CSS**, it is designed specifically for developers, project managers, and productivity enthusiasts. Operates 100% locally with zero cloud dependencies—your data stays completely private and secure.

---

## Features & Highlights

### 1. Modern Visual Design & Smooth Directional Slide Animations
* **Native Dark / Light Theme Toggle**: Supports system theme matching or smooth one-click manual toggling. Windows title bar seamlessly integrates with dark theme.
* **High-Aesthetic UI & Directional Slide Animations**: Built with a glassmorphic color system and smooth keyframe micro-animations. Switching between **Grid**, **Details**, and **Tiles** views features smart bidirectional horizontal slide-in animations (0.55s smooth cubic-bezier easing with subtle blur fade-in).

### 2. Multi-Dimensional Project Views & Classic Kanban Layout
* **Agile Kanban Board**:
  * **Classic 4-Column Vertical Layout**: Fixed 4-column view (Todo, In Progress, Review, Done) for focused task flow management.
  * **Direct Interactive Priority Dropdown**: Change task priority (Urgent, High, Medium, Low) directly from cards or modals via interactive dropdown select buttons.
  * **Independent Per-Column Display Modes**: Switch each column's card layout independently between **Grid Card**, **Compact Details**, and **Tiles View**, with a top master control bar for batch switching.
  * **Rich Task Card Details**: Displays full un-truncated titles, associated file paths, split "Open With" buttons, priority badges, tags, subtask progress, and due dates/overdue alerts.
  * **Adaptive Fluid Vertical Scrolling**: Flexbox-driven column containers enable independent smooth scrolling without layout overflow or truncation.
* **Gantt Chart Timeline**:
  * Visual project scheduling with daily and weekly timeline zoom controls.
* **Statistics & Analytics Dashboard**:
  * Charts for completion rates, priority distribution, tag heatmaps, and work progress.

### 3. Hover Progress Detail Popover Panel
* **Instant Hover Insights**: Hover over the bottom progress widget in the sidebar to reveal a popover panel with real-time project metrics:
  * **4-Column Task Distribution** (Todo, In Progress, Review, Done item counts)
  * **Priority Breakdown** (Urgent, High, Medium, Low counts)
  * **Subtasks Completion Ratio**
  * **Overdue Task Warning Alerts**

### 4. Workspace Directory Association & Smart Unique Import (Win11 Style)
* **Local Workspace Association**: Link local code projects or file directories with one click, featuring compact vertical spacing.
* **3 Win11 View Modes**:
  1. **Grid Icon View**
  2. **Details Table View**
  3. **Tiles View**
* **Deduplication Check & Smart Auto-Move**: Drag files onto Kanban columns with automatic deduplication. If a file was previously imported into another column, dragging it automatically moves the existing task card to the target column instead of creating duplicates.

### 5. Smart "Open With" Application System (OpenWithMenu)
* **Quick Launch**:
  * **System Default Application**: Locate file in Explorer or open with system default app.
  * **VS Code**: Open file or project directory directly in VS Code.
  * **CMD Terminal**: Launch command prompt inside the folder.
  * **Office Apps**: Smart detection for `.docx`, `.xlsx`, `.pptx`, `.pdf` to launch Word, Excel, PowerPoint, or WPS.
  * **System Notepad**.
* **System Native & Custom Binary Browsing**:
  * **Windows "Open With" Dialog**: Triggers native Windows `OpenWith.exe` app picker.
  * **Browse .exe Files**: Select any custom binary executable on disk.

### 6. Native Icon Extraction & Shared File Type Memory
* **Windows Native Icon Extraction**: Extracts embedded high-resolution icons from `.exe` files (e.g., IntelliJ IDEA, PyCharm, Sublime Text).
* **Official Product Name Resolution**: Parses version info (e.g., resolves `idea64` to `IntelliJ IDEA`).
* **Shared File Type Memory**: Custom app associations for `.py` or folder items are automatically shared across all matching files in the workspace.
* **Disk Storage Persistence**: Uses Windows `AppData` disk storage (`custom-apps.json`) to persist entries permanently across app restarts.

### 7. Smart Multi-Source Auto-Update System (Auto Update)
* **GitHub / Gitee Release API Integration**: Connects directly to GitHub and Gitee Latest Release APIs to fetch the latest Tag (e.g., `v1.1.3`) and binary `.exe` installer assets without CDN cache delay.
* **In-App Direct Download & Auto-Installer**: Supports downloading updates directly inside the desktop application with a real-time progress bar, automatically launching the installer upon completion.
* **Refined Compact Layout & Borderless Modal UI**: Side-by-side update status layout in Settings and white-border-free upgrade dialogs for clean visual unity.

### 8. Backup & Data Security
* **JSON Backup & Restore**: Export full project data to JSON files and restore at any time.

---

## Tech Stack

* **Desktop Container**: Electron 33
* **Frontend**: React 18 + TypeScript
* **Build Tools**: Vite 6 + Tailwind CSS
* **Icon Library**: Lucide React
* **Packaging**: Electron Packager (with `--ignore` rule for instant packaging)

---

## Quick Start & Build

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run electron:dev
```

### 3. Build Web Assets
```bash
npm run build
```

### 4. Package as Windows Desktop .exe (Instant 3-Second Packaging)
```bash
npm run pack:exe
```
After packaging, find the standalone `ProjectTools.exe` inside `release/ProjectTools-win32-x64/`.

---

## License

This project is licensed under the [MIT License](LICENSE).
