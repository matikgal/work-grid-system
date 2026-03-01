import React from 'react';
import { Palmtree, Lock, CheckSquare } from 'lucide-react';

export const VacationsSection: React.FC = () => {
    return (
        <section id="vacations" className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Palmtree className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Urlopy i Rozliczenia</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Automatyczne zliczanie</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                System posiada dwa niezależne moduły na dedykowanych podstronach: <strong>Urlopy</strong> i <strong>Wolne Soboty</strong>. 
                                Aplikacja samodzielnie odnajduje odpowiednie dni "U" i "WS" zadeklarowane w grafiku i sumuje je w tabeli.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Edycja Rocznej Puli</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Możesz ustalić pulę dostępnych dni urlopowych i wolnych sobót z zeszłego/obecnego roku.
                                Aby to zrobić na podstronie Urlopów/Sobot, <strong>Odblokuj edycję</strong> przyciskiem kłódki <Lock className="w-3 h-3 inline text-orange-500" />.
                            </p>
                        </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-100 dark:border-orange-900/20">
                        <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4" />
                            Dedykowane Oznaczanie
                        </h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            W widoku sumarycznym Urlopów po odblokowaniu edycji, możesz kliknąć ikonę przy pracowniku, aby wyróżnić go i zasygnalizować sobie, że wniosek urlopowy został wypisany/rozliczony u kierownictwa.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Suma (Bilans)</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Kolumna "Suma" to bieżący roczny bilans zliczony z grafików i puli bazowej. System sygnalizuje kolorami (zielony = +dodatnie dni, czerwony = -brakuje dni, szary = idealnie na 0).
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
