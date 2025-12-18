import React, { useState, useMemo, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  getWeekOfMonth, getDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ChevronLeft, ChevronRight, Users, X, UserPlus, Minimize2, Maximize2 } from 'lucide-react';

import Sidebar from '../components/Sidebar';
import CalendarGrid from '../components/CalendarGrid';
import ShiftModal from '../components/ShiftModal';
import EmployeeModal from '../components/EmployeeModal';

import { Employee, Shift, ModalState, ViewMode, ShiftTemplate } from '../types';
import { SHIFT_TEMPLATES } from '../constants';
import { getRandomColor, calculateDuration, cn } from '../utils';
import { supabase } from '../lib/supabase';

// Props inherited from parent or fetched here? 
// Current App logic fetches data. Let's keep data fetching here for the specific page or move to a Context/Hook later.
// For now, moving Component logic here.

export const DashboardPage: React.FC = () => {
  // --- STATE ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeTemplate, setActiveTemplate] = useState<ShiftTemplate | null>(null);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    employeeId: null,
    date: null,
    existingShift: null,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  
  // --- DATA FETCHING (Scoped to Dashboard) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: emps, error: empsError } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        
        if (empsError) throw empsError;
        
        const mappedEmps = (emps || []).map(e => ({
          id: e.id,
          name: e.name,
          role: e.role,
          avatarColor: e.avatar_color
        }));

        const { data: shfts, error: shftsError } = await supabase
          .from('shifts')
          .select('*');
        
        if (shftsError) throw shftsError;

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- DATE LOGIC ---
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
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start, end });
    const hd = new Holidays('PL');
    
    return daysInMonth.filter(day => {
      const isSunday = getDay(day) === 0;
      const isHoliday = hd.isHoliday(day);
      return !isSunday && !isHoliday;
    }).length;
  }, [currentDate]);

  // --- HANDLERS ---
  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleSlotClick = (employeeId: string, date: string, existingShift?: Shift) => {
    if (activeTemplate) {
      const newShiftData = {
        employee_id: employeeId,
        date,
        start_time: activeTemplate.startTime,
        end_time: activeTemplate.endTime,
        duration: calculateDuration(activeTemplate.startTime, activeTemplate.endTime),
        type: activeTemplate.label
      };

      const handleUpsert = async () => {
        try {
          if (existingShift) {
            const { data, error } = await supabase
              .from('shifts')
              .update(newShiftData)
              .eq('id', existingShift.id)
              .select()
              .single();
            if (error) throw error;
            setShifts(prev => prev.map(s => s.id === existingShift.id ? {
              id: data.id,
              employeeId: data.employee_id,
              date: data.date,
              startTime: data.start_time,
              endTime: data.end_time,
              duration: data.duration,
              type: data.type
            } : s));
          } else {
            const { data, error } = await supabase
              .from('shifts')
              .insert(newShiftData)
              .select()
              .single();
            if (error) throw error;
            setShifts(prev => [...prev, {
              id: data.id,
              employeeId: data.employee_id,
              date: data.date,
              startTime: data.start_time,
              endTime: data.end_time,
              duration: data.duration,
              type: data.type
            }]);
          }
        } catch (error) {
          console.error('Error saving shift:', error);
        }
      };
      handleUpsert();
      return;
    }

    setModalState({
      isOpen: true,
      employeeId,
      date,
      existingShift: existingShift || null,
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSaveShift = async (shiftData: Shift | Omit<Shift, 'id'>) => {
    const supabaseData = {
      employee_id: shiftData.employeeId,
      date: shiftData.date,
      start_time: shiftData.startTime,
      end_time: shiftData.endTime,
      duration: shiftData.duration,
      type: shiftData.type
    };

    try {
      if ('id' in shiftData) {
        const { error } = await supabase
          .from('shifts')
          .update(supabaseData)
          .eq('id', shiftData.id);
        if (error) throw error;
        setShifts(prev => prev.map(s => s.id === shiftData.id ? shiftData as Shift : s));
      } else {
        const { data, error } = await supabase
          .from('shifts')
          .insert(supabaseData)
          .select()
          .single();
        if (error) throw error;
        setShifts(prev => [...prev, {
          id: data.id,
          employeeId: data.employee_id,
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          duration: data.duration,
          type: data.type
        }]);
      }
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      const { error } = await supabase.from('shifts').delete().eq('id', id);
      if (error) throw error;
      setShifts(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  const handleSaveEmployee = async (name: string, role: string) => {
    const newEmpData = { name, role, avatar_color: getRandomColor() };
    try {
      const { data, error } = await supabase.from('employees').insert(newEmpData).select().single();
      if (error) throw error;
      setEmployees(prev => [...prev, { id: data.id, name: data.name, role: data.role, avatarColor: data.avatar_color }]);
    } catch (error) { console.error('Error adding employee:', error); }
  };

  const getActiveEmployeeName = () => {
    if (!modalState.employeeId) return '';
    return employees.find(e => e.id === modalState.employeeId)?.name || '';
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 relative overflow-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Scheduler Sidebar (Employees) */}
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
          onAddEmployee={() => setIsEmployeeModalOpen(true)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Top Controls Bar - Specific for Dashboard */}
      <div className="bg-white border-b border-slate-200 p-3 flex flex-col gap-3 shadow-sm z-20 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Sidebar Toggle */}
            <div className="flex items-center w-20">
               <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Zarządzaj pracownikami">
                 <UserPlus className="w-5 h-5" />
               </button>
            </div>

            {/* Date Navigation */}
            <div className="flex-1 flex justify-center items-center gap-4">
               <button onClick={handlePrev} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft /></button>
               <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-800 capitalize leading-none">
                    {viewMode === 'week' ? (
                       <>{format(currentDate, 'LLLL', { locale: pl })} <span className="text-slate-400 text-base">Tydz. {getWeekOfMonth(currentDate, { weekStartsOn: 1 })}</span></>
                    ) : format(currentDate, 'LLLL yyyy', { locale: pl })}
                  </h2>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Dni robocze: <span className="text-emerald-600">{workingDaysCount}</span>
                  </div>
               </div>
               <button onClick={handleNext} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><ChevronRight /></button>
            </div>

             {/* View Mode Switcher */}
             <div className="flex items-center gap-2 justify-end w-auto min-w-[140px]">
                <button 
                  onClick={() => setIsCompactMode(!isCompactMode)}
                  className={cn("p-2 rounded-lg transition-colors border", isCompactMode ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}
                  title={isCompactMode ? "Pełny widok" : "Widok kompaktowy (wszyscy pracownicy)"}
                >
                    {isCompactMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>

                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs font-bold">
                   <button onClick={() => setViewMode('week')} className={cn("px-3 py-1.5 rounded", viewMode === 'week' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>Tydzień</button>
                   <button onClick={() => setViewMode('month')} className={cn("px-3 py-1.5 rounded", viewMode === 'month' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>Miesiąc</button>
                </div>
             </div>
          </div>

          {/* Quick Add Toolbar */}
          <div className="flex items-center gap-2 overflow-x-auto p-1 scrollbar-hide">
              <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap">Szybkie dodawanie:</span>
              {SHIFT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(activeTemplate?.id === template.id ? null : template)}
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 whitespace-nowrap transition-all",
                      activeTemplate?.id === template.id ? `ring-2 ring-emerald-500 border-transparent shadow-sm ${template.colorClass}` : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {template.label}
                  </button>
              ))}
              {activeTemplate && (
                  <button onClick={() => setActiveTemplate(null)} className="text-xs text-rose-500 font-bold hover:underline flex items-center"><X size={12}/> Anuluj</button>
              )}
          </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-hidden relative">
          <CalendarGrid 
            days={daysToDisplay}
            employees={employees}
            shifts={shifts}
            viewMode={viewMode}
            isCompactMode={isCompactMode}
            onSlotClick={handleSlotClick}
          />
      </div>

      {/* Modals */}
      <ShiftModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
        data={modalState}
        employeeName={getActiveEmployeeName()}
      />
      <EmployeeModal 
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onAdd={handleSaveEmployee}
      />
    </div>
  );
};
