const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index({ subject: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model('Chapter', chapterSchema);