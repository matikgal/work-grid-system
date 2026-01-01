import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MainLayout } from '../components/layout/MainLayout';
import { stringToColor, cn } from '../utils';

// Modals
import { SystemResetModal } from '../components/SystemResetModal';
import { InstructionsModal } from '../components/InstructionsModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { SettingsModal } from '../components/SettingsModal';
import { EmployeesManagerModal } from '../components/EmployeesManagerModal';
import { ViewMode, Employee } from '../types';
import { useMobile } from '../hooks/useMobile';
import { useEmployees } from '../hooks/useEmployees';

interface FreeSaturdaysPageProps {
  session: Session;
}

interface WsAdjustment {
  id: string;
  employee_id: string;
  adjustment: number;
}

export const FreeSaturdaysPage: React.FC<FreeSaturdaysPageProps> = ({ session }) => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees(session);
  const [adjustments, setAdjustments] = useState<WsAdjustment[]>([]);
  const [shiftsCount, setShiftsCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLocked, setIsLocked] = useState(true);

  // Modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEmployeesManagerOpen, setIsEmployeesManagerOpen] = useState(false);
  const isMobile = useMobile();

  // Settings State (Stub for now, or local)
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isCompactMode, setIsCompactMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [session.user.id, selectedYear, employees]); // Depend on employees to refresh counts when employees load

  const fetchData = async () => {
    if (employees.length === 0) return;
    setLoading(true);
    try {
        const empIds = employees.map(e => e.id);
        
        if (empIds.length > 0) {
            // 2. Fetch Shifts (Wolna Sobota only) for the year
            const start = `${selectedYear}-01-01`;
            const end = `${selectedYear}-12-31`;
            
            const { data: shifts } = await supabase
                .from('shifts')
                .select('employee_id')
                .in('employee_id', empIds)
                .eq('type', 'Wolna Sobota')
                .gte('date', start)
                .lte('date', end);
            
            const counts: Record<string, number> = {};
            shifts?.forEach(s => {
                counts[s.employee_id] = (counts[s.employee_id] || 0) + 1;
            });
            setShiftsCount(counts);

            // 3. Fetch Adjustments
            const { data: adjs } = await supabase
                .from('ws_adjustments')
                .select('id, employee_id, adjustment')
                .eq('user_id', session.user.id)
                .eq('year', selectedYear)
                .in('employee_id', empIds);
                
            setAdjustments(adjs || []);
        }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAdjustment = async (employeeId: string, delta: number) => {
    const existing = adjustments.find(a => a.employee_id === employeeId);
    const newVal = (existing?.adjustment || 0) + delta;
    
    // Optimistic update
    if (existing) {
        setAdjustments(prev => prev.map(a => a.id === existing.id ? { ...a, adjustment: newVal } : a));
    } else {
        setAdjustments(prev => [...prev, { id: 'temp-' + employeeId, employee_id: employeeId, adjustment: newVal }]);
    }

    try {
        const { data, error } = await supabase
            .from('ws_adjustments')
            .upsert({
                employee_id: employeeId,
                user_id: session.user.id,
                year: selectedYear,
                adjustment: newVal
            }, { onConflict: 'employee_id, year' })
            .select()
            .single();

        if (error) throw error;
        
        setAdjustments(prev => {
            const filtered = prev.filter(a => a.employee_id !== employeeId);
            return [...filtered, { id: data.id, employee_id: data.employee_id, adjustment: data.adjustment }];
        });
    } catch (e) {
        console.error("Error updating adjustment", e);
        fetchData(); // revert
    }
  };

  const handleSaveEmployee = async (employee: Employee, isNew: boolean) => {
      if (isNew) {
        addEmployee(employee.name, employee.role, employee.avatarColor);
      } else {
        updateEmployee(employee.id, { name: employee.name, role: employee.role });
      }
  };

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
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Wolne Soboty</h1>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Podsumowanie i rozliczenie roczne</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                     <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button onClick={() => setSelectedYear(y => y - 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-4 font-bold text-slate-700 dark:text-slate-200 text-sm md:text-base">{selectedYear}</span>
                        <button onClick={() => setSelectedYear(y => y + 1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
                     </div>

                     <button 
                        onClick={() => setIsLocked(!isLocked)}
                        className={cn(
                        "flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium transition-all shadow-sm text-sm",
                        !isLocked ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500"
                        )}
                    >
                        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        <span className="hidden md:inline">{isLocked ? "Zablokowany" : "Edycja włączona"}</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 pb-24">
                {isMobile ? (
                    // Mobile Card View
                    <div className="space-y-3">
                        {employees.map((emp) => {
                            const fromGrid = shiftsCount[emp.id] || 0;
                            const adj = adjustments.find(a => a.employee_id === emp.id)?.adjustment || 0;
                            const total = fromGrid + adj;
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
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Grafik</span>
                                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{fromGrid}</p>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center flex flex-col items-center">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Korekta</span>
                                            <div className="flex items-center gap-2">
                                                {!isLocked && (
                                                    <button 
                                                    onClick={() => updateAdjustment(emp.id, -1)}
                                                    className="w-6 h-6 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-600 active:scale-95"
                                                    >
                                                        -
                                                    </button>
                                                )}
                                                <span className={cn("font-bold", adj !== 0 ? "text-brand-600 dark:text-brand-400" : "text-slate-400")}>{adj > 0 ? `+${adj}` : adj}</span>
                                                {!isLocked && (
                                                    <button 
                                                    onClick={() => updateAdjustment(emp.id, 1)}
                                                    className="w-6 h-6 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-600 active:scale-95"
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Razem</span>
                                            <p className="text-lg font-black text-slate-800 dark:text-white">{total}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Desktop Table View
                    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Pracownik</th>
                                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">Z Grafiku</th>
                                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">Korekta</th>
                                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center bg-slate-100 dark:bg-slate-800/80">Suma</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">Brak pracowników</td>
                                </tr>
                            ) : employees.map((emp, index) => {
                                const fromGrid = shiftsCount[emp.id] || 0;
                                const adj = adjustments.find(a => a.employee_id === emp.id)?.adjustment || 0;
                                const total = fromGrid + adj;
                                
                                const isTailwindClass = emp.avatarColor?.startsWith('bg-');
                                const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };

                                const isEven = index % 2 === 0;

                                return (
                                    <tr key={emp.id} className={cn(
                                        "group transition-colors",
                                        isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50",
                                        "hover:bg-slate-50 hover:dark:bg-slate-800/50"
                                    )}>
                                        <td className="p-2 md:p-3">
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
                                        <td className="p-2 md:p-3 text-center">
                                            <span className="font-mono text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{fromGrid}</span>
                                        </td>
                                        <td className="p-2 md:p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {!isLocked && (
                                                    <button 
                                                    onClick={() => updateAdjustment(emp.id, -1)}
                                                    className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                )}
                                                <span className={cn("font-bold w-6 text-sm", adj !== 0 ? "text-brand-600 dark:text-brand-400" : "text-slate-300")}>
                                                    {adj > 0 ? `+${adj}` : adj}
                                                </span>
                                                {!isLocked && (
                                                    <button 
                                                    onClick={() => updateAdjustment(emp.id, 1)}
                                                    className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-2 md:p-3 text-center bg-slate-50/50 dark:bg-slate-800/20 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/50 border-l border-slate-100 dark:border-slate-800">
                                            <span className="font-bold text-lg text-slate-800 dark:text-white">{total}</span>
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
