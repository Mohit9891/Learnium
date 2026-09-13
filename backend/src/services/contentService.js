const { Exam, Subject, Chapter, Question } = require('../models');

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function upsertExam(name, slug) {
  const finalSlug = slug || slugify(name);
  return Exam.findOneAndUpdate(
    { slug: finalSlug },
    { name, slug: finalSlug },
    { upsert: true, returnDocument: 'after' }
  );
}

async function upsertSubject(examId, name, slug) {
  const finalSlug = slug || slugify(name);
  return Subject.findOneAndUpdate(
    { exam: examId, slug: finalSlug },
    { exam: examId, name, slug: finalSlug },
    { upsert: true, returnDocument: 'after' }
  );
}

async function upsertChapter(subjectId, name, slug, orderIndex = 0) {
  const finalSlug = slug || slugify(name);
  return Chapter.findOneAndUpdate(
    { subject: subjectId, slug: finalSlug },
    { subject: subjectId, name, slug: finalSlug, orderIndex: orderIndex ?? 0 },
    { upsert: true, returnDocument: 'after' }
  );
}

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function validateQuestionInput(q) {
  const errors = [];
  if (!q || typeof q !== 'object') return ['Question must be an object'];
  if (!q.questionText || typeof q.questionText !== 'string' || !q.questionText.trim()) {
    errors.push('questionText is required');
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    errors.push('options must be an array with at least 2 items');
  } else {
    const ids = new Set();
    for (const opt of q.options) {
      if (!opt || typeof opt.id !== 'string' || typeof opt.text !== 'string' || !opt.id.trim() || !opt.text.trim()) {
        errors.push('each option needs {id, text}');
        break;
      }
      ids.add(opt.id.trim());
    }
    if (q.correctOption && !ids.has(String(q.correctOption).trim())) {
      errors.push('correctOption must match one of the option ids');
    }
  }
  if (!q.correctOption || typeof q.correctOption !== 'string') {
    errors.push('correctOption is required');
  }
  if (q.difficulty !== undefined && !DIFFICULTIES.includes(q.difficulty)) {
    errors.push('difficulty must be easy|medium|hard');
  }
  if (q.year !== undefined && q.year !== null && (typeof q.year !== 'number' || q.year < 1900 || q.year > 2100)) {
    errors.push('year must be a valid year');
  }
  if (q.tags !== undefined && !Array.isArray(q.tags)) {
    errors.push('tags must be an array of strings');
  }
  return errors;
}

function normalizeQuestionInput(q, chapterId) {
  return {
    chapter: chapterId,
    questionText: String(q.questionText).trim(),
    questionType: 'mcq',
    options: q.options.map((o) => ({ id: String(o.id).trim(), text: String(o.text).trim() })),
    correctOption: String(q.correctOption).trim(),
    explanation: q.explanation ? String(q.explanation) : '',
    difficulty: q.difficulty || 'medium',
    year: q.year ?? undefined,
    tags: Array.isArray(q.tags) ? q.tags.map((t) => String(t).trim()).filter(Boolean) : [],
  };
}

module.exports = {
  slugify,
  upsertExam,
  upsertSubject,
  upsertChapter,
  validateQuestionInput,
  normalizeQuestionInput,
  DIFFICULTIES,
};
