// В Railway: VITE_API_URL = https://backend.up.railway.app  → BASE = https://backend.up.railway.app/api
// В Docker (nginx proxy): VITE_API_URL не задан → BASE = /api
const API_HOST = import.meta.env.VITE_API_URL || '';
const BASE = API_HOST ? `${API_HOST}/api` : '/api';

// Экспортируем для WebSocket
export function getWsUrl(): string {
  if (API_HOST) {
    // Railway: https://backend.up.railway.app → wss://backend.up.railway.app
    return API_HOST.replace(/^http/, 'ws');
  }
  // Docker/nginx proxy: используем текущий хост
  return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Auth
  register: (email: string, password: string, name: string, role: string) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, role }) }
    ),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  // User
  getMe: () => request<import('../types').User>('/users/me'),
  updateMe: (data: { name?: string; email?: string }) =>
    request<import('../types').User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),

  // Quests
  getQuests: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<import('../types').Quest[]>(`/quests${q}`);
  },
  getQuest: (id: string) => request<import('../types').Quest>(`/quests/${id}`),
  getMyQuests: () => request<import('../types').Quest[]>('/quests/my/quests'),
  createQuest: (data: object) =>
    request<import('../types').Quest>('/quests', { method: 'POST', body: JSON.stringify(data) }),
  updateQuest: (id: string, data: object) =>
    request<import('../types').Quest>(`/quests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  publishQuest: (id: string) =>
    request<import('../types').Quest>(`/quests/${id}/publish`, { method: 'POST' }),
  deleteQuest: (id: string) =>
    request<void>(`/quests/${id}`, { method: 'DELETE' }),
  getLeaderboard: (questId: string) =>
    request<import('../types').LeaderboardEntry[]>(`/quests/${questId}/leaderboard`),

  // Tasks
  addTask: (questId: string, data: object) =>
    request<import('../types').Task>(`/quests/${questId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (questId: string, taskId: string, data: object) =>
    request<import('../types').Task>(`/quests/${questId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (questId: string, taskId: string) =>
    request<void>(`/quests/${questId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Sessions
  startSession: (questId: string) =>
    request<import('../types').QuestSession>('/sessions', { method: 'POST', body: JSON.stringify({ questId }) }),
  getSession: (id: string) => request<import('../types').QuestSession>(`/sessions/${id}`),
  submitAnswer: (sessionId: string, taskId: string, answer: string) =>
    request<{ isCorrect: boolean; completed: boolean; nextTaskIndex: number }>(
      `/sessions/${sessionId}/answer`, { method: 'POST', body: JSON.stringify({ taskId, answer }) }
    ),
  getHistory: () => request<import('../types').QuestSession[]>('/sessions/history'),
};
