import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, TriangleAlert } from 'lucide-react';
import api from '../api/axios';
import ScoreRing from '../components/ScoreRing';
import HeatStrip from '../components/HeatStrip';

const TABS = ['Overview', 'Accuracy', 'Speed', 'Topics', 'History'];

function Bar({ label, value, sub }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-body-md text-ink-deep truncate">{label}</span>
        <span className="font-code text-ink/60 ml-3 shrink-0">
          {value}%{sub ? ` · ${sub}` : ''}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-hairline-cloud/70 overflow-hidden">
        <div
          className={`h-full rounded-full ${value >= 75 ? 'bg-lime' : value >= 50 ? 'bg-violet' : 'bg-pink'}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function PerformanceAnalysis() {
  const [tab, setTab] = useState('Overview');
  const [summary, setSummary] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/progress/overview').catch(() => ({ data: { chapters: {} } })),
      api.get('/progress/activity?days=7').catch(() => ({ data: { days: [] } })),
    ])
      .then(([s, p, a]) => {
        setSummary(s.data);
        setChapters(Object.values(p.data.chapters || {}));
        setActivity(a.data.days || []);
      })
      .catch(() => setError('Could not load analysis. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  const attempted = useMemo(() => chapters.filter((c) => c.attempted > 0), [chapters]);
  const byAccuracy = useMemo(() => [...attempted].sort((a, b) => a.accuracy - b.accuracy), [attempted]);
  const bySpeed = useMemo(
    () => [...attempted].sort((a, b) => (b.avgTimeSec || 0) - (a.avgTimeSec || 0)),
    [attempted]
  );

  const issues = useMemo(() => {
    const out = [];
    for (const c of byAccuracy) {
      if (c.accuracy < 50 && c.attempted >= 3) {
        out.push({
          kind: 'bad',
          title: `${c.chapterName || 'Chapter'} — accuracy below 50% across ${c.attempted} attempts`,
          chapterId: c.chapterId,
        });
      }
    }
    for (const c of bySpeed) {
      if ((c.avgTimeSec || 0) > 150 && c.attempted >= 3) {
        out.push({
          kind: 'bad',
          title: `Slow in ${c.chapterName || 'chapter'} — avg ${Math.round(c.avgTimeSec)}s vs 90s target`,
          chapterId: c.chapterId,
        });
      }
    }
    for (const c of [...attempted].sort((a, b) => b.accuracy - a.accuracy).slice(0, 2)) {
      if (c.accuracy >= 80) {
        out.push({
          kind: 'good',
          title: `${c.chapterName || 'Chapter'} — exam-ready, move to revision`,
          chapterId: c.chapterId,
        });
      }
    }
    return out.slice(0, 6);
  }, [byAccuracy, bySpeed, attempted]);

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Performance Analysis
        </h1>
        <p className="text-body-md text-ink/60 mb-6">Where you stand, and what to fix next.</p>

        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-body-md font-medium transition ${
                tab === t
                  ? 'bg-violet/10 text-ink-deep border border-violet'
                  : 'text-ink/60 border border-hairline-cloud hover:border-violet'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <p className="text-ink/60">Loading analysis...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && summary && summary.totalAttempts === 0 && (
          <div className="bg-white rounded-xl p-8 text-center border border-hairline-cloud">
            <p className="text-ink/70 mb-4">Solve some questions first — your analysis will appear here.</p>
            <Link
              to="/exams"
              className="inline-block px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
            >
              Start Practicing
            </Link>
          </div>
        )}

        {!loading && !error && summary && summary.totalAttempts > 0 && (
          <>
            {(tab === 'Overview' || tab === 'Accuracy') && (
              <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mb-6">
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <ScoreRing value={summary.accuracy} size={100} />
                  <div>
                    <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50">
                      Overall accuracy
                    </p>
                    <p className="font-display font-medium text-heading-md text-ink-deep">
                      {summary.questionsSolved} solved · {summary.totalAttempts} attempts
                    </p>
                  </div>
                </div>
                {byAccuracy.slice(0, 8).map((c) => (
                  <Bar
                    key={String(c.chapterId)}
                    label={`${c.subjectName ? `${c.subjectName} · ` : ''}${c.chapterName || 'Chapter'}`}
                    value={c.accuracy}
                    sub={`${c.attempted} att`}
                  />
                ))}
              </div>
            )}

            {(tab === 'Overview' || tab === 'Speed') && (
              <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mb-6">
                <p className="font-display font-medium text-heading-sm text-ink-deep mb-4">
                  Avg time per question
                </p>
                {bySpeed.slice(0, 8).map((c) => (
                  <Bar
                    key={String(c.chapterId)}
                    label={c.chapterName || 'Chapter'}
                    value={Math.max(0, Math.min(100, Math.round(100 - Math.max(0, (c.avgTimeSec || 0) - 60))))}
                    sub={`${Math.round(c.avgTimeSec || 0)}s`}
                  />
                ))}
              </div>
            )}

            {(tab === 'Overview' || tab === 'Topics') && (
              <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mb-6">
                <p className="font-display font-medium text-heading-sm text-ink-deep mb-4">What to fix</p>
                <div className="space-y-3">
                  {issues.length === 0 && <p className="text-ink/60">No issues flagged yet. Keep solving.</p>}
                  {issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 rounded-md p-4 border ${
                        issue.kind === 'good' ? 'border-lime bg-lime/10' : 'border-hairline-cloud'
                      }`}
                    >
                      <span className="flex items-start gap-2 text-body-md text-ink-deep">
                        {issue.kind === 'good' ? (
                          <Check size={17} className="text-lime-600 mt-0.5 shrink-0" />
                        ) : (
                          <TriangleAlert size={17} className="text-pink mt-0.5 shrink-0" />
                        )}
                        {issue.title}
                      </span>
                      {issue.kind !== 'good' && (
                        <Link
                          to={`/chapters/${issue.chapterId}/solve`}
                          className="inline-flex items-center gap-1 text-caption font-semibold text-violet hover:underline shrink-0"
                        >
                          Practice <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(tab === 'Overview' || tab === 'History') && activity.length > 0 && (
              <div className="bg-white rounded-xl border border-hairline-cloud p-5">
                <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-3">
                  Last 7 days
                </p>
                <HeatStrip days={activity} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
