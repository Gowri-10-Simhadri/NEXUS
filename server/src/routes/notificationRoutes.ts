import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, snoozeNotification, dismissNotification } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.patch('/:id/snooze', snoozeNotification);
router.patch('/:id/dismiss', dismissNotification);

export default router;
