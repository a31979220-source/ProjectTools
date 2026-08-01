import React, { useState } from 'react';
import { Task, Column, LocalFileItem, Priority } from '../types/project';
import { TaskCard } from './TaskCard';
import { OpenWithMenu } from './OpenWithMenu';
import { 
  Plus, 
  Layers, 
  FolderOpen, 
  FileText, 
  FileCode, 
  FileImage, 
  FileArchive, 
  Folder, 
  RefreshCw,
  LayoutGrid,
  GripVertical,
  List,
  Grid2X2
} from 'lucide-react';

interface KanbanBoardProps {
  columns: Column[];
  tasks: Task[];
  localFolderPath?: string;
  localFiles: LocalFileItem[];
  isLoadingFiles: boolean;
  onRefreshFiles: () => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onEditTask: (task: Task, e?: React.MouseEvent) => void;
  onDeleteTask: (taskId: string) => void;
  onChangeTaskPriority?: (taskId: string, priority: Priority) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTaskModalForColumn: (columnId: string, e?: React.MouseEvent) => void;
  onOpenEditProjectModal: () => void;
  onImportFileAsTask: (file: LocalFileItem, targetColumnId?: string) => void;
  onReorderColumns?: (columns: Column[]) => void;
}

type FolderViewMode = 'grid' | 'details' | 'tiles';

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  tasks,
  localFolderPath,
  localFiles,
  isLoadingFiles,
  onRefreshFiles,
  onMoveTask,
  onEditTask,
  onDeleteTask,
  onChangeTaskPriority,
  onToggleSubtask,
  onOpenNewTaskModalForColumn,
  onOpenEditProjectModal,
  onImportFileAsTask,
  onReorderColumns,
}) => {
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Global folder scanner view mode
  const [folderViewMode, setFolderViewMode] = useState<FolderViewMode>(() => {
    return (localStorage.getItem('pt_folder_view_mode_v1') as FolderViewMode) || 'grid';
  });

  // Per-column task card display modes state
  const [columnViewModes, setColumnViewModes] = useState<Record<string, FolderViewMode>>(() => {
    try {
      const saved = localStorage.getItem('pt_column_view_modes_v2');
      return saved
        ? JSON.parse(saved)
        : { todo: 'grid', in_progress: 'grid', review: 'grid', done: 'grid' };
    } catch (e) {
      return { todo: 'grid', in_progress: 'grid', review: 'grid', done: 'grid' };
    }
  });

  const handleSetColumnViewMode = (colId: string, mode: FolderViewMode) => {
    const updated = { ...columnViewModes, [colId]: mode };
    setColumnViewModes(updated);
    localStorage.setItem('pt_column_view_modes_v2', JSON.stringify(updated));
  };

  const handleSetAllColumnsViewMode = (mode: FolderViewMode) => {
    setFolderViewMode(mode);
    localStorage.setItem('pt_folder_view_mode_v1', mode);
    const updated: Record<string, FolderViewMode> = {};
    columns.forEach((c) => {
      updated[c.id] = mode;
    });
    setColumnViewModes(updated);
    localStorage.setItem('pt_column_view_modes_v2', JSON.stringify(updated));
  };

  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('drag-type', 'task-item');
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('drag-type', 'column-item');
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleFileDragStart = (e: React.DragEvent, file: LocalFileItem) => {
    e.stopPropagation();
    e.dataTransfer.setData('drag-type', 'file-item');
    e.dataTransfer.setData('application/json', JSON.stringify(file));
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);

    const dragType = e.dataTransfer.getData('drag-type');

    if (dragType === 'column-item') {
      const draggedColId = e.dataTransfer.getData('text/plain');
      if (draggedColId && draggedColId !== targetColumnId && onReorderColumns) {
        const colIdxA = columns.findIndex((c) => c.id === draggedColId);
        const colIdxB = columns.findIndex((c) => c.id === targetColumnId);
        if (colIdxA !== -1 && colIdxB !== -1) {
          const newCols = [...columns];
          const [moved] = newCols.splice(colIdxA, 1);
          newCols.splice(colIdxB, 0, moved);
          const reordered = newCols.map((c, idx) => ({ ...c, order: idx }));
          onReorderColumns(reordered);
        }
      }
      return;
    }

    if (dragType === 'file-item') {
      const fileJson = e.dataTransfer.getData('application/json');
      if (fileJson) {
        try {
          const fileItem: LocalFileItem = JSON.parse(fileJson);
          onImportFileAsTask(fileItem, targetColumnId);
        } catch (err) {
          console.error('Failed to parse dropped file item:', err);
        }
      }
      return;
    }

    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetColumnId);
    }
  };

  const handleOpenFile = async (filePath: string) => {
    if (window.electronAPI?.openFile) {
      await window.electronAPI.openFile(filePath);
    } else {
      alert(`本地文件路径: ${filePath}`);
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // File extension icon helper
  const getFileIcon = (item: LocalFileItem) => {
    if (item.isDirectory) return <Folder className="w-5 h-5 text-amber-500 shrink-0" />;
    const ext = item.extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return <FileImage className="w-5 h-5 text-purple-500 shrink-0" />;
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'cpp', 'rs', 'java'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-blue-500 shrink-0" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <FileArchive className="w-5 h-5 text-rose-500 shrink-0" />;
    }
    return <FileText className="w-5 h-5 text-emerald-500 shrink-0" />;
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar p-6 bg-slate-50 dark:bg-slate-950 select-none">

      {/* Local Folder Workspace Scanning Area (Win11 File Explorer UI) */}
      <div className="mb-6 bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800/70 rounded-2xl p-5 shadow-xs shrink-0">
        {localFolderPath ? (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="w-4 h-4 text-brand-500 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  关联工作区: <span className="font-mono font-normal text-slate-500">{localFolderPath}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold border border-slate-200 dark:border-slate-700 shrink-0">
                  {localFiles.length} 项
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Win11 View Mode Switcher with Smooth Sliding Indicator (Batch Switch All Columns) */}
                <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-inner mr-2 select-none w-72">
                  {/* Sliding Active Pill Background */}
                  <div
                    className="absolute top-1 bottom-1 rounded-lg bg-brand-500 shadow-sm transition-all duration-300 ease-out"
                    style={{
                      left: folderViewMode === 'grid' ? '4px' : folderViewMode === 'details' ? 'calc(33.333% + 1px)' : 'calc(66.666% - 2px)',
                      width: 'calc(33.333% - 3px)',
                    }}
                  />

                  <button
                    onClick={() => handleSetAllColumnsViewMode('grid')}
                    title="全局一键设为：大图标模式"
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors duration-200 rounded-lg active:scale-95 ${
                      folderViewMode === 'grid'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>大图标</span>
                  </button>

                  <button
                    onClick={() => handleSetAllColumnsViewMode('details')}
                    title="全局一键设为：详细信息列表"
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors duration-200 rounded-lg active:scale-95 ${
                      folderViewMode === 'details'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>详细信息</span>
                  </button>

                  <button
                    onClick={() => handleSetAllColumnsViewMode('tiles')}
                    title="全局一键设为：平铺列表"
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors duration-200 rounded-lg active:scale-95 ${
                      folderViewMode === 'tiles'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Grid2X2 className="w-3.5 h-3.5" />
                    <span>平铺列表</span>
                  </button>
                </div>

                {localFiles.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(`确定要将当前文件夹内的 ${localFiles.length} 项全量导入为待办任务卡片吗？`)) {
                        localFiles.forEach((f) => onImportFileAsTask(f, 'todo'));
                      }
                    }}
                    className="px-2.5 py-1 bg-brand-500/15 hover:bg-brand-500 text-brand-500 hover:text-white rounded-lg text-xs font-bold border border-brand-500/30 transition flex items-center gap-1.5"
                    title="一键将当前文件夹内的所有文件和目录批量导入为任务"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>批量导入 ({localFiles.length})</span>
                  </button>
                )}

                <button
                  onClick={onRefreshFiles}
                  className="px-2.5 py-1 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm shrink-0"
                  title="重新扫描并刷新本地文件夹"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>重新扫描</span>
                </button>
              </div>
            </div>

            {/* Dynamic Local Folder File Views with Smooth Transition Animation */}
            {localFiles.length === 0 ? (
              <div className="w-full h-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs gap-2">
                <Folder className="w-4 h-4 opacity-50" />
                <span>文件夹为空或无法读取文件。</span>
              </div>
            ) : (
              <div key={folderViewMode} className="animate-view-switch">
                {folderViewMode === 'grid' ? (
                  /* GRID VIEW MODE */
                  <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 custom-scrollbar">
                    {localFiles.map((item) => (
                      <div
                        key={item.path}
                        draggable
                        onDragStart={(e) => handleFileDragStart(e, item)}
                        className="w-56 shrink-0 bg-slate-50/80 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 hover:border-brand-500/50 rounded-xl p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-md group/card cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start gap-2.5 mb-2 min-w-0">
                          {getFileIcon(item)}
                          <div className="min-w-0 flex-1">
                            <h4
                              onClick={() => handleOpenFile(item.path)}
                              className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover/card:text-brand-500 transition cursor-pointer"
                              title={item.name}
                            >
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span>{item.isDirectory ? '文件夹' : formatSize(item.size)}</span>
                              <span>•</span>
                              <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/60 text-[10px]">
                          <span className="text-slate-400 dark:text-slate-400 group-hover/card:text-brand-500 font-medium transition">
                            ⋮ 拖拽入看板
                          </span>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <OpenWithMenu
                              itemPath={item.path}
                              isDirectory={item.isDirectory}
                              extension={item.extension}
                              size="sm"
                            />
                            <button
                              onClick={() => onImportFileAsTask(item, 'todo')}
                              className="px-2 py-0.5 bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 rounded-md font-bold transition border border-brand-500/20"
                              title="转为待办任务"
                            >
                              +任务
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : folderViewMode === 'details' ? (
                  /* DETAILS TABLE VIEW MODE */
                  <div className="overflow-x-auto max-h-56 custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2 px-3 w-8"></th>
                          <th className="py-2 px-3">名称</th>
                          <th className="py-2 px-3 w-28">修改日期</th>
                          <th className="py-2 px-3 w-24">类型</th>
                          <th className="py-2 px-3 w-24 text-right">大小</th>
                          <th className="py-2 px-3 w-40 text-right">快捷操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                        {localFiles.map((item) => (
                          <tr
                            key={item.path}
                            draggable
                            onDragStart={(e) => handleFileDragStart(e, item)}
                            className="hover:bg-brand-500/5 transition cursor-grab active:cursor-grabbing group/row"
                          >
                            <td className="py-2 px-3">{getFileIcon(item)}</td>
                            <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-100">
                              <span
                                onClick={() => handleOpenFile(item.path)}
                                className="hover:text-brand-500 transition cursor-pointer truncate block max-w-xs"
                                title={item.name}
                              >
                                {item.name}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400 text-[11px]">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                              {item.isDirectory ? '文件夹' : `${item.extension.toUpperCase()} 文件`}
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px] text-right font-mono">
                              {item.isDirectory ? '-' : formatSize(item.size)}
                            </td>
                            <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <OpenWithMenu
                                  itemPath={item.path}
                                  isDirectory={item.isDirectory}
                                  extension={item.extension}
                                  size="sm"
                                />
                                <button
                                  onClick={() => onImportFileAsTask(item, 'todo')}
                                  className="px-2 py-0.5 bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 rounded-md font-bold transition border border-brand-500/20 text-[10px]"
                                  title="转为待办任务"
                                >
                                  +任务
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* TILES VIEW MODE */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                    {localFiles.map((item) => (
                      <div
                        key={item.path}
                        draggable
                        onDragStart={(e) => handleFileDragStart(e, item)}
                        className="bg-slate-50/80 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 hover:border-brand-500/50 rounded-xl p-2.5 flex items-center justify-between transition-all duration-200 hover:shadow-sm cursor-grab active:cursor-grabbing group/tile"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {getFileIcon(item)}
                          <div className="min-w-0 flex-1">
                            <h4
                              onClick={() => handleOpenFile(item.path)}
                              className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate hover:text-brand-500 transition cursor-pointer"
                              title={item.name}
                            >
                              {item.name}
                            </h4>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.isDirectory ? '文件夹' : formatSize(item.size)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                          <OpenWithMenu
                            itemPath={item.path}
                            isDirectory={item.isDirectory}
                            extension={item.extension}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <FolderOpen className="w-4 h-4 text-slate-400" />
              <span>当前项目未关联本地代码或项目文件夹。</span>
            </div>
            <button
              onClick={onOpenEditProjectModal}
              className="px-3 py-1 bg-brand-500/10 hover:bg-brand-500 text-brand-600 hover:text-white dark:text-brand-400 rounded-lg font-bold transition border border-brand-500/20"
            >
              + 关联本地项目文件夹
            </button>
          </div>
        )}
      </div>

      {/* Main Kanban Content Area: Vertical Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0 p-1.5 overflow-hidden">
        {columns.map((col) => {
            const columnTasks = tasks
              .filter((t) => t.columnId === col.id)
              .sort((a, b) => a.order - b.order);

            const isOver = dragOverColumnId === col.id;
            const colViewMode = columnViewModes[col.id] || 'grid';

            return (
              <div
                key={col.id}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, col.id)}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl bg-white/70 dark:bg-slate-900/50 border transition-all duration-200 shadow-xs ${
                  isOver
                    ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/40 shadow-glow'
                    : 'border-[#eeeeee] dark:border-slate-800/70'
                }`}
              >
                {/* Column Header: Draggable Grip Handle & Independent Display Switcher */}
                <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 bg-transparent rounded-t-2xl cursor-grab active:cursor-grabbing shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 hover:opacity-100 shrink-0" />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {col.title}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Mini Column Independent Display Mode Switcher */}
                    <div className="flex items-center bg-white dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                      <button
                        onClick={() => handleSetColumnViewMode(col.id, 'grid')}
                        title="当前列：大图标模式"
                        className={`p-0.5 rounded transition ${
                          colViewMode === 'grid'
                            ? 'bg-brand-500 text-white shadow-sm font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <LayoutGrid className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSetColumnViewMode(col.id, 'details')}
                        title="当前列：详细列表模式"
                        className={`p-0.5 rounded transition ${
                          colViewMode === 'details'
                            ? 'bg-brand-500 text-white shadow-sm font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <List className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSetColumnViewMode(col.id, 'tiles')}
                        title="当前列：平铺列表模式"
                        className={`p-0.5 rounded transition ${
                          colViewMode === 'tiles'
                            ? 'bg-brand-500 text-white shadow-sm font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Grid2X2 className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewTaskModalForColumn(col.id, e);
                      }}
                      className="group/add p-1.5 hover:bg-brand-500/15 dark:hover:bg-brand-500/20 text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 rounded-lg transition-all duration-200 active:scale-90 hover:scale-105 shrink-0 border border-transparent hover:border-brand-500/20"
                      title="在该状态下添加任务"
                    >
                      <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover/add:rotate-90" />
                    </button>
                  </div>
                </div>

                {/* Column Scrollable Task List Container */}
                <div className="flex-1 min-h-[220px] overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnTasks.length === 0 ? (
                    <div className="h-36 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                      <Layers className="w-6 h-6 mb-1.5 opacity-40" />
                      <span>{isOver ? '🎉 放开鼠标添加任务' : '暂无任务卡片 (支持连续拖拽任意多个文件或卡片至此)'}</span>
                    </div>
                  ) : (
                    <div key={colViewMode} className="space-y-2.5 animate-view-switch">
                      {columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onChangePriority={onChangeTaskPriority}
                          onToggleSubtask={onToggleSubtask}
                          onDragStart={handleTaskDragStart}
                          viewMode={colViewMode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
};
