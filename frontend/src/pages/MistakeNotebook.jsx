import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'learned', label: 'Learned' },
];

const STATUS_STYLES = {
  unreviewed: 'bg-red-50 text-red-700',
  reviewing: 'bg-yellow-50 text-yellow-700',
  learned: 'bg-green-50 text-green-700',
};

function MistakeCard({ entry, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [retryOption, setRetryOption] = useState(null);
  const [retryResult, setRetryResult] = useState(null);
  const [notes, setNotes] = useState(entry.notes || '');
  const [saving, setSaving] = useState(false);

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
    <div className="bg-white rounded-2xl shadow-sm border border-forest/5 overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-xs text-forest/50 mb-1">{question.chapter?.name}</p>
          <p className="font-medium text-forest truncate">{question.questionText}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[entry.reviewStatus]}`}
        >
          {entry.reviewStatus}
        </span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-forest/5 pt-4">
          <div className="space-y-2 mb-4">
            {question.options.map((opt) => {
              let style = 'border-forest/15 text-forest/80 hover:border-sky';
              if (retryResult) {
                if (opt.id === question.correctOption) {
                  style = 'border-green-500 bg-green-50 text-forest font-medium';
                } else if (opt.id === retryOption) {
                  style = 'border-red-400 bg-red-50 text-forest';
                } else {
                  style = 'border-forest/10 text-forest/40';
                }
              }
              return (
                <button
                  key={opt.id}
                  disabled={!!retryResult}
                  onClick={() => handleRetrySelect(opt.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${style}`}
                >
                  <span className="font-medium mr-2">{opt.id}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {retryResult && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                retryResult === 'correct' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              <p className="font-medium">
                {retryResult === 'correct' ? 'Correct this time!' : 'Still incorrect'}
              </p>
              <p className="text-forest/70 mt-1">{question.explanation}</p>
            </div>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            placeholder="Add a note to help you remember why you got this wrong..."
            className="w-full text-sm px-3 py-2 rounded-lg border border-forest/15 text-forest focus:outline-none focus:ring-2 focus:ring-sky mb-4"
            rows={2}
          />

          <div className="flex gap-2">
            {['unreviewed', 'reviewing', 'learned'].map((status) => (
              <button
                key={status}
                disabled={saving || entry.reviewStatus === status}
                onClick={() => handleStatusChange(status)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition disabled:opacity-40 ${
                  entry.reviewStatus === status
                    ? STATUS_STYLES[status]
                    : 'bg-forest/5 text-forest/60 hover:bg-forest/10'
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

  useEffect(() => {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get(`/mistakes${query}`)
      .then((res) => setMistakes(res.data.mistakes))
      .catch(() => setError('Could not load your mistakes. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  function handleUpdate(id, updatedEntry) {
    setMistakes((prev) =>
      prev.map((m) => (m._id === id ? { ...m, ...updatedEntry } : m))
    );
  }

  return (
    <div className="bg-cream min-h-screen px-8 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/exams" className="text-sm text-forest/60 hover:text-forest">
          ← Practice
        </Link>

        <h1 className="font-display font-semibold text-forest text-3xl mt-4 mb-1">
          Mistake Notebook
        </h1>
        <p className="text-forest/60 mb-6">
          Every wrong answer lands here automatically. Retry, add notes, and mark it learned.
        </p>

        <div className="flex gap-2 mb-6">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`text-sm font-medium px-4 py-1.5 rounded-full transition ${
                statusFilter === f.value
                  ? 'bg-forest text-white'
                  : 'bg-white text-forest/70 hover:bg-forest/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-forest/60">Loading your mistakes...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && mistakes.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-forest/5">
            <p className="text-forest/70">
              {statusFilter
                ? `No mistakes with status "${statusFilter}" yet.`
                : "No mistakes yet — that's a good thing! Keep practicing."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {mistakes.map((entry) => (
            <MistakeCard key={entry._id} entry={entry} onUpdate={handleUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}