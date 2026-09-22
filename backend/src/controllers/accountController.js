const bcrypt = require('bcryptjs');
const { User, Attempt, Bookmark, MistakeNotebookEntry } = require('../models');

// POST /api/account/change-password { currentPassword, newPassword }
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'Current password and a new password (8+ chars) are required' });
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'Password sign-in is not set up for this account' });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/account/progress — wipe attempts, bookmarks, mistakes (keep account)
async function resetProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const [attempts, bookmarks, mistakes] = await Promise.all([
      Attempt.deleteMany({ user: userId }),
      Bookmark.deleteMany({ user: userId }),
      MistakeNotebookEntry.deleteMany({ user: userId }),
    ]);
    res.json({
      message: 'Progress reset.',
      deleted: {
        attempts: attempts.deletedCount,
        bookmarks: bookmarks.deletedCount,
        mistakes: mistakes.deletedCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/account — delete account + all its data
async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;
    await Promise.all([
      Attempt.deleteMany({ user: userId }),
      Bookmark.deleteMany({ user: userId }),
      MistakeNotebookEntry.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);
    res.json({ message: 'Account deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { changePassword, resetProgress, deleteAccount };
