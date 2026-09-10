import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import QuestionCard from '../components/QuestionCard';
import FilterBar from '../components/FilterBar';
import FeedbackPanel from '../components/FeedbackPanel';

export default function Solve() {
  const { chapterId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempted: 0 });

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = difficulty ? { difficulty } : {};
    api
      .get(`/chapters/${chapterId}/questions`, { params })
      .then((res) => {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setFeedback(null);
      })
      .catch(() => setError('Could not load questions. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [chapterId, difficulty]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFinished = questions.length > 0 && currentIndex >= questions.length;

  async function handleSubmit() {
    if (!selectedOption || submitting) return;
    setSubmitting(true);

    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await api.post(`/questions/${currentQuestion._id}/attempt`, {
        selectedOption,
        timeTakenSec,
      });
      setFeedback(res.data);
      setScore((prev) => ({
        correct: prev.correct + (res.data.isCorrect ? 1 : 0),
        attempted: prev.attempted + 1,
      }));
    } catch {
      setError('Could not submit your answer. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setSelectedOption(null);
    setFeedback(null);
    startTimeRef.current = Date.now();
    setCurrentIndex((prev) => prev + 1);
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-ink/60">Loading questions...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 text-center">
        <div className="w-full max-w-xl">
          <FilterBar difficulty={difficulty} onDifficultyChange={setDifficulty} />
          <p className="text-ink/60 mb-4">No questions in this chapter yet.</p>
          <Link to="/exams" className="text-violet font-medium">
            ← Back to exams
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xxl border border-hairline-cloud p-10 text-center max-w-sm w-full">
          <p className="font-display font-bold text-ink-deep text-display-lg mb-2">
            {score.correct} / {score.attempted}
          </p>
          <p className="text-ink/60 mb-8">Questions answered correctly</p>
          <Link
            to="/exams"
            className="inline-block px-6 py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
          >
            Practice Another Chapter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
            ← Exit
          </Link>
          <span className="text-caption font-medium text-ink/60">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <FilterBar difficulty={difficulty} onDifficultyChange={setDifficulty} />

        <QuestionCard
          question={currentQuestion}
          selectedOption={selectedOption}
          feedback={feedback}
          disabled={submitting}
          onSelect={setSelectedOption}
        />

        <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mt-4">
          <FeedbackPanel result={feedback} />

          <div className="mt-6">
            {!feedback ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className="w-full py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition disabled:opacity-40"
              >
                {submitting ? 'Checking...' : 'Submit Answer'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition"
              >
                {isLastQuestion ? 'Finish' : 'Next Question'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
