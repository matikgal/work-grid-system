import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Employee, Shift, ViewMode } from '../types';
import { cn } from '../utils';

interface PrintReportProps {
  currentDate: Date;
  employees: Employee[];
  shifts: Shift[];
  viewMode: ViewMode;
}

export const PrintReport: React.FC<PrintReportProps> = React.memo(({ currentDate, employees, shifts, viewMode }) => {
  const daysInfo = useMemo(() => {
    let start: Date;
    let end: Date;

    if (viewMode === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 1 });
      end = endOfWeek(currentDate, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
    }

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
  }, [currentDate, viewMode]);

  const shiftsLookup = useMemo(() => {
    const lookup: Record<string, Shift> = {};
    shifts.forEach(s => {
      lookup[`${s.employeeId}-${s.date}`] = s;
    });
    return lookup;
  }, [shifts]);

  const getHeaderTitle = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `Grafik ${format(start, 'dd.MM', { locale: pl })} - ${format(end, 'dd.MM.yyyy', { locale: pl })}`;
    }
    return `Grafik Pracy - ${format(currentDate, 'LLLL yyyy', { locale: pl })}`;
  };

  return (
    <div className="hidden print:block w-full bg-white text-black p-2 font-sans overflow-visible">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight">
          {getHeaderTitle()}
        </h1>
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
            <th className="border-2 border-slate-800 p-1 text-center bg-slate-100 w-20 font-bold uppercase text-[7px]">Suma</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => {
            let totalHours = 0;
            const isEven = idx % 2 === 0;
            
            return (
              <tr key={emp.id} className={cn("h-6", isEven ? "bg-white" : "bg-slate-100")}>
                <td className="border-2 border-slate-800 p-1 font-bold whitespace-nowrap px-2 text-[9px] overflow-hidden text-ellipsis">{emp.name}</td>
                {daysInfo.map(info => {
                  const shift = shiftsLookup[`${emp.id}-${info.dateStr}`];
                  let displayVal = '';

                  if (shift) {
                      if (shift.type === 'Urlop') {
                          displayVal = 'U';
                          totalHours += 8;
                      } else if (shift.type === 'Wolna Sobota') {
                          displayVal = 'WS';
                      } else {
                          // Standard work shift
                          if (viewMode === 'week') {
                             const start = parseInt(shift.startTime.split(':')[0]);
                             const end = parseInt(shift.endTime.split(':')[0]);
                             displayVal = `${start}-${end}`;
                          } else {
                             // Month mode - show duration (e.g. 8)
                             displayVal = shift.duration.toString();
                          }
                          totalHours += (shift.duration || 0);
                      }
                  }

                  return (
                    <td 
                      key={info.dateStr} 
                      className={cn(
                        "border-2 border-slate-800 p-0.5 text-center font-bold",
                        info.isSunday ? "bg-slate-200" : ""
                      )}
                    >
                      {displayVal}
                    </td>
                  );
                })}
                <td className="border-2 border-slate-800 p-1 text-center font-bold text-[8px] whitespace-nowrap">
                    {totalHours}h <span className="font-normal opacity-75">/ {parseFloat((totalHours / 8).toFixed(2))}d</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-2 flex items-center justify-center flex-col  text-[9px]">
       
        
          <p className="font-bold mb-1 uppercase text-slate-400">Data sporządzenia:</p>
          <p className="font-bold">{format(new Date(), 'dd.MM.yyyy')}</p>
        
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
