const { Question, Chapter, Attempt, Bookmark, MistakeNotebookEntry } = require('../models');

// GET /api/chapters/:chapterId/questions
async function getQuestionsByChapter(req, res) {
  try {
    const { chapterId } = req.params;
    const { difficulty, solved } = req.query;
    const userId = req.user.id;

    const filter = { chapter: chapterId };
    if (difficulty) filter.difficulty = difficulty;

    let questions = await Question.find(filter).lean();

    // apply solved/unsolved/wrong/bookmarked filters (done in JS since they depend on other collections)
    if (solved) {
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
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
}

// GET /api/questions/:id
async function getQuestionById(req, res) {
  try {
    const question = await Question.findById(req.params.id).lean();
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const { correctOption, explanation, ...safeQuestion } = question;
    res.json({ question: safeQuestion });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch question', error: err.message });
  }
}

// POST /api/questions/:id/attempt
async function submitAttempt(req, res) {
  try {
    const { id: questionId } = req.params;
    const { selectedOption, timeTakenSec } = req.body;
    const userId = req.user.id;

    if (!selectedOption) {
      return res.status(400).json({ message: 'selectedOption is required' });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const isCorrect = selectedOption === question.correctOption;

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
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit attempt', error: err.message });
  }
}

// POST /api/questions/:id/bookmark
async function bookmarkQuestion(req, res) {
  try {
    const { id: questionId } = req.params;
    const userId = req.user.id;

    await Bookmark.findOneAndUpdate(
      { user: userId, question: questionId },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Bookmarked' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to bookmark', error: err.message });
  }
}

// DELETE /api/questions/:id/bookmark
async function removeBookmark(req, res) {
  try {
    const { id: questionId } = req.params;
    const userId = req.user.id;

    await Bookmark.findOneAndDelete({ user: userId, question: questionId });

    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove bookmark', error: err.message });
  }
}

module.exports = {
  getQuestionsByChapter,
  getQuestionById,
  submitAttempt,
  bookmarkQuestion,
  removeBookmark,
};