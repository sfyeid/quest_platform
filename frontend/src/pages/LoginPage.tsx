import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const formWrap: React.CSSProperties = {
  maxWidth: 400,
  margin: '60px auto',
  background: 'var(--surface)',
  borderRadius: 'var(--radius)',
  padding: 32,
  border: '1px solid var(--border)',
};
export const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 };
export const labelStyle: React.CSSProperties = { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 };
export const submitBtn: React.CSSProperties = {
  width: '100%', padding: '11px', background: 'var(--primary)', border: 'none',
  borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14, marginTop: 6,
};
export const errorBox: React.CSSProperties = {
  background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)',
  color: '#fca5a5', borderRadius: 7, padding: '9px 12px', fontSize: 13, marginBottom: 12,
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.token, res.user as Parameters<typeof login>[1]);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally { setLoading(false); }
  };

  return (
    <div style={formWrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Вход</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>
        Войдите, чтобы проходить квесты
      </p>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••" />
        </div>
        <button type="submit" style={submitBtn} disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--text-muted)', fontSize: 13 }}>
        Нет аккаунта? <Link to="/register" style={{ color: 'var(--primary-light)' }}>Зарегистрироваться</Link>
      </p>
      <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 7, fontSize: 12, color: 'var(--text-muted)' }}>
        Демо: organizer@quest.ru / password123
      </div>
    </div>
  );
}
