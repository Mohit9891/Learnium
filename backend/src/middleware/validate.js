const mongoose = require('mongoose');

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validateObjectIdParam(paramName) {
  return (req, res, next) => {
    if (!isObjectId(req.params[paramName])) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }
    next();
  };
}

function validateAttempt(req, res, next) {
  const { selectedOption, timeTakenSec } = req.body || {};
  if (typeof selectedOption !== 'string' || !selectedOption.trim()) {
    return res.status(400).json({ message: 'selectedOption is required' });
  }
  if (timeTakenSec !== undefined && (typeof timeTakenSec !== 'number' || timeTakenSec < 0)) {
    return res.status(400).json({ message: 'timeTakenSec must be a non-negative number' });
  }
  next();
}

function validateMistakeUpdate(req, res, next) {
  const { reviewStatus, notes } = req.body || {};
  const validStatuses = ['unreviewed', 'reviewing', 'learned'];
  if (reviewStatus !== undefined && !validStatuses.includes(reviewStatus)) {
    return res.status(400).json({ message: 'Invalid reviewStatus' });
  }
  if (notes !== undefined && typeof notes !== 'string') {
    return res.status(400).json({ message: 'notes must be a string' });
  }
  if (typeof notes === 'string' && notes.length > 2000) {
    return res.status(400).json({ message: 'notes must be under 2000 characters' });
  }
  if (reviewStatus === undefined && notes === undefined) {
    return res.status(400).json({ message: 'Nothing to update' });
  }
  next();
}

function validateDifficultyQuery(req, res, next) {
  const { difficulty, solved } = req.query || {};
  if (difficulty !== undefined && !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ message: 'Invalid difficulty filter' });
  }
  if (solved !== undefined && !['solved', 'unsolved', 'wrong', 'bookmarked'].includes(solved)) {
    return res.status(400).json({ message: 'Invalid solved filter' });
  }
  next();
}

module.exports = {
  validateObjectIdParam,
  validateAttempt,
  validateMistakeUpdate,
  validateDifficultyQuery,
};
