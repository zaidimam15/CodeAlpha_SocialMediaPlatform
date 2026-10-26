import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCheck,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '../components/common/Avatar.jsx';
import { formatTimeAgo } from '../utils/formatDate.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function NotificationsPage() {
  const { setUnreadCount } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      setIsLoading(true);
      try {
        const data = await api.notifications.getAll(1);
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        showToast('Failed to load notifications', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, [setUnreadCount, showToast]);

  const handleMarkAllRead = async () => {
    try {
      const data = await api.notifications.markAllRead();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.notifications.markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        // Continue navigation anyway
      }
    }

    if (notif.post) {
      navigate(`/post/${notif.post._id || notif.post}`);
    } else if (notif.sender) {
      navigate(`/profile/${notif.sender.username}`);
    }
  };

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card p-4 sm:p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-xs text-gray-500">Stay up to date with your interactions</p>
          </div>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-violet-500/10 hover:text-violet-500 text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'glass-card text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-violet-600 text-white shadow-sm'
              : 'glass-card text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-card p-4 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-1.5">
                <div className="w-48 h-3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="w-20 h-2.5 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-500 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-gray-400">
            When people like your posts, comment, or follow you, you'll see them right here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => {
            const sender = notif.sender;
            return (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`glass-card p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-violet-500/40 transition-all ${
                  !notif.read ? 'border-l-4 border-l-violet-500 bg-violet-500/[0.03]' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <Avatar
                      src={sender?.avatar}
                      alt={sender?.displayName}
                      size="md"
                      isVerified={sender?.isVerified}
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-dark-card shadow">
                      {notif.type === 'like' && (
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      )}
                      {notif.type === 'comment' && (
                        <MessageCircle className="w-3 h-3 text-violet-500 fill-violet-500" />
                      )}
                      {notif.type === 'follow' && (
                        <UserPlus className="w-3 h-3 text-indigo-500" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-bold text-gray-900 dark:text-gray-100 hover:underline">
                        {sender?.displayName || 'Someone'}
                      </span>{' '}
                      {notif.type === 'like' && 'liked your post'}
                      {notif.type === 'comment' && 'commented on your post'}
                      {notif.type === 'follow' && 'started following you'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                </div>

                {!notif.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
