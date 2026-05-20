import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/ui/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuestListPage from './pages/QuestListPage';
import QuestDetailPage from './pages/QuestDetailPage';
import PlayQuestPage from './pages/PlayQuestPage';
import MyQuestsPage from './pages/MyQuestsPage';
import QuestEditorPage from './pages/QuestEditorPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const { token, isOrganizer } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!isOrganizer) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<QuestListPage />} />
        <Route path="/quests/:id" element={<QuestDetailPage />} />
        <Route path="/play/:sessionId" element={<PrivateRoute><PlayQuestPage /></PrivateRoute>} />
        <Route path="/my-quests" element={<OrganizerRoute><MyQuestsPage /></OrganizerRoute>} />
        <Route path="/quests/new" element={<OrganizerRoute><QuestEditorPage /></OrganizerRoute>} />
        <Route path="/quests/:id/edit" element={<OrganizerRoute><QuestEditorPage /></OrganizerRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
