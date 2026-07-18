const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getExams,
  getSubjectsByExam,
  getChaptersBySubject,
} = require('../controllers/catalogController');

router.get('/exams', authMiddleware, getExams);
router.get('/exams/:examId/subjects', authMiddleware, getSubjectsByExam);
router.get('/subjects/:subjectId/chapters', authMiddleware, getChaptersBySubject);

module.exports = router;