const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String },
    examFocus: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Add method to check if user has password (local auth)
userSchema.methods.hasPassword = function() {
  return !!this.passwordHash;
};

// Add method to check if user has Google auth
userSchema.methods.hasGoogle = function() {
  return !!this.googleId;
};

module.exports = mongoose.model('User', userSchema);