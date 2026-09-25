import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { DashboardLayout } from './components/layout/DashboardLayout.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { TasksPage } from './pages/TasksPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage.js';
import { GoalsPage } from './pages/GoalsPage.js';
import { CalendarPage } from './pages/CalendarPage.js';
import { AIChatPage } from './pages/AIChatPage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { KnowledgePage } from './pages/KnowledgePage.js';
import { NotesPage } from './pages/NotesPage.js';
import { DecisionsPage } from './pages/DecisionsPage.js';
import { InsightsPage } from './pages/InsightsPage.js';
import { ActivityPage } from './pages/ActivityPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nexus-950 flex items-center justify-center text-slate-400 text-xs">
        Loading NEXUS...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Dashboard Shell */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/ai" element={<AIChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/decisions" element={<DecisionsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
