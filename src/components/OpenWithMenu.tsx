import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CustomOpenApp } from '../types/project';
import { 
  ExternalLink, 
  ChevronDown, 
  FolderOpen, 
  Code, 
  Terminal, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Settings,
  AppWindow,
  X
} from 'lucide-react';

interface OpenWithMenuProps {
  itemPath: string;
  isDirectory: boolean;
  extension?: string;
  size?: 'sm' | 'md';
}

const LOCAL_STORAGE_KEY = 'project_tools_custom_open_apps';

export const OpenWithMenu: React.FC<OpenWithMenuProps> = ({
  itemPath,
  isDirectory,
  extension = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; positionUpwards: boolean }>({
    top: 0,
    left: 0,
    positionUpwards: false,
  });

  const [customApps, setCustomApps] = useState<CustomOpenApp[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Load custom apps permanently from Electron IPC / UserData file
  useEffect(() => {
    const loadApps = async () => {
      if (window.electronAPI?.getCustomApps) {
        const apps = await window.electronAPI.getCustomApps();
        if (apps && Array.isArray(apps) && apps.length > 0) {
          setCustomApps(apps);
          return;
        }
      }
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setCustomApps(JSON.parse(saved));
        }
      } catch (e) {}
    };
    loadApps();
  }, []);

  const saveCustomApps = async (newApps: CustomOpenApp[]) => {
    setCustomApps(newApps);
    if (window.electronAPI?.saveCustomApps) {
      await window.electronAPI.saveCustomApps(newApps);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newApps));
    } catch (e) {}
  };

  const handleRemoveCustomApp = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = customApps.filter((a) => a.id !== id);
    await saveCustomApps(updated);
  };

  const closeMenu = () => {
    if (isClosing || !isOpen) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 170);
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isOpen) {
      closeMenu();
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const positionUpwards = spaceBelow < 320;

      setMenuCoords({
        top: positionUpwards ? rect.top - 6 : rect.bottom + 6,
        left: Math.max(12, rect.right - 216),
        positionUpwards,
      });
    }
    setIsOpen(true);
    setIsClosing(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => closeMenu();
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        const portalMenu = document.getElementById('open-with-portal-menu');
        if (portalMenu && portalMenu.contains(e.target as Node)) {
          return;
        }
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, isClosing]);

  const ext = extension.toLowerCase();
  const itemType = isDirectory ? 'folder' : (ext || 'general');

  // Filter custom apps that belong to this file extension/folder type
  const matchingCustomApps = customApps.filter(
    (app) => !app.forType || app.forType === itemType || app.forType === 'general'
  );

  const handleOpen = async (appName: string, customExePath?: string) => {
    closeMenu();
    if (window.electronAPI?.openWith) {
      const res = await window.electronAPI.openWith(itemPath, appName, customExePath);
      if (res && res.success && res.exePath && res.exeName) {
        // Record custom app for this specific file/folder type
        const exists = customApps.some(
          (a) => a.exePath.toLowerCase() === res.exePath!.toLowerCase() && a.forType === itemType
        );
        if (!exists) {
          const newApp: CustomOpenApp = {
            id: `custom-${Date.now()}`,
            name: res.exeName,
            exePath: res.exePath,
            iconDataUrl: res.iconDataUrl,
            forType: itemType,
          };
          setCustomApps([...customApps, newApp]);
        }
      }
    } else if (window.electronAPI?.openFolder && isDirectory) {
      await window.electronAPI.openFolder(itemPath);
    } else if (window.electronAPI?.openFile) {
      await window.electronAPI.openFile(itemPath);
    } else {
      alert(`以 ${appName} 打开: ${itemPath}`);
    }
  };

  const isOfficeDoc = ['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(ext);
  const isOfficeExcel = ['xls', 'xlsx', 'csv'].includes(ext);
  const isOfficePpt = ['ppt', 'pptx'].includes(ext);
  const isCode = ['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'cpp', 'rs', 'java', 'go', 'vue', 'php'].includes(ext);

  return (
    <div className="relative inline-flex items-center shrink-0" ref={buttonRef}>
      {/* Primary Open Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen('default');
        }}
        className={`bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 rounded-l-lg text-slate-700 dark:text-slate-200 font-medium transition flex items-center gap-1 border border-r-0 border-slate-200 dark:border-slate-700 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
        }`}
        title="系统默认方式打开"
      >
        <ExternalLink className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>打开</span>
      </button>

      {/* Dropdown Toggle Button */}
      <button
        onClick={handleToggleMenu}
        className={`bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 rounded-r-lg text-slate-600 dark:text-slate-300 transition border border-l-slate-300/80 dark:border-l-slate-700 border-slate-200 dark:border-slate-700 ${
          size === 'sm' ? 'px-1 py-0.5 text-[10px]' : 'px-1.5 py-1 text-[11px]'
        }`}
        title="选择打开方式 (VS Code / Word / 自定义程序等)"
      >
        <ChevronDown className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      {/* React Portal Dropdown Popup - Floating over entire document body */}
      {isOpen && createPortal(
        <div
          id="open-with-portal-menu"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: menuCoords.positionUpwards ? 'auto' : `${menuCoords.top}px`,
            bottom: menuCoords.positionUpwards ? `${window.innerHeight - menuCoords.top}px` : 'auto',
            left: `${menuCoords.left}px`,
            zIndex: 99999,
          }}
          className={`w-54 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl py-1 text-xs ${
            isClosing ? 'animate-dropdown-collapse' : 'animate-dropdown-expand'
          } overflow-hidden select-none`}
        >
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
            <span>选择打开方式</span>
            {itemType !== 'general' && (
              <span className="text-[9px] text-slate-500 font-mono">[{itemType.toUpperCase()}]</span>
            )}
          </div>

          {/* Default System Handler */}
          <button
            onClick={() => handleOpen('default')}
            className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>系统默认程序</span>
          </button>

          {/* Folders, Code Projects & Shared Type-Matching Custom Apps (The RED BOX Section) */}
          {(isDirectory || isCode || matchingCustomApps.length > 0) && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-b border-slate-100 dark:border-slate-700/60 mt-1">
                选择 IDE / 常用程序
              </div>

              <button
                onClick={() => handleOpen('vscode')}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
              >
                <Code className="w-3.5 h-3.5 text-blue-500" />
                <span>VS Code</span>
              </button>

              {isDirectory && (
                <button
                  onClick={() => handleOpen('terminal')}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>CMD 命令行终端</span>
                </button>
              )}

              {/* Shared Custom Apps for the same File Type / Folder Type */}
              {matchingCustomApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleOpen('custom', app.exePath)}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between font-medium transition cursor-pointer group/customitem text-xs"
                  title={`自定义程序 (${app.forType || '通用'}): ${app.exePath}`}
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    {app.iconDataUrl ? (
                      <img src={app.iconDataUrl} alt={app.name} className="w-3.5 h-3.5 object-contain shrink-0" />
                    ) : (
                      <AppWindow className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    )}
                    <span className="truncate">{app.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemoveCustomApp(e, app.id)}
                    className="opacity-0 group-hover/customitem:opacity-100 p-0.5 hover:bg-rose-500/20 text-rose-500 rounded transition shrink-0 ml-1"
                    title="移除该类型的常用程序记录"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Office Documents (Word / Excel / PPT) */}
          {(!isDirectory || isOfficeDoc || isOfficeExcel || isOfficePpt) && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-b border-slate-100 dark:border-slate-700/60 mt-1">
                Office / 文档软件
              </div>

              {(isOfficeDoc || !isDirectory) && (
                <button
                  onClick={() => handleOpen('word')}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Word / WPS 文字</span>
                </button>
              )}

              {(isOfficeExcel || !isDirectory) && (
                <button
                  onClick={() => handleOpen('excel')}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel / WPS 表格</span>
                </button>
              )}

              {(isOfficePpt || !isDirectory) && (
                <button
                  onClick={() => handleOpen('ppt')}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
                >
                  <Presentation className="w-3.5 h-3.5 text-amber-600" />
                  <span>PowerPoint / WPS 演示</span>
                </button>
              )}

              <button
                onClick={() => handleOpen('notepad')}
                className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>记事本 (Notepad)</span>
              </button>
            </>
          )}

          {/* System Open As / Select Other Application */}
          <div className="border-t border-slate-100 dark:border-slate-700/60 mt-1 pt-1">
            <button
              onClick={() => handleOpen('other')}
              className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>选择其他程序打开...</span>
            </button>
            <button
              onClick={() => handleOpen('browse-exe')}
              className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 font-medium transition text-[11px]"
            >
              <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>浏览选择本地 .exe 程序...</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
