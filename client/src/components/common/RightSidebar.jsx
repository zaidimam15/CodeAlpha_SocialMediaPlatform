import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, UserPlus, Check } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Avatar } from './Avatar.jsx';

export function RightSidebar() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [followedMap, setFollowedMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSidebarData() {
      try {
        const [usersRes, trendingRes] = await Promise.all([
          api.users.getSuggested(),
          api.search.trending(),
        ]);

        if (usersRes.success) {
          setSuggestedUsers(usersRes.users || []);
        }
        if (trendingRes.success) {
          setTrendingTags(trendingRes.hashtags || []);
        }
      } catch (err) {
        // Ignore errors
      } finally {
        setIsLoading(false);
      }
    }

    loadSidebarData();
  }, [isAuthenticated]);

  const handleFollowToggle = async (userId, username) => {
    if (!isAuthenticated) {
      showToast('Please log in to follow creators.', 'info');
      return;
    }

    try {
      const data = await api.users.toggleFollow(userId);
      if (data.success) {
        setFollowedMap((prev) => ({
          ...prev,
          [userId]: data.isFollowing,
        }));
        showToast(
          data.isFollowing ? `Followed @${username}` : `Unfollowed @${username}`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 shrink-0 sticky top-20 h-[calc(100vh-5rem)] space-y-5 overflow-y-auto pb-6">
      {/* Suggested Creators */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Suggested Creators
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-24 h-3 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="w-16 h-2 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestedUsers.length === 0 ? (
          <p className="text-xs text-gray-400">No suggestions right now.</p>
        ) : (
          <div className="space-y-3">
            {suggestedUsers.slice(0, 4).map((u) => {
              const isFollowed = followedMap[u._id];

              return (
                <div key={u._id} className="flex items-center justify-between gap-3">
                  <Link
                    to={`/profile/${u.username}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <Avatar
                      src={u.avatar}
                      alt={u.displayName}
                      size="sm"
                      isVerified={u.isVerified}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-violet-500 transition-colors">
                        {u.displayName}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">@{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(u._id, u.username)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                      isFollowed
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-rose-500/10 hover:text-rose-500'
                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-500/20'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trending Topics */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Trending For You
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-full h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : trendingTags.length === 0 ? (
          <p className="text-xs text-gray-400">No trending topics yet.</p>
        ) : (
          <div className="space-y-2">
            {trendingTags.map((item) => (
              <Link
                key={item.tag}
                to={`/search?q=%23${item.tag}`}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-violet-500/10 transition-colors group"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-violet-500 transition-colors">
                    #{item.tag}
                  </p>
                  <p className="text-[11px] text-gray-500">{item.count} {item.count === 1 ? 'post' : 'posts'}</p>
                </div>
                <span className="text-xs text-violet-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mini Footer */}
      <div className="px-2 text-[11px] text-gray-400 dark:text-gray-500 space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link to="/explore" className="hover:underline">Explore</Link>
          <span>•</span>
          <Link to="/settings" className="hover:underline">Privacy</Link>
          <span>•</span>
          <a href="#terms" className="hover:underline">Terms</a>
          <span>•</span>
          <span>Connectify v1.0</span>
        </div>
        <p>© 2026 Connectify Inc. All rights reserved.</p>
      </div>
    </aside>
  );
}
