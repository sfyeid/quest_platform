import { Router } from 'express';
import { questController } from '../controllers/quest.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

export const questRouter = Router();

// Public
questRouter.get('/', questController.getAll);
questRouter.get('/:id', questController.getById);
questRouter.get('/:id/leaderboard', questController.getLeaderboard);

// Auth required
questRouter.use(authenticate);
questRouter.get('/my/quests', questController.getMyQuests);

// Organizer only
questRouter.post('/', requireRole('ORGANIZER'), questController.create);
questRouter.patch('/:id', requireRole('ORGANIZER'), questController.update);
questRouter.post('/:id/publish', requireRole('ORGANIZER'), questController.publish);
questRouter.delete('/:id', requireRole('ORGANIZER'), questController.delete);
questRouter.post('/:id/tasks', requireRole('ORGANIZER'), questController.addTask);
questRouter.patch('/:id/tasks/:taskId', requireRole('ORGANIZER'), questController.updateTask);
questRouter.delete('/:id/tasks/:taskId', requireRole('ORGANIZER'), questController.deleteTask);
