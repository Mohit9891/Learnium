import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');
    if (err) {
      setError('Google sign-in failed. Try again.');
      return;
    }
    if (!token) {
      setError('Missing token from Google sign-in.');
      return;
    }
    localStorage.setItem('learnium_token', token);
    api
      .get('/auth/me')
      .then((res) => {
        login(res.data.user, token);
        navigate('/exams', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('learnium_token');
        setError('Google sign-in failed. Try again.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link to="/login" className="text-violet font-medium">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <p className="text-ink/60">Signing you in with Google...</p>
    </div>
  );
}
