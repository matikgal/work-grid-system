import { Employee, Shift, ShiftTemplate } from './types';
import { format, addDays, subDays } from 'date-fns';
import { getRandomColor, calculateDuration } from './utils';

const TODAY = new Date();

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Jan Kowalski', role: 'Kierownik Zmiany', avatarColor: 'bg-blue-100 text-blue-700' },
  { id: '2', name: 'Anna Nowak', role: 'Kasjer', avatarColor: 'bg-green-100 text-green-700' },
  { id: '3', name: 'Piotr Wiśniewski', role: 'Magazynier', avatarColor: 'bg-orange-100 text-orange-700' },
  { id: '4', name: 'Maria Dąbrowska', role: 'Kasjer', avatarColor: 'bg-purple-100 text-purple-700' },
  { id: '5', name: 'Tomasz Lewandowski', role: 'Stoisko Mięsne', avatarColor: 'bg-red-100 text-red-700' },
];

export const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 't1', label: 'Ranna', startTime: '06:00', endTime: '14:00', colorClass: 'bg-emerald-100 border-emerald-300 text-emerald-800', type: 'work' },
  { id: 't3', label: 'Popołudniowa', startTime: '14:00', endTime: '22:00', colorClass: 'bg-indigo-100 border-indigo-300 text-indigo-800', type: 'work' },
  { id: 't_mid', label: '10-18', startTime: '10:00', endTime: '18:00', colorClass: 'bg-purple-100 border-purple-300 text-purple-800', type: 'work' },
  { id: 't_vacation', label: 'Urlop', startTime: '08:00', endTime: '16:00', colorClass: 'bg-orange-100 border-orange-300 text-orange-800', type: 'vacation' },
  { id: 't_sat', label: 'Wolna Sobota', startTime: '00:00', endTime: '00:00', colorClass: 'bg-slate-100 border-slate-300 text-slate-500', type: 'dayoff' },
];

// Helper to create a shift relative to today
const createMockShift = (employeeId: string, dayOffset: number, start: string, end: string): Shift => {
  const date = format(dayOffset >= 0 ? addDays(TODAY, dayOffset) : subDays(TODAY, Math.abs(dayOffset)), 'yyyy-MM-dd');
  return {
    id: Math.random().toString(36).substr(2, 9),
    employeeId,
    date,
    startTime: start,
    endTime: end,
    duration: calculateDuration(start, end)
  };
};

export const INITIAL_SHIFTS: Shift[] = [
  createMockShift('1', -2, '06:00', '14:00'),
  createMockShift('1', -1, '06:00', '14:00'),
  createMockShift('1', 0, '06:00', '14:00'),
  createMockShift('1', 1, '06:00', '14:00'),
  createMockShift('1', 2, '06:00', '14:00'),
  
  createMockShift('2', -1, '14:00', '22:00'),
  createMockShift('2', 0, '14:00', '22:00'),
  createMockShift('2', 1, '14:00', '22:00'),
  createMockShift('2', 3, '08:00', '16:00'),

  createMockShift('3', 0, '08:00', '16:00'),
  createMockShift('3', 2, '22:00', '06:00'),
  
  createMockShift('4', 1, '10:00', '18:00'),
  createMockShift('5', 0, '07:00', '15:00'),
];
