import React, { useState } from 'react';
import { Task, Column, LocalFileItem } from '../types/project';
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
  Rows,
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
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTaskModalForColumn: (columnId: string) => void;
  onOpenEditProjectModal: () => void;
  onImportFileAsTask: (file: LocalFileItem, targetColumnId?: string) => void;
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
  onToggleSubtask,
  onOpenNewTaskModalForColumn,
  onOpenEditProjectModal,
  onImportFileAsTask,
}) => {
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<'horizontal' | 'vertical'>(() => {
    return (localStorage.getItem('pt_layout_style_v1') as 'horizontal' | 'vertical') || 'vertical';
  });

  // Win11 style folder view mode
  const [folderViewMode, setFolderViewMode] = useState<FolderViewMode>(() => {
    return (localStorage.getItem('pt_folder_view_mode_v1') as FolderViewMode) || 'grid';
  });

  const handleSelectLayoutStyle = (mode: 'horizontal' | 'vertical') => {
    setLayoutStyle(mode);
    localStorage.setItem('pt_layout_style_v1', mode);
  };

  const handleSelectFolderViewMode = (mode: FolderViewMode) => {
    setFolderViewMode(mode);
    localStorage.setItem('pt_folder_view_mode_v1', mode);
  };

  // Drag Task Card
  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('drag-type', 'task-card');
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag Local File Card to Kanban Column
  const handleFileDragStart = (e: React.DragEvent, file: LocalFileItem) => {
    e.dataTransfer.setData('drag-type', 'file-item');
    e.dataTransfer.setData('application/json', JSON.stringify(file));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
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
    <div className="h-full flex flex-col overflow-hidden p-6 bg-slate-50 dark:bg-slate-950 select-none">
      {/* Top Bar: Layout Style Toggle & Folder Info */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              看板视图排版：
            </span>
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => handleSelectLayoutStyle('vertical')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  layoutStyle === 'vertical'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>纵向列视图</span>
              </button>
              <button
                onClick={() => handleSelectLayoutStyle('horizontal')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  layoutStyle === 'horizontal'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Rows className="w-3.5 h-3.5" />
                <span>横向泳道视图</span>
              </button>
            </div>
          </div>
        </div>

        {/* Local Folder Sync Header */}
        <div className="flex items-center gap-2">
          {localFolderPath ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <FolderOpen className="w-4 h-4 text-brand-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                关联文件夹：
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {localFolderPath}
              </span>
              <button
                onClick={onRefreshFiles}
                title="刷新本地文件"
                className={`p-1 text-slate-400 hover:text-brand-500 transition ${isLoadingFiles ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenEditProjectModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-semibold border border-brand-500/30 transition"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>点击关联本地文件夹</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="flex-1 overflow-y-auto overflow-x-auto space-y-6 pr-1">
        {/* ================= SECTION 1: Local Folder Contents Horizontal Bar ================= */}
        {localFolderPath && (
          <div className="bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
            {/* Header & Win11 View Switcher */}
            <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <FolderOpen className="w-4 h-4 text-brand-500" />
                <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  📁 本地关联文件夹内容 ({localFiles.length} 个项目)
                </h3>
                <span className="text-[11px] text-brand-500 font-semibold bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                  ✨ 支持拖拽卡片到下方列，或切换 Win11 文件浏览模式
                </span>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                {/* Win11 View Mode Switcher */}
                <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                  <button
                    onClick={() => handleSelectFolderViewMode('grid')}
                    title="大图标 / 卡片模式"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      folderViewMode === 'grid'
                        ? 'bg-brand-500 text-white shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>大图标</span>
                  </button>

                  <button
                    onClick={() => handleSelectFolderViewMode('details')}
                    title="Windows 详细信息列表"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      folderViewMode === 'details'
                        ? 'bg-brand-500 text-white shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>详细信息</span>
                  </button>

                  <button
                    onClick={() => handleSelectFolderViewMode('tiles')}
                    title="Win11 平铺列表"
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      folderViewMode === 'tiles'
                        ? 'bg-brand-500 text-white shadow-sm font-semibold'
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

            {/* Dynamic Local Folder File Views */}
            {localFiles.length === 0 ? (
              <div className="w-full h-20 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs gap-2">
                <Folder className="w-4 h-4 opacity-50" />
                <span>文件夹为空或无法读取文件。</span>
              </div>
            ) : folderViewMode === 'grid' ? (
              /* ================= MODE 1: GRID CARDS VIEW ================= */
              <div className="flex gap-3.5 overflow-x-auto p-1.5 min-h-[110px] items-stretch">
                {localFiles.map((file) => (
                  <div
                    key={file.path}
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, file)}
                    onDoubleClick={() => handleOpenFile(file.path)}
                    className="w-60 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-500 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-grab active:cursor-grabbing hover:scale-[1.01]"
                    title="按住鼠标拖拽该卡片到下方看板列，或双击打开"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 cursor-grab" />
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60">
                            {getFileIcon(file)}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-600">
                          {file.isDirectory ? '目录' : file.extension.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div
                        className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate mb-1"
                        title={file.name}
                      >
                        {file.name}
                      </div>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-[10px]">{file.isDirectory ? '文件夹' : formatSize(file.size)}</span>
                      <div className="flex items-center gap-1.5">
                        <OpenWithMenu
                          itemPath={file.path}
                          isDirectory={file.isDirectory}
                          extension={file.extension}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImportFileAsTask(file);
                          }}
                          title="导入为待办任务"
                          className="px-2 py-1 bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white rounded-lg text-[11px] font-bold border border-brand-500/30 transition flex items-center gap-0.5"
                        >
                          <span>+任务</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : folderViewMode === 'details' ? (
              /* ================= MODE 2: WIN11 DETAILS TABLE VIEW ================= */
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden text-xs shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                      <th className="py-2.5 px-4">名称</th>
                      <th className="py-2.5 px-4">修改日期</th>
                      <th className="py-2.5 px-4">类型</th>
                      <th className="py-2.5 px-4">大小</th>
                      <th className="py-2.5 px-4 text-right">操作 (可拖拽整行到下方)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-700 dark:text-slate-200">
                    {localFiles.map((file) => (
                      <tr
                        key={file.path}
                        draggable
                        onDragStart={(e) => handleFileDragStart(e, file)}
                        onDoubleClick={() => handleOpenFile(file.path)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-grab active:cursor-grabbing group"
                      >
                        <td className="py-2 px-4 flex items-center gap-2 font-bold truncate max-w-xs">
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />
                          {getFileIcon(file)}
                          <span className="truncate">{file.name}</span>
                        </td>
                        <td className="py-2 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(file.updatedAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {file.isDirectory ? '文件夹' : file.extension.toUpperCase() || '文件'}
                        </td>
                        <td className="py-2 px-4 text-slate-400 font-mono text-[11px]">
                          {file.isDirectory ? '-' : formatSize(file.size)}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <OpenWithMenu
                              itemPath={file.path}
                              isDirectory={file.isDirectory}
                              extension={file.extension}
                              size="sm"
                            />
                            <button
                              onClick={() => onImportFileAsTask(file)}
                              className="px-2 py-0.5 bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white rounded text-[11px] font-bold border border-brand-500/30 transition"
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
              /* ================= MODE 3: WIN11 TILES VIEW ================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
                {localFiles.map((file) => (
                  <div
                    key={file.path}
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, file)}
                    onDoubleClick={() => handleOpenFile(file.path)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-500 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-grab active:cursor-grabbing"
                    title="按住鼠标拖拽到下方列，或双击打开"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60 shrink-0">
                        {getFileIcon(file)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {file.isDirectory ? '文件夹' : `${file.extension.toUpperCase()} · ${formatSize(file.size)}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <OpenWithMenu
                        itemPath={file.path}
                        isDirectory={file.isDirectory}
                        extension={file.extension}
                        size="sm"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onImportFileAsTask(file);
                        }}
                        title="转为任务"
                        className="px-1.5 py-0.5 bg-brand-500/10 hover:bg-brand-500 text-brand-600 dark:text-brand-400 hover:text-white rounded text-[10px] font-bold border border-brand-500/30 transition"
                      >
                        +任务
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: Board Columns (Horizontal Rows / Vertical Grid) ================= */}
        {layoutStyle === 'horizontal' ? (
          /* ================= HORIZONTAL SWIMLANES VIEW ================= */
          <div className="space-y-4">
            {columns.map((col) => {
              const columnTasks = tasks
                .filter((t) => t.columnId === col.id)
                .sort((a, b) => a.order - b.order);

              const isOver = dragOverColumnId === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`bg-slate-100/90 dark:bg-slate-900/60 border rounded-2xl p-4 transition-all duration-200 ${
                    isOver
                      ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/40 shadow-glow'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Swimlane Header */}
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 dark:border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {col.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenNewTaskModalForColumn(col.id)}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 text-xs font-medium transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>添加任务</span>
                    </button>
                  </div>

                  {/* Horizontal Task Cards Container */}
                  <div className="flex gap-4 overflow-x-auto p-1.5 min-h-[145px] items-stretch">
                    {columnTasks.length === 0 ? (
                      <div className="w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs gap-2">
                        <Layers className="w-5 h-5 opacity-40" />
                        <span>{isOver ? '🎉 放开鼠标：直接在此状态下新建任务！' : '暂无任务卡片 (支持将上方文件或卡片拖拽至此)'}</span>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div key={task.id} className="w-80 shrink-0">
                          <TaskCard
                            task={task}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                            onToggleSubtask={onToggleSubtask}
                            onDragStart={handleTaskDragStart}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= VERTICAL COLUMNS VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-[500px] p-1.5">
            {columns.map((col) => {
              const columnTasks = tasks
                .filter((t) => t.columnId === col.id)
                .sort((a, b) => a.order - b.order);

              const isOver = dragOverColumnId === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`flex-1 min-w-0 flex flex-col rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border transition-all duration-200 ${
                    isOver
                      ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/40 shadow-glow'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {col.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenNewTaskModalForColumn(col.id)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition shrink-0"
                      title="在该状态下添加任务"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[220px] max-h-[calc(100vh-250px)]">
                    {columnTasks.length === 0 ? (
                      <div className="h-36 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs p-3 text-center">
                        <Layers className="w-6 h-6 mb-1.5 opacity-40" />
                        <span>{isOver ? '🎉 放开鼠标添加任务' : '暂无任务卡片 (支持连续拖拽任意多个文件或卡片至此)'}</span>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onToggleSubtask={onToggleSubtask}
                          onDragStart={handleTaskDragStart}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
