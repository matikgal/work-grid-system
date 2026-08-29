import { describe, it, expect } from 'vitest';
import { calculateDuration, displayName, formatPhone, formatScheduleSum, isWsShift } from './utils';
import { SHIFT_TYPES } from './constants';

describe('displayName', () => {
  it('reverses first and last name', () => {
    expect(displayName('Jan Kowalski')).toBe('Kowalski Jan');
  });

  it('keeps single name unchanged', () => {
    expect(displayName('Jan')).toBe('Jan');
  });

  it('handles empty string', () => {
    expect(displayName('')).toBe('');
  });
});

describe('formatPhone', () => {
  it('formats 9-digit number with spaces', () => {
    expect(formatPhone('123456789')).toBe('123 456 789');
  });

  it('returns original when not 9 digits', () => {
    expect(formatPhone('12345')).toBe('12345');
  });

  it('handles null', () => {
    expect(formatPhone(null)).toBe('');
  });
});

describe('calculateDuration', () => {
  it('calculates standard shift', () => {
    expect(calculateDuration('06:00', '14:00')).toBe(8);
  });

  it('handles overnight shift', () => {
    expect(calculateDuration('22:00', '06:00')).toBe(8);
  });
});

describe('isWsShift', () => {
  it('counts gray, green, and red WS cells', () => {
    expect(isWsShift(SHIFT_TYPES.FREE_SATURDAY)).toBe(true);
    expect(isWsShift(SHIFT_TYPES.WS)).toBe(true);
    expect(isWsShift(SHIFT_TYPES.WS_ON_DEMAND)).toBe(true);
  });

  it('does not count other shift types', () => {
    expect(isWsShift(SHIFT_TYPES.VACATION)).toBe(false);
    expect(isWsShift(SHIFT_TYPES.WORK_MORNING)).toBe(false);
    expect(isWsShift(SHIFT_TYPES.HOLIDAY)).toBe(false);
    expect(isWsShift(undefined)).toBe(false);
  });
});

describe('formatScheduleSum', () => {
  it('shows hours and days on one line', () => {
    expect(formatScheduleSum('days', 120, 2, 6)).toEqual(['H: 120 D: 15']);
  });

  it('shows only WS with a label', () => {
    expect(formatScheduleSum('ws', 120, 6, 6)).toEqual(['WS: 6/6']);
  });

  it('puts H/D on the first line and WS on the second', () => {
    expect(formatScheduleSum('both', 120, 6, 6)).toEqual(['H: 120 D: 15', 'WS: 6/6']);
  });
});
