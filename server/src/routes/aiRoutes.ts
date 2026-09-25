import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  sendMessage,
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from '../controllers/aiController.js';

const router = Router();

router.use(requireAuth);

router.post('/chat', sendMessage);
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversation);
router.patch('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversation);

export default router;
