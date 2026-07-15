import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Employee, Shift } from '../types';

async function createWorkbook() {
  const ExcelJS = (await import('exceljs')).default;
  return new ExcelJS.Workbook();
}

async function downloadWorkbook(workbook: Awaited<ReturnType<typeof createWorkbook>>, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportScheduleToExcel(
  employees: Employee[],
  shifts: Shift[],
  days: Date[],
  periodLabel: string,
) {
  const workbook = await createWorkbook();
  const sheet = workbook.addWorksheet('Grafik');

  const dayHeaders = days.map((d) => format(d, 'dd.MM', { locale: pl }));
  sheet.addRow(['Pracownik', ...dayHeaders]);

  const activeEmployees = employees.filter((e) => !e.isSeparator && !e.isArchived);

  activeEmployees.forEach((emp) => {
    const row: (string | number)[] = [emp.name];
    days.forEach((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const shift = shifts.find((s) => s.employeeId === emp.id && s.date === dateStr);
      const cell = shift?.type || (shift ? `${shift.startTime}-${shift.endTime}` : '');
      row.push(cell);
    });
    sheet.addRow(row);
  });

  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col) => {
    col.width = 14;
  });
  if (sheet.getColumn(1)) sheet.getColumn(1).width = 28;

  await downloadWorkbook(workbook, `grafik-${periodLabel.replace(/\s+/g, '-')}.xlsx`);
}

export async function exportEmployeesToExcel(employees: Employee[]) {
  const workbook = await createWorkbook();
  const sheet = workbook.addWorksheet('Pracownicy');

  sheet.addRow(['Imię i nazwisko', 'Rola', 'Telefon', 'W grafiku', 'W urlopach']);
  employees
    .filter((e) => !e.isSeparator)
    .forEach((emp) => {
      sheet.addRow([
        emp.name,
        emp.role,
        emp.phone || '',
        emp.isVisibleInSchedule !== false ? 'Tak' : 'Nie',
        emp.isVisibleInVacations !== false ? 'Tak' : 'Nie',
      ]);
    });

  sheet.getRow(1).font = { bold: true };
  await downloadWorkbook(workbook, `pracownicy-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

export async function exportVacationsToExcel(
  employees: Employee[],
  vacationCounts: Record<string, number[]>,
  vacationBalances: Record<string, number>,
  year: number,
) {
  const workbook = await createWorkbook();
  const sheet = workbook.addWorksheet('Urlopy');

  const months = [
    'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze',
    'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru',
  ];
  sheet.addRow(['Pracownik', 'Limit', ...months, 'Suma']);

  employees
    .filter((e) => !e.isSeparator && e.isVisibleInVacations !== false)
    .forEach((emp) => {
      const counts = vacationCounts[emp.id] || Array(12).fill(0);
      const limit = vacationBalances[emp.id] ?? 26;
      const sum = counts.reduce((a, b) => a + b, 0);
      sheet.addRow([emp.name, limit, ...counts, sum]);
    });

  sheet.getRow(1).font = { bold: true };
  await downloadWorkbook(workbook, `urlopy-${year}.xlsx`);
}
