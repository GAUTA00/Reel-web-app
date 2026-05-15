// src/screens/search/useSearch.ts
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../../services/userService';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce — update debouncedQuery 500ms after typing stops
  const handleQueryChange = (value: string) => {
    setQuery(value);
    const timer = setTimeout(() => setDebouncedQuery(value), 500);
    return () => clearTimeout(timer);
  };

  const searchQuery = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 30,
  });

  return { query, handleQueryChange, searchQuery, debouncedQuery };
};
