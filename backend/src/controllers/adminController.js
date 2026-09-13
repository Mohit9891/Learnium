const { parse } = require('csv-parse/sync');
const { User, Exam, Subject, Chapter, Question, Attempt } = require('../models');
const {
  slugify,
  upsertExam,
  upsertSubject,
  upsertChapter,
  validateQuestionInput,
  normalizeQuestionInput,
} = require('../services/contentService');

// ---------- Users ----------

async function listUsers(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { search, role } = req.query;
    const filter = {};
    if (role && ['student', 'admin'].includes(role)) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    res.json({ users, page, limit, total });
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body || {};
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'role must be student|admin' });
    }
    if (req.params.id === String(req.user.id) && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot demote yourself' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (req.params.id === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

// ---------- Overview / stats ----------

async function overview(req, res, next) {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [users, exams, subjects, chapters, questions, attempts, recentAttempts] = await Promise.all([
      User.countDocuments(),
      Exam.countDocuments(),
      Subject.countDocuments(),
      Chapter.countDocuments(),
      Question.countDocuments(),
      Attempt.countDocuments(),
      Attempt.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);
    const correct = await Attempt.countDocuments({ isCorrect: true });
    res.json({
      users,
      exams,
      subjects,
      chapters,
      questions,
      attempts,
      recentAttempts,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    });
  } catch (err) {
    next(err);
  }
}

async function chapterStats(req, res, next) {
  try {
    const stats = await Attempt.aggregate([
      {
        $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' },
      },
      { $unwind: '$q' },
      {
        $group: {
          _id: '$q.chapter',
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 20 },
      {
        $lookup: { from: 'chapters', localField: '_id', foreignField: '_id', as: 'chapter' },
      },
      { $unwind: { path: '$chapter', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          chapterId: '$_id',
          chapterName: '$chapter.name',
          attempts: 1,
          correct: 1,
          accuracy: {
            $cond: [{ $eq: ['$attempts', 0] }, 0, { $round: [{ $multiply: [{ $divide: ['$correct', '$attempts'] }, 100] }, 0] }],
          },
        },
      },
    ]);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

// ---------- Content CRUD ----------

async function createExam(req, res, next) {
  try {
    const { name, slug } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name is required' });
    const doc = await upsertExam(name.trim(), slug ? slugify(slug) : undefined);
    res.status(201).json({ exam: doc });
  } catch (err) {
    next(err);
  }
}

async function deleteExam(req, res, next) {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const subjects = await Subject.find({ exam: exam._id }).select('_id');
    const subjectIds = subjects.map((s) => s._id);
    const chapters = await Chapter.find({ subject: { $in: subjectIds } }).select('_id');
    const chapterIds = chapters.map((c) => c._id);
    await Question.deleteMany({ chapter: { $in: chapterIds } });
    await Chapter.deleteMany({ subject: { $in: subjectIds } });
    await Subject.deleteMany({ exam: exam._id });
    res.json({ message: 'Exam and its content deleted' });
  } catch (err) {
    next(err);
  }
}

async function createSubject(req, res, next) {
  try {
    const { examId, name, slug } = req.body || {};
    if (!examId || !name) return res.status(400).json({ message: 'examId and name are required' });
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const doc = await upsertSubject(examId, name.trim(), slug ? slugify(slug) : undefined);
    res.status(201).json({ subject: doc });
  } catch (err) {
    next(err);
  }
}

async function deleteSubject(req, res, next) {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const chapters = await Chapter.find({ subject: subject._id }).select('_id');
    await Question.deleteMany({ chapter: { $in: chapters.map((c) => c._id) } });
    await Chapter.deleteMany({ subject: subject._id });
    res.json({ message: 'Subject and its content deleted' });
  } catch (err) {
    next(err);
  }
}

async function createChapter(req, res, next) {
  try {
    const { subjectId, name, slug, orderIndex } = req.body || {};
    if (!subjectId || !name) return res.status(400).json({ message: 'subjectId and name are required' });
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const doc = await upsertChapter(subjectId, name.trim(), slug ? slugify(slug) : undefined, orderIndex ?? 0);
    res.status(201).json({ chapter: doc });
  } catch (err) {
    next(err);
  }
}

async function updateChapter(req, res, next) {
  try {
    const { name, orderIndex } = req.body || {};
    const update = {};
    if (name) update.name = name.trim();
    if (orderIndex !== undefined) update.orderIndex = orderIndex;
    const doc = await Chapter.findByIdAndUpdate(req.params.id, update, { returnDocument: 'after' });
    if (!doc) return res.status(404).json({ message: 'Chapter not found' });
    res.json({ chapter: doc });
  } catch (err) {
    next(err);
  }
}

async function deleteChapter(req, res, next) {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    await Question.deleteMany({ chapter: chapter._id });
    res.json({ message: 'Chapter and its questions deleted' });
  } catch (err) {
    next(err);
  }
}

async function createQuestion(req, res, next) {
  try {
    const { chapterId, ...q } = req.body || {};
    if (!chapterId) return res.status(400).json({ message: 'chapterId is required' });
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    const errors = validateQuestionInput(q);
    if (errors.length) return res.status(400).json({ message: 'Invalid question', errors });
    const doc = await Question.create(normalizeQuestionInput(q, chapterId));
    res.status(201).json({ question: doc });
  } catch (err) {
    next(err);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const existing = await Question.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Question not found' });
    const merged = {
      questionText: req.body.questionText ?? existing.questionText,
      options: req.body.options ?? existing.options,
      correctOption: req.body.correctOption ?? existing.correctOption,
      explanation: req.body.explanation ?? existing.explanation,
      difficulty: req.body.difficulty ?? existing.difficulty,
      year: req.body.year ?? existing.year,
      tags: req.body.tags ?? existing.tags,
    };
    const errors = validateQuestionInput(merged);
    if (errors.length) return res.status(400).json({ message: 'Invalid question', errors });
    const doc = await Question.findByIdAndUpdate(req.params.id, normalizeQuestionInput(merged, existing.chapter), {
      returnDocument: 'after',
    });
    res.json({ question: doc });
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const doc = await Question.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    next(err);
  }
}

async function listQuestions(req, res, next) {
  try {
    const { chapterId, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (chapterId) filter.chapter = chapterId;
    if (search) filter.questionText = new RegExp(search, 'i');
    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lm = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lm).limit(lm).lean(),
      Question.countDocuments(filter),
    ]);
    res.json({ questions, page: pg, limit: lm, total });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/questions/bulk  { chapterId, questions: [...] }
async function bulkQuestions(req, res, next) {
  try {
    const { chapterId, questions } = req.body || {};
    if (!chapterId) return res.status(400).json({ message: 'chapterId is required' });
    if (!Array.isArray(questions) || !questions.length) {
      return res.status(400).json({ message: 'questions must be a non-empty array' });
    }
    if (questions.length > 500) return res.status(400).json({ message: 'Max 500 questions per batch' });
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const docs = [];
    const errors = [];
    questions.forEach((q, i) => {
      const errs = validateQuestionInput(q);
      if (errs.length) errors.push({ index: i, errors: errs });
      else docs.push(normalizeQuestionInput(q, chapterId));
    });
    if (!docs.length) return res.status(400).json({ message: 'No valid questions', errors });
    const inserted = await Question.insertMany(docs);
    res.status(201).json({ imported: inserted.length, failed: errors.length, errors });
  } catch (err) {
    next(err);
  }
}

// CSV columns:
// examName,examSlug,subjectName,subjectSlug,chapterName,chapterSlug,orderIndex,
// questionText,optionA,optionB,optionC,optionD,optionE,correctOption,explanation,difficulty,year,tags
const CSV_COLUMNS = [
  'examName', 'examSlug', 'subjectName', 'subjectSlug', 'chapterName', 'chapterSlug', 'orderIndex',
  'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'optionE',
  'correctOption', 'explanation', 'difficulty', 'year', 'tags',
];

function rowToQuestion(row) {
  const options = [];
  [['A', row.optionA], ['B', row.optionB], ['C', row.optionC], ['D', row.optionD], ['E', row.optionE]].forEach(
    ([id, text]) => {
      if (text && String(text).trim()) options.push({ id, text: String(text).trim() });
    }
  );
  return {
    questionText: (row.questionText || '').trim(),
    options,
    correctOption: (row.correctOption || '').trim().toUpperCase(),
    explanation: (row.explanation || '').trim(),
    difficulty: (row.difficulty || 'medium').trim().toLowerCase(),
    year: row.year ? Number(row.year) : undefined,
    tags: row.tags ? String(row.tags).split(';').map((t) => t.trim()).filter(Boolean) : [],
  };
}

async function importCsv(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file is required (field: file)' });
    let records;
    try {
      records = parse(req.file.buffer.toString('utf8'), { columns: true, skip_empty_lines: true, trim: true });
    } catch (err) {
      return res.status(400).json({ message: 'Could not parse CSV', error: err.message });
    }
    if (!records.length) return res.status(400).json({ message: 'CSV has no data rows' });
    if (records.length > 1000) return res.status(400).json({ message: 'Max 1000 rows per import' });

    let imported = 0;
    const errors = [];
    // Group rows by chapter to reduce upsert calls.
    const chapterCache = new Map();

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const line = i + 2; // header = line 1
      try {
        if (!row.examName || !row.subjectName || !row.chapterName) {
          throw new Error('examName, subjectName, chapterName are required');
        }
        const examKey = `${row.examName}|${row.examSlug}`;
        const subjKey = `${examKey}|${row.subjectName}|${row.subjectSlug}`;
        const chapKey = `${subjKey}|${row.chapterName}|${row.chapterSlug}`;
        let chapter = chapterCache.get(chapKey);
        if (!chapter) {
          const exam = await upsertExam(row.examName.trim(), row.examSlug ? slugify(row.examSlug) : undefined);
          const subject = await upsertSubject(exam._id, row.subjectName.trim(), row.subjectSlug ? slugify(row.subjectSlug) : undefined);
          chapter = await upsertChapter(
            subject._id,
            row.chapterName.trim(),
            row.chapterSlug ? slugify(row.chapterSlug) : undefined,
            row.orderIndex ? Number(row.orderIndex) : 0
          );
          chapterCache.set(chapKey, chapter);
        }
        const q = rowToQuestion(row);
        const errs = validateQuestionInput(q);
        if (errs.length) throw new Error(errs.join('; '));
        await Question.create(normalizeQuestionInput(q, chapter._id));
        imported += 1;
      } catch (err) {
        errors.push({ line, error: err.message });
      }
    }
    res.status(201).json({ imported, failed: errors.length, errors: errors.slice(0, 50), columns: CSV_COLUMNS });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  updateUserRole,
  deleteUser,
  overview,
  chapterStats,
  createExam,
  deleteExam,
  createSubject,
  deleteSubject,
  createChapter,
  updateChapter,
  deleteChapter,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listQuestions,
  bulkQuestions,
  importCsv,
  CSV_COLUMNS,
};
