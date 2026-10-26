import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Edit3,
  Trash2,
  Send,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { Avatar } from '../common/Avatar.jsx';
import { ConfirmationModal } from '../common/ConfirmationModal.jsx';
import { EditPostModal } from './EditPostModal.jsx';
import { formatTimeAgo } from '../../utils/formatDate.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/api.js';

export function PostCard({ post, onPostDeleted, onPostUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [bookmarksCount, setBookmarksCount] = useState(post.bookmarksCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const menuRef = useRef(null);
  const isAuthor = user && currentPost.author && user._id === currentPost.author._id;

  // Sync state if props change
  useEffect(() => {
    setCurrentPost(post);
    setIsLiked(post.isLiked || false);
    setLikesCount(post.likesCount || 0);
    setIsBookmarked(post.isBookmarked || false);
    setBookmarksCount(post.bookmarksCount || 0);
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

  // Click outside to close 3-dot menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to like posts.', 'info');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic update
    setIsLiked(!prevLiked);
    setLikesCount((prev) => (prevLiked ? Math.max(0, prev - 1) : prev + 1));
    if (!prevLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 500);
    }

    try {
      const data = await api.posts.toggleLike(currentPost._id);
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      showToast(err.message || 'Failed to update like', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save posts.', 'info');
      return;
    }

    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);
    setBookmarksCount((prev) => (prevBookmarked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const data = await api.posts.toggleBookmark(currentPost._id);
      if (data.success) {
        setIsBookmarked(data.isBookmarked);
        showToast(
          data.isBookmarked ? 'Post saved to bookmarks!' : 'Removed from bookmarks.',
          'success'
        );
      }
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      showToast(err.message || 'Bookmark action failed', 'error');
    }
  };

  const toggleCommentsDrawer = async () => {
    if (!showComments) {
      setShowComments(true);
      if (comments.length === 0) {
        setIsLoadingComments(true);
        try {
          const data = await api.posts.getComments(currentPost._id);
          if (data.success) {
            setComments(data.comments || []);
          }
        } catch (err) {
          showToast('Could not load comments', 'error');
        } finally {
          setIsLoadingComments(false);
        }
      }
    } else {
      setShowComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      showToast('Please log in to comment.', 'info');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const data = await api.posts.addComment(currentPost._id, commentText.trim());
      if (data.success) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentsCount((prev) => prev + 1);
        setCommentText('');
        showToast('Comment posted! 💬', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const data = await api.posts.deleteComment(commentId);
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1));
        showToast('Comment deleted', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${currentPost._id}`;
    navigator.clipboard.writeText(postUrl);
    showToast('Post link copied to clipboard! 📋', 'success');
    setShowMenu(false);
  };

  const handleNativeShare = async () => {
    const postUrl = `${window.location.origin}/post/${currentPost._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Connectify post by @${currentPost.author?.username}`,
          text: currentPost.content,
          url: postUrl,
        });
      } catch (err) {
        // Dismissed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const data = await api.posts.delete(currentPost._id);
      if (data.success) {
        showToast('Post deleted successfully.', 'success');
        if (onPostDeleted) {
          onPostDeleted(currentPost._id);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Render text with clickable #hashtags
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const tokens = text.split(/(\s+)/);

    return tokens.map((token, index) => {
      if (token.startsWith('#') && token.length > 1) {
        const tag = token.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <Link
            key={index}
            to={`/search?q=%23${tag}`}
            className="text-violet-500 font-semibold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {token}
          </Link>
        );
      }
      return token;
    });
  };

  return (
    <article className="glass-card overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-white/[0.12]">
      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        <Link
          to={`/profile/${currentPost.author?.username}`}
          className="flex items-center gap-3 group min-w-0"
        >
          <Avatar
            src={currentPost.author?.avatar}
            alt={currentPost.author?.displayName}
            size="md"
            isVerified={currentPost.author?.isVerified}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-violet-500 transition-colors truncate">
                {currentPost.author?.displayName}
              </span>
              <span className="text-xs text-gray-500 truncate">
                @{currentPost.author?.username}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <span>{formatTimeAgo(currentPost.createdAt)}</span>
              {currentPost.isEdited && <span>• (edited)</span>}
            </div>
          </div>
        </Link>

        {/* 3-dots Context Menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Post Options"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 glass-card p-1.5 shadow-xl z-30 animate-slide-up">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-violet-500/10 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <LinkIcon className="w-4 h-4 text-violet-500" />
                Copy Link
              </button>

              {isAuthor && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-violet-500/10 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-violet-500" />
                    Edit Post
                  </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {currentPost.content && (
        <div className="px-4 sm:px-5 pb-3">
          <p className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {renderFormattedContent(currentPost.content)}
          </p>
        </div>
      )}

      {/* Media Gallery */}
      {currentPost.media && currentPost.media.length > 0 && (
        <div className="px-4 sm:px-5 pb-3">
          <div
            className={`grid gap-2 rounded-2xl overflow-hidden ${
              currentPost.media.length === 1
                ? 'grid-cols-1'
                : currentPost.media.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {currentPost.media.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage(item.url)}
                className={`cursor-pointer overflow-hidden rounded-xl bg-gray-900 group relative ${
                  currentPost.media.length === 1 ? 'max-h-[500px]' : 'h-48 sm:h-56'
                }`}
              >
                <img
                  src={item.url}
                  alt={`Attachment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Row */}
      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors group ${
              isLiked ? 'text-rose-500' : 'hover:text-rose-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-rose-500/10 transition-colors">
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : ''
                } ${showHeartBurst ? 'animate-heart-burst' : ''}`}
              />
            </div>
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={toggleCommentsDrawer}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors hover:text-violet-500 group"
          >
            <div className="p-2 rounded-full group-hover:bg-violet-500/10 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span>{commentsCount}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors group ${
              isBookmarked ? 'text-violet-500' : 'hover:text-violet-500'
            }`}
          >
            <div className="p-2 rounded-full group-hover:bg-violet-500/10 transition-colors">
              <Bookmark
                className={`w-5 h-5 ${
                  isBookmarked ? 'fill-violet-500 text-violet-500' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleNativeShare}
          aria-label="Share Post"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-violet-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="bg-gray-50/70 dark:bg-black/20 p-4 sm:p-5 border-t border-gray-100 dark:border-white/[0.06] space-y-4">
          {/* Add comment input */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-3">
              <Avatar src={user?.avatar} alt={user?.displayName} size="sm" />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={1000}
                  className="w-full pl-3.5 pr-10 py-2 rounded-full border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-dark-surface text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-violet-500 hover:text-violet-600 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-gray-500 text-center py-1">
              <Link to="/login" className="text-violet-500 font-semibold underline">
                Log in
              </Link>{' '}
              to leave a comment.
            </p>
          )}

          {/* Comment list */}
          {isLoadingComments ? (
            <div className="text-center py-4 text-xs text-gray-400">Loading comments...</div>
          ) : comments.length === 0 ? (
            <p className="text-center py-2 text-xs text-gray-400">
              No comments yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-3 pt-1">
              {comments.map((comment) => {
                const canDelete =
                  user &&
                  (user._id === comment.author?._id || user._id === currentPost.author?._id);

                return (
                  <div key={comment._id} className="flex items-start gap-2.5 text-xs group">
                    <Link to={`/profile/${comment.author?.username}`}>
                      <Avatar
                        src={comment.author?.avatar}
                        alt={comment.author?.displayName}
                        size="xs"
                        isVerified={comment.author?.isVerified}
                      />
                    </Link>
                    <div className="flex-1 bg-white dark:bg-dark-surface p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.05]">
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/profile/${comment.author?.username}`}
                          className="font-bold text-gray-900 dark:text-gray-100 hover:underline"
                        >
                          {comment.author?.displayName}
                        </Link>
                        <span className="text-[10px] text-gray-400">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-rose-500 transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={currentPost}
        onPostUpdated={(updated) => {
          setCurrentPost(updated);
          if (onPostUpdated) onPostUpdated(updated);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? All likes, comments, and media will be removed."
        confirmText="Delete Post"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Lightbox Zoom Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Fullscreen Preview"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}
