const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { resolveRole, isAdminEmail } = require('../utils/adminAllowlist');

function getClient() {
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

function signAppToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
  };
}

// POST /api/auth/google  body: { idToken }
async function verifyGoogle(req, res, next) {
  try {
    const { idToken } = req.body || {};
    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ message: 'idToken is required' });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({ message: 'Google sign-in is not configured on the server' });
    }

    let payload;
    try {
      const ticket = await getClient().verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Google credential' });
    }

    const googleId = payload.sub;
    const email = (payload.email || '').toLowerCase();
    if (!googleId || !email) {
      return res.status(401).json({ message: 'Google account has no email address' });
    }
    if (payload.email_verified === false) {
      return res.status(401).json({ message: 'Google email is not verified' });
    }
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Invalid Google credential audience' });
    }

    let user = await User.findOne({ googleId });
    if (user) {
      let changed = false;
      if (payload.picture && user.avatarUrl !== payload.picture) {
        user.avatarUrl = payload.picture;
        changed = true;
      }
      // Auto-promote allowlisted emails even for existing users.
      if (isAdminEmail(email) && user.role !== 'admin') {
        user.role = 'admin';
        changed = true;
      }
      if (changed) await user.save();
      return res.json({ user: toPublicUser(user), token: signAppToken(user) });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      existing.googleId = googleId;
      if (!existing.avatarUrl && payload.picture) existing.avatarUrl = payload.picture;
      if (isAdminEmail(email)) existing.role = 'admin';
      await existing.save();
      return res.json({ user: toPublicUser(existing), token: signAppToken(existing) });
    }

    const created = await User.create({
      name: payload.name || email.split('@')[0],
      email,
      googleId,
      avatarUrl: payload.picture || null,
      role: resolveRole(email, 'student'),
    });
    return res.status(201).json({ user: toPublicUser(created), token: signAppToken(created) });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyGoogle };
