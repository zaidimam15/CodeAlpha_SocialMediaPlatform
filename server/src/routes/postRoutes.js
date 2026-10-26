import { Router } from 'express';
import {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getUserPosts,
  getHashtagPosts,
  getPostById,
  updatePost,
  deletePost,
  createPostSchema,
  updatePostSchema,
} from '../controllers/postController.js';
import { toggleLikePost, getPostLikes } from '../controllers/likeController.js';
import {
  createComment,
  getPostComments,
  createCommentSchema,
} from '../controllers/commentController.js';
import { toggleBookmarkPost } from '../controllers/bookmarkController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Feed & Explore
router.get('/feed', protect, getFeedPosts);
router.get('/explore', optionalAuth, getExplorePosts);
router.get('/user/:username', optionalAuth, getUserPosts);
router.get('/hashtag/:tag', optionalAuth, getHashtagPosts);

// Single post CRUD
router.post('/', protect, validate(createPostSchema), createPost);
router.get('/:id', optionalAuth, getPostById);
router.patch('/:id', protect, validate(updatePostSchema), updatePost);
router.delete('/:id', protect, deletePost);

// Post interactions: Likes
router.post('/:id/like', protect, toggleLikePost);
router.get('/:id/likes', optionalAuth, getPostLikes);

// Post interactions: Comments
router.post('/:id/comments', protect, validate(createCommentSchema), createComment);
router.get('/:id/comments', optionalAuth, getPostComments);

// Post interactions: Bookmarks
router.post('/:id/bookmark', protect, toggleBookmarkPost);

export default router;
