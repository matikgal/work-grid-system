import { format } from 'date-fns';
import { SHIFT_TEMPLATES, SHIFT_TYPES } from '../constants';
import type { Employee, Shift } from '../types';
import { displayName } from '../utils';

export type TodayShiftRow = {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  startTime: string;
  endTime: string;
  avatarColor?: string;
};

export type TodayAbsentRow = {
  employeeId: string;
  name: string;
  reason: string;
  avatarColor?: string;
};

type ShiftCategory = 'work' | 'absent' | 'other';

function getShiftCategory(type: string | undefined): ShiftCategory {
  if (!type) return 'work';

  if (type === SHIFT_TYPES.VACATION) return 'absent';
  if (type === SHIFT_TYPES.SICK_LEAVE_L4 || type === SHIFT_TYPES.SICK_LEAVE) return 'absent';
  if (type === SHIFT_TYPES.SCHOOL) return 'absent';
  if (type === SHIFT_TYPES.WS || type === SHIFT_TYPES.WS_ON_DEMAND) return 'absent';

  const template = SHIFT_TEMPLATES.find((t) => t.label === type || t.displayLabel === type);
  if (template) {
    if (template.type === 'vacation' || template.type === 'sick') return 'absent';
    if (template.type === 'work') return 'work';
    return 'other';
  }

  return 'work';
}

/** Czytelna etykieta powodu nieobecności na podstawie typu zmiany. */
function absentReason(type: string | undefined): string {
  if (type === SHIFT_TYPES.VACATION) return 'Urlop';
  if (type === SHIFT_TYPES.SICK_LEAVE_L4) return 'L4';
  if (type === SHIFT_TYPES.SICK_LEAVE) return 'Chorobowe';
  if (type === SHIFT_TYPES.SCHOOL) return 'Szkoła';
  if (type === SHIFT_TYPES.WS || type === SHIFT_TYPES.WS_ON_DEMAND) return 'WS';

  const template = SHIFT_TEMPLATES.find((t) => t.label === type || t.displayLabel === type);
  if (template?.type === 'vacation') return 'Urlop';
  if (template?.type === 'sick') return 'L4';

  return type || 'Nieobecny';
}

export function formatShiftClock(time: string): string {
  const [h, m] = time.split(':');
  return `${parseInt(h, 10)}:${m}`;
}

export function buildTodaySchedule(
  employees: Employee[],
  shifts: Shift[],
  date: Date = new Date(),
): { working: TodayShiftRow[]; absent: TodayAbsentRow[] } {
  const todayKey = format(date, 'yyyy-MM-dd');
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const todayShifts = shifts.filter((s) => s.date === todayKey);

  const working: TodayShiftRow[] = [];
  const absent: TodayAbsentRow[] = [];

  for (const shift of todayShifts) {
    const employee = employeeMap.get(shift.employeeId);
    if (!employee || employee.isSeparator || employee.isArchived) continue;
    if (employee.isVisibleInSchedule === false) continue;

    const category = getShiftCategory(shift.type);
    const name = displayName(employee.name);

    if (category === 'work') {
      working.push({
        id: shift.id,
        employeeId: shift.employeeId,
        name,
        role: employee.role || 'Pracownik',
        startTime: shift.startTime,
        endTime: shift.endTime,
        avatarColor: employee.avatarColor,
      });
    } else if (category === 'absent') {
      absent.push({
        employeeId: shift.employeeId,
        name,
        reason: absentReason(shift.type),
        avatarColor: employee.avatarColor,
      });
    }
  }

  working.sort((a, b) => a.startTime.localeCompare(b.startTime));
  absent.sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  return { working, absent };
}

export const MOCK_TODAY_SCHEDULE = {
  working: [
    {
      id: 'mock-1',
      employeeId: 'mock-e1',
      name: 'Kowalska Anna',
      role: 'Kasa',
      startTime: '06:00',
      endTime: '14:00',
      avatarColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'mock-2',
      employeeId: 'mock-e2',
      name: 'Nowak Piotr',
      role: 'Mięso',
      startTime: '06:00',
      endTime: '14:00',
      avatarColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'mock-3',
      employeeId: 'mock-e3',
      name: 'Wiśniewski Jan',
      role: 'Warzywa',
      startTime: '10:00',
      endTime: '18:00',
      avatarColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'mock-4',
      employeeId: 'mock-e4',
      name: 'Zielińska Maria',
      role: 'Pieczywo',
      startTime: '14:00',
      endTime: '22:00',
      avatarColor: 'bg-violet-100 text-violet-700',
    },
  ] satisfies TodayShiftRow[],
  absent: [
    {
      employeeId: 'mock-e5',
      name: 'Lewandowski Tomasz',
      reason: 'Urlop',
      avatarColor: 'bg-orange-100 text-orange-700',
    },
    {
      employeeId: 'mock-e6',
      name: 'Dąbrowska Ewa',
      reason: 'L4',
      avatarColor: 'bg-rose-100 text-rose-700',
    },
  ] satisfies TodayAbsentRow[],
};
