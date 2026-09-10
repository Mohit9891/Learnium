const jwt = require('jsonwebtoken');

function normalizePayload(decoded) {
  // Support both legacy { id } and Google { userId } payloads.
  const id = decoded.id || decoded.userId || decoded.sub;
  return { ...decoded, id };
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = normalizePayload(decoded);
    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Public routes: attach user when a valid token is present, otherwise
// continue as anonymous (req.user = null). Invalid tokens do NOT 401 here.
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = normalizePayload(decoded);
    if (!req.user.id) req.user = null;
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuth = optionalAuth;
module.exports.requireRole = requireRole;
