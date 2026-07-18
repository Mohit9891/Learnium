import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function SubjectSelect() {
  const { examId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/exams/${examId}/subjects`)
      .then((res) => setSubjects(res.data.subjects))
      .catch(() => setError('Could not load subjects. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [examId]);

  return (
    <div className="bg-cream min-h-screen px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-sm text-forest/60 hover:text-forest">
          ← Exams
        </Link>

        <h1 className="font-display font-semibold text-forest text-3xl mt-4 mb-1">
          Choose a subject
        </h1>
        <p className="text-forest/60 mb-8">Pick one to see its chapters.</p>

        {loading && <p className="text-forest/60">Loading subjects...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && subjects.length === 0 && (
          <p className="text-forest/60">No subjects found for this exam yet.</p>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject._id}
              to={`/subjects/${subject._id}/chapters`}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-forest/5"
            >
              <div className="w-10 h-10 bg-sky-light rounded-lg flex items-center justify-center mb-4">
                <span className="font-display font-semibold text-forest">
                  {subject.name.charAt(0)}
                </span>
              </div>
              <p className="font-display font-medium text-forest text-lg">{subject.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}