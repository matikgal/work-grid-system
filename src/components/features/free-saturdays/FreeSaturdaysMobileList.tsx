import React from 'react';
import { Employee } from '../../../types';
import { cn, stringToColor } from '../../../utils';
import { WsAdjustment } from '../../../services/adjustmentService';

interface FreeSaturdaysMobileListProps {
  employees: Employee[];
  isLocked: boolean;
  shiftsCount: Record<string, number>;
  adjustments: WsAdjustment[];
  onUpdateAdjustment: (employeeId: string, delta: number) => void;
}

export const FreeSaturdaysMobileList: React.FC<FreeSaturdaysMobileListProps> = ({
  employees,
  isLocked,
  shiftsCount,
  adjustments,
  onUpdateAdjustment,
}) => {
  return (
    <div className="space-y-3">
        {employees.map((emp) => {
            const fromGrid = shiftsCount[emp.id] || 0;
            const adj = adjustments.find(a => a.employeeId === emp.id)?.adjustment || 0;
            const total = fromGrid + adj;
            const isTailwindClass = emp.avatarColor?.startsWith('bg-');

            return (
                <div key={emp.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div 
                            className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm", emp.avatarColor)}
                            style={!isTailwindClass ? { backgroundColor: emp.avatarColor || stringToColor(emp.name) } : {}}
                        >
                            {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">{emp.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{emp.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Grafik</span>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{fromGrid}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Korekta</span>
                            <div className="flex items-center gap-2">
                                {!isLocked && (
                                    <button 
                                    onClick={() => onUpdateAdjustment(emp.id, -1)}
                                    className="w-6 h-6 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-600 active:scale-95"
                                    >
                                        -
                                    </button>
                                )}
                                <span className={cn("font-bold", adj !== 0 ? "text-brand-600 dark:text-brand-400" : "text-slate-400")}>{adj > 0 ? `+${adj}` : adj}</span>
                                {!isLocked && (
                                    <button 
                                    onClick={() => onUpdateAdjustment(emp.id, 1)}
                                    className="w-6 h-6 rounded bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-brand-600 active:scale-95"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg text-center border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Razem</span>
                            <p className="text-lg font-black text-slate-800 dark:text-white">{total}</p>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
  );
};
