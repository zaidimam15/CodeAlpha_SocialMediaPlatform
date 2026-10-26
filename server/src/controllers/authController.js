import { z } from 'zod';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { sendTokenResponse } from '../utils/jwt.js';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  email: z.string().email('Please provide a valid email address'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Please provide your email or username'),
  password: z.string().min(1, 'Please enter your password'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function register(req, res, next) {
  try {
    const { username, email, displayName, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }
      return res.status(409).json({
        success: false,
        message: 'This username is already taken. Please choose another.',
      });
    }

    const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      displayName,
      password,
      avatar: defaultAvatar,
    });

    return sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Connectify.');
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.',
      });
    }

    return sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      _id: req.user._id,
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      bio: req.user.bio,
      avatar: req.user.avatar,
      coverImage: req.user.coverImage,
      website: req.user.website,
      location: req.user.location,
      isVerified: req.user.isVerified,
      followersCount: req.user.followersCount,
      followingCount: req.user.followingCount,
      postsCount: req.user.postsCount,
      themePreference: req.user.themePreference,
      createdAt: req.user.createdAt,
    },
  });
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't disclose whether email exists for security, return positive message
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: 'Password reset instructions have been generated.',
      // Provided in development response for easy testing
      devResetToken: resetToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendTokenResponse(user, 200, res, 'Password has been reset successfully.');
  } catch (error) {
    next(error);
  }
}
