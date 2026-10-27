import { z } from 'zod';
import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Like } from '../models/Like.js';
import { Bookmark } from '../models/Bookmark.js';
import { Notification } from '../models/Notification.js';

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name cannot be empty').max(50).optional(),
  bio: z.string().max(300, 'Bio cannot exceed 300 characters').optional(),
  website: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  themePreference: z.enum(['dark', 'light', 'system']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function getUserProfile(req, res, next) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User @${username} not found.`,
      });
    }

    let isFollowing = false;
    let isSelf = false;

    if (req.user) {
      isSelf = req.user._id.toString() === user._id.toString();
      if (!isSelf) {
        const followExists = await Follow.exists({
          follower: req.user._id,
          following: user._id,
        });
        isFollowing = !!followExists;
      }
    }

    return res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        website: user.website,
        location: user.location,
        isVerified: user.isVerified,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        createdAt: user.createdAt,
        isFollowing,
        isSelf,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { displayName, bio, website, location, avatar, coverImage, themePreference } = req.body;

    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;
    if (coverImage !== undefined) user.coverImage = coverImage;
    if (themePreference !== undefined) user.themePreference = themePreference;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        website: user.website,
        location: user.location,
        isVerified: user.isVerified,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function getSuggestedUsers(req, res, next) {
  try {
    const currentUserId = req.user ? req.user._id : null;

    let excludeIds = [];
    if (currentUserId) {
      excludeIds.push(currentUserId);
      const following = await Follow.find({ follower: currentUserId }).select('following');
      excludeIds.push(
        ...following.map((f) => f.following).filter(Boolean)
      );
    }

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      username: { $exists: true, $ne: '' },
    })
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(6)
      .select('username displayName avatar bio isVerified followersCount');

    return res.status(200).json({
      success: true,
      users: suggestions,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserFollowers(req, res, next) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const follows = await Follow.find({ following: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('follower', 'username displayName avatar bio isVerified');

    const users = follows.map((f) => f.follower).filter(Boolean);

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

export async function getUserFollowing(req, res, next) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const follows = await Follow.find({ follower: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('following', 'username displayName avatar bio isVerified');

    const users = follows.map((f) => f.following).filter(Boolean);

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

export async function deleteAccount(req, res, next) {
  try {
    const userId = req.user._id;

    // Delete user's posts, comments, likes, bookmarks, follows, notifications
    await Post.deleteMany({ author: userId });
    await Comment.deleteMany({ author: userId });
    await Like.deleteMany({ user: userId });
    await Bookmark.deleteMany({ user: userId });
    await Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] });
    await Notification.deleteMany({ $or: [{ recipient: userId }, { sender: userId }] });
    await User.findByIdAndDelete(userId);

    res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
