import { supabase } from '../lib/supabase';

export type VacationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface VacationRequest {
  id: string;
  employeeId: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
  daysCount: number;
  reason: string | null;
  status: VacationRequestStatus;
  reviewedAt: string | null;
  createdAt: string;
}

export const vacationRequestService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      userId: r.user_id,
      dateFrom: r.date_from,
      dateTo: r.date_to,
      daysCount: r.days_count,
      reason: r.reason,
      status: r.status as VacationRequestStatus,
      reviewedAt: r.reviewed_at,
      createdAt: r.created_at,
    })) as VacationRequest[];
  },

  async create(
    userId: string,
    employeeId: string,
    dateFrom: string,
    dateTo: string,
    daysCount: number,
    reason?: string,
  ) {
    const { data, error } = await supabase
      .from('vacation_requests')
      .insert({
        user_id: userId,
        employee_id: employeeId,
        date_from: dateFrom,
        date_to: dateTo,
        days_count: daysCount,
        reason: reason || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      employeeId: data.employee_id,
      userId: data.user_id,
      dateFrom: data.date_from,
      dateTo: data.date_to,
      daysCount: data.days_count,
      reason: data.reason,
      status: data.status,
      reviewedAt: data.reviewed_at,
      createdAt: data.created_at,
    } as VacationRequest;
  },

  async updateStatus(id: string, status: VacationRequestStatus) {
    const { data, error } = await supabase
      .from('vacation_requests')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
