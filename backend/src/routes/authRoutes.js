const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { verifyGoogle } = require('../controllers/googleAuthController');
const authMiddleware = require('../middleware/authMiddleware');
const passport = require('../config/passport');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

// GIS (Google Identity Services) — primary flow: frontend sends Google ID token.
router.post('/google', verifyGoogle);

// Public diagnostics — reports whether Google sign-in is configured,
// without exposing any secret. Useful when the Google popup says invalid_client.
router.get('/google/status', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  res.json({
    gisConfigured: clientId.length > 20 && clientId.endsWith('.apps.googleusercontent.com'),
    redirectConfigured: Boolean(passport.googleEnabled),
    adminAllowlistConfigured: Boolean((process.env.ADMIN_EMAILS || '').trim()),
  });
});

function requireGoogle(req, res, next) {
  if (!passport.googleEnabled) {
    return res.status(503).json({ message: 'Google sign-in is not configured on the server' });
  }
  next();
}

// Legacy server-side OAuth redirect flow — kept as fallback.
router.get(
  '/google',
  requireGoogle,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/redirect',
  requireGoogle,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  requireGoogle,
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  (req, res) => {
    const { token } = req.user || {};
    const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    if (!token) return res.redirect(`${frontend}/login?error=google`);
    return res.redirect(`${frontend}/auth/callback?token=${token}`);
  }
);

router.get('/google/failure', (req, res) =>
  res.status(401).json({ message: 'Google authentication failed' })
);

module.exports = router;
