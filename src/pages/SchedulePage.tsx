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

import { MobileDayView } from '../components/shared/MobileDayView';
import CalendarGrid from '../components/shared/CalendarGrid';
import ShiftModal from '../components/shared/ShiftModal';
import { useMobile } from '../hooks/useMobile';
import { PrintReport } from '../components/shared/PrintReport';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { MainLayout } from '../components/layout/MainLayout';
import { useAppContext } from '../context/AppContext';

// Feature Components
import { ScheduleHeaderLeft } from '../components/features/schedule/ScheduleHeaderLeft';
import { ScheduleHeaderCenter } from '../components/features/schedule/ScheduleHeaderCenter';
import { ScheduleHeaderRight } from '../components/features/schedule/ScheduleHeaderRight';

import { Employee, Shift, ModalState, ViewMode, ShiftTemplate } from '../types';
import { SHIFT_TEMPLATES, SHIFT_TYPES } from '../constants';
import { calculateDuration, cn, getShiftStyle } from '../utils';

// Hooks
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { useMonthlyConfigs } from '../hooks/useMonthlyConfigs';

interface SchedulePageProps {
  session: Session;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ session }) => {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Custom Hooks
  const { 
    employees: allEmployees, 
    loading: employeesLoading, 
    deleteEmployee, 
    reorderEmployees 
  } = useEmployees(session);

  const employees = useMemo(() => allEmployees.filter(e => e.isVisibleInSchedule !== false), [allEmployees]);

  const { 
    shifts, 
    loading: shiftsLoading, 
    saveShift, 
    saveMultipleShifts,
    deleteShift 
  } = useShifts(employees, currentDate);

  const loading = employeesLoading || (shiftsLoading && employees.length > 0);

  // View Settings from Context
  const { 
      viewMode, setViewMode, 
      isCompactMode, setIsCompactMode, 
      showWeekends, setShowWeekends 
  } = useAppContext();

  const [activeTemplate, setActiveTemplate] = useState<ShiftTemplate | null>(null);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    employeeId: null,
    date: null,
    existingShift: null,
  });

  const [isPrinting, setIsPrinting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const isMobile = useMobile();
  
  const { manualWorkingDays, saveConfig } = useMonthlyConfigs(session);
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
      const dayOfWeek = getDay(day);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = hd.isHoliday(day);
      return !isWeekend && !isHoliday;
    }).length;
  }, [currentDate, manualWorkingDays]);

  // --- HANDLERS ---
  const handleWorkingDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value);
      const monthKey = format(currentDate, 'yyyy-MM');
      
      if (isNaN(val)) {
        saveConfig(monthKey, 0);
        return;
      }
      
      if (val >= 0 && val <= 31) {
          saveConfig(monthKey, val);
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


  return (
    <MainLayout 
      pageTitle={null}
      headerLeft={
        !isMobile ? (
          <ScheduleHeaderLeft 
            currentDate={currentDate}
            viewMode={viewMode}
            zoomLevel={zoomLevel}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={() => setCurrentDate(new Date())}
          />
        ) : null
      }
      headerCenter={
        !isMobile ? (
          <ScheduleHeaderCenter 
            activeTemplate={activeTemplate}
            onSelectTemplate={setActiveTemplate}
            zoomLevel={zoomLevel}
          />
        ) : null
      }
      headerRight={
        !isMobile ? (
          <ScheduleHeaderRight 
            workingDaysCount={workingDaysCount}
            onWorkingDaysChange={handleWorkingDaysChange}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            isCompactMode={isCompactMode}
            onCompactModeToggle={() => setIsCompactMode(!isCompactMode)}
            isPrinting={isPrinting}
            onPrint={handlePrint}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
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
                workingDaysCount={workingDaysCount}
                />
            </div>
          )}


          {/* Tutaj renderowanie głównego widoku */}
          <div className="flex-1 overflow-hidden relative">
            <div 
              className="absolute inset-0 origin-top-left transition-transform duration-200 ease-in-out" 
              style={!isMobile ? { 
                transform: `scale(${zoomLevel})`, 
                width: `${100 / zoomLevel}%`, 
                height: `${100 / zoomLevel}%` 
              } : {}}
            >
              <div className="absolute inset-0 z-0 bg-white dark:bg-slate-900 overflow-hidden custom-scrollbar flex flex-col">
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
            </div>
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

          {/* Note: Global modals (Instructions, Settings, etc.) are now in MainLayout */}

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
