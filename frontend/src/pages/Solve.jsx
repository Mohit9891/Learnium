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
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-forest/60">Loading questions...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-forest/60 mb-4">No questions in this chapter yet.</p>
          <Link to="/exams" className="text-sky font-medium">
            ← Back to exams
          </Link>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center max-w-sm w-full">
          <p className="font-display font-semibold text-forest text-3xl mb-2">
            {score.correct} / {score.attempted}
          </p>
          <p className="text-forest/60 mb-8">Questions answered correctly</p>
          <Link
            to="/exams"
            className="inline-block px-6 py-2.5 rounded-full bg-forest text-white font-medium hover:bg-forest-light transition"
          >
            Practice Another Chapter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/exams" className="text-sm text-forest/60 hover:text-forest">
            ← Exit
          </Link>
          <span className="text-sm font-medium text-forest/60">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-xs font-medium text-sky mb-3 uppercase tracking-wide">
            {currentQuestion.difficulty}
          </p>
          <p className="font-display font-medium text-forest text-xl mb-6">
            {currentQuestion.questionText}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrectAnswer = feedback && opt.id === feedback.correctOption;
              const isWrongSelected = feedback && isSelected && !feedback.isCorrect;

              let optionStyle = 'border-forest/15 text-forest/80 hover:border-sky';
              if (feedback) {
                if (isCorrectAnswer) {
                  optionStyle = 'border-green-500 bg-green-50 text-forest font-medium';
                } else if (isWrongSelected) {
                  optionStyle = 'border-red-400 bg-red-50 text-forest';
                } else {
                  optionStyle = 'border-forest/10 text-forest/50';
                }
              } else if (isSelected) {
                optionStyle = 'border-sky bg-sky/10 text-forest font-medium';
              }

              return (
                <button
                  key={opt.id}
                  disabled={!!feedback}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition ${optionStyle}`}
                >
                  <span className="font-medium mr-2">{opt.id}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`mt-5 p-4 rounded-lg ${
                feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <p className={`font-medium ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-sm text-forest/70 mt-1">{feedback.explanation}</p>
            </div>
          )}

          <div className="mt-6">
            {!feedback ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className="w-full py-2.5 rounded-full bg-forest text-white font-medium hover:bg-forest-light transition disabled:opacity-40"
              >
                {submitting ? 'Checking...' : 'Submit Answer'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-2.5 rounded-full bg-forest text-white font-medium hover:bg-forest-light transition"
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