import React from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = 'Potwierdź', 
  cancelLabel = 'Anuluj',
  variant = 'warning'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-rose-100 dark:bg-rose-900/30',
          iconColor: 'text-rose-600 dark:text-rose-400',
          buttonBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
          headerBg: 'bg-rose-50/50 dark:bg-rose-900/10'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
          headerBg: 'bg-blue-50/50 dark:bg-blue-900/10'
        };
      default: // warning
        return {
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20',
          headerBg: 'bg-amber-50/50 dark:bg-amber-900/10'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn("p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between", styles.headerBg)}>
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", styles.iconBg, styles.iconColor)}>
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">{title}</h2>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="mb-6">
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {message}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2",
                      styles.buttonBg
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    {confirmLabel}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
