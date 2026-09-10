import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/content', label: 'Content' },
  { to: '/admin/import', label: 'CSV Import' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white min-h-screen">
      <header className="border-b border-hairline-cloud">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display font-bold text-lg text-ink-deep">
              Learnium · Admin
            </Link>
            <nav className="flex gap-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-caption font-medium transition ${
                      isActive ? 'bg-violet/10 text-ink-deep border border-violet' : 'text-ink/60 hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption text-ink/60">{user?.email}</span>
            <button onClick={logout} className="text-caption font-medium text-pink hover:underline">
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
