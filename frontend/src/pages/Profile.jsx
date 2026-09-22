import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Target, MapPin, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/progress/overview').catch(() => ({ data: { chapters: {} } })),
    ])
      .then(([s, p]) => {
        setSummary(s.data);
        setChapters(Object.values(p.data.chapters || {}));
      })
      .catch(() => setError('Could not load profile. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(() => {
    const map = new Map();
    for (const c of chapters) {
      if (!c.subjectName) continue;
      if (!map.has(c.subjectName)) map.set(c.subjectName, { attempted: 0, total: 0 });
      const s = map.get(c.subjectName);
      s.attempted += c.attempted;
      s.total += c.total;
    }
    return [...map.entries()].map(([name, v]) => ({
      name,
      pct: v.total ? Math.round((v.attempted / v.total) * 100) : 0,
    }));
  }, [chapters]);

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>

        {loading && <p className="text-ink/60 mt-4">Loading profile...</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        {!loading && !error && (
          <>
            <div className="flex items-center gap-4 mt-4 mb-8">
              <span className="w-16 h-16 rounded-full bg-violet-deep text-white font-display font-bold text-heading-md flex items-center justify-center shrink-0">
                {(user?.name || 'S').charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display font-medium text-heading-xl text-ink-deep">
                  {user?.name}
                </h1>
                <p className="text-body-md text-ink/60">{user?.email}</p>
              </div>
              {user?.role === 'admin' && (
                <span className="ml-auto text-micro-cap font-semibold uppercase text-violet bg-violet/10 border border-violet/30 rounded-xs px-2 py-1">
                  Admin
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              <div className="rounded-xl border border-hairline-cloud p-4">
                <p className="flex items-center gap-1.5 text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-1">
                  <Target size={13} /> Target exam
                </p>
                <p className="font-display font-medium text-ink-deep">
                  {user?.examFocus || 'Class 12 + CUET'}
                </p>
              </div>
              <div className="rounded-xl border border-hairline-cloud p-4">
                <p className="flex items-center gap-1.5 text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-1">
                  <GraduationCap size={13} /> Level
                </p>
                <p className="font-display font-medium text-ink-deep">Class 11 / 12</p>
              </div>
              <div className="rounded-xl border border-hairline-cloud p-4">
                <p className="flex items-center gap-1.5 text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-1">
                  <MapPin size={13} /> Preferred locations
                </p>
                <p className="font-display font-medium text-ink-deep">Bangalore · Delhi NCR</p>
              </div>
            </div>

            {summary && (
              <div className="rounded-xxl border border-hairline-cloud p-6 mb-6">
                <p className="font-display font-medium text-heading-sm text-ink-deep mb-4">
                  Stats résumé
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { v: summary.streak, l: 'day streak', Icon: Flame },
                    { v: summary.questionsSolved, l: 'solved' },
                    { v: `${summary.accuracy}%`, l: 'accuracy' },
                    { v: summary.totalAttempts, l: 'attempts' },
                  ].map(({ v, l, Icon }) => (
                    <div key={l}>
                      <p className="font-display font-bold text-heading-md text-ink-deep flex items-center justify-center gap-1">
                        {Icon && <Icon size={16} className="text-violet" />}
                        {v}
                      </p>
                      <p className="text-caption text-ink/50">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xxl border border-hairline-cloud p-6">
              <p className="font-display font-medium text-heading-sm text-ink-deep mb-4">
                Subjects in progress
              </p>
              {subjects.length === 0 && (
                <p className="text-ink/60">
                  No subjects touched yet.{' '}
                  <Link to="/exams" className="text-violet font-medium">
                    Start practicing →
                  </Link>
                </p>
              )}
              <div className="space-y-3">
                {subjects.map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-body-md text-ink-deep">{s.name}</span>
                      <span className="font-code text-ink/60">{s.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-hairline-cloud/70 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.pct >= 75 ? 'bg-lime' : s.pct >= 40 ? 'bg-violet' : 'bg-pink'}`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
