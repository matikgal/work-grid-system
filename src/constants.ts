import { ShiftTemplate } from './types';
import { CircleOff, Shield, ShoppingCart, Beef, Croissant, Carrot, Trash2, PenTool } from 'lucide-react';

export const SHIFT_TYPES = {
  WORK_MORNING: '6-14',
  WORK_AFTERNOON: '14-22',
  WORK_OFFICE: '10-18',
  WORK_8: '8',
  WS: 'WS',
  VACATION: 'Urlop',
  FREE_SATURDAY: 'Wolna Sobota',
  HOLIDAY: 'Święto',
  SCHOOL: 'Szkoła',
  SICK_LEAVE_L4: 'L4',
  SICK_LEAVE: 'Chorobowe',
} as const;

export const ROLES = [
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

export const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 't1', label: SHIFT_TYPES.WORK_MORNING, startTime: '06:00', endTime: '14:00', colorClass: 'bg-emerald-100 border-emerald-300 text-emerald-800', type: 'work' },
  { id: 't3', label: SHIFT_TYPES.WORK_AFTERNOON, startTime: '14:00', endTime: '22:00', colorClass: 'bg-indigo-100 border-indigo-300 text-indigo-800', type: 'work' },
  { id: 't_mid', label: SHIFT_TYPES.WORK_OFFICE, startTime: '10:00', endTime: '18:00', colorClass: 'bg-purple-100 border-purple-300 text-purple-800', type: 'work' },
  { id: 't_vacation', label: SHIFT_TYPES.VACATION, startTime: '08:00', endTime: '16:00', colorClass: 'bg-orange-100 border-orange-300 text-orange-800', type: 'vacation' },
  { id: 't_sat', label: SHIFT_TYPES.FREE_SATURDAY, startTime: '00:00', endTime: '00:00', colorClass: 'bg-slate-100 border-slate-300 text-slate-500', type: 'dayoff' },
  { id: 't_holiday', label: SHIFT_TYPES.HOLIDAY, startTime: '00:00', endTime: '00:00', colorClass: 'bg-rose-100 border-rose-300 text-rose-600', type: 'holiday' },
  { id: 't_l4', label: SHIFT_TYPES.SICK_LEAVE_L4, startTime: '08:00', endTime: '16:00', colorClass: 'bg-yellow-100 border-yellow-300 text-yellow-800', type: 'sick' },
  { id: 't_ws', label: SHIFT_TYPES.WS, startTime: '00:00', endTime: '00:00', colorClass: 'bg-lime-400 border-lime-600 text-lime-950', type: 'dayoff' },
  { id: 't_8', label: SHIFT_TYPES.WORK_8, startTime: '08:00', endTime: '16:00', colorClass: 'bg-lime-400 border-lime-600 text-lime-950', type: 'work' },
];
