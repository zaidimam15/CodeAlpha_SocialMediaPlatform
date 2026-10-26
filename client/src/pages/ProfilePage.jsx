import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Edit3,
  UserPlus,
  Check,
  Grid,
  Image as ImageIcon,
} from 'lucide-react';
import { Avatar } from '../components/common/Avatar.jsx';
import { PostCard } from '../components/posts/PostCard.jsx';
import { ProfileSkeleton, PostSkeleton } from '../components/common/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'media'
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    async function loadUserProfile() {
      setIsLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.users.getProfile(username),
          api.posts.getUserPosts(username),
        ]);

        if (profileRes.success) {
          setProfile(profileRes.profile);
          setIsFollowing(profileRes.profile.isFollowing);
          setFollowersCount(profileRes.profile.followersCount || 0);
        }
        if (postsRes.success) {
          setPosts(postsRes.posts || []);
        }
      } catch (err) {
        showToast(err.message || 'Failed to load profile', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    if (username) {
      loadUserProfile();
    }
  }, [username, showToast]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to follow creators.', 'info');
      return;
    }

    try {
      const data = await api.users.toggleFollow(profile._id);
      if (data.success) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        showToast(
          data.isFollowing ? `Now following @${profile.username}` : `Unfollowed @${profile.username}`,
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Follow action failed', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <ProfileSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">User Not Found</h2>
        <p className="text-sm text-gray-500">The user @{username} does not exist on Connectify.</p>
        <Link to="/" className="inline-block gradient-brand-btn px-6 py-2 rounded-xl text-sm font-bold">
          Return to Feed
        </Link>
      </div>
    );
  }

  const isSelf = currentUser && currentUser.username === profile.username;
  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  return (
    <div className="space-y-5">
      {/* Profile Card Header */}
      <div className="glass-card overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-44 sm:h-52 w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 relative">
          {profile.coverImage && (
            <img
              src={profile.coverImage}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Content */}
        <div className="p-4 sm:p-6 pt-0 space-y-4">
          {/* Top row with Avatar and Action Button */}
          <div className="flex items-end justify-between -mt-14 sm:-mt-16">
            <Avatar
              src={profile.avatar}
              alt={profile.displayName}
              size="xl"
              isVerified={profile.isVerified}
              className="ring-4 ring-white dark:ring-dark-card shadow-lg"
            />

            <div>
              {isSelf ? (
                <Link
                  to="/settings/profile"
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/[0.12] hover:bg-gray-100 dark:hover:bg-dark-hover text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-violet-500" />
                  <span>Edit Profile</span>
                </Link>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                    isFollowing
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-rose-500/10 hover:text-rose-500'
                      : 'gradient-brand-btn shadow-violet-500/20'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Bio and Identifiers */}
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
              {profile.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">@{profile.username}</p>

            {profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 pt-1 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pt-1">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-violet-500" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-violet-500 hover:underline"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Joined{' '}
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Statistics Bar */}
          <div className="flex items-center gap-6 pt-3 border-t border-gray-100 dark:border-white/[0.08] text-sm">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-gray-900 dark:text-gray-100">
                {posts.length}
              </span>
              <span className="text-gray-500 text-xs">Posts</span>
            </div>

            <Link
              to={`/profile/${profile.username}/followers`}
              className="flex items-center gap-1 hover:underline"
            >
              <span className="font-extrabold text-gray-900 dark:text-gray-100">
                {followersCount}
              </span>
              <span className="text-gray-500 text-xs">Followers</span>
            </Link>

            <Link
              to={`/profile/${profile.username}/following`}
              className="flex items-center gap-1 hover:underline"
            >
              <span className="font-extrabold text-gray-900 dark:text-gray-100">
                {profile.followingCount || 0}
              </span>
              <span className="text-gray-500 text-xs">Following</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1.5 flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'media'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Media ({mediaPosts.length})</span>
        </button>
      </div>

      {/* Posts Feed for User */}
      <div className="space-y-4">
        {activeTab === 'posts' ? (
          posts.length === 0 ? (
            <div className="glass-card p-12 text-center text-sm text-gray-400">
              @{profile.username} hasn't posted anything yet.
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
          )
        ) : mediaPosts.length === 0 ? (
          <div className="glass-card p-12 text-center text-sm text-gray-400">
            No media attachments posted yet.
          </div>
        ) : (
          mediaPosts.map((post) => (
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
