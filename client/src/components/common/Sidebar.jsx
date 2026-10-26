import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  Bookmark,
  User,
  Settings,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { Avatar } from './Avatar.jsx';

export function Sidebar({ onOpenCreatePost }) {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Explore', path: '/explore', icon: Compass },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null,
      authRequired: true,
    },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark, authRequired: true },
    {
      label: 'Profile',
      path: user ? `/profile/${user.username}` : '/login',
      icon: User,
      authRequired: true,
    },
    { label: 'Settings', path: '/settings', icon: Settings, authRequired: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-20 h-[calc(100vh-5rem)] justify-between pb-6 select-none">
      <div className="space-y-6">
        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.authRequired && !isAuthenticated) return null;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-transparent text-violet-600 dark:text-violet-400 font-bold border-l-4 border-violet-500'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/60 dark:hover:bg-dark-surface/60'
                  }`
                }
              >
                <div className="flex items-center gap-3.5">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Button */}
        {isAuthenticated && (
          <button
            onClick={onOpenCreatePost}
            className="w-full gradient-brand-btn py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 text-base font-bold shadow-lg shadow-violet-500/25"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Post</span>
          </button>
        )}
      </div>

      {/* User Footer Widget */}
      {isAuthenticated && user && (
        <Link
          to={`/profile/${user.username}`}
          className="flex items-center gap-3 p-3 rounded-2xl glass-card glass-card-hover"
        >
          <Avatar src={user.avatar} alt={user.displayName} size="md" isVerified={user.isVerified} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
          <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
        </Link>
      )}
    </aside>
  );
}
