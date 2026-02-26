import React from 'react';
import { Bell, Check } from '@phosphor-icons/react';
import { cn } from '../../../utils';

interface NotificationsSectionProps {
  emailNotifs: boolean;
  setEmailNotifs: (enabled: boolean) => void;
  browserNotifs: boolean;
  setBrowserNotifs: (enabled: boolean) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({ 
  emailNotifs, 
  setEmailNotifs, 
  browserNotifs, 
  setBrowserNotifs 
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-400">
                <Bell className="w-6 h-6" weight="duotone" />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Powiadomienia</h2>
                 <p className="text-xs text-gray-400 font-medium">Alerty i komunikaty</p>
            </div>
        </div>

        <div className="space-y-4 w-full">
             <div 
                onClick={() => setEmailNotifs(!emailNotifs)}
                className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group bg-gray-50/50 dark:bg-slate-950/30"
             >
                <div className="flex items-center gap-4">
                     <div className={cn(
                         "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                         emailNotifs 
                            ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20" 
                            : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 group-hover:border-brand-400 dark:group-hover:border-brand-500"
                     )}>
                         {emailNotifs && <Check className="w-3.5 h-3.5" weight="bold" />}
                     </div>
                     <div>
                         <span className="block text-sm font-bold text-gray-900 dark:text-white">Powiadomienia E-mail</span>
                         <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Otrzymuj podsumowania zmian na e-mail.</span>
                     </div>
                </div>
             </div>

             <div 
                onClick={() => setBrowserNotifs(!browserNotifs)}
                className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group bg-gray-50/50 dark:bg-slate-950/30"
             >
                <div className="flex items-center gap-4">
                     <div className={cn(
                         "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                         browserNotifs 
                            ? "bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20" 
                            : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 group-hover:border-brand-400 dark:group-hover:border-brand-500"
                     )}>
                         {browserNotifs && <Check className="w-3.5 h-3.5" weight="bold" />}
                     </div>
                     <div>
                         <span className="block text-sm font-bold text-gray-900 dark:text-white">Powiadomienia w przeglądarce</span>
                         <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Pokaż alerty o ważnych zdarzeniach w rogu ekranu.</span>
                     </div>
                </div>
                {browserNotifs && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-500/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/30">WŁĄCZONE</span>}
             </div>
        </div>
    </section>
  );
};
