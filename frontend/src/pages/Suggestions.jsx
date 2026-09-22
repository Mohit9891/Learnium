import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import api from '../api/axios';

export default function Suggestions() {
  const [chapters, setChapters] = useState([]);
  const [openMistakes, setOpenMistakes] = useState(0);
  const [summary, setSummary] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('learnium_dismissed_tips') || '[]');
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/progress/overview').catch(() => ({ data: { chapters: {} } })),
      api.get('/mistakes').catch(() => ({ data: { mistakes: [] } })),
      api.get('/dashboard/summary').catch(() => ({ data: null })),
    ])
      .then(([p, m, s]) => {
        setChapters(Object.values(p.data.chapters || {}));
        setOpenMistakes((m.data.mistakes || []).filter((x) => x.reviewStatus !== 'learned').length);
        setSummary(s.data);
      })
      .catch(() => setError('Could not load suggestions. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  function dismiss(id) {
    setDismissed((prev) => {
      const next = [...prev, id];
      localStorage.setItem('learnium_dismissed_tips', JSON.stringify(next));
      return next;
    });
  }

  const tips = useMemo(() => {
    const out = [];
    const weak = chapters
      .filter((c) => c.attempted >= 3)
      .sort((a, b) => a.accuracy - b.accuracy)[0];
    if (weak && weak.accuracy < 60) {
      out.push({
        id: `weak-${weak.chapterId}`,
        problem: `Shaky ${weak.chapterName || 'chapter'}`,
        why: `You got ${weak.attempted - weak.correct} of your last ${weak.attempted} attempts wrong here (${weak.accuracy}% accuracy).`,
        action: `Revise the core formulas, then solve 15 targeted questions. Estimated time: 40 min.`,
        to: `/chapters/${weak.chapterId}/solve`,
        cta: 'Start Plan',
      });
    }
    const slow = chapters
      .filter((c) => c.attempted >= 3 && (c.avgTimeSec || 0) > 150)
      .sort((a, b) => (b.avgTimeSec || 0) - (a.avgTimeSec || 0))[0];
    if (slow) {
      out.push({
        id: `slow-${slow.chapterId}`,
        problem: `Slow in ${slow.chapterName || 'chapter'}`,
        why: `You average ${Math.round(slow.avgTimeSec)}s per question vs a 90s target — speed costs marks.`,
        action: `Do one timed 10-question run and skip-and-return on stuck questions.`,
        to: `/chapters/${slow.chapterId}/solve`,
        cta: 'Practice Timed',
      });
    }
    if (openMistakes >= 5) {
      out.push({
        id: 'revise-open',
        problem: `${openMistakes} mistakes waiting`,
        why: `Unreviewed mistakes fade fastest in the first 48 hours.`,
        action: `Clear the oldest 5 today in a single 20-minute revision session.`,
        to: '/mistakes',
        cta: 'Open Notebook',
      });
    }
    if (summary && summary.streak === 0 && summary.totalAttempts > 0) {
      out.push({
        id: 'streak-zero',
        problem: 'Streak at zero',
        why: `Daily consistency beats weekend marathons for retention.`,
        action: `Solve just 5 questions today to restart the streak.`,
        to: '/exams',
        cta: 'Solve 5 Now',
      });
    }
    if (out.length === 0 && summary && summary.totalAttempts > 0) {
      out.push({
        id: 'keep-going',
        problem: 'No red flags',
        why: `Your accuracy and pace look healthy across attempted chapters.`,
        action: `Push coverage: open an untouched chapter and solve 10 questions.`,
        to: '/exams',
        cta: 'Expand Coverage',
      });
    }
    return out.filter((t) => !dismissed.includes(t.id));
  }, [chapters, openMistakes, summary, dismissed]);

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Improve your prep
        </h1>
        <p className="text-body-md text-ink/60 mb-8">
          Generated from your actual attempts — fix the top item first.
        </p>

        {loading && <p className="text-ink/60">Analyzing your prep...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && tips.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-hairline-cloud">
            <p className="text-ink/70 mb-4">
              {summary && summary.totalAttempts > 0
                ? 'All caught up — every suggestion dismissed.'
                : 'Solve some questions first — suggestions appear here.'}
            </p>
            <Link
              to="/exams"
              className="inline-block px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
            >
              Practice
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {tips.map((tip) => (
            <div key={tip.id} className="bg-white rounded-xxl border border-hairline-cloud p-6">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="flex items-center gap-2 font-display font-medium text-heading-sm text-ink-deep">
                  <Sparkles size={17} className="text-violet shrink-0" />
                  {tip.problem}
                </p>
                <button
                  onClick={() => dismiss(tip.id)}
                  title="Dismiss"
                  className="text-ink/40 hover:text-ink transition shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-body-md text-ink/70 mb-2">{tip.why}</p>
              <p className="text-body-md text-ink-deep bg-violet/10 border border-violet/30 rounded-md px-4 py-3 mb-4">
                {tip.action}
              </p>
              <div className="flex gap-2">
                <Link
                  to={tip.to}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
                >
                  {tip.cta} <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => dismiss(tip.id)}
                  className="px-5 py-2.5 rounded-md border border-hairline-cool text-ink/60 font-ui text-sm font-bold uppercase tracking-[0.2px] hover:border-violet transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
