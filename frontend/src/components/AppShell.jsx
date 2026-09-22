import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Layers,
  NotebookPen,
  CalendarCheck,
  ListChecks,
  Sparkles,
  Bot,
  TrendingUp,
  FileSearch,
  User,
  Settings,
  Flame,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const SECTIONS = [
  {
    title: 'Study',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
      { to: '/exams', label: 'Practice', Icon: BookOpen },
      { to: '/mocks', label: 'Mock Tests', Icon: ClipboardList },
      { to: null, label: 'Flashcards', Icon: Layers, soon: true },
    ],
  },
  {
    title: 'My Learning',
    items: [
      { to: '/mistakes', label: 'Mistake Notebook', Icon: NotebookPen },
      { to: '/revision', label: 'Revision Planner', Icon: CalendarCheck },
      { to: '/suggestions', label: 'AI Suggestions', Icon: Sparkles },
      { to: '/plan', label: 'Study Plan', Icon: ListChecks },
    ],
  },
  {
    title: 'Tools',
    items: [
      { to: null, label: 'AI Tutor', Icon: Bot, soon: true },
      { to: '/analysis', label: 'Topic Analyzer', Icon: TrendingUp },
      { to: '/pyq', label: 'PYQ Explorer', Icon: FileSearch },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/profile', label: 'Profile', Icon: User },
      { to: '/settings', label: 'Settings', Icon: Settings },
    ],
  },
];

function SoonChip() {
  return (
    <span className="ml-auto text-micro-cap font-semibold uppercase tracking-wide text-violet bg-violet/10 border border-violet/30 rounded-xs px-1.5 py-0.5">
      Soon
    </span>
  );
}

function SidebarNav() {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-3 mb-2 text-micro-cap font-semibold uppercase tracking-[0.15em] text-ink/40">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map(({ to, label, Icon, soon }) =>
              soon || !to ? (
                <li
                  key={label}
                  title="Coming soon"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-ink/40 cursor-not-allowed select-none"
                >
                  <Icon size={17} />
                  <span className="text-body-md">{label}</span>
                  <SoonChip />
                </li>
              ) : (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-body-md transition ${
                        isActive
                          ? 'bg-violet/10 text-ink-deep font-medium border border-violet/30'
                          : 'text-ink/70 hover:text-ink hover:bg-hairline-cloud/50'
                      }`
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}

const TABS = [
  { to: '/exams', label: 'Practice', Icon: BookOpen },
  { to: '/dashboard', label: 'Home', Icon: LayoutDashboard },
  { to: '/mocks', label: 'Mocks', Icon: ClipboardList },
  { to: '/mistakes', label: 'Mistakes', Icon: NotebookPen },
];

function BottomTabs() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-hairline-cloud">
      <ul className="flex">
        {TABS.map(({ to, label, Icon }) => (
          <li key={label} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-micro-cap font-medium transition ${
                  isActive ? 'text-violet' : 'text-ink/50'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .get('/dashboard/summary')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [user]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="bg-white min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen border-r border-hairline-cloud sticky top-0 h-screen">
        <Link to="/" className="px-6 pt-5 pb-1 font-display font-bold text-lg text-ink-deep">
          Learnium
        </Link>
        <SidebarNav />
        <div className="p-3 border-t border-hairline-cloud">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-body-md text-ink/60 hover:text-pink transition"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-hairline-cloud">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <Link to="/" className="lg:hidden font-display font-bold text-ink-deep">
              Learnium
            </Link>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-2 sm:gap-3">
              {stats && stats.streak > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-violet/10 border border-violet/30 text-caption font-semibold text-violet-deep">
                  <Flame size={14} />
                  {stats.streak}
                </span>
              )}
              {stats && (
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-lime/15 border border-lime text-caption font-semibold text-ink-deep">
                  {stats.accuracy}% acc
                </span>
              )}
              <Link
                to="/profile"
                title={user?.email || 'Profile'}
                className="w-8 h-8 rounded-full bg-violet-deep text-white font-display font-semibold text-sm flex items-center justify-center hover:brightness-110 transition"
              >
                {(user?.name || 'S').charAt(0).toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>

      <BottomTabs />
    </div>
  );
}
