import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 17 }}>
          <span style={{ color: 'var(--primary-light)', letterSpacing: -0.5 }}>Quest</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Platform</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavLink to="/" active={isActive('/')}>Квесты</NavLink>
          {user && <NavLink to="/history" active={isActive('/history')}>История</NavLink>}
          {isOrganizer && <NavLink to="/my-quests" active={isActive('/my-quests')}>Мои квесты</NavLink>}
          {user ? (
            <>
              <NavLink to="/profile" active={isActive('/profile')}>{user.name}</NavLink>
              <button onClick={handleLogout} style={outlineBtn}>Выйти</button>
            </>
          ) : (
            <>
              <NavLink to="/login" active={isActive('/login')}>Войти</NavLink>
              <Link to="/register" style={primaryBtn}>Регистрация</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, maxWidth: 1160, width: '100%', margin: '0 auto', padding: '28px 24px' }}>
        <Outlet />
      </main>

      <footer style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        padding: '14px',
        color: 'var(--text-muted)',
        fontSize: 12,
      }}>
        Quest Platform — РТУ МИРЭА, курсовая работа Петрушкина Д.О., 2026
      </footer>
    </div>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link to={to} style={{
      padding: '6px 12px',
      borderRadius: 7,
      color: active ? 'var(--text)' : 'var(--text-muted)',
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      background: active ? 'var(--surface2)' : 'transparent',
      transition: 'all 0.15s',
    }}>
      {children}
    </Link>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '7px 14px',
  background: 'var(--primary)',
  border: 'none',
  borderRadius: 7,
  color: '#fff',
  fontSize: 14,
  fontWeight: 500,
};

const outlineBtn: React.CSSProperties = {
  padding: '7px 14px',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 7,
  color: 'var(--text-muted)',
  fontSize: 14,
};
