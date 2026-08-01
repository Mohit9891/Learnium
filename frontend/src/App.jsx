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

          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <ExamSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exams/:examId/subjects"
            element={
              <ProtectedRoute>
                <SubjectSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects/:subjectId/chapters"
            element={
              <ProtectedRoute>
                <ChapterSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chapters/:chapterId/solve"
            element={
              <ProtectedRoute>
                <Solve />
              </ProtectedRoute>
            }
          />
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