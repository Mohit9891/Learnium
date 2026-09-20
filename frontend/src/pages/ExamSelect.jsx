import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import ProgressRing from '../components/ProgressRing';
import { CardSkeleton } from '../components/SkeletonLoader';

function examProgress(examId, chapters) {
  let attempted = 0;
  let total = 0;
  for (const c of Object.values(chapters)) {
    if (String(c.examId) === String(examId)) {
      attempted += c.attempted;
      total += c.total;
    }
  }
  return total ? Math.round((attempted / total) * 100) : 0;
}

export default function ExamSelect() {
  const [exams, setExams] = useState([]);
  const [chapters, setChapters] = useState({});
  const [continueItem, setContinueItem] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/exams'), api.get('/progress/overview').catch(() => ({ data: {} }))])
      .then(([examsRes, progressRes]) => {
        setExams(examsRes.data.exams);
        setChapters(progressRes.data.chapters || {});
        setContinueItem(progressRes.data.continue || null);
      })
      .catch(() => setError('Could not load exams. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => exams.filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase())),
    [exams, query]
  );

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-caption text-ink/60 hover:text-ink">
          ← Learnium
        </Link>

        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Which exam are you preparing for?
        </h1>
        <p className="text-body-md text-ink/60 mb-6">Pick one to see its subjects.</p>

        {continueItem && (
          <Link
            to={`/chapters/${continueItem.chapterId}/solve`}
            className="flex items-center gap-4 bg-violet-deep rounded-xl p-5 mb-6 hover:bg-night transition"
          >
            <span className="w-11 h-11 shrink-0 rounded-md bg-lime flex items-center justify-center">
              <Play size={20} className="text-ink-deep ml-0.5" />
            </span>
            <span>
              <span className="block text-micro-cap font-semibold uppercase tracking-[0.15em] text-lime">
                Continue where you left off
              </span>
              <span className="block font-display font-medium text-white">
                {continueItem.chapterName || 'Chapter'}
                {continueItem.subjectName ? ` · ${continueItem.subjectName}` : ''}
              </span>
            </span>
          </Link>
        )}

        <div className="mb-6 max-w-md">
          <SearchBar value={query} onChange={setQuery} placeholder="Search exams..." />
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-ink/60">
            {exams.length === 0
              ? 'No exams yet — run the backend seed script to add sample data.'
              : 'No exams match your search.'}
          </p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((exam) => {
            const pct = examProgress(exam._id, chapters);
            return (
              <Link
                key={exam._id}
                to={`/exams/${exam._id}/subjects`}
                className="bg-white rounded-xl p-6 border border-hairline-cloud hover:border-violet transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-violet-deep rounded-md flex items-center justify-center">
                    <span className="font-display font-semibold text-white">{exam.name.charAt(0)}</span>
                  </div>
                  {pct > 0 && <ProgressRing value={pct} size={40} />}
                </div>
                <p className="font-display font-medium text-ink-deep text-heading-sm">{exam.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
