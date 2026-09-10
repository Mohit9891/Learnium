import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';

function Stat({ label, value }) {
  return (
    <div className="rounded-xxl border border-hairline-cloud p-5">
      <p className="text-micro-cap font-semibold uppercase tracking-[0.25px] text-ink/50 mb-1">{label}</p>
      <p className="font-display font-bold text-heading-xl text-ink-deep">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .overview()
      .then(setData)
      .catch(() => setError('Could not load overview.'));
    adminApi
      .chapterStats()
      .then((r) => setStats(r.stats || []))
      .catch(() => {});
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-ink/60">Loading overview...</p>;

  return (
    <div>
      <h1 className="font-display font-bold text-heading-xl text-ink-deep mb-6">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Users" value={data.users} />
        <Stat label="Questions" value={data.questions} />
        <Stat label="Attempts" value={data.attempts} />
        <Stat label="Accuracy" value={`${data.accuracy}%`} />
        <Stat label="Exams" value={data.exams} />
        <Stat label="Subjects" value={data.subjects} />
        <Stat label="Chapters" value={data.chapters} />
        <Stat label="Attempts (7d)" value={data.recentAttempts} />
      </div>

      <h2 className="font-display font-medium text-heading-md text-ink-deep mb-3">Top chapters by attempts</h2>
      {stats.length === 0 ? (
        <p className="text-ink/60">No attempt data yet.</p>
      ) : (
        <div className="rounded-xxl border border-hairline-cloud overflow-hidden">
          <table className="w-full text-left text-body-md">
            <thead className="bg-gray-50 text-caption uppercase text-ink/50">
              <tr>
                <th className="px-4 py-2">Chapter</th>
                <th className="px-4 py-2">Attempts</th>
                <th className="px-4 py-2">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.chapterId} className="border-t border-hairline-cloud">
                  <td className="px-4 py-2">{s.chapterName || s.chapterId}</td>
                  <td className="px-4 py-2">{s.attempts}</td>
                  <td className="px-4 py-2">{s.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
