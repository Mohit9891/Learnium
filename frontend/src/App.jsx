import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAdmin from './components/RequireAdmin';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import ExamSelect from './pages/ExamSelect';
import SubjectSelect from './pages/SubjectSelect';
import ChapterSelect from './pages/ChapterSelect';
import Solve from './pages/Solve';
import Dashboard from './pages/Dashboard';
import MistakeNotebook from './pages/MistakeNotebook';
import PerformanceAnalysis from './pages/PerformanceAnalysis';
import Suggestions from './pages/Suggestions';
import MockTests from './pages/MockTests';
import MockRunner from './pages/MockRunner';
import MockResult from './pages/MockResult';
import PYQExplorer from './pages/PYQExplorer';
import RevisionPlanner from './pages/RevisionPlanner';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import AdminImport from './pages/admin/AdminImport';

function NotFound() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display font-bold text-heading-xl text-ink-deep mb-2">Page not found</p>
        <Link to="/" className="text-violet font-medium">
          ← Back home
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public — anyone can browse and solve without signing in.
              Anonymous attempts are graded but not stored (tracked:false);
              sign-in enables progress, streaks, bookmarks, and mistakes. */}
          <Route path="/exams" element={<ExamSelect />} />
          <Route path="/exams/:examId/subjects" element={<SubjectSelect />} />
          <Route path="/subjects/:subjectId/chapters" element={<ChapterSelect />} />
          <Route path="/chapters/:chapterId/solve" element={<Solve />} />

          {/* Protected — study shell with sidebar + top bar + mobile tabs */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Dashboard />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mistakes"
            element={
              <ProtectedRoute>
                <AppShell>
                  <MistakeNotebook />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AppShell>
                  <PerformanceAnalysis />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/suggestions"
            element={
              <ProtectedRoute>
                <AppShell>
                  <Suggestions />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mocks"
            element={
              <ProtectedRoute>
                <AppShell>
                  <MockTests />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mocks/run"
            element={
              <ProtectedRoute>
                <MockRunner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mocks/result"
            element={
              <ProtectedRoute>
                <MockResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pyq"
            element={
              <ProtectedRoute>
                <AppShell>
                  <PYQExplorer />
                </AppShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/revision"
            element={
              <ProtectedRoute>
                <AppShell>
                  <RevisionPlanner />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Admin — requires role=admin (see RequireAdmin + ADMIN_EMAILS bootstrap) */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="import" element={<AdminImport />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
