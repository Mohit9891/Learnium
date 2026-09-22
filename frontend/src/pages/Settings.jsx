import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xxl border border-hairline-cloud p-6 mb-4">
      <p className="font-display font-medium text-heading-sm text-ink-deep mb-4">{title}</p>
      {children}
    </div>
  );
}

function Toggle({ label, sub, storageKey, defaultOn }) {
  const [on, setOn] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? defaultOn : raw === '1';
    } catch {
      return defaultOn;
    }
  });
  function flip() {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(storageKey, next ? '1' : '0');
    } catch {}
  }
  return (
    <button onClick={flip} className="w-full flex items-center justify-between gap-4 py-2 text-left">
      <span>
        <span className="block text-body-md text-ink-deep">{label}</span>
        {sub && <span className="block text-caption text-ink/50">{sub}</span>}
      </span>
      <span
        className={`w-11 h-6 rounded-full p-0.5 transition shrink-0 ${on ? 'bg-violet' : 'bg-hairline-cool'}`}
        role="switch"
        aria-checked={on}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`}
        />
      </span>
    </button>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [confirm, setConfirm] = useState(null); // 'reset' | 'delete' | null
  const [dangerMsg, setDangerMsg] = useState('');
  const [dangerLoading, setDangerLoading] = useState(false);

  async function handlePassword(e) {
    e.preventDefault();
    setPwMsg('');
    setPwErr(false);
    setPwLoading(true);
    try {
      const res = await api.post('/account/change-password', { currentPassword, newPassword });
      setPwMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwErr(true);
      setPwMsg(err.response?.data?.message || 'Could not update password.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDanger() {
    if (!confirm) return;
    setDangerLoading(true);
    setDangerMsg('');
    try {
      if (confirm === 'reset') {
        const res = await api.delete('/account/progress');
        setDangerMsg(
          `Progress reset — ${res.data.deleted.attempts} attempts, ${res.data.deleted.bookmarks} bookmarks, ${res.data.deleted.mistakes} mistakes removed.`
        );
      } else {
        await api.delete('/account');
        logout();
        navigate('/', { replace: true });
        return;
      }
    } catch (err) {
      setDangerMsg(err.response?.data?.message || 'Action failed. Try again.');
    } finally {
      setDangerLoading(false);
      setConfirm(null);
    }
  }

  return (
    <div className="bg-white min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-caption text-ink/60 hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="font-display font-medium text-heading-xl text-ink-deep mt-4 mb-6">Settings</h1>

        <Section title="Account">
          <p className="text-body-md text-ink-deep">{user?.name}</p>
          <p className="text-body-md text-ink/60 mb-1">{user?.email}</p>
          <p className="text-caption text-ink/50">
            Role: {user?.role} · Google {user?.googleId ? 'linked ✓' : 'not linked'}
          </p>
        </Section>

        <Section title="Security">
          {user?.googleId && (
            <p className="text-body-md text-ink/60 mb-4">
              Google sign-in linked ✓ {`(${user.email})`}
            </p>
          )}
          <form onSubmit={handlePassword} className="space-y-3 max-w-sm">
              <div>
                <label className="block text-body-md font-medium text-ink-deep mb-1">
                  Current password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
                />
              </div>
              <div>
                <label className="block text-body-md font-medium text-ink-deep mb-1">
                  New password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-sm border border-hairline-cool text-ink focus:outline-none focus:ring-2 focus:ring-ring-focus"
                  placeholder="At least 8 characters"
                />
              </div>
              {pwMsg && (
                <p
                  className={`text-caption rounded-md px-3 py-2 ${
                    pwErr ? 'text-red-600 bg-red-50' : 'text-ink-deep bg-lime/15 border border-lime'
                  }`}
                >
                  {pwMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="px-5 py-2.5 rounded-md bg-primary text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-ink-press transition disabled:opacity-60"
              >
                {pwLoading ? 'Saving...' : 'Change password'}
              </button>
              <p className="text-caption text-ink/50">
                Signed in with Google only? Keep using Google — no password needed.
              </p>
            </form>
        </Section>

        <Section title="Notifications">
          <Toggle label="Daily reminder" sub="Nudge to protect your streak" storageKey="learnium_pref_reminder" defaultOn />
          <Toggle label="Revision nudges" sub="When mistakes become due" storageKey="learnium_pref_revision" defaultOn />
          <Toggle label="Mock alerts" sub="New mock availability" storageKey="learnium_pref_mock" defaultOn={false} />
        </Section>

        <Section title="Privacy">
          <Toggle label="Anonymous practice by default" sub="Attempts graded but not saved until you sign in" storageKey="learnium_pref_anon" defaultOn={false} />
          <Toggle label="Public leaderboard" sub="Show my stats to other learners" storageKey="learnium_pref_board" defaultOn={false} />
        </Section>

        <div className="rounded-xxl border border-pink/50 p-6 mb-4">
          <p className="font-display font-medium text-heading-sm text-ink-deep mb-1">Danger zone</p>
          <p className="text-body-md text-ink/60 mb-4">Irreversible actions. No undo.</p>
          {dangerMsg && (
            <p className="mb-3 text-caption text-ink-deep bg-hairline-cloud/40 rounded-md px-3 py-2">
              {dangerMsg}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setConfirm('reset')}
              className="px-5 py-2.5 rounded-md border border-pink text-pink font-ui text-sm font-bold uppercase tracking-[0.2px] hover:bg-pink/10 transition"
            >
              Reset progress
            </button>
            <button
              onClick={() => setConfirm('delete')}
              className="px-5 py-2.5 rounded-md bg-pink text-white font-ui text-sm font-bold uppercase tracking-[0.2px] hover:brightness-95 transition"
            >
              Delete account
            </button>
          </div>
        </div>

        {confirm && (
          <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xxl p-6 max-w-sm w-full">
              <p className="font-display font-medium text-heading-sm text-ink-deep mb-2">
                {confirm === 'reset' ? 'Reset all progress?' : 'Delete your account?'}
              </p>
              <p className="text-body-md text-ink/60 mb-5">
                {confirm === 'reset'
                  ? 'Every attempt, bookmark and mistake entry will be permanently removed. Your account stays.'
                  : 'Your account and every attempt, bookmark and mistake entry will be permanently removed. You will be signed out.'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDanger}
                  disabled={dangerLoading}
                  className="flex-1 py-2.5 rounded-md bg-pink text-white font-ui text-sm font-bold uppercase tracking-[0.2px] disabled:opacity-50"
                >
                  {dangerLoading ? 'Working...' : 'Yes, do it'}
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="flex-1 py-2.5 rounded-md border border-hairline-cool font-ui text-sm font-bold uppercase tracking-[0.2px] text-ink/70"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
