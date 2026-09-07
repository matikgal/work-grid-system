import { describe, expect, it } from 'vitest';
import {
  buildOfferExcelClipboard,
  buildWholesalerOrderClipboard,
  collectWholesalerWinningRows,
  formatPricePl,
  normalizeEan,
} from './offerClipboard';
import type { QuoteColumn, QuoteRow } from '../types/quoteSchemas';

const columns: QuoteColumn[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    quoteId: '00000000-0000-0000-0000-000000000001',
    name: 'Makro',
    accessToken: 'tok',
    sortOrder: 0,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    quoteId: '00000000-0000-0000-0000-000000000001',
    name: 'Eurocash',
    accessToken: 'tok2',
    sortOrder: 1,
  },
];

const rows: QuoteRow[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    quoteId: '00000000-0000-0000-0000-000000000001',
    name: 'Mleko',
    ean: '5901234567890',
    shelfPrice: '4.50',
    sortOrder: 0,
    cells: [
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        rowId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        columnId: '11111111-1111-1111-1111-111111111111',
        value: '3.20',
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        rowId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        columnId: '22222222-2222-2222-2222-222222222222',
        value: '2.95',
      },
    ],
  },
];

describe('normalizeEan / formatPricePl', () => {
  it('keeps only digits in EAN', () => {
    expect(normalizeEan('5901234567890')).toBe('5901234567890');
    expect(normalizeEan('590 1234-567890')).toBe('5901234567890');
  });

  it('formats prices with comma', () => {
    expect(formatPricePl('2.95')).toBe('2,95');
    expect(formatPricePl('4,50')).toBe('4,50');
  });
});

describe('buildOfferExcelClipboard', () => {
  it('exports 5 tab columns with comma prices and raw EAN', () => {
    expect(buildOfferExcelClipboard(rows, columns)).toBe('5901234567890\t4,50\t2,95\t1\t1');
  });
});

describe('collectWholesalerWinningRows', () => {
  it('keeps only rows where this wholesaler has the lowest price', () => {
    const lines = collectWholesalerWinningRows(rows, columns, 'Eurocash');
    expect(lines).toEqual([{ name: 'Mleko', ean: '5901234567890', price: '2,95' }]);
  });

  it('returns nothing when another wholesaler won', () => {
    expect(collectWholesalerWinningRows(rows, columns, 'Makro')).toEqual([]);
  });
});

describe('buildWholesalerOrderClipboard', () => {
  it('builds a compact 3-column HTML table without full width', () => {
    const { html, text } = buildWholesalerOrderClipboard([
      { name: 'Mleko', ean: '5901234567890', price: '2,95' },
    ]);
    expect(text).toBe('Produkt\tKod EAN\tCena\nMleko\t5901234567890\t2,95');
    expect(html).toContain('width:auto');
    expect(html).not.toContain('width:100%');
    expect(html).toContain('Mleko');
    expect(html).toContain('2,95');
  });
});
