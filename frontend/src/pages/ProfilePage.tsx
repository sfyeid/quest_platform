import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export default function ProfilePage() {
  const { user: authUser, login, token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.getMe().then(u => { setUser(u); setName(u.name); setEmail(u.email); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateMe({ name, email });
      setUser(updated);
      if (authUser && token) login(token, { ...authUser, name: updated.name, email: updated.email });
      setEditing(false);
      setMsg('Профиль обновлён!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) { setMsg(err instanceof Error ? err.message : 'Ошибка'); }
    finally { setSaving(false); }
  };

  if (!user) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Загрузка...</div>;

  const roleLabel = user.role === 'ORGANIZER' ? '🎯 Организатор' : '🎮 Игрок';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>👤 Профиль</h1>

      {msg && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#6ee7b7',
        }}>
          {msg}
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 32, border: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 12px',
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{roleLabel}</div>
        </div>

        {!editing ? (
          <div>
            <Row label="Имя" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Роль" value={roleLabel} />
            <Row label="Дата регистрации" value={new Date(user.createdAt).toLocaleDateString('ru-RU')} />
            <button onClick={() => setEditing(true)} style={{
              width: '100%', padding: 12, marginTop: 16,
              background: 'var(--primary)', border: 'none', borderRadius: 8,
              color: '#fff', fontWeight: 600,
            }}>
              ✏️ Редактировать
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Имя</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: 12, background: 'var(--primary)', border: 'none',
                borderRadius: 8, color: '#fff', fontWeight: 600,
              }}>
                {saving ? 'Сохранение...' : '💾 Сохранить'}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={{
                flex: 1, padding: 12, background: 'var(--surface2)', border: 'none',
                borderRadius: 8, color: 'var(--text)', fontWeight: 600,
              }}>
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
