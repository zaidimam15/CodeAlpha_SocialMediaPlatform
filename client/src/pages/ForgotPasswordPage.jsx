import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const data = await api.auth.forgotPassword(email.trim());
      showToast(data.message, 'success');
      if (data.devResetToken) {
        setDevToken(data.devResetToken);
      }
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#0A0D14] text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-gray-500">
            Enter your registered email address and we'll send you recovery instructions.
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 space-y-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-brand-btn py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send Reset Link</span>}
            </button>
          </form>

          {devToken && (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-3">
              <div className="flex items-center gap-2 text-violet-500 font-bold text-xs uppercase tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>Development Reset Token</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono">
                {devToken}
              </p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="inline-block w-full text-center py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
              >
                Proceed to Reset Password →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
