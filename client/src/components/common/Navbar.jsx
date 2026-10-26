import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Sparkles,
  Bookmark,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { Avatar } from './Avatar.jsx';
import { api } from '../../services/api.js';

export function Navbar({ onOpenCreatePost }) {
  const { user, isAuthenticated, logout, theme, toggleTheme } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const menuRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [] });
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const data = await api.search.query(searchQuery);
        if (data.success) {
          setSearchResults({ users: data.users || [], posts: data.posts || [] });
          setShowSearchDropdown(true);
        }
      } catch (err) {
        // Ignore error
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <span className="text-xl font-extrabold tracking-tight gradient-text hidden sm:inline-block">
            Connectify
          </span>
        </Link>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-2 sm:mx-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search creators, hashtags, ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchDropdown(true);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-full border border-gray-200 dark:border-white/[0.08] bg-gray-100/70 dark:bg-dark-surface/70 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Quick Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 glass-card p-3 shadow-2xl z-50 max-h-96 overflow-y-auto animate-slide-up">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
              ) : searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.users.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                        Creators
                      </p>
                      {searchResults.users.slice(0, 4).map((u) => (
                        <Link
                          key={u._id}
                          to={`/profile/${u.username}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-500/10 transition-colors"
                        >
                          <Avatar src={u.avatar} alt={u.displayName} size="sm" isVerified={u.isVerified} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                              {u.displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.posts.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-2 mb-1.5">
                        Posts
                      </p>
                      {searchResults.posts.slice(0, 3).map((p) => (
                        <Link
                          key={p._id}
                          to={`/post/${p._id}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="block p-2 rounded-xl hover:bg-violet-500/10 transition-colors text-xs text-gray-700 dark:text-gray-300 line-clamp-1"
                        >
                          💬 {p.content || 'Photo post'}
                        </Link>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2 text-xs font-semibold text-violet-500 hover:text-violet-400 border-t border-gray-100 dark:border-gray-800 pt-2"
                  >
                    View all results for "{searchQuery}" →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-gray-300 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications Button */}
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-gray-300 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-violet-500/40 transition-all"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.displayName || 'User'}
                    size="sm"
                    isVerified={user?.isVerified}
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 shadow-2xl z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-gray-200/70 dark:border-white/[0.08]">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {user?.displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-violet-500/10 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <User className="w-4 h-4 text-violet-500" />
                        My Profile
                      </Link>

                      <Link
                        to="/bookmarks"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-violet-500/10 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-violet-500" />
                        Saved Posts
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-violet-500/10 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-violet-500" />
                        Account Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-200/70 dark:border-white/[0.08] pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="gradient-brand-btn px-4 py-2 rounded-xl text-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
