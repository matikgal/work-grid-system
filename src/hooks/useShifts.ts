import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shift, Employee } from '../types';
import { shiftService } from '../services/shiftService';
import { startOfMonth, endOfMonth, format, subDays, addDays } from 'date-fns';

export const shiftKeys = {
  all: () => ['shifts'] as const,
  list: (empIds: string[], start: string, end: string) => [...shiftKeys.all(), { empIds, start, end }] as const,
};

export function useShifts(employees: Employee[], currentDate: Date) {
  const queryClient = useQueryClient();

  const start = format(subDays(startOfMonth(currentDate), 7), 'yyyy-MM-dd');
  const end = format(addDays(endOfMonth(currentDate), 7), 'yyyy-MM-dd');
  const empIds = employees.map(e => e.id);

  const { data: shifts = [], isLoading: loading } = useQuery({
    queryKey: shiftKeys.list(empIds, start, end),
    queryFn: () => shiftService.getShifts(empIds, start, end),
    enabled: empIds.length > 0,
  });

  const { mutateAsync: saveShift } = useMutation({
    mutationFn: (shiftData: Shift | Omit<Shift, 'id'>) => shiftService.upsert(shiftData),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: shiftKeys.all() });
    }
  });

  const { mutateAsync: deleteShift } = useMutation({
    mutationFn: (id: string) => shiftService.delete(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: shiftKeys.all() });
    }
  });

  const { mutateAsync: saveMultipleShifts } = useMutation({
    mutationFn: async (shiftsData: (Shift | Omit<Shift, 'id'>)[]) => {
        const promises = shiftsData.map(s => shiftService.upsert(s));
        return Promise.all(promises);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: shiftKeys.all() });
    }
  });

  return {
      shifts,
      loading,
      saveShift,
      saveMultipleShifts,
      deleteShift,
      refreshShifts: () => queryClient.invalidateQueries({ queryKey: shiftKeys.list(empIds, start, end) })
  };
}
