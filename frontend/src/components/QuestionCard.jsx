export default function QuestionCard({ question, selectedOption, feedback, disabled, onSelect }) {
  if (!question) return null;

  return (
    <div className="bg-white rounded-xxl border border-hairline-cloud p-6">
      <p className="text-micro-cap font-semibold uppercase tracking-[0.25px] text-violet mb-3">
        {question.difficulty}
      </p>
      <p className="font-display font-medium text-heading-md text-ink-deep mb-6">
        {question.questionText}
      </p>

      <div className="space-y-3">
        {question.options.map((opt) => {
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
              type="button"
              disabled={disabled || !!feedback}
              onClick={() => onSelect(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-md border font-code text-[15px] transition ${optionStyle}`}
            >
              <span className="font-code opacity-60 mr-2">{opt.id}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
