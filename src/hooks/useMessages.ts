import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, Message } from '../services/messageService';

export const messageKeys = {
  all: () => ['messages'] as const,
  channel: (channel: string) => [...messageKeys.all(), channel] as const,
};

export function useMessages(channel: string) {
  const queryClient = useQueryClient();
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  const { data: initial = [], isLoading } = useQuery({
    queryKey: messageKeys.channel(channel),
    queryFn: () => messageService.getRecent(channel),
  });

  useEffect(() => {
    setLiveMessages(initial);
  }, [initial]);

  useEffect(() => {
    const sub = messageService.subscribe(channel, (msg) => {
      setLiveMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      sub.unsubscribe();
    };
  }, [channel]);

  const { mutateAsync: sendMessage } = useMutation({
    mutationFn: ({
      senderId,
      senderName,
      content,
      storeId,
    }: {
      senderId: string;
      senderName: string;
      content: string;
      storeId?: string;
    }) => messageService.send(senderId, senderName, content, channel, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.channel(channel) });
    },
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: messageKeys.channel(channel) });
  }, [channel, queryClient]);

  return { messages: liveMessages, loading: isLoading, sendMessage, refresh };
}
