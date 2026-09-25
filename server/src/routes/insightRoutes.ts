import { Router } from 'express';
import { getInsights } from '../controllers/insightController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getInsights);

export default router;
