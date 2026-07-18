const mongoose = require('mongoose');

const mistakeNotebookEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    reviewStatus: { type: String, enum: ['unreviewed', 'reviewing', 'learned'], default: 'unreviewed' },
    notes: { type: String },
    lastWrongAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mistakeNotebookEntrySchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('MistakeNotebookEntry', mistakeNotebookEntrySchema);