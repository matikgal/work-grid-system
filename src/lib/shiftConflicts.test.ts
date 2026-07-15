import { describe, it, expect } from 'vitest';
import { findShiftConflicts } from './shiftConflicts';
import { Shift } from '../types';

const shift = (id: string, employeeId: string, date: string): Shift => ({
  id,
  employeeId,
  date,
  startTime: '06:00',
  endTime: '14:00',
  duration: 8,
});

describe('findShiftConflicts', () => {
  it('returns empty when no duplicates', () => {
    expect(
      findShiftConflicts([
        shift('1', 'a', '2026-01-01'),
        shift('2', 'b', '2026-01-01'),
      ]),
    ).toHaveLength(0);
  });

  it('detects duplicate shifts same employee same day', () => {
    const conflicts = findShiftConflicts([
      shift('1', 'a', '2026-01-01'),
      shift('2', 'a', '2026-01-01'),
    ]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].shiftIds).toHaveLength(2);
  });
});
