import { supabase } from '../lib/supabase';

export interface VacationBalance {
  id: string;
  employeeId: string;
  userId: string;
  year: number;
  days: number;
}

export const vacationService = {
  async getBalances(employeeIds: string[], year: number, userId: string) {
    if (employeeIds.length === 0) return [];
    
    // Attempt to fetch from the new table
    // Note: User must create this table manually if not using automated migrations
    const { data, error } = await supabase
      .from('vacation_balances')
      .select('id, employee_id, user_id, year, days')
      .eq('user_id', userId)
      .eq('year', year)
      .in('employee_id', employeeIds);
      
      if (error) {
        // If table doesn't exist, we might get an error.
        // We log it but return empty to not crash app.
        console.warn('Error fetching vacation balances (table exists?):', error);
        return [];
      }
      
      return (data || []).map(b => ({
          id: b.id,
          employeeId: b.employee_id,
          userId: b.user_id,
          year: b.year,
          days: b.days
      } as VacationBalance));
  },

  async upsertBalance(employeeId: string, userId: string, year: number, days: number) {
      const { data, error } = await supabase
        .from('vacation_balances')
        .upsert({
            employee_id: employeeId,
            user_id: userId,
            year: year,
            days: days
        }, { onConflict: 'employee_id, year' })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
          id: data.id,
          employeeId: data.employee_id,
          userId: data.user_id,
          year: data.year,
          days: data.days
      } as VacationBalance;
  }
};
