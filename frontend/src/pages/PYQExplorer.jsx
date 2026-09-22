import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';

const DIFFS = [
  { value: '', label: 'All levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const YEARS = ['', '2024', '2023', '2022', '2021', '2020'];

function DifficultyDot({ level }) {
  const color =
    level === 'easy' ? 'bg-lime' : level === 'hard' ? 'bg-pink' : 'bg-violet';
  return <span className={`w-2 h-2 rounded-full ${color}`} title={level} />;
}

export default function PYQExplorer() {
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(p = 1) {
    setLoading(true);
    setError('');
    try {
      const params = { page: p, limit: 20 };
      if (search.trim()) params.search = search.trim();
      if (difficulty) params.difficulty = difficulty;
      if (year) params.year = year;
      const res = await api.get('/explore', { params });
      setQuestions(res.data.questions);
      setTotal(res.data.total);
      setPage(res.data.page);
    } catch {
      setError('Could not load questions. Try refreshing.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, year]);

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Explore Previous Year Questions
        </h1>
        <p className="text-body-md text-ink/60 mb-6">
          {total} questions across the bank. Click one to solve it.
        </p>

        <div className="max-w-md mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search questions..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          {DIFFS.map((d) => (
            <button
              key={d.value || 'all'}
              onClick={() => setDifficulty(d.value)}
              className={`px-3 py-1.5 rounded-md border text-caption font-medium transition ${
                difficulty === d.value
                  ? 'border-violet bg-violet/10 text-ink-deep'
                  : 'border-hairline-cool text-ink/60 hover:border-violet'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          {YEARS.map((y) => (
            <button
              key={y || 'all-years'}
              onClick={() => {
                setYear(y);
              }}
              className={`px-3 py-1.5 rounded-md border font-code text-caption transition ${
                year === y
                  ? 'border-violet bg-violet/10 text-ink-deep'
                  : 'border-hairline-cool text-ink/60 hover:border-violet'
              }`}
            >
              {y || 'All years'}
            </button>
          ))}
          <button
            onClick={() => load(1)}
            className="ml-auto px-4 py-1.5 rounded-md bg-primary text-white text-caption font-bold uppercase tracking-[0.2px]"
          >
            Search
          </button>
        </div>

        {loading && <p className="text-ink/60">Loading questions...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && questions.length === 0 && (
          <p className="text-ink/60">No questions match these filters.</p>
        )}

        <div className="space-y-2">
          {questions.map((q) => (
            <Link
              key={q._id}
              to={`/chapters/${q.chapterId}/solve`}
              className="flex items-center justify-between gap-3 bg-white rounded-lg px-5 py-3.5 border border-hairline-cloud hover:border-violet transition"
            >
              <span className="min-w-0">
                <span className="block font-medium text-ink-deep truncate">{q.questionText}</span>
                <span className="block text-caption text-ink/50 mt-0.5">
                  {q.examName ? `${q.examName} · ` : ''}
                  {q.subjectName ? `${q.subjectName} · ` : ''}
                  {q.chapterName || ''}
                </span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {q.year && (
                  <span className="font-code text-caption text-ink/60 border border-hairline-cool rounded-xs px-1.5 py-0.5">
                    {q.year}
                  </span>
                )}
                <DifficultyDot level={q.difficulty} />
                <Check size={14} className="text-hairline-cool" />
              </span>
            </Link>
          ))}
        </div>

        {!loading && total > questions.length && (
          <div className="flex items-center gap-3 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="px-4 py-2 rounded-md border border-hairline-cool text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-caption text-ink/60">Page {page}</span>
            <button
              onClick={() => load(page + 1)}
              className="px-4 py-2 rounded-md border border-hairline-cool text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
