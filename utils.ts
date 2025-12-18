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
export const getShiftStyle = (startTime: string) => {
  const hour = parseInt(startTime.split(':')[0], 10);
  
  if (hour < 10) {
    return 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200'; // Morning
  } else if (hour < 16) {
    return 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'; // Day
  } else {
    return 'bg-indigo-100 border-indigo-300 text-indigo-800 hover:bg-indigo-200'; // Evening
  }
};
