import React from 'react';
import { Project, Priority, FilterState } from '../types/project';
import { Search, Plus, Tag, Flag, FolderOpen, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeProject: Project | undefined;
  filterState: FilterState;
  onUpdateFilter: (filter: Partial<FilterState>) => void;
  availableTags: string[];
  onOpenNewTaskModal: () => void;
  onEditProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  filterState,
  onUpdateFilter,
  availableTags,
  onOpenNewTaskModal,
  onEditProjectModal,
}) => {
  const handleOpenFolderInExplorer = async () => {
    if (activeProject?.localFolderPath) {
      if (window.electronAPI?.openFolder) {
        await window.electronAPI.openFolder(activeProject.localFolderPath);
      } else {
        alert(`关联文件夹路径：${activeProject.localFolderPath}`);
      }
    }
  };

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 select-none shrink-0 shadow-sm">
      {/* Project Info Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm cursor-pointer hover:opacity-80 transition"
          style={{ backgroundColor: activeProject?.color || '#0c8de4' }}
          onClick={onEditProjectModal}
          title="点击编辑项目设置"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 
              onClick={onEditProjectModal}
              className="text-base font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-brand-500 transition"
            >
              {activeProject?.name || '选择或新建项目'}
            </h2>

            {/* Folder Badge if folder linked */}
            {activeProject?.localFolderPath ? (
              <button
                onClick={handleOpenFolderInExplorer}
                title={`在 Windows 资源管理器中打开文件夹: ${activeProject.localFolderPath}`}
                className="px-2 py-0.5 rounded-md bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-mono font-medium border border-brand-500/20 flex items-center gap-1 transition"
              >
                <FolderOpen className="w-3 h-3 text-brand-500" />
                <span className="truncate max-w-[180px]">{activeProject.localFolderPath}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </button>
            ) : (
              <button
                onClick={onEditProjectModal}
                className="text-[11px] text-slate-400 hover:text-brand-500 transition flex items-center gap-1 font-medium underline"
              >
                <FolderOpen className="w-3 h-3" /> 关联文件夹
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
            {activeProject?.description || '本地极速项目管理系统'}
          </p>
        </div>
      </div>

      {/* Filter & Actions Tools */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Input */}
        <div className="relative w-56">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索任务或描述..."
            value={filterState.searchQuery}
            onChange={(e) => onUpdateFilter({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Flag className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <select
            value={filterState.priority}
            onChange={(e) => onUpdateFilter({ priority: e.target.value as Priority | 'all' })}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none pr-1 cursor-pointer font-medium"
          >
            <option value="all">所有优先级</option>
            <option value="urgent">🔴 紧急</option>
            <option value="high">🟠 高</option>
            <option value="medium">🟡 中</option>
            <option value="low">🔵 低</option>
          </select>
        </div>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <Tag className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={filterState.tag}
              onChange={(e) => onUpdateFilter({ tag: e.target.value })}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none pr-1 cursor-pointer font-medium"
            >
              <option value="all">所有标签</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reset Filter Button if active */}
        {(filterState.searchQuery || filterState.priority !== 'all' || filterState.tag !== 'all') && (
          <button
            onClick={() => onUpdateFilter({ searchQuery: '', priority: 'all', tag: 'all' })}
            className="text-xs text-slate-500 hover:text-brand-500 transition px-2 py-1"
          >
            重置筛选
          </button>
        )}

        {/* Add Task Button */}
        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>新建任务</span>
        </button>
      </div>
    </header>
  );
};
