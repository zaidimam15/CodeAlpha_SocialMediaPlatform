import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Shield,
  Heart,
  Globe,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect straight to feed
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0D14] text-gray-900 dark:text-gray-100 flex flex-col justify-between overflow-x-hidden">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <span className="text-2xl font-black tracking-tight gradient-text">Connectify</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-500 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="gradient-brand-btn px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-violet-500/25"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center text-center space-y-8">
        {/* Glow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-violet-500/30 text-xs font-semibold text-violet-600 dark:text-violet-400">
          <Zap className="w-3.5 h-3.5 fill-violet-500" />
          <span>Next-Generation Social Experience</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight sm:leading-none">
          Connect, inspire, and share <br className="hidden sm:inline" />
          <span className="gradient-text">without limits.</span>
        </h1>

        {/* Subhead */}
        <p className="max-w-2xl text-base sm:text-xl text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
          Connectify is the modern platform built for authentic creators, developers, and innovators.
          Real-time interactions, fluid 60fps design, and privacy-first architecture.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="w-full sm:w-auto gradient-brand-btn px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-violet-500/30 flex items-center justify-center gap-2"
          >
            <span>Create Your Free Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold glass-card hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Demo</span>
          </Link>
        </div>

        {/* Social Proof metrics */}
        <div className="pt-8 flex items-center gap-8 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Zero Advertising Clutter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Real-Time WebSockets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Dark & Light Themes</span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Real-Time Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Instant notification alerts for likes, comments, and new followers powered by Socket.IO.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Vibrant Interactions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Delightful micro-animations, heart bursts, multi-photo attachments, and rich hashtags.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Security & Privacy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Encrypted password hashing, JWT session protection, rate limiting, and safe database queries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/[0.08] py-8 text-center text-xs text-gray-500">
        <p>© 2026 Connectify Inc. Built for modern creators with React, Node.js, and MongoDB.</p>
      </footer>
    </div>
  );
}
