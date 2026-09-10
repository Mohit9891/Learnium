require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');

async function run() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run make-admin -- you@example.com');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  if (!user) {
    console.error(`No user found with email ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`Promoted ${user.email} to admin.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
