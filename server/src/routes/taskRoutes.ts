import { Router } from 'express';
import { getTasks, createTask, updateTask, toggleTaskComplete, deleteTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', toggleTaskComplete);
router.delete('/:id', deleteTask);

export default router;
