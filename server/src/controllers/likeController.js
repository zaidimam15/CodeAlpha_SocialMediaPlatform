import { Like } from '../models/Like.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';
import { sendNotificationToUser, broadcastPostEvent } from '../sockets/index.js';

export async function toggleLikePost(req, res, next) {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });

    let isLiked = false;
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
      isLiked = false;
    } else {
      await Like.create({ user: userId, post: postId });
      post.likesCount += 1;
      await post.save();
      isLiked = true;

      // Create notification if liking someone else's post
      if (post.author.toString() !== userId.toString()) {
        const notification = await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'like',
          post: postId,
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate('sender', 'username displayName avatar')
          .populate('post', 'content');

        sendNotificationToUser(post.author, populatedNotification);
      }
    }

    broadcastPostEvent(postId, 'post_like_updated', {
      postId,
      likesCount: post.likesCount,
    });

    return res.status(200).json({
      success: true,
      isLiked,
      likesCount: post.likesCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPostLikes(req, res, next) {
  try {
    const { id: postId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const likes = await Like.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username displayName avatar bio isVerified');

    const users = likes.map((l) => l.user).filter(Boolean);

    return res.status(200).json({
      success: true,
      users,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
}
