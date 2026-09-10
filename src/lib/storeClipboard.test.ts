import { describe, expect, it } from 'vitest';
import { buildStoresClipboard, toStoreClipboardRows } from './storeClipboard';
import type { Store } from '../services/storeService';

describe('storeClipboard', () => {
  const stores: Store[] = [
    {
      id: '1',
      userId: 'u',
      number: 9,
      name: 'Sklep 09',
      address: '43-356 Bujaków ul. Bielska 28a',
      phone: '33 810 83 69',
      email: 'paulinka09@paulinka.pl',
      managerName: null,
    },
  ];

  it('maps store rows for clipboard', () => {
    expect(toStoreClipboardRows(stores)[0]).toEqual({
      name: 'Sklep 09',
      address: '43-356 Bujaków ul. Bielska 28a',
      phone: '33 810 83 69',
      email: 'paulinka09@paulinka.pl',
    });
  });

  it('builds a compact HTML table without full width', () => {
    const { html, text } = buildStoresClipboard(toStoreClipboardRows(stores));
    expect(text).toContain('Sklep 09');
    expect(html).toContain('width:auto');
    expect(html).not.toContain('width:100%');
    expect(html).toContain('paulinka09@paulinka.pl');
  });
});
