import { Shift } from '../types';

export interface ShiftConflict {
  employeeId: string;
  date: string;
  shiftIds: string[];
  message: string;
}

/** Wykrywa wielokrotne zmiany tego samego pracownika w jednym dniu */
export function findShiftConflicts(shifts: Shift[]): ShiftConflict[] {
  const byKey = new Map<string, Shift[]>();

  shifts.forEach((shift) => {
    const key = `${shift.employeeId}:${shift.date}`;
    const list = byKey.get(key) || [];
    list.push(shift);
    byKey.set(key, list);
  });

  const conflicts: ShiftConflict[] = [];

  byKey.forEach((dayShifts, key) => {
    if (dayShifts.length <= 1) return;
    const [employeeId, date] = key.split(':');
    conflicts.push({
      employeeId,
      date,
      shiftIds: dayShifts.map((s) => s.id),
      message: `${dayShifts.length} zmiany w dniu ${date}`,
    });
  });

  return conflicts;
}
