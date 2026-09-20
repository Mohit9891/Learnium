import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import ProgressRing from '../components/ProgressRing';
import { CardSkeleton } from '../components/SkeletonLoader';

function subjectProgress(subjectId, chapters) {
  let attempted = 0;
  let total = 0;
  for (const c of Object.values(chapters)) {
    if (String(c.subjectId) === String(subjectId)) {
      attempted += c.attempted;
      total += c.total;
    }
  }
  return total ? Math.round((attempted / total) * 100) : 0;
}

export default function SubjectSelect() {
  const { examId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${examId}/subjects`),
      api.get('/progress/overview').catch(() => ({ data: {} })),
    ])
      .then(([subjectsRes, progressRes]) => {
        setSubjects(subjectsRes.data.subjects);
        setChapters(progressRes.data.chapters || {});
      })
      .catch(() => setError('Could not load subjects. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [examId]);

  const filtered = useMemo(
    () => subjects.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [subjects, query]
  );

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
          ← Exams
        </Link>

        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Choose a subject
        </h1>
        <p className="text-body-md text-ink/60 mb-6">Pick one to see its chapters.</p>

        <div className="mb-6 max-w-md">
          <SearchBar value={query} onChange={setQuery} placeholder="Search subjects..." />
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
            {subjects.length === 0 ? 'No subjects found for this exam yet.' : 'No subjects match your search.'}
          </p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((subject) => {
            const pct = subjectProgress(subject._id, chapters);
            return (
              <Link
                key={subject._id}
                to={`/subjects/${subject._id}/chapters`}
                className="bg-white rounded-xl p-6 border border-hairline-cloud hover:border-violet transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-violet-mid rounded-md flex items-center justify-center">
                    <span className="font-display font-semibold text-white">{subject.name.charAt(0)}</span>
                  </div>
                  {pct > 0 && <ProgressRing value={pct} size={40} />}
                </div>
                <p className="font-display font-medium text-ink-deep text-heading-sm">{subject.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
