const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export default function FilterBar({ difficulty, onDifficultyChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-caption font-medium text-ink/60 uppercase tracking-wide">Difficulty</span>
      {DIFFICULTY_OPTIONS.map((opt) => {
        const active = (difficulty || '') === opt.value;
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            onClick={() => onDifficultyChange(opt.value)}
            className={`px-3 py-1.5 rounded-md border text-caption font-medium transition ${
              active
                ? 'border-violet bg-violet/10 text-ink-deep'
                : 'border-hairline-cool text-ink/60 hover:border-violet'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
