import { Router } from 'express';
import { getDashboardData, getDailyBriefing } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getDashboardData);
router.get('/briefing', getDailyBriefing);

export default router;
