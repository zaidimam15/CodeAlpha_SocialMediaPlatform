import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, ArrowLeft, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import { Avatar } from '../components/common/Avatar.jsx';

export function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
    avatar: user?.avatar || '',
    coverImage: user?.coverImage || '',
    themePreference: user?.themePreference || 'dark',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [coverPreview, setCoverPreview] = useState(user?.coverImage || '');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAvatarFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const form = new FormData();
      form.append('media', file);
      const res = await api.uploads.uploadMedia(form);
      if (res.success && res.media[0]) {
        setFormData((prev) => ({ ...prev, avatar: res.media[0].url }));
        showToast('Avatar uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Avatar upload failed', 'error');
    }
  };

  const handleCoverFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    try {
      const form = new FormData();
      form.append('media', file);
      const res = await api.uploads.uploadMedia(form);
      if (res.success && res.media[0]) {
        setFormData((prev) => ({ ...prev, coverImage: res.media[0].url }));
        showToast('Cover image uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Cover image upload failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await api.users.updateProfile(formData);
      if (data.success) {
        updateUser(data.user);
        showToast('Profile updated successfully! ✨', 'success');
        navigate(`/profile/${user?.username}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-6">
        {/* Cover Image Upload Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Cover Banner
          </label>
          <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 group">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm backdrop-blur-xs"
            >
              <Image className="w-5 h-5" />
              <span>Change Cover Image</span>
            </button>
          </div>
        </div>

        {/* Avatar Upload Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Profile Avatar
          </label>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar src={avatarPreview} alt={formData.displayName} size="xl" />
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-white/[0.1] hover:bg-gray-100 dark:hover:bg-dark-hover text-xs font-bold transition-colors"
              >
                Upload New Avatar
              </button>
              <p className="text-[11px] text-gray-400 mt-1">Recommended size: 400x400px (JPG, PNG)</p>
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/[0.08]">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Display Name
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={formData.displayName}
              onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
              className="input-field"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Bio
            </label>
            <textarea
              rows={3}
              maxLength={300}
              placeholder="Tell the community about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              className="input-field resize-none text-sm"
            />
            <div className="text-right text-[11px] text-gray-400">
              {300 - formData.bio.length} characters left
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Website Link
              </label>
              <input
                type="text"
                placeholder="https://yourportfolio.dev"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-brand-btn px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
