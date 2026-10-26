import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter both your identifier and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(identifier.trim(), password);
      showToast(`Welcome back, @${data.user.username}! ✨`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (username) => {
    setIdentifier(username);
    setPassword('Password123!');
    setIsLoading(true);
    try {
      const data = await login(username, 'Password123!');
      showToast(`Signed in as demo creator @${data.user.username}!`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#0A0D14] text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/landing" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse-subtle" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your Connectify account</p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card p-6 sm:p-8 space-y-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email or Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="alex_rivers or alex@connectify.dev"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-violet-500 hover:text-violet-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-brand-btn py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/[0.08]">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
              ⚡ Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex_rivers')}
                disabled={isLoading}
                className="p-2 rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-violet-500/10 hover:border-violet-500/40 text-xs font-bold transition-all truncate"
              >
                @alex_rivers
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sophia_chen')}
                disabled={isLoading}
                className="p-2 rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-pink-500/10 hover:border-pink-500/40 text-xs font-bold transition-all truncate"
              >
                @sophia_chen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dev_demo')}
                disabled={isLoading}
                className="p-2 rounded-xl border border-gray-200 dark:border-white/[0.08] hover:bg-indigo-500/10 hover:border-indigo-500/40 text-xs font-bold transition-all truncate"
              >
                @dev_demo
              </button>
            </div>
          </div>
        </div>

        {/* Register CTA */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-violet-500 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
