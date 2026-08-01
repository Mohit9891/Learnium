const { Attempt } = require('../models');

function toDateString(date) {
  return new Date(date).toISOString().slice(0, 10);
}

// GET /api/dashboard/summary
async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;

    const attempts = await Attempt.find({ user: userId })
      .select('question isCorrect attemptedAt')
      .lean();

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : 0;

    // "Questions Solved" = distinct questions the user has gotten right at least once
    const solvedQuestionIds = new Set(
      attempts.filter((a) => a.isCorrect).map((a) => a.question.toString())
    );
    const questionsSolved = solvedQuestionIds.size;

    // Streak: consecutive days (ending today or yesterday) with at least one attempt
    const activeDates = new Set(attempts.map((a) => toDateString(a.attemptedAt)));

    let streak = 0;
    const cursor = new Date();
    const todayStr = toDateString(cursor);

    // grace period: if no activity today yet, don't reset the streak to 0 —
    // check if yesterday was active before giving up
    if (!activeDates.has(todayStr)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (activeDates.has(toDateString(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    res.json({
      streak,
      questionsSolved,
      accuracy,
      totalAttempts,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: err.message });
  }
}

module.exports = { getDashboardSummary };