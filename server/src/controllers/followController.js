import { Follow } from '../models/Follow.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { sendNotificationToUser } from '../sockets/index.js';

export async function toggleFollowUser(req, res, next) {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.',
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    let isFollowing = false;
    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
      await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } });
      isFollowing = false;
    } else {
      await Follow.create({
        follower: currentUserId,
        following: targetUserId,
      });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });
      await User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } });
      isFollowing = true;

      // Send notification
      const notification = await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow',
      });

      const populatedNotification = await Notification.findById(notification._id).populate(
        'sender',
        'username displayName avatar'
      );

      sendNotificationToUser(targetUserId, populatedNotification);
    }

    const updatedTarget = await User.findById(targetUserId).select('followersCount');

    return res.status(200).json({
      success: true,
      isFollowing,
      followersCount: updatedTarget ? updatedTarget.followersCount : 0,
      message: isFollowing
        ? `You are now following @${targetUser.username}`
        : `Unfollowed @${targetUser.username}`,
    });
  } catch (error) {
    next(error);
  }
}
