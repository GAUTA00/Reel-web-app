// src/screens/notifications/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../../services/notificationService';
import type { Notification } from '../../types/notification.types';

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1000 * 30,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old ? old.map((n) => (n._id === id ? { ...n, read: true } : n)) : []
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old ? old.map((n) => ({ ...n, read: true })) : []
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
  });

  return { notificationsQuery, markReadMutation, markAllReadMutation };
};
