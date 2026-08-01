import React from 'react';
import { createPortal } from 'react-dom';
import { APP_VERSION_INFO, UpdateCheckResult } from '../config/version';
import { X, Sparkles, CheckCircle2, Calendar, ShieldCheck, Tag, Download } from 'lucide-react';
import appLogo from '../assets/app-icon.png';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateResult?: UpdateCheckResult | null;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose, updateResult }) => {
  if (!isOpen) return null;

  const hasUpdate = updateResult?.hasUpdate ?? false;
  const remoteVersion = updateResult?.remoteVersion || APP_VERSION_INFO.version;
  const remoteInfo = updateResult?.remoteInfo;
  const features = hasUpdate && remoteInfo?.features?.length ? remoteInfo.features : APP_VERSION_INFO.features;
  const downloadUrl = remoteInfo?.downloadUrl || APP_VERSION_INFO.downloadUrl || 'https://gitee.com/zhangxiaokaiKAI/project-tools';

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-backdrop-fade select-none">
      <div className="bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-modal-pop">
        {/* Top Gradient Banner (Teal to Blue) */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 p-5 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
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
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                稍后提醒
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-500/25 transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                立即下载更新
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
