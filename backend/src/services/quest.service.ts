import { questRepository, CreateQuestDto, CreateTaskDto } from '../repositories/quest.repository';
import { QuestStatus, QuestDifficulty } from '@prisma/client';

export const questService = {
  async getAll(filters?: { status?: QuestStatus; category?: string; difficulty?: QuestDifficulty }) {
    return questRepository.findAll(filters);
  },

  async getById(id: string) {
    const quest = await questRepository.findById(id);
    if (!quest) throw new Error('Not found');
    return quest;
  },

  async getMyQuests(creatorId: string) {
    return questRepository.findByCreator(creatorId);
  },

  async create(data: CreateQuestDto) {
    return questRepository.create(data);
  },

  async update(id: string, userId: string, data: Partial<CreateQuestDto & { status: QuestStatus }>) {
    const quest = await questRepository.findById(id);
    if (!quest) throw new Error('Not found');
    if (quest.creatorId !== userId) throw new Error('Forbidden');
    return questRepository.update(id, data);
  },

  async publish(id: string, userId: string) {
    const quest = await questRepository.findById(id);
    if (!quest) throw new Error('Not found');
    if (quest.creatorId !== userId) throw new Error('Forbidden');
    if (quest.tasks.length === 0) throw new Error('Quest must have at least one task');
    return questRepository.update(id, { status: 'PUBLISHED' });
  },

  async delete(id: string, userId: string) {
    const quest = await questRepository.findById(id);
    if (!quest) throw new Error('Not found');
    if (quest.creatorId !== userId) throw new Error('Forbidden');
    return questRepository.delete(id);
  },

  async addTask(questId: string, userId: string, data: Omit<CreateTaskDto, 'questId'>) {
    const quest = await questRepository.findById(questId);
    if (!quest) throw new Error('Not found');
    if (quest.creatorId !== userId) throw new Error('Forbidden');
    return questRepository.addTask({ ...data, questId });
  },

  async updateTask(questId: string, taskId: string, userId: string, data: Partial<CreateTaskDto>) {
    const quest = await questRepository.findById(questId);
    if (!quest) throw new Error('Not found');
    if (quest.creatorId !== userId) throw new Error('Forbidden');
    return questRepository.updateTask(taskId, data);
  },

  async deleteTask(questId: string, taskId: string, userId: string) {
    const quest = await questRepository.findById(questId);
    if (!quest) throw new Error('Not found');
    if (quest.creatorId !== userId) throw new Error('Forbidden');
    return questRepository.deleteTask(taskId);
  },
};
