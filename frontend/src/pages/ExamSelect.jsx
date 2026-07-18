import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ExamSelect() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/exams')
      .then((res) => setExams(res.data.exams))
      .catch(() => setError('Could not load exams. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-cream min-h-screen px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-sm text-forest/60 hover:text-forest">
          ← Learnium
        </Link>

        <h1 className="font-display font-semibold text-forest text-3xl mt-4 mb-1">
          Which exam are you preparing for?
        </h1>
        <p className="text-forest/60 mb-8">Pick one to see its subjects.</p>

        {loading && <p className="text-forest/60">Loading exams...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && exams.length === 0 && (
          <p className="text-forest/60">
            No exams yet — run the backend seed script to add sample data.
          </p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <Link
              key={exam._id}
              to={`/exams/${exam._id}/subjects`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-forest/5"
            >
              <div className="w-10 h-10 bg-lime rounded-lg flex items-center justify-center mb-4">
                <span className="font-display font-semibold text-forest">
                  {exam.name.charAt(0)}
                </span>
              </div>
              <p className="font-display font-medium text-forest text-lg">{exam.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}