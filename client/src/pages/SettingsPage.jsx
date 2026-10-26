import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Lock,
  Moon,
  Sun,
  Trash2,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmationModal } from '../components/common/ConfirmationModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function SettingsPage() {
  const { user, theme, toggleTheme, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const data = await api.users.changePassword({ currentPassword, newPassword });
      if (data.success) {
        showToast('Password updated successfully! 🔒', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const data = await api.users.deleteAccount();
      if (data.success) {
        showToast('Your account and all associated data have been deleted.', 'info');
        logout();
        navigate('/landing');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-5 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-500">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Account Settings
          </h1>
          <p className="text-xs text-gray-500">
            Manage your appearance, password, and account security
          </p>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          {theme === 'dark' ? (
            <Moon className="w-5 h-5 text-indigo-500" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Interface Appearance
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (theme !== 'light') toggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'border-violet-500 bg-violet-500/10 text-violet-600 font-bold ring-2 ring-violet-500/20'
                : 'border-gray-200 dark:border-white/[0.08] hover:bg-gray-100 dark:hover:bg-dark-hover'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs sm:text-sm font-bold">Light Mode</span>
            </div>
            {theme === 'light' && <CheckCircle className="w-4 h-4 text-violet-500" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'border-violet-500 bg-violet-500/10 text-violet-400 font-bold ring-2 ring-violet-500/20'
                : 'border-gray-200 dark:border-white/[0.08] hover:bg-gray-100 dark:hover:bg-dark-hover'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs sm:text-sm font-bold">Dark Mode</span>
            </div>
            {theme === 'dark' && <CheckCircle className="w-4 h-4 text-violet-500" />}
          </button>
        </div>
      </div>

      {/* Security & Password Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-violet-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="gradient-brand-btn px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-rose-500/20 space-y-4">
        <div className="flex items-center gap-2 text-rose-500">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-sm font-bold">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Delete Account
            </h3>
            <p className="text-xs text-gray-500 max-w-md">
              Permanently delete your Connectify account and remove all your posts, comments, likes, and followers. This action cannot be reversed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-600/30 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        message="Are you sure you want to delete your account? All your posts, uploaded media, comments, and followers will be permanently purged. This action cannot be undone."
        confirmText="Yes, Delete My Account"
        isDestructive={true}
        isLoading={isDeletingAccount}
      />
    </div>
  );
}
