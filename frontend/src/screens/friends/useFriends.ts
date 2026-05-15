// src/screens/friends/useFriends.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { getMyProfile, unfollowUser } from '../../services/userService';
import type { UserSummary } from '../../types/user.types';

export const useFriends = () => {
  const queryClient = useQueryClient();

  const friendsQuery = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const profile = await getMyProfile();
      return profile.following as UserSummary[];
    },
    staleTime: 1000 * 60,
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['friends'] });
      const previous = queryClient.getQueryData<UserSummary[]>(['friends']);
      queryClient.setQueryData<UserSummary[]>(['friends'], (old) =>
        old ? old.filter((u) => u._id !== userId) : []
      );
      return { previous };
    },
    onSuccess: () => toast.success('Unfollowed user.'),
    onError: (err: Error, _userId, context) => {
      if (context?.previous) queryClient.setQueryData(['friends'], context.previous);
      toast.error(err.message || 'Failed to unfollow.');
    },
  });

  return { friendsQuery, unfollowMutation };
};
