import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { sessionService } from '../services/session.service';

const startSchema = z.object({ questId: z.string().uuid() });
const answerSchema = z.object({ taskId: z.string().uuid(), answer: z.string().min(1) });

export const sessionController = {
  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { questId } = startSchema.parse(req.body);
      const session = await sessionService.startSession(req.user!.userId, questId);
      res.status(201).json(session);
    } catch (err) { next(err); }
  },

  async getSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await sessionService.getSession(req.params.id, req.user!.userId);
      res.json(session);
    } catch (err) { next(err); }
  },

  async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskId, answer } = answerSchema.parse(req.body);
      const result = await sessionService.submitAnswer(req.params.id, req.user!.userId, taskId, answer);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await sessionService.getUserHistory(req.user!.userId);
      res.json(history);
    } catch (err) { next(err); }
  },
};
