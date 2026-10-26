import { Router } from 'express';
import { toggleFollowUser } from '../controllers/followController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/:id', protect, toggleFollowUser);

export default router;
