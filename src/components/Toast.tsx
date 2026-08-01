import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'danger' | 'info';

interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  message,
  type = 'success',
  duration = 2500,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsClosing(false);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration]);

  if (!isOpen && !isClosing) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 180);
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-slate-300 shrink-0 animate-pulse" />,
    danger: <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />,
    info: <Info className="w-4 h-4 text-slate-300 shrink-0" />,
  };

  return createPortal(
    <div
      style={{ position: 'fixed', top: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, pointerEvents: 'none' }}
      className="flex items-center justify-center"
    >
      <div
        onClick={handleClose}
        style={{ pointerEvents: 'auto' }}
        className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/90 dark:bg-slate-800/95 text-slate-100 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs font-semibold select-none cursor-pointer ${
          isClosing ? 'animate-dropdown-collapse' : 'animate-dropdown-expand'
        }`}
      >
        {icons[type]}
        <span>{message}</span>
        <button
          onClick={handleClose}
          className="ml-1 p-0.5 hover:bg-slate-700/60 rounded-md text-slate-400 hover:text-slate-200 transition shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
};
