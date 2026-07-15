import React, { useState, useEffect } from 'react';
import { Plus, User, Clock, Trash2, X, PenTool, GripVertical, Minus, Archive, RefreshCw, Settings, UsersRound } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Session } from '@supabase/supabase-js';
import { Employee } from '../types';
import { cn, getRandomColor, getAvatarColor, displayName } from '../utils';
import { ROLES } from '../constants';
import { MainLayout } from '../components/layout/MainLayout';
import { useEmployees } from '../hooks/useEmployees';
import { useShifts } from '../hooks/useShifts';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { toast } from 'sonner';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import { PageHeader } from '../components/shared/PageHeader';
import { SearchInput } from '../components/shared/SearchInput';
import '../components/dashboard/dashboard-modern.css';

interface SortableEmployeeRowProps {
  employee: Employee;
  hours: number;
  onEdit: (emp: Employee) => void;
}

const SortableEmployeeRow = ({ employee, hours, onEdit }: SortableEmployeeRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: employee.id });

  const style = {
    // Tylko pion — zerujemy oś X, żeby wiersz nie uciekał w bok poza ekran.
    transform: transform ? CSS.Transform.toString({ ...transform, x: 0, scaleX: 1, scaleY: 1 }) : undefined,
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.85 : 1,
  };

  if (employee.isSeparator) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex cursor-pointer touch-manipulation items-center gap-2 rounded-xl px-1 py-2 transition-all",
          isDragging && "z-50 bg-white shadow-xl ring-2 ring-indigo-500/20 dark:bg-white/10"
        )}
      >
        <div {...attributes} {...listeners} className="shrink-0 cursor-grab touch-none p-2 text-indigo-950/25 hover:text-indigo-500 dark:text-indigo-100/30">
          <GripVertical className="h-5 w-5" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-3 opacity-70" onClick={() => onEdit(employee)}>
          <div className="h-px w-full bg-indigo-950/12 dark:bg-white/10"></div>
          <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-950/40 dark:text-indigo-100/45">Separator</span>
          <div className="h-px w-full bg-indigo-950/12 dark:bg-white/10"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative mb-2 flex cursor-pointer touch-manipulation items-center justify-between overflow-hidden rounded-2xl border border-white/55 bg-white/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white hover:shadow-[0_16px_30px_-18px_rgba(49,46,129,0.55)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
        isDragging && "z-50 border-indigo-500 bg-white shadow-2xl ring-2 ring-indigo-500/20 dark:bg-white/10"
      )}
      onClick={() => onEdit(employee)}
    >
      <div className="flex flex-1 items-center gap-3 overflow-hidden md:gap-4">
        {/* DRAG HANDLE */}
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="-ml-2 shrink-0 cursor-grab touch-none p-1 text-indigo-950/25 transition-colors hover:text-indigo-500 active:cursor-grabbing dark:text-indigo-100/30"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* AVATAR */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/30"
          style={{ backgroundColor: getAvatarColor(employee.id || employee.name) }}
        >
          <span className="text-lg font-semibold leading-none text-white">{displayName(employee.name).charAt(0).toUpperCase()}</span>
        </div>

        {/* INFO */}
        <div className="min-w-0 pr-4">
          <h3 className="flex items-center gap-2 truncate text-base font-semibold tracking-tight md:text-lg">
            {displayName(employee.name)}
            {employee.rowColor === 'blue' && <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm ring-2 ring-white dark:ring-[#14121f]" title="Niebieski" />}
            {employee.rowColor === 'red' && <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm ring-2 ring-white dark:ring-[#14121f]" title="Czerwony" />}
            {employee.rowColor === 'green' && <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm ring-2 ring-white dark:ring-[#14121f]" title="Zielony" />}
          </h3>
          <p className="mt-0.5 truncate text-xs font-medium text-indigo-950/50 dark:text-indigo-100/50">{employee.role}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 border-l border-indigo-950/10 pl-4 dark:border-white/10 md:gap-4">
        <div className="hidden w-24 text-right sm:block">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-950/40 dark:text-indigo-100/45">Miesiąc</p>
          <div className="flex items-center justify-end gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-mono text-sm font-bold">{hours}h</span>
          </div>
        </div>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/8 text-indigo-950/35 transition-all group-hover:rotate-90 group-hover:bg-indigo-500/15 group-hover:text-indigo-600 dark:text-indigo-100/35"
          title="Edytuj pracownika"
          aria-hidden
        >
          <Settings className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
};

interface EmployeesPageProps {
  session: Session;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ session }) => {
  const currentMonth = new Date();
  const { employees, addEmployee, updateEmployee, archiveEmployee, restoreEmployee, hardDeleteEmployee, reorderEmployees, loading } = useEmployees(session);
  const { shifts } = useShifts(employees, currentMonth);

  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
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

  const handleArchive = async () => {
    if (editingEmployee) {
      try {
        await archiveEmployee(editingEmployee.id);
        toast.success('Pracownik został zarchiwizowany');
        setIsConfirmDeleteOpen(false);
        handleCloseForm();
      } catch (err) {
        toast.error('Błąd podczas archiwizacji');
      }
    }
  };

  const handleRestore = async () => {
    if (editingEmployee) {
      try {
        await restoreEmployee(editingEmployee.id);
        toast.success('Pracownik został przywrócony');
        handleCloseForm();
      } catch (err) {
        toast.error('Błąd podczas przywracania');
      }
    }
  };

  const handleHardDelete = async () => {
    if (editingEmployee) {
      try {
        await hardDeleteEmployee(editingEmployee.id);
        toast.success('Pracownik został trwale usunięty');
        setIsConfirmDeleteOpen(false);
        handleCloseForm();
      } catch (err) {
        toast.error('Błąd podczas usuwania');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchive = showArchived ? emp.isArchived : !emp.isArchived;
    return matchesSearch && matchesArchive;
  });

  const getMonthlyHours = (employeeId: string) => {
    if(!shifts) return 0;
    const monthStr = currentMonth.toISOString().slice(0, 7);
    return shifts
      .filter(s => s.employeeId === employeeId && s.date.startsWith(monthStr))
      .reduce((acc, curr) => acc + curr.duration, 0);
  };

  return (
    <MainLayout pageTitle="Mój Zespół">
      <div className="dash-modern">
        <DashboardBackground />

        {/* Main Content Area */}
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col p-4 md:p-6">

            {/* Page Header (Search + Buttons) */}
            <PageHeader
              title="Karta Zespołu"
              icon={UsersRound}
              accent="#7c3aed"
              subtitle={
                <>
                  Masz w sumie <span className="font-semibold text-indigo-600 dark:text-indigo-300">{employees.length}</span> pracowników pod zarządem.
                </>
              }
              actions={
                <>
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Szukaj pracownika..."
                    className="sm:w-64"
                  />
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={cn('dash-btn', showArchived ? 'dash-btn--active' : 'dash-btn--ghost')}
                    title="Archiwum"
                  >
                    <Archive className="h-4 w-4" />
                    <span className="hidden sm:inline">{showArchived ? 'Wróć' : 'Archiwum'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenForm(null, true)}
                    className="dash-btn dash-btn--ghost"
                    title="Dodaj separator grupy"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="hidden sm:inline">Separator</span>
                  </button>
                  <button onClick={() => handleOpenForm(null)} className="dash-btn">
                    <Plus className="h-4 w-4" />
                    Dodaj
                  </button>
                </>
              }
            />

            <div className="dash-scroll -mx-2 min-h-0 flex-1 overflow-y-auto px-3 pb-5 pt-2">

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-500"></div>
                </div>
            ) : filteredEmployees.length > 0 ? (
                <div className="flex flex-col">
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
                              className="group relative mb-2 flex cursor-pointer items-center justify-between rounded-2xl border border-white/55 bg-white/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-white hover:shadow-[0_16px_30px_-18px_rgba(49,46,129,0.55)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-white/30"
                                       style={{ backgroundColor: getAvatarColor(emp.id || emp.name) }}>
                                      <span className="text-lg font-semibold leading-none text-white">{displayName(emp.name).charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div>
                                      <h3 className="text-base font-semibold tracking-tight md:text-lg">{displayName(emp.name)}</h3>
                                      <p className="mt-0.5 text-xs font-medium text-indigo-950/50 dark:text-indigo-100/50">{emp.role}</p>
                                  </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-3 border-l border-indigo-950/10 pl-4 dark:border-white/10">
                                  <div className="hidden w-24 text-right sm:block">
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-950/40 dark:text-indigo-100/45">Miesiąc</p>
                                      <div className="flex items-center justify-end gap-1.5">
                                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                          <span className="font-mono text-sm font-bold">{getMonthlyHours(emp.id)}h</span>
                                      </div>
                                  </div>
                                  <span
                                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/8 text-indigo-950/35 transition-all group-hover:rotate-90 group-hover:bg-indigo-500/15 group-hover:text-indigo-600 dark:text-indigo-100/35"
                                      title="Edytuj pracownika"
                                      aria-hidden
                                  >
                                      <Settings className="h-4 w-4" />
                                  </span>
                              </div>
                          </div>
                      ))
                  )}
                </div>
            ) : (
                <div className="dash-glass mt-8 flex h-64 flex-col items-center justify-center border-dashed text-indigo-950/50 dark:text-indigo-100/50">
                    <User className="mb-3 h-12 w-12 text-indigo-950/25 dark:text-indigo-100/25" />
                    <h3 className="text-lg font-semibold text-indigo-950/70 dark:text-indigo-100/70">Nic tu nie ma</h3>
                    <p className="mt-1 text-sm">Brak pracowników spełniających kryteria.</p>
                </div>
            )}
            </div>
        </div>

        {/* Przyciemnione tło — klik chowa menu */}
        {isFormOpen && (
            <div
               className="fixed inset-0 z-40 bg-indigo-950/30 backdrop-blur-[2px] transition-opacity"
               onClick={handleCloseForm}
            />
        )}

        {/* Slide-out Drawer Panel */}
        <div
            className={cn(
                "login-geist fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-white/55 bg-white/80 text-indigo-950 shadow-[-24px_0_60px_-30px_rgba(49,46,129,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-in-out md:w-[480px] dark:border-white/10 dark:bg-[#14121f]/88 dark:text-indigo-50",
                isFormOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* Aurora za szkłem — głębia w stylu iOS / Windows 11 */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
                <div className="absolute -right-16 -top-10 h-56 w-56 rounded-full bg-indigo-400/30 blur-3xl" />
                <div className="absolute -left-12 top-1/3 h-52 w-52 rounded-full bg-violet-400/25 blur-3xl" />
                <div className="absolute -bottom-16 right-1/4 h-56 w-56 rounded-full bg-sky-400/25 blur-3xl" />
            </div>

            <div className="flex items-center justify-between border-b border-white/40 p-6 dark:border-white/10 md:p-8">
                <div>
                   <h2 className="text-2xl font-semibold leading-none tracking-tight">
                     {editingEmployee ? (editingEmployee.isArchived ? 'Zarchiwizowany' : 'Edycja Profilu') : isSeparatorMode ? 'Nowy Wiersz' : 'Dodaj Osobę'}
                   </h2>
                   {editingEmployee && !isSeparatorMode && <p className="mt-2 text-sm text-indigo-950/55 dark:text-indigo-100/60">Uaktualnij dane i uprawnienia widoczności widoków.</p>}
                </div>
                <button
                   type="button"
                   onClick={handleCloseForm}
                   className="rounded-full p-2 text-indigo-950/55 transition-colors hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-indigo-100/60"
                >
                   <X className="h-6 w-6" />
                </button>
            </div>

            <div className="w-full flex-1 overflow-hidden py-2 md:py-4">
              <div className="dash-scroll h-full overflow-y-auto px-6 md:px-8">
                <form id="employee-form" onSubmit={handleSubmit} className="space-y-8 pb-4">
                    {isSeparatorMode ? (
                        <div className="w-full rounded-3xl border border-dashed border-indigo-950/15 bg-white/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/55 bg-white/70 shadow-sm dark:border-white/10 dark:bg-white/5">
                                <Minus className="h-8 w-8 text-indigo-500" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold tracking-tight">Linia Oddzielająca</h3>
                            <p className="text-sm text-indigo-950/55 dark:text-indigo-100/60">
                                Przeciągnij separator w wybrane miejsce. Służy do wizualnego oddzielenia grup lub stanowisk w grafiku. Będzie trwale ukryty jako niewidoczny na innych widokach.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Dane Osobowe */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-950/40 dark:text-indigo-100/45">Dane Osobowe</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="cursor-text space-y-1.5">
                                        <label className="ml-1 text-xs font-semibold text-indigo-950/70 dark:text-indigo-100/70">Imię</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="np. Anna"
                                            className="w-full rounded-2xl border border-indigo-950/10 bg-white/70 px-4 py-3.5 font-medium text-indigo-950 outline-none transition-all placeholder:text-indigo-950/35 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-indigo-50 dark:placeholder:text-indigo-100/35"
                                        />
                                    </div>
                                    <div className="cursor-text space-y-1.5">
                                        <label className="ml-1 flex items-center gap-2 text-xs font-semibold text-indigo-950/70 dark:text-indigo-100/70">Nazwisko <span className="opacity-50">(opcja)</span></label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="np. Kowalska"
                                            className="w-full rounded-2xl border border-indigo-950/10 bg-white/70 px-4 py-3.5 font-medium text-indigo-950 outline-none transition-all placeholder:text-indigo-950/35 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-indigo-50 dark:placeholder:text-indigo-100/35"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stanowisko */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-950/40 dark:text-indigo-100/45">Dział / Specjalizacja</h3>
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
                                                  "group flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all",
                                                  isSelected
                                                  ? "border-indigo-500/60 bg-indigo-500/12 text-indigo-700 dark:text-indigo-300"
                                                  : "border-white/55 bg-white/55 text-indigo-950/55 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-indigo-100/55 dark:hover:bg-white/[0.07]"
                                              )}
                                            >
                                                <Icon className={cn("h-6 w-6", isSelected ? "text-indigo-600 dark:text-indigo-300" : "text-indigo-950/40 group-hover:text-indigo-500 dark:text-indigo-100/40")} />
                                                <span className={cn("text-xs font-semibold", isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-indigo-950/60 dark:text-indigo-100/60")}>{role.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedRole === 'Inne' && (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 cursor-text duration-300">
                                        <label className="mb-1.5 ml-1 block text-xs font-semibold text-indigo-950/70 dark:text-indigo-100/70">Ręczna nazwa specjalizacji</label>
                                        <div className="relative">
                                            <PenTool className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-950/40 dark:text-indigo-100/40" />
                                            <input
                                                type="text"
                                                required={selectedRole === 'Inne'}
                                                value={customRoleInputValue}
                                                onChange={(e) => setCustomRoleInputValue(e.target.value)}
                                                placeholder="Niestandardowe np. Zmiennik"
                                                className="w-full rounded-2xl border border-indigo-950/10 bg-white/70 py-3.5 pl-12 pr-4 font-medium text-indigo-950 outline-none transition-all placeholder:text-indigo-950/35 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-indigo-50 dark:placeholder:text-indigo-100/35"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Opcje Zaawansowane */}
                            <div className="space-y-6 border-t border-white/40 pt-6 dark:border-white/10">
                                <div>
                                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-950/40 dark:text-indigo-100/45">Kolor Flagowy</h3>
                                    <div className="flex gap-2">
                                        {[
                                            { id: '', label: 'Aut', bg: 'bg-indigo-950/20 dark:bg-white/20' },
                                            { id: 'blue', label: 'B', bg: 'bg-blue-500' },
                                            { id: 'red', label: 'C', bg: 'bg-red-500' },
                                            { id: 'green', label: 'Z', bg: 'bg-green-500' },
                                        ].map((color) => (
                                            <button
                                                key={color.id}
                                                type="button"
                                                onClick={() => setRowColor(color.id)}
                                                className={cn(
                                                    "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
                                                    rowColor === color.id ? "border-indigo-500/60 bg-indigo-500/12" : "border-white/55 bg-white/55 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                                                )}
                                                title={color.label}
                                            >
                                                <div className={cn("h-4 w-4 rounded-full shadow-sm", color.bg)}></div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-950/40 dark:text-indigo-100/45">Dostęp do Modułów</h3>
                                    <div className="space-y-2">
                                        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/50 bg-white/50 p-4 transition-all hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
                                            <input type="checkbox" checked={isVisibleInSchedule} onChange={(e) => setIsVisibleInSchedule(e.target.checked)} className="h-6 w-6 shrink-0 rounded accent-indigo-600" />
                                            <div>
                                                <div className="font-semibold">Grafik Zmian i Wolne Soboty</div>
                                                <div className="text-xs text-indigo-950/55 dark:text-indigo-100/55">Będzie można przypisywać zmiany i rozliczać soboty.</div>
                                            </div>
                                        </label>
                                        <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/50 bg-white/50 p-4 transition-all hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
                                            <input type="checkbox" checked={isVisibleInVacations} onChange={(e) => setIsVisibleInVacations(e.target.checked)} className="h-6 w-6 shrink-0 rounded accent-indigo-600" />
                                            <div>
                                                <div className="font-semibold">Urlopy</div>
                                                <div className="text-xs text-indigo-950/55 dark:text-indigo-100/55">Wyświetlanie w widoku całorocznych limitów urlopowych.</div>
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
            <div className="flex gap-3 border-t border-white/40 bg-white/40 p-6 pb-8 dark:border-white/10 dark:bg-white/[0.02] md:p-8 md:pb-6">
                {editingEmployee && (
                    <>
                        {editingEmployee.isArchived ? (
                            <button
                                type="button"
                                onClick={handleRestore}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-emerald-300/50 bg-emerald-50/80 px-5 py-3.5 font-semibold text-emerald-600 transition-colors hover:bg-emerald-100/80 focus:outline-none dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Przywróć pracownika
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsConfirmDeleteOpen(true)}
                                className="group rounded-full border border-white/55 px-5 py-3.5 font-semibold text-rose-500 transition-colors hover:bg-rose-50/80 focus:outline-none dark:border-white/10 dark:hover:bg-rose-500/10"
                                title="Archiwizuj"
                            >
                                <Archive className="h-5 w-5 transition-transform group-hover:scale-110" />
                            </button>
                        )}
                    </>
                )}
                {!editingEmployee?.isArchived && (
                    <button
                        type="submit"
                        form="employee-form"
                        className="flex-1 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-[0_16px_30px_-12px_rgba(99,102,241,0.85)] transition-all hover:-translate-y-0.5 hover:brightness-105 focus:outline-none active:scale-[0.98]"
                    >
                        {editingEmployee ? 'Zachowaj Pozycję' : 'Zatrudnij / Utwórz'}
                    </button>
                )}
            </div>
        </div>
        <PageFooter />
      </div>

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleArchive}
        title="Archiwizuj pozycję"
        message="Czy na pewno chcesz zarchiwizować tę pozycję? Pracownik przestanie być widoczny w nowych grafikach, ale jego dotychczasowa historia pozostanie."
        confirmLabel="Tak, archiwizuj"
        variant="danger"
      />
    </MainLayout>
  );
};
