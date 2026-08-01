import React from 'react';
import { createPortal } from 'react-dom';
import { APP_VERSION_INFO } from '../config/version';
import { X, Sparkles, CheckCircle2, Calendar, ShieldCheck, Tag } from 'lucide-react';
import appLogo from '../assets/app-icon.png';

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-backdrop-fade select-none">
      <div className="bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-modal-pop">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-500 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md p-2 shadow-inner border border-white/30 shrink-0">
              <img src={appLogo} alt="ProjectTools" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{APP_VERSION_INFO.appName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold border border-white/30">
                  v{APP_VERSION_INFO.version}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">{APP_VERSION_INFO.description}</p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Metadata Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">发布日期</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
                  {APP_VERSION_INFO.releaseDate}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400">构建编号</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200 font-mono truncate">
                  {APP_VERSION_INFO.buildNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Features Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" /> 当前版本特性亮点
            </h4>
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              {APP_VERSION_INFO.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-snug">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 已是最新稳定版
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            确定
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
