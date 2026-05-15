// src/screens/search/SearchPage.tsx
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { useSearch } from './useSearch';
import type { User } from '../../types/user.types';

export default function SearchPage() {
  const navigate = useNavigate();
  const { query, handleQueryChange, searchQuery, debouncedQuery } = useSearch();

  const results = searchQuery.data ?? [];
  const isLoading = searchQuery.isFetching;

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6 bg-black sticky top-0 z-10 py-2">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:border-pink-500 transition"
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
          </div>
        ) : results.length === 0 && debouncedQuery.trim() ? (
          <div className="text-center text-gray-500 py-10">
            No users found for &quot;{debouncedQuery}&quot;
          </div>
        ) : (
          results.map((user: User) => (
            <div
              key={user._id}
              onClick={() => navigate(`/profile/${user._id}`)}
              className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:bg-white/5 transition"
            >
              <img
                src={user.image || 'https://via.placeholder.com/150'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border border-gray-700"
              />
              <div>
                <h3 className="font-bold text-white">{user.name}</h3>
                <p className="text-xs text-gray-400">{user.followers?.length || 0} followers</p>
              </div>
            </div>
          ))
        )}

        {!query && (
          <div className="text-center text-gray-600 mt-20 flex flex-col items-center">
            <Search className="w-12 h-12 opacity-20 mb-4" />
            <p>Search for friends and creators</p>
          </div>
        )}
      </div>
    </div>
  );
}
