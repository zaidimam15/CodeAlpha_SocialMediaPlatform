import { User } from '../models/User.js';
import { Post } from '../models/Post.js';

export async function search(req, res, next) {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    const type = req.query.type || 'all'; // 'users' | 'posts' | 'all'

    if (!q) {
      return res.status(200).json({
        success: true,
        users: [],
        posts: [],
      });
    }

    // Escape regex characters for safe search
    const safeRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    let users = [];
    let posts = [];

    if (type === 'users' || type === 'all') {
      users = await User.find({
        username: { $exists: true, $ne: '' },
        $or: [{ username: safeRegex }, { displayName: safeRegex }],
      })
        .limit(10)
        .select('username displayName avatar bio isVerified followersCount');
    }

    if (type === 'posts' || type === 'all') {
      posts = await Post.find({
        $or: [{ content: safeRegex }, { hashtags: q.toLowerCase().replace('#', '') }],
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('author', 'username displayName avatar isVerified');
    }

    return res.status(200).json({
      success: true,
      query: q,
      users,
      posts,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrendingHashtags(req, res, next) {
  try {
    const trending = await Post.aggregate([
      {
        $match: {
          hashtags: { $exists: true, $type: 'array', $ne: [] },
        },
      },
      {
        $unwind: '$hashtags',
      },
      {
        $match: {
          hashtags: { $type: 'string', $ne: '' },
        },
      },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      hashtags: trending,
    });
  } catch (error) {
    next(error);
  }
}
