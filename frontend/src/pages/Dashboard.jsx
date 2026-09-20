import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function StatCard({ label, value, accentClass }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-hairline-cloud">
      <p className={`font-display font-bold text-display-lg mb-1 ${accentClass}`}>{value}</p>
      <p className="text-body-md text-ink/60">{label}</p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [weakSpot, setWeakSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/progress/overview').catch(() => ({ data: { chapters: {} } })),
    ])
      .then(([summaryRes, progressRes]) => {
        setSummary(summaryRes.data);
        const chapters = Object.values(progressRes.data.chapters || {}).filter((c) => c.attempted >= 3);
        if (chapters.length) {
          chapters.sort((a, b) => a.accuracy - b.accuracy);
          setWeakSpot(chapters[0]);
        }
      })
      .catch(() => setError('Could not load your dashboard. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

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
            <span
              title="Mock tests are coming soon"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-hairline-cool text-ink/40 font-ui text-sm font-bold uppercase tracking-[0.2px] cursor-not-allowed select-none"
            >
              <ClipboardList size={15} />
              Take a Mock
              <span className="text-micro-cap font-semibold uppercase text-violet bg-violet/10 border border-violet/30 rounded-xs px-1.5 py-0.5">
                Soon
              </span>
            </span>
          </div>
        </div>

        {loading && <p className="text-ink/60">Loading your stats...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {summary && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Day Streak" value={summary.streak} accentClass="text-violet" />
              <StatCard
                label="Questions Solved"
                value={summary.questionsSolved}
                accentClass="text-ink-deep"
              />
              <StatCard
                label="Accuracy"
                value={`${summary.accuracy}%`}
                accentClass="text-lime-600"
              />
            </div>

            {summary.totalAttempts === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-hairline-cloud">
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
                  Weak-topic breakdowns, AI Tutor sessions, and performance trends.
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