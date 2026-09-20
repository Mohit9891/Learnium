import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch {
      setMessage('Something went wrong. Try again.');
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
          <h1 className="font-display font-medium text-heading-xl text-ink-deep mb-1">Reset password</h1>
          <p className="text-body-md text-ink/60 mb-6">
            Enter your account email and we&apos;ll send you a reset link.
          </p>

          {message && (
            <p className="mb-4 text-caption text-ink-deep bg-lime/15 border border-lime rounded-md px-3 py-2">
              {message}
            </p>
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
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

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
