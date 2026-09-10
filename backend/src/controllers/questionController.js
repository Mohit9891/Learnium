const { Question, Attempt, Bookmark, MistakeNotebookEntry } = require('../models');

// GET /api/chapters/:chapterId/questions
// Public with optionalAuth: logged-out users get the full list; user-scoped
// filters (solved/wrong/bookmarked) require a token.
async function getQuestionsByChapter(req, res, next) {
  try {
    const { chapterId } = req.params;
    const { difficulty, solved } = req.query;
    const userId = req.user && req.user.id;

    const filter = { chapter: chapterId };
    if (difficulty) filter.difficulty = difficulty;

    let questions = await Question.find(filter).lean();

    if (solved) {
      if (!userId) {
        return res.status(401).json({ message: 'Sign in to use solved/bookmarked filters' });
      }
      const attempts = await Attempt.find({ user: userId }).select('question isCorrect').lean();
      const attemptedIds = new Set(attempts.map((a) => a.question.toString()));
      const correctIds = new Set(attempts.filter((a) => a.isCorrect).map((a) => a.question.toString()));
      const wrongIds = new Set(attempts.filter((a) => !a.isCorrect).map((a) => a.question.toString()));

      if (solved === 'solved') {
        questions = questions.filter((q) => correctIds.has(q._id.toString()));
      } else if (solved === 'unsolved') {
        questions = questions.filter((q) => !attemptedIds.has(q._id.toString()));
      } else if (solved === 'wrong') {
        questions = questions.filter((q) => wrongIds.has(q._id.toString()));
      } else if (solved === 'bookmarked') {
        const bookmarks = await Bookmark.find({ user: userId }).select('question').lean();
        const bookmarkedIds = new Set(bookmarks.map((b) => b.question.toString()));
        questions = questions.filter((q) => bookmarkedIds.has(q._id.toString()));
      }
    }

    // never send correctOption/explanation until they submit an answer
    const safeQuestions = questions.map(({ correctOption, explanation, ...rest }) => rest);

    res.json({ questions: safeQuestions });
  } catch (err) {
    next(err);
  }
}

// GET /api/questions/:id (public — still strips answers)
async function getQuestionById(req, res, next) {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const { correctOption, explanation, ...safeQuestion } = question;
    res.json({ question: safeQuestion });
  } catch (err) {
    next(err);
  }
}

// POST /api/questions/:id/attempt
// Public with optionalAuth: anonymous attempts are graded but not stored
// (returns tracked:false so the UI can upsell sign-in).
async function submitAttempt(req, res, next) {
  try {
    const { id: questionId } = req.params;
    const { selectedOption, timeTakenSec } = req.body;
    const userId = req.user && req.user.id;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const isCorrect = selectedOption === question.correctOption;

    if (!userId) {
      return res.json({
        isCorrect,
        correctOption: question.correctOption,
        explanation: question.explanation,
        tracked: false,
      });
    }

    await Attempt.create({
      user: userId,
      question: questionId,
      selectedOption,
      isCorrect,
      timeTakenSec,
    });

    if (!isCorrect) {
      await MistakeNotebookEntry.findOneAndUpdate(
        { user: userId, question: questionId },
        { reviewStatus: 'unreviewed', lastWrongAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json({
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
      tracked: true,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/questions/:id/bookmark (auth required)
async function bookmarkQuestion(req, res, next) {
  try {
    const { id: questionId } = req.params;
    const userId = req.user.id;

    const question = await Question.findById(questionId).select('_id');
    if (!question) return res.status(404).json({ message: 'Question not found' });

    await Bookmark.findOneAndUpdate(
      { user: userId, question: questionId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Bookmarked' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/questions/:id/bookmark (auth required)
async function removeBookmark(req, res, next) {
  try {
    const { id: questionId } = req.params;
    const userId = req.user.id;

    await Bookmark.findOneAndDelete({ user: userId, question: questionId });

    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuestionsByChapter,
  getQuestionById,
  submitAttempt,
  bookmarkQuestion,
  removeBookmark,
};
