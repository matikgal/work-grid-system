import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  channel: string;
  storeId: string | null;
  createdAt: string;
}

export const messageService = {
  async getRecent(channel: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel', channel)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || [])
      .map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender_name,
        content: m.content,
        channel: m.channel,
        storeId: m.store_id,
        createdAt: m.created_at,
      }))
      .reverse() as Message[];
  },

  async send(senderId: string, senderName: string, content: string, channel: string, storeId?: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        sender_name: senderName,
        content,
        channel,
        store_id: storeId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      senderId: data.sender_id,
      senderName: data.sender_name,
      content: data.content,
      channel: data.channel,
      storeId: data.store_id,
      createdAt: data.created_at,
    } as Message;
  },

  subscribe(channel: string, onMessage: (msg: Message) => void) {
    return supabase
      .channel(`messages:${channel}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel=eq.${channel}` },
        (payload) => {
          const m = payload.new as Record<string, string | null>;
          onMessage({
            id: m.id as string,
            senderId: m.sender_id as string,
            senderName: m.sender_name as string,
            content: m.content as string,
            channel: m.channel as string,
            storeId: m.store_id,
            createdAt: m.created_at as string,
          });
        },
      )
      .subscribe();
  },
};
