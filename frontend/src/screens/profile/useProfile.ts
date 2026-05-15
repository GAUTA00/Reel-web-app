// src/screens/profile/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  getMyProfile,
  getUserProfile,
  followUser,
  unfollowUser,
  updateProfile,
} from '../../services/userService';
import { fetchMyReels, fetchUserReels, fetchLikedReels, deleteReel } from '../../services/reelService';

export const useProfile = (userId?: string) => {
  const queryClient = useQueryClient();
  const isOwnProfile = !userId;

  // Fetch profile
  const profileQuery = useQuery({
    queryKey: ['profile', userId ?? 'me'],
    queryFn: () => (isOwnProfile ? getMyProfile() : getUserProfile(userId!)),
    staleTime: 1000 * 60,
  });

  // Fetch reels
  const reelsQuery = useQuery({
    queryKey: ['profile-reels', userId ?? 'me'],
    queryFn: () => (isOwnProfile ? fetchMyReels() : fetchUserReels(userId!)),
    staleTime: 1000 * 60,
  });

  // Fetch liked reels (only own profile)
  const likedReelsQuery = useQuery({
    queryKey: ['liked-reels'],
    queryFn: fetchLikedReels,
    enabled: isOwnProfile,
    staleTime: 1000 * 60,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: () => followUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(['profile', 'me'], user);
      toast.success('Profile updated');
    },
    onError: (err: Error) => toast.error(err.message || 'Update failed'),
  });

  // Delete reel mutation
  const deleteReelMutation = useMutation({
    mutationFn: (reelId: string) => deleteReel(reelId),
    onSuccess: (_, reelId) => {
      queryClient.setQueryData(
        ['profile-reels', 'me'],
        (old: { _id: string }[] | undefined) =>
          old ? old.filter((r) => r._id !== reelId) : []
      );
      toast.success('Reel deleted');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete reel'),
  });

  return {
    profileQuery,
    reelsQuery,
    likedReelsQuery,
    followMutation,
    unfollowMutation,
    updateProfileMutation,
    deleteReelMutation,
  };
};
