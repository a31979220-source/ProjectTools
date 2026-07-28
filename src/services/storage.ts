import { Project, Task, Column, BackupData } from '../types/project';

const STORAGE_KEYS = {
  PROJECTS: 'pt_projects_v1',
  TASKS: 'pt_tasks_v1',
  COLUMNS: 'pt_columns_v1',
  ACTIVE_PROJECT: 'pt_active_project_v1',
  THEME: 'pt_theme_v1',
};

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: '待办事项', color: '#94a3b8', order: 0 },
  { id: 'in_progress', title: '进行中', color: '#3b82f6', order: 1 },
  { id: 'review', title: '审核/测试', color: '#f59e0b', order: 2 },
  { id: 'done', title: '已完成', color: '#10b981', order: 3 },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'ProjectTools 本地项目开发',
    description: '单机本地优先的现代桌面项目管理与看板系统',
    color: '#0c8de4',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    name: '个人工作与学习计划',
    description: '每日任务跟踪、日常读书清单与知识库梳理',
    color: '#8b5cf6',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    columnId: 'done',
    title: '初始化 Vite + React + TypeScript 架构',
    description: '构建前端现代脚手架，配置 Tailwind CSS 响应式主题与设计代号。',
    priority: 'high',
    tags: ['架构', '前端'],
    subtasks: [
      { id: 'st-1', title: '配置 package.json 依赖', completed: true },
      { id: 'st-2', title: '编写 Tailwind 配置文件', completed: true },
    ],
    startDate: '2026-07-20',
    dueDate: '2026-07-28',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: 0,
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    columnId: 'in_progress',
    title: '实现流畅拖拽看板与甘特图视图',
    description: '完成任务卡片跨状态列拖拽手感，支持甘特图时间线联动展示。',
    priority: 'urgent',
    tags: ['核心功能', 'UI组件'],
    subtasks: [
      { id: 'st-3', title: '实现拖拽状态变更监听', completed: true },
      { id: 'st-4', title: '计算甘特图时间线段与偏移', completed: false },
      { id: 'st-5', title: '完善卡片动画微交互', completed: false },
    ],
    startDate: '2026-07-25',
    dueDate: '2026-08-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    columnId: 'todo',
    title: '接入 本地 Local-First 数据导出与持久化',
    description: '提供一键 JSON 数据备份、导入恢复以及本地自动即时存储逻辑。',
    priority: 'medium',
    tags: ['数据层', '本地化'],
    subtasks: [
      { id: 'st-6', title: '编写 JSON export/import 逻辑', completed: false },
      { id: 'st-7', title: '增加导出恢复校验弹窗', completed: false },
    ],
    startDate: '2026-08-01',
    dueDate: '2026-08-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: 'task-4',
    projectId: 'proj-2',
    columnId: 'in_progress',
    title: '深度阅读《Rust 程序设计语言》第 5-8 章',
    description: '掌握 Rust 所有权机制、结构体方法与常用集合类型，为 Tauri 插件打基础。',
    priority: 'high',
    tags: ['学习', 'Rust'],
    subtasks: [
      { id: 'st-8', title: '阅读 Struct 与 Enum 章节', completed: true },
      { id: 'st-9', title: '练习 Option 和 Result 错误处理', completed: false },
    ],
    startDate: '2026-07-22',
    dueDate: '2026-07-30',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: 0,
  },
];

export class StorageService {
  // Load Projects
  static getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        this.saveProjects(INITIAL_PROJECTS);
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PROJECTS;
    }
  }

  static saveProjects(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  // Load Tasks
  static getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        this.saveTasks(INITIAL_TASKS);
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TASKS;
    }
  }

  static saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  // Active Project ID
  static getActiveProjectId(): string {
    const active = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
    if (active) return active;
    const projects = this.getProjects();
    return projects[0]?.id || 'proj-1';
  }

  static setActiveProjectId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
  }

  // Theme
  static getTheme(): 'dark' | 'light' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  static setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  // Load Columns
  static getColumns(): Column[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COLUMNS);
      if (!data) {
        this.saveColumns(DEFAULT_COLUMNS);
        return DEFAULT_COLUMNS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_COLUMNS;
    }
  }

  static saveColumns(columns: Column[]): void {
    localStorage.setItem(STORAGE_KEYS.COLUMNS, JSON.stringify(columns));
  }

  // Export Backup
  static exportBackup(): string {
    const backup: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      tasks: this.getTasks(),
      columns: DEFAULT_COLUMNS,
    };
    return JSON.stringify(backup, null, 2);
  }

  // Import Backup
  static importBackup(jsonString: string): boolean {
    try {
      const parsed: BackupData = JSON.parse(jsonString);
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
        this.saveProjects(parsed.projects);
        this.saveTasks(parsed.tasks);
        if (parsed.projects.length > 0) {
          this.setActiveProjectId(parsed.projects[0].id);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Reset to Factory Default
  static resetData(): void {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.COLUMNS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT);
  }
}
