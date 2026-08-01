export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  subtasks: SubTask[];
  associatedPath?: string; // Associated local folder or file path for this task
  startDate?: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  dueDate?: string;   // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  createdAt: string;  // ISO timestamp
  updatedAt: string;  // ISO timestamp
  order: number;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  localFolderPath?: string; // Associated local folder on disk
  createdAt: string;
}

export interface LocalFileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  updatedAt: string;
  extension: string;
}

export interface CustomOpenApp {
  id: string;
  name: string;
  exePath: string;
  iconDataUrl?: string; // Native EXE icon as base64 PNG data URL
  forType?: string;     // Target file extension (e.g. "docx", "py", "pdf") or "folder"
}

export type ViewMode = 'kanban' | 'gantt' | 'stats';

export interface FilterState {
  searchQuery: string;
  priority: Priority | 'all';
  tag: string | 'all';
}

export interface BackupData {
  version: string;
  exportedAt: string;
  projects: Project[];
  tasks: Task[];
  columns: Column[];
}

declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>;
      openFolder: (path: string) => Promise<boolean>;
      readFolderContent: (path: string) => Promise<LocalFileItem[]>;
      openFile: (path: string) => Promise<boolean>;
      openWith: (path: string, appName: string, customExePath?: string) => Promise<{ success: boolean; exePath?: string; exeName?: string; iconDataUrl?: string }>;
      getCustomApps: () => Promise<CustomOpenApp[]>;
      saveCustomApps: (apps: CustomOpenApp[]) => Promise<boolean>;
      setTheme: (theme: 'dark' | 'light') => void;
      isPortable: () => Promise<boolean>;
      downloadAndInstallUpdate: (url: string) => Promise<{ success: boolean; error?: string }>;
      onUpdateProgress: (callback: (data: { receivedBytes: number; totalBytes: number; percent: number }) => void) => () => void;
      // Settings: custom download folder
      selectDownloadFolder: () => Promise<string | null>;
      saveBackupToPath: (payload: { content: string; fileName: string; customPath: string | null }) => Promise<{
        success: boolean;
        canceled?: boolean;
        error?: string;
        path?: string;
        usedCustomPath?: boolean;
      }>;
    };
  }
}
