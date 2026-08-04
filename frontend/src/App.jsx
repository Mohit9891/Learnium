import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ExamSelect from './pages/ExamSelect';
import SubjectSelect from './pages/SubjectSelect';
import ChapterSelect from './pages/ChapterSelect';
import Solve from './pages/Solve';
import Dashboard from './pages/Dashboard';
import MistakeNotebook from './pages/MistakeNotebook';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public — anyone can browse and solve without signing in.
              Attempts made while logged out aren't tracked (see backend
              optionalAuthMiddleware), but the solving experience works. */}
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;