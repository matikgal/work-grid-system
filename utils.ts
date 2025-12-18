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
    case 'Ranna':
    case '06:00': // Legacy support if needed
      return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800' };
    
    case 'Popołudniowa':
    case '14:00':
      return { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' };

    case '10-18':
    case '10:00':
      return { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' };

    case 'Urlop':
      return { bg: 'bg-sky-100', border: 'border-sky-300', text: 'text-sky-800' };
    
    case 'Wolna Sobota':
      return { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-500' };

    case 'Szkoła':
      return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' };

    case 'L4':
    case 'Chorobowe':
      return { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800' };

    default:
      // Fallback for custom times - try to guess based on hour if type looks like HH:MM
      if (type.includes(':')) {
          const hour = parseInt(type.split(':')[0], 10);
          if (hour < 10) return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800' };
          if (hour < 16) return { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' };
          return { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' };
      }
      return { bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-700' };
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
