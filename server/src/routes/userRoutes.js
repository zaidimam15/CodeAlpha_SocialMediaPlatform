import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  changePassword,
  getSuggestedUsers,
  getUserFollowers,
  getUserFollowing,
  deleteAccount,
  updateProfileSchema,
  changePasswordSchema,
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/profile/:username', optionalAuth, getUserProfile);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);
router.patch('/password', protect, validate(changePasswordSchema), changePassword);
router.get('/suggested', optionalAuth, getSuggestedUsers);
router.get('/:id/followers', optionalAuth, getUserFollowers);
router.get('/:id/following', optionalAuth, getUserFollowing);
router.delete('/account', protect, deleteAccount);

export default router;
