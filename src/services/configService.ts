import { supabase } from '../lib/supabase';

export const configService = {
  async fetchMonthlyConfigs() {
    const { data, error } = await supabase
      .from('monthly_configs')
      .select('month_key, working_days');
    
    if (error) throw error;
    return data || [];
  },

  async updateMonthlyConfig(monthKey: string, workingDays: number, userId: string) {
    const { data, error } = await supabase
      .from('monthly_configs')
      .upsert({ 
          month_key: monthKey, 
          working_days: workingDays,
          user_id: userId
      }, { onConflict: 'user_id, month_key' })
      .select();
      
    if (error) throw error;
    return data;
  }
};
