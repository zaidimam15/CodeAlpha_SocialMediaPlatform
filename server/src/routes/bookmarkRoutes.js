import { Router } from 'express';
import { getBookmarks, toggleBookmarkPost } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getBookmarks);
router.post('/:id', protect, toggleBookmarkPost);

export default router;
