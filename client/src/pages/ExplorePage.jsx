import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, TrendingUp, Users } from 'lucide-react';
import { PostCard } from '../components/posts/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeleton.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { api } from '../services/api.js';

export function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [popularCreators, setPopularCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExploreData() {
      try {
        const [postsRes, tagsRes, creatorsRes] = await Promise.all([
          api.posts.getExplore(1, 15),
          api.search.trending(),
          api.users.getSuggested(),
        ]);

        if (postsRes.success) setPosts(postsRes.posts || []);
        if (tagsRes.success) setTrendingTags(tagsRes.hashtags || []);
        if (creatorsRes.success) setPopularCreators(creatorsRes.users || []);
      } catch (err) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    }

    loadExploreData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-pink-500/15 border border-violet-500/20 space-y-2">
        <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Discover Connectify</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
          Explore Trending Ideas & Creators
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-lg">
          Dive into popular discussions, trending tags, and top community contributors across the network.
        </p>
      </div>

      {/* Trending Hashtags Bar */}
      {trendingTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
            <span>Popular Tags</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {trendingTags.map((item) => (
              <Link
                key={item.tag}
                to={`/search?q=%23${item.tag}`}
                className="px-3.5 py-1.5 rounded-full glass-card hover:border-violet-500 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-500 transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>#{item.tag}</span>
                <span className="text-[10px] text-gray-400">({item.count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Creators Carousel */}
      {popularCreators.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            <Users className="w-3.5 h-3.5 text-violet-500" />
            <span>Notable Creators</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularCreators.slice(0, 3).map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u.username}`}
                className="glass-card p-3 rounded-2xl flex items-center gap-3 glass-card-hover group"
              >
                <Avatar src={u.avatar} alt={u.displayName} size="md" isVerified={u.isVerified} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-violet-500 transition-colors">
                    {u.displayName}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">@{u.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">
          Trending Posts
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              onPostUpdated={(up) =>
                setPosts((prev) => prev.map((p) => (p._id === up._id ? up : p)))
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
