import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 20 }}>
          <span style={{ fontSize: 28 }}>🗺️</span>
          <span style={{ color: 'var(--primary)' }}>Quest</span>
          <span>Platform</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/">Квесты</NavLink>
          {user && <NavLink to="/history">История</NavLink>}
          {isOrganizer && <NavLink to="/my-quests">Мои квесты</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile">👤 {user.name}</NavLink>
              <button onClick={handleLogout} style={btnStyle('var(--surface2)')}>Выйти</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Войти</NavLink>
              <Link to="/register" style={btnStyle('var(--primary)')}>Регистрация</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '24px 24px' }}>
        <Outlet />
      </main>

      <footer style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        padding: '16px',
        color: 'var(--text-muted)',
        fontSize: 13,
      }}>
        Quest Platform © 2026 — МИРЭА, курсовая работа Петрушкина Д.О.
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} style={{
      padding: '8px 14px',
      borderRadius: 8,
      color: 'var(--text)',
      fontSize: 14,
      fontWeight: 500,
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </Link>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '8px 16px',
    background: bg,
    border: 'none',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 14,
    fontWeight: 500,
  };
}
