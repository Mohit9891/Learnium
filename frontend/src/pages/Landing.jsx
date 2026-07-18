import { Link } from 'react-router-dom';

const FEATURE_SHAPES = [
  {
    label: 'PYQs',
    shape: 'star',
    bg: 'bg-lime',
    text: 'text-forest',
    className: 'top-0 right-24 w-40 h-40',
    rotate: '-rotate-6',
  },
  {
    label: 'Flashcards',
    shape: 'blob',
    bg: 'bg-sky',
    text: 'text-white',
    className: 'top-24 right-0 w-36 h-36',
    rotate: 'rotate-3',
  },
  {
    label: 'Mock Tests',
    shape: 'circle',
    bg: 'bg-sky-light',
    text: 'text-forest',
    className: 'top-60 right-32 w-32 h-32',
    rotate: '-rotate-2',
  },
  {
    label: 'Mistakes',
    shape: 'blob',
    bg: 'bg-forest',
    text: 'text-lime',
    className: 'top-72 right-2 w-32 h-32',
    rotate: 'rotate-6',
  },
];

function StarShape({ className }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <path
        fill="currentColor"
        d="M100 0 L118 72 L192 60 L132 104 L164 172 L100 128 L36 172 L68 104 L8 60 L82 72 Z"
      />
    </svg>
  );
}

function PlusShape({ className }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="38" y="0" width="24" height="100" rx="8" fill="currentColor" />
      <rect x="0" y="38" width="100" height="24" rx="8" fill="currentColor" />
    </svg>
  );
}

function FeatureSticker({ label, shape, bg, text, className, rotate }) {
  const base = `absolute ${className} ${rotate} flex items-center justify-center shadow-lg transition-transform hover:scale-105 hover:rotate-0`;

  if (shape === 'star') {
    return (
      <div className={`${base} ${text}`}>
        <StarShape className={`absolute inset-0 w-full h-full ${bg.replace('bg-', 'text-')}`} />
        <span className="relative font-display font-semibold text-sm">{label}</span>
      </div>
    );
  }

  if (shape === 'circle') {
    return (
      <div className={`${base} ${bg} ${text} rounded-full`}>
        <span className="font-display font-semibold text-sm">{label}</span>
      </div>
    );
  }

  // blob: rounded-full with asymmetric radii for an organic feel
  return (
    <div
      className={`${base} ${bg} ${text}`}
      style={{ borderRadius: '42% 58% 65% 35% / 45% 45% 55% 55%' }}
    >
      <span className="font-display font-semibold text-sm px-2 text-center">{label}</span>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-forest text-lg">L</span>
          </div>
          <span className="font-display font-semibold text-xl text-forest">Learnium</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-forest font-medium text-sm">
          <Link to="/exams">Practice</Link>
          <Link to="/dashboard">Progress</Link>
          <Link to="/mistakes">Mistake Notebook</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full bg-white text-forest text-sm font-medium shadow-sm hover:shadow transition"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-forest text-white text-sm font-medium hover:bg-forest-light transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-8 pt-12 pb-40 md:pb-56">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display font-semibold text-forest text-5xl md:text-6xl leading-[1.05]">
              Stop Reading
              <br />
              PDFs. Start{' '}
              <span className="text-sky">Solving</span>
              <br />
              Them.
            </h1>

            <p className="mt-6 text-forest/80 text-lg max-w-md">
              Practice previous year questions interactively, track every
              mistake, and revise smarter — built for Class 10, Class 12, and
              CUET students.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-3 group"
            >
              <span className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-white group-hover:bg-forest-light transition">
                →
              </span>
              <span className="font-display font-medium text-forest">
                Start Practicing Free
              </span>
            </Link>
          </div>

          {/* Sticker collage — desktop only, keeps mobile hero clean */}
          <div className="relative h-[420px] hidden md:block">
            <PlusShape className="absolute top-4 right-4 w-10 h-10 text-lime" />
            {FEATURE_SHAPES.map((shape) => (
              <FeatureSticker key={shape.label} {...shape} />
            ))}
          </div>
        </div>
      </section>

      {/* Secondary section teaser */}
      <section className="bg-white px-8 py-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-cream rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-medium text-forest/60 mb-3">Physics · Laws of Motion</p>
            <p className="font-display font-medium text-forest text-lg mb-4">
              What is the SI unit of force?
            </p>
            <div className="space-y-2">
              {['Joule', 'Newton', 'Watt', 'Pascal'].map((opt, i) => (
                <div
                  key={opt}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    i === 1
                      ? 'border-sky bg-sky/10 text-forest font-medium'
                      : 'border-forest/10 text-forest/70'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display font-semibold text-forest text-3xl mb-4">
              Every wrong answer becomes a lesson
            </h2>
            <p className="text-forest/70 text-lg">
              Questions you get wrong are saved automatically to your Mistake
              Notebook — retry them, add notes, and mark them learned once
              they've actually stuck.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}