import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import api from '../api/axios';

const COUNTS = [10, 20, 30];

export default function MockTests() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/exams')
      .then((res) => {
        setExams(res.data.exams || []);
        if (res.data.exams?.length) setExamId(res.data.exams[0]._id);
      })
      .catch(() => setError('Could not load exams.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!examId) return;
    api
      .get(`/exams/${examId}/subjects`)
      .then((res) => {
        setSubjects(res.data.subjects || []);
        setSubjectId(res.data.subjects?.[0]?._id || '');
      })
      .catch(() => {});
  }, [examId]);

  useEffect(() => {
    if (!subjectId) return;
    api
      .get(`/subjects/${subjectId}/chapters`)
      .then((res) => {
        setChapters(res.data.chapters || []);
        setChapterId(res.data.chapters?.[0]?._id || '');
      })
      .catch(() => {});
  }, [subjectId]);

  async function startMock() {
    if (!chapterId || starting) return;
    setStarting(true);
    setError('');
    try {
      const res = await api.get(`/chapters/${chapterId}/questions`);
      const pool = res.data.questions || [];
      if (!pool.length) {
        setError('No questions in this chapter yet. Pick another chapter.');
        setStarting(false);
        return;
      }
      const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
      const chapterName = chapters.find((c) => c._id === chapterId)?.name || 'Chapter';
      navigate('/mocks/run', {
        state: { questions: picked, chapterId, chapterName, perQSec: 90, correct: 4, wrong: -1 },
      });
    } catch {
      setError('Could not start the mock. Try again.');
      setStarting(false);
    }
  }

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">Mock Tests</h1>
        <p className="text-body-md text-ink/60 mb-8">
          Exam-pattern tests with negative marking and a timer.
        </p>

        {loading && <p className="text-ink/60">Loading...</p>}
        {error && <p className="mb-4 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}

        {!loading && (
          <div className="bg-white rounded-xxl border border-hairline-cloud p-6 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block">
                <span className="text-caption font-medium text-ink/60">Exam</span>
                <select
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-sm border border-hairline-cool"
                >
                  {exams.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-caption font-medium text-ink/60">Subject</span>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-sm border border-hairline-cool"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-caption font-medium text-ink/60">Chapter</span>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-sm border border-hairline-cool"
                >
                  {chapters.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <span className="text-caption font-medium text-ink/60">Questions</span>
              <div className="flex gap-2 mt-1">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`px-4 py-2 rounded-md border text-body-md font-medium transition ${
                      count === n
                        ? 'border-violet bg-violet/10 text-ink-deep'
                        : 'border-hairline-cool text-ink/60 hover:border-violet'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-caption text-ink/50">
              {count} questions · {Math.round((count * 90) / 60)} min · +4 / −1 marking
            </p>

            <button
              onClick={startMock}
              disabled={!chapterId || starting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition disabled:opacity-40"
            >
              <Play size={15} />
              {starting ? 'Preparing...' : 'Start Test'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
