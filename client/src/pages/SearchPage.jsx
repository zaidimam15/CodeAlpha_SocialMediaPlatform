import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Users, FileText, Sparkles } from 'lucide-react';
import { PostCard } from '../components/posts/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeleton.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { api } from '../services/api.js';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputText, setInputText] = useState(query);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'users' | 'posts'
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInputText(query);
    if (!query.trim()) {
      setResults({ users: [], posts: [] });
      return;
    }

    async function executeSearch() {
      setIsLoading(true);
      try {
        const data = await api.search.query(query, 'all');
        if (data.success) {
          setResults({ users: data.users || [], posts: data.posts || [] });
        }
      } catch (err) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    }

    executeSearch();
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      setSearchParams({ q: inputText.trim() });
    }
  };

  const usersCount = results.users.length;
  const postsCount = results.posts.length;

  return (
    <div className="space-y-5">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-card p-3 shadow-sm flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators, hashtags, or topics..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-transparent text-sm focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="gradient-brand-btn px-5 py-2 rounded-xl text-xs font-bold shrink-0"
        >
          Search
        </button>
      </form>

      {/* Filter Tabs */}
      <div className="glass-card p-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>All Results</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Creators ({usersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts ({postsCount})</span>
        </button>
      </div>

      {/* Results Content */}
      {isLoading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : !query ? (
        <div className="glass-card p-12 text-center text-sm text-gray-400">
          Enter a search query to find people and posts.
        </div>
      ) : usersCount === 0 && postsCount === 0 ? (
        <div className="glass-card p-12 text-center space-y-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            No results found for "{query}"
          </h3>
          <p className="text-xs text-gray-500">
            Try checking for typos or searching for a different keyword or hashtag.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Creators Section */}
          {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                Creators ({usersCount})
              </h2>
              <div className="space-y-2">
                {results.users.map((user) => (
                  <Link
                    key={user._id}
                    to={`/profile/${user.username}`}
                    className="glass-card p-3 rounded-2xl flex items-center justify-between gap-3 glass-card-hover group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={user.avatar}
                        alt={user.displayName}
                        size="md"
                        isVerified={user.isVerified}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-violet-500 transition-colors truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                        {user.bio && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-violet-500 shrink-0">View Profile →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                Posts ({postsCount})
              </h2>
              <div className="space-y-4">
                {results.posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={(id) =>
                      setResults((prev) => ({
                        ...prev,
                        posts: prev.posts.filter((p) => p._id !== id),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
