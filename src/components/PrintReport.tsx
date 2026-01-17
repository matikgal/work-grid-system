import React, { useMemo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getYear, getMonth } from 'date-fns';
import { pl } from 'date-fns/locale';
import Holidays from 'date-holidays';
import { Employee, Shift, ViewMode } from '../types';
import { SHIFT_TYPES } from '../constants';

interface PrintReportProps {
  currentDate: Date;
  employees: Employee[];
  shifts: Shift[];
  viewMode: ViewMode;
  workingDaysCount?: number;
}

type ShiftDisplayInfo = {
  displayVal: string;
  bgColor: string;
  textColor: string;
  isSpecial: boolean;
};

const getShiftDisplayInfo = (
  shift: Shift | undefined,
  isSunday: boolean,
  viewMode: ViewMode
): ShiftDisplayInfo & { hoursToAdd: number } => {
  const baseStyles = {
    displayVal: '',
    bgColor: isSunday ? '#e2e8f0' : 'transparent',
    textColor: '#1e293b',
    isSpecial: false,
    hoursToAdd: 0,
  };

  if (!shift) return baseStyles;

  switch (shift.type) {
    case SHIFT_TYPES.VACATION:
      return {
        displayVal: 'U',
        bgColor: '#fed7aa',
        textColor: '#9a3412',
        isSpecial: true,
        hoursToAdd: 8,
      };
    case SHIFT_TYPES.FREE_SATURDAY:
      return {
        displayVal: 'WS',
        bgColor: '#e2e8f0',
        textColor: '#475569',
        isSpecial: true,
        hoursToAdd: 0,
      };
    case SHIFT_TYPES.WS:
      return {
        displayVal: 'WS',
        bgColor: '#a3e635',
        textColor: '#1a2e05',
        isSpecial: true,
        hoursToAdd: 0,
      };
    case SHIFT_TYPES.WORK_8:
      return {
        displayVal: '8',
        bgColor: '#a3e635',
        textColor: '#1a2e05',
        isSpecial: true,
        hoursToAdd: 0,
      };
    case SHIFT_TYPES.HOLIDAY:
      return {
        displayVal: 'ŚW',
        bgColor: '#fecaca',
        textColor: '#dc2626',
        isSpecial: true,
        hoursToAdd: 0,
      };
    case SHIFT_TYPES.SICK_LEAVE_L4:
    case SHIFT_TYPES.SICK_LEAVE:
      return {
        displayVal: 'L4',
        bgColor: '#fef08a',
        textColor: '#a16207',
        isSpecial: true,
        hoursToAdd: 0,
      };
    case SHIFT_TYPES.SCHOOL:
      return {
        displayVal: 'SZ',
        bgColor: '#ddd6fe',
        textColor: '#7c3aed',
        isSpecial: true,
        hoursToAdd: 0,
      };
    default: {
      let displayVal = '';
      if (viewMode === 'week') {
        const start = parseInt(shift.startTime.split(':')[0], 10);
        const end = parseInt(shift.endTime.split(':')[0], 10);
        displayVal = `${start}-${end}`;
      } else {
        displayVal = shift.duration.toString();
      }
      return {
        displayVal,
        bgColor: isSunday ? '#e2e8f0' : 'transparent',
        textColor: '#1e293b',
        isSpecial: false,
        hoursToAdd: shift.duration || 0,
      };
    }
  }
};

export const PrintReport: React.FC<PrintReportProps> = React.memo(({ currentDate, employees, shifts, viewMode, workingDaysCount }) => {
  // Use a state for the portal target to ensure it exists
  const [portalNode] = useState(() => {
    const el = document.createElement('div');
    el.className = 'print-portal-container';
    return el;
  });

  useEffect(() => {
    document.body.appendChild(portalNode);
    return () => {
      document.body.removeChild(portalNode);
    };
  }, [portalNode]);

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
      const isSaturday = getDay(day) === 6;
      return {
        day,
        dateStr: format(day, 'yyyy-MM-dd'),
        label: format(day, 'd'),
        weekday: format(day, 'EEEEEE', { locale: pl }),
        isSunday,
        isSaturday,
        isWeekend: isSunday || isSaturday,
      };
    });
  }, [currentDate, viewMode]);

  const normHours = useMemo(() => {
    if (viewMode !== 'month') return 0;
    
    if (workingDaysCount !== undefined && workingDaysCount > 0) {
        return workingDaysCount * 8;
    }

    const hd = new Holidays('PL');
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    let hours = 0;
    days.forEach(day => {
        const dayOfWeek = getDay(day); // 0 = Sun, 6 = Sat
        const isWorkingDay = dayOfWeek !== 0 && dayOfWeek !== 6; // Mon-Fri

        if (isWorkingDay) {
            hours += 8;
        }

        const isHoliday = hd.isHoliday(day);
        if (isHoliday && dayOfWeek !== 0) { // Holiday not on Sunday reduces dimension
             hours -= 8;
        }
    });
    return Math.max(0, hours);
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
      return `${format(start, 'dd.MM', { locale: pl })} - ${format(end, 'dd.MM.yyyy', { locale: pl })}`;
    }
    return format(currentDate, 'LLLL yyyy', { locale: pl });
  };

  const employeeCount = employees.length;
  // Dynamic font size logic scale
  const fontSize = employeeCount > 25 ? 9 : employeeCount > 20 ? 10 : 11;
  const headerFontSize = fontSize + 1;

  // Render content into the portal
  return createPortal(
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: landscape;
            margin: 5mm;
          }
          
          html, body {
            width: 100%;
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Hide everything in the body that is NOT our portal container */
          body > *:not(.print-portal-container) {
            display: none !important;
          }

          /* Style the portal container to fill the page */
          .print-portal-container {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          
          /* Print Styles Refined */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-header {
            flex: 0 0 auto;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 2px;
            margin-bottom: 4px;
          }
          
          .print-table-wrapper {
            flex: 1 1 auto;
            position: relative;
            /* No overflow hidden here to avoid cutting off borders */
          }
          
          table {
            width: 100%;
            height: 100%;
            border-collapse: collapse;
          }
          
          .print-legend {
            flex: 0 0 auto;
            border-top: 1px solid #cbd5e1;
            padding-top: 4px;
            margin-top: 4px;
          }
        }
        
        /* Normalize screen view to be hidden (this component is print-only) */
        @media screen {
           .print-portal-container {
              display: none;
           }
        }
      `}} />

      <div className="print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px', color: 'black' }}>
          Grafik Pracy
        </h1>
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>
          {getHeaderTitle()}
        </span>
      </div>
      
      <div className="print-table-wrapper">
        <table style={{ fontSize: `${fontSize}px` }}>
          <thead>
            <tr style={{ height: '24px' }}>
              <th style={{ 
                border: '1.5px solid #334155',
                padding: '0 4px',
                textAlign: 'left',
                fontWeight: 800,
                textTransform: 'uppercase',
                backgroundColor: '#1e293b',
                color: 'white',
                fontSize: `${headerFontSize}px`,
                width: viewMode === 'week' ? '18%' : '12%'
              }}>
                Pracownik
              </th>
              {daysInfo.map(info => (
                <th key={info.dateStr} style={{ border: '1.5px solid #334155', padding: '0', textAlign: 'center', backgroundColor: info.isWeekend ? '#cbd5e1' : '#f1f5f9', color: 'black' }}>
                  <div style={{ fontSize: `${Math.max(fontSize - 4, 7)}px`, textTransform: 'uppercase', lineHeight: 1 }}>{info.weekday}</div>
                  <div style={{ fontSize: `${fontSize}px`, fontWeight: 800, lineHeight: 1 }}>{info.label}</div>
                </th>
              ))}
              <th style={{ border: '1.5px solid #334155', padding: '0', textAlign: 'center', backgroundColor: '#1e293b', color: 'white', fontSize: `${headerFontSize}px`, width: viewMode === 'week' ? '6%' : '4%' }}>Σ</th>
              {viewMode === 'month' && (
                <>
                  <th style={{ border: '1.5px solid #334155', padding: '0', textAlign: 'center', backgroundColor: '#1e293b', color: 'white', fontSize: `${headerFontSize - 2}px`, width: '2%' }}>+</th>
                  <th style={{ border: '1.5px solid #334155', padding: '0', textAlign: 'center', backgroundColor: '#1e293b', color: 'white', fontSize: `${headerFontSize - 2}px`, width: '2%' }}>-</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => {
              const isZebraRow = idx % 2 !== 0;
              const zStyle = isZebraRow ? { borderTop: '2px solid #1e293b', borderBottom: '2px solid #1e293b' } : {};
              
              // Row Color Logic for Employee Name Cell
              let nameCellBg = '#ffffff';
              if (emp.rowColor === 'blue') nameCellBg = '#dbeafe';
              if (emp.rowColor === 'red') nameCellBg = '#fee2e2';
              if (emp.rowColor === 'green') nameCellBg = '#d1fae5';
              
              // Separator overrides
              if (emp.isSeparator) {
                  return (
                    <tr key={emp.id} style={{ height: `${100 / employees.length}%`, backgroundColor: '#f8fafc' }}>
                        <td style={{ 
                            border: '1px solid #64748b',
                            ...zStyle,
                            padding: '0 4px', 
                            backgroundColor: '#e2e8f0', // Darker gray for header
                            color: '#94a3b8',
                        }}>
                        </td>
                        {daysInfo.map(info => (
                            <td key={info.dateStr} style={{ 
                                border: '1px solid #cbd5e1', 
                                ...zStyle,
                                textAlign: 'center', 
                                fontWeight: 700, 
                                backgroundColor: '#f8fafc', 
                                color: '#cbd5e1', // Light gray text
                                padding: 0,
                                fontSize: '10px'
                            }}>
                                X
                            </td>
                        ))}
                        <td style={{ 
                            border: '1px solid #64748b', 
                            ...zStyle,
                            textAlign: 'center', 
                            backgroundColor: '#e2e8f0', 
                            color: '#94a3b8' 
                        }}>
                            -
                        </td>
                        {viewMode === 'month' && (
                          <>
                            <td style={{ border: '1px solid #64748b', ...zStyle, backgroundColor: '#e2e8f0' }}></td>
                            <td style={{ border: '1px solid #64748b', ...zStyle, backgroundColor: '#e2e8f0' }}></td>
                          </>
                        )}
                    </tr>
                  );
              }

              return (
                <tr key={emp.id} style={{ height: `${100 / employees.length}%` }}>
                  <td style={{ 
                    border: '1px solid #64748b',
                    ...zStyle,
                    padding: '0 4px', 
                    fontWeight: 700, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    backgroundColor: nameCellBg, 
                    color: 'black' 
                  }}>
                    {emp.name}
                  </td>
                  {daysInfo.map(info => {
                    const shift = shiftsLookup[`${emp.id}-${info.dateStr}`];
                    const { displayVal, bgColor, textColor } = getShiftDisplayInfo(shift, info.isSunday, viewMode);
                    return (
                      <td key={info.dateStr} style={{ 
                        border: '1px solid #94a3b8', 
                        ...zStyle,
                        textAlign: 'center', 
                        fontWeight: 700, 
                        backgroundColor: bgColor, 
                        color: textColor, 
                        padding: 0 
                      }}>
                        {displayVal}
                      </td>
                    );
                  })}
                   <td style={{ 
                    border: '1px solid #64748b', 
                    ...zStyle,
                    textAlign: 'center', 
                    fontWeight: 800, 
                    backgroundColor: '#e2e8f0', 
                    color: 'black' 
                  }}>
                    {shifts.filter(s => s.employeeId === emp.id).reduce((acc, s) => acc + (s.duration || 0), 0)}
                  </td>
                  {viewMode === 'month' && (() => {
                      const total = shifts.filter(s => s.employeeId === emp.id).reduce((acc, s) => acc + (s.duration || 0), 0);
                      const diff = total - normHours;
                      const daysDiff = diff / 8;
                      return (
                        <>
                          <td style={{ border: '1px solid #64748b', ...zStyle, textAlign: 'center', fontWeight: 700, fontSize: '9px', color: 'green', backgroundColor: daysDiff > 0 ? '#dcfce7' : 'white' }}>
                            {daysDiff > 0 ? `+${daysDiff}` : ''}
                          </td>
                          <td style={{ border: '1px solid #64748b', ...zStyle, textAlign: 'center', fontWeight: 700, fontSize: '9px', color: 'red', backgroundColor: daysDiff < 0 ? '#fee2e2' : 'white' }}>
                            {daysDiff < 0 ? daysDiff : ''}
                          </td>
                        </>
                      );
                  })()}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="print-legend" style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '9px', color: 'black' }}>
        <span><b style={{ padding: '0 4px', backgroundColor: '#fed7aa' }}>U</b> Urlop</span>
        <span><b style={{ padding: '0 4px', backgroundColor: '#fef08a' }}>L4</b> Zwolnienie</span>
        <span><b style={{ padding: '0 4px', backgroundColor: '#fecaca' }}>ŚW</b> Święto</span>
        <span><b style={{ padding: '0 4px', backgroundColor: '#e2e8f0' }}>WS</b> Wolna Sob.</span>
        <span><b style={{ padding: '0 4px', backgroundColor: '#a3e635' }}>WS/8</b> Oddaje</span>
        <span style={{ marginLeft: '10px' }}>Dodatkowe dni: <b style={{ color: 'green' }}>+1</b> / Zaległe: <b style={{ color: 'red' }}>-1</b></span>
      </div>
    </>,
    portalNode
  );
});

PrintReport.displayName = 'PrintReport';
