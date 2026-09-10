import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// A valid Google Web client ID always ends with .apps.googleusercontent.com.
// Anything else (placeholder, truncated copy, wrong project) makes Google
// reject the popup with "Error 401: invalid_client".
const CLIENT_ID_VALID =
  GOOGLE_CLIENT_ID.length > 20 && GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com');

// Google Identity Services button: renders the real Google button when
// VITE_GOOGLE_CLIENT_ID is set; falls back to the legacy redirect link.
export default function GoogleSignInButton({ from = '/exams' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);
  const [error, setError] = useState('');
  const [gisReady, setGisReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID_VALID) return;
    if (window.google?.accounts?.id) {
      setGisReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGisReady(true);
    script.onerror = () => setError('Could not load Google sign-in. Check your connection and reload.');
    document.head.appendChild(script);
    return () => {
      // Keep the script cached for other pages; just mark not ready on unmount.
      setGisReady(false);
    };
  }, []);

  useEffect(() => {
    if (!gisReady || !CLIENT_ID_VALID || !window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          setError('');
          try {
            const res = await api.post('/auth/google', { idToken: response.credential });
            login(res.data.user, res.data.token);
            navigate(from, { replace: true });
          } catch (err) {
            setError(err.response?.data?.message || 'Google sign-in failed. Try again.');
          }
        },
        // Catches popup-level failures (e.g. invalid_client) and shows them
        // inline instead of leaving the user on a dead Google error page.
        error_callback: (err) => {
          if (err?.type === 'invalid_client') {
            setError(
              'Google rejected this app’s client ID (invalid_client). Make sure VITE_GOOGLE_CLIENT_ID matches the Web client ID in Google Cloud Console → Credentials, and that you redeployed after changing it.'
            );
          } else {
            setError('Google sign-in was blocked. Close the popup and try again.');
          }
        },
      });
      if (btnRef.current) {
        btnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
        });
      }
    } catch {
      setError('Could not initialize Google sign-in.');
    }
  }, [gisReady, from, login, navigate]);

  if (!CLIENT_ID_VALID) {
    return (
      <div>
        <a
          href={`${API_BASE}/auth/google`}
          className="block w-full text-center py-3 rounded-md border border-hairline-cool text-ink-deep font-ui text-sm font-bold uppercase tracking-[0.2px] hover:border-violet transition"
        >
          Continue with Google
        </a>
        {GOOGLE_CLIENT_ID && (
          <p className="mt-2 text-caption text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            Google button disabled: VITE_GOOGLE_CLIENT_ID doesn’t look like a real Web client ID (it must end with
            .apps.googleusercontent.com). Using redirect sign-in instead.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div ref={btnRef} className="flex justify-center" />
      {!gisReady && !error && <p className="text-caption text-ink/50 text-center mt-2">Loading Google sign-in...</p>}
      {error && <p className="mt-2 text-caption text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
    </div>
  );
}
