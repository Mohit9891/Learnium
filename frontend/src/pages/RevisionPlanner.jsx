import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const INTERVALS = { unreviewed: 1, reviewing: 3 };

function dayKey(d) {
  return d.toISOString().slice(0, 10);
}

export default function RevisionPlanner() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(dayKey(new Date()));

  useEffect(() => {
    api
      .get('/mistakes')
      .then((res) => setMistakes(res.data.mistakes || []))
      .catch(() => setError('Could not load your revision queue. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  const withDue = useMemo(() => {
    const now = Date.now();
    return mistakes
      .filter((m) => m.reviewStatus !== 'learned')
      .map((m) => {
        const ageDays = (now - new Date(m.lastWrongAt).getTime()) / (24 * 60 * 60 * 1000);
        const interval = INTERVALS[m.reviewStatus] || 1;
        const dueDate = new Date(new Date(m.lastWrongAt).getTime() + interval * 24 * 60 * 60 * 1000);
        return { ...m, dueKey: dayKey(dueDate), overdue: ageDays >= interval };
      });
  }, [mistakes]);

  const week = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const key = dayKey(d);
      days.push({
        key,
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        num: d.getDate(),
        count: withDue.filter((m) => m.dueKey <= key).length,
        isToday: i === 0,
      });
    }
    return days;
  }, [withDue]);

  const queue = withDue.filter((m) => m.dueKey <= selectedDay);
  const todayCount = withDue.filter((m) => m.overdue).length;

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Revision Planner
        </h1>
        <p className="text-body-md text-ink/60 mb-6">
          Spaced repetition from your Mistake Notebook — unreviewed items resurface after a day,
          reviewing ones after three.
        </p>

        {loading && <p className="text-ink/60">Loading your queue...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {week.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setSelectedDay(d.key)}
                  className={`rounded-lg border p-2 text-center transition ${
                    selectedDay === d.key
                      ? 'border-violet bg-violet/10'
                      : 'border-hairline-cloud hover:border-violet'
                  }`}
                >
                  <span className="block text-micro-cap uppercase text-ink/50">{d.label}</span>
                  <span className="block font-display font-bold text-ink-deep">{d.num}</span>
                  <span
                    className={`inline-block mt-1 text-micro-cap font-semibold rounded-full px-2 ${
                      d.count > 0 ? 'bg-pink/15 text-pink' : 'text-ink/40'
                    }`}
                  >
                    {d.count || '–'}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-violet/10 border border-violet/30 rounded-xl p-5 mb-6">
              <p className="font-display font-medium text-ink-deep mb-1">AI Suggestion</p>
              <p className="text-body-md text-ink/70">
                {todayCount > 0
                  ? `${todayCount} mistake${todayCount === 1 ? '' : 's'} ${todayCount === 1 ? 'is' : 'are'} about to fade. 15 minutes now saves an hour later.`
                  : 'Nothing overdue — your revision is fully caught up. Solve something new.'}
              </p>
              {todayCount > 0 && (
                <Link
                  to="/mistakes"
                  className="inline-block mt-3 px-5 py-2.5 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
                >
                  Start Revision Session
                </Link>
              )}
            </div>

            <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-2">
              Due {selectedDay} · {queue.length}
            </p>
            {queue.length === 0 ? (
              <p className="text-ink/60">Nothing due this day. Enjoy the calm.</p>
            ) : (
              <div className="space-y-2">
                {queue.map((m) => (
                  <Link
                    key={m._id}
                    to="/mistakes"
                    className="block bg-white rounded-lg px-5 py-3.5 border border-hairline-cloud hover:border-violet transition"
                  >
                    <p className="text-caption text-ink/50">
                      {m.question?.chapter?.name} · {m.reviewStatus}
                    </p>
                    <p className="font-medium text-ink-deep truncate">
                      {m.question?.questionText}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
