import mongoose from 'mongoose';

const ROLES = ['super_admin', 'admin', 'manager', 'devops', 'developer', 'viewer'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'developer', index: true },
    title: String,
    team: String,
    status: { type: String, enum: ['online', 'away', 'offline'], default: 'offline' },
    avatarColor: String,
    initials: String,
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

userSchema.methods.toSafeJSON = function () {
  const { passwordHash, ...rest } = this.toObject();
  return rest;
};

export const User = mongoose.model('User', userSchema);
export const USER_ROLES = ROLES;
