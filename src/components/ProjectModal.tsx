import React, { useState, useEffect } from 'react';
import { Project } from '../types/project';
import { X, Folder, FolderOpen, Trash2 } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  initialProject?: Project | null;
}

const PRESET_COLORS = [
  '#0c8de4', '#8b5cf6', '#10b981', '#f59e0b', 
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6'
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0c8de4');
  const [localFolderPath, setLocalFolderPath] = useState('');

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description || '');
      setColor(initialProject.color || '#0c8de4');
      setLocalFolderPath(initialProject.localFolderPath || '');
    } else {
      setName('');
      setDescription('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setLocalFolderPath('');
    }
  }, [initialProject, isOpen]);

  if (!isOpen) return null;

  const handleSelectFolder = async () => {
    if (window.electronAPI?.selectFolder) {
      const selected = await window.electronAPI.selectFolder();
      if (selected) {
        setLocalFolderPath(selected);
      }
    } else {
      // Fallback for standard web browser preview
      const inputPath = prompt('请输入本地关联文件夹路径：', localFolderPath);
      if (inputPath !== null) {
        setLocalFolderPath(inputPath);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(initialProject ? { id: initialProject.id } : {}),
      name: name.trim(),
      description: description.trim(),
      color,
      localFolderPath: localFolderPath.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
            {initialProject ? '编辑项目信息' : '新建项目'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              项目名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="如：新产品研发、个人复习计划..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              项目简介
            </label>
            <textarea
              rows={2}
              placeholder="简要说明项目目标与核心维度..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
            />
          </div>

          {/* Local Folder Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-brand-500" /> 关联本地文件夹
            </label>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  placeholder="未关联本地文件夹..."
                  value={localFolderPath}
                  className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 font-mono truncate"
                />
                <FolderOpen className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm transition shrink-0 flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" /> 选择文件夹
              </button>

              {localFolderPath && (
                <button
                  type="button"
                  onClick={() => setLocalFolderPath('')}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-xs font-semibold border border-rose-500/30 transition shrink-0 flex items-center gap-1 shadow-sm"
                  title="清除本地文件夹关联"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除关联</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              选择本地项目工作目录后，可直接在软件中一键在 Windows 资源管理器中打开该目录。
            </p>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              项目高亮主题色
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    color === c ? 'scale-110 border-slate-900 dark:border-white shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              保存项目
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
