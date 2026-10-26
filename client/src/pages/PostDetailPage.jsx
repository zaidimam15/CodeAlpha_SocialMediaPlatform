import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PostCard } from '../components/posts/PostCard.jsx';
import { PostSkeleton } from '../components/common/Skeleton.jsx';
import { api } from '../services/api.js';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      try {
        const data = await api.posts.getById(id);
        if (data.success && data.post) {
          setPost(data.post);
        }
      } catch (err) {
        // Post not found
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadPost();
    }
  }, [id]);

  return (
    <div className="space-y-4">
      {/* Top Back bar */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors flex items-center gap-1.5 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-bold">Post Conversation</h1>
      </div>

      {isLoading ? (
        <PostSkeleton />
      ) : !post ? (
        <div className="glass-card p-12 text-center space-y-4">
          <h2 className="text-xl font-bold">Post Not Found</h2>
          <p className="text-sm text-gray-500">This post may have been deleted or the link is invalid.</p>
          <Link to="/" className="inline-block gradient-brand-btn px-6 py-2 rounded-xl text-sm font-bold">
            Return to Feed
          </Link>
        </div>
      ) : (
        <PostCard
          post={post}
          onPostDeleted={() => navigate('/')}
          onPostUpdated={(up) => setPost(up)}
        />
      )}
    </div>
  );
}
