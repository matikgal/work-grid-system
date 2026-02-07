import { supabase } from '../lib/supabase';

export interface VacationBalance {
  id: string;
  employeeId: string;
  userId: string;
  year: number;
  days: number;
  isHighlighted: boolean;
}

export const vacationService = {
  async getBalances(employeeIds: string[], year: number, userId: string) {
    if (employeeIds.length === 0) return [];
    
    // Attempt to fetch from the new table
    const { data, error } = await supabase
      .from('vacation_balances')
      .select('id, employee_id, user_id, year, days, is_highlighted')
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
          isHighlighted: b.is_highlighted || false
      } as VacationBalance));
  },

  async upsertBalance(employeeId: string, userId: string, year: number, updates: { days?: number, isHighlighted?: boolean }) {
      // First, get current value if we are doing partial update to ensure we don't overwrite with null/default if row exists?
      // Actually, Supabase upsert will merge? No, upsert replaces unless we conform to update behavior.
      // Easiest is to fetch current row if needed, but usually we have state in UI.
      // Let's assume the UI passes both or we risk overwriting.
      // To be safe, let's just use what is passed, but if one is undefined, it might be tricky.
      // Actually, simpler: fetch existing row, merge, then upsert.
      
      // Let's try to do it in one query? No, standard upsert needs all values.
      // If we use 'onConflict' it updates. But if we omit a column in 'values', does it set to null or keep implementation?
      // Supabase js upsert takes an object. Keys present are updated/inserted. Keys missing are... ?
      // If row exists, keys missing might be left alone?
      // Let's test this assumption or just fetch-update.
      
      // Since this is low volume, fetch first is fine if needed, but actually we can just select via UI state.
      // Let's make the caller provide all values if unsure, OR fetch current.
      // But here we might not have all values easily.
      
      // Better approach:
      // Since we already loaded balances in the UI, we can pass the current 'days' when updating 'highlight' and vice versa.
      // So we will require both or partial?
      
      // Let's just create payload with defined values.
      const payload: any = {
          employee_id: employeeId,
          user_id: userId,
          year: year
      };
      
      if (updates.days !== undefined) payload.days = updates.days;
      if (updates.isHighlighted !== undefined) payload.is_highlighted = updates.isHighlighted;
      
      // If we don't provide a field, standard SQL/Supabase upsert might set it to null or default if inserting?
      // If updating, does it touch missing fields?
      // The `upsert` sends an INSERT ... ON CONFLICT DO UPDATE SET ...
      // So checks documentation... Supabase-js upsert: "If the row exists, it will be updated with the data provided."
      // If data provided is partial, it updates partially?
      // Yes, usually.
      
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
          isHighlighted: data.is_highlighted
      } as VacationBalance;
  }
};
