import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ScoreRing from '../components/ScoreRing';
import HeatStrip from '../components/HeatStrip';

function StatCard({ label, value, accentClass, trend }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-hairline-cloud">
      <p className={`font-display font-bold text-display-lg mb-1 ${accentClass}`}>{value}</p>
      <p className="text-body-md text-ink/60">{label}</p>
      {trend != null && trend !== 0 && (
        <p className="text-caption text-violet font-medium mt-1">
          +{trend} this week
        </p>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ScoreRow({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-body-md text-ink/70">{label}</span>
      <span className="flex-1 h-2 rounded-full bg-hairline-cloud/70 overflow-hidden">
        <span
          className={`block h-full rounded-full ${value >= 75 ? 'bg-lime' : value >= 50 ? 'bg-violet' : 'bg-pink'}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, transition: 'width 0.5s ease' }}
        />
      </span>
      <span className="w-10 text-right font-code text-ink/70">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [chapters, setChapters] = useState({});
  const [activity, setActivity] = useState([]);
  const [openMistakes, setOpenMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/progress/overview').catch(() => ({ data: { chapters: {} } })),
      api.get('/progress/activity?days=7').catch(() => ({ data: { days: [] } })),
      api.get('/mistakes').catch(() => ({ data: { mistakes: [] } })),
    ])
      .then(([summaryRes, progressRes, activityRes, mistakesRes]) => {
        setSummary(summaryRes.data);
        setChapters(progressRes.data.chapters || {});
        setActivity(activityRes.data.days || []);
        setOpenMistakes(
          (mistakesRes.data.mistakes || []).filter((m) => m.reviewStatus !== 'learned').length
        );
      })
      .catch(() => setError('Could not load your dashboard. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  const health = useMemo(() => {
    if (!summary) return null;
    const list = Object.values(chapters);
    const touched = list.filter((c) => c.attempted > 0);
    const attemptedSum = list.reduce((a, c) => a + c.attempted, 0);
    const totalSum = list.reduce((a, c) => a + c.total, 0);
    const accuracy = summary.accuracy || 0;
    const consistency = Math.min(100, (summary.streak || 0) * 12);
    const coverage = totalSum ? Math.round(Math.min(100, (attemptedSum / totalSum) * 100)) : 0;
    const revision = Math.max(0, 100 - openMistakes * 4);
    const avgTime =
      touched.length ? touched.reduce((a, c) => a + (c.avgTimeSec || 0), 0) / touched.length : 0;
    const speed = !touched.length ? 0 : avgTime <= 90 ? 100 : Math.max(20, Math.round(100 - (avgTime - 90)));
    const score = Math.round(accuracy * 0.4 + coverage * 0.25 + consistency * 0.2 + speed * 0.15);
    const rows = [
      { label: 'Accuracy', value: accuracy },
      { label: 'Consistency', value: consistency },
      { label: 'Coverage', value: coverage },
      { label: 'Revision health', value: revision },
      { label: 'Speed', value: speed },
    ];
    const weakest = [...rows].sort((a, b) => a.value - b.value)[0];
    return { score, rows, weakest, touched: touched.length };
  }, [summary, chapters, openMistakes]);

  const attempted = Object.values(chapters).filter((c) => c.attempted >= 3);
  attempted.sort((a, b) => a.accuracy - b.accuracy);
  const weakSpot = attempted[0] || null;

  const weekSolved = activity.reduce((a, d) => a + d.attempted, 0);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const subtext = !summary
    ? "Here's how you're doing."
    : summary.totalAttempts === 0
      ? "Let's solve your first question today."
      : weakSpot && weakSpot.accuracy < 75
        ? `${weakSpot.subjectName || weakSpot.chapterName} needs attention today.`
        : `You're on a ${summary.streak}-day streak. Keep it going.`;

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
          ← Practice
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-8">
          <div>
            <h1 className="font-display font-medium text-heading-xl text-ink-deep mb-1">
              {greeting()}, {firstName} 👋
            </h1>
            <p className="text-body-md text-ink/60">{loading ? "Here's how you're doing." : subtext}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
            >
              <Play size={15} />
              Practice Now
            </Link>
            <Link
              to="/mocks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-hairline-cool text-ink-deep font-ui text-sm font-bold uppercase tracking-[0.2px] hover:border-violet transition"
            >
              <ClipboardList size={15} />
              Take a Mock
            </Link>
          </div>
        </div>

        {loading && <p className="text-ink/60">Loading your stats...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {summary && (
          <>
            {health && summary.totalAttempts > 0 && (
              <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mb-6">
                <div className="flex flex-wrap items-center gap-6">
                  <ScoreRing value={health.score} size={120} />
                  <div className="flex-1 min-w-60">
                    <p className="font-display font-medium text-heading-md text-ink-deep mb-1">
                      Learning Score
                    </p>
                    <p className="text-body-md text-ink/60 mb-4">
                      {health.score >= 80
                        ? `Excellent — exam-ready across ${health.touched} chapter${health.touched === 1 ? '' : 's'}.`
                        : health.score >= 60
                          ? `Strong — ${health.weakest.label.toLowerCase()} is holding you back.`
                          : `Getting started — focus on ${health.weakest.label.toLowerCase()} first.`}
                    </p>
                    <div className="space-y-2">
                      {health.rows.map((r) => (
                        <ScoreRow key={r.label} label={r.label} value={r.value} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Day Streak" value={summary.streak} accentClass="text-violet" />
              <StatCard
                label="Questions Solved"
                value={summary.questionsSolved}
                accentClass="text-ink-deep"
                trend={weekSolved}
              />
              <StatCard
                label="Accuracy"
                value={`${summary.accuracy}%`}
                accentClass="text-lime-600"
              />
              <StatCard
                label="Revision Due"
                value={openMistakes}
                accentClass="text-pink"
              />
            </div>

            {activity.length > 0 && summary.totalAttempts > 0 && (
              <div className="bg-white rounded-xl border border-hairline-cloud p-5 mb-8">
                <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-3">
                  Last 7 days
                </p>
                <HeatStrip days={activity} />
              </div>
            )}

            {summary.totalAttempts === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-hairline-cloud mb-8">
                <p className="text-ink/70 mb-4">You haven't attempted any questions yet.</p>
                <Link
                  to="/exams"
                  className="inline-block px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
                >
                  Start Practicing
                </Link>
              </div>
            )}

            {/* Premium teaser — deeper analytics reserved for paid tier */}
            <div className="bg-violet-deep rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="font-display font-medium text-lime mb-1">
                  Deeper insights, coming to Premium
                </p>
                <p className="text-on-dark-muted text-body-md">
                  AI Tutor sessions and performance trends.
                </p>
              </div>
              <span className="text-lime text-caption font-medium whitespace-nowrap ml-4">
                Coming soon
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
