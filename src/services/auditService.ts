import { supabase } from '../lib/supabase';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  targetTable: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export const auditService = {
  async log(
    userId: string,
    action: string,
    targetTable?: string,
    targetId?: string,
    details?: Record<string, unknown>,
  ) {
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        target_table: targetTable || null,
        target_id: targetId || null,
        details: details || null,
      });
    } catch {
      // audit nie powinien blokować głównej operacji
    }
  },

  async getRecent(userId: string, limit = 30) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((e) => ({
      id: e.id,
      userId: e.user_id,
      action: e.action,
      targetTable: e.target_table,
      targetId: e.target_id,
      details: e.details,
      createdAt: e.created_at,
    })) as AuditLogEntry[];
  },
};
