import React from 'react';

// Helper icon
const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1.5 1.5-2.5 1.5-3.5a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 1 .5 2 1.5 3.5 2.5 1.8 3.5 2.5 4.6 3.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);

export const TipsSection: React.FC = () => {
    return (
        <section id="tips" className="mt-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                        <LightbulbIcon className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-2">Wskazówki</h3>
                        <ul className="space-y-2 text-slate-300 text-sm">
                            <li>• Używaj trybu kompaktowego (w Ustawieniach) na mniejszych ekranach.</li>
                            <li>• Kliknij prawym przyciskiem myszy na zmianę, aby szybko ją usunąć.</li>
                            <li>• W widoku zamówień możesz filtrować listę po kategoriach.</li>
                            <li>• Grafik zapisuje się automatycznie w czasie rzeczywistym.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};
