import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function EditPostModal({ isOpen, onClose, post, onPostUpdated }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (post) {
      setContent(post.content || '');
    }
  }, [post]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('Post content cannot be empty.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.posts.update(post._id, content.trim());
      if (data.success) {
        showToast('Post updated successfully!', 'success');
        if (onPostUpdated) {
          onPostUpdated(data.post);
        }
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update post', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Post" maxWidth="max-w-lg">
      <form onSubmit={handleUpdate} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={2000}
          className="w-full input-field resize-none text-sm leading-relaxed"
          placeholder="Edit your post caption or text..."
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">{2000 - content.length} characters left</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="gradient-brand-btn px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
