import { describe, it, expect } from 'vitest';
import { parseEmployeeCsv, parseEmployeeJson } from './employeeImport';

describe('parseEmployeeCsv', () => {
  it('parses semicolon-separated rows with header', () => {
    const csv = `Imię i nazwisko;Rola;Telefon
Jan Kowalski;kasa;123456789
Anna Nowak;mięso;`;
    const rows = parseEmployeeCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: 'Jan Kowalski', role: 'kasa', phone: '123456789' });
  });
});

describe('parseEmployeeJson', () => {
  it('parses backup format', () => {
    const json = JSON.stringify({
      data: {
        employees: [{ name: 'Jan Kowalski', role: 'kasa', phone: '123' }],
      },
    });
    expect(parseEmployeeJson(json)).toHaveLength(1);
  });
});
