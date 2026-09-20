const mongoose = require('mongoose');
const { Attempt, Question } = require('../models');

// GET /api/progress/overview
// Per-chapter attempt stats for the signed-in user + "continue where you
// left off". Anonymous callers get empty stats (browse pages stay public).
async function getProgressOverview(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.json({ chapters: {}, continue: null });
    }

    const stats = await Attempt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'questions',
          localField: 'question',
          foreignField: '_id',
          as: 'q',
        },
      },
      { $unwind: '$q' },
      {
        $group: {
          _id: '$q.chapter',
          attempted: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          lastAt: { $max: '$attemptedAt' },
        },
      },
      {
        $lookup: {
          from: 'chapters',
          localField: '_id',
          foreignField: '_id',
          as: 'chapter',
        },
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'subjects',
          localField: 'chapter.subject',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'exams',
          localField: 'subject.exam',
          foreignField: '_id',
          as: 'exam',
        },
      },
      { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          chapterId: '$_id',
          chapterName: '$chapter.name',
          subjectId: '$subject._id',
          subjectName: '$subject.name',
          examId: '$exam._id',
          examName: '$exam.name',
          attempted: 1,
          correct: 1,
          lastAt: 1,
        },
      },
    ]);

    const chapterIds = stats.map((s) => s.chapterId).filter(Boolean);
    const totals = chapterIds.length
      ? await Question.aggregate([
          { $match: { chapter: { $in: chapterIds } } },
          { $group: { _id: '$chapter', total: { $sum: 1 } } },
        ])
      : [];
    const totalByChapter = Object.fromEntries(totals.map((t) => [String(t._id), t.total]));

    const chapters = {};
    for (const s of stats) {
      const key = String(s.chapterId);
      chapters[key] = {
        chapterId: s.chapterId,
        chapterName: s.chapterName || null,
        subjectId: s.subjectId || null,
        subjectName: s.subjectName || null,
        examId: s.examId || null,
        examName: s.examName || null,
        attempted: s.attempted,
        correct: s.correct,
        total: totalByChapter[key] || 0,
        accuracy: s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0,
        lastAt: s.lastAt,
      };
    }

    let cont = null;
    for (const s of stats) {
      if (!cont || new Date(s.lastAt) > new Date(cont.lastAt)) cont = s;
    }

    res.json({
      chapters,
      continue: cont
        ? {
            chapterId: cont.chapterId,
            chapterName: cont.chapterName,
            subjectName: cont.subjectName,
            examName: cont.examName,
            lastAt: cont.lastAt,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProgressOverview };
