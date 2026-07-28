import React, { useEffect } from 'react';
import { Project, ViewMode } from '../types/project';
import appLogo from '../assets/app-icon.png';
import { 
  Kanban, 
  BarChart3, 
  PieChart, 
  FolderPlus, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  HardDrive,
  CheckCircle2,
  Trash2,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetData?: () => void;
  totalTasksCount: number;
  completedTasksCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenEditProjectModal,
  onDeleteProject,
  viewMode,
  onSelectViewMode,
  theme,
  onToggleTheme,
  onExportBackup,
  onImportBackup,
  totalTasksCount,
  completedTasksCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Listen for Ctrl+B shortcut to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        onToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse]);

  return (
    <aside
      className={`h-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex flex-col border-r border-slate-200 dark:border-slate-800 select-none transition-all duration-300 ease-in-out shrink-0 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle Button */}
      <div className="p-3.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={appLogo}
            alt="ProjectTools Logo"
            className="w-9 h-9 rounded-xl object-cover shadow-md border border-slate-200 dark:border-slate-700/80 shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0 animate-fadeIn">
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug tracking-wide truncate">
                ProjectTools
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">单机版项目管理</p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? '展开侧边栏 (Ctrl+B)' : '折叠侧边栏 (Ctrl+B)'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Views */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
        {!isCollapsed && (
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">
            视图模式
          </div>
        )}
        <nav className="space-y-1">
          <button
            onClick={() => onSelectViewMode('kanban')}
            title="看板视图 (Kanban)"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium border transition-colors duration-150 ${
              viewMode === 'kanban'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30 dark:border-brand-500/40 font-semibold shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Kanban className="w-4 h-4 shrink-0 text-brand-500" />
            {!isCollapsed && <span className="truncate">看板视图 (Kanban)</span>}
          </button>

          <button
            onClick={() => onSelectViewMode('gantt')}
            title="甘特图视图 (Timeline)"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium border transition-colors duration-150 ${
              viewMode === 'gantt'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30 dark:border-brand-500/40 font-semibold shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0 text-brand-500" />
            {!isCollapsed && <span className="truncate">甘特图视图 (Timeline)</span>}
          </button>

          <button
            onClick={() => onSelectViewMode('stats')}
            title="数据统计与概览"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-medium border transition-colors duration-150 ${
              viewMode === 'stats'
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30 dark:border-brand-500/40 font-semibold shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4 shrink-0 text-brand-500" />
            {!isCollapsed && <span className="truncate">数据统计与概览</span>}
          </button>
        </nav>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2 px-1`}>
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
              我的项目 ({projects.length})
            </span>
          )}
          <button
            onClick={onOpenNewProjectModal}
            title="新建项目"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                title={proj.name}
                className={`group flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} rounded-xl text-xs font-medium cursor-pointer border transition-colors duration-150 ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 shadow-sm font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color || '#3b82f6' }}
                  />
                  {!isCollapsed && <span className="truncate">{proj.name}</span>}
                </div>

                {!isCollapsed && (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditProjectModal(proj);
                      }}
                      title="编辑项目"
                      className="p-1 text-slate-400 hover:text-brand-500 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定要删除项目 "${proj.name}" 及其所有关联任务吗？`)) {
                            onDeleteProject(proj.id);
                          }
                        }}
                        title="删除项目"
                        className="p-1 text-slate-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Card */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40 shrink-0">
          <div className="bg-white dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1.5 text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> 总完成进度
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-200">
                {totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100}%`,
                }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
              <span>已完成: {completedTasksCount}</span>
              <span>总计: {totalTasksCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings & Persistence Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" /> 本地化存储
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] border border-emerald-300 dark:border-emerald-800/50 font-semibold">
              100% 离线
            </span>
          </div>
        )}

        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={onExportBackup}
              title="导出 JSON 备份"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onImportBackup}
              title="导入 JSON 恢复"
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? '浅色模式' : '深色模式'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={onExportBackup}
                title="导出 JSON 备份"
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" /> 导出备份
              </button>

              <button
                onClick={onImportBackup}
                title="导入 JSON 恢复"
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5" /> 导入数据
              </button>
            </div>

            <div className="pt-1">
              <button
                onClick={onToggleTheme}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition"
              >
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                  <span>{theme === 'dark' ? '切换浅色模式' : '切换深色模式'}</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
