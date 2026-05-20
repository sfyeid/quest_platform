import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formWrap, fieldWrap, labelStyle, submitBtn, errorBox } from './LoginPage';

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
    <div style={formWrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Регистрация</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 22 }}>
        Создайте аккаунт для участия в квестах
      </p>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Имя</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="Иван Иванов" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Минимум 6 символов" />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Роль</label>
          <select value={role} onChange={e => setRole(e.target.value as 'PLAYER' | 'ORGANIZER')}>
            <option value="PLAYER">Игрок — проходить квесты</option>
            <option value="ORGANIZER">Организатор — создавать квесты</option>
          </select>
        </div>
        <button type="submit" style={submitBtn} disabled={loading}>
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 18, color: 'var(--text-muted)', fontSize: 13 }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--primary-light)' }}>Войти</Link>
      </p>
    </div>
  );
}
