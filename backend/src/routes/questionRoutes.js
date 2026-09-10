const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');
const {
  validateObjectIdParam,
  validateAttempt,
  validateDifficultyQuery,
} = require('../middleware/validate');
const {
  getQuestionsByChapter,
  getQuestionById,
  submitAttempt,
  bookmarkQuestion,
  removeBookmark,
} = require('../controllers/questionController');

// Public reads (answers still stripped); writes that need identity stay protected.
router.get(
  '/chapters/:chapterId/questions',
  optionalAuth,
  validateObjectIdParam('chapterId'),
  validateDifficultyQuery,
  getQuestionsByChapter
);
router.get('/questions/:id', optionalAuth, validateObjectIdParam('id'), getQuestionById);
// Anonymous attempts allowed (graded, not stored — returns tracked:false).
router.post(
  '/questions/:id/attempt',
  optionalAuth,
  validateObjectIdParam('id'),
  validateAttempt,
  submitAttempt
);
router.post('/questions/:id/bookmark', authMiddleware, validateObjectIdParam('id'), bookmarkQuestion);
router.delete(
  '/questions/:id/bookmark',
  authMiddleware,
  validateObjectIdParam('id'),
  removeBookmark
);

module.exports = router;
