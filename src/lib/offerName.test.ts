import { describe, expect, it } from 'vitest';
import { appendOfferDate } from './offerName';

describe('appendOfferDate', () => {
  const d = new Date(2026, 7, 2); // 2.08.2026 local

  it('appends date', () => {
    expect(appendOfferDate('nabiał', d)).toBe(`nabiał ${d.toLocaleDateString('pl-PL')}`);
  });

  it('replaces trailing date', () => {
    expect(appendOfferDate('nabiał 1.08.2026', d)).toBe(`nabiał ${d.toLocaleDateString('pl-PL')}`);
  });

  it('keeps name if already has today', () => {
    const label = d.toLocaleDateString('pl-PL');
    expect(appendOfferDate(`nabiał ${label}`, d)).toBe(`nabiał ${label}`);
  });
});
