require('dotenv').config();
const mongoose = require('mongoose');
const { Exam, Subject, Chapter, Question } = require('../models');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  // wipe existing sample data first (safe for dev, never run this against real user data)
  await Promise.all([
    Exam.deleteMany({}),
    Subject.deleteMany({}),
    Chapter.deleteMany({}),
    Question.deleteMany({}),
  ]);

  const exam = await Exam.create({ name: 'Class 12', slug: 'class-12' });

  const physics = await Subject.create({
    exam: exam._id,
    name: 'Physics',
    slug: 'physics',
  });

  const motion = await Chapter.create({
    subject: physics._id,
    name: 'Laws of Motion',
    slug: 'laws-of-motion',
    orderIndex: 1,
  });

  const electrostatics = await Chapter.create({
    subject: physics._id,
    name: 'Electrostatics',
    slug: 'electrostatics',
    orderIndex: 2,
  });

  await Question.insertMany([
    // Laws of Motion
    {
      chapter: motion._id,
      questionText: 'What is the SI unit of force?',
      options: [
        { id: 'A', text: 'Joule' },
        { id: 'B', text: 'Newton' },
        { id: 'C', text: 'Watt' },
        { id: 'D', text: 'Pascal' },
      ],
      correctOption: 'B',
      explanation: 'Force = mass × acceleration, measured in Newtons (N).',
      difficulty: 'easy',
      tags: ['newtons-laws'],
    },
    {
      chapter: motion._id,
      questionText: "Newton's third law states that for every action there is:",
      options: [
        { id: 'A', text: 'An equal and opposite reaction' },
        { id: 'B', text: 'A proportional acceleration' },
        { id: 'C', text: 'A change in momentum' },
        { id: 'D', text: 'No reaction' },
      ],
      correctOption: 'A',
      explanation: 'Every action has an equal and opposite reaction — this is the core statement of the third law.',
      difficulty: 'easy',
      tags: ['newtons-laws'],
    },
    {
      chapter: motion._id,
      questionText: 'A body of mass 2 kg experiences a net force of 10 N. What is its acceleration?',
      options: [
        { id: 'A', text: '2 m/s²' },
        { id: 'B', text: '5 m/s²' },
        { id: 'C', text: '10 m/s²' },
        { id: 'D', text: '20 m/s²' },
      ],
      correctOption: 'B',
      explanation: 'a = F/m = 10/2 = 5 m/s².',
      difficulty: 'medium',
      tags: ['newtons-laws', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'Which of the following is a conservative force?',
      options: [
        { id: 'A', text: 'Friction' },
        { id: 'B', text: 'Air resistance' },
        { id: 'C', text: 'Gravity' },
        { id: 'D', text: 'Normal force' },
      ],
      correctOption: 'C',
      explanation: 'Gravity is conservative because the work done depends only on initial and final position, not the path taken.',
      difficulty: 'medium',
      tags: ['forces'],
    },
    {
      chapter: motion._id,
      questionText: 'Momentum is conserved in a system when:',
      options: [
        { id: 'A', text: 'No external force acts on it' },
        { id: 'B', text: 'The system is accelerating' },
        { id: 'C', text: 'Friction is present' },
        { id: 'D', text: 'The mass changes' },
      ],
      correctOption: 'A',
      explanation: 'Conservation of momentum holds when the net external force on a system is zero.',
      difficulty: 'medium',
      tags: ['momentum'],
    },

    // Electrostatics
    {
      chapter: electrostatics._id,
      questionText: 'What is the SI unit of electric charge?',
      options: [
        { id: 'A', text: 'Volt' },
        { id: 'B', text: 'Ohm' },
        { id: 'C', text: 'Coulomb' },
        { id: 'D', text: 'Ampere' },
      ],
      correctOption: 'C',
      explanation: 'Electric charge is measured in Coulombs (C).',
      difficulty: 'easy',
      tags: ['basics'],
    },
    {
      chapter: electrostatics._id,
      questionText: "Coulomb's law describes the force between:",
      options: [
        { id: 'A', text: 'Two magnets' },
        { id: 'B', text: 'Two point charges' },
        { id: 'C', text: 'A charge and a magnet' },
        { id: 'D', text: 'Two currents' },
      ],
      correctOption: 'B',
      explanation: "Coulomb's law gives the electrostatic force between two point charges.",
      difficulty: 'easy',
      tags: ['coulombs-law'],
    },
    {
      chapter: electrostatics._id,
      questionText: 'Electric field lines around a positive point charge point:',
      options: [
        { id: 'A', text: 'Toward the charge' },
        { id: 'B', text: 'Away from the charge' },
        { id: 'C', text: 'Parallel to the charge' },
        { id: 'D', text: 'In a circle around the charge' },
      ],
      correctOption: 'B',
      explanation: 'Field lines always point away from positive charges and toward negative charges.',
      difficulty: 'easy',
      tags: ['electric-field'],
    },
    {
      chapter: electrostatics._id,
      questionText: 'Two charges of +2 C and -2 C are placed 1 m apart. Which statement is true?',
      options: [
        { id: 'A', text: 'They repel each other' },
        { id: 'B', text: 'They attract each other' },
        { id: 'C', text: 'No force acts between them' },
        { id: 'D', text: 'The force is zero at 1 m' },
      ],
      correctOption: 'B',
      explanation: 'Opposite charges attract; like charges repel.',
      difficulty: 'medium',
      tags: ['coulombs-law'],
    },
    {
      chapter: electrostatics._id,
      questionText: 'The electric potential due to a point charge at infinite distance is:',
      options: [
        { id: 'A', text: 'Infinite' },
        { id: 'B', text: 'Zero' },
        { id: 'C', text: 'Equal to the charge' },
        { id: 'D', text: 'Negative' },
      ],
      correctOption: 'B',
      explanation: 'Electric potential decreases with distance and approaches zero as distance approaches infinity.',
      difficulty: 'medium',
      tags: ['electric-potential'],
    },
  ]);

  console.log('Seeding complete! 1 exam, 1 subject, 2 chapters, 10 questions created.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});