import { describe, expect, it } from 'vitest';
import { computeQuoteRowMin, parseQuotePrice } from './quoteMinPrice';

describe('parseQuotePrice', () => {
  it('parses comma decimals', () => {
    expect(parseQuotePrice('2,95')).toBe(2.95);
  });

  it('returns null for empty', () => {
    expect(parseQuotePrice('')).toBeNull();
    expect(parseQuotePrice('  ')).toBeNull();
  });
});

describe('computeQuoteRowMin', () => {
  const cols = [
    { id: 'a', name: 'Makro' },
    { id: 'b', name: 'Eurocash' },
    { id: 'c', name: 'Selgros' },
  ];

  it('picks lowest and wholesaler name', () => {
    expect(computeQuoteRowMin({ a: '3.20', b: '2.95', c: '3.10' }, cols)).toEqual({
      minLabel: '2.95',
      sourceLabel: 'Eurocash',
    });
  });

  it('labels ties as remis', () => {
    expect(computeQuoteRowMin({ a: '3', b: '3', c: '4' }, cols)).toEqual({
      minLabel: '3',
      sourceLabel: 'remis',
    });
  });

  it('ignores empty cells', () => {
    expect(computeQuoteRowMin({ a: '', b: '5', c: '' }, cols)).toEqual({
      minLabel: '5',
      sourceLabel: 'Eurocash',
    });
  });

  it('handles no prices', () => {
    expect(computeQuoteRowMin({}, cols)).toEqual({
      minLabel: '—',
      sourceLabel: '—',
    });
  });
});
