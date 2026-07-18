const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

subjectSchema.index({ exam: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);