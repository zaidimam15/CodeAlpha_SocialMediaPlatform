import { Router } from 'express';
import { search, getTrendingHashtags } from '../controllers/searchController.js';

const router = Router();

router.get('/', search);
router.get('/trending', getTrendingHashtags);

export default router;
