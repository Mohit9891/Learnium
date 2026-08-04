import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ChapterSelect() {
  const { subjectId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/subjects/${subjectId}/chapters`)
      .then((res) => setChapters(res.data.chapters))
      .catch(() => setError('Could not load chapters. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
          ← Back
        </Link>

        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-1">
          Choose a chapter
        </h1>
        <p className="text-body-md text-ink/60 mb-8">Pick one to start solving questions.</p>

        {loading && <p className="text-ink/60">Loading chapters...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && chapters.length === 0 && (
          <p className="text-ink/60">No chapters found for this subject yet.</p>
        )}

        <div className="space-y-3">
          {chapters.map((chapter, i) => (
            <Link
              key={chapter._id}
              to={`/chapters/${chapter._id}/solve`}
              className="flex items-center justify-between bg-white rounded-lg px-6 py-4 border border-hairline-cloud hover:border-violet transition"
            >
              <div className="flex items-center gap-4">
                <span className="font-code text-violet w-6">{i + 1}</span>
                <span className="font-medium text-ink-deep">{chapter.name}</span>
              </div>
              <span className="text-ink/30">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}