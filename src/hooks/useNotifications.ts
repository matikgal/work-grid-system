import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const notificationKeys = {
  all: (userId: string) => ['notifications', userId] as const,
};

export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: notificationKeys.all(userId),
    queryFn: () => notificationService.getAll(userId),
    enabled: !!userId,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const { mutateAsync: markRead } = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all(userId) }),
  });

  const { mutateAsync: markAllRead } = useMutation({
    mutationFn: () => notificationService.markAllRead(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all(userId) }),
  });

  return { notifications, unreadCount, loading: isLoading, markRead, markAllRead };
}
