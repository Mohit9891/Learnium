import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'learned', label: 'Learned' },
];

const STATUS_STYLES = {
  unreviewed: 'bg-pink/10 text-pink',
  reviewing: 'bg-yellow-50 text-yellow-700',
  learned: 'bg-lime/10 text-lime-700',
};

function MistakeCard({ entry, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [retryOption, setRetryOption] = useState(null);
  const [retryResult, setRetryResult] = useState(null);
  const [notes, setNotes] = useState(entry.notes || '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const question = entry.question;

  function handleRetrySelect(optId) {
    if (retryResult) return;
    setRetryOption(optId);
    setRetryResult(optId === question.correctOption ? 'correct' : 'wrong');
  }

  async function handleStatusChange(newStatus) {
    setSaving(true);
    try {
      const res = await api.patch(`/mistakes/${entry._id}`, { reviewStatus: newStatus });
      onUpdate(entry._id, res.data.mistake);
    } catch {
      // silently ignore for now — status just won't update visually
    } finally {
      setSaving(false);
    }
  }

  async function handleRealAttempt() {
    if (!retryOption || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/questions/${question._id}/attempt`, {
        selectedOption: retryOption,
        timeTakenSec: 0,
      });
      if (res.data.isCorrect) {
        const updated = await api.patch(`/mistakes/${entry._id}`, { reviewStatus: 'learned' });
        onUpdate(entry._id, updated.data.mistake);
      } else {
        setRetryResult('wrong');
      }
    } catch {
      // silent — retry state stays local
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveNotes() {
    setSaving(true);
    try {
      const res = await api.patch(`/mistakes/${entry._id}`, { notes });
      onUpdate(entry._id, res.data.mistake);
    } catch {
      // silently ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-hairline-cloud overflow-hidden">
      <div className="w-full px-6 py-4 flex items-center justify-between gap-4">
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 text-left min-w-0">
          <p className="text-caption text-ink/50 mb-1">{question.chapter?.name}</p>
          <p className="font-medium text-ink-deep truncate">{question.questionText}</p>
        </button>
        <span
          className={`shrink-0 text-caption font-medium px-3 py-1 rounded-full ${STATUS_STYLES[entry.reviewStatus]}`}
        >
          {entry.reviewStatus}
        </span>
        {entry.reviewStatus !== 'learned' && (
          <button
            onClick={() => handleStatusChange('learned')}
            disabled={saving}
            title="Mark learned"
            className="shrink-0 w-8 h-8 rounded-full border border-lime text-lime-600 flex items-center justify-center hover:bg-lime/10 transition disabled:opacity-40"
          >
            <Check size={15} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-hairline-cloud pt-4">
          <div className="space-y-2 mb-4">
            {question.options.map((opt) => {
              let style = 'border-hairline-cool text-ink/80 hover:border-violet';
              if (retryResult) {
                if (opt.id === question.correctOption) {
                  style = 'border-lime bg-lime/10 text-ink-deep font-medium';
                } else if (opt.id === retryOption) {
                  style = 'border-pink bg-pink/10 text-ink-deep';
                } else {
                  style = 'border-hairline-cloud text-ink/40';
                }
              }
              return (
                <button
                  key={opt.id}
                  disabled={!!retryResult}
                  onClick={() => handleRetrySelect(opt.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-md border font-code text-sm transition ${style}`}
                >
                  <span className="font-code opacity-60 mr-2">{opt.id}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {retryResult && (
            <div
              className={`mb-4 p-3 rounded-md text-sm ${
                retryResult === 'correct' ? 'bg-lime/10 text-green-700' : 'bg-pink/10 text-pink'
              }`}
            >
              <p className="font-medium">
                {retryResult === 'correct' ? 'Correct this time!' : 'Still incorrect'}
              </p>
              <p className="text-ink/70 mt-1">{question.explanation}</p>
              {retryResult === 'correct' && (
                <button
                  onClick={handleRealAttempt}
                  disabled={submitting}
                  className="mt-2 inline-flex items-center gap-1.5 text-caption font-semibold text-violet hover:underline disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  {submitting ? 'Saving...' : 'Re-attempt for real (counts toward stats)'}
                </button>
              )}
            </div>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Add a note to help you remember why you got this wrong..."
            className="w-full text-sm px-3 py-2 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus mb-4"
            rows={2}
          />

          <div className="flex gap-2">
            {['unreviewed', 'reviewing', 'learned'].map((status) => (
              <button
                key={status}
                disabled={saving || entry.reviewStatus === status}
                onClick={() => handleStatusChange(status)}
                className={`text-caption font-medium px-3 py-1.5 rounded-full transition disabled:opacity-40 ${
                  entry.reviewStatus === status
                    ? STATUS_STYLES[status]
                    : 'bg-hairline-cloud/40 text-ink/60 hover:bg-hairline-cloud'
                }`}
              >
                Mark {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MistakeNotebook() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [query, setQuery] = useState('');
  const [groupByChapter, setGroupByChapter] = useState(false);

  useEffect(() => {
    setLoading(true);
    const queryParam = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get(`/mistakes${queryParam}`)
      .then((res) => setMistakes(res.data.mistakes))
      .catch(() => setError('Could not load your mistakes. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  function handleUpdate(id, updatedEntry) {
    setMistakes((prev) =>
      prev.map((m) => (m._id === id ? { ...m, ...updatedEntry } : m))
    );
  }

  const now = Date.now();
  const dueCount = mistakes.filter((m) => {
    if (m.reviewStatus === 'learned') return false;
    const ageDays = (now - new Date(m.lastWrongAt).getTime()) / (24 * 60 * 60 * 1000);
    return m.reviewStatus === 'unreviewed' ? ageDays >= 1 : ageDays >= 3;
  }).length;

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mistakes;
    return mistakes.filter((m) => (m.question?.questionText || '').toLowerCase().includes(q));
  }, [mistakes, query]);

  const groups = useMemo(() => {
    if (!groupByChapter) return null;
    const map = new Map();
    for (const m of searched) {
      const name = m.question?.chapter?.name || 'Unknown chapter';
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(m);
    }
    return [...map.entries()];
  }, [searched, groupByChapter]);

  function renderCard(entry) {
    return <MistakeCard key={entry._id} entry={entry} onUpdate={handleUpdate} />;
  }

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
          ← Practice
        </Link>

        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Mistake Notebook
        </h1>
        <p className="text-body-md text-ink/60 mb-6">
          Every wrong answer lands here automatically. Retry, add notes, and mark it learned.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-body-md font-medium px-4 py-1.5 rounded-full transition ${
                statusFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-hairline-cloud text-ink/70 hover:border-violet'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setGroupByChapter((g) => !g)}
            className={`text-body-md font-medium px-4 py-1.5 rounded-full transition border ${
              groupByChapter
                ? 'bg-violet/10 text-ink-deep border-violet'
                : 'bg-white border-hairline-cloud text-ink/70 hover:border-violet'
            }`}
          >
            Group by chapter
          </button>
        </div>

        <div className="mb-6 max-w-md">
          <SearchBar value={query} onChange={setQuery} placeholder="Search mistakes..." />
        </div>

        {loading && <p className="text-ink/60">Loading your mistakes...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && dueCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-violet/40 bg-violet/10 px-5 py-4 mb-6">
            <span className="font-display font-bold text-heading-md text-violet-deep">{dueCount}</span>
            <p className="text-body-md text-ink-deep">
              due for revision today — spaced repetition keeps them from fading.
            </p>
            <Link
              to="/revision"
              className="ml-auto shrink-0 text-caption font-bold uppercase tracking-[0.2px] text-violet hover:underline"
            >
              Revise →
            </Link>
          </div>
        )}

        {!loading && !error && searched.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-hairline-cloud">
            <p className="text-ink/70 mb-4">
              {mistakes.length === 0
                ? statusFilter
                  ? `No mistakes with status "${statusFilter}" yet.`
                  : "No mistakes yet — that's a good thing! Keep practicing."
                : 'No mistakes match your search.'}
            </p>
            <Link
              to="/exams"
              className="inline-block px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
            >
              Practice
            </Link>
          </div>
        )}

        {groups ? (
          <div className="space-y-6">
            {groups.map(([name, entries]) => (
              <div key={name}>
                <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-2">
                  {name} · {entries.length}
                </p>
                <div className="space-y-3">{entries.map(renderCard)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">{searched.map(renderCard)}</div>
        )}
      </div>
    </div>
  );
}