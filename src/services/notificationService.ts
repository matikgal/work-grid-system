import { supabase } from '../lib/supabase';

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

export const notificationService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.is_read,
      link: n.link,
      createdAt: n.created_at,
    })) as AppNotification[];
  },

  async markRead(id: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async create(userId: string, title: string, body?: string, type = 'info', link?: string) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, title, body, type, link })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
