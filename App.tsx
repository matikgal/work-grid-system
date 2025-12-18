import React, { useState, useEffect, useMemo } from 'react';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Layout, LayoutList, X } from 'lucide-react';

import Sidebar from './components/Sidebar';
import CalendarGrid from './components/CalendarGrid';
import ShiftModal from './components/ShiftModal';

import { Employee, Shift, ModalState, ViewMode, ShiftTemplate } from './types';
import { INITIAL_EMPLOYEES, INITIAL_SHIFTS, SHIFT_TEMPLATES } from './constants';
import { getRandomColor, calculateDuration, cn } from './utils';

const App: React.FC = () => {
  // --- STATE ---
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('fm_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('fm_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeTemplate, setActiveTemplate] = useState<ShiftTemplate | null>(null);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    employeeId: null,
    date: null,
    existingShift: null,
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('fm_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('fm_shifts', JSON.stringify(shifts));
  }, [shifts]);

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
      // Create new shift object
      const newShift: Shift = {
        id: existingShift ? existingShift.id : Math.random().toString(36).substr(2, 9),
        employeeId,
        date,
        startTime: activeTemplate.startTime,
        endTime: activeTemplate.endTime,
        duration: calculateDuration(activeTemplate.startTime, activeTemplate.endTime)
      };

      if (existingShift) {
        // Replace existing
        setShifts(prev => prev.map(s => s.id === existingShift.id ? newShift : s));
      } else {
        // Add new
        setShifts(prev => [...prev, newShift]);
      }
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

  const handleSaveShift = (shiftData: Shift | Omit<Shift, 'id'>) => {
    if ('id' in shiftData) {
      setShifts(prev => prev.map(s => s.id === shiftData.id ? shiftData as Shift : s));
    } else {
      const newShift: Shift = {
        ...shiftData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setShifts(prev => [...prev, newShift]);
    }
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleAddEmployee = () => {
    const name = prompt("Podaj imię i nazwisko pracownika:");
    if (name) {
      const newEmp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        role: 'Pracownik',
        avatarColor: getRandomColor(),
      };
      setEmployees([...employees, newEmp]);
    }
  };

  const getActiveEmployeeName = () => {
    if (!modalState.employeeId) return '';
    return employees.find(e => e.id === modalState.employeeId)?.name || '';
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
        employees={employees} 
        shifts={shifts} 
        currentMonth={currentDate}
        onAddEmployee={handleAddEmployee}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 p-4 px-6 flex flex-col gap-4 shadow-sm z-20">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                <button onClick={handlePrev} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNext} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 capitalize">
                <CalendarIcon className="w-5 h-5 text-brand-600" />
                {viewMode === 'week' 
                  ? `Tydzień ${format(daysToDisplay[0], 'w', { locale: pl })} (${format(daysToDisplay[0], 'MMM', { locale: pl })})` 
                  : format(currentDate, 'MMMM yyyy', { locale: pl })}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-sm font-medium">
                  <button 
                    onClick={() => setViewMode('week')}
                    className={cn(
                      "px-3 py-1.5 rounded-md flex items-center gap-2 transition-all",
                      viewMode === 'week' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <Layout className="w-4 h-4" /> Tydzień
                  </button>
                  <button 
                    onClick={() => setViewMode('month')}
                    className={cn(
                      "px-3 py-1.5 rounded-md flex items-center gap-2 transition-all",
                      viewMode === 'month' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <LayoutList className="w-4 h-4" /> Miesiąc
                  </button>
               </div>
               
               <div className="h-6 w-px bg-slate-200 mx-2"></div>

               <div className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  Zespół: <span className="text-slate-700 font-bold">{employees.length}</span>
               </div>
            </div>
          </div>

          {/* Quick Add Toolbar */}
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
             <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Szybkie dodawanie:</span>
             <div className="flex items-center gap-2">
                {SHIFT_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(activeTemplate?.id === template.id ? null : template)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2",
                      activeTemplate?.id === template.id 
                        ? "ring-2 ring-offset-1 ring-brand-500 border-transparent shadow-sm scale-105" 
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
                      activeTemplate?.id === template.id ? template.colorClass : ""
                    )}
                  >
                    {template.label} <span className="opacity-60 text-xs">({template.startTime}-{template.endTime})</span>
                  </button>
                ))}
                
                {activeTemplate && (
                  <button 
                    onClick={() => setActiveTemplate(null)}
                    className="ml-2 text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 hover:underline"
                  >
                    <X className="w-3 h-3" /> Anuluj
                  </button>
                )}
             </div>
          </div>

        </header>

        {/* Calendar View */}
        <CalendarGrid 
          days={daysToDisplay}
          employees={employees}
          shifts={shifts}
          viewMode={viewMode}
          onSlotClick={handleSlotClick}
        />
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
    </div>
  );
};

export default App;
