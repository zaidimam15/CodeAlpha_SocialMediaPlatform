import React, { useState, useRef } from 'react';
import { Image, Hash, Smile, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/api.js';
import { Avatar } from '../common/Avatar.jsx';

export function CreatePostCard({ onPostCreated }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isAuthenticated) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 4) {
      showToast('You can attach a maximum of 4 images per post.', 'error');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(filePreviews[index]);
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addHashtag = (tag) => {
    setContent((prev) => `${prev.trim()} #${tag} `);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      showToast('Please add some text or an image to your post.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedMedia = [];

      // If images were selected, upload them first
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('media', file);
        });

        const uploadRes = await api.uploads.uploadMedia(formData);
        if (uploadRes.success && uploadRes.media) {
          uploadedMedia = uploadRes.media.map((m) => ({
            url: m.url,
            type: 'image',
          }));
        }
      }

      // Create post
      const postRes = await api.posts.create({
        content: content.trim(),
        media: uploadedMedia,
      });

      if (postRes.success) {
        showToast('Post published successfully! ✨', 'success');
        setContent('');
        setSelectedFiles([]);
        setFilePreviews([]);
        if (onPostCreated) {
          onPostCreated(postRes.post);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to publish post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-5 transition-all">
      <div className="flex gap-3">
        <Avatar src={user?.avatar} alt={user?.displayName} size="md" isVerified={user?.isVerified} />

        <div className="flex-1 space-y-3">
          <textarea
            placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || 'friend'}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={content.length > 80 ? 4 : 2}
            maxLength={2000}
            className="w-full bg-transparent resize-none text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none"
          />

          {/* Image Previews */}
          {filePreviews.length > 0 && (
            <div
              className={`grid gap-2 rounded-2xl overflow-hidden ${
                filePreviews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {filePreviews.map((previewUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden h-40 bg-gray-900">
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Hashtag suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <span className="text-gray-400 font-medium shrink-0">Tags:</span>
            {['tech', 'design', 'webdev', 'ai', 'creative'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addHashtag(tag)}
                className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-violet-500/20 hover:text-violet-500 transition-colors shrink-0"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Composer Controls & Submit */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.08]">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= 4}
                className="p-2 rounded-xl text-violet-500 hover:bg-violet-500/10 transition-colors flex items-center gap-1 text-xs font-semibold disabled:opacity-40"
              >
                <Image className="w-5 h-5" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setContent((prev) => prev + ' ✨ ')}
                className="p-2 rounded-xl text-indigo-500 hover:bg-indigo-500/10 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className="text-xs text-gray-400">
                  {2000 - content.length}
                </span>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
                className={`gradient-brand-btn px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                  isSubmitting || (!content.trim() && selectedFiles.length === 0)
                    ? 'opacity-50 cursor-not-allowed shadow-none'
                    : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Post</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
