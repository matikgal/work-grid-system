import { useState, useCallback, useEffect } from 'react';
import { configService } from '../services/configService';
import { Session } from '@supabase/supabase-js';

export function useMonthlyConfigs(session: Session | null) {
  const [manualWorkingDays, setManualWorkingDays] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      const data = await configService.fetchMonthlyConfigs();
      const newConfigs: Record<string, number> = {};
      data.forEach((item: any) => {
        newConfigs[item.month_key] = item.working_days;
      });
      setManualWorkingDays(newConfigs);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const saveConfig = async (monthKey: string, val: number) => {
    if (!session?.user) return;
    
    // Optimistic update
    setManualWorkingDays(prev => ({ ...prev, [monthKey]: val }));

    try {
        await configService.updateMonthlyConfig(monthKey, val, session.user.id);
    } catch (error) {
        console.error('Error saving config:', error);
    }
  };

  useEffect(() => {
    if (session) {
        fetchConfigs();
    }
  }, [fetchConfigs, session]);

  return { manualWorkingDays, saveConfig, loading };
}
