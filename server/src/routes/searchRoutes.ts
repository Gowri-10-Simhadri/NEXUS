import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { requireAuth } from '../middleware/auth.js';
import { Activity } from '../models/Activity.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', globalSearch);

export default router;
