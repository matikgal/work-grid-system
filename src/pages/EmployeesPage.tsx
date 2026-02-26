import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Clock, Trash2, X, PenTool, GripVertical, Minus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Session } from '@supabase/supabase-js';
import { Employee } from '../types';
import { cn, stringToColor, getRandomColor } from '../utils';
import { ROLES } from '../constants';
import { MainLayout } from '../components/layout/MainLayout';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';

interface SortableEmployeeRowProps {
  employee: Employee;
  hours: number;
  onEdit: (emp: Employee) => void;
}

const SortableEmployeeRow = ({ employee, hours, onEdit }: SortableEmployeeRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: employee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  if (employee.isSeparator) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-2 py-2 px-1 rounded-xl transition-all relative touch-manipulation cursor-pointer",
          isDragging && "shadow-xl ring-2 ring-brand-500/20 z-50 bg-white dark:bg-slate-800"
        )}
      >
        <div {...attributes} {...listeners} className="p-2 cursor-grab touch-none text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 shrink-0">
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-3 opacity-60" onClick={() => onEdit(employee)}>
          <div className="h-px w-full bg-slate-300 dark:bg-slate-600"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Separator</span>
          <div className="h-px w-full bg-slate-300 dark:bg-slate-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-4 mb-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-md transition-all relative overflow-hidden touch-manipulation cursor-pointer",
        isDragging && "shadow-2xl border-brand-500 ring-2 ring-brand-500/20 z-50 bg-white dark:bg-slate-800"
      )}
      onClick={() => onEdit(employee)}
    >
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden flex-1">
        {/* DRAG HANDLE */}
        <div 
          {...attributes} 
          {...listeners} 
          onClick={(e) => e.stopPropagation()}
          className="p-1 -ml-2 cursor-grab touch-none text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 active:cursor-grabbing shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* AVATAR */}
        <div 
          className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm shrink-0", employee.avatarColor)}
          style={!employee.avatarColor?.startsWith('bg-') ? { backgroundColor: employee.avatarColor || stringToColor(employee.name) } : {}}
        >
          <span className="text-white drop-shadow-md text-lg">{employee.name.charAt(0).toUpperCase()}</span>
        </div>

        {/* INFO */}
        <div className="min-w-0 pr-4">
          <h3 className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100 truncate flex items-center gap-2">
            {employee.name}
            {employee.rowColor === 'blue' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" title="Niebieski" />}
            {employee.rowColor === 'red' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" title="Czerwony" />}
            {employee.rowColor === 'green' && <span className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900 shadow-sm" title="Zielony" />}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{employee.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-slate-100 dark:border-slate-800">
        <div className="text-right hidden sm:block w-24">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Miesiąc</p>
          <div className="flex items-center justify-end gap-1.5 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-sm font-mono font-bold">{hours}h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EmployeesPageProps {
  session: Session;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ session }) => {
  const currentMonth = new Date();
  const { employees, addEmployee, updateEmployee, deleteEmployee, reorderEmployees, loading } = useEmployees(session);
  const { shifts } = useShifts(employees, currentMonth);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer / Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[2].label); // Default
  const [customRoleInputValue, setCustomRoleInputValue] = useState('');
  const [isSeparatorMode, setIsSeparatorMode] = useState(false);
  const [rowColor, setRowColor] = useState<string>('');
  const [isVisibleInSchedule, setIsVisibleInSchedule] = useState(true);
  const [isVisibleInVacations, setIsVisibleInVacations] = useState(true);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    useSensor(TouchSensor)
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
       const oldIndex = employees.findIndex((e) => e.id === active.id);
       const newIndex = employees.findIndex((e) => e.id === over?.id);
       if (oldIndex !== -1 && newIndex !== -1) {
           const newOrder = arrayMove(employees, oldIndex, newIndex);
           try {
             await reorderEmployees(newOrder);
           } catch(err) {
             toast.error('Błąd podczas zmiany kolejności');
           }
       }
    }
  };

  const handleOpenForm = (employee: Employee | null = null, asSeparator = false) => {
      setEditingEmployee(employee);
      if (employee) {
          const names = employee.name.split(' ');
          setFirstName(names[0] || '');
          setLastName(names.slice(1).join(' ') || '');
          setIsSeparatorMode(!!employee.isSeparator);
          setRowColor(employee.rowColor || '');
          setIsVisibleInSchedule(employee.isVisibleInSchedule !== false);
          setIsVisibleInVacations(employee.isVisibleInVacations !== false);
          
          if (!employee.role) {
            setSelectedRole('Brak');
            setCustomRoleInputValue('');
          } else {
            const isPredefined = ROLES.some(r => r.label === employee.role && r.id !== 'custom' && r.id !== 'none');
            if (isPredefined) {
              setSelectedRole(employee.role);
              setCustomRoleInputValue('');
            } else {
              setSelectedRole('Inne');
              setCustomRoleInputValue(employee.role);
            }
          }
      } else {
          setFirstName('');
          setLastName('');
          setSelectedRole(ROLES[2].label);
          setCustomRoleInputValue('');
          setIsSeparatorMode(asSeparator);
          setRowColor('');
          setIsVisibleInSchedule(true);
          setIsVisibleInVacations(!asSeparator);
      }
      setIsFormOpen(true);
  };

  const handleCloseForm = () => {
      setIsFormOpen(false);
      setTimeout(() => setEditingEmployee(null), 300); // Cleared after animation
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      let fullName = '';
      if (isSeparatorMode) {
          fullName = 'SEPARATOR';
      } else {
          if (!firstName) return;
          fullName = lastName ? `${firstName} ${lastName}` : firstName;
      }
      
      const role = isSeparatorMode ? '' : (selectedRole === 'Inne' ? customRoleInputValue : (selectedRole === 'Brak' ? '' : selectedRole));

      try {
        if (editingEmployee) {
          await updateEmployee(editingEmployee.id, {
            name: fullName,
            role,
            isSeparator: isSeparatorMode,
            rowColor,
            isVisibleInSchedule,
            isVisibleInVacations
          });
          toast.success('Zaktualizowano pracownika');
        } else {
          await addEmployee(fullName, role, getRandomColor(), isSeparatorMode, rowColor, isVisibleInSchedule, isVisibleInVacations);
          toast.success('Dodano pracownika');
        }
        handleCloseForm();
      } catch (err) {
        toast.error('Wystąpił błąd komunikacji. Spróbuj ponownie.');
      }
  };

  const handleDelete = async () => {
    if (editingEmployee) {
      try {
        await deleteEmployee(editingEmployee.id);
        toast.success('Pracownik został usunięty');
        setIsConfirmDeleteOpen(false);
        handleCloseForm();
      } catch (err) {
        toast.error('Błąd podczas usuwania');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMonthlyHours = (employeeId: string) => {
    if(!shifts) return 0;
    const monthStr = currentMonth.toISOString().slice(0, 7);
    return shifts
      .filter(s => s.employeeId === employeeId && s.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.duration, 0);
  };

  return (
    <MainLayout pageTitle="Mój Zespół">
      <div className="relative h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col">
          
        {/* Main Content Area */}
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-0">
            
            {/* Page Header (Search + Buttons) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
                <div className="hidden md:block">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Karta Zespołu</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Masz w sumie <span className="font-bold text-brand-600 dark:text-brand-400">{employees.length}</span> pracowników pod zarządem.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Szukaj pracownika..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-400 font-medium shadow-sm"
                        />
                    </div>
                
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => handleOpenForm(null, true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-bold transition-all shadow-sm"
                            title="Dodaj separator grupy"
                        >
                            <Minus className="w-4 h-4" />
                            Separator
                        </button>
                        <button 
                            onClick={() => handleOpenForm(null)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Dodaj
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24">

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                </div>
            ) : filteredEmployees.length > 0 ? (
                <div className="flex flex-col mb-24">
                  {!searchTerm ? (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={filteredEmployees.map(e => e.id)} strategy={verticalListSortingStrategy}>
                              {filteredEmployees.map((emp) => (
                                  <SortableEmployeeRow key={emp.id} employee={emp} hours={getMonthlyHours(emp.id)} onEdit={handleOpenForm} />
                              ))}
                          </SortableContext>
                      </DndContext>
                  ) : (
                      filteredEmployees.map((emp) => (
                          <div 
                              key={emp.id}
                              onClick={() => handleOpenForm(emp)}
                              className="group flex items-center justify-between p-4 mb-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer relative"
                          >
                              <div className="flex items-center gap-4">
                                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm", emp.avatarColor)}
                                       style={!emp.avatarColor?.startsWith('bg-') ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}>
                                      <span className="text-white drop-shadow-md text-lg">{emp.name.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-base md:text-lg text-slate-800 dark:text-slate-100">{emp.name}</h3>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{emp.role}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-800 pl-4 hidden sm:block">
                                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Miesiąc</p>
                                  <div className="flex items-center justify-end gap-1.5 text-slate-700 dark:text-slate-300">
                                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                                      <span className="text-sm font-mono font-bold">{getMonthlyHours(emp.id)}h</span>
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mt-8 shadow-sm">
                    <User className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Nic tu nie ma</h3>
                    <p className="text-sm mt-1">Brak pracowników spełniających kryteria.</p>
                </div>
            )}
            </div>
        </div>

        {/* Backdrop for mobile */}
        {isFormOpen && (
            <div 
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity lg:hidden"
               onClick={handleCloseForm}
            />
        )}

        {/* Slide-out Drawer Panel */}
        <div 
            className={cn(
                "fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col",
                isFormOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/50">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                     {editingEmployee ? 'Edycja Profilu' : isSeparatorMode ? 'Nowy Wiersz' : 'Dodaj Osobę'}
                   </h2>
                   {editingEmployee && !isSeparatorMode && <p className="text-sm text-slate-500 mt-2 font-medium">Uaktualnij dane i uprawnienia widoczności widoków.</p>}
                </div>
                <button 
                   type="button"
                   onClick={handleCloseForm}
                   className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                   <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-hidden w-full py-2 md:py-4">
              <div className="h-full overflow-y-auto custom-scrollbar px-6 md:px-8">
                <form id="employee-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
                    {isSeparatorMode ? (
                        <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center w-full">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                <Minus className="w-8 h-8 text-brand-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Linia Oddzielająca</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Przeciągnij separator w wybrane miejsce. Służy do wizualnego oddzielenia grup lub stanowisk w grafiku. Będzie trwale ukryty jako niewidoczny na innych widokach.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Dane Osobowe */}
                            <div className="space-y-4">
                                <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400">Dane Osobowe</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 cursor-text">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Imię</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Główne widmowe..."
                                            className="w-full px-4 py-3.5 rounded-2xl border-none outline-none text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 transition-all font-medium placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="space-y-1.5 cursor-text">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">Nazwisko <span className="opacity-50">(opcja)</span></label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Identyfikator..."
                                            className="w-full px-4 py-3.5 rounded-2xl border-none outline-none text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 transition-all font-medium placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stanowisko */}
                            <div className="space-y-4">
                                <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400">Dział / Specjalizacja</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {ROLES.map((role) => {
                                        const Icon = role.icon;
                                        const isSelected = selectedRole === role.label;
                                        return (
                                            <button
                                              key={role.id}
                                              type="button"
                                              onClick={() => setSelectedRole(role.label)}
                                              className={cn(
                                                  "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all text-center group",
                                                  isSelected 
                                                  ? "bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-400" 
                                                  : "border-transparent bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                                              )}
                                            >
                                                <Icon className={cn("w-6 h-6", isSelected ? "text-brand-600 dark:text-brand-400" : "text-slate-400 group-hover:text-slate-500")} />
                                                <span className={cn("text-xs font-bold", isSelected ? "text-brand-700 dark:text-brand-300" : "text-slate-600 dark:text-slate-400")}>{role.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedRole === 'Inne' && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 cursor-text">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1 block mb-1.5">Ręczna nazwa specjalizacji</label>
                                        <div className="relative">
                                            <PenTool className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                required={selectedRole === 'Inne'}
                                                value={customRoleInputValue}
                                                onChange={(e) => setCustomRoleInputValue(e.target.value)}
                                                placeholder="Niestandardowe np. Zmiennik"
                                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none outline-none text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 transition-all font-medium placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Opcje Zaawansowane */}
                            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                                <div>
                                    <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-3">Kolor Flagowy</h3>
                                    <div className="flex gap-2">
                                        {[
                                            { id: '', label: 'Aut', bg: 'bg-slate-200 dark:bg-slate-700', activeBg: 'bg-slate-50 dark:bg-slate-800' },
                                            { id: 'blue', label: 'B', bg: 'bg-blue-500', activeBg: 'bg-blue-500/[0.08]' },
                                            { id: 'red', label: 'C', bg: 'bg-red-500', activeBg: 'bg-red-500/[0.08]' },
                                            { id: 'green', label: 'Z', bg: 'bg-green-500', activeBg: 'bg-green-500/[0.08]' },
                                        ].map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setRowColor(color.id)}
                                                className={cn(
                                                    "w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all",
                                                    rowColor === color.id ? `border-brand-500 ${color.activeBg}` : "border-transparent bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100"
                                                )}
                                                title={color.label}
                                            >
                                                <div className={cn("w-4 h-4 rounded-full shadow-sm", color.bg)}></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400 mb-3">Dostęp do Modułów</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer transition-all">
                                            <div className="relative flex items-center">
                                              <input type="checkbox" checked={isVisibleInSchedule} onChange={(e) => setIsVisibleInSchedule(e.target.checked)} className="peer w-6 h-6 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 bg-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200">Grafik Zmian</div>
                                                <div className="text-xs text-slate-500 font-medium">Będzie można przypisać zmianę dla osoby.</div>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 cursor-pointer transition-all">
                                            <div className="relative flex items-center">
                                              <input type="checkbox" checked={isVisibleInVacations} onChange={(e) => setIsVisibleInVacations(e.target.checked)} className="peer w-6 h-6 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 bg-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200">Urlopy i Wolne Soboty</div>
                                                <div className="text-xs text-slate-500 font-medium">Obliczenia w pozostałych 2 widokach całorocznych.</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </form>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-950 flex gap-3 pb-8 md:pb-6">
                {editingEmployee && (
                    <button
                        type="button"
                        onClick={() => setIsConfirmDeleteOpen(true)}
                        className="px-5 py-3.5 rounded-full font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border border-slate-200 dark:border-slate-800 group focus:outline-none"
                        title="Usuń trwale"
                    >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                )}
                <button
                    type="submit"
                    form="employee-form"
                    className="flex-1 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 py-3.5 px-6 rounded-full font-bold shadow-xl shadow-slate-900/10 dark:shadow-white/10 transition-all active:scale-[0.98] focus:outline-none"
                >
                    {editingEmployee ? 'Zachowaj Pozycję' : 'Zatrudnij / Utwórz'}
                </button>
            </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Usuń pozycję"
        description={`Czy na pewno chcesz usunąć pracownika / separator? Tej operacji nie cofniemy.`}
        confirmText="Tak, usuń"
        intent="danger"
      />
    </MainLayout>
  );
};
