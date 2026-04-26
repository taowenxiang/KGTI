import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReviewPage from './pages/admin/AdminReviewPage';
import QuestionManager from './pages/admin/QuestionManager';
import PersonalityManager from './pages/admin/PersonalityManager';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreatorSubmissions from './pages/creator/CreatorSubmissions';
import CreatorStatsPage from './pages/creator/CreatorStatsPage';
import TemplateBuilder from './pages/creator/TemplateBuilder';
import SubmitPage from './pages/creator/SubmitPage';
import PersonalityDetailPage from './pages/PersonalityDetailPage';
import HistoryPage from './pages/HistoryPage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test/:templateId" element={<TestPage />} />
          <Route path="/result/:resultId" element={<ResultPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/personality/:id" element={<PersonalityDetailPage />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <QuestionManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/personalities"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <PersonalityManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator"
            element={
              <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/submit"
            element={
              <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                <SubmitPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/submissions"
            element={
              <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                <CreatorSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/stats"
            element={
              <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                <CreatorStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/creator/template"
            element={
              <ProtectedRoute roles={['CREATOR', 'ADMIN']}>
                <TemplateBuilder />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
