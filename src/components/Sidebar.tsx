import React from 'react';
import { Project, Task, ViewMode } from '../types/project';
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
  PanelLeftOpen,
  TrendingUp,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  activeProjectTasks?: Task[];
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
  activeProjectTasks = [],
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
  // Statistics for Hover Detailed Information Popover
  const todoCount = activeProjectTasks.filter((t) => t.columnId === 'todo').length;
  const inProgressCount = activeProjectTasks.filter((t) => t.columnId === 'in_progress').length;
  const reviewCount = activeProjectTasks.filter((t) => t.columnId === 'review').length;
  const doneCount = activeProjectTasks.filter((t) => t.columnId === 'done').length;

  const urgentCount = activeProjectTasks.filter((t) => t.priority === 'urgent').length;
  const highCount = activeProjectTasks.filter((t) => t.priority === 'high').length;
  const mediumCount = activeProjectTasks.filter((t) => t.priority === 'medium').length;
  const lowCount = activeProjectTasks.filter((t) => t.priority === 'low').length;

  let totalSubtasks = 0;
  let completedSubtasks = 0;
  let overdueCount = 0;
  const todayMs = new Date().setHours(0, 0, 0, 0);

  activeProjectTasks.forEach((t) => {
    totalSubtasks += t.subtasks?.length || 0;
    completedSubtasks += t.subtasks?.filter((st) => st.completed).length || 0;
    if (t.dueDate && new Date(t.dueDate).getTime() < todayMs && t.columnId !== 'done') {
      overdueCount += 1;
    }
  });

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 relative z-30 select-none`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0 overflow-hidden">
            <img src={appLogo} alt="ProjectTools" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                ProjectTools
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                v1.0.0 • 本地桌面版
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800">
        <nav className="space-y-1">
          {[
            { id: 'kanban' as ViewMode, label: '看板视图 (Kanban)', icon: Kanban },
            { id: 'gantt' as ViewMode, label: '甘特图视图 (Timeline)', icon: BarChart3 },
            { id: 'stats' as ViewMode, label: '数据统计与概览', icon: PieChart },
          ].map(({ id, label, icon: Icon }) => {
            const isActive = viewMode === id;
            return (
              <button
                key={id}
                onClick={() => onSelectViewMode(id)}
                title={label}
                className={`relative w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                } py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 ease-out active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/15 via-brand-500/10 to-indigo-500/10 dark:from-brand-500/25 dark:to-indigo-500/15 text-brand-600 dark:text-brand-300 border-brand-500/35 dark:border-brand-500/40 font-semibold shadow-sm shadow-brand-500/10'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500 shadow-sm shadow-brand-500/50" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-brand-500 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
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
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color }}
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
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`确定删除项目 "${proj.name}" 及其所有任务卡片吗？`)) {
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

      {/* Progress Card with Detailed Information Hover Popover */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40 shrink-0 relative group/progress">
          {/* Detailed Progress Popover on Hover */}
          <div className="absolute bottom-full left-3 right-3 mb-2 opacity-0 pointer-events-none group-hover/progress:opacity-100 group-hover/progress:pointer-events-auto transition-all duration-200 ease-out z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 shadow-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-500" /> 项目进度与统计明细
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-bold border border-brand-500/20">
                {totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100)}% 完成
              </span>
            </div>

            {/* 4 Column Task Distribution */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                看板状态列分布
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> 待办事项
                  </span>
                  <span className="font-bold font-mono text-[11px]">{todoCount}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> 进行中
                  </span>
                  <span className="font-bold font-mono text-[11px]">{inProgressCount}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> 审核/测试
                  </span>
                  <span className="font-bold font-mono text-[11px]">{reviewCount}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> 已完成
                  </span>
                  <span className="font-bold font-mono text-[11px]">{doneCount}</span>
                </div>
              </div>
            </div>

            {/* Priority Distribution */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                任务优先级概览
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 p-1 rounded-lg">
                  <div className="font-bold">紧急</div>
                  <div className="font-mono text-xs">{urgentCount}</div>
                </div>
                <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 p-1 rounded-lg">
                  <div className="font-bold">高</div>
                  <div className="font-mono text-xs">{highCount}</div>
                </div>
                <div className="bg-blue-500/10 text-blue-500 border border-blue-500/20 p-1 rounded-lg">
                  <div className="font-bold">中</div>
                  <div className="font-mono text-xs">{mediumCount}</div>
                </div>
                <div className="bg-slate-500/10 text-slate-400 border border-slate-500/20 p-1 rounded-lg">
                  <div className="font-bold">低</div>
                  <div className="font-mono text-xs">{lowCount}</div>
                </div>
              </div>
            </div>

            {/* Subtasks Progress & Overdue Warnings */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                <CheckSquare className="w-3.5 h-3.5 text-brand-500" /> 子任务: {completedSubtasks}/{totalSubtasks}
              </span>
              {overdueCount > 0 ? (
                <span className="flex items-center gap-1 text-rose-500 font-bold animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> 逾期 {overdueCount} 项
                </span>
              ) : (
                <span className="text-[10px] text-emerald-500 font-semibold">无逾期任务</span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 shadow-sm cursor-pointer hover:border-brand-500/50 transition-all">
            <div className="flex items-center justify-between text-xs mb-1.5 text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
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
