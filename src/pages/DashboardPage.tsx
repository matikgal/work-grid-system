import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  getWeekOfMonth, getDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ChevronLeft, ChevronRight, Printer, Minimize2, Maximize2, Loader2, ZoomIn, ZoomOut, MoreHorizontal } from 'lucide-react';

import { MobileDayView } from '../components/MobileDayView';
import CalendarGrid from '../components/CalendarGrid';
import ShiftModal from '../components/ShiftModal';
import { useMobile } from '../hooks/useMobile';
import { PrintReport } from '../components/PrintReport';
import { InstructionsModal } from '../components/InstructionsModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { SettingsModal } from '../components/SettingsModal';
import { EmployeesManagerModal } from '../components/EmployeesManagerModal';
import { SystemResetModal } from '../components/SystemResetModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { MainLayout } from '../components/layout/MainLayout';

import { Employee, Shift, ModalState, ViewMode, ShiftTemplate } from '../types';
import { SHIFT_TEMPLATES, SHIFT_TYPES } from '../constants';
import { calculateDuration, cn, getShiftStyle } from '../utils';

// Hooks
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';

interface DashboardPageProps {
  session: Session;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ session }) => {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Custom Hooks
  const { 
    employees, 
    loading: employeesLoading, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    reorderEmployees 
  } = useEmployees(session);

  const { 
    shifts, 
    loading: shiftsLoading, 
    saveShift, 
    saveMultipleShifts,
    deleteShift 
  } = useShifts(employees, currentDate);

  const loading = employeesLoading || (shiftsLoading && employees.length > 0);

  // View Settings Persistence
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

  const [isEmployeesManagerOpen, setIsEmployeesManagerOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const isMobile = useMobile();
  
  const [manualWorkingDays, setManualWorkingDays] = useState<Record<string, number>>({});
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSystemResetOpen, setIsSystemResetOpen] = useState(false);
  const [bulkConfirmState, setBulkConfirmState] = useState<{
    isOpen: boolean;
    date: string | null;
    template: ShiftTemplate | null;
    count: number;
  }>({
    isOpen: false,
    date: null,
    template: null,
    count: 0
  });

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

  // Shift Operations
  const handleSlotClick = (employeeId: string, date: string, existingShift?: Shift) => {
    if (activeTemplate) {
      const newShiftData = {
        employeeId: employeeId,
        date,
        startTime: activeTemplate.startTime,
        endTime: activeTemplate.endTime,
        duration: calculateDuration(activeTemplate.startTime, activeTemplate.endTime),
        type: activeTemplate.label
      };
      
      if (existingShift) {
        saveShift({ ...newShiftData, id: existingShift.id });
      } else {
        saveShift(newShiftData);
      }
      return;
    }
    setModalState({ isOpen: true, employeeId, date, existingShift: existingShift || null });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleManualSaveShift = (shiftData: Shift | Omit<Shift, 'id'>) => {
    saveShift(shiftData);
  };

  const handleManualDeleteShift = (id: string) => {
    deleteShift(id);
  };

  const handleDayHeaderClick = (date: Date) => {
    if (!activeTemplate || employees.length === 0) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    
    setBulkConfirmState({
      isOpen: true,
      date: dateStr,
      template: activeTemplate,
      count: employees.length
    });
  };

  const handleBulkConfirm = async () => {
    if (!bulkConfirmState.date || !bulkConfirmState.template) return;

    const { date, template } = bulkConfirmState;
    const newShifts: (Shift | Omit<Shift, 'id'>)[] = [];

    employees.forEach(emp => {
      const existingShift = shifts.find(s => s.employeeId === emp.id && s.date === date);
      
      const shiftData = {
        employeeId: emp.id,
        date,
        startTime: template.startTime,
        endTime: template.endTime,
        duration: calculateDuration(template.startTime, template.endTime),
        type: template.label,
        id: existingShift?.id // Include ID if updating
      };
      
      newShifts.push(shiftData);
    });

    await saveMultipleShifts(newShifts);
    setBulkConfirmState(prev => ({ ...prev, isOpen: false }));
    setActiveTemplate(null); // Optional: clear selection after action
  };

  // Employee Operations
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
      onOpenInstructions={() => setIsInstructionsOpen(true)}
      onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onResetSystem={() => setIsSystemResetOpen(true)}
      headerLeft={
        !isMobile ? (
        <div className="flex items-center gap-1 md:gap-3" style={{ zoom: zoomLevel } as any}>
           <button onClick={handlePrev} className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 active:bg-slate-200 dark:active:bg-slate-700 transition-colors">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
           </button>
            <div 
              className="text-center min-w-[100px] md:min-w-[120px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-1 transition-all active:scale-95 group/today"
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
        ) : null
      }
      headerCenter={
        !isMobile ? (
        <div className="flex flex-nowrap items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm" style={{ zoom: zoomLevel } as any}>
            {SHIFT_TEMPLATES.map((template, index) => {
                const style = getShiftStyle(template.label);
                return (
                   <button
                    key={template.id}
                    onClick={() => setActiveTemplate(activeTemplate?.id === template.id ? null : template)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all active:scale-95 text-center min-w-[85px] relative group",
                      style.bg, 
                      activeTemplate?.id === template.id ? "border-slate-950 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/40 shadow-md scale-105 z-10" : cn(style.border, "border-opacity-50 shadow-sm opacity-90 hover:opacity-100 hover:border-opacity-100"),
                      style.text
                    )}
                  >
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold border border-white shadow-sm">
                      {index + 1}
                    </span>
                     <span className="whitespace-nowrap">{template.label}</span>
                   </button>
                );
            })}
        </div>
        ) : null
      }
      headerRight={
        !isMobile ? (
        <div className="flex items-center gap-2" style={{ zoom: zoomLevel } as any}>
            {/* Desktop Tools (2xl+) */}
            <div className="hidden 2xl:flex items-center gap-2">
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
                 
                 <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-1 shadow-sm h-[34px]">
                      <button 
                         onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} 
                         className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors active:scale-95"
                         disabled={zoomLevel <= 0.5}
                      >
                          <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 w-8 text-center tabular-nums">
                          {Math.round(zoomLevel * 100)}%
                      </span>
                      <button 
                         onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))} 
                         className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors active:scale-95"
                         disabled={zoomLevel >= 1.5}
                      >
                          <ZoomIn className="w-3.5 h-3.5" />
                      </button>
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
            </div>

            {/* Tablet/Laptop Mini Menu (< 2xl) */}
            <div className="2xl:hidden relative">
                <button 
                   onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                   className={cn("p-2 rounded-lg border transition-all active:scale-95", toolsMenuOpen ? "bg-slate-100 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-white" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {toolsMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setToolsMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-[70] flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                             {/* Working Days */}
                             <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                  <span className="text-[10px] uppercase font-bold text-slate-500">Dni robocze</span>
                                  <div className="flex items-center gap-1">
                                      <input 
                                         type="number" 
                                         value={workingDaysCount || ''} 
                                         onChange={handleWorkingDaysChange}
                                         className="w-8 text-center bg-transparent border-b border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold text-xs focus:outline-none p-0"
                                      />
                                  </div>
                             </div>

                             {/* Zoom */}
                             <div className="flex items-center justify-between px-2 py-1.5">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Powiększenie</span>
                                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                                      <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} disabled={zoomLevel <= 0.5} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm disabled:opacity-50"><ZoomOut className="w-3 h-3"/></button>
                                      <span className="text-[10px] font-bold w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                                      <button onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))} disabled={zoomLevel >= 1.5} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm disabled:opacity-50"><ZoomIn className="w-3 h-3"/></button>
                                  </div>
                             </div>

                             <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

                             {/* Actions */}
                             <button onClick={() => setIsCompactMode(!isCompactMode)} className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                                 {isCompactMode ? <Maximize2 className="w-3.5 h-3.5 text-emerald-600" /> : <Minimize2 className="w-3.5 h-3.5" />}
                                 {isCompactMode ? "Pełny widok" : "Tryb kompaktowy"}
                             </button>

                             <button onClick={handlePrint} className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                                 {isPrinting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Printer className="w-3.5 h-3.5" />}
                                 Drukuj grafik
                             </button>
                        </div>
                    </>
                )}
            </div>

            <div className="hidden sm:flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
               <button onClick={() => setViewMode('week')} className={cn("px-2.5 py-1.5 rounded-md transition-all", viewMode === 'week' ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")}>Tydzień</button>
               <button onClick={() => setViewMode('month')} className={cn("px-2.5 py-1.5 rounded-md transition-all", viewMode === 'month' ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200")}>Miesiąc</button>
            </div>
        </div>
        ) : null
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


          {/* Grid */}
          <div className="flex-1 overflow-hidden relative" style={!isMobile ? { zoom: zoomLevel } as any : {}}>
              {isMobile ? (
                  <MobileDayView
                    currentDate={currentDate}
                    onDateChange={setCurrentDate}
                    employees={employees}
                    shifts={shifts}
                    onSlotClick={handleSlotClick}
                    workingDaysCount={workingDaysCount}
                  />
              ) : (
                  <CalendarGrid 
                    days={daysToDisplay}
                    employees={employees}
                    shifts={shifts}
                    viewMode={viewMode}
                    isCompactMode={isCompactMode}
                    onSlotClick={handleSlotClick}
                    onDayClick={handleDayHeaderClick}
                    workingDaysCount={workingDaysCount}
                    onReorder={reorderEmployees}
                  />
              )}
          </div>

          {/* Modals */}
          <ShiftModal 
            isOpen={modalState.isOpen}
            onClose={closeModal}
            onSave={handleManualSaveShift}
            onDelete={handleManualDeleteShift}
            data={modalState}
            employeeName={activeEmployeeName}
          />

          <EmployeesManagerModal
            isOpen={isEmployeesManagerOpen}
            onClose={() => setIsEmployeesManagerOpen(false)}
            employees={employees}
            shifts={shifts}
            currentMonth={currentDate}
            onSave={handleSaveEmployee}
            onDelete={deleteEmployee}
            onReorder={reorderEmployees}
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
          <SystemResetModal
            isOpen={isSystemResetOpen}
            onClose={() => setIsSystemResetOpen(false)}
            onConfirm={() => window.location.reload()}
          />

          <ConfirmModal
            isOpen={bulkConfirmState.isOpen}
            onClose={() => setBulkConfirmState(prev => ({ ...prev, isOpen: false }))}
            onConfirm={handleBulkConfirm}
            title="Potwierdź zmianę zbiorczą"
            message={
              <div>
                Czy na pewno chcesz przypisać zmianę <strong className="text-slate-900 dark:text-white">{bulkConfirmState.template?.label}</strong> dla <strong className="text-slate-900 dark:text-white">{bulkConfirmState.count} pracowników</strong> w dniu {bulkConfirmState.date}?
                <div className="mt-2 text-sm text-slate-500">
                  Ta operacja nadpisze istniejące zmiany w tym dniu.
                </div>
              </div>
            }
            confirmLabel="Przypisz wszystkim"
            variant="warning"
          />
        </div>
    </MainLayout>
  );
};
