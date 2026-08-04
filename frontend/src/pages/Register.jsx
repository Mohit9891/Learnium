import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.user, res.data.token);
      navigate('/exams');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
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
            Create your account
          </h1>
          <p className="text-body-md text-ink/60 mb-6">Start practicing in minutes.</p>

          {error && (
            <p className="mb-4 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-md font-medium text-ink-deep mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
                placeholder="Mohit Kumar"
              />
            </div>

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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-body-md text-ink/70 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-violet font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}