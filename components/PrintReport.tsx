import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Employee, Shift } from '../types';

interface PrintReportProps {
  currentDate: Date;
  employees: Employee[];
  shifts: Shift[];
}

export const PrintReport: React.FC<PrintReportProps> = React.memo(({ currentDate, employees, shifts }) => {
  const daysInfo = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const isSunday = getDay(day) === 0;
      return {
        day,
        dateStr: format(day, 'yyyy-MM-dd'),
        label: format(day, 'd'),
        weekday: format(day, 'EEEEEE', { locale: pl }),
        isSunday,
      };
    });
  }, [currentDate]);

  const shiftsLookup = useMemo(() => {
    const lookup: Record<string, string | number> = {};
    shifts.forEach(s => {
      let val: string | number = s.duration || '';
      if (s.type === 'Urlop') val = 'U';
      else if (s.type === 'Wolna Sobota') val = 'WS';
      lookup[`${s.employeeId}-${s.date}`] = val;
    });
    return lookup;
  }, [shifts]);

  return (
    <div className="hidden print:block w-full bg-white text-black p-2 font-sans overflow-visible">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight">Grafik Pracy - {format(currentDate, 'LLLL yyyy', { locale: pl })}</h1>
      </div>
      
      <table className="w-full border-collapse border-2 border-slate-800 text-[8px] table-fixed">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-2 border-slate-800 p-1 text-left bg-slate-100 w-32 font-bold uppercase">Nazwisko i Imię</th>
            {daysInfo.map(info => (
              <th 
                key={info.dateStr} 
                className={`border-2 border-slate-800 p-0.5 text-center ${info.isSunday ? 'bg-slate-200' : ''}`}
              >
                <div className="text-[6px] uppercase leading-none mb-0.5">{info.weekday}</div>
                <div className="font-bold">{info.label}</div>
              </th>
            ))}
            <th className="border-2 border-slate-800 p-1 text-center bg-slate-100 w-14 font-bold uppercase text-[7px]">Suma</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => {
            let totalHours = 0;
            return (
              <tr key={emp.id} className="h-6">
                <td className="border-2 border-slate-800 p-1 font-bold whitespace-nowrap bg-slate-50 px-2 text-[9px] overflow-hidden text-ellipsis">{emp.name}</td>
                {daysInfo.map(info => {
                  const val = shiftsLookup[`${emp.id}-${info.dateStr}`] || '';
                  if (typeof val === 'number') totalHours += val;
                  if (val === 'U') totalHours += 8;

                  return (
                    <td 
                      key={info.dateStr} 
                      className={`border-2 border-slate-800 p-0.5 text-center font-bold ${info.isSunday ? 'bg-slate-100' : ''}`}
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
          table { width: 100%; border: 1px solid black !important; }
          th, td { border: 1px solid black !important; -webkit-print-color-adjust: exact; }
          tr { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
});

PrintReport.displayName = 'PrintReport';
