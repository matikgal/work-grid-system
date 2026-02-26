import React from 'react';
import { User, FloppyDisk } from '@phosphor-icons/react';

interface ProfileSectionProps {
  localUserName: string;
  userName: string;
  setLocalUserName: (name: string) => void;
  isSavingProfile: boolean;
  onSaveProfile: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ 
    localUserName, 
    userName, 
    setLocalUserName, 
    isSavingProfile, 
    onSaveProfile 
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                <User className="w-6 h-6" weight="duotone" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Twój Profil</h2>
                <p className="text-xs text-gray-400 font-medium">Dane personalne</p>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 dark:text-slate-600 border border-dashed border-gray-200 dark:border-slate-700 shrink-0">
                <User className="w-10 h-10" weight="fill" />
            </div>
            <div className="flex-1 space-y-5 w-full">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nazwa wyświetlana</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="text" 
                            value={localUserName}
                            onChange={(e) => setLocalUserName(e.target.value)}
                            placeholder="Wpisz swoje imię..."
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white placeholder:text-gray-400 font-medium transition-all w-full"
                        />
                        <button 
                            onClick={onSaveProfile}
                            disabled={isSavingProfile || localUserName === userName}
                            className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 active:scale-95 transform w-full sm:w-auto"
                        >
                            {isSavingProfile ? '...' : <><FloppyDisk className="w-5 h-5" weight="fill" /> Zapisz</>}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-medium">To imię będzie widoczne na pulpicie w sekcji powitalnej.</p>
                </div>
            </div>
        </div>
    </section>
  );
};
