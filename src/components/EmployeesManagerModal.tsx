import React, { useState, useEffect } from 'react';
import { X, Search, Plus, User, Clock, Trash2, Edit2, ArrowLeft, PenTool, GripVertical, Minus } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Employee, Shift } from '../types';
import { cn, stringToColor } from '../utils';
import { ROLES } from '../constants';

interface EmployeesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  onSave: (employee: Employee, isNew: boolean) => void;
  onDelete?: (id: string) => void;
  onReorder?: (employees: Employee[]) => void;
  currentMonth?: Date;
}

interface SortableEmployeeRowProps {
  employee: Employee;
  hours: number;
  onEdit: (emp: Employee) => void;
}

const SortableEmployeeRow = ({ employee, hours, onEdit }: SortableEmployeeRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: employee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-md transition-all relative overflow-hidden touch-manipulation",
        isDragging && "shadow-xl border-brand-500 ring-2 ring-brand-500/20 z-50 bg-white dark:bg-slate-800"
      )}
    >
       {/* Drag Handle */}
       <div 
         {...attributes} 
         {...listeners} 
         className="p-2 cursor-grab touch-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:cursor-grabbing shrink-0"
         title="Przesuń, aby zmienić kolejność"
       >
          <GripVertical className="w-5 h-5" />
       </div>

       {/* Content Wrapper - Click to edit */}
       <div 
         className="flex-1 flex items-center justify-between cursor-pointer min-w-0"
         onClick={() => onEdit(employee)}
       >
          {employee.isSeparator ? (
             <div className="flex-1 flex items-center justify-center gap-2 h-10 opacity-60">
                <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Separator</span>
                <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-600 rounded-full"></div>
             </div>
          ) : (
            <>
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <div 
                        className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm shrink-0", employee.avatarColor)}
                        style={!employee.avatarColor?.startsWith('bg-') ? { backgroundColor: employee.avatarColor || stringToColor(employee.name) } : {}}
                    >
                        <span className="text-white drop-shadow-md">{employee.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-2">
                            {employee.name}
                            {employee.rowColor === 'blue' && <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-800" title="Niebieski" />}
                            {employee.rowColor === 'red' && <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" title="Czerwony" />}
                            {employee.rowColor === 'green' && <span className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-800" title="Zielony" />}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full w-fit mt-0.5 border border-slate-200 dark:border-slate-600/50 truncate max-w-full">{employee.role}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-6 ml-2 shrink-0">
                    <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400" title="Godzin w bieżącym miesiącu">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{hours}h</span>
                        </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 dark:group-hover:text-brand-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                    </div>
                </div>
            </>
          )}
       </div>
    </div>
  );
};

export const EmployeesManagerModal: React.FC<EmployeesManagerModalProps> = ({
  isOpen,
  onClose,
  employees,
  shifts,
  onSave,
  onDelete,
  onReorder,
  currentMonth = new Date()
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[2].label); // Default to Kasa
  const [customRoleInputValue, setCustomRoleInputValue] = useState('');
  const [isSeparatorMode, setIsSeparatorMode] = useState(false);
  const [rowColor, setRowColor] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && onReorder) {
       const oldIndex = employees.findIndex((e) => e.id === active.id);
       const newIndex = employees.findIndex((e) => e.id === over?.id);
       if (oldIndex !== -1 && newIndex !== -1) {
           onReorder(arrayMove(employees, oldIndex, newIndex));
       }
    }
  };

  useEffect(() => {
    if (isOpen && view === 'list') {
        setSearchTerm('');
    }
  }, [isOpen]);

  // Handle switching to form
  const handleStartEdit = (employee: Employee | null, asSeparator = false) => {
      setEditingEmployee(employee);
      if (employee) {
          const names = employee.name.split(' ');
          setFirstName(names[0] || '');
          setLastName(names.slice(1).join(' ') || '');
          setIsSeparatorMode(!!employee.isSeparator);
          setRowColor(employee.rowColor || '');
          
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
      }
      setView('form');
  };

  const handleBackToList = () => {
      setView('list');
      setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      let fullName = '';
      if (isSeparatorMode) {
          fullName = 'SEPARATOR'; // Internal name
      } else {
          if (!firstName) return;
          fullName = lastName ? `${firstName} ${lastName}` : firstName;
      }
      
      const newEmployee: Employee = {
          id: editingEmployee ? editingEmployee.id : '', 
          name: fullName,
          role: isSeparatorMode ? '' : (selectedRole === 'Inne' ? customRoleInputValue : (selectedRole === 'Brak' ? '' : selectedRole)),
          avatarColor: editingEmployee?.avatarColor || '', 
          isSeparator: isSeparatorMode,
          rowColor: rowColor
      };

      onSave(newEmployee, !editingEmployee);
      handleBackToList();
  };

  if (!isOpen) return null;

  // Filter employees
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate hours
  const getMonthlyHours = (employeeId: string) => {
    const monthStr = currentMonth.toISOString().slice(0, 7);
    return shifts
      .filter(s => s.employeeId === employeeId && s.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.duration, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            {view === 'form' && (
                <button 
                    onClick={handleBackToList}
                    className="mr-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
            )}
            <div className="bg-brand-100 dark:bg-brand-500/20 p-2 rounded-xl text-brand-600 dark:text-brand-400">
               <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-800 dark:text-white">
                  {view === 'list' ? 'Zarządzanie Pracownikami' : (editingEmployee ? 'Edycja Pracownika' : 'Nowy Pracownik')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                  {view === 'list' ? `Lista i edycja zespołu (${employees.length})` : (editingEmployee ? editingEmployee.name : 'Dodaj nowego członka zespołu')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {view === 'list' && (
            <>
                {/* Search & Actions */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3 bg-white dark:bg-slate-900">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Szukaj pracownika..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                    />
                </div>
                <button 
                    onClick={() => handleStartEdit(null, true)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
                    title="Dodaj pustą linię oddzielającą"
                >
                    <Minus className="w-4 h-4" />
                    Separator
                </button>
                <button 
                    onClick={() => handleStartEdit(null)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Dodaj nowego
                </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
                {filteredEmployees.length > 0 ? (
                    !searchTerm && onReorder ? (
                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={filteredEmployees.map(e => e.id)} 
                                strategy={verticalListSortingStrategy}
                            >
                                {filteredEmployees.map((emp) => (
                                    <SortableEmployeeRow 
                                        key={emp.id} 
                                        employee={emp} 
                                        hours={getMonthlyHours(emp.id)} 
                                        onEdit={handleStartEdit} 
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        filteredEmployees.map((emp) => (
                            <div 
                            key={emp.id}
                            onClick={() => handleStartEdit(emp)}
                            className="group flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div 
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                                        emp.avatarColor
                                    )}
                                    style={!emp.avatarColor?.startsWith('bg-') ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}
                                    >
                                        <span className="text-white drop-shadow-md">
                                            {emp.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full w-fit mt-0.5 border border-slate-200 dark:border-slate-600/50">
                                        {emp.role}
                                    </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="text-right hidden sm:block">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400" title="Godzin w bieżącym miesiącu">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{getMonthlyHours(emp.id)}h</span>
                                    </div>
                                    </div>
                                    
                                    <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 dark:group-hover:text-brand-400 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <User className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Brak pracowników</p>
                    </div>
                )}
                </div>
            </>
        )}

        {view === 'form' && (
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-900">
                {isSeparatorMode ? (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                    <Minus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Linia Oddzielająca</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      Separator służy do wizualnego oddzielenia grup pracowników w grafiku. Będzie widoczny jako pusty wiersz z zablokowanymi komórkami.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Imię</label>
                        <input
                          autoFocus
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jan"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Nazwisko <span className="text-slate-400 font-normal text-xs">(opcjonalne)</span></label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Kowalski"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Stanowisko</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((role) => {
                          const Icon = role.icon;
                          const isSelected = selectedRole === role.label;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => setSelectedRole(role.label)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                isSelected 
                                  ? "bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-700 dark:text-brand-400 ring-2 ring-brand-500/20" 
                                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                              )}
                            >
                              <Icon className={cn("w-4 h-4", isSelected ? "text-brand-600 dark:text-brand-400" : "text-slate-400")} />
                              <span className="text-sm font-medium">{role.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedRole === 'Inne' && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 mb-1 block">Nazwa stanowiska</label>
                            <div className="relative">
                                <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    required={selectedRole === 'Inne'}
                                    value={customRoleInputValue}
                                    onChange={(e) => setCustomRoleInputValue(e.target.value)}
                                    placeholder="Wpisz nazwę stanowiska..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-slate-700 dark:text-slate-200"
                                />
                            </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Kolor wyróżnienia wiersza</label>
                        <div className="flex gap-3">
                            {[
                                { id: '', label: 'Standardowy', bg: 'bg-white', ring: 'ring-slate-300' },
                                { id: 'blue', label: 'Niebieski', bg: 'bg-blue-500', ring: 'ring-blue-500' },
                                { id: 'red', label: 'Czerwony', bg: 'bg-red-500', ring: 'ring-red-500' },
                                { id: 'green', label: 'Zielony', bg: 'bg-green-500', ring: 'ring-green-500' },
                            ].map((color) => (
                                <button
                                    key={color.id}
                                    type="button"
                                    onClick={() => setRowColor(color.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all min-w-[80px]",
                                        rowColor === color.id 
                                            ? "bg-slate-50 dark:bg-slate-800 border-brand-500 ring-1 ring-brand-500" 
                                            : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn("w-6 h-6 rounded-full border", color.bg, color.id === '' ? 'border-slate-300' : 'border-transparent')}></div>
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{color.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="flex-1 px-6 py-3.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Anuluj
                  </button>
                  {editingEmployee && onDelete && (
                    <button
                        type="button"
                        onClick={() => {
                            if (editingEmployee) {
                                onDelete(editingEmployee.id);
                                handleBackToList();
                            }
                        }}
                        className="px-4 py-3.5 rounded-xl font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all border border-rose-200 dark:border-rose-900/50"
                        title="Usuń pracownika"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98]"
                  >
                    {editingEmployee ? 'Zapisz zmiany' : 'Dodaj pracownika'}
                  </button>
                </div>
            </form>
        )}
        
        {/* Footer (Only list view) */}
        {view === 'list' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 shrink-0">
            Kliknij na pracownika, aby edytować jego dane.
            </div>
        )}
      </div>
    </div>
  );
};
