// src/screens/feed/useFeed.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchReels, fetchFollowingReels } from '../../services/reelService';
import type { FetchReelsResponse } from '../../types/reel.types';

type FeedTab = 'foryou' | 'following';

export const useFeed = (tab: FeedTab) => {
  return useInfiniteQuery<FetchReelsResponse>({
    queryKey: ['feed', tab],
    queryFn: ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return tab === 'following'
        ? fetchFollowingReels(page, 5)
        : fetchReels(page, 5);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
};
