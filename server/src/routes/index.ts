import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import taskRoutes from './taskRoutes.js';
import projectRoutes from './projectRoutes.js';
import goalRoutes from './goalRoutes.js';
import calendarRoutes from './calendarRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import aiRoutes from './aiRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import knowledgeRoutes from './knowledgeRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import insightRoutes from './insightRoutes.js';
import searchRoutes from './searchRoutes.js';
import activityRoutes from './activityRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/calendar', calendarRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/knowledge', knowledgeRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/insights', insightRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/activity', activityRoutes);

export default apiRouter;
