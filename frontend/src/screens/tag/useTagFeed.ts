// src/screens/tag/useTagFeed.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchReelsByTag } from '../../services/reelService';
import type { FetchReelsResponse } from '../../types/reel.types';

export const useTagFeed = (tag: string) => {
  return useInfiniteQuery<FetchReelsResponse>({
    queryKey: ['tag-feed', tag],
    queryFn: ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return fetchReelsByTag(tag, page, 5);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!tag,
    staleTime: 1000 * 30,
  });
};
