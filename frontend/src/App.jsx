import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RequireAdmin from './components/RequireAdmin';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ExamSelect from './pages/ExamSelect';
import SubjectSelect from './pages/SubjectSelect';
import ChapterSelect from './pages/ChapterSelect';
import Solve from './pages/Solve';
import Dashboard from './pages/Dashboard';
import MistakeNotebook from './pages/MistakeNotebook';
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
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public — anyone can browse and solve without signing in.
              Anonymous attempts are graded but not stored (tracked:false);
              sign-in enables progress, streaks, bookmarks, and mistakes. */}
          <Route path="/exams" element={<ExamSelect />} />
          <Route path="/exams/:examId/subjects" element={<SubjectSelect />} />
          <Route path="/subjects/:subjectId/chapters" element={<ChapterSelect />} />
          <Route path="/chapters/:chapterId/solve" element={<Solve />} />

          {/* Protected — these need a persistent identity to mean anything */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mistakes"
            element={
              <ProtectedRoute>
                <MistakeNotebook />
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
