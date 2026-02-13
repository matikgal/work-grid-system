import { supabase } from '../lib/supabase';

export interface VacationBalance {
  id: string;
  employeeId: string;
  userId: string;
  year: number;
  days: number;
  isHighlighted: boolean;
  manualDays: number[];
}

export const vacationService = {
  async getBalances(employeeIds: string[], year: number, userId: string) {
    if (employeeIds.length === 0) return [];
    
    // Attempt to fetch from the new table
    const { data, error } = await supabase
      .from('vacation_balances')
      .select('id, employee_id, user_id, year, days, is_highlighted, manual_days')
      .eq('user_id', userId)
      .eq('year', year)
      .in('employee_id', employeeIds);
      
      if (error) {
        console.warn('Error fetching vacation balances (table exists?):', error);
        return [];
      }
      
      return (data || []).map(b => ({
          id: b.id,
          employeeId: b.employee_id,
          userId: b.user_id,
          year: b.year,
          days: b.days,
          isHighlighted: b.is_highlighted || false,
          manualDays: b.manual_days || Array(12).fill(0)
      } as VacationBalance));
  },

  async upsertBalance(employeeId: string, userId: string, year: number, updates: { days?: number, isHighlighted?: boolean, manualDays?: number[] }) {
      const payload: any = {
          employee_id: employeeId,
          user_id: userId,
          year: year
      };
      
      if (updates.days !== undefined) payload.days = updates.days;
      if (updates.isHighlighted !== undefined) payload.is_highlighted = updates.isHighlighted;
      if (updates.manualDays !== undefined) payload.manual_days = updates.manualDays;
      
      const { data, error } = await supabase
        .from('vacation_balances')
        .upsert(payload, { onConflict: 'employee_id, year' })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
          id: data.id,
          employeeId: data.employee_id,
          userId: data.user_id,
          year: data.year,
          days: data.days,
          isHighlighted: data.is_highlighted,
          manualDays: data.manual_days || Array(12).fill(0)
      } as VacationBalance;
  }
};
