import { Router } from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Support multiple images upload (up to 4) or single
router.post('/', protect, upload.array('media', 4), uploadMedia);

export default router;
