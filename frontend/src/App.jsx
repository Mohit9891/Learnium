import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
          <Route path="/exams" element={<ExamSelect />} />
          <Route path="/exams/:examId/subjects" element={<SubjectSelect />} />
          <Route path="/subjects/:subjectId/chapters" element={<ChapterSelect />} />
          <Route path="/chapters/:chapterId/solve" element={<Solve />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mistakes" element={<MistakeNotebook />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;