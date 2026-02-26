import React from 'react';
import { X, LayoutDashboard } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">O aplikacji</h3>
                <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>
            
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm">
                <div className="text-center py-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                        <LayoutDashboard className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{APP_CONFIG.APP_NAME}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">v{APP_CONFIG.APP_VERSION} (Build {APP_CONFIG.APP_BUILD})</p>
                </div>

                <p className="leading-relaxed text-center px-4">
                    {APP_CONFIG.APP_DESCRIPTION}
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Autor:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{APP_CONFIG.APP_AUTHOR}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Rok:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{APP_CONFIG.APP_YEAR}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Kontakt:</span>
                        <a href={APP_CONFIG.APP_AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                            GitHub Profil
                        </a>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400">
                    Wszelkie prawa zastrzeżone &copy; {APP_CONFIG.APP_YEAR} <br/>
                    Design & Development by {APP_CONFIG.APP_AUTHOR}
                </p>
            </div>
        </div>
    </div>
  );
};
