import React from 'react';
import { Task, Priority } from '../types/project';
import { Calendar, CheckSquare, Clock, Tag as TagIcon, Trash2, Edit3, AlertCircle, FolderOpen, ExternalLink } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; bg: string; text: string; border: string }> = {
  urgent: { label: '紧急', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' },
  high: { label: '高', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  medium: { label: '中', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  low: { label: '低', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleSubtask,
  onDragStart,
}) => {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < new Date().setHours(0,0,0,0) && task.columnId !== 'done';
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString() && task.columnId !== 'done';

  const handleOpenFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.associatedPath) {
      if (window.electronAPI?.openFolder) {
        window.electronAPI.openFolder(task.associatedPath);
      } else {
        alert(`关联路径: ${task.associatedPath}`);
      }
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing"
    >
      {/* Top Header: Priority Badge + Actions */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${priorityInfo.bg} ${priorityInfo.text} ${priorityInfo.border}`}
        >
          {priorityInfo.label}
        </span>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="编辑任务"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`确定删除任务 "${task.title}" 吗？`)) {
                onDelete(task.id);
              }
            }}
            title="删除任务"
            className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-500 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Title */}
      <h3
        onClick={() => onEdit(task)}
        className="font-semibold text-xs text-slate-800 dark:text-slate-100 mb-1 leading-snug line-clamp-2 hover:text-brand-500 cursor-pointer transition"
      >
        {task.title}
      </h3>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Associated Local Folder Badge */}
      {task.associatedPath && (
        <div
          onClick={handleOpenFolder}
          className="mb-2.5 px-2 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg text-[11px] font-mono flex items-center gap-1.5 border border-brand-500/20 cursor-pointer transition truncate"
          title={`在 Windows 资源管理器中打开: ${task.associatedPath}`}
        >
          <FolderOpen className="w-3 h-3 text-brand-500 shrink-0" />
          <span className="truncate">{task.associatedPath}</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0 ml-auto" />
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
            >
              <TagIcon className="w-2.5 h-2.5 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2.5 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <CheckSquare className="w-3 h-3 text-brand-500" /> 子任务 ({completedSubtasks}/{totalSubtasks})
            </span>
            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
          </div>
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
          {/* Quick toggle subtasks */}
          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubtask(task.id, st.id);
                }}
                className="flex items-center gap-1.5 text-[11px] cursor-pointer group/st hover:text-brand-500 transition"
              >
                <input
                  type="checkbox"
                  checked={st.completed}
                  onChange={() => {}} // handled by div click
                  className="rounded text-brand-500 focus:ring-0 cursor-pointer w-3 h-3"
                />
                <span className={`truncate ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {st.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer: Due Date */}
      {task.dueDate && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
          <div
            className={`flex items-center gap-1 font-medium ${
              isOverdue
                ? 'text-rose-500 font-bold'
                : isDueToday
                ? 'text-amber-500 font-bold'
                : 'text-slate-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3 h-3 text-rose-500 animate-pulse" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            <span>
              {task.dueDate} {isOverdue ? '(已逾期)' : isDueToday ? '(今天截止)' : ''}
            </span>
          </div>

          <div className="text-slate-400 font-mono text-[9px]">
            <Clock className="w-2.5 h-2.5 inline mr-0.5" />
            {new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
};
