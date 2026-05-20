import { sessionRepository } from '../repositories/session.repository';
import { questRepository } from '../repositories/quest.repository';
import { verifyAnswer } from './answer.strategy';
import { wsManager } from '../index';

export const sessionService = {
  async startSession(userId: string, questId: string) {
    const quest = await questRepository.findById(questId);
    if (!quest) throw new Error('Not found');
    if (quest.status !== 'PUBLISHED') throw new Error('Quest not available');

    const existing = await sessionRepository.findActiveByUserAndQuest(userId, questId);
    if (existing) return existing;

    return sessionRepository.create(userId, questId);
  },

  async submitAnswer(sessionId: string, userId: string, taskId: string, answer: string) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) throw new Error('Not found');
    if (session.user.id !== userId) throw new Error('Forbidden');
    if (session.status !== 'ACTIVE') throw new Error('Session is not active');

    const task = session.quest.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Not found');

    const isCorrect = verifyAnswer(task.taskType, answer, task.answer);

    await sessionRepository.saveTaskResult(sessionId, taskId, answer, isCorrect);

    let nextTaskIndex = session.currentTaskIndex;
    let completed = false;

    if (isCorrect) {
      nextTaskIndex = session.currentTaskIndex + 1;
      const totalTasks = session.quest.tasks.length;

      if (nextTaskIndex >= totalTasks) {
        // Quest completed
        const elapsed = Math.floor(
          (Date.now() - session.startedAt.getTime()) / 1000
        );
        await sessionRepository.complete(sessionId, elapsed);
        completed = true;

        // Notify via WebSocket (Observer pattern)
        wsManager.broadcastToRoom(session.quest.id, {
          type: 'session_completed',
          payload: { sessionId, userId, totalTimeSeconds: elapsed },
        });
      } else {
        await sessionRepository.updateProgress(sessionId, nextTaskIndex);

        wsManager.broadcastToRoom(session.quest.id, {
          type: 'progress_updated',
          payload: {
            sessionId,
            userId,
            currentTaskIndex: nextTaskIndex,
            completedTaskId: taskId,
          },
        });
      }
    }

    // Also notify the answering user
    wsManager.sendToSession(sessionId, {
      type: 'task_answered',
      payload: { taskId, isCorrect, nextTaskIndex, completed },
    });

    return { isCorrect, completed, nextTaskIndex };
  },

  async getSession(sessionId: string, userId: string) {
    const session = await sessionRepository.findById(sessionId);
    if (!session) throw new Error('Not found');
    if (session.user.id !== userId) throw new Error('Forbidden');
    return session;
  },

  async getUserHistory(userId: string) {
    return sessionRepository.findByUser(userId);
  },

  async getLeaderboard(questId: string) {
    return sessionRepository.getLeaderboard(questId);
  },
};
