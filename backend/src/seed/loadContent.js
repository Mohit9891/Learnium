/**
 * Content loader for Learnium.
 *
 * Recursively reads every *.json file under src/seed/data/ (organize
 * however you like — e.g. data/class-11/physics-laws-of-motion.json,
 * data/class-12/chemistry-solutions.json). For each file, upserts the
 * Exam/Subject/Chapter it belongs to, then replaces that chapter's question
 * bank with the file's questions. Safe to re-run — only chapters present in
 * the data files get touched; everything else in the database is untouched.
 *
 * Usage: npm run seed:content
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Exam, Subject, Chapter, Question } = require('../models');

const DATA_DIR = path.join(__dirname, 'data');

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// walks any depth of subfolders and returns full paths of every .json file found
function findJsonFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }

  return results;
}

async function loadFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  const { exam, subject, chapter, questions } = data;

  if (!exam?.name || !subject?.name || !chapter?.name || !Array.isArray(questions)) {
    throw new Error(`Malformed content file: ${path.relative(DATA_DIR, filePath)}`);
  }

  const examSlug = exam.slug || slugify(exam.name);
  const subjectSlug = subject.slug || slugify(subject.name);
  const chapterSlug = chapter.slug || slugify(chapter.name);

  const examDoc = await Exam.findOneAndUpdate(
    { slug: examSlug },
    { name: exam.name, slug: examSlug },
    { upsert: true, new: true }
  );

  const subjectDoc = await Subject.findOneAndUpdate(
    { exam: examDoc._id, slug: subjectSlug },
    { exam: examDoc._id, name: subject.name, slug: subjectSlug },
    { upsert: true, new: true }
  );

  const chapterDoc = await Chapter.findOneAndUpdate(
    { subject: subjectDoc._id, slug: chapterSlug },
    {
      subject: subjectDoc._id,
      name: chapter.name,
      slug: chapterSlug,
      orderIndex: chapter.orderIndex ?? 0,
    },
    { upsert: true, new: true }
  );

  // replace this chapter's questions only — doesn't touch other chapters
  await Question.deleteMany({ chapter: chapterDoc._id });

  const docs = questions.map((q) => ({ ...q, chapter: chapterDoc._id }));
  await Question.insertMany(docs);

  console.log(
    `✓ ${exam.name} > ${subject.name} > ${chapter.name}: ${docs.length} questions loaded  (${path.relative(DATA_DIR, filePath)})`
  );
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Loading content files...\n');

  if (!fs.existsSync(DATA_DIR)) {
    console.log('No data directory found at src/seed/data — nothing to load.');
    await mongoose.disconnect();
    return;
  }

  const files = findJsonFiles(DATA_DIR);

  if (files.length === 0) {
    console.log('No .json files found under src/seed/data (including subfolders).');
    await mongoose.disconnect();
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    try {
      await loadFile(file);
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`✗ ${path.relative(DATA_DIR, file)} failed:`, err.message);
    }
  }

  console.log(`\nDone. ${successCount} chapter(s) loaded, ${failCount} failed.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Content loading failed:', err);
  process.exit(1);
});