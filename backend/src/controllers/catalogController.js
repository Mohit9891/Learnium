const { Exam, Subject, Chapter } = require('../models');

// GET /api/exams
async function getExams(req, res) {
  try {
    const exams = await Exam.find().lean();
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch exams', error: err.message });
  }
}

// GET /api/exams/:examId/subjects
async function getSubjectsByExam(req, res) {
  try {
    const { examId } = req.params;
    const subjects = await Subject.find({ exam: examId }).lean();
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
}

// GET /api/subjects/:subjectId/chapters
async function getChaptersBySubject(req, res) {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId })
      .sort({ orderIndex: 1 })
      .lean();
    res.json({ chapters });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chapters', error: err.message });
  }
}

module.exports = { getExams, getSubjectsByExam, getChaptersBySubject };