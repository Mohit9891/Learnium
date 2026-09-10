const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/authMiddleware');
const { validateObjectIdParam, validateDifficultyQuery } = require('../middleware/validate');
const {
  getExams,
  getSubjectsByExam,
  getChaptersBySubject,
} = require('../controllers/catalogController');

// Public catalog — browsing works logged-out; user-scoped filters handled downstream.
router.get('/exams', optionalAuth, getExams);
router.get('/exams/:examId/subjects', optionalAuth, validateObjectIdParam('examId'), getSubjectsByExam);
router.get(
  '/subjects/:subjectId/chapters',
  optionalAuth,
  validateObjectIdParam('subjectId'),
  getChaptersBySubject
);

module.exports = router;
