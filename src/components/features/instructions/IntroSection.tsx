import React from 'react';
import { Info } from 'lucide-react';

export const IntroSection: React.FC = () => {
    return (
        <section id="intro" className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Info className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Wprowadzenie</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>Work Grid System to narzędzie wspomagające zarządzanie czasem pracy, urlopami oraz zamówieniami w firmie. System został zaprojektowany z myślą o prostocie i szybkości działania, oferując jednocześnie zaawansowane funkcje dla administratorów.</p>
            </div>
        </section>
    );
};
