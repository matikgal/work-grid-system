import { supabase } from '../lib/supabase';
import { Shift } from '../types';

export const shiftService = {
  /**
   * Fetches shifts for specific employees within a date range.
   * @param employeeIds List of employee IDs to fetch shifts for
   * @param startDate ISO date string (YYYY-MM-DD)
   * @param endDate ISO date string (YYYY-MM-DD)
   */
  async getShifts(employeeIds: string[], startDate: string, endDate: string) {
    if (employeeIds.length === 0) return [];

    const { data, error } = await supabase
      .from('shifts')
      .select('id, employee_id, date, start_time, end_time, duration, type')
      .in('employee_id', employeeIds)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      employeeId: s.employee_id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      duration: s.duration,
      type: s.type
    } as Shift));
  },

  async upsert(shift: Omit<Shift, 'id'> & { id?: string }) {
    const dbShift = {
      employee_id: shift.employeeId,
      date: shift.date,
      start_time: shift.startTime,
      end_time: shift.endTime,
      duration: shift.duration,
      type: shift.type
    };

    let query;
    if (shift.id) {
        query = supabase.from('shifts').update(dbShift).eq('id', shift.id).select().single();
    } else {
        query = supabase.from('shifts').insert(dbShift).select().single();
    }

    const { data, error } = await query;
    if (error) throw error;

    return {
      id: data.id,
      employeeId: data.employee_id,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      type: data.type
    } as Shift;
  },

  async delete(id: string) {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) throw error;
  }
};
