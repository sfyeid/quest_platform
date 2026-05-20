import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import { questService } from '../services/quest.service';
import { QuestDifficulty } from '@prisma/client';

const createQuestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().default('MEDIUM'),
});

const taskSchema = z.object({
  orderIndex: z.number().int().min(0),
  description: z.string().min(5),
  answer: z.string().min(1),
  taskType: z.enum(['TEXT', 'CHOICE', 'NUMBER']).optional().default('TEXT'),
  hint: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const questController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { category, difficulty } = req.query as Record<string, string>;
      const quests = await questService.getAll({
        status: 'PUBLISHED',
        category,
        difficulty: difficulty as QuestDifficulty,
      });
      res.json(quests);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quest = await questService.getById(req.params.id);
      res.json(quest);
    } catch (err) { next(err); }
  },

  async getMyQuests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quests = await questService.getMyQuests(req.user!.userId);
      res.json(quests);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createQuestSchema.parse(req.body);
      const quest = await questService.create({ ...data, creatorId: req.user!.userId });
      res.status(201).json(quest);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createQuestSchema.partial().parse(req.body);
      const quest = await questService.update(req.params.id, req.user!.userId, data);
      res.json(quest);
    } catch (err) { next(err); }
  },

  async publish(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const quest = await questService.publish(req.params.id, req.user!.userId);
      res.json(quest);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await questService.delete(req.params.id, req.user!.userId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async addTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = taskSchema.parse(req.body);
      const task = await questService.addTask(req.params.id, req.user!.userId, data);
      res.status(201).json(task);
    } catch (err) { next(err); }
  },

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = taskSchema.partial().parse(req.body);
      const task = await questService.updateTask(req.params.id, req.params.taskId, req.user!.userId, data);
      res.json(task);
    } catch (err) { next(err); }
  },

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await questService.deleteTask(req.params.id, req.params.taskId, req.user!.userId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionService } = await import('../services/session.service');
      const board = await sessionService.getLeaderboard(req.params.id);
      res.json(board);
    } catch (err) { next(err); }
  },
};
