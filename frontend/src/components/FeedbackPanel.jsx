import { Link } from 'react-router-dom';

export default function FeedbackPanel({ result }) {
  if (!result) return null;

  return (
    <div className={`mt-5 p-4 rounded-md ${result.isCorrect ? 'bg-lime/10' : 'bg-pink/10'}`}>
      <p className={`font-medium ${result.isCorrect ? 'text-green-700' : 'text-pink'}`}>
        {result.isCorrect ? 'Correct!' : 'Incorrect'}
      </p>
      {result.explanation && <p className="text-body-md text-ink/70 mt-1">{result.explanation}</p>}
      {result.tracked === false && (
        <p className="text-caption text-violet mt-2">
          <Link to="/register" className="underline">
            Sign in
          </Link>{' '}
          to save your progress and streaks.
        </p>
      )}
    </div>
  );
}
