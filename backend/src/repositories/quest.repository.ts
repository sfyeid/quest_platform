import { prisma } from '../config/prisma';
import { QuestStatus, QuestDifficulty } from '@prisma/client';

export interface CreateQuestDto {
  title: string;
  description: string;
  category: string;
  difficulty: QuestDifficulty;
  creatorId: string;
}

export interface CreateTaskDto {
  questId: string;
  orderIndex: number;
  description: string;
  answer: string;
  taskType?: 'TEXT' | 'CHOICE' | 'NUMBER';
  hint?: string;
  latitude: number;
  longitude: number;
}

export const questRepository = {
  async findAll(filters?: { status?: QuestStatus; category?: string; difficulty?: QuestDifficulty }) {
    return prisma.quest.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.difficulty ? { difficulty: filters.difficulty } : {}),
      },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { tasks: true, sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.quest.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        tasks: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { sessions: true } },
      },
    });
  },

  async findByCreator(creatorId: string) {
    return prisma.quest.findMany({
      where: { creatorId },
      include: { _count: { select: { tasks: true, sessions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: CreateQuestDto) {
    return prisma.quest.create({ data });
  },

  async update(id: string, data: Partial<CreateQuestDto & { status: QuestStatus }>) {
    return prisma.quest.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.quest.delete({ where: { id } });
  },

  async addTask(data: CreateTaskDto) {
    return prisma.task.create({ data });
  },

  async updateTask(id: string, data: Partial<CreateTaskDto>) {
    return prisma.task.update({ where: { id }, data });
  },

  async deleteTask(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};
