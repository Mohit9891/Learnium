const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    timeTakenSec: { type: Number },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, question: 1 });
attemptSchema.index({ user: 1, attemptedAt: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);