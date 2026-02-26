import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '../services/configService';
import { Session } from '@supabase/supabase-js';

export const configKeys = {
  all: () => ['monthlyConfigs'] as const,
};

export function useMonthlyConfigs(session: Session | null) {
  const queryClient = useQueryClient();

  const { data: manualWorkingDays = {}, isLoading: loading } = useQuery({
    queryKey: configKeys.all(),
    queryFn: async () => {
      const data = await configService.fetchMonthlyConfigs();
      const newConfigs: Record<string, number> = {};
      data.forEach((item: any) => {
        newConfigs[item.month_key] = item.working_days;
      });
      return newConfigs;
    },
    enabled: !!session?.user,
  });

  const { mutateAsync: saveConfigMutate } = useMutation({
    mutationFn: async ({ monthKey, val }: { monthKey: string; val: number }) => {
      if (!session?.user) throw new Error("No user session");
      await configService.updateMonthlyConfig(monthKey, val, session.user.id);
      return { monthKey, val };
    },
    onMutate: async ({ monthKey, val }) => {
      await queryClient.cancelQueries({ queryKey: configKeys.all() });
      const previousConfigs = queryClient.getQueryData<Record<string, number>>(configKeys.all());
      if (previousConfigs) {
        queryClient.setQueryData<Record<string, number>>(configKeys.all(), {
          ...previousConfigs,
          [monthKey]: val,
        });
      }
      return { previousConfigs };
    },
    onError: (err, variables, context) => {
      if (context?.previousConfigs) {
        queryClient.setQueryData(configKeys.all(), context.previousConfigs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all() });
    },
  });

  const saveConfig = (monthKey: string, val: number) => {
    return saveConfigMutate({ monthKey, val });
  };

  return { manualWorkingDays, saveConfig, loading };
}
