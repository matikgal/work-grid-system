import React, { useState } from 'react';
import { Menu, LogOut, Calendar, Home, Settings, X, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils'; // Assuming cn is available in utils, or inline it if simple

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { icon: Calendar, label: 'Harmonogram', sub: 'Grafik zmian', active: true },
    { icon: Home, label: 'Dashboard', sub: 'Statystyki', disabled: true },
    { icon: Settings, label: 'Ustawienia', sub: 'Konfiguracja', disabled: true },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAFA] font-sans text-slate-900">
       {/* Global Header - Clean & Minimal */}
       <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-gray-100 z-50 shrink-0">
          
          <div className="flex items-center gap-5">
             <button 
                onClick={() => setIsMenuOpen(true)} 
                className="group p-2 -ml-2 hover:bg-gray-50 rounded-full transition-all active:scale-95"
             >
                 <Menu className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
             </button>
             
             <div className="ml-2 select-none">
                <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">System Grafik</h1>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <span className="text-sm font-bold text-slate-700">Admin</span>
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    A
                </div>
             </div>
          </div>
       </header>

       {/* Modern Navigation Drawer */}
       {/* Overlay */}
       <div 
          className={cn(
            "fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300",
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMenuOpen(false)}
       />
       
       {/* Sidebar Panel */}
       <div 
          className={cn(
            "fixed inset-y-0 left-0 z-[101] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col",
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
       >
           {/* Sidebar Header */}
           <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
               <span className="text-lg font-bold text-slate-900 tracking-tight">Menu</span>
               <button 
                 onClick={() => setIsMenuOpen(false)} 
                 className="p-2 hover:bg-gray-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
               >
                   <X className="w-5 h-5" />
               </button>
           </div>
           
           {/* Menu Items */}
           <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
               <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-3">Aplikacje</div>
               
               {menuItems.map((item, index) => (
                   <button 
                     key={index}
                     disabled={item.disabled}
                     onClick={() => !item.disabled && setIsMenuOpen(false)}
                     className={cn(
                       "w-full flex items-center justify-between p-3 rounded-xl transition-all group relative overflow-hidden",
                       item.active 
                         ? "bg-emerald-50 text-emerald-900" 
                         : "text-slate-600 hover:bg-gray-50 hover:text-slate-900",
                       item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                     )}
                   >
                       <div className="flex items-center gap-4 relative z-10">
                           <item.icon className={cn("w-5 h-5", item.active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={2} />
                           <div className="text-left">
                               <div className="text-sm font-semibold">{item.label}</div>
                               <div className="text-[10px] opacity-70 font-medium">{item.sub}</div>
                           </div>
                       </div>
                       {item.active && <ChevronRight className="w-4 h-4 text-emerald-500" />}
                   </button>
               ))}
           </nav>

           {/* Sidebar Footer */}
           <div className="p-6 border-t border-gray-50 bg-gray-50/50">
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow"
               >
                   <LogOut className="w-4 h-4" />
                   Wyloguj się
               </button>
               <p className="text-center text-[10px] text-slate-300 mt-4 font-medium">v2.1.0 • Build 2025</p>
           </div>
       </div>

       {/* Page Content */}
       <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
       </main>
    </div>
  );
};
