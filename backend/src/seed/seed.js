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
      questionText: "Which of the following best states Newton's First Law of Motion?",
      options: [
        { id: 'A', text: 'Force is equal to mass multiplied by acceleration.' },
        { id: 'B', text: 'Every action has an equal and opposite reaction.' },
        { id: 'C', text: 'A body remains at rest or in uniform motion unless acted upon by a net external force.' },
        { id: 'D', text: 'Momentum is always conserved.' },
      ],
      correctOption: 'C',
      explanation: "Newton's First Law describes inertia, stating that a body's state of motion changes only when acted upon by an unbalanced external force.",
      difficulty: 'easy',
      tags: ['newtons-first-law', 'inertia'],
    },
    {
      chapter: motion._id,
      questionText: 'The SI unit of force is:',
      options: [
        { id: 'A', text: 'Joule' },
        { id: 'B', text: 'Pascal' },
        { id: 'C', text: 'Newton' },
        { id: 'D', text: 'Watt' },
      ],
      correctOption: 'C',
      explanation: 'Force is measured in newtons (N), where 1 N = 1 kg·m/s².',
      difficulty: 'easy',
      tags: ['force', 'si-unit'],
    },
    {
      chapter: motion._id,
      questionText: 'The property of a body that resists any change in its state of motion is called:',
      options: [
        { id: 'A', text: 'Momentum' },
        { id: 'B', text: 'Impulse' },
        { id: 'C', text: 'Inertia' },
        { id: 'D', text: 'Acceleration' },
      ],
      correctOption: 'C',
      explanation: 'Inertia is the tendency of an object to resist changes in its state of rest or motion.',
      difficulty: 'easy',
      tags: ['inertia'],
    },
    {
      chapter: motion._id,
      questionText: 'Which quantity is equal to the rate of change of momentum?',
      options: [
        { id: 'A', text: 'Power' },
        { id: 'B', text: 'Force' },
        { id: 'C', text: 'Energy' },
        { id: 'D', text: 'Velocity' },
      ],
      correctOption: 'B',
      explanation: "According to Newton's Second Law, force equals the rate of change of momentum.",
      difficulty: 'easy',
      tags: ['newtons-second-law', 'momentum'],
    },
    {
      chapter: motion._id,
      questionText: 'When a person jumps from a boat onto the shore, the boat moves backward due to:',
      options: [
        { id: 'A', text: "Newton's First Law" },
        { id: 'B', text: "Newton's Second Law" },
        { id: 'C', text: "Newton's Third Law" },
        { id: 'D', text: 'Law of Gravitation' },
      ],
      correctOption: 'C',
      explanation: 'The person pushes the boat backward while the boat pushes the person forward with an equal and opposite force.',
      difficulty: 'easy',
      tags: ['newtons-third-law'],
    },
    {
      chapter: motion._id,
      questionText: 'The tendency of dust particles to separate from a carpet when it is beaten is due to:',
      options: [
        { id: 'A', text: 'Inertia of rest' },
        { id: 'B', text: 'Inertia of motion' },
        { id: 'C', text: 'Gravitational force' },
        { id: 'D', text: 'Friction' },
      ],
      correctOption: 'A',
      explanation: 'The carpet moves suddenly while the dust tends to remain at rest due to inertia of rest.',
      difficulty: 'easy',
      tags: ['inertia', 'applications'],
    },
    {
      chapter: motion._id,
      questionText: 'Which pair of forces is an action-reaction pair?',
      options: [
        { id: 'A', text: 'Weight of a book and normal reaction on the book' },
        { id: 'B', text: 'Force by Earth on a stone and force by the stone on Earth' },
        { id: 'C', text: 'Friction and normal reaction on a block' },
        { id: 'D', text: 'Weight and tension on a hanging object' },
      ],
      correctOption: 'B',
      explanation: 'Action-reaction forces act on different bodies and are equal in magnitude and opposite in direction.',
      difficulty: 'easy',
      tags: ['newtons-third-law'],
    },
    {
      chapter: motion._id,
      questionText: 'The dimensional formula of force is:',
      options: [
        { id: 'A', text: '[MLT⁻²]' },
        { id: 'B', text: '[ML²T⁻²]' },
        { id: 'C', text: '[MLT⁻¹]' },
        { id: 'D', text: '[MT⁻²]' },
      ],
      correctOption: 'A',
      explanation: 'Force = mass × acceleration = M × LT⁻² = MLT⁻².',
      difficulty: 'easy',
      tags: ['dimensions', 'force'],
    },
    {
      chapter: motion._id,
      questionText: 'A force of 20 N acts on a body of mass 5 kg. The acceleration produced is:',
      options: [
        { id: 'A', text: '2 m/s²' },
        { id: 'B', text: '4 m/s²' },
        { id: 'C', text: '5 m/s²' },
        { id: 'D', text: '10 m/s²' },
      ],
      correctOption: 'B',
      explanation: 'Using F = ma, acceleration = 20/5 = 4 m/s².',
      difficulty: 'medium',
      tags: ['newtons-second-law', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'A body of mass 2 kg moving at 6 m/s is brought to rest in 3 s. The average retarding force is:',
      options: [
        { id: 'A', text: '2 N' },
        { id: 'B', text: '4 N' },
        { id: 'C', text: '6 N' },
        { id: 'D', text: '8 N' },
      ],
      correctOption: 'B',
      explanation: 'Acceleration = (0−6)/3 = −2 m/s². Force = 2 × (−2) = −4 N, so the retarding force has magnitude 4 N.',
      difficulty: 'medium',
      tags: ['force', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'A 4 kg block is pulled horizontally by a force of 16 N on a frictionless surface. Its momentum after 5 s is:',
      options: [
        { id: 'A', text: '20 kg·m/s' },
        { id: 'B', text: '40 kg·m/s' },
        { id: 'C', text: '60 kg·m/s' },
        { id: 'D', text: '80 kg·m/s' },
      ],
      correctOption: 'D',
      explanation: 'Acceleration = 16/4 = 4 m/s². Velocity after 5 s = 20 m/s. Momentum = 4 × 20 = 80 kg·m/s.',
      difficulty: 'medium',
      tags: ['momentum', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'A person standing in a bus falls backward when the bus starts suddenly because of:',
      options: [
        { id: 'A', text: 'Inertia of rest' },
        { id: 'B', text: 'Inertia of motion' },
        { id: 'C', text: 'Momentum conservation' },
        { id: 'D', text: 'Centripetal force' },
      ],
      correctOption: 'A',
      explanation: 'The feet move with the bus, but the upper body tends to remain at rest due to inertia of rest.',
      difficulty: 'medium',
      tags: ['inertia', 'applications'],
    },
    {
      chapter: motion._id,
      questionText: 'A force acts on a body for a fixed time. If the force is doubled, the impulse becomes:',
      options: [
        { id: 'A', text: 'Half' },
        { id: 'B', text: 'Double' },
        { id: 'C', text: 'Four times' },
        { id: 'D', text: 'Unchanged' },
      ],
      correctOption: 'B',
      explanation: 'Impulse = Force × Time. For constant time, doubling the force doubles the impulse.',
      difficulty: 'medium',
      tags: ['impulse', 'momentum'],
    },
    {
      chapter: motion._id,
      questionText: 'Two forces of 8 N and 6 N act on a body in opposite directions. The net force is:',
      options: [
        { id: 'A', text: '14 N' },
        { id: 'B', text: '2 N toward the 8 N force' },
        { id: 'C', text: '2 N toward the 6 N force' },
        { id: 'D', text: '0 N' },
      ],
      correctOption: 'B',
      explanation: 'Opposite forces subtract. The resultant is 8 − 6 = 2 N in the direction of the larger force.',
      difficulty: 'medium',
      tags: ['net-force', 'vectors'],
    },
    {
      chapter: motion._id,
      questionText: 'A force of 15 N changes the velocity of a 3 kg object from 2 m/s to 12 m/s. The time taken is:',
      options: [
        { id: 'A', text: '1 s' },
        { id: 'B', text: '2 s' },
        { id: 'C', text: '3 s' },
        { id: 'D', text: '4 s' },
      ],
      correctOption: 'B',
      explanation: 'Acceleration = 15/3 = 5 m/s². Time = (12−2)/5 = 2 s.',
      difficulty: 'medium',
      tags: ['newtons-second-law', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'Which statement about action and reaction forces is correct?',
      options: [
        { id: 'A', text: 'They act on the same body.' },
        { id: 'B', text: 'They cancel each other.' },
        { id: 'C', text: 'They act on different bodies.' },
        { id: 'D', text: 'They always produce zero acceleration.' },
      ],
      correctOption: 'C',
      explanation: 'Action and reaction forces act on different bodies, so they do not cancel each other.',
      difficulty: 'medium',
      tags: ['newtons-third-law'],
    },
    {
      chapter: motion._id,
      questionText: 'A 10 kg block rests on a rough horizontal surface. A horizontal force of 20 N is applied, but the block does not move. The static friction acting on the block is:',
      options: [
        { id: 'A', text: '0 N' },
        { id: 'B', text: '10 N' },
        { id: 'C', text: '20 N' },
        { id: 'D', text: '98 N' },
      ],
      correctOption: 'C',
      explanation: 'Static friction adjusts to balance the applied force until its limiting value. Since the block remains at rest, friction equals 20 N.',
      difficulty: 'hard',
      tags: ['friction', 'equilibrium'],
    },
    {
      chapter: motion._id,
      questionText: 'A lift accelerates upward with an acceleration of 2 m/s². The apparent weight of a 60 kg person is closest to:',
      options: [
        { id: 'A', text: '468 N' },
        { id: 'B', text: '588 N' },
        { id: 'C', text: '708 N' },
        { id: 'D', text: '720 N' },
      ],
      correctOption: 'C',
      explanation: 'Apparent weight = m(g+a) = 60 × (9.8 + 2) = 708 N.',
      difficulty: 'hard',
      tags: ['apparent-weight', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'A 2 kg block and a 3 kg block are connected by a light string on a frictionless surface. A horizontal force of 20 N is applied to the 3 kg block. The tension in the string is:',
      options: [
        { id: 'A', text: '4 N' },
        { id: 'B', text: '8 N' },
        { id: 'C', text: '12 N' },
        { id: 'D', text: '20 N' },
      ],
      correctOption: 'B',
      explanation: 'Acceleration of the system = 20/(2+3) = 4 m/s². Tension accelerates the 2 kg block, so T = 2 × 4 = 8 N.',
      difficulty: 'hard',
      tags: ['connected-blocks', 'tension', 'numerical'],
    },
    {
      chapter: motion._id,
      questionText: 'A 5 kg object moving at 8 m/s collides head-on with a wall and rebounds with a speed of 2 m/s. If the contact time is 0.05 s, the average force exerted by the wall is:',
      options: [
        { id: 'A', text: '600 N' },
        { id: 'B', text: '800 N' },
        { id: 'C', text: '1000 N' },
        { id: 'D', text: '1200 N' },
      ],
      correctOption: 'C',
      explanation: 'Change in momentum = 5 × (−2 − 8) = −50 kg·m/s. Average force = 50/0.05 = 1000 N.',
      difficulty: 'hard',
      tags: ['impulse', 'momentum', 'numerical'],
    },
  ]);

  console.log('Seeding complete! 1 exam, 1 subject, 2 chapters, 10 questions created.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});