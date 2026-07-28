import { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, Task, Column, ViewMode, FilterState, LocalFileItem } from './types/project';
import { StorageService, DEFAULT_COLUMNS } from './services/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { GanttView } from './components/GanttView';
import { StatsView } from './components/StatsView';
import { TaskModal } from './components/TaskModal';
import { ProjectModal } from './components/ProjectModal';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns] = useState<Column[]>(DEFAULT_COLUMNS);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pt_sidebar_collapsed_v1') === 'true';
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('pt_sidebar_collapsed_v1', String(next));
      return next;
    });
  };

  // Local folder content states
  const [localFiles, setLocalFiles] = useState<LocalFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskColumnId, setDefaultTaskColumnId] = useState('todo');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Filters
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    priority: 'all',
    tag: 'all',
  });

  // Initialize Data on Load
  useEffect(() => {
    const loadedProjects = StorageService.getProjects();
    const loadedTasks = StorageService.getTasks();
    const loadedActiveId = StorageService.getActiveProjectId();
    const loadedTheme = StorageService.getTheme();

    setProjects(loadedProjects);
    setTasks(loadedTasks);
    setActiveProjectId(loadedActiveId || loadedProjects[0]?.id || '');
    setTheme(loadedTheme);

    // Apply dark class to html document and sync native title bar color immediately on startup
    if (loadedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (window.electronAPI?.setTheme) {
      window.electronAPI.setTheme(loadedTheme);
    }
  }, []);

  // Active Project Data
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  // Read Local Folder Content when active project changes or localFolderPath changes
  const fetchLocalFolderFiles = useCallback(async () => {
    if (activeProject?.localFolderPath && window.electronAPI?.readFolderContent) {
      setIsLoadingFiles(true);
      try {
        const files = await window.electronAPI.readFolderContent(activeProject.localFolderPath);
        setLocalFiles(files);
      } catch (err) {
        console.error('Failed to read local folder files:', err);
        setLocalFiles([]);
      } finally {
        setIsLoadingFiles(false);
      }
    } else {
      setLocalFiles([]);
    }
  }, [activeProject?.localFolderPath]);

  useEffect(() => {
    fetchLocalFolderFiles();
  }, [fetchLocalFolderFiles]);

  // Sync state changes to storage
  const handleSaveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    StorageService.saveProjects(newProjects);
  };

  const handleSaveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (window.electronAPI?.setTheme) {
      window.electronAPI.setTheme(nextTheme);
    }
  };

  // Select Active Project
  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    StorageService.setActiveProjectId(id);
  };

  // Active Project Tasks
  const activeProjectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === activeProjectId),
    [tasks, activeProjectId]
  );

  // Available Tags for Filter
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    activeProjectTasks.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [activeProjectTasks]);

  // Filtered Tasks for Rendering
  const filteredTasks = useMemo(() => {
    return activeProjectTasks.filter((t) => {
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      if (filterState.priority !== 'all' && t.priority !== filterState.priority) {
        return false;
      }

      if (filterState.tag !== 'all' && !t.tags.includes(filterState.tag)) {
        return false;
      }

      return true;
    });
  }, [activeProjectTasks, filterState]);

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

  const handleSaveTaskData = (taskData: Partial<Task>) => {
    if (taskData.id) {
      const updated = tasks.map((t) =>
        t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t
      );
      handleSaveTasks(updated);
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
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    handleSaveTasks(updated);
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

  // Convert a local file item to a task card in a specific column
  const handleImportFileAsTask = (file: LocalFileItem, targetColumnId: string = 'todo') => {
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
  };

  // Project Operations
  const handleSaveProjectData = (projectData: Partial<Project>) => {
    if (projectData.id) {
      const updated = projects.map((p) =>
        p.id === projectData.id ? ({ ...p, ...projectData } as Project) : p
      );
      handleSaveProjects(updated);
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
    }
  };

  const handleDeleteProject = (projId: string) => {
    const updatedProjects = projects.filter((p) => p.id !== projId);
    const updatedTasks = tasks.filter((t) => t.projectId !== projId);
    handleSaveProjects(updatedProjects);
    handleSaveTasks(updatedTasks);
    if (activeProjectId === projId && updatedProjects.length > 0) {
      handleSelectProject(updatedProjects[0].id);
    }
  };

  // Export / Import Backup Handlers
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projecttools_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            alert('成功从 JSON 备份文件恢复数据！');
          } else {
            alert('文件校验失败，格式不合规或已被损坏。');
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
        onSelectViewMode={setViewMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        totalTasksCount={activeProjectTasks.length}
        completedTasksCount={activeProjectTasks.filter((t) => t.columnId === 'done').length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <Header
          activeProject={activeProject}
          filterState={filterState}
          onUpdateFilter={(update) => setFilterState((prev) => ({ ...prev, ...update }))}
          availableTags={availableTags}
          onOpenNewTaskModal={() => {
            setEditingTask(null);
            setDefaultTaskColumnId('todo');
            setIsTaskModalOpen(true);
          }}
          onEditProjectModal={() => {
            if (activeProject) {
              setEditingProject(activeProject);
              setIsProjectModalOpen(true);
            }
          }}
        />

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-hidden relative">
          {viewMode === 'kanban' && (
            <KanbanBoard
              columns={columns}
              tasks={filteredTasks}
              localFolderPath={activeProject?.localFolderPath}
              localFiles={localFiles}
              isLoadingFiles={isLoadingFiles}
              onRefreshFiles={fetchLocalFolderFiles}
              onMoveTask={handleMoveTask}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onToggleSubtask={handleToggleSubtask}
              onOpenNewTaskModalForColumn={(colId) => {
                setEditingTask(null);
                setDefaultTaskColumnId(colId);
                setIsTaskModalOpen(true);
              }}
              onOpenEditProjectModal={() => {
                if (activeProject) {
                  setEditingProject(activeProject);
                  setIsProjectModalOpen(true);
                }
              }}
              onImportFileAsTask={handleImportFileAsTask}
            />
          )}

          {viewMode === 'gantt' && (
            <GanttView
              tasks={filteredTasks}
              columns={columns}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {viewMode === 'stats' && (
            <StatsView tasks={activeProjectTasks} columns={columns} />
          )}
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
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProjectData}
        initialProject={editingProject}
      />
    </div>
  );
}
