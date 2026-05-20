import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';

export const sessionRouter = Router();
sessionRouter.use(authenticate);

sessionRouter.post('/', sessionController.start);
sessionRouter.get('/history', sessionController.getHistory);
sessionRouter.get('/:id', sessionController.getSession);
sessionRouter.post('/:id/answer', sessionController.submitAnswer);
