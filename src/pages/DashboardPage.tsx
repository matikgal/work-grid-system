import React, { useState, useMemo, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  getWeekOfMonth, getDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ChevronLeft, ChevronRight, Printer, Minimize2, Maximize2, Loader2, ZoomIn, ZoomOut } from 'lucide-react';

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
  const isMobile = useMobile();
  
  const [manualWorkingDays, setManualWorkingDays] = useState<Record<string, number>>({});
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSystemResetOpen, setIsSystemResetOpen] = useState(false);

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
        ) : null
      }
      headerCenter={
        !isMobile ? (
        <div className="hidden lg:flex items-center gap-1.5 px-4 py-1 max-w-full" style={{ zoom: zoomLevel } as any}>
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
        ) : null
      }
      headerRight={
        !isMobile ? (
        <div className="flex items-center gap-2" style={{ zoom: zoomLevel } as any}>
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
        </div>
    </MainLayout>
  );
};
