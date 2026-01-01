import { supabase } from '../lib/supabase';

export interface WsAdjustment {
  id: string;
  employeeId: string;
  userId: string;
  year: number;
  adjustment: number;
}

export const adjustmentService = {
  async getAdjustments(employeeIds: string[], year: number, userId: string) {
    if (employeeIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('ws_adjustments')
      .select('id, employee_id, user_id, year, adjustment')
      .eq('user_id', userId)
      .eq('year', year)
      .in('employee_id', employeeIds);
      
      if (error) throw error;
      
      return (data || []).map(a => ({
          id: a.id,
          employeeId: a.employee_id,
          userId: a.user_id,
          year: a.year,
          adjustment: a.adjustment
      } as WsAdjustment));
  },

  async upsertAdjustment(employeeId: string, userId: string, year: number, adjustment: number) {
      const { data, error } = await supabase
        .from('ws_adjustments')
        .upsert({
            employee_id: employeeId,
            user_id: userId,
            year: year,
            adjustment: adjustment
        }, { onConflict: 'employee_id, year' })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
          id: data.id,
          employeeId: data.employee_id,
          userId: data.user_id,
          year: data.year,
          adjustment: data.adjustment
      } as WsAdjustment;
  }
};
