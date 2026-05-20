import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useQuestWebSocket } from '../hooks/useQuestWebSocket';
import { QuestSession, Task } from '../types';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const doneIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function formatElapsed(startedAt: string): string {
  const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayQuestPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<QuestSession | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [elapsed, setElapsed] = useState('0:00');
  const [wsEvents, setWsEvents] = useState<string[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    api.getSession(sessionId).then(s => {
      setSession(s);
      setLoading(false);
    });
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => setElapsed(formatElapsed(session.startedAt)), 1000);
    return () => clearInterval(interval);
  }, [session]);

  const currentTask: Task | undefined = session?.quest.tasks[session.currentTaskIndex];

  const onWsEvent = useCallback((type: string, payload: Record<string, unknown>) => {
    if (type === 'player_joined' || type === 'player_left') {
      const msg = type === 'player_joined' ? '👤 Другой игрок присоединился' : '👤 Игрок вышел';
      setWsEvents(prev => [...prev.slice(-2), msg]);
    }
    if (type === 'progress_updated') {
      // Refresh session when another player progresses (team mode)
      if (sessionId) api.getSession(sessionId).then(setSession);
    }
  }, [sessionId]);

  useQuestWebSocket({
    questId: session?.questId ?? '',
    sessionId: sessionId ?? '',
    token,
    onEvent: {
      player_joined: (_p) => onWsEvent('player_joined', _p),
      player_left: (_p) => onWsEvent('player_left', _p),
      progress_updated: (_p) => onWsEvent('progress_updated', _p),
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !currentTask || !sessionId) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await api.submitAnswer(sessionId, currentTask.id, answer);
      if (result.completed) {
        setFeedback({ correct: true, message: '🎉 Поздравляем! Квест пройден!' });
        setTimeout(() => navigate(`/quests/${session.questId}`), 3000);
      } else if (result.isCorrect) {
        setFeedback({ correct: true, message: '✅ Верно! Переходи к следующей точке.' });
        setAnswer('');
        setShowHint(false);
        // Refresh session to get updated currentTaskIndex
        const updated = await api.getSession(sessionId);
        setSession(updated);
      } else {
        setFeedback({ correct: false, message: '❌ Неверно. Попробуй ещё раз!' });
      }
    } catch (err) {
      setFeedback({ correct: false, message: err instanceof Error ? err.message : 'Ошибка' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Загрузка...</div>;
  if (!session) return <div>Сессия не найдена</div>;
  if (session.status === 'COMPLETED') {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🏆</div>
        <h1 style={{ marginBottom: 12 }}>Квест завершён!</h1>
        <p style={{ color: 'var(--text-muted)' }}>Отличная работа!</p>
      </div>
    );
  }

  const tasks = session.quest.tasks;
  const routePoints: [number, number][] = tasks.map(t => [t.latitude, t.longitude]);
  const mapCenter: [number, number] = currentTask
    ? [currentTask.latitude, currentTask.longitude]
    : [55.751, 37.617];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, height: 'calc(100vh - 140px)' }}>
      {/* Map */}
      <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={routePoints} color="#6366f1" weight={2} dashArray="6,8" />
          {tasks.map((task, i) => {
            const done = i < session.currentTaskIndex;
            const active = i === session.currentTaskIndex;
            return (
              <Marker
                key={task.id}
                position={[task.latitude, task.longitude]}
                icon={active ? activeIcon : done ? doneIcon : L.Icon.Default.prototype}
                opacity={done ? 0.6 : 1}
              >
                <Popup>
                  <b>{done ? '✅' : active ? '📍' : '🔒'} Точка {i + 1}</b>
                  {done && <p style={{ fontSize: 12 }}>Выполнено</p>}
                  {active && <p style={{ fontSize: 12 }}>Текущее задание</p>}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Right panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {/* Progress header */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15 }}>{session.quest.title}</h3>
            <span style={{ color: 'var(--secondary)', fontFamily: 'monospace', fontWeight: 700 }}>⏱ {elapsed}</span>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--primary)',
              height: '100%',
              width: `${(session.currentTaskIndex / tasks.length) * 100}%`,
              transition: 'width 0.5s',
              borderRadius: 4,
            }} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
            Задание {session.currentTaskIndex + 1} из {tasks.length}
          </p>
        </div>

        {/* Current task */}
        {currentTask && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)', flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              📍 Задание {session.currentTaskIndex + 1}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>{currentTask.description}</p>

            {feedback && (
              <div style={{
                background: feedback.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${feedback.correct ? 'var(--success)' : 'var(--danger)'}`,
                borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 16,
                color: feedback.correct ? '#6ee7b7' : '#fca5a5',
              }}>
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Введи ответ..."
                style={{ marginBottom: 12 }}
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting || !answer.trim()}
                style={{
                  width: '100%', padding: 12,
                  background: 'var(--primary)', border: 'none',
                  borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 15,
                  opacity: submitting || !answer.trim() ? 0.6 : 1,
                }}
              >
                {submitting ? 'Проверка...' : 'Отправить ответ'}
              </button>
            </form>

            {currentTask.hint && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setShowHint(!showHint)}
                  style={{
                    background: 'none', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '8px 14px',
                    color: 'var(--text-muted)', fontSize: 13, width: '100%',
                  }}
                >
                  💡 {showHint ? 'Скрыть подсказку' : 'Показать подсказку'}
                </button>
                {showHint && (
                  <div style={{
                    marginTop: 8, background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fcd34d',
                  }}>
                    {currentTask.hint}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WS events */}
        {wsEvents.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 16px', border: '1px solid var(--border)' }}>
            {wsEvents.map((e, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
