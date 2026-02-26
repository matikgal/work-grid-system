import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { Session } from '@supabase/supabase-js';

export const employeeKeys = {
  all: (userId: string) => ['employees', userId] as const,
};

export function useEmployees(session: Session) {
  const queryClient = useQueryClient();
  const userId = session.user.id;

  const { data: employees = [], isLoading: loading, error } = useQuery({
    queryKey: employeeKeys.all(userId),
    queryFn: () => employeeService.getAll(userId),
  });

  const { mutateAsync: addEmployeeMutate } = useMutation({
    mutationFn: (data: { name: string, role: string, avatarColor?: string, isSeparator?: boolean, rowColor?: string, isVisibleInSchedule?: boolean, isVisibleInVacations?: boolean }) => 
        employeeService.create({ ...data, userId }),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all(userId) });
    }
  });

  const { mutateAsync: updateEmployeeMutate } = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Employee> }) => 
        employeeService.update(id, updates),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all(userId) });
    }
  });

  const { mutateAsync: deleteEmployee } = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all(userId) });
    }
  });

  const { mutateAsync: reorderEmployees } = useMutation({
    mutationFn: (newOrder: Employee[]) => employeeService.updateOrder(newOrder, userId),
    onMutate: async (newOrder) => {
        await queryClient.cancelQueries({ queryKey: employeeKeys.all(userId) });
        const previousEmployees = queryClient.getQueryData<Employee[]>(employeeKeys.all(userId));
        queryClient.setQueryData(employeeKeys.all(userId), newOrder);
        return { previousEmployees };
    },
    onError: (err, newOrder, context) => {
        if (context?.previousEmployees) {
            queryClient.setQueryData(employeeKeys.all(userId), context.previousEmployees);
        }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.all(userId) });
    }
  });

  const addEmployee = (name: string, role: string, avatarColor?: string, isSeparator = false, rowColor?: string, isVisibleInSchedule = true, isVisibleInVacations = true) => {
      return addEmployeeMutate({ name, role, avatarColor, isSeparator, rowColor, isVisibleInSchedule, isVisibleInVacations });
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
      return updateEmployeeMutate({ id, updates });
  };

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    reorderEmployees,
    refreshEmployees: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all(userId) })
  };
}
