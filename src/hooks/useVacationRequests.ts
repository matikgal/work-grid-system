import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  vacationRequestService,
  VacationRequestStatus,
} from '../services/vacationRequestService';

export const vacationRequestKeys = {
  all: (userId: string) => ['vacation_requests', userId] as const,
};

export function useVacationRequests(userId: string) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: vacationRequestKeys.all(userId),
    queryFn: () => vacationRequestService.getAll(userId),
    enabled: !!userId,
  });

  const { mutateAsync: createRequest } = useMutation({
    mutationFn: (params: {
      employeeId: string;
      dateFrom: string;
      dateTo: string;
      daysCount: number;
      reason?: string;
    }) =>
      vacationRequestService.create(
        userId,
        params.employeeId,
        params.dateFrom,
        params.dateTo,
        params.daysCount,
        params.reason,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vacationRequestKeys.all(userId) }),
  });

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VacationRequestStatus }) =>
      vacationRequestService.updateStatus(id, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vacationRequestKeys.all(userId) }),
  });

  return { requests, loading: isLoading, createRequest, updateStatus };
}
