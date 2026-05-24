// src/screens/search/useSearch.ts
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../../services/userService';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Proper debounce — cancels previous timer before setting a new one
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  };

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 30,
  });

  return { query, handleQueryChange, searchQuery, debouncedQuery };
};
