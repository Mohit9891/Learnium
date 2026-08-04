import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function StatCard({ label, value, accentClass }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-hairline-cloud">
      <p className={`font-display font-bold text-display-lg mb-1 ${accentClass}`}>{value}</p>
      <p className="text-body-md text-ink/60">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setError('Could not load your dashboard. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
          ← Practice
        </Link>

        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Your Progress
        </h1>
        <p className="text-body-md text-ink/60 mb-8">A quick look at how you're doing.</p>

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