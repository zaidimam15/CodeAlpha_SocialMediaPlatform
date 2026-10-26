import { z } from 'zod';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Like } from '../models/Like.js';
import { Bookmark } from '../models/Bookmark.js';
import { Follow } from '../models/Follow.js';
import { Comment } from '../models/Comment.js';
import { broadcastPostEvent } from '../sockets/index.js';

export const createPostSchema = z.object({
  content: z.string().max(2000, 'Content cannot exceed 2000 characters').optional().default(''),
  media: z
    .array(
      z.object({
        url: z.string(),
        type: z.enum(['image', 'video']).default('image'),
        publicId: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export const updatePostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty').max(2000),
});

function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_]+)/g);
  if (!matches) return [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

async function attachUserInteractions(posts, currentUserId) {
  if (!currentUserId || !posts.length) {
    return posts.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      return { ...obj, isLiked: false, isBookmarked: false };
    });
  }

  const postIds = posts.map((p) => p._id);

  const [likes, bookmarks] = await Promise.all([
    Like.find({ user: currentUserId, post: { $in: postIds } }).select('post'),
    Bookmark.find({ user: currentUserId, post: { $in: postIds } }).select('post'),
  ]);

  const likedSet = new Set(likes.map((l) => l.post.toString()));
  const bookmarkedSet = new Set(bookmarks.map((b) => b.post.toString()));

  return posts.map((p) => {
    const obj = p.toObject ? p.toObject() : p;
    return {
      ...obj,
      isLiked: likedSet.has(p._id.toString()),
      isBookmarked: bookmarkedSet.has(p._id.toString()),
    };
  });
}

export async function createPost(req, res, next) {
  try {
    const { content, media } = req.body;

    if (!content && (!media || media.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'A post must contain either text or at least one image.',
      });
    }

    const hashtags = extractHashtags(content);

    const post = await Post.create({
      author: req.user._id,
      content: content || '',
      media: media || [],
      hashtags,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'username displayName avatar isVerified'
    );

    const responsePost = {
      ...populatedPost.toObject(),
      isLiked: false,
      isBookmarked: false,
    };

    broadcastPostEvent(post._id, 'post_created', responsePost);

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: responsePost,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeedPosts(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const currentUserId = req.user._id;

    // Get IDs of users current user follows
    const follows = await Follow.find({ follower: currentUserId }).select('following');
    const followingIds = follows.map((f) => f.following);
    followingIds.push(currentUserId);

    // Query followed users' posts
    let posts = await Post.find({ author: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar isVerified');

    // If feed is empty or short (e.g. new user), backfill with latest posts
    if (posts.length < limit && page === 1) {
      const existingIds = posts.map((p) => p._id);
      const fallbackPosts = await Post.find({ _id: { $nin: existingIds } })
        .sort({ createdAt: -1 })
        .limit(limit - posts.length)
        .populate('author', 'username displayName avatar isVerified');

      posts = [...posts, ...fallbackPosts];
    }

    const enrichedPosts = await attachUserInteractions(posts, currentUserId);

    return res.status(200).json({
      success: true,
      posts: enrichedPosts,
      page,
      limit,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    next(error);
  }
}

export async function getExplorePosts(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const currentUserId = req.user ? req.user._id : null;

    const posts = await Post.find()
      .sort({ likesCount: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar isVerified');

    const enrichedPosts = await attachUserInteractions(posts, currentUserId);

    return res.status(200).json({
      success: true,
      posts: enrichedPosts,
      page,
      limit,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserPosts(req, res, next) {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const currentUserId = req.user ? req.user._id : null;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar isVerified');

    const enrichedPosts = await attachUserInteractions(posts, currentUserId);

    return res.status(200).json({
      success: true,
      posts: enrichedPosts,
      page,
      limit,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHashtagPosts(req, res, next) {
  try {
    const { tag } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const currentUserId = req.user ? req.user._id : null;

    const posts = await Post.find({ hashtags: tag.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar isVerified');

    const enrichedPosts = await attachUserInteractions(posts, currentUserId);

    return res.status(200).json({
      success: true,
      tag,
      posts: enrichedPosts,
      page,
      limit,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPostById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user._id : null;

    const post = await Post.findById(id).populate(
      'author',
      'username displayName avatar isVerified'
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const [enriched] = await attachUserInteractions([post], currentUserId);

    return res.status(200).json({
      success: true,
      post: enriched,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post.',
      });
    }

    post.content = content;
    post.hashtags = extractHashtags(content);
    post.isEdited = true;
    await post.save();

    const populated = await Post.findById(id).populate(
      'author',
      'username displayName avatar isVerified'
    );

    const [enriched] = await attachUserInteractions([populated], req.user._id);

    broadcastPostEvent(id, 'post_updated', enriched);

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: enriched,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post.',
      });
    }

    // Clean up dependent documents
    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });
    await Like.deleteMany({ post: id });
    await Bookmark.deleteMany({ post: id });
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

    broadcastPostEvent(id, 'post_deleted', { postId: id });

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
