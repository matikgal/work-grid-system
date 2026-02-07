export interface Employee {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  orderIndex?: number;
  isSeparator?: boolean;
  rowColor?: string;
  isVisibleInSchedule?: boolean;
  isVisibleInVacations?: boolean;
}

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  duration: number; // In hours
  type?: string;
}

export interface ModalState {
  isOpen: boolean;
  employeeId: string | null;
  date: string | null; // YYYY-MM-DD
  existingShift: Shift | null;
}

export interface ShiftTemplate {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  colorClass: string;
  type: 'work' | 'vacation' | 'dayoff' | 'holiday' | 'sick';
}

export type ViewMode = 'week' | 'month';
