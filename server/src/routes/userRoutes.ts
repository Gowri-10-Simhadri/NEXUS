import { Router } from 'express';
import { updateProfile, completeOnboarding, updatePassword, exportData, deleteAccount } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.put('/profile', updateProfile);
router.post('/onboarding', completeOnboarding);
router.put('/password', updatePassword);
router.get('/export', exportData);
router.delete('/account', deleteAccount);

export default router;
