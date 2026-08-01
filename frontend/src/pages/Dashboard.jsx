import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function StatCard({ label, value, accentClass }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest/5">
      <p className={`font-display font-semibold text-4xl mb-1 ${accentClass}`}>{value}</p>
      <p className="text-forest/60 text-sm">{label}</p>
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
    <div className="bg-cream min-h-screen px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-sm text-forest/60 hover:text-forest">
          ← Practice
        </Link>

        <h1 className="font-display font-semibold text-forest text-3xl mt-4 mb-1">
          Your Progress
        </h1>
        <p className="text-forest/60 mb-8">A quick look at how you're doing.</p>

        {loading && <p className="text-forest/60">Loading your stats...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {summary && (
          <>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Day Streak" value={summary.streak} accentClass="text-sky" />
              <StatCard
                label="Questions Solved"
                value={summary.questionsSolved}
                accentClass="text-forest"
              />
              <StatCard
                label="Accuracy"
                value={`${summary.accuracy}%`}
                accentClass="text-lime-600"
              />
            </div>

            {summary.totalAttempts === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-forest/5">
                <p className="text-forest/70 mb-4">
                  You haven't attempted any questions yet.
                </p>
                <Link
                  to="/exams"
                  className="inline-block px-6 py-2.5 rounded-full bg-forest text-white font-medium hover:bg-forest-light transition"
                >
                  Start Practicing
                </Link>
              </div>
            )}

            {/* Premium teaser — deeper analytics reserved for paid tier */}
            <div className="bg-forest rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="font-display font-medium text-lime mb-1">
                  Deeper insights, coming to Premium
                </p>
                <p className="text-white/70 text-sm">
                  Weak-topic breakdowns, AI study plans, and performance trends.
                </p>
              </div>
              <span className="text-lime text-sm font-medium whitespace-nowrap ml-4">
                Coming soon
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}