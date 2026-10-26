import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Users, RefreshCw } from 'lucide-react';
import { CreatePostCard } from '../components/posts/CreatePostCard.jsx';
import { PostCard } from '../components/posts/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function FeedPage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('for_you'); // 'for_you' | 'following'
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setIsLoading(true);
        } else if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoadingMore(true);
        }

        let data;
        if (activeTab === 'following' && isAuthenticated) {
          data = await api.posts.getFeed(pageNum, 10);
        } else {
          data = await api.posts.getExplore(pageNum, 10);
        }

        if (data.success) {
          if (pageNum === 1) {
            setPosts(data.posts || []);
          } else {
            setPosts((prev) => [...prev, ...(data.posts || [])]);
          }
          setHasMore(data.hasMore || false);
          setPage(pageNum);
        }
      } catch (err) {
        showToast('Could not load feed posts', 'error');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab, isAuthenticated, showToast]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Listen for custom post created event
  useEffect(() => {
    const handleCustomPostCreated = () => {
      fetchPosts(1, true);
    };
    window.addEventListener('connectify_post_created', handleCustomPostCreated);
    return () => window.removeEventListener('connectify_post_created', handleCustomPostCreated);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  return (
    <div className="space-y-5">
      {/* Feed Tabs & Refresh */}
      <div className="glass-card p-1.5 flex items-center justify-between sticky top-[68px] z-30 shadow-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('for_you')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'for_you'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>For You</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'following'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following</span>
            </button>
          )}
        </div>

        <button
          onClick={() => fetchPosts(1, true)}
          disabled={isRefreshing}
          aria-label="Refresh Feed"
          className="p-2 rounded-xl text-gray-400 hover:text-violet-500 hover:bg-violet-500/10 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-violet-500' : ''}`} />
        </button>
      </div>

      {/* Inline Post Creator */}
      {isAuthenticated && <CreatePostCard onPostCreated={handlePostCreated} />}

      {/* Feed Content */}
      {isLoading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-violet-500/10 text-violet-500 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {activeTab === 'following' ? 'No posts from followed creators yet' : 'Your feed is quiet'}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {activeTab === 'following'
                ? 'Follow more interesting creators from the Explore tab to see their thoughts here.'
                : 'Be the first to share an idea, artwork, or photo with the community!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchPosts(page + 1)}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-full glass-card hover:border-violet-500 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-violet-500 transition-colors shadow-sm"
              >
                {isLoadingMore ? 'Loading more posts...' : 'Load More Posts ↓'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
