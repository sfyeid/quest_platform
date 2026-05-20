import { prisma } from '../config/prisma';

export const sessionRepository = {
  async findById(id: string) {
    return prisma.questSession.findUnique({
      where: { id },
      include: {
        quest: { include: { tasks: { orderBy: { orderIndex: 'asc' } } } },
        user: { select: { id: true, name: true } },
        taskResults: true,
      },
    });
  },

  async findActiveByUserAndQuest(userId: string, questId: string) {
    return prisma.questSession.findFirst({
      where: { userId, questId, status: 'ACTIVE' },
    });
  },

  async findByUser(userId: string) {
    return prisma.questSession.findMany({
      where: { userId },
      include: {
        quest: { select: { id: true, title: true, difficulty: true } },
        _count: { select: { taskResults: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  },

  async create(userId: string, questId: string) {
    return prisma.questSession.create({
      data: { userId, questId },
      include: {
        quest: { include: { tasks: { orderBy: { orderIndex: 'asc' } } } },
      },
    });
  },

  async updateProgress(id: string, currentTaskIndex: number) {
    return prisma.questSession.update({
      where: { id },
      data: { currentTaskIndex },
    });
  },

  async complete(id: string, totalTimeSeconds: number) {
    return prisma.questSession.update({
      where: { id },
      data: { status: 'COMPLETED', completedAt: new Date(), totalTimeSeconds },
    });
  },

  async saveTaskResult(sessionId: string, taskId: string, answer: string, isCorrect: boolean) {
    return prisma.taskResult.create({
      data: { sessionId, taskId, answer, isCorrect },
    });
  },

  async getLeaderboard(questId: string) {
    return prisma.questSession.findMany({
      where: { questId, status: 'COMPLETED' },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { totalTimeSeconds: 'asc' },
      take: 20,
    });
  },
};
