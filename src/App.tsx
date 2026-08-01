import React, { useState, useEffect } from 'react';
import { Project, Task, Column, Priority, FilterState, LocalFileItem } from './types/project';
import { StorageService } from './services/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { GanttView } from './components/GanttView';
import { StatsView } from './components/StatsView';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { VersionModal } from './components/VersionModal';
import { Toast, ToastType } from './components/Toast';
import { checkRemoteUpdate, UpdateCheckResult } from './config/version';

const DOWNLOAD_PATH_STORAGE_KEY = 'app_download_path';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt' | 'stats'>('kanban');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [downloadPath, setDownloadPath] = useState<string>('');

  // Filter & Search State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
    tag: 'all',
  });

  // Local Folder Integration State
  const [localFiles, setLocalFiles] = useState<LocalFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Sidebar Collapse & Width State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskColumnId, setDefaultTaskColumnId] = useState('todo');
  const [taskModalTriggerPos, setTaskModalTriggerPos] = useState<{ x: number; y: number } | null>(null);

  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [updateCheckResult, setUpdateCheckResult] = useState<UpdateCheckResult | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Toast Global State
  const [toastState, setToastState] = useState<{ isOpen: boolean; message: string; type: ToastType }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToastState({ isOpen: true, message, type });
  };

  const handleOpenTaskModal = (e?: React.MouseEvent, columnId: string = 'todo') => {
    if (e) {
      setTaskModalTriggerPos({ x: e.clientX, y: e.clientY });
    } else {
      setTaskModalTriggerPos(null);
    }
    setEditingTask(null);
    setDefaultTaskColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTaskModal = (task: Task, e?: React.MouseEvent) => {
    if (e) {
      setTaskModalTriggerPos({ x: e.clientX, y: e.clientY });
    } else {
      setTaskModalTriggerPos(null);
    }
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Initial Load
  useEffect(() => {
    const loadedProjects = StorageService.getProjects();
    const loadedTasks = StorageService.getTasks();
    const loadedColumns = StorageService.getColumns();
    const loadedActiveProjectId = StorageService.getActiveProjectId();
    const savedTheme = (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
    const savedViewMode = (localStorage.getItem('app_view_mode') as 'kanban' | 'gantt' | 'stats') || 'kanban';
    const savedSidebarCollapsed = localStorage.getItem('app_sidebar_collapsed') === 'true';
    const savedDownloadPath = localStorage.getItem(DOWNLOAD_PATH_STORAGE_KEY) || '';

    const savedSidebarWidth = parseInt(localStorage.getItem('app_sidebar_width') || '256', 10);
    if (!isNaN(savedSidebarWidth) && savedSidebarWidth >= 180 && savedSidebarWidth <= 480) {
      setSidebarWidth(savedSidebarWidth);
    }

    setProjects(loadedProjects);
    setTasks(loadedTasks);
    setColumns(loadedColumns);
    setActiveProjectId(loadedActiveProjectId || (loadedProjects[0]?.id ?? ''));
    setTheme(savedTheme);
    setViewMode(savedViewMode);
    setIsSidebarCollapsed(savedSidebarCollapsed);
    setDownloadPath(savedDownloadPath);

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Sync Local Folder Files when Active Project changes
  useEffect(() => {
    fetchLocalFolderFiles();
  }, [activeProjectId, projects]);

  const fetchLocalFolderFiles = async () => {
    const currentProj = projects.find((p) => p.id === activeProjectId);
    if (!currentProj || !currentProj.localFolderPath) {
      setLocalFiles([]);
      return;
    }

    if (window.electronAPI?.readFolderContent) {
      setIsLoadingFiles(true);
      try {
        const files = await window.electronAPI.readFolderContent(currentProj.localFolderPath);
        setLocalFiles(files);
      } catch (err) {
        console.error('读取本地目录失败:', err);
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };

  // Sync state changes with StorageService
  const handleSaveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    StorageService.saveProjects(newProjects);
  };

  const handleSaveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const handleSaveColumns = (newColumns: Column[]) => {
    setColumns(newColumns);
    StorageService.saveColumns(newColumns);
  };

  const handleReorderColumns = (newColumns: Column[]) => {
    handleSaveColumns(newColumns);
    showToast('看板列顺序配置已保存', 'success');
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    StorageService.setActiveProjectId(id);
  };

  const handleSelectViewMode = (mode: 'kanban' | 'gantt' | 'stats') => {
    setViewMode(mode);
    localStorage.setItem('app_view_mode', mode);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleSidebarCollapse = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('app_sidebar_collapsed', String(nextState));
  };

  const handleSidebarWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('app_sidebar_width', String(newWidth));
  };

  const handleChangeDownloadPath = (newPath: string) => {
    setDownloadPath(newPath);
    if (newPath) {
      localStorage.setItem(DOWNLOAD_PATH_STORAGE_KEY, newPath);
    } else {
      localStorage.removeItem(DOWNLOAD_PATH_STORAGE_KEY);
    }
  };

  // Centralized "check for update" handler reused by SettingsModal + future triggers
  const handleCheckUpdate = async (): Promise<UpdateCheckResult | null> => {
    try {
      const result = await checkRemoteUpdate();
      setUpdateCheckResult(result);
      if (!result.error && result.hasUpdate) {
        setIsSettingsModalOpen(false);
        setIsUpdateModalOpen(true);
      }
      return result;
    } catch (e) {
      const errResult: UpdateCheckResult = {
        hasUpdate: false,
        currentVersion: '',
        remoteVersion: '',
        error: '检查更新失败，请重试',
      };
      setUpdateCheckResult(errResult);
      return errResult;
    }
  };

  // Filter Tasks by Active Project and Filter Controls
  const activeProjectTasks = tasks.filter((t) => t.projectId === activeProjectId);
  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Collect available tags across active project tasks
  const availableTags = Array.from(
    new Set(activeProjectTasks.flatMap((t) => t.tags || []))
  );

  const filteredTasks = activeProjectTasks.filter((task) => {
    // 1. Search Query
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q) || false;
      const matchTags = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // 2. Tag Filter
    if (filterState.tag !== 'all') {
      if (!task.tags?.includes(filterState.tag)) return false;
    }

    // 3. Priority Filter
    if (filterState.priority !== 'all') {
      if (task.priority !== filterState.priority) return false;
    }

    return true;
  });

  // Task Operations
  const handleMoveTask = (taskId: string, targetColumnId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          columnId: targetColumnId,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    handleSaveTasks(updated);
  };

  const handleChangeTaskPriority = (taskId: string, priority: Priority) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          priority,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    handleSaveTasks(updated);
  };

  const handleUpdateTaskDates = (taskId: string, startDate?: string, dueDate?: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          startDate,
          dueDate,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    handleSaveTasks(updated);
    if (targetTask) {
      showToast(`已更新 "${targetTask.title}" 的起止时间`, 'success');
    }
  };

  const handleSaveTaskData = (taskData: Partial<Task>) => {
    if (taskData.id) {
      const updated = tasks.map((t) =>
        t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t
      );
      handleSaveTasks(updated);
      showToast(`任务 "${taskData.title}" 已保存`, 'success');
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        projectId: activeProjectId,
        columnId: taskData.columnId || 'todo',
        title: taskData.title || '无标题任务',
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        startDate: taskData.startDate,
        dueDate: taskData.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: tasks.filter((t) => t.columnId === (taskData.columnId || 'todo')).length,
      };
      handleSaveTasks([...tasks, newTask]);
      showToast(`任务 "${newTask.title}" 创建成功`, 'success');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const deletedTask = tasks.find((t) => t.id === taskId);
    const updated = tasks.filter((t) => t.id !== taskId);
    handleSaveTasks(updated);
    if (deletedTask) {
      showToast(`已成功删除任务 "${deletedTask.title}"`, 'success');
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    handleSaveTasks(updated);
  };

  // Convert a local file item to a task card in a specific column with deduplication
  const handleImportFileAsTask = (file: LocalFileItem, targetColumnId: string = 'todo') => {
    const existingTask = tasks.find(
      (t) =>
        t.projectId === activeProjectId &&
        ((t.associatedPath && t.associatedPath.toLowerCase() === file.path.toLowerCase()) ||
          t.title === `${file.isDirectory ? '📁 文件夹' : '📄 文件'}: ${file.name}`)
    );

    if (existingTask) {
      if (existingTask.columnId !== targetColumnId) {
        handleMoveTask(existingTask.id, targetColumnId);
      } else {
        const colName = columns.find((c) => c.id === targetColumnId)?.title || '当前列';
        showToast(`该文件/目录「${file.name}」已存在于看板「${colName}」中`, 'info');
      }
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId: activeProjectId,
      columnId: targetColumnId,
      title: `${file.isDirectory ? '📁 文件夹' : '📄 文件'}: ${file.name}`,
      description: `从本地扫描导入关联`,
      associatedPath: file.path,
      priority: 'medium',
      tags: ['本地文件', file.isDirectory ? '目录' : file.extension.toUpperCase() || '文件'],
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: tasks.filter((t) => t.columnId === targetColumnId).length,
    };
    handleSaveTasks([...tasks, newTask]);
    showToast(`关联任务 "${file.name}" 创建成功`, 'success');
  };

  // Project Operations
  const handleSaveProjectData = (projectData: Partial<Project>) => {
    if (projectData.id) {
      const updated = projects.map((p) =>
        p.id === projectData.id ? ({ ...p, ...projectData } as Project) : p
      );
      handleSaveProjects(updated);
      showToast(`项目 "${projectData.name}" 更新成功`, 'success');
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: projectData.name || '未命名项目',
        description: projectData.description || '',
        color: projectData.color || '#0c8de4',
        localFolderPath: projectData.localFolderPath,
        createdAt: new Date().toISOString(),
      };
      const updated = [...projects, newProj];
      handleSaveProjects(updated);
      handleSelectProject(newProj.id);
      showToast(`项目 "${newProj.name}" 创建成功`, 'success');
    }
  };

  const handleDeleteProject = (projId: string) => {
    const deletedProj = projects.find((p) => p.id === projId);
    const updatedProjects = projects.filter((p) => p.id !== projId);
    const updatedTasks = tasks.filter((t) => t.projectId !== projId);
    handleSaveProjects(updatedProjects);
    handleSaveTasks(updatedTasks);
    if (activeProjectId === projId && updatedProjects.length > 0) {
      handleSelectProject(updatedProjects[0].id);
    }
    if (deletedProj) {
      showToast(`已成功删除项目 "${deletedProj.name}"`, 'success');
    }
  };

  // Export / Import Backup Handlers
  const handleExportBackup = async () => {
    const jsonStr = StorageService.exportBackup();
    const fileName = `projecttools_backup_${new Date().toISOString().slice(0, 10)}.json`;

    // Prefer Electron + custom download folder when available
    if (window.electronAPI?.saveBackupToPath) {
      try {
        const res = await window.electronAPI.saveBackupToPath({
          content: jsonStr,
          fileName,
          customPath: downloadPath || null,
        });
        if (res?.success) {
          showToast(`已保存备份到: ${res.path}`, 'success');
        } else if (res?.canceled) {
          // User cancelled the save dialog — no toast needed
        } else if (res?.error) {
          showToast(`保存失败: ${res.error}，已回退到浏览器下载`, 'danger');
          fallbackBrowserDownload(jsonStr, fileName);
        }
        return;
      } catch (err) {
        console.error('saveBackupToPath failed, fallback to browser download:', err);
      }
    }

    // Fallback: browser default download
    fallbackBrowserDownload(jsonStr, fileName);
  };

  const fallbackBrowserDownload = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON 数据备份导出成功', 'success');
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (StorageService.importBackup(content)) {
            setProjects(StorageService.getProjects());
            setTasks(StorageService.getTasks());
            setActiveProjectId(StorageService.getActiveProjectId());
            showToast('成功从 JSON 备份文件恢复数据！', 'success');
          } else {
            showToast('文件校验失败，格式不合规或已被损坏。', 'danger');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetData = () => {
    StorageService.resetData();
    setProjects(StorageService.getProjects());
    setTasks(StorageService.getTasks());
    setActiveProjectId(StorageService.getActiveProjectId());
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        activeProjectTasks={activeProjectTasks}
        onSelectProject={handleSelectProject}
        onOpenNewProjectModal={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onOpenEditProjectModal={(project) => {
          setEditingProject(project);
          setIsProjectModalOpen(true);
        }}
        onDeleteProject={handleDeleteProject}
        viewMode={viewMode}
        onSelectViewMode={handleSelectViewMode}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        totalTasksCount={activeProjectTasks.length}
        completedTasksCount={activeProjectTasks.filter((t) => t.columnId === 'done').length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={handleSidebarWidthChange}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenVersionModal={() => setIsUpdateModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header
          activeProject={activeProject}
          filterState={filterState}
          onUpdateFilter={(update) => setFilterState((prev) => ({ ...prev, ...update }))}
          availableTags={availableTags}
          onOpenNewTaskModal={(e) => handleOpenTaskModal(e)}
          onEditProjectModal={() => {
            if (activeProject) {
              setEditingProject(activeProject);
              setIsProjectModalOpen(true);
            }
          }}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-hidden relative">
          <div
            key={`${activeProjectId}-${viewMode}`}
            className="w-full h-full animate-view-slide-up"
          >
            {viewMode === 'kanban' && (
              <KanbanBoard
                columns={columns}
                tasks={filteredTasks}
                localFolderPath={activeProject?.localFolderPath}
                localFiles={localFiles}
                isLoadingFiles={isLoadingFiles}
                onRefreshFiles={fetchLocalFolderFiles}
                onMoveTask={handleMoveTask}
                onEditTask={(task, e) => handleEditTaskModal(task, e)}
                onDeleteTask={handleDeleteTask}
                onChangeTaskPriority={handleChangeTaskPriority}
                onToggleSubtask={handleToggleSubtask}
                onOpenNewTaskModalForColumn={(colId, e) => handleOpenTaskModal(e, colId)}
                onOpenEditProjectModal={() => {
                  if (activeProject) {
                    setEditingProject(activeProject);
                    setIsProjectModalOpen(true);
                  }
                }}
                onImportFileAsTask={handleImportFileAsTask}
                onReorderColumns={handleReorderColumns}
              />
            )}

            {viewMode === 'gantt' && (
              <GanttView
                tasks={filteredTasks}
                columns={columns}
                onEditTask={(task) => handleEditTaskModal(task)}
                onUpdateTaskDates={handleUpdateTaskDates}
              />
            )}

            {viewMode === 'stats' && (
              <StatsView tasks={activeProjectTasks} columns={columns} />
            )}
          </div>
        </main>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTaskData}
        initialTask={editingTask}
        columns={columns}
        defaultColumnId={defaultTaskColumnId}
        projectId={activeProjectId}
        localFiles={localFiles}
        localFolderPath={activeProject?.localFolderPath}
        triggerPosition={taskModalTriggerPos}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProjectData}
        initialProject={editingProject}
      />

      {/* Settings Modal (主题、自选下载路径、检查更新) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        downloadPath={downloadPath}
        onChangeDownloadPath={handleChangeDownloadPath}
        onShowToast={showToast}
        onCheckUpdate={handleCheckUpdate}
        updateResult={updateCheckResult}
      />

      {/* App Version / Update Modal */}
      <VersionModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateResult={updateCheckResult}
      />

      {/* Global Toast Notification */}
      <Toast
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={() => setToastState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
