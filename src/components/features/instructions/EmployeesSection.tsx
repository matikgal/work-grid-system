import React from 'react';
import { UsersRound, List, Settings } from 'lucide-react';

export const EmployeesSection: React.FC = () => {
    return (
        <section id="employees" className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <UsersRound className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Pracownicy i Separatory</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6">
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                        W zakładce "Zarządzaj pracownikami" możesz dodawać nowe osoby, edytować ich dane oraz ustalać ich widoczność.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <List className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <strong className="text-slate-900 dark:text-white text-sm block">Separatory i Sortowanie</strong>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Możesz włączyć tryb "Separator" na dowolnym pracowniku, wtedy będzie służył jako nagłówek na grafiku (np. Kasjerzy, Mięso). Możesz także sortować listę łapiąc pracowników za uchwyt z lewej strony i przesuwając ich w górę bądź wdół.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Settings className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <strong className="text-slate-900 dark:text-white text-sm block">Widoczność i Role</strong>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Każdego pracownika można ukryć w konkretnym module (Grafik, Urlopy, Wolne Soboty). Można im również przypisywać Role widoczne tylko dla szefostwa albo ustawiać ich niestandardowy awatar (losowy kolor inicjałów).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
