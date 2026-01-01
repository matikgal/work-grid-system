import React from 'react';
import { X, RotateCcw, } from 'lucide-react';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SystemResetModal: React.FC<SystemResetModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-900/10">
            <div className="flex items-center gap-3">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg text-rose-600 dark:text-rose-400">
                    <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Przeładuj system</h2>
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
            <div className="flex gap-4 mb-6">
                
                <div className="space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                        Czy na pewno chcesz kontynuować?
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Ta operacja <strong className="text-rose-600 dark:text-rose-400">wyczyści lokalne dane aplikacji</strong> (pamięć podręczną) i wymusi ponowne załadowanie strony.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        Użyj tej opcji tylko wtedy, gdy zauważysz problemy z synchronizacją danych lub brakujące informacje po zmianach administratora.
                    </p>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                >
                    Anuluj
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Przeładuj
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
