import React from 'react';
import { ShoppingCart, ShieldCheck } from 'lucide-react';

export const OrdersSection: React.FC = () => {
    return (
        <section id="orders" className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShoppingCart className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Zamówienia</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Składanie zamówień</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Każdy pracownik może dodać produkty do listy braków. Wystarczy wybrać kategorię, wpisać nazwę produktu i ilość.
                            Zamówienia trafiają na wspólną listę z statusem "Oczekujące".
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Panel Administratora
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Osoby uprawnione (Admin) mają dostęp do panelu, gdzie mogą zmieniać statusy zamówień:
                        </p>
                        <ul className="mt-2 text-sm space-y-2 text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400"/>
                                <span><strong>Oczekujące</strong> - nowo dodane.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-400"/>
                                <span><strong>Zamówione</strong> - towar został zamówiony u dostawcy.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"/>
                                <span><strong>Zrealizowane</strong> - towar dotarł, zamówienie zarchiwizowane.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
