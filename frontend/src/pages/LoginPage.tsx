import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formStyle: React.CSSProperties = {
  maxWidth: 420,
  margin: '60px auto',
  background: 'var(--surface)',
  borderRadius: 'var(--radius)',
  padding: 32,
  boxShadow: 'var(--shadow)',
};

const inputWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 };
const label: React.CSSProperties = { fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 };
const btnPrimary: React.CSSProperties = {
  width: '100%', padding: '12px', background: 'var(--primary)', border: 'none',
  borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 15, marginTop: 8,
};
const errStyle: React.CSSProperties = {
  background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)',
  color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12,
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
    <div style={formStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24 }}>🗺️ Вход</h1>
      {error && <div style={errStyle}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={inputWrap}>
          <label style={label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div style={inputWrap}>
          <label style={label}>Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••" />
        </div>
        <button type="submit" style={btnPrimary} disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
        Нет аккаунта? <Link to="/register" style={{ color: 'var(--primary)' }}>Регистрация</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
        Тест: organizer@quest.ru / password123
      </p>
    </div>
  );
}

export { formStyle, inputWrap, label, btnPrimary, errStyle };
