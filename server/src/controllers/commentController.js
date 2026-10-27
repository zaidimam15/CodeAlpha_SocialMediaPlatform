import { z } from 'zod';
import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';
import { sendNotificationToUser, broadcastPostEvent } from '../sockets/index.js';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment cannot exceed 1000 characters'),
});

export async function createComment(req, res, next) {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      content,
    });

    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'username displayName avatar isVerified'
    );

    // Notify post author if commenter is not author
    if (post.author.toString() !== userId.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        post: postId,
        comment: comment._id,
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'username displayName avatar')
        .populate('post', 'content');

      sendNotificationToUser(post.author, populatedNotification);
    }

    broadcastPostEvent(postId, 'post_comment_added', {
      postId,
      comment: populatedComment,
      commentsCount: post.commentsCount,
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populatedComment,
      commentsCount: post.commentsCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPostComments(req, res, next) {
  try {
    const { id: postId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username displayName avatar isVerified');

    const total = await Comment.countDocuments({ post: postId });

    const defaultAuthor = {
      displayName: 'Community Member',
      username: 'member',
      avatar: '',
      isVerified: false,
    };

    const safeComments = comments.map((c) => {
      const obj = c.toObject ? c.toObject() : c;
      return {
        ...obj,
        author: obj.author || defaultAuthor,
      };
    });

    return res.status(200).json({
      success: true,
      comments: safeComments,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const { id: commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const post = await Post.findById(comment.post);

    // Author of comment or author of post can delete
    const isCommentAuthor = comment.author.toString() === userId.toString();
    const isPostAuthor = post && post.author.toString() === userId.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    await Comment.findByIdAndDelete(commentId);

    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();

      broadcastPostEvent(post._id, 'post_comment_deleted', {
        postId: post._id,
        commentId,
        commentsCount: post.commentsCount,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      commentsCount: post ? post.commentsCount : 0,
    });
  } catch (error) {
    next(error);
  }
}
