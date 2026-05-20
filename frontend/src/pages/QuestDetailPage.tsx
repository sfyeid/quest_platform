import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { Quest, LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';

// Fix default Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getQuest(id), api.getLeaderboard(id)])
      .then(([q, lb]) => { setQuest(q); setLeaderboard(lb); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    if (!token) { navigate('/login'); return; }
    if (!quest) return;
    setStarting(true);
    try {
      const session = await api.startSession(quest.id);
      navigate(`/play/${session.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally { setStarting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Загрузка...</div>;
  if (!quest) return <div>Квест не найден</div>;

  const center: [number, number] = quest.tasks.length > 0
    ? [quest.tasks[0].latitude, quest.tasks[0].longitude]
    : [55.751, 37.617];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
      {/* Left */}
      <div>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 32, marginBottom: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Badge color="#6366f1">{quest.category}</Badge>
            <Badge color={{ EASY: '#10b981', MEDIUM: '#f59e0b', HARD: '#ef4444' }[quest.difficulty]}>
              {{ EASY: 'Лёгкий', MEDIUM: 'Средний', HARD: 'Сложный' }[quest.difficulty]}
            </Badge>
            <Badge color="#64748b">{quest._count?.tasks ?? quest.tasks.length} заданий</Badge>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>{quest.title}</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{quest.description}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Автор: {quest.creator.name}</p>
        </div>

        {/* Map */}
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', height: 400 }}>
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {quest.tasks.map((task, i) => (
              <Marker key={task.id} position={[task.latitude, task.longitude]}>
                <Popup>
                  <b>Задание {i + 1}</b>
                  {user?.role === 'ORGANIZER' && quest.creatorId === user.id && (
                    <p style={{ marginTop: 4, fontSize: 12 }}>{task.description}</p>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Right sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Start button */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
          <h3 style={{ marginBottom: 8 }}>Готов к приключению?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            {quest.tasks.length} точек на карте города. Удачи!
          </p>
          <button
            onClick={handleStart}
            disabled={starting}
            style={{
              width: '100%', padding: 14,
              background: 'var(--primary)', border: 'none',
              borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 16,
              opacity: starting ? 0.7 : 1,
            }}
          >
            {starting ? 'Запуск...' : '▶ Начать квест'}
          </button>
        </div>

        {/* Leaderboard */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: 16 }}>🏆 Таблица лидеров</h3>
          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Пока никто не прошёл этот квест</p>
          ) : (
            leaderboard.slice(0, 10).map((entry, i) => (
              <div key={entry.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0', borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 14,
              }}>
                <span>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}{' '}
                  {entry.user.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(entry.totalTimeSeconds)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: `${color}22`, color, padding: '4px 12px',
      borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>
      {children}
    </span>
  );
}
