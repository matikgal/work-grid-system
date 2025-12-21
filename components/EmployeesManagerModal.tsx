import React, { useState, useEffect } from 'react';
import { X, Search, Plus, User, Clock, MoreVertical, Trash2, Edit2, Shield, ShoppingCart, Beef, Croissant, Carrot, ArrowLeft, CircleOff, PenTool } from 'lucide-react';
import { Employee, Shift } from '../types';
import { cn, stringToColor } from '../utils';

interface EmployeesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  onSave: (employee: Employee, isNew: boolean) => void;
  onDelete?: (id: string) => void;
  currentMonth?: Date;
}

const ROLES = [
  { id: 'none', label: 'Brak', icon: CircleOff },
  { id: 'kierownik', label: 'Kierownik', icon: Shield },
  { id: 'kasa', label: 'Kasa', icon: ShoppingCart },
  { id: 'mieso', label: 'Mięso', icon: Beef },
  { id: 'mieso_kasa', label: 'Mięso/Kasa', icon: Beef },
  { id: 'pieczywo', label: 'Pieczywo', icon: Croissant },
  { id: 'pieczywo_kasa', label: 'Pieczywo/Kasa', icon: Croissant },
  { id: 'warzywa', label: 'Warzywa', icon: Carrot },
  { id: 'sprzataczka', label: 'Sprzątaczka', icon: Trash2 },
  { id: 'custom', label: 'Inne', icon: PenTool },
];

export const EmployeesManagerModal: React.FC<EmployeesManagerModalProps> = ({
  isOpen,
  onClose,
  employees,
  shifts,
  onSave,
  onDelete,
  currentMonth = new Date()
}) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[2].label); // Default to Kasa (index 2 now)
  const [customRoleInputValue, setCustomRoleInputValue] = useState('');

  useEffect(() => {
    if (isOpen && view === 'list') {
        setSearchTerm('');
    }
  }, [isOpen]);

  // Handle switching to form
  const handleStartEdit = (employee: Employee | null) => {
      setEditingEmployee(employee);
      if (employee) {
          const names = employee.name.split(' ');
          setFirstName(names[0] || '');
          setLastName(names.slice(1).join(' ') || '');
          
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
      }
      setView('form');
  };

  const handleBackToList = () => {
      setView('list');
      setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!firstName) return;

      const fullName = lastName ? `${firstName} ${lastName}` : firstName;
      
      const newEmployee: Employee = {
          id: editingEmployee ? editingEmployee.id : crypto.randomUUID(),
          name: fullName,
          role: selectedRole === 'Inne' ? customRoleInputValue : (selectedRole === 'Brak' ? '' : selectedRole),
          avatarColor: editingEmployee?.avatarColor, // Persist or generate new elsewhere? Logic usually in parent or here. Assuming update preserves or generates if new.
          // Note: Parent handles the actual object creation/merge in DashboardPage usually.
          // But wait, onSave in DashboardPage (handleSaveEmployee) expects just the employee object.
      };

      // We need to match the signature expected by DashboardPage's handleSaveEmployee or slightly adapt.
      // DashboardPage expects: (employee: Employee) => void.
      // But we need to know if it's new generation logic or not.
      // Actually handleSaveEmployee in DashboardPage handles both update and create based on ID existence usually.
      
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
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
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
                    filteredEmployees.map((emp) => {
                    const hours = getMonthlyHours(emp.id);
                    return (
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
                                    <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{hours}h</span>
                                </div>
                                </div>
                                
                                <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 dark:group-hover:text-brand-400 transition-colors">
                                <Edit2 className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    );
                    })
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
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-900">
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
