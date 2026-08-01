import React from 'react';
import { Task, Priority } from '../types/project';
import { OpenWithMenu } from './OpenWithMenu';
import { PrioritySelect } from './PrioritySelect';
import { Calendar, CheckSquare, Clock, Tag as TagIcon, Trash2, Edit3, AlertCircle, FolderOpen, Folder, FileText } from 'lucide-react';

const STATUS_STYLE_CONFIG: Record<string, { 
  iconColor: string; 
  bg: string; 
  text: string; 
  border: string;
  cardBg: string;
  cardBorder: string;
  cardIndicator: string;
}> = {
  todo: {
    iconColor: 'text-slate-500 fill-slate-500/20 dark:text-slate-400 dark:fill-slate-400/20',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-500/20',
    cardBg: 'bg-white hover:bg-slate-50/60 dark:bg-slate-900/90 dark:hover:bg-slate-900',
    cardBorder: 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-400/60 dark:hover:border-slate-700',
    cardIndicator: 'border-l-4 border-l-slate-400 dark:border-l-slate-500',
  },
  in_progress: {
    iconColor: 'text-blue-500 fill-blue-500/20 dark:text-blue-400 dark:fill-blue-400/20',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    cardBg: 'bg-blue-50/40 hover:bg-blue-50/70 dark:bg-blue-950/25 dark:hover:bg-blue-950/40',
    cardBorder: 'border-blue-200/80 dark:border-blue-900/50 hover:border-blue-400/70 dark:hover:border-blue-500/60',
    cardIndicator: 'border-l-4 border-l-blue-500 dark:border-l-blue-400',
  },
  review: {
    iconColor: 'text-amber-500 fill-amber-500/20 dark:text-amber-400 dark:fill-amber-400/20',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    cardBg: 'bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/25 dark:hover:bg-amber-950/40',
    cardBorder: 'border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400/70 dark:hover:border-amber-500/60',
    cardIndicator: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
  },
  done: {
    iconColor: 'text-emerald-500 fill-emerald-500/20 dark:text-emerald-400 dark:fill-emerald-400/20',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    cardBg: 'bg-emerald-50/40 hover:bg-emerald-50/70 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40',
    cardBorder: 'border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-400/70 dark:hover:border-emerald-500/60',
    cardIndicator: 'border-l-4 border-l-emerald-500 dark:border-l-emerald-400',
  },
};

const renderTaskTitleWithStatusIcon = (title: string, columnId: string) => {
  const statusConfig = STATUS_STYLE_CONFIG[columnId] || STATUS_STYLE_CONFIG.todo;

  if (title.startsWith('📁 文件夹:') || title.startsWith('文件夹:')) {
    const name = title.replace(/^📁\s*文件夹:\s*/, '').replace(/^文件夹:\s*/, '');
    return (
      <span className="inline-flex items-center gap-1.5 min-w-0">
        <Folder className={`w-4 h-4 shrink-0 transition-colors duration-300 ${statusConfig.iconColor}`} />
        <span className="truncate">文件夹: {name}</span>
      </span>
    );
  }

  if (title.startsWith('📄 文件:') || title.startsWith('文件:')) {
    const name = title.replace(/^📄\s*文件:\s*/, '').replace(/^文件:\s*/, '');
    return (
      <span className="inline-flex items-center gap-1.5 min-w-0">
        <FileText className={`w-4 h-4 shrink-0 transition-colors duration-300 ${statusConfig.iconColor}`} />
        <span className="truncate">文件: {name}</span>
      </span>
    );
  }

  if (title.startsWith('📁 ')) {
    const name = title.slice(2);
    return (
      <span className="inline-flex items-center gap-1.5 min-w-0">
        <Folder className={`w-4 h-4 shrink-0 transition-colors duration-300 ${statusConfig.iconColor}`} />
        <span className="truncate">{name}</span>
      </span>
    );
  }

  return <span>{title}</span>;
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task, e?: React.MouseEvent) => void;
  onDelete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onChangePriority?: (taskId: string, priority: Priority) => void;
  viewMode?: 'grid' | 'details' | 'tiles';
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleSubtask,
  onDragStart,
  onChangePriority,
  viewMode = 'grid',
}) => {
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handlePriorityChange = (priority: Priority) => {
    if (onChangePriority) {
      onChangePriority(task.id, priority);
    }
  };

  const statusStyle = STATUS_STYLE_CONFIG[task.columnId] || STATUS_STYLE_CONFIG.todo;

  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < new Date().setHours(0,0,0,0) && task.columnId !== 'done';
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString() && task.columnId !== 'done';

  /* ================= DETAILS LIST VIEW MODE ================= */
  if (viewMode === 'details') {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        className={`group relative border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col gap-2 ${statusStyle.cardBg} ${statusStyle.cardBorder} ${statusStyle.cardIndicator}`}
      >
        {/* Header: Priority + Title + Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <PrioritySelect
              value={task.priority}
              onChange={handlePriorityChange}
              size="xs"
              className="shrink-0"
            />
            <h3
              onClick={(e) => onEdit(task, e)}
              className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 hover:text-brand-500 cursor-pointer transition"
              title={task.title}
            >
              {renderTaskTitleWithStatusIcon(task.title, task.columnId)}
            </h3>
          </div>

          <div className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 flex items-center gap-1 transition-all duration-200 shrink-0">
            <button
              onClick={(e) => onEdit(task, e)}
              className="group/btn p-1.5 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-500 border border-transparent hover:border-brand-500/20 transition-all active:scale-90"
              title="编辑任务"
            >
              <Edit3 className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
            </button>
            <button
              onClick={() => {
                if (confirm(`确定删除任务 "${task.title}" 吗？`)) onDelete(task.id);
              }}
              className="group/btn p-1.5 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-all active:scale-90"
              title="删除任务"
            >
              <Trash2 className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
            </button>
          </div>
        </div>

        {/* Associated Local Folder & OpenWith Split Button */}
        {task.associatedPath && (
          <div className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center justify-between gap-1 border transition-colors duration-300 truncate ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <FolderOpen className={`w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${statusStyle.iconColor}`} />
              <span className="truncate" title={task.associatedPath}>
                {task.associatedPath}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
              <OpenWithMenu
                itemPath={task.associatedPath}
                isDirectory={true}
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Tags / Subtasks & Due Date Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] text-slate-600 dark:text-slate-400 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {totalSubtasks > 0 && (
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                <CheckSquare className="w-3 h-3 text-brand-500" />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>

          {task.dueDate && (
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
              <span>{task.dueDate}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= TILES VIEW MODE ================= */
  if (viewMode === 'tiles') {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        className={`group relative border rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing flex flex-col gap-2 ${statusStyle.cardBg} ${statusStyle.cardBorder} ${statusStyle.cardIndicator}`}
      >
        <div className="flex items-center justify-between">
          <PrioritySelect
            value={task.priority}
            onChange={handlePriorityChange}
            size="xs"
          />
          <div className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 flex items-center gap-1 transition-all duration-200">
            <button
              onClick={(e) => onEdit(task, e)}
              className="group/btn p-1.5 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 rounded-lg text-slate-400 hover:text-brand-500 border border-transparent hover:border-brand-500/20 transition-all active:scale-90"
              title="编辑任务"
            >
              <Edit3 className="w-3 h-3 transition-transform duration-200 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
            </button>
            <button
              onClick={() => {
                if (confirm(`确定删除任务 "${task.title}" 吗？`)) onDelete(task.id);
              }}
              className="group/btn p-1.5 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-500 border border-transparent hover:border-rose-500/20 transition-all active:scale-90"
              title="删除任务"
            >
              <Trash2 className="w-3 h-3 transition-transform duration-200 group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
            </button>
          </div>
        </div>

        <h3
          onClick={() => onEdit(task)}
          className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 hover:text-brand-500 cursor-pointer transition"
          title={task.title}
        >
          {renderTaskTitleWithStatusIcon(task.title, task.columnId)}
        </h3>

        {task.description && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {task.description}
          </p>
        )}

        {task.associatedPath && (
          <div className="px-2 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-mono flex items-center justify-between gap-1 border border-brand-500/20">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <FolderOpen className="w-3 h-3 text-brand-500 shrink-0" />
              <span className="truncate" title={task.associatedPath}>
                {task.associatedPath}
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
              <OpenWithMenu
                itemPath={task.associatedPath}
                isDirectory={true}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================= STANDARD GRID CARD VIEW MODE ================= */
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`group relative border rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing ${statusStyle.cardBg} ${statusStyle.cardBorder} ${statusStyle.cardIndicator}`}
    >
      {/* Top Header: Priority Badge + Actions */}
      <div className="flex items-center justify-between mb-2">
        <PrioritySelect
          value={task.priority}
          onChange={handlePriorityChange}
          size="sm"
        />

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
        <div className={`mb-2.5 px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center justify-between gap-1 border transition-colors duration-300 truncate ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <FolderOpen className={`w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${statusStyle.iconColor}`} />
            <span className="truncate" title={task.associatedPath}>{task.associatedPath}</span>
          </div>
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <OpenWithMenu
              itemPath={task.associatedPath}
              isDirectory={true}
              size="sm"
            />
          </div>
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
        <div className="mb-2.5 bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
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
