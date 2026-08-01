import React from 'react';
import { Project, Priority, FilterState } from '../types/project';
import { Search, Plus, Tag, Flag, FolderOpen, ExternalLink } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface HeaderProps {
  activeProject: Project | undefined;
  filterState: FilterState;
  onUpdateFilter: (filter: Partial<FilterState>) => void;
  availableTags: string[];
  onOpenNewTaskModal: (e?: React.MouseEvent) => void;
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
    <header className="h-16 px-6 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between gap-4 select-none shrink-0">
      {/* Project Info Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs cursor-pointer hover:opacity-80 transition"
          style={{ backgroundColor: activeProject?.color || '#0c8de4' }}
          onClick={onEditProjectModal}
          title="点击编辑项目设置"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 
              onClick={onEditProjectModal}
              className="text-base font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-slate-900 dark:hover:text-white transition"
            >
              {activeProject?.name || '选择或新建项目'}
            </h2>

            {/* Folder Badge if folder linked */}
            {activeProject?.localFolderPath ? (
              <button
                onClick={handleOpenFolderInExplorer}
                title={`在 Windows 资源管理器中打开文件夹: ${activeProject.localFolderPath}`}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition"
              >
                <FolderOpen className="w-3 h-3 text-slate-500" />
                <span className="truncate max-w-[180px]">{activeProject.localFolderPath}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </button>
            ) : (
              <button
                onClick={onEditProjectModal}
                className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition flex items-center gap-1 font-medium underline"
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
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 rounded-xl border border-[#eeeeee] dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/30 transition shadow-2xs"
          />
        </div>

        {/* Priority Filter */}
        <CustomSelect
          value={filterState.priority}
          onChange={(val) => onUpdateFilter({ priority: val as Priority | 'all' })}
          icon={<Flag className="w-3.5 h-3.5 text-slate-400" />}
          options={[
            { value: 'all', label: '所有优先级' },
            { value: 'urgent', label: '🔴 紧急' },
            { value: 'high', label: '🟠 高' },
            { value: 'medium', label: '🟡 中' },
            { value: 'low', label: '🔵 低' },
          ]}
        />

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <CustomSelect
            value={filterState.tag}
            onChange={(val) => onUpdateFilter({ tag: val })}
            icon={<Tag className="w-3.5 h-3.5 text-slate-400" />}
            options={[
              { value: 'all', label: '所有标签' },
              ...availableTags.map((t) => ({ value: t, label: `#${t}` })),
            ]}
          />
        )}

        {/* Reset Filter Button if active */}
        {(filterState.searchQuery || filterState.priority !== 'all' || filterState.tag !== 'all') && (
          <button
            onClick={() => onUpdateFilter({ searchQuery: '', priority: 'all', tag: 'all' })}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition px-2 py-1 hover:underline"
          >
            重置筛选
          </button>
        )}

        {/* Add Task Main Button */}
        <button
          onClick={(e) => onOpenNewTaskModal(e)}
          className="group flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          <span>新建任务</span>
        </button>
      </div>
    </header>
  );
};
