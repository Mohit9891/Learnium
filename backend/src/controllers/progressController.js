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
          avgTimeSec: { $avg: { $ifNull: ['$timeTakenSec', null] } },
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
          avgTimeSec: { $round: [{ $ifNull: ['$avgTimeSec', 0] }, 1] },
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
        avgTimeSec: s.avgTimeSec || 0,
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

module.exports = { getProgressOverview, getActivity };

// GET /api/progress/activity?days=7
// Daily attempt counts for the signed-in user (heat-strip + trends).
// Anonymous callers get an empty series.
async function getActivity(req, res, next) {
  try {
    const userId = req.user && req.user.id;
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 30);
    const series = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      series.push({
        date: d.toISOString().slice(0, 10),
        start: new Date(d),
        end: new Date(d.getTime() + 24 * 60 * 60 * 1000),
        attempted: 0,
        correct: 0,
      });
    }
    if (!userId) {
      return res.json({
        days: series.map(({ date, attempted, correct }) => ({ date, attempted, correct })),
      });
    }

    const from = series[0].start;
    const rows = await Attempt.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          attemptedAt: { $gte: from },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$attemptedAt' } },
          attempted: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        },
      },
    ]);
    const byDate = Object.fromEntries(rows.map((r) => [r._id, r]));
    res.json({
      days: series.map(({ date, attempted, correct }) => ({
        date,
        attempted: byDate[date] ? byDate[date].attempted : attempted,
        correct: byDate[date] ? byDate[date].correct : correct,
      })),
    });
  } catch (err) {
    next(err);
  }
}
