import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage(res.data.message);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-canvas-dark lm-starfield min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center font-display font-bold text-xl text-white mb-8">
          Learnium
        </Link>

        <div className="bg-white rounded-xxl p-8">
          <h1 className="font-display font-medium text-heading-xl text-ink-deep mb-1">New password</h1>
          <p className="text-body-md text-ink/60 mb-6">Choose a password of at least 8 characters.</p>

          {message && (
            <p
              className={`mb-4 text-caption rounded-md px-3 py-2 ${
                isError ? 'text-red-600 bg-red-50' : 'text-ink-deep bg-lime/15 border border-lime'
              }`}
            >
              {message}
            </p>
          )}

          {!token ? (
            <p className="text-body-md text-ink/70 text-center">
              This link is missing its token.{' '}
              <Link to="/forgot-password" className="text-violet font-medium">
                Request a new one
              </Link>
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-body-md font-medium text-ink-deep mb-1">New password</label>
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
                {loading ? 'Saving...' : 'Set new password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-body-md text-ink/70 text-center">
            <Link to="/login" className="text-violet font-medium">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
