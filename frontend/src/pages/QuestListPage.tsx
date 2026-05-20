import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Quest, QuestDifficulty } from '../types';

const diffColor: Record<QuestDifficulty, string> = {
  EASY: '#16a34a', MEDIUM: '#d97706', HARD: '#dc2626',
};
const diffLabel: Record<QuestDifficulty, string> = {
  EASY: 'Лёгкий', MEDIUM: 'Средний', HARD: 'Сложный',
};

export default function QuestListPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (difficulty) params.difficulty = difficulty;
    if (category) params.category = category;
    api.getQuests(params)
      .then(setQuests)
      .finally(() => setLoading(false));
  }, [difficulty, category]);

  const filtered = quests.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(quests.map(q => q.category))];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Квесты</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Исследуйте город, решайте задания у реальных точек на карте
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск квестов..."
          style={{ maxWidth: 280 }}
        />
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
          <option value="">Все сложности</option>
          <option value="EASY">Лёгкие</option>
          <option value="MEDIUM">Средние</option>
          <option value="HARD">Сложные</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
          <option value="">Все категории</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Квесты не найдены</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(quest => (
            <Link key={quest.id} to={`/quests/${quest.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 20,
                transition: 'border-color 0.15s',
                height: '100%',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-light)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    background: `${diffColor[quest.difficulty]}18`,
                    color: diffColor[quest.difficulty],
                    padding: '3px 9px',
                    borderRadius: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1px solid ${diffColor[quest.difficulty]}40`,
                  }}>
                    {diffLabel[quest.difficulty]}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    {quest._count?.tasks ?? 0} заданий
                  </span>
                </div>
                <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>{quest.title}</h3>
                <p style={{
                  color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 14,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {quest.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span>{quest.category}</span>
                  <span>{quest.creator.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
