import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { PostCard } from '../components/posts/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeleton.jsx';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function BookmarksPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadBookmarks() {
      setIsLoading(true);
      try {
        const data = await api.bookmarks.getAll(1);
        if (data.success) {
          setPosts(data.posts || []);
        }
      } catch (err) {
        showToast('Failed to load saved posts', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadBookmarks();
  }, [showToast]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500">
          <Bookmark className="w-5 h-5 fill-violet-500/30 text-violet-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Saved Posts</h1>
          <p className="text-xs text-gray-500">Your private collection of bookmarked posts</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-500 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            No saved posts yet
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Click the bookmark icon on any post in your feed to save it for later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              onPostUpdated={(up) =>
                setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
