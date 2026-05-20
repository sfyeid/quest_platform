import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Quest } from '../types';

const statusColors: Record<string, string> = { DRAFT: '#64748b', PUBLISHED: '#16a34a', ARCHIVED: '#d97706' };
const statusLabels: Record<string, string> = { DRAFT: 'Черновик', PUBLISHED: 'Опубликован', ARCHIVED: 'Архив' };

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Мои квесты</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Управление созданными квестами</p>
        </div>
        <Link to="/quests/new" style={{
          padding: '9px 18px', background: 'var(--primary)', borderRadius: 8,
          color: '#fff', fontWeight: 600, fontSize: 14,
        }}>
          Создать квест
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : quests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: 16 }}>У вас ещё нет квестов</p>
          <Link to="/quests/new" style={{ color: 'var(--primary-light)' }}>Создать первый квест</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quests.map(q => (
            <div key={q.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '16px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                  <span style={{
                    background: `${statusColors[q.status]}18`, color: statusColors[q.status],
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${statusColors[q.status]}40`,
                  }}>
                    {statusLabels[q.status]}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {q._count?.tasks ?? 0} заданий · {q._count?.sessions ?? 0} прохождений
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{q.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{q.category}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigate(`/quests/${q.id}/edit`)} style={{
                  padding: '7px 14px', background: 'var(--surface2)', border: 'none',
                  borderRadius: 7, color: 'var(--text)', fontSize: 13,
                }}>
                  Редактировать
                </button>
                <button onClick={() => handleDelete(q.id)} style={{
                  padding: '7px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: 7, color: '#fca5a5', fontSize: 13,
                }}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
