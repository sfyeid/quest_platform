import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { Task } from '../types';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 };
const lbl: React.CSSProperties = { fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 };

export default function QuestEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [questId, setQuestId] = useState<string | null>(id ?? null);
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [taskForm, setTaskForm] = useState({ description: '', answer: '', hint: '', taskType: 'TEXT' as Task['taskType'] });

  useEffect(() => {
    if (!isEdit || !id) return;
    api.getQuest(id).then(q => {
      setTitle(q.title); setDescription(q.description);
      setCategory(q.category); setDifficulty(q.difficulty);
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
      alert('Квест сохранён');
    } catch (err) { alert(err instanceof Error ? err.message : 'Ошибка'); }
    finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!questId) { alert('Сначала сохраните квест'); return; }
    if (tasks.length === 0) { alert('Добавьте хотя бы одно задание'); return; }
    try { await api.publishQuest(questId); navigate(`/quests/${questId}`); }
    catch (err) { alert(err instanceof Error ? err.message : 'Ошибка'); }
  };

  const handleAddTask = async () => {
    if (!questId || !pendingPoint) { alert('Сохраните квест и кликните по карте'); return; }
    if (!taskForm.description || !taskForm.answer) { alert('Заполните описание и ответ'); return; }
    try {
      const task = await api.addTask(questId, {
        ...taskForm, orderIndex: tasks.length,
        latitude: pendingPoint.lat, longitude: pendingPoint.lng,
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

  const center: [number, number] = tasks.length > 0 ? [tasks[0].latitude, tasks[0].longitude] : [55.751, 37.617];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{isEdit ? 'Редактирование квеста' : 'Новый квест'}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSaveQuest} disabled={saving} style={{
            padding: '9px 18px', background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text)', fontWeight: 600, fontSize: 14,
          }}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          {questId && (
            <button onClick={handlePublish} style={{
              padding: '9px 18px', background: 'var(--primary)', border: 'none',
              borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14,
            }}>
              Опубликовать
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, border: '1px solid var(--border)', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Основное</h3>
            <div style={field}><label style={lbl}>Название</label><input value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div style={field}><label style={lbl}>Описание</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={field}><label style={lbl}>Категория</label><input value={category} onChange={e => setCategory(e.target.value)} placeholder="История" /></div>
              <div style={field}>
                <label style={lbl}>Сложность</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value as typeof difficulty)}>
                  <option value="EASY">Лёгкий</option>
                  <option value="MEDIUM">Средний</option>
                  <option value="HARD">Сложный</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, border: '1px solid var(--border)', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              {pendingPoint ? 'Новое задание' : 'Кликните по карте чтобы добавить задание'}
            </h3>
            {pendingPoint && (
              <>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                  {pendingPoint.lat.toFixed(4)}, {pendingPoint.lng.toFixed(4)}
                </p>
                <div style={field}><label style={lbl}>Описание задания</label>
                  <textarea value={taskForm.description} rows={2} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
                <div style={field}><label style={lbl}>Правильный ответ</label>
                  <input value={taskForm.answer} onChange={e => setTaskForm(f => ({ ...f, answer: e.target.value }))} />
                </div>
                <div style={field}><label style={lbl}>Подсказка (необязательно)</label>
                  <input value={taskForm.hint} onChange={e => setTaskForm(f => ({ ...f, hint: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleAddTask} style={{ flex: 1, padding: '9px', background: '#16a34a', border: 'none', borderRadius: 7, color: '#fff', fontWeight: 600 }}>
                    Добавить
                  </button>
                  <button onClick={() => setPendingPoint(null)} style={{ padding: '9px 14px', background: 'var(--surface2)', border: 'none', borderRadius: 7, color: 'var(--text)' }}>
                    Отмена
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Задания ({tasks.length})</h3>
            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Пока нет заданий</p>
            ) : tasks.map((task, i) => (
              <div key={task.id} style={{
                background: 'var(--surface2)', borderRadius: 7, padding: '10px 12px',
                marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--primary-light)', fontWeight: 600, marginBottom: 3 }}>Точка {i + 1}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{task.description.slice(0, 60)}...</div>
                </div>
                <button onClick={() => handleDeleteTask(task.id)} style={{
                  background: 'rgba(220,38,38,0.1)', border: 'none', borderRadius: 5,
                  color: '#fca5a5', padding: '3px 8px', fontSize: 12, marginLeft: 8,
                }}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', height: 560 }}>
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={(lat, lng) => { setPendingPoint({ lat, lng }); setTaskForm({ description: '', answer: '', hint: '', taskType: 'TEXT' }); }} />
            {tasks.map(task => <Marker key={task.id} position={[task.latitude, task.longitude]} />)}
            {pendingPoint && <Marker position={[pendingPoint.lat, pendingPoint.lng]} opacity={0.6} />}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
