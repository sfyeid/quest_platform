import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { Quest, LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';

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

const diffColor: Record<string, string> = { EASY: '#16a34a', MEDIUM: '#d97706', HARD: '#dc2626' };
const diffLabel: Record<string, string> = { EASY: 'Лёгкий', MEDIUM: 'Средний', HARD: 'Сложный' };

export default function QuestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
      <div>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Tag color={diffColor[quest.difficulty]}>{diffLabel[quest.difficulty]}</Tag>
            <Tag color="var(--primary-light)">{quest.category}</Tag>
            <Tag color="var(--text-muted)">{(quest._count?.tasks ?? quest.tasks.length)} заданий</Tag>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>{quest.title}</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 14 }}>{quest.description}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Автор: {quest.creator.name}</p>
        </div>

        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', height: 380 }}>
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {quest.tasks.map((task, i) => (
              <Marker key={task.id} position={[task.latitude, task.longitude]}>
                <Popup><b>Точка {i + 1}</b></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            {quest.tasks.length} точек на карте города
          </p>
          <button
            onClick={handleStart}
            disabled={starting}
            style={{
              width: '100%', padding: 12,
              background: 'var(--primary)', border: 'none',
              borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 15,
              opacity: starting ? 0.7 : 1,
            }}
          >
            {starting ? 'Запуск...' : 'Начать квест'}
          </button>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: 14, fontSize: 15, fontWeight: 600 }}>Таблица лидеров</h3>
          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Пока никто не прошёл этот квест</p>
          ) : (
            leaderboard.slice(0, 10).map((entry, i) => (
              <div key={entry.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < leaderboard.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 13,
              }}>
                <span style={{ color: i < 3 ? 'var(--text)' : 'var(--text-muted)' }}>
                  {i + 1}. {entry.user.name}
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
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

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      background: `${color}18`, color,
      padding: '3px 9px', borderRadius: 5,
      fontSize: 12, fontWeight: 600,
      border: `1px solid ${color}40`,
    }}>
      {children}
    </span>
  );
}
