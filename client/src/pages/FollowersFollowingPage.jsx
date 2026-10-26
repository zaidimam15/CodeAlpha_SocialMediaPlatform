import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Check } from 'lucide-react';
import { Avatar } from '../components/common/Avatar.jsx';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function FollowersFollowingPage() {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const isFollowersTab = location.pathname.includes('/followers');
  const [activeTab, setActiveTab] = useState(isFollowersTab ? 'followers' : 'following');
  const [userProfile, setUserProfile] = useState(null);
  const [userList, setUserList] = useState([]);
  const [followedMap, setFollowedMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load target user profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.users.getProfile(username);
        if (data.success) {
          setUserProfile(data.profile);
        }
      } catch (err) {
        showToast('User not found', 'error');
      }
    }
    if (username) {
      loadProfile();
    }
  }, [username, showToast]);

  // Load followers / following list
  useEffect(() => {
    async function loadList() {
      if (!userProfile) return;
      setIsLoading(true);

      try {
        let res;
        if (activeTab === 'followers') {
          res = await api.users.getFollowers(userProfile._id);
        } else {
          res = await api.users.getFollowing(userProfile._id);
        }

        if (res.success) {
          setUserList(res.users || []);
        }
      } catch (err) {
        showToast('Failed to load user list', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadList();
  }, [activeTab, userProfile, showToast]);

  const handleFollowToggle = async (targetId, targetUsername) => {
    if (!isAuthenticated) {
      showToast('Please log in to follow creators.', 'info');
      return;
    }

    try {
      const data = await api.users.toggleFollow(targetId);
      if (data.success) {
        setFollowedMap((prev) => ({ ...prev, [targetId]: data.isFollowing }));
        showToast(
          data.isFollowing ? `Now following @${targetUsername}` : `Unfollowed @${targetUsername}`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
        <button
          onClick={() => navigate(`/profile/${username}`)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {userProfile?.displayName || username}
          </h1>
          <p className="text-xs text-gray-500">@{username}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab('followers');
            navigate(`/profile/${username}/followers`, { replace: true });
          }}
          className={`flex-1 py-2 text-center rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'followers'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Followers ({userProfile?.followersCount || 0})
        </button>

        <button
          onClick={() => {
            setActiveTab('following');
            navigate(`/profile/${username}/following`, { replace: true });
          }}
          className={`flex-1 py-2 text-center rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'following'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Following ({userProfile?.followingCount || 0})
        </button>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-1.5">
                <div className="w-32 h-3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="w-20 h-2.5 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : userList.length === 0 ? (
        <div className="glass-card p-12 text-center text-sm text-gray-400">
          {activeTab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {userList.map((item) => {
            const isSelf = currentUser && currentUser._id === item._id;
            const isFollowed = followedMap[item._id];

            return (
              <div
                key={item._id}
                className="glass-card p-4 flex items-center justify-between gap-3"
              >
                <Link
                  to={`/profile/${item.username}`}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <Avatar
                    src={item.avatar}
                    alt={item.displayName}
                    size="md"
                    isVerified={item.isVerified}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-violet-500 transition-colors truncate">
                      {item.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{item.username}</p>
                    {item.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {item.bio}
                      </p>
                    )}
                  </div>
                </Link>

                {!isSelf && (
                  <button
                    onClick={() => handleFollowToggle(item._id, item.username)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                      isFollowed
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : 'gradient-brand-btn shadow-violet-500/20'
                    }`}
                  >
                    {isFollowed ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
