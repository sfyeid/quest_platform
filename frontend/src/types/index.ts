export type UserRole = 'ORGANIZER' | 'PLAYER';
export type QuestStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuestDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type TaskType = 'TEXT' | 'CHOICE' | 'NUMBER';
export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Task {
  id: string;
  questId: string;
  orderIndex: number;
  description: string;
  answer?: string; // hidden for players
  taskType: TaskType;
  hint?: string;
  latitude: number;
  longitude: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: QuestDifficulty;
  status: QuestStatus;
  creatorId: string;
  creator: { id: string; name: string };
  tasks: Task[];
  createdAt: string;
  _count?: { tasks: number; sessions: number };
}

export interface QuestSession {
  id: string;
  questId: string;
  userId: string;
  status: SessionStatus;
  currentTaskIndex: number;
  startedAt: string;
  completedAt?: string;
  totalTimeSeconds?: number;
  quest: Quest;
  taskResults: TaskResult[];
  user: { id: string; name: string };
}

export interface TaskResult {
  id: string;
  sessionId: string;
  taskId: string;
  answer: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface LeaderboardEntry {
  id: string;
  totalTimeSeconds: number;
  completedAt: string;
  user: { id: string; name: string };
}

export type WsEventType =
  | 'progress_updated'
  | 'session_completed'
  | 'task_answered'
  | 'player_joined'
  | 'player_left'
  | 'pong';

export interface WsEvent {
  type: WsEventType;
  payload: Record<string, unknown>;
}
