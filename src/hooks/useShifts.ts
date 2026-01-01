import { useState, useCallback, useEffect } from 'react';
import { Shift, Employee } from '../types';
import { shiftService } from '../services/shiftService';
import { startOfMonth, endOfMonth, format, subDays, addDays } from 'date-fns';

export function useShifts(employees: Employee[], currentDate: Date) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShifts = useCallback(async () => {
    if (employees.length === 0) return;
    
    setLoading(true);
    try {
      // Fetch a bit more than just the month to handle weeks crossing months
      const start = format(subDays(startOfMonth(currentDate), 7), 'yyyy-MM-dd');
      const end = format(addDays(endOfMonth(currentDate), 7), 'yyyy-MM-dd');
      const empIds = employees.map(e => e.id);
      
      const data = await shiftService.getShifts(empIds, start, end);
      setShifts(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  }, [employees, currentDate]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const saveShift = async (shiftData: Shift | Omit<Shift, 'id'>) => {
      try {
          const saved = await shiftService.upsert(shiftData);
          setShifts(prev => {
              const exists = prev.some(s => s.id === saved.id);
              if (exists) {
                  return prev.map(s => s.id === saved.id ? saved : s);
              }
              return [...prev, saved];
          });
      } catch (e) {
          console.error("Error saving shift:", e);
      }
  };

  const deleteShift = async (id: string) => {
      try {
          await shiftService.delete(id);
          setShifts(prev => prev.filter(s => s.id !== id));
      } catch (e) {
          console.error("Error deleting shift:", e);
      }
  };

  return {
      shifts,
      loading,
      saveShift,
      deleteShift,
      refreshShifts: fetchShifts
  };
}
