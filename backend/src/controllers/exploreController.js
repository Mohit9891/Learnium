const mongoose = require('mongoose');
const { Question } = require('../models');

// GET /api/explore?examId&subjectId&chapterId&year&difficulty&search&page&limit
// Public PYQ/question search. Answers always stripped (same anti-cheat rule
// as the solve flow).
async function exploreQuestions(req, res, next) {
  try {
    const {
      chapterId,
      subjectId,
      examId,
      year,
      difficulty,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    for (const [key, val] of [
      ['chapterId', chapterId],
      ['subjectId', subjectId],
      ['examId', examId],
    ]) {
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        return res.status(400).json({ message: `Invalid ${key}` });
      }
    }
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty filter' });
    }
    const yearNum = year ? Number(year) : null;
    if (year && (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100)) {
      return res.status(400).json({ message: 'Invalid year filter' });
    }

    const pipeline = [];
    const match = {};
    if (chapterId) match.chapter = new mongoose.Types.ObjectId(chapterId);
    if (difficulty) match.difficulty = difficulty;
    if (yearNum) match.year = yearNum;
    if (search) match.questionText = new RegExp(search, 'i');
    pipeline.push({ $match: match });

    // Resolve chapter → subject → exam for hierarchy filters + labels.
    pipeline.push(
      {
        $lookup: { from: 'chapters', localField: 'chapter', foreignField: '_id', as: 'chapter' },
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: 'subjects', localField: 'chapter.subject', foreignField: '_id', as: 'subject' },
      },
      { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } },
      {
        $lookup: { from: 'exams', localField: 'subject.exam', foreignField: '_id', as: 'exam' },
      },
      { $unwind: { path: '$exam', preserveNullAndEmptyArrays: true } }
    );
    if (subjectId) pipeline.push({ $match: { 'chapter.subject': new mongoose.Types.ObjectId(subjectId) } });
    if (examId) pipeline.push({ $match: { 'subject.exam': new mongoose.Types.ObjectId(examId) } });

    pipeline.push({ $sort: { year: -1, createdAt: -1 } });

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lm = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    pipeline.push(
      {
        $facet: {
          rows: [
            { $skip: (pg - 1) * lm },
            { $limit: lm },
            {
              $project: {
                questionText: 1,
                options: 1,
                difficulty: 1,
                year: 1,
                tags: 1,
                chapterId: '$chapter._id',
                chapterName: '$chapter.name',
                subjectName: '$subject.name',
                examName: '$exam.name',
              },
            },
          ],
          count: [{ $count: 'total' }],
        },
      }
    );

    const [result] = await Question.aggregate(pipeline);
    const total = result && result.count[0] ? result.count[0].total : 0;
    res.json({ questions: result ? result.rows : [], page: pg, limit: lm, total });
  } catch (err) {
    next(err);
  }
}

module.exports = { exploreQuestions };
