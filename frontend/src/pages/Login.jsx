import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/exams';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-canvas-dark lm-starfield min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="block text-center font-display font-bold text-xl text-white mb-8"
        >
          Learnium
        </Link>

        <div className="bg-white rounded-xxl p-8">
          <h1 className="font-display font-medium text-heading-xl text-ink-deep mb-1">
            Welcome back
          </h1>
          <p className="text-body-md text-ink/60 mb-6">Sign in to pick up where you left off.</p>

          {error && (
            <p className="mb-4 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-md font-medium text-ink-deep mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <label className="block text-body-md font-medium text-ink-deep mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-hairline-cloud" />
            <span className="text-caption text-ink/50">or</span>
            <span className="h-px flex-1 bg-hairline-cloud" />
          </div>

          <GoogleSignInButton from={from} />

          <p className="mt-6 text-body-md text-ink/70 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}