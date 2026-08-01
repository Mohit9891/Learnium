const { MistakeNotebookEntry } = require('../models');

// GET /api/mistakes?status=unreviewed|reviewing|learned
async function getMistakes(req, res) {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = { user: userId };
    if (status) filter.reviewStatus = status;

    const entries = await MistakeNotebookEntry.find(filter)
      .sort({ lastWrongAt: -1 })
      .populate({
        path: 'question',
        select: 'questionText options correctOption explanation difficulty chapter',
        populate: { path: 'chapter', select: 'name' },
      })
      .lean();

    // skip any entries whose question was deleted (defensive — shouldn't normally happen)
    const validEntries = entries.filter((e) => e.question);

    res.json({ mistakes: validEntries });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch mistakes', error: err.message });
  }
}

// PATCH /api/mistakes/:id   body: { reviewStatus?, notes? }
async function updateMistake(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reviewStatus, notes } = req.body;

    const validStatuses = ['unreviewed', 'reviewing', 'learned'];
    if (reviewStatus && !validStatuses.includes(reviewStatus)) {
      return res.status(400).json({ message: 'Invalid reviewStatus' });
    }

    const update = {};
    if (reviewStatus) update.reviewStatus = reviewStatus;
    if (notes !== undefined) update.notes = notes;

    const entry = await MistakeNotebookEntry.findOneAndUpdate(
      { _id: id, user: userId }, // scope to the owning user — prevents editing others' entries
      update,
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Mistake entry not found' });
    }

    res.json({ mistake: entry });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update mistake', error: err.message });
  }
}

module.exports = { getMistakes, updateMistake };