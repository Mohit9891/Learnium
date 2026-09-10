function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler — keeps response shape consistent and
// avoids leaking stack traces in production.
function errorHandler(err, req, res, next) {
  // Mongoose bad ObjectId
  if (err && err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  // Mongoose validation
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', error: err.message });
  }
  // Duplicate key
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate entry' });
  }
  const status = err && err.status ? err.status : 500;
  const payload = { message: err && err.message ? err.message : 'Internal server error' };
  if (process.env.NODE_ENV !== 'production' && err && err.stack) {
    payload.error = err.message;
  }
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
