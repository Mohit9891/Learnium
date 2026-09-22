import { Link, useLocation } from 'react-router-dom';
import { Check, TriangleAlert, RotateCcw } from 'lucide-react';

export default function MockResult() {
  const { state } = useLocation();
  const results = state?.results || [];
  const meta = state?.meta || { correct: 4, wrong: -1, total: results.length };

  if (!results.length) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-ink/60 mb-4">No result to show. Take a mock first.</p>
          <Link to="/mocks" className="text-violet font-medium">
            ← Back to mocks
          </Link>
        </div>
      </div>
    );
  }

  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = results.filter((r) => !r.skipped && !r.isCorrect).length;
  const skipped = results.filter((r) => r.skipped).length;
  const score = correct * meta.correct + wrong * meta.wrong;
  const max = meta.total * meta.correct;
  const pct = max ? Math.round((score / max) * 100) : 0;
  const improvement = Math.min(max, score + wrong * meta.correct - wrong * meta.wrong);

  return (
    <div className="bg-white min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xxl border border-hairline-cloud p-8 text-center mb-6">
          <p className="text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/50 mb-1">
            {meta.chapterName || 'Mock'} · {meta.total} questions
          </p>
          <p className="font-display font-bold text-ink-deep text-display-lg">
            {score}
            <span className="text-heading-md text-ink/40">/{max}</span>
          </p>
          <p className="text-body-md text-ink/60 mt-1">
            {correct} correct · {wrong} wrong · {skipped} skipped ({pct}%)
          </p>
        </div>

        <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mb-6">
          <p className="font-display font-medium text-heading-sm text-ink-deep mb-3">Breakdown</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-body-md text-ink-deep">
              <Check size={16} className="text-lime-600 shrink-0" />
              Strong recall on {correct} question{correct === 1 ? '' : 's'} — bank the method
            </div>
            {wrong > 0 && (
              <div className="flex items-center gap-2 text-body-md text-ink-deep">
                <TriangleAlert size={16} className="text-pink shrink-0" />
                {wrong * -meta.wrong} marks lost to wrong answers — they&apos;re already in your
                Mistake Notebook
              </div>
            )}
            {skipped > 0 && (
              <div className="flex items-center gap-2 text-body-md text-ink-deep">
                <TriangleAlert size={16} className="text-yellow-600 shrink-0" />
                {skipped} unattempted — attempt strategy review in the notebook
              </div>
            )}
          </div>
        </div>

        {wrong + skipped > 0 && (
          <div className="bg-violet/10 border border-violet/30 rounded-xxl p-6 mb-6">
            <p className="font-display font-medium text-heading-sm text-ink-deep mb-1">
              What to improve
            </p>
            <p className="text-body-md text-ink/70">
              Revise the {wrong + skipped} missed question{wrong + skipped === 1 ? '' : 's'} in your
              notebook. Estimated improvement: <strong>{score} → {improvement}</strong>
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link
            to="/mistakes"
            className="px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
          >
            Review Mistakes
          </Link>
          <Link
            to="/mocks"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-hairline-cool text-ink-deep font-ui text-sm font-bold uppercase tracking-[0.2px] hover:border-violet transition"
          >
            <RotateCcw size={14} />
            Retake
          </Link>
        </div>
      </div>
    </div>
  );
}
