const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { resolveRole, isAdminEmail } = require('../utils/adminAllowlist');

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
const SERVER_URL = (process.env.SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');

let googleEnabled = false;

// Placeholder values like "xyz" must not count as configured — otherwise the
// app tries Google with a client ID Google has never heard of (invalid_client).
const credsValid =
  GOOGLE_CLIENT_ID.length > 20 &&
  GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com') &&
  GOOGLE_CLIENT_SECRET.length > 0 &&
  GOOGLE_CLIENT_SECRET !== 'xyz';

if (credsValid) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const profileEmail = profile.emails?.[0]?.value?.toLowerCase();
          if (!profileEmail) {
            return done(new Error('Google account has no email address'), null);
          }
          // Check if user exists with this googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update avatar if changed
            if (profile.photos?.[0]?.value && user.avatarUrl !== profile.photos[0].value) {
              user.avatarUrl = profile.photos[0].value;
              await user.save();
            }
            if (isAdminEmail(user.email) && user.role !== 'admin') {
              user.role = 'admin';
              await user.save();
            }

            // Generate JWT token (unified payload: { id, email, role })
            const token = jwt.sign(
              { id: user._id, email: user.email, role: user.role },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRY || '7d' }
            );

            return done(null, { user, token });
          }

          // Check if user exists with same email (local auth user)
          const existingUser = await User.findOne({ email: profileEmail });

          if (existingUser) {
            // Link Google account to existing user
            existingUser.googleId = profile.id;

            // Update avatar if not set
            if (!existingUser.avatarUrl && profile.photos?.[0]?.value) {
              existingUser.avatarUrl = profile.photos[0].value;
            }
            if (isAdminEmail(profileEmail)) existingUser.role = 'admin';

            await existingUser.save();

            const token = jwt.sign(
              { id: existingUser._id, email: existingUser.email, role: existingUser.role },
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRY || '7d' }
            );

            return done(null, { user: existingUser, token });
          }

          // Create new user with Google auth
          const newUser = new User({
            name: profile.displayName || profileEmail.split('@')[0],
            email: profileEmail,
            googleId: profile.id,
            avatarUrl: profile.photos?.[0]?.value || null,
            role: resolveRole(profileEmail, 'student'),
          });

          await newUser.save();

          const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
          );

          return done(null, { user: newUser, token });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
  googleEnabled = true;
} else {
  console.warn('Google OAuth disabled: set real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
}

// Serialization for session (if needed)
passport.serializeUser((data, done) => {
  done(null, data && data.user ? data.user._id : null);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.googleEnabled = googleEnabled;

module.exports = passport;
