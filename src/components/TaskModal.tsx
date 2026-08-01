import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Task, Column, Priority, SubTask, LocalFileItem } from '../types/project';
import { PrioritySelect } from './PrioritySelect';
import { CustomSelect } from './CustomSelect';
import { X, Plus, Trash2, Tag as TagIcon, Calendar, Clock, CheckSquare, Flag, Folder } from 'lucide-react';

// Normalize a date string to datetime-local format (YYYY-MM-DDTHH:mm)
const toDatetimeLocal = (val: string | undefined, fallbackTime: string = '00:00'): string => {
  if (!val) return '';
  // Already in datetime-local format
  if (val.includes('T')) return val.slice(0, 16);
  // Legacy YYYY-MM-DD format
  return `${val}T${fallbackTime}`;
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  columns: Column[];
  defaultColumnId?: string;
  projectId: string;
  localFiles?: LocalFileItem[];
  localFolderPath?: string;
  triggerPosition?: { x: number; y: number } | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  columns,
  defaultColumnId = 'todo',
  projectId,
  localFiles = [],
  localFolderPath,
  triggerPosition,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [transformOrigin, setTransformOrigin] = useState<string>('center center');

  useEffect(() => {
    if (isOpen && triggerPosition) {
      if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        const rx = triggerPosition.x - rect.left;
        const ry = triggerPosition.y - rect.top;
        setTransformOrigin(`${rx}px ${ry}px`);
      } else {
        const w = Math.min(window.innerWidth - 32, 576);
        const h = Math.min(window.innerHeight * 0.85, 600);
        const left = (window.innerWidth - w) / 2;
        const top = (window.innerHeight - h) / 2;
        setTransformOrigin(`${triggerPosition.x - left}px ${triggerPosition.y - top}px`);
      }
    } else {
      setTransformOrigin('top center');
    }
  }, [isOpen, triggerPosition]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(defaultColumnId);
  const [priority, setPriority] = useState<Priority>('medium');
  const [associatedPath, setAssociatedPath] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setColumnId(initialTask.columnId);
      setPriority(initialTask.priority);
      setAssociatedPath(initialTask.associatedPath || '');
      setStartDate(toDatetimeLocal(initialTask.startDate, '00:00'));
      setDueDate(toDatetimeLocal(initialTask.dueDate, '23:59'));
      setTags(initialTask.tags || []);
      setSubtasks(initialTask.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setColumnId(defaultColumnId);
      setPriority('medium');
      setAssociatedPath('');
      setStartDate('');
      setDueDate('');
      setTags([]);
      setSubtasks([]);
    }
  }, [initialTask, defaultColumnId, isOpen]);

  if (!isOpen) return null;

  const handleSelectCustomFolder = async () => {
    if (window.electronAPI?.selectFolder) {
      const selected = await window.electronAPI.selectFolder();
      if (selected) {
        setAssociatedPath(selected);
      }
    } else {
      const input = prompt('请输入要关联的本地文件夹/文件路径：', associatedPath);
      if (input !== null) {
        setAssociatedPath(input);
      }
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim();
    if (trimmed) {
      setSubtasks([
        ...subtasks,
        { id: `st-${Date.now()}-${Math.random()}`, title: trimmed, completed: false },
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (stId: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === stId ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleRemoveSubtask = (stId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(initialTask ? { id: initialTask.id } : {}),
      projectId,
      title: title.trim(),
      description: description.trim(),
      columnId,
      priority,
      associatedPath: associatedPath.trim() || undefined,
      startDate: startDate || undefined,
      dueDate: dueDate || undefined,
      tags,
      subtasks,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-backdrop-fade">
      <div
        ref={modalRef}
        style={{ transformOrigin }}
        className="bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-click-origin-pop"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            {initialTask ? '编辑任务' : '新建任务'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              任务名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="请输入清晰的任务标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              任务描述与备注 (支持详细说明)
            </label>
            <textarea
              rows={3}
              placeholder="添加补充细节、设计要点或参考链接..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
          </div>

          {/* Dropdown for Associated Project Folder / File */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-brand-500" /> 关联项目下的文件 / 目录
            </label>

            <CustomSelect
              value={associatedPath}
              onChange={(val) => {
                if (val === '__custom__') {
                  handleSelectCustomFolder();
                } else {
                  setAssociatedPath(val);
                }
              }}
              placeholder="-- 不关联文件/目录 --"
              className="w-full font-mono py-2"
              options={[
                { value: '', label: '-- 不关联文件/目录 --' },
                ...(localFolderPath
                  ? [{ value: localFolderPath, label: `📁 [关联项目主目录] ${localFolderPath}` }]
                  : []),
                ...localFiles.map((f) => ({
                  value: f.path,
                  label: `${f.isDirectory ? '📁 目录: ' : '📄 文件: '}${f.name}`,
                })),
                { value: '__custom__', label: '📂 浏览选择其它系统文件夹...' },
              ]}
            />

            {associatedPath && (
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 gap-2">
                <span className="truncate flex-1">📍 已关联: {associatedPath}</span>
                <button
                  type="button"
                  onClick={() => setAssociatedPath('')}
                  className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-xs font-semibold border border-rose-500/30 transition shrink-0 flex items-center gap-1 font-sans shadow-sm"
                  title="清除关联"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清除关联</span>
                </button>
              </div>
            )}
          </div>

          {/* Column Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                当前状态
              </label>
              <CustomSelect
                value={columnId}
                onChange={(val) => setColumnId(val)}
                className="w-full py-2"
                options={columns.map((c) => ({
                  value: c.id,
                  label: c.title,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-amber-500" /> 优先级
              </label>
              <PrioritySelect
                value={priority}
                onChange={setPriority}
                size="md"
                className="w-full justify-between py-2 px-3 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Dates with Hour Precision */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-500" /> 开始时间
                <Clock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" /> 截止时间
                <Clock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5 text-emerald-500" /> 标签管理
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="输入标签按回车或点击添加..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition"
              >
                添加标签
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-500 text-xs font-medium flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-brand-500" /> 子任务 CheckList
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="添加独立子任务步骤..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 子任务
              </button>
            </div>

            <div className="space-y-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded text-brand-500 focus:ring-0"
                    />
                    <span className={`truncate ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 transition"
            >
              保存任务
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
