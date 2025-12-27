import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate hours between two HH:MM strings
export const calculateDuration = (start: string, end: string): number => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startDate = new Date(0, 0, 0, startH, startM, 0);
  const endDate = new Date(0, 0, 0, endH, endM, 0);

  let diff = endDate.getTime() - startDate.getTime();
  
  // Handle overnight shifts (e.g. 22:00 to 06:00)
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000;
  }

  const hours = diff / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // Round to 2 decimal places
};

// Generate a random pastel color for avatars
export const getRandomColor = () => {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-emerald-100 text-emerald-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700',
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-violet-100 text-violet-700',
    'bg-purple-100 text-purple-700',
    'bg-fuchsia-100 text-fuchsia-700',
    'bg-pink-100 text-pink-700',
    'bg-rose-100 text-rose-700',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Determine shift color based on start time
// Determine shift color based on shift type
export const getShiftStyle = (type: string): { bg: string; border: string; text: string } => {
  switch (type) {
    case '6-14':
    case '06:00':
      return { 
          bg: 'bg-emerald-100 dark:bg-emerald-500/20', 
          border: 'border-emerald-200 dark:border-emerald-500/30', 
          text: 'text-emerald-800 dark:text-emerald-300' 
      };
    
    case '14-22':
    case '14:00':
      return { 
          bg: 'bg-indigo-100 dark:bg-indigo-500/20', 
          border: 'border-indigo-200 dark:border-indigo-500/30', 
          text: 'text-indigo-800 dark:text-indigo-300' 
      };

    case '10-18':
    case '10:00':
      return { 
          bg: 'bg-purple-100 dark:bg-purple-500/20', 
          border: 'border-purple-200 dark:border-purple-500/30', 
          text: 'text-purple-800 dark:text-purple-300' 
      };

    case 'Urlop':
      return { 
          bg: 'bg-orange-100 dark:bg-orange-500/20', 
          border: 'border-orange-200 dark:border-orange-500/30', 
          text: 'text-orange-800 dark:text-orange-300' 
      };
    
    case 'Wolna Sobota':
      return { 
          bg: 'bg-slate-100 dark:bg-slate-800/40', 
          border: 'border-slate-200 dark:border-slate-700', 
          text: 'text-slate-500 dark:text-slate-400' 
      };

    case 'Święto':
      return { 
          bg: 'bg-red-100 dark:bg-red-900/30', 
          border: 'border-red-200 dark:border-red-800', 
          text: 'text-red-700 dark:text-red-400' 
      };

    case 'Szkoła':
      return { 
          bg: 'bg-blue-100 dark:bg-blue-500/20', 
          border: 'border-blue-300 dark:border-blue-500/30', 
          text: 'text-blue-800 dark:text-blue-300' 
      };

    case 'L4':
    case 'Chorobowe':
      return { 
          bg: 'bg-rose-100 dark:bg-rose-500/20', 
          border: 'border-rose-300 dark:border-rose-500/30', 
          text: 'text-rose-800 dark:text-rose-300' 
      };

    default:
      // Fallback for custom times - try to guess based on hour if type looks like HH:MM
      if (type.includes(':')) {
          const hour = parseInt(type.split(':')[0], 10);
          if (hour < 10) return { 
              bg: 'bg-emerald-100 dark:bg-emerald-500/20', 
              border: 'border-emerald-300 dark:border-emerald-500/30', 
              text: 'text-emerald-800 dark:text-emerald-300' 
          };
          if (hour < 16) return { 
              bg: 'bg-indigo-100 dark:bg-indigo-500/20', 
              border: 'border-indigo-300 dark:border-indigo-500/30', 
              text: 'text-indigo-800 dark:text-indigo-300' 
          };
          return { 
              bg: 'bg-indigo-100 dark:bg-indigo-500/20', 
              border: 'border-indigo-300 dark:border-indigo-500/30', 
              text: 'text-indigo-800 dark:text-indigo-300' 
          };
      }
      return { 
          bg: 'bg-gray-100 dark:bg-slate-700', 
          border: 'border-gray-200 dark:border-slate-600', 
          text: 'text-gray-700 dark:text-slate-300' 
      };
  }
};

export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};
