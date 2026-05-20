import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Quest, QuestDifficulty } from '../types';

const diffColor: Record<QuestDifficulty, string> = {
  EASY: '#10b981', MEDIUM: '#f59e0b', HARD: '#ef4444',
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
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(99,102,241,0.15) 100%)',
        borderRadius: 'var(--radius)',
        padding: '48px 32px',
        marginBottom: 32,
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
          🗺️ Интерактивные квесты<br />
          <span style={{ color: 'var(--primary)' }}>по городу</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 18, marginBottom: 24 }}>
          Исследуй город, решай загадки, побивай рекорды
        </p>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Поиск квестов..."
          style={{ maxWidth: 400, margin: '0 auto', display: 'block' }}
        />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Все сложности</option>
          <option value="EASY">Лёгкие</option>
          <option value="MEDIUM">Средние</option>
          <option value="HARD">Сложные</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">Все категории</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Квесты не найдены
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(quest => (
            <Link key={quest.id} to={`/quests/${quest.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 24,
                transition: 'transform 0.15s, border-color 0.15s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    background: `${diffColor[quest.difficulty]}22`,
                    color: diffColor[quest.difficulty],
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {diffLabel[quest.difficulty]}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    📍 {quest._count?.tasks ?? 0} точек
                  </span>
                </div>
                <h3 style={{ marginBottom: 8, fontSize: 17 }}>{quest.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginBottom: 16,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {quest.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>🏷️ {quest.category}</span>
                  <span>👤 {quest.creator.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
