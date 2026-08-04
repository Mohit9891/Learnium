import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Chip({ children }) {
  return (
    <span className="inline-block bg-lime text-ink font-display font-bold px-2 py-0.5 rounded-xs">
      {children}
    </span>
  );
}

function AuthAwareNav() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="w-40 h-9" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-on-dark-muted text-sm hidden sm:inline">
          Hi, {user.name.split(' ')[0]}
        </span>
        <Link
          to="/dashboard"
          className="bg-white text-ink-press font-ui text-sm font-bold uppercase tracking-[0.2px] px-5 py-2.5 rounded-md hover:bg-white/90 transition"
        >
          Dashboard
        </Link>
        <button
          onClick={logout}
          className="text-on-dark-muted text-sm font-medium hover:text-white transition cursor-pointer"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        to="/login"
        className="text-on-dark-muted text-sm font-medium hover:text-white transition"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="bg-white text-ink-press font-ui text-sm font-bold uppercase tracking-[0.2px] px-5 py-2.5 rounded-md hover:bg-white/90 transition"
      >
        Get Started
      </Link>
    </div>
  );
}

const FEATURES = [
  {
    title: 'AI Tutor',
    body: 'Ask anything, any hour. It explains, checks your work, and remembers the mistakes you make — so it teaches to your gaps, not the average.',
  },
  {
    title: 'Interactive PYQs',
    body: 'Solve real previous-year questions directly in the browser — no PDFs, instant feedback on every answer.',
  },
  {
    title: 'Mistake Notebook',
    body: 'Every wrong answer is saved automatically, ready to retry, annotate, and mark learned once it actually sticks.',
  },
  {
    title: 'Personalized Study Plan',
    body: "Tell it your exam date. It builds the roadmap backwards from there and re-plans when life happens.",
    spotlight: true,
  },
  {
    title: 'Progress Analytics',
    body: 'One view of your streak, accuracy, and weak spots — no vanity stats, just what to touch next.',
  },
  {
    title: 'Flashcards',
    body: 'Generated from what you actually struggled with, resurfacing right before you forget.',
  },
];

export default function Landing() {
  const { user } = useAuth();
  const primaryCtaTarget = user ? '/exams' : '/register';

  return (
    <div className="bg-canvas-dark min-h-screen text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-canvas-dark/90 backdrop-blur-md border-b border-transparent">
        <div className="max-w-[1152px] mx-auto flex items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="font-display font-bold text-xl">
            Learnium
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/82">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#why" className="hover:text-white transition">Why Learnium</a>
            <a href="#testimonials" className="hover:text-white transition">Students</a>
          </div>
          <AuthAwareNav />
        </div>
      </nav>

      {/* Hero */}
      <header className="lm-starfield pt-24 pb-24 text-center">
        <div className="max-w-[1152px] mx-auto px-6">
          <div className="uppercase text-eyebrow font-medium text-pink tracking-[0.04em] mb-4">
            AI-powered learning platform
          </div>
          <h1 className="font-display font-bold text-4xl md:text-hero leading-[1.1] max-w-4xl mx-auto">
            Study <Chip>smarter</Chip>, not longer
          </h1>
          <p className="text-body-lg leading-relaxed text-on-dark-muted max-w-lg mx-auto mt-6">
            Learnium turns your exam prep into a living workspace — interactive PYQs, a mistake
            notebook, and (soon) an AI tutor that all know exactly what you keep getting wrong.
          </p>
          <div className="flex gap-4 justify-center items-center mt-8 flex-wrap">
            <Link
              to={primaryCtaTarget}
              className="inline-flex items-center justify-center bg-white text-ink-press font-ui text-sm font-bold uppercase tracking-[0.2px] px-6 py-3 rounded-md lm-glow hover:bg-white/90 transition"
            >
              {user ? 'Continue practicing' : 'Start learning free'}
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center text-white border border-hairline-violet font-ui text-sm font-medium px-6 py-3 rounded-md hover:bg-white/10 transition"
            >
              See what's inside
            </a>
          </div>
          <div className="text-caption text-on-dark-muted mt-6">
            Free forever plan · No credit card · Built for Class 10, 12 &amp; CUET students
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="pt-section pb-section">
        <div className="max-w-[1152px] mx-auto px-6">
          <div className="max-w-lg mb-16">
            <div className="uppercase text-eyebrow font-medium text-pink tracking-[0.04em] mb-3">
              Features
            </div>
            <h2 className="font-display font-medium text-display-lg">Everything talks to everything</h2>
            <p className="text-body-lg text-on-dark-muted mt-3">
              Not a pile of separate apps. One system where your practice, mistakes, and progress
              share the same memory of you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-xl p-6 border transition hover:-translate-y-1 ${
                  f.spotlight
                    ? 'bg-violet-deep border-violet-deep'
                    : 'bg-night border-hairline-violet hover:border-violet'
                }`}
              >
                <h3 className="font-display font-semibold text-heading-sm">{f.title}</h3>
                <p className="text-body-md text-on-dark-muted mt-3">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Learnium */}
      <section id="why" className="bg-white text-ink pt-section pb-section">
        <div className="max-w-[1152px] mx-auto px-6">
          <div className="max-w-lg mb-16">
            <div className="uppercase text-eyebrow font-medium text-violet tracking-[0.04em] mb-3">
              Why Learnium
            </div>
            <h2 className="font-display font-medium text-display-lg text-ink-deep">
              Same hours. Different outcomes.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-hairline-cloud p-8">
              <div className="text-micro-cap font-semibold uppercase tracking-[0.25px] opacity-50 mb-4">
                Traditional studying
              </div>
              <ul className="space-y-4">
                {[
                  'Re-read the chapter and hope it sticks',
                  "Find out what you don't know in the exam",
                  'Cram the night before, forget in a week',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-body-md text-ink opacity-60">
                    <span className="font-code">×</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-violet-deep border border-transparent text-white p-8">
              <div className="text-micro-cap font-semibold uppercase tracking-[0.25px] text-on-dark-muted mb-4">
                With Learnium
              </div>
              <ul className="space-y-4">
                {[
                  'Practice PYQs interactively, with instant feedback',
                  'Wrong answers become a personal mistake notebook',
                  'Weak spots surfaced weeks before the exam',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-body-md">
                    <span className="text-lime font-bold">›</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="lm-starfield border-t border-hairline-violet pt-section pb-section text-center">
        <div className="max-w-[1152px] mx-auto px-6">
          <h2 className="font-display font-bold text-3xl md:text-display-lg max-w-2xl mx-auto">
            Your next exam is <Chip>closer</Chip> than you think
          </h2>
          <p className="text-body-lg text-on-dark-muted max-w-md mx-auto mt-6">
            Start free today. Setting up your first chapter takes under a minute.
          </p>
          <Link
            to={primaryCtaTarget}
            className="inline-flex items-center justify-center bg-white text-ink-press font-ui text-sm font-bold uppercase tracking-[0.2px] px-6 py-3 rounded-md lm-glow hover:bg-white/90 transition mt-8"
          >
            {user ? 'Continue practicing' : 'Start learning free'}
          </Link>
          <div className="text-caption text-on-dark-muted mt-6">Free forever plan · No credit card</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-night border-t border-hairline-violet py-12">
        <div className="max-w-[1152px] mx-auto px-6 flex flex-wrap justify-between gap-8">
          <div className="font-display font-bold text-lg">Learnium</div>
          <div className="text-caption text-on-dark-muted">
            © {new Date().getFullYear()} Learnium. Built for students, by a student.
          </div>
        </div>
      </footer>
    </div>
  );
}