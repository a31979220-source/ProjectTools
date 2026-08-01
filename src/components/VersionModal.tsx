import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { APP_VERSION_INFO, UpdateCheckResult } from '../config/version';
import { X, Sparkles, CheckCircle2, Calendar, ShieldCheck, Tag, Download, RefreshCw, AlertCircle } from 'lucide-react';
import appLogo from '../assets/app-icon.png';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateResult?: UpdateCheckResult | null;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose, updateResult }) => {
  const [downloadState, setDownloadState] = useState<{
    downloading: boolean;
    percent: number;
    receivedMB: string;
    totalMB: string;
    error?: string;
  }>({
    downloading: false,
    percent: 0,
    receivedMB: '0.0',
    totalMB: '0.0',
  });

  useEffect(() => {
    if (window.electronAPI?.onUpdateProgress) {
      const unsubscribe = window.electronAPI.onUpdateProgress((data) => {
        const receivedMB = (data.receivedBytes / (1024 * 1024)).toFixed(1);
        const totalMB = data.totalBytes ? (data.totalBytes / (1024 * 1024)).toFixed(1) : '0.0';
        setDownloadState({
          downloading: true,
          percent: data.percent,
          receivedMB,
          totalMB,
        });
      });
      return () => unsubscribe();
    }
  }, []);

  if (!isOpen) return null;

  const hasUpdate = updateResult?.hasUpdate ?? false;
  const remoteVersion = updateResult?.remoteVersion || APP_VERSION_INFO.version;
  const remoteInfo = updateResult?.remoteInfo;
  const features = hasUpdate && remoteInfo?.features?.length ? remoteInfo.features : APP_VERSION_INFO.features;
  const downloadUrl = remoteInfo?.downloadUrl || APP_VERSION_INFO.downloadUrl || 'https://gitee.com/zhangxiaokaiKAI/project-tools';

  const handleDownload = async () => {
    if (downloadState.downloading) return;

    // Direct exe installer URL link from GitHub Releases
    const directExeUrl = `https://github.com/a31979220-source/ProjectTools/releases/download/v${remoteVersion}/ProjectTools-Setup-${remoteVersion}.exe`;

    if (window.electronAPI?.downloadAndInstallUpdate) {
      setDownloadState({ downloading: true, percent: 0, receivedMB: '0.0', totalMB: '0.0' });
      const res = await window.electronAPI.downloadAndInstallUpdate(directExeUrl);
      if (!res.success) {
        setDownloadState({ downloading: false, percent: 0, receivedMB: '0.0', totalMB: '0.0', error: res.error });
        // Fallback to web browser open if direct download fails
        window.open(downloadUrl, '_blank');
      }
    } else {
      window.open(downloadUrl, '_blank');
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-backdrop-fade select-none">
      <div className="bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-modal-pop">
        {/* Top Header Banner (Solid Brand Color) */}
        <div className="bg-brand-500 p-5 text-white relative overflow-hidden select-none">
          <button
            onClick={onClose}
            disabled={downloadState.downloading}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md p-1.5 shadow-inner border border-white/30 shrink-0 overflow-hidden">
              <img src={appLogo} alt="ProjectTools" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg tracking-tight">{APP_VERSION_INFO.appName}</h3>
                {hasUpdate && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 text-[10px] font-mono font-bold border border-emerald-300/40 animate-pulse">
                    🚀 可升级至 v{remoteVersion}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/85 mt-0.5 truncate">
                {hasUpdate ? '发现新版本可用，建议立即更新以体验最新特性' : APP_VERSION_INFO.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4 max-h-[58vh] overflow-y-auto custom-scrollbar">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400">版本升级</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 font-mono truncate">
                  {hasUpdate ? `v${APP_VERSION_INFO.version} → v${remoteVersion}` : `v${APP_VERSION_INFO.version}`}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400">构建编号</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 font-mono truncate">
                  {remoteInfo?.buildNumber || APP_VERSION_INFO.buildNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Download Progress Bar */}
          {downloadState.downloading && (
            <div className="bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 p-3.5 rounded-xl space-y-2 animate-dropdown-expand">
              <div className="flex justify-between items-center text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {downloadState.percent >= 100 ? '下载完成，正在启动安装向导...' : '应用内极速下载更新中...'}
                </span>
                <span className="font-mono text-[11px]">
                  {downloadState.percent}% ({downloadState.receivedMB} MB / {downloadState.totalMB} MB)
                </span>
              </div>
              <div className="w-full h-2 bg-brand-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${downloadState.percent}%` }}
                />
              </div>
            </div>
          )}

          {downloadState.error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-3 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{downloadState.error}</span>
            </div>
          )}

          {/* Changelog List */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              {hasUpdate ? '更新日志与新特性说明' : '当前版本特性亮点'}
            </h4>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          {hasUpdate ? (
            <>
              <button
                onClick={onClose}
                disabled={downloadState.downloading}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                稍后提醒
              </button>
              <button
                onClick={handleDownload}
                disabled={downloadState.downloading}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/25 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {downloadState.downloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {downloadState.percent >= 100 ? '启动安装中...' : `更新中 (${downloadState.percent}%)`}
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    立即下载更新
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 当前已是最新稳定版
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                关闭
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
