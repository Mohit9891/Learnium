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
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-lime rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-forest text-lg">L</span>
          </div>
          <span className="font-display font-semibold text-xl text-forest">Learnium</span>
        </Link>

        <h1 className="font-display font-semibold text-forest text-2xl mb-1">Create your account</h1>
        <p className="text-forest/60 text-sm mb-6">Start practicing in minutes.</p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-forest mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-forest/15 text-forest focus:outline-none focus:ring-2 focus:ring-sky"
              placeholder="Mohit Kumar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-forest/15 text-forest focus:outline-none focus:ring-2 focus:ring-sky"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-forest/15 text-forest focus:outline-none focus:ring-2 focus:ring-sky"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-forest text-white font-medium hover:bg-forest-light transition disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-sm text-forest/70 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-sky font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}