const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getQuestionsByChapter,
  getQuestionById,
  submitAttempt,
  bookmarkQuestion,
  removeBookmark,
} = require('../controllers/questionController');

router.get('/chapters/:chapterId/questions', authMiddleware, getQuestionsByChapter);
router.get('/questions/:id', authMiddleware, getQuestionById);
router.post('/questions/:id/attempt', authMiddleware, submitAttempt);
router.post('/questions/:id/bookmark', authMiddleware, bookmarkQuestion);
router.delete('/questions/:id/bookmark', authMiddleware, removeBookmark);

module.exports = router;