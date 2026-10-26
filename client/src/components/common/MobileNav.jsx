import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';

export function MobileNav({ onOpenCreatePost }) {
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useSocket();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/[0.08] px-4 py-2 flex items-center justify-around">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `p-2.5 rounded-xl flex flex-col items-center ${
            isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`
        }
      >
        <Home className="w-5 h-5" />
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) =>
          `p-2.5 rounded-xl flex flex-col items-center ${
            isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`
        }
      >
        <Compass className="w-5 h-5" />
      </NavLink>

      {isAuthenticated && (
        <button
          onClick={onOpenCreatePost}
          aria-label="Create Post"
          className="w-11 h-11 -mt-4 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/40 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      )}

      {isAuthenticated ? (
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `p-2.5 rounded-xl flex flex-col items-center relative ${
              isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`
          }
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-dark-bg"></span>
          )}
        </NavLink>
      ) : null}

      <NavLink
        to={user ? `/profile/${user.username}` : '/login'}
        className={({ isActive }) =>
          `p-2.5 rounded-xl flex flex-col items-center ${
            isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
          }`
        }
      >
        <User className="w-5 h-5" />
      </NavLink>
    </nav>
  );
}
