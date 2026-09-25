import { Router, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Activity } from '../models/Activity.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: { activities } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
