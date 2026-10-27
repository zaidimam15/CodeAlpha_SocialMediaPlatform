import { Bookmark } from '../models/Bookmark.js';
import { Post } from '../models/Post.js';
import { Like } from '../models/Like.js';

export async function toggleBookmarkPost(req, res, next) {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existing = await Bookmark.findOne({ user: userId, post: postId });

    let isBookmarked = false;
    if (existing) {
      await Bookmark.findByIdAndDelete(existing._id);
      post.bookmarksCount = Math.max(0, post.bookmarksCount - 1);
      await post.save();
      isBookmarked = false;
    } else {
      await Bookmark.create({ user: userId, post: postId });
      post.bookmarksCount += 1;
      await post.save();
      isBookmarked = true;
    }

    return res.status(200).json({
      success: true,
      isBookmarked,
      bookmarksCount: post.bookmarksCount,
      message: isBookmarked ? 'Post saved to your bookmarks' : 'Post removed from bookmarks',
    });
  } catch (error) {
    next(error);
  }
}

export async function getBookmarks(req, res, next) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;

    const bookmarks = await Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'post',
        populate: {
          path: 'author',
          select: 'username displayName avatar isVerified',
        },
      });

    const validPosts = bookmarks.map((b) => b.post).filter(Boolean);
    const postIds = validPosts.map((p) => p._id);

    const userLikes = await Like.find({ user: userId, post: { $in: postIds } }).select('post');
    const likedSet = new Set(
      userLikes.filter((l) => l && l.post).map((l) => l.post.toString())
    );

    const defaultAuthor = {
      displayName: 'Community Member',
      username: 'member',
      avatar: '',
      isVerified: false,
    };

    const enriched = validPosts.map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      return {
        ...obj,
        author: obj.author || defaultAuthor,
        isLiked: p._id ? likedSet.has(p._id.toString()) : false,
        isBookmarked: true,
      };
    });

    return res.status(200).json({
      success: true,
      posts: enriched,
      page,
      limit,
      hasMore: validPosts.length === limit,
    });
  } catch (error) {
    next(error);
  }
}
