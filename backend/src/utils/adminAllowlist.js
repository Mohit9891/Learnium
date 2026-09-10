function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(String(email).trim().toLowerCase());
}

// Returns 'admin' if the email is allowlisted, else the provided fallback.
function resolveRole(email, fallback = 'student') {
  return isAdminEmail(email) ? 'admin' : fallback;
}

module.exports = { getAdminEmails, isAdminEmail, resolveRole };
