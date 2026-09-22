import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import api from '../api/axios';
import QuestionCard from '../components/QuestionCard';

function fmt(sec) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MockRunner() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const session = state || null;

  const questions = useMemo(() => session?.questions || [], [session]);
  const totalSec = questions.length * (session?.perQSec || 90);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [left, setLeft] = useState(totalSec);
  const [submitting, setSubmitting] = useState(false);
  const doneRef = useRef(false);

  async function finish(currentAnswers) {
    if (doneRef.current) return;
    doneRef.current = true;
    setSubmitting(true);
    const results = [];
    for (const q of questions) {
      const selected = currentAnswers[q._id] || null;
      if (!selected) {
        results.push({ questionId: q._id, selectedOption: null, skipped: true });
        continue;
      }
      try {
        const res = await api.post(`/questions/${q._id}/attempt`, {
          selectedOption: selected,
          timeTakenSec: session?.perQSec || 90,
        });
        results.push({
          questionId: q._id,
          selectedOption: selected,
          isCorrect: res.data.isCorrect,
          correctOption: res.data.correctOption,
        });
      } catch {
        results.push({ questionId: q._id, selectedOption: selected, skipped: true });
      }
    }
    navigate('/mocks/result', {
      replace: true,
      state: {
        results,
        meta: {
          chapterId: session?.chapterId,
          chapterName: session?.chapterName,
          correct: session?.correct ?? 4,
          wrong: session?.wrong ?? -1,
          total: questions.length,
        },
      },
    });
  }

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!questions.length) return;
    setLeft(totalSec);
    const timer = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          finishRef.current(answersRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  if (!session || !questions.length) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-ink/60 mb-4">No active mock. Start one first — a refresh clears the session.</p>
          <Link to="/mocks" className="text-violet font-medium">
            ← Back to mocks
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[index];
  const low = left < 600;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-white min-h-screen px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-caption font-medium text-ink/60">
              {session.chapterName} · Q {index + 1}/{questions.length}
            </span>
            <span
              className={`font-code font-bold ${low ? 'text-pink' : 'text-ink-deep'}`}
              role="timer"
            >
              {fmt(left)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-hairline-cloud/70 overflow-hidden">
            <div
              className={`h-full rounded-full ${low ? 'bg-pink' : 'bg-violet'}`}
              style={{ width: `${(left / totalSec) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 my-4" aria-label="Question palette">
          {questions.map((item, i) => {
            const has = answers[item._id];
            const isMarked = marked[item._id];
            return (
              <button
                key={item._id}
                onClick={() => setIndex(i)}
                title={`Question ${i + 1}${has ? ' (answered)' : ''}${isMarked ? ' (marked)' : ''}`}
                className={`w-8 h-8 rounded-md font-code text-sm transition border ${
                  i === index
                    ? 'border-ink-deep font-bold'
                    : has
                      ? 'bg-violet text-white border-violet'
                      : isMarked
                        ? 'bg-pink/15 text-pink border-pink'
                        : 'border-hairline-cool text-ink/50 hover:border-violet'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <QuestionCard
          question={q}
          selectedOption={answers[q._id] || null}
          feedback={null}
          disabled={submitting}
          onSelect={(opt) => setAnswers((prev) => ({ ...prev, [q._id]: opt }))}
        />

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={() => setMarked((prev) => ({ ...prev, [q._id]: !prev[q._id] }))}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-sm font-medium transition ${
              marked[q._id]
                ? 'border-pink text-pink bg-pink/10'
                : 'border-hairline-cool text-ink/60 hover:border-violet'
            }`}
          >
            <Flag size={14} />
            {marked[q._id] ? 'Marked' : 'Mark for review'}
          </button>
          <span className="flex-1" />
          {index > 0 && (
            <button
              onClick={() => setIndex((i) => i - 1)}
              className="px-4 py-2 rounded-md border border-hairline-cool text-sm hover:border-violet transition"
            >
              Prev
            </button>
          )}
          {index < questions.length - 1 ? (
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="px-6 py-2 rounded-md bg-primary text-white text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => finish(answers)}
              disabled={submitting}
              className="px-6 py-2 rounded-md bg-lime text-ink-deep text-sm font-bold uppercase tracking-[0.2px] hover:brightness-95 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : `Submit (${answeredCount}/${questions.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
