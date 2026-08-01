import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Priority } from '../types/project';
import { ChevronDown, Check } from 'lucide-react';

export interface PriorityOption {
  value: Priority;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  itemHoverBg: string;
  icon: string;
}

export const PRIORITY_OPTIONS: Record<Priority, PriorityOption> = {
  urgent: {
    value: 'urgent',
    label: '紧急',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-600 dark:text-rose-400',
    badgeBorder: 'border-rose-500/30',
    itemHoverBg: 'hover:bg-rose-500/10 dark:hover:bg-rose-500/20',
    icon: '🔴',
  },
  high: {
    value: 'high',
    label: '高',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-600 dark:text-amber-400',
    badgeBorder: 'border-amber-500/30',
    itemHoverBg: 'hover:bg-amber-500/10 dark:hover:bg-amber-500/20',
    icon: '🟠',
  },
  medium: {
    value: 'medium',
    label: '中',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-600 dark:text-blue-400',
    badgeBorder: 'border-blue-500/30',
    itemHoverBg: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/20',
    icon: '🟡',
  },
  low: {
    value: 'low',
    label: '低',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badgeText: 'text-slate-500 dark:text-slate-400',
    badgeBorder: 'border-slate-500/30',
    itemHoverBg: 'hover:bg-slate-500/10 dark:hover:bg-slate-500/20',
    icon: '🔵',
  },
};

interface PrioritySelectProps {
  value: Priority;
  onChange: (newPriority: Priority) => void;
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
  value,
  onChange,
  size = 'sm',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; positionUpwards: boolean }>({
    top: 0,
    left: 0,
    positionUpwards: false,
  });

  const buttonRef = useRef<HTMLDivElement>(null);
  const activeConfig = PRIORITY_OPTIONS[value] || PRIORITY_OPTIONS.medium;

  const closeMenu = () => {
    if (isClosing || !isOpen) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 170);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;

    if (isOpen) {
      closeMenu();
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const positionUpwards = spaceBelow < 180;

      setCoords({
        top: positionUpwards ? rect.top - 4 : rect.bottom + 4,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 160)),
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
        const portalMenu = document.getElementById('priority-select-portal-menu');
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

  const handleSelectPriority = (e: React.MouseEvent, key: Priority) => {
    e.stopPropagation();
    e.preventDefault();
    closeMenu();
    if (key !== value) {
      onChange(key);
    }
  };

  // Size styling variants
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 rounded text-[9px] font-bold gap-0.5',
    sm: 'px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase gap-1',
    md: 'px-2.5 py-1 rounded-lg text-xs font-bold gap-1.5',
  };

  const chevronSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  return (
    <div
      ref={buttonRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={handleToggle}
      className={`inline-flex items-center cursor-pointer select-none transition-all duration-150 group border hover:shadow-sm ${
        activeConfig.badgeBg
      } ${activeConfig.badgeText} ${activeConfig.badgeBorder} ${sizeStyles[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'
      } ${className}`}
      title="点击快速切换优先级"
    >
      <span>{activeConfig.label}</span>
      <ChevronDown
        className={`${chevronSizes[size]} opacity-70 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
        }`}
      />

      {isOpen &&
        createPortal(
          <div
            id="priority-select-portal-menu"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: coords.positionUpwards ? 'auto' : `${coords.top}px`,
              bottom: coords.positionUpwards ? `${window.innerHeight - coords.top}px` : 'auto',
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className={`w-36 bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs ${
              isClosing ? 'animate-dropdown-collapse' : 'animate-dropdown-expand'
            } overflow-hidden select-none`}
          >
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 mb-0.5">
              选择优先级
            </div>

            {(Object.keys(PRIORITY_OPTIONS) as Priority[]).map((key) => {
              const opt = PRIORITY_OPTIONS[key];
              const isSelected = key === value;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => handleSelectPriority(e, key)}
                  className={`w-full px-2.5 py-1.5 text-left flex items-center justify-between font-semibold transition ${
                    opt.itemHoverBg
                  } ${isSelected ? opt.badgeText + ' bg-slate-50 dark:bg-slate-700/50' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
