import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, Palmtree, Lock, Unlock } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { stringToColor, cn } from '../utils';
import { SHIFT_TYPES } from '../constants';
import { shiftService } from '../services/shiftService';
import { vacationService } from '../services/vacationService';

// Modals
import { EmployeesManagerModal } from '../components/EmployeesManagerModal';
import { Employee } from '../types';
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
  const { employees: allEmployees, addEmployee, updateEmployee, deleteEmployee } = useEmployees(session);
  
  const employees = React.useMemo(() => {
    return allEmployees
      .filter(e => e.isVisibleInVacations !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allEmployees]);
  // employeeId -> [countJan, countFeb, ..., countDec]
  const [vacationCounts, setVacationCounts] = useState<Record<string, number[]>>({});
  const [vacationBalances, setVacationBalances] = useState<Record<string, number>>({});
  const [vacationManual, setVacationManual] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Modal states
  const [isEmployeesManagerOpen, setIsEmployeesManagerOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [highlightedEmployees, setHighlightedEmployees] = useState<Set<string>>(new Set());
  const isMobile = useMobile();

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
            
            // Fetch 1: Shifts (Automatic)
            const shifts = await shiftService.getShifts(empIds, start, end, SHIFT_TYPES.VACATION);
            
            const counts: Record<string, number[]> = {};
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

            // Fetch 2: External Balances (Notepad), Highlights, and Manual Adjustments
            const balances = await vacationService.getBalances(empIds, selectedYear, session.user.id);
            const balMap: Record<string, number> = {};
            const highlightSet = new Set<string>();
            const manualMap: Record<string, number[]> = {};
            
            balances.forEach(b => {
                balMap[b.employeeId] = b.days;
                if (b.isHighlighted) {
                    highlightSet.add(b.employeeId);
                }
                manualMap[b.employeeId] = b.manualDays || Array(12).fill(0);
            });
            setVacationBalances(balMap);
            setHighlightedEmployees(highlightSet);
            setVacationManual(manualMap);
        }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (employeeId: string, value: string) => {
      const days = parseInt(value) || 0;
      
      // Optimistic update
      setVacationBalances(prev => ({ ...prev, [employeeId]: days }));

      try {
          const isHighlighted = highlightedEmployees.has(employeeId);
          const manualDays = vacationManual[employeeId];
          await vacationService.upsertBalance(employeeId, session.user.id, selectedYear, { days, isHighlighted, manualDays });
      } catch(e) {
          console.error("Failed to save balance", e);
      }
  };

  const updateManualDays = async (employeeId: string, monthIndex: number, value: string) => {
      const val = parseInt(value) || 0;
      
      // Optimistic
      const currentManual = vacationManual[employeeId] || Array(12).fill(0);
      const newManual = [...currentManual];
      newManual[monthIndex] = val;
      
      setVacationManual(prev => ({ ...prev, [employeeId]: newManual }));

      try {
          const days = vacationBalances[employeeId] || 0;
          const isHighlighted = highlightedEmployees.has(employeeId);
          await vacationService.upsertBalance(employeeId, session.user.id, selectedYear, { 
              days, 
              isHighlighted, 
              manualDays: newManual 
          });
      } catch (e) {
          console.error("Failed to save manual days", e);
      }
  };

  const toggleHighlight = async (employeeId: string) => {
      const isHighlighted = highlightedEmployees.has(employeeId);
      const newStatus = !isHighlighted;

      // Optimistic update
      const newSet = new Set(highlightedEmployees);
      if (newStatus) {
          newSet.add(employeeId);
      } else {
          newSet.delete(employeeId);
      }
      setHighlightedEmployees(newSet);

      try {
          const days = vacationBalances[employeeId] || 0;
          const manualDays = vacationManual[employeeId];
          await vacationService.upsertBalance(employeeId, session.user.id, selectedYear, { days, isHighlighted: newStatus, manualDays });
      } catch (e) {
          console.error("Failed to save highlight", e);
          // Revert on error
          setHighlightedEmployees(new Set(highlightedEmployees));
      }
  };

  const handleSaveEmployee = async (employee: Employee, isNew: boolean) => {
      if (isNew) {
        addEmployee(
          employee.name, 
          employee.role, 
          employee.avatarColor,
          employee.isSeparator,
          employee.rowColor,
          employee.isVisibleInSchedule,
          employee.isVisibleInVacations
        );
      } else {
        updateEmployee(employee.id, { 
          name: employee.name, 
          role: employee.role,
          isVisibleInSchedule: employee.isVisibleInSchedule,
          isVisibleInVacations: employee.isVisibleInVacations
        });
      }
  };

  const calculateTotal = (counts: number[], manuals: number[]) => {
      return counts.reduce((a, b, i) => a + b + (manuals[i] || 0), 0);
  };

  return (
    <MainLayout
      pageTitle="Urlopy"
      onAddEmployee={() => setIsEmployeesManagerOpen(true)}
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
                     <button
                        onClick={() => setIsLocked(!isLocked)}
                        className={cn(
                            "p-2 rounded-lg transition-all border flex items-center gap-2 text-sm font-bold shadow-sm",
                            isLocked 
                                ? "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                : "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 ring-1 ring-orange-200 dark:ring-orange-800"
                        )}
                        title={isLocked ? "Odblokuj edycję" : "Zablokuj edycję"}
                     >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        <span className="hidden md:inline">{isLocked ? "Zablokowane" : "Edycja"}</span>
                     </button>

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
                            const manuals = vacationManual[emp.id] || Array(12).fill(0);
                            const total = calculateTotal(counts, manuals);
                            const balance = vacationBalances[emp.id] ?? ''; // undefined shows placeholder
                            const isTailwindClass = emp.avatarColor?.startsWith('bg-');

                            const isHighlighted = highlightedEmployees.has(emp.id);

                            return (
                                <div key={emp.id} className={cn(
                                    "rounded-xl p-4 shadow-sm border transition-all",
                                    isHighlighted 
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                )}>
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <button 
                                            disabled={isLocked}
                                            onClick={() => toggleHighlight(emp.id)}
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm transition-all",
                                                isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:scale-110 active:scale-95",
                                                emp.avatarColor
                                            )}
                                            style={!isTailwindClass ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}
                                        >
                                            {isHighlighted ? <Palmtree className="w-5 h-5 text-white" /> : emp.name.charAt(0).toUpperCase()}
                                        </button>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 dark:text-white">{emp.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400">Zeszły rok/Inne:</span>
                                                <input 
                                                    type="number" 
                                                    className="w-16 px-1.5 py-0.5 text-sm border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                                                    value={balance}
                                                    onChange={(e) => updateBalance(emp.id, e.target.value)}
                                                    placeholder="0"
                                                    disabled={isLocked}
                                                />
                                            </div>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <span className="text-xs font-bold uppercase text-slate-400 block">Razem</span>
                                            <span className="text-xl font-black text-orange-600 dark:text-orange-400">{total}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {MONTHS.map((month, idx) => (
                                            <div key={month} className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded-lg text-center">
                                                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">{month.substring(0, 3)}</span>
                                                <div className="flex justify-center items-center gap-1">
                                                    <span className={cn("text-sm font-bold", counts[idx] > 0 ? "text-slate-800 dark:text-white" : "text-slate-300 dark:text-slate-600")}>
                                                        {counts[idx] || '-'}
                                                    </span>
                                                    {!isLocked && (
                                                        <div className="flex items-center">
                                                            <span className="text-xs text-orange-500 font-bold ml-1">+</span>
                                                            <input
                                                                type="number"
                                                                value={vacationManual[emp.id]?.[idx] || 0}
                                                                onChange={(e) => updateManualDays(emp.id, idx, e.target.value)}
                                                                className="w-8 ml-1 text-center text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {isLocked && (vacationManual[emp.id]?.[idx] || 0) > 0 && (
                                                        <span className="text-xs text-orange-500 font-bold ml-1" title="Dni dodane ręcznie">
                                                            +{vacationManual[emp.id]?.[idx]}
                                                        </span>
                                                    )}
                                                </div>
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
                                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider w-[250px]">Pracownik</th>
                                {MONTHS.map(month => (
                                    <th key={month} className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">{month.substring(0, 3)}</th>
                                ))}
                                <th className="p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center bg-slate-100 dark:bg-slate-800/80 border-l border-slate-200 dark:border-slate-700">Suma</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-300 dark:divide-slate-700">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="p-8 text-center text-slate-500">Brak pracowników</td>
                                </tr>
                            ) : employees.map((emp, index) => {
                                const counts = vacationCounts[emp.id] || Array(12).fill(0);
                                const manuals = vacationManual[emp.id] || Array(12).fill(0);
                                const total = calculateTotal(counts, manuals);
                                const balanceInput = vacationBalances[emp.id] ?? 0;
                                const remaining = balanceInput - total;
                                
                                const isTailwindClass = emp.avatarColor?.startsWith('bg-');
                                const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };

                                const isEven = index % 2 === 0;
                                const isHighlighted = highlightedEmployees.has(emp.id);

                                return (
                                    <tr key={emp.id} className={cn(
                                        "group transition-colors",
                                        isHighlighted 
                                          ? "bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30" 
                                          : (isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900/50"),
                                        !isHighlighted && "hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}>
                                        <td className="p-3 border-r-2 border-slate-300 dark:border-slate-700">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <button 
                                                        disabled={isLocked}
                                                        onClick={() => toggleHighlight(emp.id)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm transition-all",
                                                            isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:scale-110 active:scale-95",
                                                            emp.avatarColor
                                                        )}
                                                        style={avatarStyle}
                                                        title={isLocked ? "Odblokuj edycję aby zaznaczyć" : "Kliknij aby wyróżnić"}
                                                    >
                                                        {isHighlighted ? <Palmtree className="w-4 h-4 text-white" /> : emp.name.charAt(0).toUpperCase()}
                                                    </button>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{emp.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">{emp.role}</div>
                                                    </div>
                                                </div>
                                                
                                            <div className="flex flex-col items-center shrink-0">
                                                    <span className="text-[9px] uppercase text-slate-400 font-bold mb-0.5">Zaległe</span>
                                                    <input 
                                                        type="number" 
                                                        className="w-16 h-8 px-1 text-sm font-bold text-center border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-300 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                                                        value={balanceInput || ''}
                                                        onChange={(e) => updateBalance(emp.id, e.target.value)}
                                                        placeholder="0"
                                                        title="Dni zaległe lub przeniesione"
                                                        disabled={isLocked}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        {counts.map((count, idx) => (
                                            <td key={idx} className="p-2 text-center border-r border-slate-200 dark:border-slate-800 last:border-0 relative">
                                                <div className="flex flex-col justify-center items-center gap-1 h-full min-h-[50px]">
                                                    {!isLocked ? (
                                                        // Unlocked view: Input is primary, Auto count is small
                                                        <div className="relative w-full h-full flex items-center justify-center">
                                                             <input
                                                                type="number"
                                                                value={manuals[idx] || 0}
                                                                onChange={(e) => updateManualDays(emp.id, idx, e.target.value)}
                                                                className="w-full max-w-[60px] h-10 text-center text-lg font-bold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                                                            />
                                                            {count > 0 && (
                                                                <div className="absolute -top-2 -right-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-200 shadow-sm z-10" title={`Urlop z grafiku: ${count}`}>
                                                                    +{count}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        // Locked view: Show Total (Auto + Manual)
                                                        <div className="flex items-center justify-center">
                                                            <span className={cn(
                                                                "font-mono text-base px-3 py-1.5 rounded-lg transition-colors",
                                                                (count + (manuals[idx] || 0)) > 0 
                                                                    ? "font-bold text-slate-800 dark:text-slate-100 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800" 
                                                                    : "text-slate-300 dark:text-slate-600"
                                                            )}>
                                                                {(count + (manuals[idx] || 0)) || '-'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                        <td className="p-3 text-center bg-slate-100 dark:bg-slate-800/40 border-l-2 border-slate-300 dark:border-slate-700">
                                            <span className={cn(
                                                "font-black text-xl",
                                                remaining < 0 ? "text-green-600 dark:text-green-400" : (remaining > 0 ? "text-orange-600 dark:text-orange-400" : "text-slate-400")
                                            )}>{remaining}</span>
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

      <EmployeesManagerModal
        isOpen={isEmployeesManagerOpen}
        onClose={() => setIsEmployeesManagerOpen(false)}
        employees={allEmployees}
        shifts={[]}
        onSave={handleSaveEmployee}
        onDelete={deleteEmployee}
      />
    </MainLayout>
  );
};
