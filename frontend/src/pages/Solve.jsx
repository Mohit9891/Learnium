import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function Solve() {
  const { chapterId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempted: 0 });

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    api
      .get(`/chapters/${chapterId}/questions`)
      .then((res) => setQuestions(res.data.questions))
      .catch(() => setError('Could not load questions. Try refreshing.'))
      .finally(() => setLoading(false));
  }, [chapterId]);

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
        <div>
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
        <div className="flex items-center justify-between mb-6">
          <Link to="/exams" className="text-caption text-ink/60 hover:text-ink">
            ← Exit
          </Link>
          <span className="text-caption font-medium text-ink/60">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="bg-white rounded-xxl border border-hairline-cloud p-6">
          <p className="text-micro-cap font-semibold uppercase tracking-[0.25px] text-violet mb-3">
            {currentQuestion.difficulty}
          </p>
          <p className="font-display font-medium text-heading-md text-ink-deep mb-6">
            {currentQuestion.questionText}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectAnswer = feedback && opt.id === feedback.correctOption;
              const isWrongSelected = feedback && isSelected && !feedback.isCorrect;

              let optionStyle = 'border-hairline-cool text-ink/80 hover:border-violet';
              if (feedback) {
                if (isCorrectAnswer) {
                  optionStyle = 'border-lime bg-lime/10 text-ink-deep font-medium';
                } else if (isWrongSelected) {
                  optionStyle = 'border-pink bg-pink/10 text-ink-deep';
                } else {
                  optionStyle = 'border-hairline-cloud text-ink/40';
                }
              } else if (isSelected) {
                optionStyle = 'border-violet bg-violet/10 text-ink-deep font-medium';
              }

              return (
                <button
                  key={opt.id}
                  disabled={!!feedback}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-md border font-code text-[15px] transition ${optionStyle}`}
                >
                  <span className="font-code opacity-60 mr-2">{opt.id}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`mt-5 p-4 rounded-md ${
                feedback.isCorrect ? 'bg-lime/10' : 'bg-pink/10'
              }`}
            >
              <p className={`font-medium ${feedback.isCorrect ? 'text-green-700' : 'text-pink'}`}>
                {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-body-md text-ink/70 mt-1">{feedback.explanation}</p>
              {feedback.tracked === false && (
                <p className="text-caption text-violet mt-2">
                  <Link to="/register" className="underline">Sign in</Link> to save your progress and streaks.
                </p>
              )}
            </div>
          )}

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