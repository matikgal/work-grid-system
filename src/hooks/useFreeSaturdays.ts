import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustmentService, WsAdjustment } from '../services/adjustmentService';
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
        return { adjustments: [] };
      }
      const adjs = await adjustmentService.getAdjustments(empIds, selectedYear, userId);
      return { adjustments: adjs };
    },
    enabled: !!userId && !!selectedYear && empIds.length > 0,
  });

  const { mutateAsync: updateAdjustmentMutate } = useMutation({
    mutationFn: async ({ employeeId, newVal }: { employeeId: string; newVal: number }) => {
      return adjustmentService.upsertAdjustment(employeeId, userId, selectedYear, newVal);
    },
    onMutate: async (newVar) => {
      await queryClient.cancelQueries({ queryKey: freeSaturdaysKeys.all(userId, selectedYear) });
      const prev = queryClient.getQueryData<{ adjustments: WsAdjustment[] }>(freeSaturdaysKeys.all(userId, selectedYear));

      if (prev) {
        const existingId = prev.adjustments.find((a) => a.employeeId === newVar.employeeId)?.id || `temp-${newVar.employeeId}`;
        const newAdjustment: WsAdjustment = {
          id: existingId,
          employeeId: newVar.employeeId,
          userId,
          year: selectedYear,
          adjustment: newVar.newVal,
        };
        queryClient.setQueryData(freeSaturdaysKeys.all(userId, selectedYear), {
          ...prev,
          adjustments: [
            ...prev.adjustments.filter((a) => a.employeeId !== newVar.employeeId),
            newAdjustment,
          ],
        });
      }
      return { prev };
    },
    onError: (_err, _newVar, context) => {
      if (context?.prev) {
        queryClient.setQueryData(freeSaturdaysKeys.all(userId, selectedYear), context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: freeSaturdaysKeys.all(userId, selectedYear) });
    },
  });

  // Sets the absolute value entered by the user directly.
  const setAdjustment = (employeeId: string, newVal: number) => {
    return updateAdjustmentMutate({ employeeId, newVal });
  };

  return {
    adjustments: data?.adjustments || [],
    loading,
    setAdjustment,
  };
}
