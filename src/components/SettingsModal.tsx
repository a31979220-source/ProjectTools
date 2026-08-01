import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Settings as SettingsIcon,
  Moon,
  Sun,
  FolderInput,
  FolderOpen,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Download,
  Sparkles,
} from 'lucide-react';
import { ToastType } from './Toast';
import { checkRemoteUpdate, UpdateCheckResult } from '../config/version';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  downloadPath: string;
  onChangeDownloadPath: (path: string) => void;
  onShowToast?: (message: string, type?: ToastType) => void;
  onCheckUpdate?: () => Promise<UpdateCheckResult | null>;
  updateResult?: UpdateCheckResult | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  downloadPath,
  onChangeDownloadPath,
  onShowToast,
  onCheckUpdate,
  updateResult: externalUpdateResult,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setUpdateResult(externalUpdateResult || null);
    }
  }, [isOpen, externalUpdateResult]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 180);
  };

  const handleSelectDownloadFolder = async () => {
    if (window.electronAPI?.selectDownloadFolder) {
      const selected = await window.electronAPI.selectDownloadFolder();
      if (selected) {
        onChangeDownloadPath(selected);
        if (onShowToast) {
          onShowToast('已设置默认下载目录，后续所有导出文件将保存到该文件夹', 'success');
        }
      }
    } else {
      // Web fallback: prompt user for path
      const input = prompt('请输入默认下载文件夹的绝对路径（例如 D:\\Downloads）:', downloadPath);
      if (input !== null) {
        const trimmed = input.trim();
        if (trimmed) {
          onChangeDownloadPath(trimmed);
          if (onShowToast) {
            onShowToast('已设置默认下载目录', 'success');
          }
        }
      }
    }
  };

  const handleOpenDownloadFolder = async () => {
    if (!downloadPath) return;
    if (window.electronAPI?.openFolder) {
      const ok = await window.electronAPI.openFolder(downloadPath);
      if (!ok && onShowToast) {
        onShowToast('无法打开该目录，请确认路径是否存在', 'danger');
      }
    } else if (onShowToast) {
      onShowToast('当前环境不支持直接打开本地目录', 'info');
    }
  };

  const handleClearDownloadFolder = () => {
    onChangeDownloadPath('');
    if (onShowToast) {
      onShowToast('已清除默认下载目录，将恢复为浏览器默认下载行为', 'info');
    }
  };

  const handleCheckUpdate = async (): Promise<UpdateCheckResult | null> => {
    if (isCheckingUpdate) return null;
    setIsCheckingUpdate(true);
    try {
      let result: UpdateCheckResult | null = null;
      if (onCheckUpdate) {
        result = await onCheckUpdate();
      } else {
        result = await checkRemoteUpdate();
      }
      setIsCheckingUpdate(false);
      setUpdateResult(result);

      if (!result) {
        if (onShowToast) onShowToast('⚠️ 检查更新失败，请重试', 'danger');
        return result;
      }
      if (result.error) {
        if (onShowToast) onShowToast(`⚠️ ${result.error}`, 'danger');
      } else if (result.hasUpdate) {
        if (onShowToast) onShowToast(`🚀 发现新版本 v${result.remoteVersion}，建议立即更新！`, 'info');
      } else {
        if (onShowToast) onShowToast(`🎉 当前已是最新版本 (v${result.currentVersion})`, 'success');
      }
      return result;
    } catch (e) {
      setIsCheckingUpdate(false);
      if (onShowToast) onShowToast('⚠️ 检查更新失败，请重试', 'danger');
      return null;
    }
  };

  // Shorten displayed path for UI (keep the trailing folder name)
  const displayPath = (() => {
    if (!downloadPath) return '';
    const parts = downloadPath.split(/[\\/]/).filter(Boolean);
    if (parts.length <= 3) return downloadPath;
    return `...${parts.slice(-3).join('\\')}`;
  })();

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 transition-all duration-200 ${
          isClosing ? 'animate-dropdown-collapse' : 'animate-dropdown-expand'
        }`}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-brand-500/8 via-brand-500/4 to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 shrink-0">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate">
                应用设置
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                个性化外观、下载路径与软件更新
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {/* 1. Theme */}
          <section>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                外观主题
              </h4>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-lg border shrink-0 ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-amber-300 border-slate-700'
                      : 'bg-white text-indigo-500 border-slate-200'
                  }`}
                >
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {theme === 'dark' ? '深色模式' : '浅色模式'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    点击右侧按钮在浅色 / 深色之间即时切换
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" /> 切换为浅色
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> 切换为深色
                  </>
                )}
              </button>
            </div>
          </section>

          {/* 2. Download Path */}
          <section>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                自选下载路径
              </h4>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 p-3 space-y-2.5">
              {downloadPath ? (
                <>
                  <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                    <FolderInput className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-700 dark:text-slate-200 truncate" title={downloadPath}>
                        {displayPath}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3 h-3" />
                        已启用 · 所有导出文件将自动保存到此目录
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleOpenDownloadFolder}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95"
                      title="在资源管理器中打开此目录"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-brand-500" /> 打开
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectDownloadFolder}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20 transition active:scale-95"
                      title="重新选择下载目录"
                    >
                      <FolderInput className="w-3.5 h-3.5" /> 更改
                    </button>
                    <button
                      type="button"
                      onClick={handleClearDownloadFolder}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/30 transition active:scale-95"
                      title="恢复为浏览器默认下载行为"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> 清除
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      当前未设置下载目录，导出的备份文件将使用系统浏览器默认下载位置。
                      <br />
                      设置后，所有导出的文件（如 JSON 备份）会自动保存到指定目录。
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectDownloadFolder}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20 transition active:scale-95"
                  >
                    <FolderInput className="w-3.5 h-3.5" /> 选择默认下载目录
                  </button>
                </>
              )}
            </div>
          </section>

          {/* 3. Check Update */}
          <section>
            <div className="flex items-center gap-1.5 mb-2.5">
              <RefreshCw className="w-3.5 h-3.5 text-brand-500" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                软件更新
              </h4>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 p-3 space-y-2.5">
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-70"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-brand-500 ${isCheckingUpdate ? 'animate-spin' : ''}`}
                />
                {isCheckingUpdate ? '正在检查最新版本...' : '检查软件最新版本'}
              </button>

              {updateResult && !updateResult.error && !updateResult.hasUpdate && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>当前已是最新版本 (v{updateResult.currentVersion})</span>
                </div>
              )}

              {updateResult?.error && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{updateResult.error}</span>
                </div>
              )}

              {updateResult?.hasUpdate && (
                <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-[11px] text-brand-600 dark:text-brand-400">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>发现新版本 v{updateResult.remoteVersion}，建议立即更新</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/25 transition active:scale-95"
          >
            完成
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
