import React, { useState, useMemo, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  getWeekOfMonth, getDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ChevronLeft, ChevronRight, Users, X, UserPlus, Minimize2, Maximize2, Printer, Loader2 } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/CalendarGrid';
import ShiftModal from '../components/ShiftModal';
import EmployeeModal from '../components/EmployeeModal';
import { PrintReport } from '../components/PrintReport';
import { InstructionsModal } from '../components/InstructionsModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { SettingsModal } from '../components/SettingsModal';
import { MainLayout } from '../components/layout/MainLayout';

import { Employee, Shift, ModalState, ViewMode, ShiftTemplate } from '../types';
import { SHIFT_TEMPLATES } from '../constants';
import { getRandomColor, calculateDuration, cn, getShiftStyle } from '../utils';
import { supabase } from '../lib/supabase';

export const DashboardPage: React.FC = () => {
  // --- STATE ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize state with persistence
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('grafik_viewMode') as ViewMode) || 'week';
  });
  
  const [isCompactMode, setIsCompactMode] = useState(() => {
    return localStorage.getItem('grafik_isCompactMode') === 'true';
  });

  const [showWeekends, setShowWeekends] = useState(() => {
    const stored = localStorage.getItem('grafik_showWeekends');
    return stored === null ? true : stored === 'true';
  });

  const [activeTemplate, setActiveTemplate] = useState<ShiftTemplate | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('grafik_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('grafik_isCompactMode', String(isCompactMode));
  }, [isCompactMode]);

  useEffect(() => {
    localStorage.setItem('grafik_showWeekends', String(showWeekends));
  }, [showWeekends]);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    employeeId: null,
    date: null,
    existingShift: null,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  // const [isCompactMode, setIsCompactMode] = useState(false); // MOVED UP
  const [isPrinting, setIsPrinting] = useState(false);
  
  const [manualWorkingDays, setManualWorkingDays] = useState<Record<string, number>>({});
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem('grafik_cache');
      let localEmployees: Employee[] = [];
      let localShifts: Shift[] = [];
      let lastUpdateTS = 0;

      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          localEmployees = parsed.employees || [];
          localShifts = parsed.shifts || [];
          lastUpdateTS = parsed.last_updated || 0;
          setEmployees(localEmployees);
          setShifts(localShifts);
          setLoading(false);
        } catch (e) {
          console.error("Cache corrupted");
        }
      }

      try {
        const { data: updateCheck, error: updateError } = await supabase.rpc('get_max_updated_at'); 

        let dbMaxUpdated = 0;
        if (updateError) {
          const { data: maxEmp } = await supabase.from('employees').select('updated_at').order('updated_at', { ascending: false }).limit(1).single();
          const { data: maxShift } = await supabase.from('shifts').select('updated_at').order('updated_at', { ascending: false }).limit(1).single();
          dbMaxUpdated = Math.max(
            new Date(maxEmp?.updated_at || 0).getTime(),
            new Date(maxShift?.updated_at || 0).getTime()
          );
        } else {
          dbMaxUpdated = new Date(updateCheck).getTime();
        }

        if (dbMaxUpdated > lastUpdateTS || !cachedData) {
          const { data: emps } = await supabase.from('employees').select('id, name, role, avatar_color').order('name');
          const { data: shfts } = await supabase.from('shifts').select('id, employee_id, date, start_time, end_time, duration, type');

          const mappedEmps = (emps || []).map(e => ({
            id: e.id,
            name: e.name,
            role: e.role,
            avatarColor: e.avatar_color
          }));

          const mappedShfts = (shfts || []).map(s => ({
            id: s.id,
            employeeId: s.employee_id,
            date: s.date,
            startTime: s.start_time,
            endTime: s.end_time,
            duration: s.duration,
            type: s.type
          }));

          setEmployees(mappedEmps);
          setShifts(mappedShfts);
          
          localStorage.setItem('grafik_cache', JSON.stringify({
            employees: mappedEmps,
            shifts: mappedShfts,
            last_updated: dbMaxUpdated
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const syncCache = (newEmployees: Employee[], newShifts: Shift[]) => {
    setEmployees(newEmployees);
    setShifts(newShifts);
    localStorage.setItem('grafik_cache', JSON.stringify({
      employees: newEmployees,
      shifts: newShifts,
      last_updated: Date.now()
    }));
  };

  // --- HELPERS ---
  const daysToDisplay = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  const workingDaysCount = useMemo(() => {
    const monthKey = format(currentDate, 'yyyy-MM');
    if (manualWorkingDays[monthKey] !== undefined) {
        return manualWorkingDays[monthKey];
    }

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start, end });
    const hd = new Holidays('PL');
    
    return daysInMonth.filter(day => {
      const isSunday = getDay(day) === 0;
      const isHoliday = hd.isHoliday(day);
      return !isSunday && !isHoliday;
    }).length;
  }, [currentDate, manualWorkingDays]);

  // --- HANDLERS ---
  const handleWorkingDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      const monthKey = format(currentDate, 'yyyy-MM');
      
      if (isNaN(val)) {
        setManualWorkingDays(prev => ({ ...prev, [monthKey]: 0 }));
        return;
      }
      
      if (val >= 0 && val <= 31) {
          setManualWorkingDays(prev => ({ ...prev, [monthKey]: val }));
      }
  };

  const handlePrev = () => {
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const activeEmployeeName = useMemo(() => {
    if (!modalState.employeeId) return '';
    return employees.find(e => e.id === modalState.employeeId)?.name || '';
  }, [modalState.employeeId, employees]);

  // Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const key = e.key;
      const index = parseInt(key, 10) - 1;
      if (index >= 0 && index < SHIFT_TEMPLATES.length) {
        const template = SHIFT_TEMPLATES[index];
        setActiveTemplate(activeTemplate?.id === template.id ? null : template);
      }
      if (e.key === 'Escape') setActiveTemplate(null);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTemplate]);

  // Printing
  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => { window.print(); setIsPrinting(false); }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  const handlePrint = () => setIsPrinting(true);

  // DB Operations
  const handleSlotClick = (employeeId: string, date: string, existingShift?: Shift) => {
    if (activeTemplate) {
      const newShiftData = {
        employee_id: employeeId, date, start_time: activeTemplate.startTime,
        end_time: activeTemplate.endTime, duration: calculateDuration(activeTemplate.startTime, activeTemplate.endTime),
        type: activeTemplate.label
      };
      
      const upsert = async () => {
         // Optimistic update could go here
         try {
             if (existingShift) {
                 const { data, error } = await supabase.from('shifts').update(newShiftData).eq('id', existingShift.id).select().single();
                 if (!error) {
                    const mapped = { id: data.id, employeeId: data.employee_id, date: data.date, startTime: data.start_time, endTime: data.end_time, duration: data.duration, type: data.type };
                    const newShifts = shifts.map(s => s.id === existingShift.id ? mapped : s);
                    syncCache(employees, newShifts);
                 }
             } else {
                 const { data, error } = await supabase.from('shifts').insert(newShiftData).select().single();
                 if (!error) {
                    const mapped = { id: data.id, employeeId: data.employee_id, date: data.date, startTime: data.start_time, endTime: data.end_time, duration: data.duration, type: data.type };
                    syncCache(employees, [...shifts, mapped]);
                 }
             }
         } catch (e) { console.error(e); }
      };
      upsert();
      return;
    }
    setModalState({ isOpen: true, employeeId, date, existingShift: existingShift || null });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveShift = async (shiftData: Shift | Omit<Shift, 'id'>) => {
    const supabaseData = {
      employee_id: shiftData.employeeId, date: shiftData.date, start_time: shiftData.startTime,
      end_time: shiftData.endTime, duration: shiftData.duration, type: shiftData.type
    };
    try {
      if ('id' in shiftData) {
        const { error } = await supabase.from('shifts').update(supabaseData).eq('id', shiftData.id);
        if (!error) {
            const newShifts = shifts.map(s => s.id === shiftData.id ? shiftData as Shift : s);
            syncCache(employees, newShifts);
        }
      } else {
        const { data, error } = await supabase.from('shifts').insert(supabaseData).select().single();
        if (!error) {
            const mapped = { id: data.id, employeeId: data.employee_id, date: data.date, startTime: data.start_time, endTime: data.end_time, duration: data.duration, type: data.type };
            syncCache(employees, [...shifts, mapped]);
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteShift = async (id: string) => {
      try {
          const { error } = await supabase.from('shifts').delete().eq('id', id);
          if (!error) {
              const newShifts = shifts.filter(s => s.id !== id);
              syncCache(employees, newShifts);
          }
      } catch (e) { console.error(e); }
  };

  const handleSaveEmployee = async (name: string, role: string) => {
      try {
          if (editingEmployee) {
              const { error } = await supabase.from('employees').update({ name, role }).eq('id', editingEmployee.id);
              if (!error) {
                  const newEmps = employees.map(e => e.id === editingEmployee.id ? { ...e, name, role } : e);
                  syncCache(newEmps, shifts);
                  setEditingEmployee(null);
              }
          } else {
              const newEmpData = { name, role, avatar_color: getRandomColor() };
              const { data, error } = await supabase.from('employees').insert(newEmpData).select().single();
              if (!error) {
                  const newEmps = [...employees, { id: data.id, name: data.name, role: data.role, avatarColor: data.avatar_color }];
                  syncCache(newEmps, shifts);
              }
          }
      } catch (e) { console.error(e); }
  };


  return (
    <MainLayout 
      onAddEmployee={() => setIsSidebarOpen(true)}
      onOpenInstructions={() => setIsInstructionsOpen(true)}
      onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      headerLeft={
        <div className="flex items-center gap-1 md:gap-3">
           <button onClick={handlePrev} className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
           </button>
            <div 
              className="text-center min-w-[100px] md:min-w-[150px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-1 transition-all active:scale-95 group/today"
              onClick={() => setCurrentDate(new Date())}
              title="Powrót do dzisiaj"
            >
               <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-slate-100 capitalize whitespace-nowrap leading-tight group-hover/today:text-brand-600 dark:group-hover/today:text-brand-400">
                 {viewMode === 'week' ? (
                    <>{format(currentDate, 'LLLL', { locale: pl })} <span className="text-slate-400 dark:text-slate-500 font-normal">Tydz. {getWeekOfMonth(currentDate, { weekStartsOn: 1 })}</span></>
                 ) : format(currentDate, 'LLLL yyyy', { locale: pl })}
               </h2>
            </div>
           <button onClick={handleNext} className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
           </button>
        </div>
      }
      headerCenter={
        <div className="hidden lg:flex items-center gap-1.5 px-4 py-1 max-w-full">
            {SHIFT_TEMPLATES.map((template, index) => {
                const style = getShiftStyle(template.label);
                return (
                   <button
                    key={template.id}
                    onClick={() => setActiveTemplate(activeTemplate?.id === template.id ? null : template)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all active:scale-95 text-center min-w-[85px] relative group",
                      style.bg, 
                      activeTemplate?.id === template.id ? "border-slate-800 shadow-sm" : cn(style.border, "border-opacity-50 shadow-sm opacity-90 hover:opacity-100 hover:border-opacity-100"),
                      style.text
                    )}
                  >
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white shadow-sm">
                      {index + 1}
                    </span>
                    {template.label}
                   </button>
                );
            })}
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1.5 shadow-sm h-[34px]">
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">Dni robocze:</span>
                 <input 
                    type="number" 
                    value={workingDaysCount || ''} 
                    onChange={handleWorkingDaysChange}
                    className="w-8 text-center bg-transparent border-b border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs focus:outline-none focus:border-brand-500 p-0"
                 />
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">dni</span>
            </div>

            <button 
              onClick={() => setIsCompactMode(!isCompactMode)}
              className={cn(
                  "p-2 rounded-lg transition-all border active:scale-95", 
                  isCompactMode ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600"
              )}
              title={isCompactMode ? "Pełny widok" : "Kompaktowo"}
            >
                {isCompactMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            <button 
              onClick={handlePrint}
              disabled={isPrinting}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all active:scale-95 shadow-sm disabled:opacity-50"
              title="Drukuj grafik miesiąca"
            >
                {isPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Printer className="w-3.5 h-3.5" />}
            </button>

            <div className="hidden sm:flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
               <button onClick={() => setViewMode('week')} className={cn("px-2.5 py-1.5 rounded-md transition-all", viewMode === 'week' ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")}>Tydzień</button>
               <button onClick={() => setViewMode('month')} className={cn("px-2.5 py-1.5 rounded-md transition-all", viewMode === 'month' ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")}>Miesiąc</button>
            </div>
        </div>
      }
    >
        <div className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          {/* Print Report */}
          {isPrinting && (
            <div className="print-container">
                <PrintReport 
                currentDate={currentDate} 
                employees={employees} 
                shifts={shifts} 
                viewMode={viewMode}
                />
            </div>
          )}

          {/* Sidebar Overlay */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <div className={cn(
            "absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out shadow-xl bg-white",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <Sidebar 
              employees={employees} 
              shifts={shifts} 
              currentMonth={currentDate}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onAddEmployee={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
              onEditEmployee={(emp) => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-hidden relative">
              <CalendarGrid 
                days={daysToDisplay}
                employees={employees}
                shifts={shifts}
                viewMode={viewMode}
                isCompactMode={isCompactMode}
                onSlotClick={handleSlotClick}
                workingDaysCount={workingDaysCount}
              />
          </div>

          {/* Modals */}
          <ShiftModal 
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSave={handleSaveShift}
            onDelete={handleDeleteShift}
            data={modalState}
            employeeName={activeEmployeeName}
          />
          <EmployeeModal 
            isOpen={isEmployeeModalOpen}
            onClose={() => { setIsEmployeeModalOpen(false); setEditingEmployee(null); }}
            onAdd={handleSaveEmployee}
            employee={editingEmployee}
          />
          <InstructionsModal 
            isOpen={isInstructionsOpen} 
            onClose={() => setIsInstructionsOpen(false)} 
          />
          <FeedbackModal 
            isOpen={isFeedbackModalOpen} 
            onClose={() => setIsFeedbackModalOpen(false)} 
          />
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isCompactMode={isCompactMode}
            onCompactModeChange={setIsCompactMode}
            showWeekends={showWeekends}
            onShowWeekendsChange={setShowWeekends}
          />
        </div>
    </MainLayout>
  );
};
