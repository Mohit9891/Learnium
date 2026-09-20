import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import ProgressRing from '../components/ProgressRing';
import { RowSkeleton } from '../components/SkeletonLoader';

export default function ChapterSelect() {
  const { subjectId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState({});
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/subjects/${subjectId}/chapters`),
      api.get('/progress/overview').catch(() => ({ data: {} })),
    ])
      .then(([chaptersRes, progressRes]) => {
        setChapters(chaptersRes.data.chapters);
        setProgress(progressRes.data.chapters || {});
      })
      .catch(() => setError('Could not load chapters. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  const filtered = useMemo(
    () => chapters.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [chapters, query]
  );

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
          ← Back
        </Link>

        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Choose a chapter
        </h1>
        <p className="text-body-md text-ink/60 mb-6">Pick one to start solving questions.</p>

        <div className="mb-6 max-w-md">
          <SearchBar value={query} onChange={setQuery} placeholder="Search chapters..." />
        </div>

        {loading && (
          <div className="space-y-3">
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-ink/60">
            {chapters.length === 0
              ? 'No chapters found for this subject yet.'
              : 'No chapters match your search.'}
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((chapter, i) => {
            const stat = progress[chapter._id];
            const pct = stat && stat.total ? Math.round((stat.attempted / stat.total) * 100) : 0;
            return (
              <Link
                key={chapter._id}
                to={`/chapters/${chapter._id}/solve`}
                className="flex items-center justify-between gap-3 bg-white rounded-lg px-6 py-4 border border-hairline-cloud hover:border-violet transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="font-code text-violet w-6 shrink-0">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-medium text-ink-deep truncate">{chapter.name}</span>
                    {stat && stat.attempted > 0 && (
                      <span className="block text-caption text-ink/50 mt-0.5">
                        {stat.attempted} attempted · {stat.accuracy}% accuracy
                      </span>
                    )}
                  </span>
                </div>
                <span className="flex items-center gap-3 shrink-0">
                  {stat && stat.attempted > 0 && <ProgressRing value={pct} size={36} />}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !stat || stat.attempted === 0
                        ? 'bg-hairline-cool'
                        : stat.accuracy >= 75
                          ? 'bg-lime'
                          : stat.accuracy >= 50
                            ? 'bg-yellow-400'
                            : 'bg-pink'
                    }`}
                    title={
                      !stat || stat.attempted === 0
                        ? 'Not started'
                        : `${stat.accuracy}% accuracy`
                    }
                  />
                  <span className="text-ink/30">→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
