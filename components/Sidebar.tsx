import React from 'react';
import { Plus, Users, Clock } from 'lucide-react';
import { Employee, Shift } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  employees: Employee[];
  shifts: Shift[];
  currentMonth: Date;
  onAddEmployee: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ employees, shifts, currentMonth, onAddEmployee }) => {
  
  // Calculate total monthly hours for an employee
  const getMonthlyHours = (employeeId: string) => {
    const monthStr = currentMonth.toISOString().slice(0, 7); // YYYY-MM
    return shifts
      .filter(s => s.employeeId === employeeId && s.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.duration, 0);
  };

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 shadow-sm z-10">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-brand-600 p-2 rounded-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Zespół</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1 pl-11">
          Zarządzanie czasem pracy
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {employees.map((emp) => {
          const hours = getMonthlyHours(emp.id);
          return (
            <div 
              key={emp.id} 
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm",
                  emp.avatarColor
                )}>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{emp.name}</p>
                  <p className="text-xs text-slate-400 font-medium">{emp.role}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-slate-600">
                  <Clock className="w-3 h-3" />
                  <span className="text-sm font-bold">{hours}h</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Msc</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
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
