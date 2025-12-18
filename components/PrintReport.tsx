import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { Employee, Shift } from '../types';

interface PrintReportProps {
  currentDate: Date;
  employees: Employee[];
  shifts: Shift[];
}

export const PrintReport: React.FC<PrintReportProps> = ({ currentDate, employees, shifts }) => {
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const hd = new Holidays('PL');

  const getCellValue = (empId: string, dateStr: string) => {
    const shift = shifts.find(s => s.employeeId === empId && s.date === dateStr);
    if (!shift) return '';
    if (shift.type === 'Urlop') return 'U';
    if (shift.type === 'Wolna Sobota') return 'WS';
    return shift.duration || '';
  };

  return (
    <div className="hidden print:block w-full bg-white text-black p-2 font-sans">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight">Grafik Pracy - {format(currentDate, 'LLLL yyyy', { locale: pl })}</h1>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-2 border-slate-800 text-[8px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-2 border-slate-800 p-1 text-left bg-slate-100 w-32 font-bold uppercase">Nazwisko i Imię</th>
              {days.map(day => {
                const isSunday = getDay(day) === 0;
                const isSat = getDay(day) === 6;
                const holiday = hd.isHoliday(day);
                const isHoliday = !!holiday;
                
                return (
                  <th 
                    key={day.toISOString()} 
                    className={`border-2 border-slate-800 p-0.5 text-center min-w-[20px] ${isSunday || isHoliday ? 'bg-red-50 text-red-600' : isSat ? 'bg-slate-50' : ''}`}
                  >
                    <div className="text-[6px] uppercase leading-none mb-0.5">{format(day, 'EEEEEE', { locale: pl })}</div>
                    <div className="font-bold">{format(day, 'd')}</div>
                  </th>
                );
              })}
              <th className="border-2 border-slate-800 p-1 text-center bg-slate-100 w-14 font-bold uppercase text-[7px]">Suma</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              let totalHours = 0;
              return (
                <tr key={emp.id} className="h-6">
                  <td className="border-2 border-slate-800 p-1 font-bold whitespace-nowrap bg-slate-50 px-2 text-[9px]">{emp.name}</td>
                  {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const val = getCellValue(emp.id, dateStr);
                    
                    if (typeof val === 'number') totalHours += val;
                    if (val === 'U') totalHours += 8;
                    
                    const isSunday = getDay(day) === 0;
                    const holiday = hd.isHoliday(day);
                    const isHoliday = !!holiday;

                    return (
                      <td 
                        key={dateStr} 
                        className={`border-2 border-slate-800 p-0.5 text-center font-bold ${isSunday || isHoliday ? 'bg-red-50/30' : ''}`}
                      >
                        {val}
                      </td>
                    );
                  })}
                  <td className="border-2 border-slate-800 p-1 text-center font-black bg-slate-100 text-[10px]">{totalHours}h</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-[9px]">
        <div>
          <p className="font-bold mb-4 uppercase text-slate-400">Podpis kierownika:</p>
          <div className="w-32 border-b border-black"></div>
        </div>
        <div className="text-right">
          <p className="font-bold mb-4 uppercase text-slate-400">Data sporządzenia:</p>
          <p className="font-bold">{format(new Date(), 'dd.MM.yyyy')}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
          table { width: 100%; table-layout: fixed; }
          th, td { border: 1px solid black !important; -webkit-print-color-adjust: exact; }
          tr { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
};
