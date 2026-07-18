const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  { id: { type: String, required: true }, text: { type: String, required: true } },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ['mcq'], default: 'mcq' },
    options: {
      type: [optionSchema],
      validate: { validator: (arr) => arr.length >= 2, message: 'A question needs at least 2 options' },
    },
    correctOption: { type: String, required: true },
    explanation: { type: String },
    year: { type: Number },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

questionSchema.index({ chapter: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);