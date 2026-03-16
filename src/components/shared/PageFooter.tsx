import React from 'react';
import { Github } from 'lucide-react';
import { APP_CONFIG } from '../../config/app';

export const PageFooter: React.FC = () => {
    return (
         <div className="shrink-0 border-t border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm p-4 w-full">
             <div className="max-w-[1920px] mx-auto w-full flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                 <div className="flex items-center gap-1">
                     <span>Autor:</span>
                     <a
                        href="https://matikgal.github.io/portfolio/contact"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold"
                     >
                        <Github className="w-3.5 h-3.5" />
                        {APP_CONFIG.APP_AUTHOR}
                     </a>
                 </div>

                 <div className="flex items-center gap-4">
                     <span className="opacity-50 hidden sm:inline">{APP_CONFIG.APP_NAME}</span>
                     <div className="flex items-center gap-2">
                         <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 font-mono text-[10px]">v{APP_CONFIG.APP_VERSION}</span>
                         <span>&copy; {APP_CONFIG.APP_YEAR}</span>
                     </div>
                 </div>
             </div>
         </div>
    );
};
