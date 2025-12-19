import React from 'react';
import { Plus, Users, Clock, X, Layout, LayoutList, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Employee, Shift, ViewMode } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  employees: Employee[];
  shifts: Shift[];
  currentMonth: Date;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ employees, shifts, currentMonth, viewMode, setViewMode, onAddEmployee, onEditEmployee, onClose }) => {
  
  // Calculate total monthly hours for an employee
  const getMonthlyHours = (employeeId: string) => {
    const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
    return shifts
      .filter(s => s.employeeId === employeeId && s.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.duration, 0);
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 shadow-sm z-10 relative">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-brand-600 p-2 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Pracownicy</h1>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {format(currentMonth, 'LLLL yyyy', { locale: pl })}
            </p>
          </div>
        </div>
        
        {onClose && (
           <button 
             onClick={onClose}
             className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
        )}
      </div>

       {/* Mobile Tools Section - ONLY on mobile sidebar */}
       <div className="md:hidden p-4 border-b border-slate-100 bg-slate-50/30 space-y-3">
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Narzędzia</p>
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
             <button 
               onClick={() => { setViewMode('week'); onClose?.(); }}
               className={cn(
                 "flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all text-sm font-medium",
                 viewMode === 'week' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
               <Layout className="w-4 h-4" /> Tydzień
             </button>
             <button 
               onClick={() => { setViewMode('month'); onClose?.(); }}
               className={cn(
                 "flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all text-sm font-medium",
                 viewMode === 'month' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
               <LayoutList className="w-4 h-4" /> Miesiąc
             </button>
          </div>
       </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {employees.map((emp) => {
          const hours = getMonthlyHours(emp.id);
          return (
            <div 
              key={emp.id} 
              onClick={() => onEditEmployee(emp)}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  emp.avatarColor || "bg-slate-100 text-slate-500"
                )}>
                    {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{emp.name}</p>
                  <p className="text-xs text-slate-400">{emp.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-slate-600">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm font-bold">{hours}h</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
        <button
          onClick={onAddEmployee}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Dodaj Pracownika
        </button>
        
      </div>
    </aside>
  );
};

export default Sidebar;
