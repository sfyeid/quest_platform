import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formStyle, inputWrap, label, btnPrimary, errStyle } from './LoginPage';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PLAYER' | 'ORGANIZER'>('PLAYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.register(email, password, name, role);
      login(res.token, res.user as Parameters<typeof login>[1]);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  return (
    <div style={formStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24 }}>📝 Регистрация</h1>
      {error && <div style={errStyle}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={inputWrap}>
          <label style={label}>Имя</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Иван Иванов" />
        </div>
        <div style={inputWrap}>
          <label style={label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div style={inputWrap}>
          <label style={label}>Пароль (минимум 6 символов)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>
        <div style={inputWrap}>
          <label style={label}>Роль</label>
          <select value={role} onChange={e => setRole(e.target.value as 'PLAYER' | 'ORGANIZER')}>
            <option value="PLAYER">🎮 Игрок — проходить квесты</option>
            <option value="ORGANIZER">🎯 Организатор — создавать квесты</option>
          </select>
        </div>
        <button type="submit" style={btnPrimary} disabled={loading}>
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--primary)' }}>Войти</Link>
      </p>
    </div>
  );
}
