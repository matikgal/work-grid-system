import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../utils';

interface DashboardNavBoxProps {
    to: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    colorTheme: 'rose' | 'emerald' | 'purple' | 'indigo' | 'gray' | 'slate';
    className?: string; // Additional classes
}

export const DashboardNavBox: React.FC<DashboardNavBoxProps> = ({ 
    to, 
    title, 
    description, 
    icon, 
    colorTheme,
    className 
}) => {
    const navigate = useNavigate();

    const colorVariants = {
        rose: 'hover:border-rose-200 dark:hover:border-rose-900 group-hover:text-rose-500 text-rose-50 dark:text-rose-900/20',
        emerald: 'hover:border-emerald-200 dark:hover:border-emerald-900 group-hover:text-emerald-500 text-emerald-50 dark:text-emerald-900/20',
        purple: 'hover:border-purple-200 dark:hover:border-purple-900 group-hover:text-purple-500 text-purple-50 dark:text-purple-900/20',
        indigo: 'hover:border-indigo-200 dark:hover:border-indigo-900 group-hover:text-indigo-500 text-indigo-50 dark:text-indigo-900/20',
        gray: 'hover:border-gray-300 dark:hover:border-gray-700 group-hover:text-gray-500 text-gray-50 dark:text-gray-800',
        slate: 'hover:border-slate-300 dark:hover:border-slate-700 group-hover:text-slate-500 text-slate-100 dark:text-slate-800',
    };

    const variantClasses = colorVariants[colorTheme];
    const hoverBorder = variantClasses.split(' ').slice(0, 2).join(' ');
    const iconColor = variantClasses.split(' ').slice(2).join(' ');
    const arrowColor = variantClasses.split(' ')[2]; 

    return (
        <button 
            onClick={() => navigate(to)}
            className={cn(
                "min-h-[160px] md:min-h-0 h-full bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group text-left relative overflow-hidden",
                hoverBorder,
                className
            )}
        >
            <div className={cn("absolute -right-6 -bottom-6", iconColor)}>
                 {icon}
            </div>

            <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex justify-end w-full">
                     <ArrowRight 
                        className={cn("w-4 h-4 text-gray-300 transition-colors -rotate-45 group-hover:rotate-0", arrowColor)} 
                        weight="bold" 
                     />
                </div>
                <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-xs md:text-sm text-gray-400 font-medium mt-1">{description}</p>
                </div>
            </div>
        </button>
    );
};
