import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftService } from '../services/shiftService';
import { adjustmentService, WsAdjustment } from '../services/adjustmentService';
import { SHIFT_TYPES } from '../constants';
import { Employee } from '../types';

export const freeSaturdaysKeys = {
  all: (userId: string, year: number) => ['free-saturdays', userId, year] as const,
};

export function useFreeSaturdays(userId: string, selectedYear: number, employees: Employee[]) {
  const queryClient = useQueryClient();
  const empIds = employees.map((e) => e.id);

  const { data, isLoading: loading } = useQuery({
    queryKey: freeSaturdaysKeys.all(userId, selectedYear),
    queryFn: async () => {
      if (empIds.length === 0) {
        return { shiftsCount: {}, adjustments: [] };
      }

      const start = `${selectedYear}-01-01`;
      const end = `${selectedYear}-12-31`;

      // 1. Fetch Shifts (Wolna Sobota only)
      const shifts = await shiftService.getShifts(empIds, start, end, SHIFT_TYPES.FREE_SATURDAY);

      const counts: Record<string, number> = {};
      shifts.forEach((s) => {
        counts[s.employeeId] = (counts[s.employeeId] || 0) + 1;
      });

      // 2. Fetch Adjustments
      const adjs = await adjustmentService.getAdjustments(empIds, selectedYear, userId);

      return { shiftsCount: counts, adjustments: adjs };
    },
    enabled: !!userId && !!selectedYear && empIds.length > 0,
  });

  const { mutateAsync: updateAdjustmentMutate } = useMutation({
    mutationFn: async ({ employeeId, newVal }: { employeeId: string; newVal: number }) => {
      const updated = await adjustmentService.upsertAdjustment(employeeId, userId, selectedYear, newVal);
      return updated;
    },
    onMutate: async (newVar) => {
      await queryClient.cancelQueries({ queryKey: freeSaturdaysKeys.all(userId, selectedYear) });
      const prev = queryClient.getQueryData<any>(freeSaturdaysKeys.all(userId, selectedYear));

      if (prev) {
        const existingId = prev.adjustments.find((a: WsAdjustment) => a.employeeId === newVar.employeeId)?.id || `temp-${newVar.employeeId}`;
        const newAdjustment = {
          id: existingId,
          employeeId: newVar.employeeId,
          userId: userId,
          year: selectedYear,
          adjustment: newVar.newVal,
        };

        const filteredAdjustments = prev.adjustments.filter((a: WsAdjustment) => a.employeeId !== newVar.employeeId);

        queryClient.setQueryData(freeSaturdaysKeys.all(userId, selectedYear), {
          ...prev,
          adjustments: [...filteredAdjustments, newAdjustment],
        });
      }
      return { prev };
    },
    onError: (err, newVar, context) => {
      if (context?.prev) {
        queryClient.setQueryData(freeSaturdaysKeys.all(userId, selectedYear), context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: freeSaturdaysKeys.all(userId, selectedYear) });
    },
  });

  const updateAdjustment = (employeeId: string, delta: number) => {
    const existing = data?.adjustments.find((a: WsAdjustment) => a.employeeId === employeeId);
    const newVal = (existing?.adjustment || 0) + delta;
    return updateAdjustmentMutate({ employeeId, newVal });
  };

  return {
    shiftsCount: data?.shiftsCount || {},
    adjustments: data?.adjustments || [],
    loading,
    updateAdjustment,
  };
}
