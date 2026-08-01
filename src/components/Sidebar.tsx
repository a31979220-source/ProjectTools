import React, { useState } from 'react';
import { Project, Task, ViewMode } from '../types/project';
import { ConfirmModal } from './ConfirmModal';
import { APP_VERSION_INFO } from '../config/version';
import appLogo from '../assets/app-icon.png';
import {
  Kanban,
  BarChart3,
  PieChart,
  FolderPlus,
  Download,
  Upload,
  CheckCircle2,
  Trash2,
  Edit3,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
  CheckSquare,
  AlertCircle,
  Settings as SettingsIcon
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
  onExportBackup: () => void;
  onImportBackup: () => void;
  onResetData?: () => void;
  totalTasksCount: number;
  completedTasksCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  onOpenSettings?: () => void;
  onOpenVersionModal?: () => void;
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
  onExportBackup,
  onImportBackup,
  totalTasksCount,
  completedTasksCount,
  isCollapsed,
  onToggleCollapse,
  sidebarWidth = 256,
  onSidebarWidthChange,
  onOpenSettings,
  onOpenVersionModal,
}) => {
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const currentWidth = isCollapsed ? 64 : sidebarWidth;

  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(480, moveEvent.clientX));
      if (onSidebarWidthChange) {
        onSidebarWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
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
      style={{ width: currentWidth }}
      className={`bg-slate-50/70 dark:bg-slate-950/70 flex flex-col ${
        isResizing ? 'transition-none select-none' : 'transition-all duration-200'
      } relative z-30 select-none shrink-0 group/sidebar`}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-sm shrink-0 overflow-hidden">
            <img src={appLogo} alt="ProjectTools" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight truncate">
                ProjectTools
              </h1>
              <button
                onClick={() => onOpenVersionModal?.()}
                className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-mono block truncate transition text-left cursor-pointer"
                title="点击查看详细版本信息与更新日志"
              >
                v{APP_VERSION_INFO.version} • 本地桌面版
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 transition"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="p-2.5">
        <nav className="relative space-y-1">
          {/* Active Sliding Background Pill & Left Glowing Bar */}
          {(() => {
            const navItems = [
              { id: 'kanban' as ViewMode, label: '看板视图 (Kanban)', icon: Kanban },
              { id: 'gantt' as ViewMode, label: '甘特图视图 (Timeline)', icon: BarChart3 },
              { id: 'stats' as ViewMode, label: '数据统计与概览', icon: PieChart },
            ];
            const activeIndex = navItems.findIndex((item) => item.id === viewMode);

            return (
              <>
                {activeIndex !== -1 && (
                  <div
                    className="absolute left-0 right-0 h-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                    style={{
                      transform: `translateY(${activeIndex * 42}px)`,
                    }}
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-slate-900 dark:bg-white" />
                  </div>
                )}

                {navItems.map(({ id, label, icon: Icon }) => {
                  const isActive = viewMode === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onSelectViewMode(id)}
                      title={label}
                      className={`group relative z-10 w-full flex items-center ${
                        isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                      } h-[38px] rounded-xl text-xs font-medium border border-transparent transition-all duration-200 active:scale-[0.98] ${
                        isActive
                          ? 'text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-all duration-300 ease-out ${
                          isActive
                            ? 'scale-110 text-slate-900 dark:text-white'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:scale-105'
                        }`}
                      />
                      {!isCollapsed && (
                        <span
                          className={`truncate transition-transform duration-200 ${
                            isActive ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'
                          }`}
                        >
                          {label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            );
          })()}
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
                className={`group flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} rounded-xl text-xs font-medium cursor-pointer border transition-all duration-150 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-[#eeeeee] dark:border-slate-800 shadow-xs font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-slate-200'
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
                          setDeletingProject(proj);
                        }}
                        title="删除项目"
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
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
        <div className="p-3 bg-transparent shrink-0 relative group/progress">
          {/* Detailed Progress Popover on Hover */}
          <div className="absolute bottom-full left-3 right-3 mb-2 opacity-0 pointer-events-none group-hover/progress:opacity-100 group-hover/progress:pointer-events-auto transition-all duration-200 ease-out z-50 bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> 项目进度与统计明细
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
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
                <div className="bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 p-1 rounded-lg">
                  <div className="font-bold">紧急</div>
                  <div className="font-mono text-xs">{urgentCount}</div>
                </div>
                <div className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 p-1 rounded-lg">
                  <div className="font-bold">高</div>
                  <div className="font-mono text-xs">{highCount}</div>
                </div>
                <div className="bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 p-1 rounded-lg">
                  <div className="font-bold">中</div>
                  <div className="font-mono text-xs">{mediumCount}</div>
                </div>
                <div className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-1 rounded-lg">
                  <div className="font-bold">低</div>
                  <div className="font-mono text-xs">{lowCount}</div>
                </div>
              </div>
            </div>

            {/* Subtasks Progress & Overdue Warnings */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" /> 子任务: {completedSubtasks}/{totalSubtasks}
              </span>
              {overdueCount > 0 ? (
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> 逾期 {overdueCount} 项
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-semibold">无逾期任务</span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-[#eeeeee] dark:border-slate-800 shadow-xs cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between text-xs mb-1.5 text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> 总完成进度
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-200">
                {totalTasksCount === 0 ? 0 : Math.round((completedTasksCount / totalTasksCount) * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-white transition-all duration-500"
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
      <div className="p-2.5 space-y-1.5 shrink-0">

        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-1">
            <button
              onClick={onExportBackup}
              title="导出 JSON 备份"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#eeeeee] dark:border-slate-800 transition"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onImportBackup}
              title="导入 JSON 恢复"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#eeeeee] dark:border-slate-800 transition"
            >
              <Upload className="w-4 h-4" />
            </button>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="打开应用设置（主题、下载路径、检查更新）"
                className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#eeeeee] dark:border-slate-800 transition"
              >
                <SettingsIcon className="w-4 h-4 text-brand-500" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={onExportBackup}
                title="导出 JSON 备份"
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-[#eeeeee] dark:border-slate-800 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> 导出备份
              </button>

              <button
                onClick={onImportBackup}
                title="导入 JSON 恢复"
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-[#eeeeee] dark:border-slate-800 transition shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" /> 导入数据
              </button>
            </div>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="主题、自选下载路径、检查更新"
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-[#eeeeee] dark:border-slate-800 transition shadow-2xs"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-slate-500" /> 设置
              </button>
            )}
          </>
        )}
      </div>

      {/* Stepless Drag Resizer Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDownResize}
          title="按住鼠标拖拽无极调节侧边栏宽度"
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 group/resizer hover:bg-slate-400/40 active:bg-slate-500 transition-colors flex items-center justify-center"
        >
          <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 group-hover/resizer:bg-slate-900 dark:group-hover/resizer:bg-white rounded-full transition-colors opacity-0 group-hover/sidebar:opacity-100" />
        </div>
      )}

      {/* Delete Project Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={() => {
          if (deletingProject) {
            onDeleteProject(deletingProject.id);
            setDeletingProject(null);
          }
        }}
        title="删除项目确认"
        message={`确定要删除项目 "${deletingProject?.name}" 及其下关联的所有任务卡片吗？此操作无法撤销。`}
      />
    </aside>
  );
};
