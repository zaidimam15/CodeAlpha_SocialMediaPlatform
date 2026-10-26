import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0A0D14] text-gray-900 dark:text-gray-100">
      <div className="max-w-md space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white mx-auto shadow-2xl shadow-violet-500/30">
          <Compass className="w-12 h-12 animate-pulse-subtle" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black gradient-text">404</h1>
          <h2 className="text-2xl font-bold">Lost in Cyberspace?</h2>
          <p className="text-sm text-gray-500">
            The page you're searching for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="gradient-brand-btn px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/explore"
            className="glass-card px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            Explore Connectify
          </Link>
        </div>
      </div>
    </div>
  );
}
