import React from 'react';
import { Bell } from 'lucide-react';

// Notifications feature is planned for a future release.
// Props retained for forward compatibility.
interface NotificationsSectionProps {
  emailNotifs: boolean;
  setEmailNotifs: (enabled: boolean) => void;
  browserNotifs: boolean;
  setBrowserNotifs: (enabled: boolean) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = () => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-400 dark:text-rose-500">
                <Bell className="w-6 h-6" />
            </div>
            <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     Powiadomienia
                     <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 tracking-widest uppercase">
                         Wkrótce
                     </span>
                 </h2>
                 <p className="text-xs text-gray-400 font-medium mt-0.5">Alerty i komunikaty — niedostępne w tej wersji.</p>
            </div>
        </div>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 py-8 text-slate-400 dark:text-slate-600">
            <Bell className="w-10 h-10 opacity-30" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500 text-center max-w-xs">
                System powiadomień e-mail i przeglądarkowych będzie dostępny w przyszłej aktualizacji.
            </p>
        </div>
    </section>
  );
};
