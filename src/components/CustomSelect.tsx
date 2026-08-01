import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  icon,
  placeholder = '请选择',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; positionUpwards: boolean }>({
    top: 0,
    left: 0,
    width: 160,
    positionUpwards: false,
  });

  const buttonRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value) || options[0];

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

    if (isOpen) {
      closeMenu();
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const positionUpwards = spaceBelow < 220;

      setCoords({
        top: positionUpwards ? rect.top - 6 : rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 140),
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
        const portalMenu = document.getElementById('custom-select-portal-menu');
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

  const handleSelectOption = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(val);
    closeMenu();
  };

  return (
    <div
      ref={buttonRef}
      onClick={handleToggle}
      className={`relative inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 hover:border-brand-500/40 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer select-none transition-all duration-200 shadow-2xs active:scale-98 ${className}`}
    >
      <div className="flex items-center gap-1.5 min-w-0 truncate">
        {icon}
        <span className="truncate">{selectedOption?.label || placeholder}</span>
      </div>
      <ChevronDown
        className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-brand-500' : ''
        }`}
      />

      {isOpen &&
        createPortal(
          <div
            id="custom-select-portal-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: coords.positionUpwards ? 'auto' : `${coords.top}px`,
              bottom: coords.positionUpwards ? `${window.innerHeight - coords.top}px` : 'auto',
              left: `${coords.left}px`,
              minWidth: `${coords.width}px`,
              zIndex: 99999,
            }}
            className={`bg-white dark:bg-slate-900 border border-[#eeeeee] dark:border-slate-800 rounded-xl shadow-xl py-1 text-xs ${
              isClosing ? 'animate-dropdown-collapse' : 'animate-dropdown-expand'
            } overflow-hidden select-none`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleSelectOption(e, opt.value)}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between gap-2 font-medium transition-colors duration-150 ${
                    isSelected
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-500 shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
