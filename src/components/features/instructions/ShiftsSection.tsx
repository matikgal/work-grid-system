import React from 'react';
import { Layout, MousePointerClick, Printer } from 'lucide-react';

export const ShiftsSection: React.FC = () => {
    return (
        <section id="shifts" className="space-y-4">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Layout className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Obsługa Grafiku</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        <MousePointerClick className="w-4 h-4 text-blue-500" />
                        Dodawanie i Edycja Zmian
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                        Aby dodać lub zmienić zmianę, kliknij na wybraną komórkę w grafiku. Pojawi się okno wyboru typu zmiany.
                        Możesz wybrać standardowe godziny pracy lub inne typy absencji (Urlop, L4, itp.).
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span><strong>Zmiana (6-14, 14-22)</strong> - Standardowe godziny pracy.</span>
                        </li>
                        <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                            <span><strong>Urlop (W)</strong> - Dni wolne od pracy, wliczane do puli urlopowej.</span>
                        </li>
                        <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span><strong>Chorobowe (L4)</strong> - Nieobecność chorobowa.</span>
                        </li>
                        <li className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                            <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                            <span><strong>Wolne (UŻ)</strong> - Urlop na żądanie lub okolicznościowy.</span>
                        </li>
                    </ul>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                        <Printer className="w-4 h-4 text-purple-500" />
                        Drukowanie i Eksport
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        W prawym górnym rogu znajduje się przycisk drukarki. Otwiera on podgląd wydruku zoptymalizowany pod format A4.
                        Możesz wydrukować aktualny widok miesiąca.
                    </p>
                </div>
            </div>
        </div>
    </section>
    );
};
