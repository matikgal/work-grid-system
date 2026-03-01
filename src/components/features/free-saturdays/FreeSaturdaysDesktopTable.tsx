import React from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor, displayName } from '../../../utils';
import { WsAdjustment } from '../../../services/adjustmentService';

interface FreeSaturdaysDesktopTableProps {
  employees: Employee[];
  isLocked: boolean;
  shiftsCount: Record<string, number>;
  adjustments: WsAdjustment[];
  onUpdateAdjustment: (employeeId: string, delta: number) => void;
}

export const FreeSaturdaysDesktopTable: React.FC<FreeSaturdaysDesktopTableProps> = ({
  employees,
  isLocked,
  shiftsCount,
  adjustments,
  onUpdateAdjustment,
}) => {
  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
            <tr>
                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Pracownik</th>
                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">Z Grafiku</th>
                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center">Korekta</th>
                <th className="p-2 md:p-3 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider text-center bg-slate-100 dark:bg-slate-800/80">Suma</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {employees.length === 0 ? (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Brak pracowników</td>
                </tr>
            ) : employees.map((emp, index) => {
                const fromGrid = shiftsCount[emp.id] || 0;
                const adj = adjustments.find(a => a.employeeId === emp.id)?.adjustment || 0;
                const total = fromGrid + adj;
                
                const isTailwindClass = emp.avatarColor?.startsWith('bg-');
                const avatarStyle = isTailwindClass ? {} : { backgroundColor: emp.avatarColor || stringToColor(emp.name) };

                const isEven = index % 2 === 0;

                return (
                    <tr key={emp.id} className={cn(
                        "group transition-colors",
                        isEven ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-900/50",
                        "hover:bg-slate-50 hover:dark:bg-slate-800/50"
                    )}>
                        <td className="p-2 md:p-3">
                            <div className="flex items-center gap-3">
                                 <div 
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm",
                                        emp.avatarColor
                                    )}
                                    style={avatarStyle}
                                >
                                    {displayName(emp.name).charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{displayName(emp.name)}</div>
                                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{emp.role}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-2 md:p-3 text-center">
                            <span className="font-mono text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{fromGrid}</span>
                        </td>
                        <td className="p-2 md:p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                                {!isLocked && (
                                    <button 
                                    onClick={() => onUpdateAdjustment(emp.id, -1)}
                                    className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        -
                                    </button>
                                )}
                                <span className={cn("font-bold w-6 text-sm", adj !== 0 ? "text-brand-600 dark:text-brand-400" : "text-slate-300")}>
                                    {adj > 0 ? `+${adj}` : adj}
                                </span>
                                {!isLocked && (
                                    <button 
                                    onClick={() => onUpdateAdjustment(emp.id, 1)}
                                    className="w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </td>
                        <td className="p-2 md:p-3 text-center bg-slate-50/50 dark:bg-slate-800/20 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/50 border-l border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-lg text-slate-800 dark:text-white">{total}</span>
                        </td>
                    </tr>
                );
            })}
        </tbody>
        </table>
    </div>
  );
};
