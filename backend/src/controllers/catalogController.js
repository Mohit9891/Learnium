const { Exam, Subject, Chapter } = require('../models');

// GET /api/exams (public)
async function getExams(req, res, next) {
  try {
    const exams = await Exam.find().lean();
    res.json({ exams });
  } catch (err) {
    next(err);
  }
}

// GET /api/exams/:examId/subjects (public)
async function getSubjectsByExam(req, res, next) {
  try {
    const { examId } = req.params;
    const subjects = await Subject.find({ exam: examId }).lean();
    res.json({ subjects });
  } catch (err) {
    next(err);
  }
}

// GET /api/subjects/:subjectId/chapters (public)
async function getChaptersBySubject(req, res, next) {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subject: subjectId })
      .sort({ orderIndex: 1 })
      .lean();
    res.json({ chapters });
  } catch (err) {
    next(err);
  }
}

module.exports = { getExams, getSubjectsByExam, getChaptersBySubject };
