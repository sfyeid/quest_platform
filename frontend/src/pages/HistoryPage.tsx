import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { QuestSession } from '../types';

function formatTime(seconds?: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} мин ${s} сек`;
}

const statusLabel: Record<string, string> = {
  ACTIVE: '▶ В процессе',
  COMPLETED: '✅ Завершён',
  ABANDONED: '❌ Прерван',
};
const statusColor: Record<string, string> = {
  ACTIVE: '#6366f1',
  COMPLETED: '#10b981',
  ABANDONED: '#ef4444',
};

export default function HistoryPage() {
  const [history, setHistory] = useState<QuestSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory().then(setHistory).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>📜 История прохождений</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Вы ещё не проходили ни одного квеста</p>
          <Link to="/" style={{ color: 'var(--primary)' }}>Найти квест →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map(session => (
            <div key={session.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ marginBottom: 6 }}>{session.quest.title}</h3>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                  <span>{new Date(session.startedAt).toLocaleDateString('ru-RU')}</span>
                  <span>⏱ {formatTime(session.totalTimeSeconds)}</span>
                  <span style={{ color: statusColor[session.status] }}>{statusLabel[session.status]}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {session.status === 'ACTIVE' && (
                  <Link to={`/play/${session.id}`} style={{
                    padding: '8px 16px', background: 'var(--primary)', borderRadius: 8,
                    color: '#fff', fontSize: 13, fontWeight: 600,
                  }}>
                    ▶ Продолжить
                  </Link>
                )}
                <Link to={`/quests/${session.questId}`} style={{
                  padding: '8px 16px', background: 'var(--surface2)', borderRadius: 8,
                  color: 'var(--text)', fontSize: 13,
                }}>
                  Квест
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
