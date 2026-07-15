import { describe, it, expect } from 'vitest';
import { calculateDuration, displayName, formatPhone } from './utils';

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
