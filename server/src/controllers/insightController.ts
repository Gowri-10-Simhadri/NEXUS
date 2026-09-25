import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { IntelligenceService } from '../services/intelligenceService.js';

export async function getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const insights = await IntelligenceService.evaluateUserContext(userId);
    res.json({ success: true, data: { insights } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
