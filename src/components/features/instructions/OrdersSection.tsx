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
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tworzenie list (zamówień)</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Zamówienia są teraz grupowane w konkretne listy (np. "Dostawa z hurtowni", "Warzywa na wtorek").
                            Po wejściu w wybraną listę, możesz płynnie dodawać produkty wpisując pożądane ilości asortymentu w intuicyjnym interfejsie kalkulatorowym.
                        </p>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Statusy i Modele Pracy
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                            Produkty z listy mogą przyjmować stany postępu: Brak, W Koszyku lub Zrealizowane (zielone). Dodatkowo zablokowanie całego zamówienia blokuje dodawanie nowych rzeczy do koszyka.
                        </p>
                        <ul className="mt-2 text-sm space-y-2 text-slate-600 dark:text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400"/>
                                <span><strong>Kłódka na liście</strong> - Możliwość zablokowania po akceptacji kierownika.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"/>
                                <span><strong>Link Publiczny</strong> - Przekazuj link do wglądu kurierowi lub na telefon na hale, aby klikać "W koszyku" podczas zakupów (Tryb Read Only + Odhaczanie).</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
