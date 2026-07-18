export default function FeedbackPanel({ result }) {
  if (!result) return null;
  return (
    <div className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
      <p>{result.isCorrect ? 'Correct!' : 'Incorrect'}</p>
      <p className="text-sm mt-1">{result.explanation}</p>
    </div>
  );
}