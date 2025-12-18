import React, { useState, useEffect, useMemo } from 'react';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
  getWeekOfMonth, getDay 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Layout, LayoutList, X, Users, LogOut } from 'lucide-react';

import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import ShiftModal from './components/ShiftModal';
import EmployeeModal from './components/EmployeeModal';

import { Employee, Shift, ModalState, ViewMode, ShiftTemplate } from './types';
import { SHIFT_TEMPLATES } from './constants';
import { getRandomColor, calculateDuration, cn } from './utils';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { AuthPage } from './components/AuthPage';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
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
  
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // --- AUTH CHECK ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- SUPABASE DATA FETCHING ---
  useEffect(() => {
    if (!session) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: emps, error: empsError } = await supabase
          .from('employees')
          .select('*')
          .order('name');
        
        if (empsError) throw empsError;
        
        // Map snake_case to camelCase
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
  }, [session]);

  // --- DATE LOGIC ---
  const daysToDisplay = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  const workingDaysCount = useMemo(() => {
    // Calculate working days for the entire month of currentDate
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
    // QUICK ADD LOGIC
    if (activeTemplate) {
      const newShiftData = {
        employee_id: employeeId,
        date,
        start_time: activeTemplate.startTime,
        end_time: activeTemplate.endTime,
        duration: calculateDuration(activeTemplate.startTime, activeTemplate.endTime),
        type: activeTemplate.type
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
      return; // Skip modal
    }

    // STANDARD MODAL LOGIC
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

  const handleAddEmployee = () => {
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (name: string, role: string) => {
    const newEmpData = {
      name,
      role,
      avatar_color: getRandomColor()
    };

    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(newEmpData)
        .select()
        .single();
      
      if (error) throw error;
      
      const newEmp: Employee = {
        id: data.id,
        name: data.name,
        role: data.role,
        avatarColor: data.avatar_color,
      };
      setEmployees(prev => [...prev, newEmp]);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const getActiveEmployeeName = () => {
    if (!modalState.employeeId) return '';
    return employees.find(e => e.id === modalState.employeeId)?.name || '';
  };

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden relative">
      
      {/* Mobile/Desktop Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out shadow-xl bg-white",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          employees={employees} 
          shifts={shifts} 
          currentMonth={currentDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddEmployee={handleAddEmployee}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-3 md:p-4 px-4 md:px-6 flex flex-col gap-3 md:gap-4 shadow-sm z-20 shrink-0">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
            {/* Left: Sidebar Toggle (Mobile/Desktop) */}
            <div className="flex items-center w-20">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Pokaż pracowników"
              >
                <Users className="w-6 h-6" />
              </button>
            </div>

            {/* Center: Navigation & Stats */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center gap-4 md:gap-6">
                <button 
                  onClick={handlePrev} 
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="text-center">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize leading-none">
                    {viewMode === 'week' ? (
                      <>
                        {format(currentDate, 'LLLL', { locale: pl })}
                        <span className="text-slate-400 font-medium ml-2 text-lg">
                          Tydzień {getWeekOfMonth(currentDate, { weekStartsOn: 1 })}
                        </span>
                      </>
                    ) : (
                      format(currentDate, 'LLLL yyyy', { locale: pl })
                    )}
                  </h2>
                  <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">
                    Dni pracujące: <span className="text-brand-600 font-bold">{workingDaysCount}</span>
                  </div>
                </div>

                <button 
                  onClick={handleNext} 
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Right: View Controls */}
            <div className="hidden md:flex items-center justify-end gap-3 w-auto md:w-auto min-w-[140px]">
               <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-sm font-medium shrink-0">
                  <button 
                    onClick={() => setViewMode('week')}
                    className={cn(
                      "px-3 py-1.5 rounded-md flex items-center gap-2 transition-all whitespace-nowrap",
                      viewMode === 'week' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                   <span className="hidden lg:inline">Tydzień</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('month')}
                    className={cn(
                      "px-3 py-1.5 rounded-md flex items-center gap-2 transition-all whitespace-nowrap",
                      viewMode === 'month' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                   <span className="hidden lg:inline">Miesiąc</span>
                  </button>
               </div>

               <button 
                  onClick={() => supabase.auth.signOut()}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2 border border-transparent hover:border-rose-100"
                  title="Wyloguj się"
                >
                   <LogOut className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Quick Add Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
             <span className="text-xs font-bold uppercase text-slate-400 tracking-wider hidden md:block">Szybkie dodawanie:</span>
             <div className="flex items-center gap-2 overflow-x-auto p-1 -m-1 scrollbar-hide">
                {SHIFT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(activeTemplate?.id === template.id ? null : template)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0",
                      activeTemplate?.id === template.id 
                        ? "ring-2 ring-brand-500 border-transparent shadow-md" 
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                      activeTemplate?.id === template.id ? template.colorClass : ""
                    )}
                  >
                    {template.label} 
                    <span className="opacity-60 text-xs">
                      {template.id === 't_vacation' 
                        ? '(8h)' 
                        : template.id === 't_sat' 
                          ? '' 
                          : `(${template.startTime}-${template.endTime})`
                      }
                    </span>
                  </button>
                ))}
                
                {activeTemplate && (
                  <button 
                    onClick={() => setActiveTemplate(null)}
                    className="ml-4 text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 hover:underline whitespace-nowrap"
                  >
                    <X className="w-4 h-4" /> Anuluj wybór
                  </button>
                )}
             </div>
          </div>

        </header>

        {/* Calendar View */}
        <div className="flex-1 overflow-hidden relative">
          <CalendarGrid 
            days={daysToDisplay}
            employees={employees}
            shifts={shifts}
            viewMode={viewMode}
            onSlotClick={handleSlotClick}
          />
        </div>
      </main>

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

export default App;
