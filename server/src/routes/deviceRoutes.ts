import { Router } from 'express';
import { registerDevice, getDevices, unregisterDevice } from '../controllers/deviceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/register', registerDevice);
router.get('/', getDevices);
router.delete('/:deviceId', unregisterDevice);

export default router;
