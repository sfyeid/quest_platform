import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Quest } from '../types';

export default function MyQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMyQuests().then(setQuests).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить квест?')) return;
    try {
      await api.deleteQuest(id);
      setQuests(prev => prev.filter(q => q.id !== id));
    } catch (err) { alert(err instanceof Error ? err.message : 'Ошибка'); }
  };

  const statusColors: Record<string, string> = { DRAFT: '#94a3b8', PUBLISHED: '#10b981', ARCHIVED: '#f59e0b' };
  const statusLabels: Record<string, string> = { DRAFT: 'Черновик', PUBLISHED: 'Опубликован', ARCHIVED: 'Архив' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>🎯 Мои квесты</h1>
        <Link to="/quests/new" style={{
          padding: '10px 20px', background: 'var(--primary)', borderRadius: 8,
          color: '#fff', fontWeight: 600, display: 'inline-block',
        }}>
          ➕ Создать квест
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : quests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🗺️</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>У вас ещё нет квестов</p>
          <Link to="/quests/new" style={{ color: 'var(--primary)' }}>Создать первый квест →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quests.map(q => (
            <div key={q.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{
                    background: `${statusColors[q.status]}22`, color: statusColors[q.status],
                    padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>
                    {statusLabels[q.status]}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {q._count?.tasks ?? 0} заданий · {q._count?.sessions ?? 0} прохождений
                  </span>
                </div>
                <h3 style={{ marginBottom: 4 }}>{q.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{q.category}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/quests/${q.id}/edit`)} style={{
                  padding: '8px 14px', background: 'var(--surface2)', border: 'none',
                  borderRadius: 8, color: 'var(--text)', fontSize: 13,
                }}>
                  ✏️ Редактировать
                </button>
                <button onClick={() => handleDelete(q.id)} style={{
                  padding: '8px 14px', background: 'rgba(239,68,68,0.15)', border: 'none',
                  borderRadius: 8, color: '#fca5a5', fontSize: 13,
                }}>
                  🗑 Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
