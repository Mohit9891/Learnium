import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAdmin({ children }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <p className="text-ink/60">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display font-bold text-heading-xl text-ink-deep mb-2">Not authorized</p>
          <p className="text-body-md text-ink/60 mb-4">This area is for admins only.</p>
          <a href="/dashboard" className="text-violet font-medium">
            ← Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
