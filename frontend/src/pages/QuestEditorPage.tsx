import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

const inputWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 };
const labelStyle: React.CSSProperties = { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 };

export default function QuestEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [questId, setQuestId] = useState<string | null>(id ?? null);
  const [activeTaskEdit, setActiveTaskEdit] = useState<number | null>(null);
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [taskForm, setTaskForm] = useState({ description: '', answer: '', hint: '', taskType: 'TEXT' as Task['taskType'] });

  useEffect(() => {
    if (!isEdit || !id) return;
    api.getQuest(id).then(q => {
      setTitle(q.title);
      setDescription(q.description);
      setCategory(q.category);
      setDifficulty(q.difficulty);
      setTasks(q.tasks);
    });
  }, [id, isEdit]);

  const handleSaveQuest = async () => {
    setSaving(true);
    try {
      if (questId) {
        await api.updateQuest(questId, { title, description, category, difficulty });
      } else {
        const q = await api.createQuest({ title, description, category, difficulty });
        setQuestId(q.id);
        navigate(`/quests/${q.id}/edit`, { replace: true });
      }
      alert('Квест сохранён!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка');
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!questId) { alert('Сначала сохрани квест'); return; }
    if (tasks.length === 0) { alert('Добавь хотя бы одно задание'); return; }
    try {
      await api.publishQuest(questId);
      navigate(`/quests/${questId}`);
    } catch (err) { alert(err instanceof Error ? err.message : 'Ошибка'); }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPendingPoint({ lat, lng });
    setTaskForm({ description: '', answer: '', hint: '', taskType: 'TEXT' });
    setActiveTaskEdit(null);
  };

  const handleAddTask = async () => {
    if (!questId || !pendingPoint) { alert('Сначала сохрани квест и кликни по карте'); return; }
    if (!taskForm.description || !taskForm.answer) { alert('Заполни описание и ответ'); return; }
    try {
      const task = await api.addTask(questId, {
        ...taskForm,
        orderIndex: tasks.length,
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
      });
      setTasks(prev => [...prev, task]);
      setPendingPoint(null);
    } catch (err) { alert(err instanceof Error ? err.message : 'Ошибка'); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!questId || !confirm('Удалить задание?')) return;
    try {
      await api.deleteTask(questId, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) { alert(err instanceof Error ? err.message : 'Ошибка'); }
  };

  const center: [number, number] = tasks.length > 0
    ? [tasks[0].latitude, tasks[0].longitude]
    : [55.751, 37.617];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>{isEdit ? '✏️ Редактирование квеста' : '➕ Новый квест'}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSaveQuest} disabled={saving} style={{
            padding: '10px 20px', background: 'var(--surface2)', border: 'none',
            borderRadius: 8, color: 'var(--text)', fontWeight: 600,
          }}>
            {saving ? 'Сохранение...' : '💾 Сохранить'}
          </button>
          {questId && (
            <button onClick={handlePublish} style={{
              padding: '10px 20px', background: 'var(--primary)', border: 'none',
              borderRadius: 8, color: '#fff', fontWeight: 600,
            }}>
              🚀 Опубликовать
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Form */}
        <div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>Основная информация</h3>
            <div style={inputWrap}><label style={labelStyle}>Название</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Название квеста" />
            </div>
            <div style={inputWrap}><label style={labelStyle}>Описание</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Описание квеста" rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={inputWrap}><label style={labelStyle}>Категория</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="История" />
              </div>
              <div style={inputWrap}><label style={labelStyle}>Сложность</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="EASY">Лёгкий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="HARD">Сложный</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add task form */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>
              {pendingPoint ? '📍 Новое задание' : '🗺️ Кликни по карте для добавления задания'}
            </h3>
            {pendingPoint && (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Координаты: {pendingPoint.lat.toFixed(4)}, {pendingPoint.lng.toFixed(4)}
                </p>
                <div style={inputWrap}><label style={labelStyle}>Описание задания</label>
                  <textarea value={taskForm.description} rows={2}
                    onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Что нужно найти или сделать?" style={{ resize: 'vertical' }} />
                </div>
                <div style={inputWrap}><label style={labelStyle}>Правильный ответ</label>
                  <input value={taskForm.answer} onChange={e => setTaskForm(f => ({ ...f, answer: e.target.value }))} placeholder="Ответ" />
                </div>
                <div style={inputWrap}><label style={labelStyle}>Подсказка (необязательно)</label>
                  <input value={taskForm.hint} onChange={e => setTaskForm(f => ({ ...f, hint: e.target.value }))} placeholder="Подсказка" />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleAddTask} style={{ flex: 1, padding: '10px', background: 'var(--success)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600 }}>
                    ✅ Добавить
                  </button>
                  <button onClick={() => setPendingPoint(null)} style={{ padding: '10px 14px', background: 'var(--surface2)', border: 'none', borderRadius: 8, color: 'var(--text)' }}>
                    ✕
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Task list */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 24, border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: 12 }}>📋 Задания ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Кликни по карте чтобы добавить первое задание</p>
            ) : (
              tasks.map((task, i) => (
                <div key={task.id} style={{
                  background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px',
                  marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 4 }}>Задание {i + 1}</div>
                    <div style={{ fontSize: 13 }}>{task.description}</div>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)} style={{
                    background: 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 6,
                    color: '#fca5a5', padding: '4px 8px', fontSize: 12, marginLeft: 8,
                  }}>
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', height: 600 }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={handleMapClick} />
            {tasks.map((task, i) => (
              <Marker key={task.id} position={[task.latitude, task.longitude]}>
              </Marker>
            ))}
            {pendingPoint && <Marker position={[pendingPoint.lat, pendingPoint.lng]} opacity={0.7} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
