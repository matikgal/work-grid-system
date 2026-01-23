import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, Palmtree } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { stringToColor, cn } from '../utils';
import { SHIFT_TYPES } from '../constants';
import { shiftService } from '../services/shiftService';

// Modals
import { SystemResetModal } from '../components/SystemResetModal';
import { InstructionsModal } from '../components/InstructionsModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { SettingsModal } from '../components/SettingsModal';
import { EmployeesManagerModal } from '../components/EmployeesManagerModal';
import { ViewMode, Employee } from '../types';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';

interface VacationsPageProps {
  session: Session;
}

const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const VacationsPage: React.FC<VacationsPageProps> = ({ session }) => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees(session);
  // employeeId -> [countJan, countFeb, ..., countDec]
  const [vacationCounts, setVacationCounts] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEmployeesManagerOpen, setIsEmployeesManagerOpen] = useState(false);
  const isMobile = useMobile();

  // Settings State 
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isCompactMode, setIsCompactMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [session.user.id, selectedYear, employees]);

  const fetchData = async () => {
    if (employees.length === 0) return;
    setLoading(true);
    try {
        const empIds = employees.map(e => e.id);
        
        if (empIds.length > 0) {
            const start = `${selectedYear}-01-01`;
            const end = `${selectedYear}-12-31`;
            
            // Fetch only VACATION type shifts
            const shifts = await shiftService.getShifts(empIds, start, end, SHIFT_TYPES.VACATION);
            
            const counts: Record<string, number[]> = {};
            
            // Initialize counts
            empIds.forEach(id => {
                counts[id] = Array(12).fill(0);
            });

            shifts.forEach(s => {
                const date = new Date(s.date);
                const monthIndex = date.getMonth(); // 0-11
                if (counts[s.employeeId]) {
                    counts[s.employeeId][monthIndex] += 1; // Assuming 1 shift = 1 day
                }
            });

            setVacationCounts(counts);
        }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmployee = async (employee: Employee, isNew: boolean) => {
      if (isNew) {
        addEmployee(employee.name, employee.role, employee.avatarColor);
      } else {
        updateEmployee(employee.id, { name: employee.name, role: employee.role });
      }
  };

  const calculateTotal = (counts: number[]) => counts.reduce((a, b) => a + b, 0);

  return (
    <MainLayout
      onAddEmployee={() => setIsEmployeesManagerOpen(true)}
      onResetSystem={() => setIsResetModalOpen(true)}
      onOpenInstructions={() => setIsInstructionsModalOpen(true)}
      onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      onOpenSettings={() => setIsSettingsModalOpen(true)}
    >
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Palmtree className="w-6 h-6 text-orange-500" />
                            Urlopy
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Podsumowanie wykorzystanych urlopów w roku</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                     <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-4 font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">{selectedYear}</span>
                        <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
                     </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 pb-24">
                {isMobile ? (
                    // Mobile Card View
                    <div className="space-y-3">
                        {employees.map((emp) => {
                            const counts = vacationCounts[emp.id] || Array(12).fill(0);
                            const total = calculateTotal(counts);
                            const isTailwindClass = emp.avatarColor?.startsWith('bg-');

                            return (
                                <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <div 
                                            className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm", emp.avatarColor)}
                                            style={!isTailwindClass ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}
                                        >
                                            {emp.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white">{emp.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="text-xs font-bold uppercase text-slate-400 mr-2">Razem:</span>
                                            <span className="text-xl font-black text-orange-600 dark:text-orange-400">{total}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {MONTHS.map((month, idx) => (
                                            <div key={month} className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg text-center">
                                                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">{month.substring(0, 3)}</span>
                                                <span className={cn("text-sm font-bold", counts[idx] > 0 ? "text-slate-800 dark:text-white" : "text-slate-300 dark:text-slate-600")}>
                                                    {counts[idx] || '-'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Desktop Table View
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Pracownik</th>
                                {MONTHS.map(month => (
                                    <th key={month} className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">{month.substring(0, 3)}</th>
                                ))}
                                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center bg-slate-100 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700">Suma</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="p-8 text-center text-slate-500">Brak pracowników</td>
                                </tr>
                            ) : employees.map((emp, index) => {
                                const counts = vacationCounts[emp.id] || Array(12).fill(0);
                                const total = calculateTotal(counts);
                                
                                const isTailwindClass = emp.avatarColor?.startsWith('bg-');
                                const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };

                                const isEven = index % 2 === 0;

                                return (
                                    <tr key={emp.id} className={cn(
                                        "group transition-colors",
                                        isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50",
                                        "hover:bg-slate-50 hover:dark:bg-slate-800/50"
                                    )}>
                                        <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                 <div 
                                                    className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm",
                                                        emp.avatarColor
                                                    )}
                                                    style={avatarStyle}
                                                >
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{emp.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{emp.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {counts.map((count, idx) => (
                                            <td key={idx} className="p-3 text-center">
                                                <span className={cn(
                                                    "font-mono text-sm",
                                                    count > 0 ? "font-bold text-slate-700 dark:text-slate-200 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded" : "text-slate-300 dark:text-slate-600"
                                                )}>
                                                    {count || '-'}
                                                </span>
                                            </td>
                                        ))}
                                        <td className="p-3 text-center bg-slate-50/50 dark:bg-slate-800/20 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/50 border-l border-slate-100 dark:border-slate-800">
                                            <span className="font-bold text-lg text-orange-600 dark:text-orange-400">{total}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>

      <SystemResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => window.location.reload()}
      />
      
      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
      />
      
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isCompactMode={isCompactMode}
        onCompactModeChange={setIsCompactMode}
        showWeekends={true}
        onShowWeekendsChange={() => {}}
      />

      <EmployeesManagerModal
        isOpen={isEmployeesManagerOpen}
        onClose={() => setIsEmployeesManagerOpen(false)}
        employees={employees}
        shifts={[]}
        onSave={handleSaveEmployee}
        onDelete={deleteEmployee}
      />
    </MainLayout>
  );
};
