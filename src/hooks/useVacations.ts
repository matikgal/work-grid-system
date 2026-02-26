import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftService } from '../services/shiftService';
import { vacationService } from '../services/vacationService';
import { SHIFT_TYPES } from '../constants';

export const vacationKeys = {
  all: (userId: string, year: number) => ['vacations', userId, year] as const,
};

export function useVacations(userId: string, selectedYear: number, employeeIds: string[]) {
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: vacationKeys.all(userId, selectedYear),
    queryFn: async () => {
        if (!employeeIds || employeeIds.length === 0) {
            return { counts: {}, balances: {}, highlights: new Set<string>(), manuals: {} };
        }

        const start = `${selectedYear}-01-01`;
        const end = `${selectedYear}-12-31`;
        
        // Fetch 1: Shifts (Automatic)
        const shifts = await shiftService.getShifts(employeeIds, start, end, SHIFT_TYPES.VACATION);
        
        const counts: Record<string, number[]> = {};
        employeeIds.forEach(id => {
            counts[id] = Array(12).fill(0);
        });

        shifts.forEach(s => {
            const date = new Date(s.date);
            const monthIndex = date.getMonth(); // 0-11
            if (counts[s.employeeId]) {
                counts[s.employeeId][monthIndex] += 1;
            }
        });

        // Fetch 2: External Balances
        const balances = await vacationService.getBalances(employeeIds, selectedYear, userId);
        const balMap: Record<string, number> = {};
        const highlightSet = new Set<string>();
        const manualMap: Record<string, number[]> = {};
        
        balances.forEach(b => {
            balMap[b.employeeId] = b.days;
            if (b.isHighlighted) {
                highlightSet.add(b.employeeId);
            }
            manualMap[b.employeeId] = b.manualDays || Array(12).fill(0);
        });

        return { counts, balances: balMap, highlights: highlightSet, manuals: manualMap };
    },
    enabled: !!userId && !!selectedYear && employeeIds.length > 0,
  });

  const { mutateAsync: updateBalanceMutate } = useMutation({
    mutationFn: async ({ employeeId, days, isHighlighted, manualDays }: { employeeId: string, days: number, isHighlighted: boolean, manualDays: number[] }) => {
        await vacationService.upsertBalance(employeeId, userId, selectedYear, { days, isHighlighted, manualDays });
        return { employeeId, days, isHighlighted, manualDays };
    },
    onMutate: async (newVar) => {
        await queryClient.cancelQueries({ queryKey: vacationKeys.all(userId, selectedYear) });
        const prev = queryClient.getQueryData<any>(vacationKeys.all(userId, selectedYear));
        
        if (prev) {
            queryClient.setQueryData(vacationKeys.all(userId, selectedYear), {
                ...prev,
                balances: { ...prev.balances, [newVar.employeeId]: newVar.days },
                manuals: { ...prev.manuals, [newVar.employeeId]: newVar.manualDays },
                highlights: newVar.isHighlighted 
                    ? new Set(prev.highlights).add(newVar.employeeId) 
                    : new Set([...prev.highlights].filter(id => id !== newVar.employeeId))
            });
        }
        return { prev };
    },
    onError: (err, newVar, context) => {
        if (context?.prev) {
            queryClient.setQueryData(vacationKeys.all(userId, selectedYear), context.prev);
        }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: vacationKeys.all(userId, selectedYear) });
    }
  });

  const updateBalance = (employeeId: string, value: string, isHighlighted: boolean, manualDays: number[]) => {
      const days = parseInt(value) || 0;
      return updateBalanceMutate({ employeeId, days, isHighlighted, manualDays });
  };

  const updateManualDays = (employeeId: string, monthIndex: number, value: string, currentManual: number[], days: number, isHighlighted: boolean) => {
      const val = parseInt(value) || 0;
      const newManual = [...(currentManual || Array(12).fill(0))];
      newManual[monthIndex] = val;
      return updateBalanceMutate({ employeeId, days, isHighlighted, manualDays: newManual });
  };

  const toggleHighlight = (employeeId: string, isCurrentlyHighlighted: boolean, days: number, manualDays: number[]) => {
      return updateBalanceMutate({ employeeId, days, isHighlighted: !isCurrentlyHighlighted, manualDays: manualDays || Array(12).fill(0) });
  };

  return { 
      vacationCounts: data?.counts || {}, 
      vacationBalances: data?.balances || {}, 
      highlightedEmployees: data?.highlights || new Set<string>(), 
      vacationManual: data?.manuals || {}, 
      loading,
      updateBalance,
      updateManualDays,
      toggleHighlight
  };
}
