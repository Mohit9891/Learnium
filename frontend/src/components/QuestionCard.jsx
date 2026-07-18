export default function QuestionCard({ question }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="font-medium">{question?.questionText || 'Question text'}</p>
    </div>
  );
}